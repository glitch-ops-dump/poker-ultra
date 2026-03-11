import { TexasHoldemEngine } from './engine';

export interface RoomInfo {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  state: string;
  blinds: string;
}

class RoomManager {
  private rooms: Map<string, TexasHoldemEngine> = new Map();
  private roomNames: Map<string, string> = new Map();

  private TABLE_NAMES = [
    'NEON NIGHTS', 'ROYAL RUSH', 'ACES HIGH', 'DARK HORSE',
    'VELVET CARD', 'GHOST BLUFF', 'HIGH ROLLER', 'MIDNIGHT RUN',
  ];

  createRoom(maxPlayers: 2 | 4 | 6 = 6): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    do {
      code = Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    } while (this.rooms.has(code));

    const engine = new TexasHoldemEngine(code, maxPlayers);
    this.rooms.set(code, engine);
    
    // Assign a fun table name
    const name = this.TABLE_NAMES[Math.floor(Math.random() * this.TABLE_NAMES.length)];
    this.roomNames.set(code, name);
    
    return code;
  }

  getRoom(roomId: string): TexasHoldemEngine | undefined {
    return this.rooms.get(roomId?.toUpperCase());
  }

  removeRoom(roomId: string) {
    this.rooms.delete(roomId?.toUpperCase());
    this.roomNames.delete(roomId?.toUpperCase());
  }

  getAvailableRooms(): RoomInfo[] {
    const list: RoomInfo[] = [];
    for (const [id, engine] of this.rooms.entries()) {
      const humanPlayers = engine.state.players.filter(p => p && !p.isBot).length;
      list.push({
        id,
        name: this.roomNames.get(id) || id,
        players: humanPlayers,
        maxPlayers: engine.state.players.length,
        state: engine.state.state,
        blinds: '₹50/₹100',
      });
    }
    return list;
  }
}

export const roomManager = new RoomManager();
