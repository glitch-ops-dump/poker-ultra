import { TexasHoldemEngine } from './engine';

class RoomManager {
  private rooms: Map<string, TexasHoldemEngine> = new Map();

  createRoom(): string {
    // Generate a 6-letter room code (e.g. "ROYALX")
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    do {
      code = Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    } while (this.rooms.has(code));

    const engine = new TexasHoldemEngine(code, 6);
    this.rooms.set(code, engine);
    return code;
  }

  getRoom(roomId: string): TexasHoldemEngine | undefined {
    return this.rooms.get(roomId?.toUpperCase());
  }

  removeRoom(roomId: string) {
    this.rooms.delete(roomId?.toUpperCase());
  }

  getAvailableRooms(): { id: string, players: number }[] {
    const list: { id: string, players: number }[] = [];
    for (const [id, engine] of this.rooms.entries()) {
      list.push({
        id,
        players: engine.state.players.filter(p => p !== null).length
      });
    }
    return list;
  }
}

export const roomManager = new RoomManager();
