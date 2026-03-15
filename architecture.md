# Poker Ultra — Architecture

## Overview

Poker Ultra is a full-stack real-time Texas Hold'em application. The frontend is a React SPA served by the same Express server that handles game logic via Socket.IO.

```
Browser (React + Zustand)
        │  WebSocket (Socket.IO)
        │  HTTP REST /api/rooms
        ▼
Express 5 + Socket.IO Server (Node.js / TypeScript)
        │
        ├── RoomManager   — in-memory room registry
        ├── TexasHoldemEngine  — per-room game logic
        ├── HandEvaluator — 7-card best-hand algorithm
        └── Bot AI loop   — setInterval per room
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite |
| Client state | Zustand |
| Real-time transport | Socket.IO (client + server) |
| Backend framework | Express 5 |
| Runtime | Node.js 20.x |
| Styling | Inline CSS + Tailwind CSS |
| Animations | Framer Motion |
| Deployment | Docker / Render.com / Vercel |

---

## Directory Structure

```
poker-ultra/
├── client/
│   └── src/
│       ├── App.tsx                    # Root — routes between Lobby and Table
│       ├── store/
│       │   └── gameStore.ts           # Zustand store + all socket listeners
│       ├── components/
│       │   ├── Lobby/LobbyView.tsx    # Room create/join UI
│       │   ├── Table/
│       │   │   ├── TableView.tsx      # Game screen container + timer + auto-actions
│       │   │   ├── GameTable.tsx      # SVG poker table + 6 player pods
│       │   │   └── ActionControls.tsx # FOLD/CHECK/CALL/RAISE/ALL-IN panel
│       │   ├── Chat/ChatPanel.tsx     # Chat + hand history tabs
│       │   ├── Cards/
│       │   │   ├── PlayingCard.tsx    # SVG face-card renderer
│       │   │   └── AnimatedCard.tsx   # Deal/flip/chip animations
│       │   ├── Animations/Throwables.tsx  # Emoji throw animations
│       │   └── Menu/SettingsMenu.tsx  # Sound/music toggles
│       └── utils/
│           ├── handEvaluator.ts       # Client-side hand description
│           └── sounds.ts              # Web Audio API sound effects
│
└── server/
    └── src/
        ├── index.ts          # Express app, Socket.IO handlers, bot loop
        ├── engine.ts         # TexasHoldemEngine class (all game rules)
        ├── roomManager.ts    # RoomManager — Map<roomId, engine>
        ├── handEvaluator.ts  # 7-card evaluator (used by engine + bot)
        ├── deck.ts           # Card interface + shuffled deck factory
        └── botEngine.ts      # DEAD FILE — superseded by logic in index.ts
```

---

## Key Components

### TexasHoldemEngine (`server/src/engine.ts`)

Single class that owns the full hand lifecycle for one table.

- **Blind structure**: Small blind ₹50, Big blind ₹100 (hard-coded constants)
- **Hand stages**: `WAITING → PRE_FLOP → FLOP → TURN → RIVER → SHOWDOWN → WAITING`
- **Side-pot logic**: Uses `totalInvested` per player; iterates unique investment levels to split the pot correctly
- **Winner determination**: evaluates all contenders, splits equal scores, awards odd chip to first winner
- **Auto-reload**: after each hand, busted human players reload ₹10,000; bots reload ₹50,000
- **Callbacks**: `onStateChange` (triggers broadcast) and `onPotWin` (triggers `sc_pot_win` event)

### RoomManager (`server/src/roomManager.ts`)

Singleton `Map<roomId, TexasHoldemEngine>`. Generates 6-letter random room codes. Assigns a fun table name from a fixed list. Exposes `getAvailableRooms()` for the REST lobby endpoint.

### Socket.IO Server (`server/src/index.ts`)

All real-time logic runs through five socket events:

| Event (client → server) | Handler |
|---|---|
| `create_room` | Creates room, optionally fills bot seats, calls back `roomId` |
| `join_room` | Adds player to first empty seat, starts hand if ≥2 seated |
| `action` | Validates it is the sender's turn, delegates to engine |
| `chat_message` | Broadcasts raw message to room |
| `throw_item` | Broadcasts emoji throw to room |
| `disconnect` | Removes player; destroys room if no humans remain |

One event flows server → client:

| Event (server → client) | Payload |
|---|---|
| `table_state` | Per-socket sanitized `TableState` (opponent hole cards masked except at SHOWDOWN) |
| `sc_pot_win` | Array of `{ seatIndex, amount, name, hand }` for the win overlay |
| `chat_message` | `{ id, sender, text, color }` |
| `throw_item` | `{ type, fromSeat, toSeat }` |

### Bot AI Loop (`server/src/index.ts` — `startBotLoop`)

A `setInterval` at 500 ms per room. When the current-turn player is a bot and not already acting, it schedules a 1–2.5 s delay then calls `makeBotDecision`. Uses a `_acting` flag to prevent double-acting.

Decision heuristic:
- Pre-flop: paired hole cards → strength 2; high cards (sum > 18) → 1; otherwise 0
- Post-flop: `evaluateHand().rank` (0–9)
- If no bet to call: raise with good hands (rank ≥ 3 / ≥ 1), else check
- If facing a bet: fold if call > 40% of stack and rank < 2; raise if rank ≥ 4; otherwise call; random bluff-call

> **Known gap**: `botEngine.ts` contains an older, unused version of this logic (using `score` thresholds of `1e10`) and is never imported. It is dead code.

### Zustand Store (`client/src/store/gameStore.ts`)

Single Zustand store holds all client state. A single Socket.IO connection is created at module load with `autoConnect: false` and shared across the lifetime of the app. The store attaches all socket listeners at creation time.

On `table_state`, the store transforms server statuses to UI statuses:
- `active` + currentTurn → `'thinking'`
- `active` (not turn) → `null`
- `folded` → `'fold'`
- `all-in` → `'all-in'`
- `sitting-out` → `null`

It also marks `isHero` and `isDealer` on each player object.

---

## Data Flow

```
Player clicks RAISE
  → ActionControls.onRaise(amount)
    → TableView.handleRaise(amount)
      → sendAction('raise', amount)         [Zustand]
        → socket.emit('action', {action:'raise', amount})
          → server: validates turn, engine.raise(socketId, amount)
            → engine recalculates state
              → broadcastState(roomId)
                → for each socket in room:
                    socket.emit('table_state', engine.getSanitizedState(socketId))
                      → client socket.on('table_state', ...)
                        → Zustand set({ tableState: ... })
                          → React re-render
```

---

## Deployment Architecture

The server is single-process: Express serves the Vite-built `client/dist` as static files and handles all Socket.IO traffic on the same port. The client build uses `window.location.origin` as the Socket.IO endpoint in production, so no separate backend URL is needed.

```
HTTP :3001
  ├── GET /api/rooms          → JSON room list
  ├── GET /                   → client/dist/index.html
  ├── GET /assets/*           → client/dist/assets/*
  ├── GET /**                 → client/dist/index.html (SPA fallback)
  └── WS  socket.io/*         → Socket.IO upgrade
```

Deployment targets supported: Docker (3-stage build), Render.com (`render.yaml`), Vercel (`vercel.json`), Netlify, direct Nginx.

---

## Known Architectural Gaps

| Gap | Location | Impact |
|---|---|---|
| `botEngine.ts` is dead code | `server/src/botEngine.ts` | Confusion; duplicate logic |
| No reconnection support | `server/src/index.ts` | Disconnected player loses seat permanently |
| In-memory only — no persistence | `roomManager.ts` | Server restart destroys all active games |
| Client balance stored in localStorage | `gameStore.ts` | Easily manipulated by user |
| CORS wildcard `origin: '*'` | `server/src/index.ts` | No origin restriction in production |
| No input validation on raise amounts | `server/src/index.ts` | Malformed amounts could corrupt state |
| No inactive-room timeout | `roomManager.ts` | Memory leak if creator never joins |
| `alignPlayersHeroBottom` always creates 6-seat array | `TableView.tsx` | Visual layout incorrect for 4-player tables |
| Auto-check/fold UI uses `state === 'ACTIVE'` | `TableView.tsx` | Condition never true; waiting UI never renders |
| No dedicated `allin` engine method | `engine.ts` | `allin` action silently calls `raise` |
