/* ═══ Server-Side Hand Evaluator ═══
 * Evaluates the best 5-card poker hand from 7 cards (2 hole + 5 community).
 * Returns a numeric score where higher = better.
 */

import { Card } from './deck';

export interface HandResult {
  rank: number;       // 0=High Card, 1=Pair, ... 9=Royal Flush
  rankName: string;
  score: number;      // Comparable numeric score (higher wins)
  description: string;
  bestCards: Card[];
}

const RANK_NAMES = [
  'High Card', 'One Pair', 'Two Pair', 'Three of a Kind',
  'Straight', 'Flush', 'Full House', 'Four of a Kind',
  'Straight Flush', 'Royal Flush'
];

function getCombinations(arr: Card[], k: number): Card[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  return [
    ...getCombinations(rest, k - 1).map(c => [first, ...c]),
    ...getCombinations(rest, k),
  ];
}

function evaluateFive(cards: Card[]): { rank: number; score: number; kickers: number[] } {
  const ranks = cards.map(c => c.rank).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);

  // Check straight
  let isStraight = false;
  let straightHigh = ranks[0];
  const unique = [...new Set(ranks)];
  if (unique.length === 5) {
    if (unique[0] - unique[4] === 4) {
      isStraight = true;
      straightHigh = unique[0];
    }
    // Ace-low (A-2-3-4-5)
    if (unique[0] === 12 && unique[1] === 3 && unique[2] === 2 && unique[3] === 1 && unique[4] === 0) {
      isStraight = true;
      straightHigh = 3;
    }
  }

  // Count ranks
  const counts: Record<number, number> = {};
  ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
  const groups = Object.entries(counts)
    .map(([r, c]) => ({ rank: Number(r), count: c }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);

  // Score: rank * 10^10 + kickers
  const kickers = ranks;

  if (isFlush && isStraight && straightHigh === 12) {
    return { rank: 9, score: 9e10, kickers };
  }
  if (isFlush && isStraight) {
    return { rank: 8, score: 8e10 + straightHigh, kickers };
  }
  if (groups[0].count === 4) {
    return { rank: 7, score: 7e10 + groups[0].rank * 1e6 + groups[1].rank, kickers };
  }
  if (groups[0].count === 3 && groups[1].count === 2) {
    return { rank: 6, score: 6e10 + groups[0].rank * 1e6 + groups[1].rank, kickers };
  }
  if (isFlush) {
    return { rank: 5, score: 5e10 + ranks[0] * 1e8 + ranks[1] * 1e6 + ranks[2] * 1e4 + ranks[3] * 100 + ranks[4], kickers };
  }
  if (isStraight) {
    return { rank: 4, score: 4e10 + straightHigh, kickers };
  }
  if (groups[0].count === 3) {
    return { rank: 3, score: 3e10 + groups[0].rank * 1e6 + groups[1].rank * 100 + groups[2].rank, kickers };
  }
  if (groups[0].count === 2 && groups[1].count === 2) {
    const hi = Math.max(groups[0].rank, groups[1].rank);
    const lo = Math.min(groups[0].rank, groups[1].rank);
    return { rank: 2, score: 2e10 + hi * 1e6 + lo * 1e4 + groups[2].rank, kickers };
  }
  if (groups[0].count === 2) {
    return { rank: 1, score: 1e10 + groups[0].rank * 1e6 + groups[1].rank * 1e4 + groups[2].rank * 100 + groups[3].rank, kickers };
  }
  return { rank: 0, score: ranks[0] * 1e8 + ranks[1] * 1e6 + ranks[2] * 1e4 + ranks[3] * 100 + ranks[4], kickers };
}

/** Evaluate best 5-card hand from up to 7 cards */
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length < 5) {
    return { rank: 0, rankName: 'High Card', score: 0, description: 'Not enough cards', bestCards: cards };
  }

  const combos = getCombinations(cards, 5);
  let bestResult = { rank: 0, score: -1, kickers: [] as number[] };
  let bestCombo: Card[] = combos[0];

  for (const combo of combos) {
    const result = evaluateFive(combo);
    if (result.score > bestResult.score) {
      bestResult = result;
      bestCombo = combo;
    }
  }

  return {
    rank: bestResult.rank,
    rankName: RANK_NAMES[bestResult.rank],
    score: bestResult.score,
    description: RANK_NAMES[bestResult.rank],
    bestCards: bestCombo,
  };
}

/** Compare two hand results. Returns >0 if a wins, <0 if b wins, 0 if tie */
export function compareHands(a: HandResult, b: HandResult): number {
  return a.score - b.score;
}
