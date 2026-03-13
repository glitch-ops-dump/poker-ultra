import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { roomManager } from './roomManager';
import { TexasHoldemEngine } from './engine';
import { evaluateHand } from './handEvaluator';

dotenv.config();

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3001;

// REST API for room listing (used by lobby)
app.get('/api/rooms', (_req, res) => res.json(roomManager.getAvailableRooms()));

/* ═══ Broadcast sanitized state to all sockets in a room ═══ */
function broadcastState(roomId: string) {
  const engine = roomManager.getRoom(roomId);
  if (!engine) return;

  const sockets = io.sockets.adapter.rooms.get(roomId);
  if (sockets) {
    for (const socketId of sockets) {
      io.to(socketId).emit('table_state', engine.getSanitizedState(socketId));
    }
  }
}

/* ═══ Bot AI — runs on an interval per room ═══ */
const botIntervals = new Map<string, NodeJS.Timeout>();

function startBotLoop(roomId: string) {
  if (botIntervals.has(roomId)) return;

  const interval = setInterval(() => {
    const engine = roomManager.getRoom(roomId);
    if (!engine) { clearInterval(interval); botIntervals.delete(roomId); return; }
    if (engine.state.state === 'WAITING' || engine.state.state === 'SHOWDOWN') return;

    const idx = engine.state.currentTurnIndex;
    const p = engine.state.players[idx];
    if (!p || !p.isBot || p.status !== 'active') return;

    // Prevent double-acting
    if ((p as any)._acting) return;
    (p as any)._acting = true;

    // Think for 1-2.5s then act
    const delay = 1000 + Math.random() * 1500;
    setTimeout(() => {
      // Re-check state (might have changed)
      const eng = roomManager.getRoom(roomId);
      if (!eng || eng.state.currentTurnIndex !== idx) { (p as any)._acting = false; return; }
      const bot = eng.state.players[idx];
      if (!bot || !bot.isBot || bot.status !== 'active') { (p as any)._acting = false; return; }

      makeBotDecision(eng, bot.id);
      (p as any)._acting = false;
      broadcastState(roomId);
    }, delay);
  }, 500);

  botIntervals.set(roomId, interval);
}

function makeBotDecision(engine: TexasHoldemEngine, botId: string) {
  const p = engine.state.players.find(pl => pl?.id === botId);
  if (!p || p.status !== 'active') return;

  const toCall = engine.state.currentBet - p.currentBet;

  // Evaluate hand strength if we have cards
  let strength = 0;
  if (p.cards && engine.state.communityCards.length > 0) {
    const res = evaluateHand([...p.cards, ...engine.state.communityCards]);
    strength = res.rank; // 0-9
  } else if (p.cards) {
    // Pre-flop: rough heuristic based on hole card ranks
    const r1 = p.cards[0].rank;
    const r2 = p.cards[1].rank;
    const paired = r1 === r2;
    strength = paired ? 2 : (r1 + r2 > 18 ? 1 : 0);
  }

  const rand = Math.random();

  if (toCall === 0) {
    // Can check freely
    if (strength >= 3 && rand > 0.6) {
      engine.raise(botId, engine.state.currentBet + engine.state.bigBlind * 2);
    } else if (strength >= 1 && rand > 0.8) {
      engine.raise(botId, engine.state.currentBet + engine.state.bigBlind);
    } else {
      engine.check(botId);
    }
  } else {
    // Must pay to stay
    const potOdds = toCall / (engine.state.pot + toCall);
    
    if (toCall > p.chips * 0.4 && strength < 2 && rand > 0.3) {
      engine.fold(botId);
    } else if (strength >= 4 && rand > 0.5) {
      // Strong hand — raise
      engine.raise(botId, engine.state.currentBet + engine.state.bigBlind * 3);
    } else if (strength >= 1 || potOdds < 0.3) {
      engine.call(botId);
    } else if (rand > 0.5) {
      engine.call(botId); // Bluff call sometimes
    } else {
      engine.fold(botId);
    }
  }
}

function stopBotLoop(roomId: string) {
  const interval = botIntervals.get(roomId);
  if (interval) { clearInterval(interval); botIntervals.delete(roomId); }
}

/* ═══ Bot Names ═══ */
const BOT_NAMES = ['Astro', 'BluffKing', 'ChipLord', 'DealerD', 'Eva'];

/* ═══ Socket.IO Event Handlers ═══ */
io.on('connection', (socket: Socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  socket.on('create_room', ({ maxPlayers = 6, withBots = true }: { maxPlayers?: 2 | 4 | 6, withBots?: boolean }, callback) => {
    const roomId = roomManager.createRoom(maxPlayers);
    const engine = roomManager.getRoom(roomId)!;

    // Wire state change callback for async events (showdown, next hand)
    engine.setOnStateChange(() => broadcastState(roomId));
    engine.setOnWin((winners) => {
      io.to(roomId).emit('sc_pot_win', winners);
    });

    // Fill bot seats if requested
    if (withBots) {
      const botCount = maxPlayers - 1;
      for (let i = 1; i <= botCount && i < BOT_NAMES.length + 1; i++) {
        engine.addPlayer(`bot_${roomId}_${i}`, BOT_NAMES[i - 1], 50000, i, true);
      }
      console.log(`[ROOM] Created ${roomId} (${maxPlayers}-player) with ${botCount} bots`);
    } else {
      console.log(`[ROOM] Created ${roomId} (${maxPlayers}-player) WITHOUT bots`);
    }
    
    callback({ roomId });
  });

  socket.on('join_room', ({ roomId, name, chips }: { roomId: string, name: string, chips: number }, callback) => {
    const engine = roomManager.getRoom(roomId);
    if (!engine) return callback({ error: 'Room not found' });

    // Find empty seat
    const seatIndex = engine.state.players.findIndex(p => p === null);
    if (seatIndex === -1) return callback({ error: 'Table is full' });

    const success = engine.addPlayer(socket.id, name, chips, seatIndex);
    if (!success) return callback({ error: 'Failed to sit' });

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.name = name;
    callback({ success: true, seatIndex });

    console.log(`[ROOM] ${name} joined ${roomId} at seat ${seatIndex}`);

    // Count players with chips (seated count, not active count — they're sitting-out until startHand)
    const seatedCount = engine.state.players.filter(p => p && p.chips > 0).length;

    if (engine.state.state === 'WAITING' && seatedCount >= 2) {
      // Start the hand after a brief delay
      setTimeout(() => {
        console.log(`[GAME] Starting hand in room ${roomId}`);
        engine.startHand();
        broadcastState(roomId);
        // Start bot loop
        startBotLoop(roomId);
      }, 2000);
    } else {
      broadcastState(roomId);
    }
  });

  /* ── Game Actions ── */
  socket.on('action', ({ action, amount }: { action: string, amount?: number }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const engine = roomManager.getRoom(roomId);
    if (!engine) return;

    const currentPlayer = engine.state.players[engine.state.currentTurnIndex];
    if (!currentPlayer || currentPlayer.id !== socket.id) return; // Not their turn

    console.log(`[ACTION] ${socket.data.name}: ${action} ${amount || ''}`);

    switch (action) {
      case 'fold': engine.fold(socket.id); break;
      case 'check': engine.check(socket.id); break;
      case 'call': engine.call(socket.id); break;
      case 'raise': engine.raise(socket.id, amount!); break;
      case 'allin': {
        const me = engine.state.players.find(p => p?.id === socket.id);
        if (me) engine.raise(socket.id, me.chips + me.currentBet);
        break;
      }
    }

    broadcastState(roomId);
  });

  /* ── Chat ── */
  socket.on('chat_message', (msg: string) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    io.to(roomId).emit('chat_message', {
      id: Date.now().toString(),
      sender: socket.data.name || 'Anon',
      text: msg,
      color: '#3b82f6'
    });
  });

  /* ── Throwables ── */
  socket.on('throw_item', ({ type, toSeat }: { type: string, toSeat: number }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const engine = roomManager.getRoom(roomId);
    if (!engine) return;
    const p = engine.state.players.find(pl => pl?.id === socket.id);
    if (p) {
      io.to(roomId).emit('throw_item', { type, fromSeat: p.seatIndex, toSeat });
    }
  });

  /* ── Disconnect ── */
  socket.on('disconnect', () => {
    console.log(`[-] Disconnected: ${socket.id}`);
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const engine = roomManager.getRoom(roomId);
    if (!engine) return;

    engine.removePlayer(socket.id);

    // If only bots remain, kill the room
    const humanPlayers = engine.state.players.filter(p => p && !p.isBot);
    if (humanPlayers.length === 0) {
      stopBotLoop(roomId);
      roomManager.removeRoom(roomId);
      console.log(`[ROOM] Removed empty room ${roomId}`);
    } else {
      broadcastState(roomId);
    }
  });
});

// ═══ Serve frontend static files (production) ═══
// Try Docker layout first (../client/dist), fallback to dev layout (../../client/dist)
const clientDistDocker = path.join(__dirname, '../client/dist');
const clientDistDev = path.join(__dirname, '../../client/dist');
const fs = require('fs');
const clientDist = fs.existsSync(clientDistDocker) ? clientDistDocker : clientDistDev;
app.use(express.static(clientDist));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

server.listen(Number(PORT), '0.0.0.0', () => console.log(`[🚀] Poker Ultra Server on http://0.0.0.0:${PORT}`));
