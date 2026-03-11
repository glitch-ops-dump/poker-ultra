import React, { useRef, useEffect } from 'react';
import { type Card } from '../Cards/PlayingCard';
import { AnimatedCard, usePotPulse } from '../Cards/AnimatedCard';
import { type ThrowableItem } from '../Animations/Throwables';

/* ═══ Types ═══ */
export type { Card } from '../Cards/PlayingCard';

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

/* ═══ Config ═══ */
const AVATAR_BG = ['#3b82f6','#10b981','#8b5cf6','#ec4899','#f59e0b','#06b6d4'];

/* Seat positions relative to the table container (px offsets from edges) */
const SEAT_POS: Record<number, React.CSSProperties> = {
  0: { position: 'absolute', top: '-70px', left: '50%', transform: 'translateX(-50%)' },
  1: { position: 'absolute', top: '10%',   right: '-155px' },
  2: { position: 'absolute', bottom: '10%', right: '-155px' },
  3: { position: 'absolute', bottom: '-70px', left: '50%', transform: 'translateX(-50%)' },  // HERO always here
  4: { position: 'absolute', bottom: '10%', left: '-155px' },
  5: { position: 'absolute', top: '10%',   left: '-155px' },
};

/* ═══ Player Pod ═══ */
const PlayerPod: React.FC<{
  player: Player;
  onThrowAt?: (seatIndex: number) => void;
  dealerPos?: { x: number; y: number };
  throwHandler?: {
    onThrow: (type: ThrowableItem['type'], from: number, to: number) => void;
  };
}> = ({ player, onThrowAt, dealerPos }) => {
  const folded = player.status === 'fold';
  const thinking = player.status === 'thinking';
  const bg = AVATAR_BG[player.seatIndex % AVATAR_BG.length];
  const chipStr = player.chips >= 1000 ? `${Math.round(player.chips / 1000)}k` : `${player.chips}`;

  // Track if these cards were just dealt
  const prevCards = useRef<string | null>(null);
  const cardKey = player.cards ? player.cards.map(c => c.value + c.suit).join() : null;
  const isNewDeal = cardKey !== null && cardKey !== prevCards.current;

  useEffect(() => {
    prevCards.current = cardKey;
  }, [cardKey]);

  return (
    <div style={{ opacity: folded ? 0.4 : 1, transition: 'opacity 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      {/* Seat label */}
      <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase' }}>
        Seat {player.seatIndex + 1}
      </span>

      {/* Pod body */}
      <div
        onClick={() => !player.isHero && onThrowAt?.(player.seatIndex)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 14px', borderRadius: 14,
          background: 'rgba(30,41,59,0.85)', backdropFilter: 'blur(10px)',
          border: thinking ? '1.5px solid rgba(52,211,153,0.5)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: thinking
            ? '0 0 20px rgba(52,211,153,0.2), 0 4px 16px rgba(0,0,0,0.5)'
            : '0 4px 16px rgba(0,0,0,0.5)',
          minWidth: 115, cursor: player.isHero ? 'default' : 'pointer',
          transition: 'all 0.3s',
        }}
      >
        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 14,
            boxShadow: `0 0 0 2px ${bg}44`,
          }}>
            {player.name.charAt(0).toUpperCase()}
          </div>
          {player.isDealer && (
            <div style={{
              position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%',
              background: '#fff', border: '2px solid #94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
            }}>
              <span style={{ fontSize: 7, fontWeight: 900, color: '#0f172a' }}>D</span>
            </div>
          )}
        </div>

        {/* Name + chips */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{player.name}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>({chipStr})</div>
        </div>
      </div>

      {/* Status */}
      {player.status && player.status !== 'thinking' && (
        <span style={{
          fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1,
          padding: '2px 10px', borderRadius: 20,
          background: player.status === 'fold' ? 'rgba(127,29,29,0.8)' : 'rgba(30,41,59,0.8)',
          border: `1px solid ${player.status === 'fold' ? '#dc2626' : '#475569'}`,
          color: player.status === 'fold' ? '#fca5a5' : '#94a3b8',
        }}>{player.status}</span>
      )}

      {/* Thinking dots */}
      {thinking && (
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%', background: '#4ade80',
              animation: `pulse 1s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
          <style>{`@keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }`}</style>
        </div>
      )}

      {/* Cards */}
      {player.cards && (
        <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
          {player.isHero ? (
            <>
              <AnimatedCard 
                card={player.cards[0]} 
                width={40} height={56} 
                dealFrom={isNewDeal ? dealerPos : undefined}
                dealDelay={0.1}
                flipDelay={0.4}
              />
              <AnimatedCard 
                card={player.cards[1]} 
                width={40} height={56} 
                dealFrom={isNewDeal ? dealerPos : undefined}
                dealDelay={0.25}
                flipDelay={0.4}
              />
            </>
          ) : (
            <>
              <AnimatedCard 
                card={{ ...player.cards[0], faceDown: true }} 
                width={30} height={42} 
                faceDown={true}
                dealFrom={isNewDeal ? dealerPos : undefined}
                dealDelay={player.seatIndex * 0.1}
              />
              <AnimatedCard 
                card={{ ...player.cards[1], faceDown: true }} 
                width={30} height={42} 
                faceDown={true}
                dealFrom={isNewDeal ? dealerPos : undefined}
                dealDelay={player.seatIndex * 0.1 + 0.05}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══ GameTable ═══ */
interface TableProps {
  players: (Player | null)[];
  communityCards: Card[];
  pot: number;
  handDescription?: string;
  handColor?: string;
  onThrowAt?: (seatIndex: number) => void;
}

export const GameTable: React.FC<TableProps> = ({
  players, communityCards, pot, handDescription, handColor, onThrowAt,
}) => {
  const potRef = usePotPulse(pot);

  // Determine dealer position for card dealing
  const dealerSeat = players.find(p => p?.isDealer);
  const dealerPos = dealerSeat ? {
    // Relative to center of table (roughly 0,0)
    x: dealerSeat.seatIndex === 0 || dealerSeat.seatIndex === 3 ? 0 : (dealerSeat.seatIndex < 3 ? 400 : -400),
    y: dealerSeat.seatIndex < 3 ? -200 : 200,
  } : undefined;

  // Track community card deal status
  const prevCommCount = useRef(communityCards.length);
  useEffect(() => {
    prevCommCount.current = communityCards.length;
  }, [communityCards.length]);
  return (
    <div style={{ position: 'relative', width: '70vw', maxWidth: 800, aspectRatio: '800 / 440' }}>
      {/* ── Outer rail ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'linear-gradient(145deg, #1a3328, #0f261e)',
        border: '5px solid #1a3a2d',
        boxShadow: '0 0 80px rgba(0,0,0,0.7), 0 0 2px rgba(52,211,153,0.15)',
      }}>
        {/* Neon ring */}
        <div style={{
          position: 'absolute', inset: 2, borderRadius: '50%', pointerEvents: 'none',
          boxShadow: 'inset 0 0 30px rgba(52,211,153,0.06), 0 0 30px rgba(52,211,153,0.05)',
        }} />

        {/* Felt */}
        <div style={{
          position: 'absolute', inset: 6, borderRadius: '50%', overflow: 'hidden',
          background: 'radial-gradient(ellipse 110% 110% at 50% 42%, #1e8e52 0%, #166e3e 30%, #105630 60%, #0a3b22 100%)',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4)',
        }}>
          {/* Felt texture */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '5px 5px', pointerEvents: 'none' }} />

          {/* Decorative chips */}
          <div style={{ position: 'absolute', top: '38%', left: '20%', display: 'flex', gap: 2 }}>
            {['#ef4444','#3b82f6','#8b5cf6'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.15)', boxShadow: `0 0 3px ${c}44`, marginTop: i % 2 ? -2 : 0 }} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: '38%', right: '20%', display: 'flex', gap: 2 }}>
            {['#f59e0b','#22c55e','#f59e0b'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.15)', boxShadow: `0 0 3px ${c}44`, marginTop: i % 2 ? -2 : 0 }} />
            ))}
          </div>

          {/* POT */}
          <div style={{ position: 'absolute', top: '26%', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
            <div ref={potRef} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
              padding: '5px 18px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{ color: '#86efac', fontWeight: 900, fontSize: 14, letterSpacing: 1, textShadow: '0 0 8px rgba(52,211,153,0.6)' }}>
                POT: ₹{pot.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Community cards */}
          <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 5 }}>
            {communityCards.map((c, i) => (
              <AnimatedCard 
                key={`${c.value}${c.suit}`} 
                card={c} 
                width={52} height={74} 
                dealFrom={i >= prevCommCount.current ? dealerPos : undefined}
                dealDelay={(i - prevCommCount.current) * 0.15}
                flipDelay={0.4}
              />
            ))}
            {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
              <div key={`e${i}`} style={{ width: 52, height: 74, borderRadius: 6, border: '2px dashed rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.08)' }} />
            ))}
          </div>

          {/* Hand evaluation badge — shown above community cards */}
          {handDescription && (
            <div style={{
              position: 'absolute', top: '72%', left: '50%', transform: 'translateX(-50%)', zIndex: 6,
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                padding: '4px 14px', borderRadius: 16, border: `1px solid ${handColor || '#475569'}40`,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: handColor || '#475569' }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: handColor || '#94a3b8', letterSpacing: 0.5 }}>
                  {handDescription}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Player pods ── */}
      {players.map((p, i) => p && (
        <div key={p.id} style={{ ...SEAT_POS[i], zIndex: 10 }}>
          <PlayerPod player={p} onThrowAt={onThrowAt} />
        </div>
      ))}
    </div>
  );
};
