/* ═══ Deck & Card Utilities ═══ */

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  rank: number; // 2=0, 3=1, ... A=12
}

const SUITS: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let i = 0; i < VALUES.length; i++) {
      deck.push({ suit, value: VALUES[i], rank: i });
    }
  }
  return deck;
}

/** Fisher-Yates shuffle */
export function shuffleDeck(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function createShuffledDeck(): Card[] {
  return shuffleDeck(createDeck());
}
