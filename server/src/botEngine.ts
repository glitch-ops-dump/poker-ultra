import { TexasHoldemEngine } from './engine';
import { evaluateHand } from './handEvaluator';

export function attachBotLogic(engine: TexasHoldemEngine, broadcastState: (roomId: string) => void) {
  // We'll hook into an event or periodically check if it's a bot's turn
  setInterval(() => {
    if (engine.state.state === 'WAITING' || engine.state.state === 'SHOWDOWN') return;

    const currentTurn = engine.state.currentTurnIndex;
    const player = engine.state.players[currentTurn];

    if (player && player.isBot && player.status === 'active') {
      // It's a bot's turn! Make a decision after a small delay to simulate "thinking"
      // We use a lock to prevent multiple triggers
      if ((player as any)._isThinking) return;
      (player as any)._isThinking = true;

      // Small random delay (1-3 seconds)
      const delay = Math.random() * 2000 + 1000;
      
      setTimeout(() => {
        makeBotDecision(engine, player.id);
        (player as any)._isThinking = false;
        broadcastState(engine.state.roomId);
      }, delay);
    }
  }, 1000);
}

function makeBotDecision(engine: TexasHoldemEngine, botId: string) {
  const p = engine.state.players.find(p => p?.id === botId);
  if (!p || p.status !== 'active') return;

  const toCall = engine.state.currentBet - p.currentBet;
  
  // Very simple logic for MVP
  // Evaluate current hand strength
  let handStrength = 0;
  if (p.cards) {
    const res = evaluateHand([...p.cards, ...engine.state.communityCards]);
    handStrength = res.score;
  }

  const rand = Math.random();

  if (toCall === 0) {
    // Can check
    if (handStrength > 1e10 && rand > 0.5) {
      // Good hand, maybe raise
      engine.raise(botId, engine.state.currentBet + engine.state.minRaise);
    } else {
      engine.check(botId);
    }
  } else {
    // Must call or fold
    if (toCall > p.chips * 0.5 && handStrength < 1e10) {
      // Big bet and weak hand = fold
      engine.fold(botId);
    } else if (handStrength > 2e10 && rand > 0.7) {
      // Strong hand = maybe raise
      engine.raise(botId, engine.state.currentBet + engine.state.minRaise);
    } else {
      // Default call
      engine.call(botId);
    }
  }
}
