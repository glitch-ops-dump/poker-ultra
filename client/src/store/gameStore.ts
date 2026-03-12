import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  faceDown?: boolean;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  isDealer?: boolean;
  cards: [Card, Card] | null;
  currentBet: number;
  status: 'fold' | 'check' | 'call' | 'raise' | 'all-in' | 'thinking' | null;
  seatIndex: number;
  isHero?: boolean;
}

export interface TableState {
  roomId: string;
  state: string;
  players: (Player | null)[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  dealerIndex: number;
  currentTurnIndex: number;
  minRaise: number;
  logs: string[];
}

interface AppState {
  displayName: string;
  balance: number;
  roomCode: string | null;
  seatIndex: number | null;
  tableState: TableState | null;
  isConnected: boolean;
  socket: Socket | null;
  activeRooms: { id: string; name: string; players: number; maxPlayers: number; blinds: string; state: string }[];
  isSoundEnabled: boolean;
  isMusicEnabled: boolean;
  potWinners: { seatIndex: number; amount: number }[] | null;

  setDisplayName: (name: string) => void;
  setBalance: (amt: number) => void;
  createRoom: (maxPlayers?: 2 | 4 | 6, withBots?: boolean) => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
  sendAction: (action: string, amount?: number) => void;
  sendChat: (msg: string) => void;
  sendThrow: (type: string, toSeat: number) => void;
  fetchRooms: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
}

// In production (served from Express), Socket.IO connects to same origin.
// In dev, connects to the local server on port 3001.
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

const socket = io(SERVER_URL, { autoConnect: false });

export const useAppStore = create<AppState>((set, get) => {
  
  // Attach Socket Listeners
  socket.on('connect', () => set({ isConnected: true }));
  socket.on('disconnect', () => set({ isConnected: false, tableState: null, roomCode: null }));
  
  socket.on('sc_pot_win', (winners: { seatIndex: number; amount: number }[]) => {
    set({ potWinners: winners });
    setTimeout(() => {
      // Clear after animation finishes
      if (get().potWinners === winners) set({ potWinners: null });
    }, 3000);
  });

  socket.on('table_state', (state: any) => {
    const mySeat = get().seatIndex;
    
    // Map server statuses -> UI statuses
    function mapStatus(serverStatus: string, seatIdx: number): Player['status'] {
      switch (serverStatus) {
        case 'active': return state.currentTurnIndex === seatIdx ? 'thinking' : null;
        case 'folded': return 'fold';
        case 'all-in': return 'all-in';
        case 'sitting-out': return null;
        default: return null;
      }
    }
    
    const transformedPlayers = state.players.map((p: any) => {
      if (!p) return null;
      return {
        ...p,
        isHero: p.seatIndex === mySeat,
        isDealer: state.dealerIndex === p.seatIndex,
        status: mapStatus(p.status, p.seatIndex),
      };
    });

    // Sync hero balance from server
    const heroPlayer = state.players.find((p: any) => p && p.seatIndex === mySeat);
    if (heroPlayer) {
      set({ balance: heroPlayer.chips });
    }

    set({ tableState: { ...state, players: transformedPlayers } });
  });

  return {
    displayName: localStorage.getItem('poker_name') || '',
    balance: Number(localStorage.getItem('poker_balance')) || 10000,
    roomCode: null,
    seatIndex: null,
    tableState: null,
    isConnected: false,
    socket,
    activeRooms: [],
    isSoundEnabled: localStorage.getItem('poker_sound') !== 'false',
    isMusicEnabled: localStorage.getItem('poker_music') !== 'false',
    potWinners: null,

    setDisplayName: (name) => {
      localStorage.setItem('poker_name', name);
      set({ displayName: name });
    },

    setBalance: (amt) => {
      localStorage.setItem('poker_balance', amt.toString());
      set({ balance: amt });
    },

    createRoom: (maxPlayers = 6, withBots = true) => {
      if (!socket.connected) socket.connect();
      socket.emit('create_room', { maxPlayers, withBots }, (res: { roomId: string }) => {
        if (res.roomId) {
          get().joinRoom(res.roomId);
        }
      });
    },

    joinRoom: (code) => {
      if (!socket.connected) socket.connect();
      const codeUpper = code.toUpperCase();
      const name = get().displayName || 'Player';
      let bal = get().balance;
      if (bal <= 0) bal = 10000;

      socket.emit('join_room', { roomId: codeUpper, name, chips: Math.min(bal, 50000) }, (res: any) => {
        if (res.success) {
          set({ roomCode: codeUpper, seatIndex: res.seatIndex });
        } else {
          alert(res.error || 'Failed to join room');
        }
      });
    },

    leaveRoom: () => {
      socket.disconnect();
      let bal = get().balance;
      // Persist balance out of game (simplified to reload if empty)
      if (bal <= 0) bal = 10000;
      localStorage.setItem('poker_balance', bal.toString());
      set({ roomCode: null, seatIndex: null, tableState: null, balance: bal });
    },

    sendAction: (action, amount) => {
      socket.emit('action', { action, amount });
    },

    sendChat: (msg) => {
      socket.emit('chat_message', msg);
    },

    sendThrow: (type, toSeat) => {
      socket.emit('throw_item', { type, toSeat });
    },

    fetchRooms: async () => {
      try {
        const base = import.meta.env.DEV ? 'http://localhost:3001' : '';
        const res = await fetch(`${base}/api/rooms`);
        const rooms = await res.json();
        set({ activeRooms: rooms });
      } catch {
        set({ activeRooms: [] });
      }
    },

    toggleSound: () => {
      const newVal = !get().isSoundEnabled;
      localStorage.setItem('poker_sound', newVal.toString());
      set({ isSoundEnabled: newVal });
    },

    toggleMusic: () => {
      const newVal = !get().isMusicEnabled;
      localStorage.setItem('poker_music', newVal.toString());
      set({ isMusicEnabled: newVal });
    },
  };
});
