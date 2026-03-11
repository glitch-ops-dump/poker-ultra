/* ═══ Hand Evaluator ═══
 * Evaluates a poker hand (2 hole cards + up to 5 community cards)
 * and returns the best possible hand ranking and name.
 */

import type { Card } from '../components/Cards/PlayingCard';

export type HandRank =
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'One Pair'
  | 'High Card';

const VALUE_ORDER = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

function valIdx(v: string): number {
  return VALUE_ORDER.indexOf(v);
}

interface HandResult {
  rank: HandRank;
  score: number;      // higher = better (0–9 scale)
  description: string; // e.g. "Flush — Hearts"
}

function getCombinations(arr: Card[], k: number): Card[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(c => [first, ...c]);
  const withoutFirst = getCombinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function evaluateFive(cards: Card[]): { rank: HandRank; score: number; description: string } {
  const vals = cards.map(c => valIdx(c.value)).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);

  // Check straight
  let isStraight = false;
  let straightHigh = vals[0];
  const uniqueVals = [...new Set(vals)];
  if (uniqueVals.length === 5) {
    if (uniqueVals[0] - uniqueVals[4] === 4) {
      isStraight = true;
      straightHigh = uniqueVals[0];
    }
    // Ace-low straight (A-2-3-4-5)
    if (uniqueVals[0] === 12 && uniqueVals[1] === 3 && uniqueVals[2] === 2 && uniqueVals[3] === 1 && uniqueVals[4] === 0) {
      isStraight = true;
      straightHigh = 3; // 5-high
    }
  }

  // Count values
  const counts: Record<number, number> = {};
  vals.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  const groups = Object.entries(counts).map(([v, c]) => ({ val: Number(v), count: c })).sort((a, b) => b.count - a.count || b.val - a.val);

  const suitName = suits[0].charAt(0).toUpperCase() + suits[0].slice(1);

  if (isFlush && isStraight && straightHigh === 12) return { rank: 'Royal Flush', score: 9, description: `Royal Flush — ${suitName}` };
  if (isFlush && isStraight) return { rank: 'Straight Flush', score: 8, description: `Straight Flush — ${VALUE_ORDER[straightHigh]} high` };
  if (groups[0].count === 4) return { rank: 'Four of a Kind', score: 7, description: `Four ${VALUE_ORDER[groups[0].val]}s` };
  if (groups[0].count === 3 && groups[1].count === 2) return { rank: 'Full House', score: 6, description: `Full House — ${VALUE_ORDER[groups[0].val]}s over ${VALUE_ORDER[groups[1].val]}s` };
  if (isFlush) return { rank: 'Flush', score: 5, description: `Flush — ${suitName}` };
  if (isStraight) return { rank: 'Straight', score: 4, description: `Straight — ${VALUE_ORDER[straightHigh]} high` };
  if (groups[0].count === 3) return { rank: 'Three of a Kind', score: 3, description: `Three ${VALUE_ORDER[groups[0].val]}s` };
  if (groups[0].count === 2 && groups[1].count === 2) return { rank: 'Two Pair', score: 2, description: `Two Pair — ${VALUE_ORDER[groups[0].val]}s & ${VALUE_ORDER[groups[1].val]}s` };
  if (groups[0].count === 2) return { rank: 'One Pair', score: 1, description: `Pair of ${VALUE_ORDER[groups[0].val]}s` };
  return { rank: 'High Card', score: 0, description: `High Card — ${VALUE_ORDER[vals[0]]}` };
}

export function evaluateHand(holeCards: [Card, Card], communityCards: Card[]): HandResult {
  const all = [...holeCards, ...communityCards].filter(c => !c.faceDown && c.value !== '?');
  if (all.length < 5) {
    // Not enough cards — evaluate what we can
    if (all.length < 2) return { rank: 'High Card', score: 0, description: 'Waiting for cards...' };
    // With fewer than 5, just check pairs etc from available
    const vals = all.map(c => valIdx(c.value)).sort((a, b) => b - a);
    const counts: Record<number, number> = {};
    vals.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    const groups = Object.entries(counts).map(([v, c]) => ({ val: Number(v), count: c })).sort((a, b) => b.count - a.count || b.val - a.val);

    if (groups[0].count === 2) return { rank: 'One Pair', score: 1, description: `Pair of ${VALUE_ORDER[groups[0].val]}s` };
    return { rank: 'High Card', score: 0, description: `High Card — ${VALUE_ORDER[vals[0]]}` };
  }

  // Get all 5-card combinations and find best hand
  const combos = getCombinations(all, 5);
  let best: HandResult = { rank: 'High Card', score: 0, description: '' };
  for (const combo of combos) {
    const result = evaluateFive(combo);
    if (result.score > best.score) best = result;
  }
  return best;
}

/* Color badge for hand strength */
export function getHandColor(score: number): string {
  if (score >= 8) return '#fbbf24'; // gold — royal/straight flush
  if (score >= 6) return '#a78bfa'; // purple — four of a kind / full house
  if (score >= 4) return '#38bdf8'; // blue — flush / straight
  if (score >= 2) return '#4ade80'; // green — trips / two pair
  if (score >= 1) return '#94a3b8'; // gray — pair
  return '#64748b'; // dim gray — high card
}
