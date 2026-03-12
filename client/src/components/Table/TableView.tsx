import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/gameStore';
import { GameTable, type Player } from './GameTable';
import { ActionControls } from './ActionControls';
import { ChatPanel } from '../Chat/ChatPanel';
import { SettingsMenu } from '../Menu/SettingsMenu';
import { HandHistoryPanel } from './HandHistoryPanel';
import { useThrowables, ThrowableLayer, type ThrowableItem } from '../Animations/Throwables';
import { evaluateHand, getHandColor } from '../../utils/handEvaluator';
import { playSound } from '../../utils/sounds';

/* ═══ Design Tokens ═══ */
const GOLD = '#d4a950';
const GOLD_DIM = 'rgba(212,169,80,0.18)';
const GOLD_BORDER = 'rgba(212,169,80,0.25)';
const PANEL_BG = '#0f1929';
const TEXT = '#e8ddc8';
const TEXT_MUTED = '#7a8fa8';

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#ec4899','#f59e0b','#06b6d4'];

export const TableView: React.FC = () => {
  const {
    roomCode, leaveRoom, tableState, seatIndex,
    sendAction, sendThrow, balance, potWinners,
    isMusicEnabled,
  } = useAppStore();

  const { throwItem, items: throwableItems, removeItem: removeThrowable } = useThrowables();
  const [throwTarget, setThrowTarget] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  // Auto-action states
  const [autoFold, setAutoFold] = useState(false);
  const [autoCheck, setAutoCheck] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const activeChatPlayers = useMemo(() => {
    if (!tableState) return [];
    return tableState.players
      .filter(Boolean)
      .map(p => ({ name: p!.name, color: COLORS[p!.seatIndex % COLORS.length] }));
  }, [tableState]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Keyboard shortcut for fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleFullscreen]);

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

  const hero = (tableState && seatIndex !== null) ? tableState.players[seatIndex] : null;
  const myTurn = tableState?.currentTurnIndex === seatIndex && tableState?.state !== 'WAITING' && tableState?.state !== 'SHOWDOWN';
  const currentBet = tableState?.currentBet || 0;
  const minRaiseState = tableState?.minRaise || 0;

  const canCheck = hero ? hero.currentBet >= currentBet : false;
  const callAmount = hero ? Math.min(currentBet - hero.currentBet, hero.chips) : 0;
  const maxRaise = hero ? hero.chips + hero.currentBet : 0;
  const minRaise = currentBet + minRaiseState;

  const handleFold = () => { if (myTurn) { playSound('fold'); sendAction('fold'); } };
  const handleCheck = () => { if (myTurn) { playSound('check'); sendAction('check'); } };
  const handleCall = () => { if (myTurn) { playSound('chips'); sendAction('call'); } };
  const handleRaise = (amount: number) => { if (myTurn) { playSound('chips'); sendAction('raise', amount); } };
  const handleAllIn = () => { if (myTurn) { playSound('allin'); sendAction('allin'); } };

  // Auto-actions
  useEffect(() => {
    if (myTurn && hero) {
      if (autoFold) { handleFold(); setAutoFold(false); }
      else if (autoCheck && canCheck) { handleCheck(); setAutoCheck(false); }
      else if (autoCheck && !canCheck) { setAutoCheck(false); }
    }
  }, [myTurn, hero, autoFold, autoCheck, canCheck]);

  if (!tableState || seatIndex === null) return null;

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

  const handleThrowAction = (type: ThrowableItem['type'], _fromSeat: number, toSeat: number) => {
    sendThrow(type, toSeat);
    setThrowTarget(null);
  };

  return (
    <div ref={containerRef} style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
      background: '#070d1a',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: TEXT,
    }}>
      {/* ═══ TOP BAR ═══ */}
      <div style={{
        height: 48, background: PANEL_BG,
        borderBottom: `1px solid ${GOLD_BORDER}`,
        display: 'flex', alignItems: 'center', padding: '0 18px', gap: 20,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 17, fontWeight: 700,
          color: GOLD, letterSpacing: 1.5, whiteSpace: 'nowrap',
          textShadow: '0 0 20px rgba(212,169,80,0.4)',
        }}>♠ POKER ULTRA</div>

        <div style={{ width: 1, height: 20, background: GOLD_BORDER }} />

        <div style={{ fontSize: 12, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 5 }}>
          ROOM <strong style={{ color: TEXT, fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>{roomCode}</strong>
        </div>
        <div style={{ width: 1, height: 20, background: GOLD_BORDER }} />
        <div style={{ fontSize: 12, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 5 }}>
          BLINDS <strong style={{ color: TEXT, fontWeight: 600, fontSize: 13 }}>₹50 / ₹100</strong>
        </div>
        <div style={{ width: 1, height: 20, background: GOLD_BORDER }} />
        <div style={{ fontSize: 12, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 5 }}>
          PLAYERS <strong style={{ color: TEXT, fontWeight: 600, fontSize: 13 }}>{tableState.players.filter(Boolean).length} / {tableState.maxPlayers}</strong>
        </div>

        <div style={{ flex: 1 }} />

        {/* Balance */}
        <div style={{
          background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`,
          borderRadius: 6, padding: '4px 12px',
          fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: 0.5,
        }}>₹ {balance.toLocaleString()}</div>

        {/* Fullscreen button */}
        <button onClick={toggleFullscreen} style={{
          background: 'transparent', border: `1px solid ${GOLD_BORDER}`,
          borderRadius: 6, padding: '5px 10px', color: TEXT_MUTED,
          cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5,
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = GOLD_BORDER; e.currentTarget.style.color = TEXT_MUTED; }}
        >
          {isFullscreen ? '⊡' : '⛶'} {isFullscreen ? 'Exit' : 'Full Screen'}
        </button>

        {/* Settings */}
        <button onClick={() => setShowSettings(true)} style={{
          background: 'transparent', border: `1px solid ${GOLD_BORDER}`,
          borderRadius: 6, padding: '5px 10px', color: TEXT_MUTED,
          cursor: 'pointer', fontSize: 13, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = GOLD_BORDER; e.currentTarget.style.color = TEXT_MUTED; }}
        >⚙</button>

        {/* Back */}
        <button onClick={leaveRoom} style={{
          background: 'transparent', border: `1px solid ${GOLD_BORDER}`,
          borderRadius: 6, padding: '5px 10px', color: TEXT_MUTED,
          cursor: 'pointer', fontSize: 13, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = GOLD_BORDER; e.currentTarget.style.color = TEXT_MUTED; }}
        >← Back</button>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left: Hand History Panel ── */}
        {showHistory && (
          <HandHistoryPanel
            logs={tableState.logs}
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* ── Center: Table Area ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(26,92,46,0.06) 0%, transparent 70%)',
        }}>
          {/* History toggle (when hidden) */}
          {!showHistory && (
            <button onClick={() => setShowHistory(true)} style={{
              position: 'absolute', top: 10, left: 10, zIndex: 30,
              background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`,
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: 1,
              textTransform: 'uppercase',
            }}>📜 History</button>
          )}

          <div style={{ transform: 'scale(0.88)', transformOrigin: 'center center' }}>
            <GameTable
              players={alignPlayersHeroBottom(tableState.players, seatIndex)}
              pot={tableState.pot}
              potWinners={potWinners}
              communityCards={tableState.communityCards}
              handDescription={handDesc}
              handColor={handColor}
              onThrowAt={(targetSeatIndex) => setThrowTarget(targetSeatIndex)}
            />
          </div>
          <ThrowableLayer items={throwableItems} heroSeat={seatIndex} onRemove={removeThrowable} />

          {/* Fullscreen hint */}
          <div style={{
            position: 'absolute', top: 10, right: 12,
            fontSize: 10, color: '#4a5a70', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            Press F for fullscreen
          </div>

          {/* ── Action controls (floating bottom-right) ── */}
          <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 40 }}>
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
            ) : hero && tableState.state === 'ACTIVE' ? (
              <div style={{ background: 'rgba(19,30,48,0.95)', border: `1px solid ${GOLD_BORDER}`, borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>Waiting…</span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: autoFold ? '#ef4444' : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={autoFold} onChange={e => { setAutoFold(e.target.checked); setAutoCheck(false); }} />
                    Fold
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: autoCheck ? GOLD : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={autoCheck} onChange={e => { setAutoCheck(e.target.checked); setAutoFold(false); }} />
                    Check
                  </label>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(19,30,48,0.95)', border: `1px solid ${GOLD_BORDER}`, borderRadius: 12, padding: '12px 16px' }}>
                <span style={{ fontSize: 11, color: '#4a5a70', fontWeight: 600 }}>
                  {tableState.state === 'WAITING' ? '⏳ Starting…' :
                   tableState.state === 'SHOWDOWN' ? '🏆 Showdown!' : 'Waiting…'}
                </span>
              </div>
            )}
          </div>

          {/* ── Chat panel (floating bottom-left) ── */}
          <div style={{
            position: 'absolute', bottom: 24, left: 24, maxWidth: 200,
            background: 'rgba(19,30,48,0.95)', border: `1px solid ${GOLD_BORDER}`,
            borderRadius: 12, overflow: 'hidden', maxHeight: '60vh',
            display: 'flex', flexDirection: 'column', zIndex: 30,
          }}>
            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${GOLD_BORDER}`, fontSize: 10, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: 1 }}>Chat</div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <ChatPanel activePlayers={activeChatPlayers} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Throw picker overlay ═══ */}
      {throwTarget !== null && throwTarget !== seatIndex && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }} onClick={() => setThrowTarget(null)}>
          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)',
              border: `1px solid ${GOLD_BORDER}`, borderRadius: 16,
              padding: '16px 20px', boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
            }}>
              <div style={{ marginBottom: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>
                  Throw at <strong style={{ color: TEXT }}>{tableState.players[throwTarget]?.name}</strong>
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
                      background: 'rgba(255,255,255,0.05)', border: `1px solid ${GOLD_BORDER}`,
                      borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,169,80,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  >
                    <span style={{ fontSize: 28 }}>{item.emoji}</span>
                    <span style={{ fontSize: 9, color: TEXT_MUTED, fontWeight: 700 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
      <AmbientMusic enabled={isMusicEnabled} />
    </div>
  );
};

/** ═══ Ambient Background Music (Synthesized) ═══ */
const AmbientMusic: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (enabled) {
      if (!audioCtxRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(120, ctx.currentTime);
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.1;
        lfoGain.gain.value = 5;
        lfo.connect(lfoGain).connect(osc.frequency);
        osc.connect(gain).connect(ctx.destination);
        osc2.connect(gain).connect(ctx.destination);
        osc.start();
        osc2.start();
        lfo.start();
        gainNodeRef.current = gain;
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
    }
  }, [enabled]);

  return null;
};

/** Rotate players so hero is always at visual index 3 (bottom center) */
function alignPlayersHeroBottom(serverPlayers: (Player | null)[], heroSeat: number): (Player | null)[] {
  const result = new Array(6).fill(null);
  if (serverPlayers.length === 2) {
    result[3] = serverPlayers[heroSeat];
    const oppSeat = heroSeat === 0 ? 1 : 0;
    if (serverPlayers[oppSeat]) result[0] = serverPlayers[oppSeat];
    return result;
  }
  const offset = (3 - heroSeat + 6) % 6;
  for (let i = 0; i < serverPlayers.length; i++) {
    if (serverPlayers[i]) {
      result[(i + offset) % 6] = serverPlayers[i];
    }
  }
  return result;
}
