import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/gameStore';
import { GameTable, type Player } from './GameTable';
import { ActionControls } from './ActionControls';
import { ChatPanel } from '../Chat/ChatPanel';
import { useThrowables, type ThrowableItem } from '../Animations/Throwables';
import { evaluateHand, getHandColor } from '../../utils/handEvaluator';
import { playSound } from '../../utils/sounds';

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#ec4899','#f59e0b','#06b6d4'];

export const TableView: React.FC = () => {
  const {
    roomCode, leaveRoom, tableState, seatIndex,
    sendAction, sendThrow, balance
  } = useAppStore();

  const { throwItem, ThrowableLayer } = useThrowables();
  const [throwTarget, setThrowTarget] = useState<number | null>(null);

  const activeChatPlayers = useMemo(() => {
    if (!tableState) return [];
    return tableState.players
      .filter(Boolean)
      .map(p => ({ name: p!.name, color: COLORS[p!.seatIndex % COLORS.length] }));
  }, [tableState]);

  // Listen for throw events from server
  useEffect(() => {
    const socket = useAppStore.getState().socket;
    if (!socket) return;
    const handleThrow = (data: { type: string; fromSeat: number; toSeat: number }) => {
      throwItem(data.type as any, data.fromSeat, data.toSeat);
      playSound('throw');
    };
    socket.on('throw_item', handleThrow);
    return () => { socket.off('throw_item', handleThrow); };
  }, [throwItem]);

  if (!tableState || seatIndex === null) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f18' }}>
        <span style={{ color: '#4ade80', fontSize: 22, fontWeight: 900, fontStyle: 'italic' }}>Connecting to table…</span>
      </div>
    );
  }

  const hero = tableState.players[seatIndex];

  // Hand evaluation
  let handDesc = '';
  let handColor = '#475569';
  if (hero?.cards && hero.cards.length === 2 && !(hero.cards[0] as any).faceDown) {
    const res = evaluateHand(hero.cards, tableState.communityCards);
    handDesc = res.description;
    handColor = getHandColor(res.score);
  } else if (tableState.state === 'SHOWDOWN') {
    handDesc = 'Showdown';
    handColor = '#fbbf24';
  } else if (tableState.state === 'WAITING') {
    handDesc = 'Waiting for next hand…';
  }

  // Turn logic
  const myTurn = tableState.currentTurnIndex === seatIndex && tableState.state !== 'WAITING' && tableState.state !== 'SHOWDOWN';
  const canCheck = hero ? hero.currentBet >= tableState.currentBet : false;
  const callAmount = hero ? Math.min(tableState.currentBet - hero.currentBet, hero.chips) : 0;
  const maxRaise = hero ? hero.chips + hero.currentBet : 0;
  const minRaise = tableState.currentBet + tableState.minRaise;

  const handleThrowAction = (type: ThrowableItem['type'], _fromSeat: number, toSeat: number) => {
    sendThrow(type, toSeat);
    setThrowTarget(null);
  };

  const handleFold = () => { if (myTurn) { playSound('fold'); sendAction('fold'); } };
  const handleCheck = () => { if (myTurn) { playSound('check'); sendAction('check'); } };
  const handleCall = () => { if (myTurn) { playSound('chips'); sendAction('call'); } };
  const handleRaise = (amount: number) => { if (myTurn) { playSound('chips'); sendAction('raise', amount); } };
  const handleAllIn = () => { if (myTurn) { playSound('allin'); sendAction('allin'); } };

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
      background: 'radial-gradient(ellipse at 50% 30%, #141c2b 0%, #0d1117 60%, #080c12 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* ═══ GLASS PANEL — wraps everything ═══ */}
      <div style={{
        position: 'relative',
        width: 'calc(100vw - 40px)', maxWidth: 1200,
        height: 'calc(100vh - 40px)', maxHeight: 820,
        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 24,
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* ── Top bar (inside glass) ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}>
          <button onClick={leaveRoom} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 18, padding: '4px 8px' }}>← Back</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#94a3b8' }}>
            <span>Table: <strong style={{ color: '#fff', textTransform: 'uppercase' }}>{roomCode}</strong></span>
            <span style={{ color: '#334155' }}>·</span>
            <span style={{ color: '#4ade80', fontWeight: 700 }}>₹50/₹100 NLH</span>
            <span style={{ color: '#334155' }}>·</span>
            <span>👥 {tableState.players.filter(Boolean).length}/6</span>
          </div>

          <div style={{
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)',
            borderRadius: 20, padding: '5px 16px',
          }}>
            <span style={{ color: '#4ade80', fontWeight: 900, fontFamily: 'monospace', fontSize: 14 }}>🪙 ₹{balance.toLocaleString()}</span>
          </div>
        </div>

        {/* ── Main content area (chat + table) ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

          {/* Chat panel (left side, inside glass) */}
          <div style={{
            width: 220, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', flexDirection: 'column',
          }}>
            <ChatPanel activePlayers={activeChatPlayers} />
          </div>

          {/* Table area (center) */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'center center' }}>
              <GameTable
                players={alignPlayersHeroBottom(tableState.players, seatIndex)}
                pot={tableState.pot}
                communityCards={tableState.communityCards}
                handDescription={handDesc}
                handColor={handColor}
                onThrowAt={(targetSeatIndex) => setThrowTarget(targetSeatIndex)}
              />
            </div>
            <ThrowableLayer />
          </div>
        </div>

        {/* ── Action controls bar (bottom, inside glass) ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}>
          {myTurn && hero ? (
            <ActionControls
              canCheck={canCheck}
              minRaise={Math.min(minRaise, maxRaise)}
              maxRaise={maxRaise}
              callAmount={callAmount}
              pot={tableState.pot}
              onFold={handleFold}
              onCheck={handleCheck}
              onCall={handleCall}
              onRaise={handleRaise}
              onAllIn={handleAllIn}
            />
          ) : (
            <div style={{ padding: '16px 0', textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                {tableState.state === 'WAITING' ? '⏳ Next hand starting soon…' :
                 tableState.state === 'SHOWDOWN' ? '🏆 Showdown!' :
                 `Waiting for ${tableState.players[tableState.currentTurnIndex]?.name || 'opponent'}…`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Throw picker overlay ═══ */}
      {throwTarget !== null && throwTarget !== seatIndex && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }} onClick={() => setThrowTarget(null)}>
          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
              padding: '16px 20px', boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
            }}>
              <div style={{ marginBottom: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                  Throw at <strong style={{ color: '#fff' }}>{tableState.players[throwTarget]?.name}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {([
                  { type: 'snowball' as const, emoji: '❄️', label: 'Snowball' },
                  { type: 'fireworks' as const, emoji: '🎆', label: 'Fireworks' },
                  { type: 'laughing' as const, emoji: '😂', label: 'Laugh' },
                  { type: 'thumbsup' as const, emoji: '👍', label: 'Nice!' },
                  { type: 'tomato' as const, emoji: '🍅', label: 'Tomato' },
                ]).map(item => (
                  <button key={item.type}
                    onClick={() => handleThrowAction(item.type, seatIndex, throwTarget)}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  >
                    <span style={{ fontSize: 28 }}>{item.emoji}</span>
                    <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Rotate players so hero is always at visual index 3 (bottom center) */
function alignPlayersHeroBottom(serverPlayers: (Player | null)[], heroSeat: number): (Player | null)[] {
  const result = new Array(6).fill(null);
  const offset = (3 - heroSeat + 6) % 6;
  for (let i = 0; i < serverPlayers.length; i++) {
    if (serverPlayers[i]) {
      result[(i + offset) % 6] = serverPlayers[i];
    }
  }
  return result;
}
