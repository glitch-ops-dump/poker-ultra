import { Card, createShuffledDeck } from './deck';
import { evaluateHand, compareHands, HandResult } from './handEvaluator';

export type GameState = 'WAITING' | 'PRE_FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

export interface PlayerState {
  id: string;
  name: string;
  chips: number;
  cards: [Card, Card] | null;
  currentBet: number;
  totalInvested: number;
  status: 'active' | 'folded' | 'all-in' | 'sitting-out';
  seatIndex: number;
  isBot?: boolean;
  hasActedThisRound?: boolean;
}

export interface TableState {
  roomId: string;
  state: GameState;
  players: (PlayerState | null)[];
  deck: Card[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  dealerIndex: number;
  currentTurnIndex: number;
  minRaise: number;
  bigBlind: number;
  smallBlind: number;
  logs: string[];
}

export class TexasHoldemEngine {
  state: TableState;
  private onStateChange?: () => void;

  constructor(roomId: string, maxPlayers: number = 6) {
    this.state = {
      roomId,
      state: 'WAITING',
      players: new Array(maxPlayers).fill(null),
      deck: [],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      dealerIndex: -1,
      currentTurnIndex: -1,
      minRaise: 100,
      smallBlind: 50,
      bigBlind: 100,
      logs: [],
    };
  }

  setOnStateChange(cb: () => void) {
    this.onStateChange = cb;
  }

  log(msg: string) {
    this.state.logs.push(msg);
    if (this.state.logs.length > 50) this.state.logs.shift();
    console.log(`  [${this.state.roomId}] ${msg}`);
  }

  addPlayer(id: string, name: string, chips: number, seatIndex: number, isBot = false): boolean {
    if (this.state.players[seatIndex]) return false;
    this.state.players[seatIndex] = {
      id, name, chips, seatIndex, isBot,
      cards: null, currentBet: 0, totalInvested: 0, status: 'sitting-out', hasActedThisRound: false
    };
    this.log(`${name} joined seat ${seatIndex + 1}`);
    return true;
  }

  removePlayer(id: string) {
    const idx = this.state.players.findIndex(p => p?.id === id);
    if (idx === -1) return;
    const p = this.state.players[idx]!;
    if (this.state.state !== 'WAITING' && p.status === 'active') {
      p.status = 'folded';
      this.log(`${p.name} left (folded)`);
      this.checkEndHandEarly();
    } else {
      this.log(`${p.name} left`);
    }
    this.state.players[idx] = null;
  }

  getSeatedCount(): number {
    return this.state.players.filter(p => p && p.chips > 0).length;
  }

  getActiveCount(): number {
    return this.state.players.filter(p => p && (p.status === 'active' || p.status === 'all-in')).length;
  }

  getDecisionCount(): number {
    return this.state.players.filter(p => p && p.status === 'active').length;
  }

  /* ═══ Start a new hand ═══ */
  startHand() {
    const seated = this.state.players.filter(p => p && p.chips > 0);
    if (seated.length < 2) { this.log('Not enough players'); return; }

    this.state.state = 'PRE_FLOP';
    this.state.deck = createShuffledDeck();
    this.state.communityCards = [];
    this.state.pot = 0;
    this.state.currentBet = 0;

    // Activate all seated players
    this.state.players.forEach(p => {
      if (p) {
        p.cards = null;
        p.currentBet = 0;
        p.totalInvested = 0;
        p.hasActedThisRound = false;
        p.status = p.chips > 0 ? 'active' : 'sitting-out';
      }
    });

    // Advance dealer
    this.state.dealerIndex = this.findNextSeat(this.state.dealerIndex);
    const dealer = this.state.dealerIndex;

    // Deal hole cards
    this.state.players.forEach(p => {
      if (p && p.status === 'active') {
        p.cards = [this.state.deck.pop()!, this.state.deck.pop()!];
      }
    });

    this.log(`Hand started. Dealer: seat ${dealer + 1}`);

    // Post blinds
    let sbIdx = this.findNextSeat(dealer);
    let bbIdx = this.findNextSeat(sbIdx);

    // Heads-up: dealer is SB
    if (this.getActiveCount() === 2) {
      sbIdx = dealer;
      bbIdx = this.findNextSeat(dealer);
    }

    this.postBlind(sbIdx, this.state.smallBlind, 'SB');
    this.postBlind(bbIdx, this.state.bigBlind, 'BB');

    this.state.currentBet = this.state.bigBlind;
    this.state.minRaise = this.state.bigBlind;

    // First to act is seat after BB (UTG)
    this.state.currentTurnIndex = this.findNextSeat(bbIdx);
    this.log(`Turn: ${this.state.players[this.state.currentTurnIndex]?.name}`);
  }

  private postBlind(idx: number, amount: number, label: string) {
    const p = this.state.players[idx]!;
    const actual = Math.min(amount, p.chips);
    p.chips -= actual;
    p.currentBet += actual;
    p.totalInvested += actual;
    p.hasActedThisRound = false; // Posting blinds doesn't count as "acting"
    if (p.chips === 0) p.status = 'all-in';
    this.log(`${p.name} posts ${label} ₹${actual}`);
  }

  private findNextSeat(from: number): number {
    const len = this.state.players.length;
    for (let i = 1; i <= len; i++) {
      const idx = (from + i) % len;
      const p = this.state.players[idx];
      if (p && p.status === 'active') return idx;
    }
    return from; // fallback
  }

  /* ═══ Turn Management ═══ */
  private nextTurn() {
    if (this.checkEndHandEarly()) return;

    if (this.isBettingRoundOver()) {
      this.collectBets();
      this.advanceGameState();
      return;
    }

    this.state.currentTurnIndex = this.findNextSeat(this.state.currentTurnIndex);
    const p = this.state.players[this.state.currentTurnIndex];
    if (p) this.log(`Turn: ${p.name}`);
  }

  private isBettingRoundOver(): boolean {
    const active = this.state.players.filter(p => p && p.status === 'active') as PlayerState[];
    if (active.length === 0) return true;
    if (active.length === 1 && this.getActiveCount() <= 1) return true;

    // Round is over when ALL active players have acted AND matched the current bet
    return active.every(p => p.hasActedThisRound && p.currentBet === this.state.currentBet);
  }

  private collectBets() {
    let roundPot = 0;
    this.state.players.forEach(p => {
      if (p) { roundPot += p.currentBet; p.currentBet = 0; }
    });
    this.state.pot += roundPot;
    this.state.currentBet = 0;
    this.state.minRaise = this.state.bigBlind;

    // Reset hasActed for next round
    this.state.players.forEach(p => { if (p) p.hasActedThisRound = false; });
  }

  private checkEndHandEarly(): boolean {
    const inHand = this.state.players.filter(p => p && (p.status === 'active' || p.status === 'all-in')) as PlayerState[];
    if (inHand.length <= 1) {
      // Single winner
      this.collectBets();
      if (inHand.length === 1) {
        inHand[0].chips += this.state.pot;
        this.log(`${inHand[0].name} wins ₹${this.state.pot} (uncontested)`);
      }
      this.state.pot = 0;
      this.state.state = 'WAITING';
      this.onStateChange?.();
      this.scheduleNextHand();
      return true;
    }

    // All-in runout: only 0-1 active but multiple all-in
    if (this.getDecisionCount() <= 1 && inHand.length > 1) {
      // Run out remaining community cards
      this.collectBets();
      while (this.state.communityCards.length < 5) {
        this.state.communityCards.push(this.state.deck.pop()!);
      }
      this.handleShowdown();
      return true;
    }

    return false;
  }

  private advanceGameState() {
    if (this.checkEndHandEarly()) return;

    if (this.state.state === 'PRE_FLOP') {
      this.state.state = 'FLOP';
      this.state.communityCards.push(this.state.deck.pop()!, this.state.deck.pop()!, this.state.deck.pop()!);
      this.log(`*** FLOP ***`);
    } else if (this.state.state === 'FLOP') {
      this.state.state = 'TURN';
      this.state.communityCards.push(this.state.deck.pop()!);
      this.log(`*** TURN ***`);
    } else if (this.state.state === 'TURN') {
      this.state.state = 'RIVER';
      this.state.communityCards.push(this.state.deck.pop()!);
      this.log(`*** RIVER ***`);
    } else if (this.state.state === 'RIVER') {
      this.handleShowdown();
      return;
    }

    // First to act post-flop: first active after dealer
    this.state.currentTurnIndex = this.findNextSeat(this.state.dealerIndex);
    const p = this.state.players[this.state.currentTurnIndex];
    if (p) this.log(`Turn: ${p.name}`);
  }

  private handleShowdown() {
    this.state.state = 'SHOWDOWN';
    this.log(`*** SHOWDOWN ***`);

    const contenders = this.state.players.filter(p => p && (p.status === 'active' || p.status === 'all-in')) as PlayerState[];

    let bestScore = -1;
    let winners: PlayerState[] = [];

    contenders.forEach(p => {
      if (p.cards) {
        const hand = evaluateHand([...p.cards, ...this.state.communityCards]);
        this.log(`${p.name}: ${hand.description}`);
        if (hand.score > bestScore) {
          bestScore = hand.score;
          winners = [p];
        } else if (hand.score === bestScore) {
          winners.push(p);
        }
      }
    });

    const winAmt = Math.floor(this.state.pot / winners.length);
    winners.forEach(w => {
      w.chips += winAmt;
      this.log(`🏆 ${w.name} wins ₹${winAmt}!`);
    });

    this.state.pot = 0;
    this.onStateChange?.();
    this.scheduleNextHand();
  }

  private scheduleNextHand() {
    setTimeout(() => {
      // Reload busted players
      this.state.players.forEach(p => {
        if (p && p.chips <= 0 && !p.isBot) {
          p.chips = 10000; // INR reload
          this.log(`${p.name} reloaded ₹10,000`);
        }
        // Remove busted bots
        if (p && p.chips <= 0 && p.isBot) {
          p.chips = 50000; // Bots get infinite reload
        }
      });

      if (this.getSeatedCount() >= 2) {
        this.startHand();
        this.onStateChange?.();
      }
    }, 6000);
  }

  /* ═══ Player Actions ═══ */
  fold(playerId: string) {
    const p = this.state.players[this.state.currentTurnIndex];
    if (!p || p.id !== playerId || p.status !== 'active') return;
    p.status = 'folded';
    p.hasActedThisRound = true;
    this.log(`${p.name} folds`);
    this.nextTurn();
  }

  check(playerId: string) {
    const p = this.state.players[this.state.currentTurnIndex];
    if (!p || p.id !== playerId || p.status !== 'active') return;
    if (p.currentBet < this.state.currentBet) return;
    p.hasActedThisRound = true;
    this.log(`${p.name} checks`);
    this.nextTurn();
  }

  call(playerId: string) {
    const p = this.state.players[this.state.currentTurnIndex];
    if (!p || p.id !== playerId || p.status !== 'active') return;
    const toCall = this.state.currentBet - p.currentBet;
    const actual = Math.min(toCall, p.chips);
    p.chips -= actual;
    p.currentBet += actual;
    p.totalInvested += actual;
    p.hasActedThisRound = true;
    if (p.chips === 0) p.status = 'all-in';
    this.log(`${p.name} calls ₹${actual}`);
    this.nextTurn();
  }

  raise(playerId: string, totalBetAmount: number) {
    const p = this.state.players[this.state.currentTurnIndex];
    if (!p || p.id !== playerId || p.status !== 'active') return;
    
    const toAdd = totalBetAmount - p.currentBet;
    if (toAdd <= 0 || toAdd > p.chips) return;

    p.chips -= toAdd;
    p.currentBet = totalBetAmount;
    p.totalInvested += toAdd;
    p.hasActedThisRound = true;
    if (p.chips === 0) p.status = 'all-in';

    const raiseSize = totalBetAmount - this.state.currentBet;
    this.state.currentBet = totalBetAmount;
    if (raiseSize > this.state.minRaise) this.state.minRaise = raiseSize;

    // Everyone else needs to act again  
    this.state.players.forEach(pl => {
      if (pl && pl.id !== playerId && pl.status === 'active') {
        pl.hasActedThisRound = false;
      }
    });

    this.log(`${p.name} raises to ₹${totalBetAmount}`);
    this.nextTurn();
  }

  /* ═══ Sanitized state for client ═══ */
  getSanitizedState(playerId: string): TableState {
    const _state = JSON.parse(JSON.stringify(this.state)) as TableState;
    _state.players.forEach(p => {
      if (p && p.id !== playerId && _state.state !== 'SHOWDOWN') {
        if (p.cards) {
          p.cards = [
            { suit: 'hearts', value: '?', rank: 0 } as any,
            { suit: 'hearts', value: '?', rank: 0 } as any,
          ];
        }
      }
    });
    _state.deck = [];
    return _state;
  }
}
