import React, { useRef, useEffect } from 'react';
import { type Card } from '../Cards/PlayingCard';
import { AnimatedCard, usePotPulse, FlyingChip } from '../Cards/AnimatedCard';
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

/* ═══ Design Tokens (Gold Premium Theme) ═══ */
const GOLD = '#d4a950';
const GOLD_BORDER = 'rgba(212,169,80,0.25)';
const PANEL_BG = '#131e30';
const TEXT = '#e8ddc8';
const TEXT_MUTED = '#7a8fa8';

/* ═══ Config ═══ */
const AVATAR_BG = ['#1e3a6e','#1e4a2e','#4a1e1e','#3a1e4a','#4a3a1e','#1e4a4a'];
const AVATAR_FG = ['#6ba3f0','#5ec97a','#f07070','#b07af0','#f0c060','#60e0f0'];

/* Seat positions relative to the table container */
const SEAT_POS: Record<number, React.CSSProperties> = {
  0: { position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)' },
  1: { position: 'absolute', top: '15%',   right: '-100px' },
  2: { position: 'absolute', bottom: '15%', right: '-100px' },
  3: { position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)' },
  4: { position: 'absolute', bottom: '15%', left: '-100px' },
  5: { position: 'absolute', top: '15%',   left: '-100px' },
};

/* ═══ Chip Denomination Colors (LOCKED FOREVER) ═══ */
const CHIP_DENOMS = [
  { value: 5000, color: 'linear-gradient(180deg, #f472b6, #db2777)', label: '₹5k' },
  { value: 1000, color: 'linear-gradient(180deg, #fbbf24, #d97706)', label: '₹1k' },
  { value: 500,  color: 'linear-gradient(180deg, #a855f7, #7e22ce)', label: '₹500' },
  { value: 100,  color: 'linear-gradient(180deg, #374151, #111827)', label: '₹100', border: true },
  { value: 25,   color: 'linear-gradient(180deg, #22c55e, #15803d)', label: '₹25' },
  { value: 10,   color: 'linear-gradient(180deg, #3b82f6, #1d4ed8)', label: '₹10' },
  { value: 5,    color: 'linear-gradient(180deg, #e74c3c, #c0392b)', label: '₹5' },
  { value: 1,    color: 'linear-gradient(180deg, #e8e8e8, #c8c8c8)', label: '₹1' },
];

function potToChips(amount: number): { color: string; count: number; label: string; border?: boolean }[] {
  const stacks: { color: string; count: number; label: string; border?: boolean }[] = [];
  let remaining = amount;
  for (const d of CHIP_DENOMS) {
    const count = Math.floor(remaining / d.value);
    if (count > 0) {
      stacks.push({ color: d.color, count: Math.min(count, 8), label: `×${count} ${d.label}`, border: d.border });
      remaining -= count * d.value;
    }
  }
  return stacks;
}

/* ═══ Chip Legend ═══ */
const CHIP_LEGEND = [
  { color: '#e8e8e8', label: '₹1' },
  { color: '#e74c3c', label: '₹5' },
  { color: '#3b82f6', label: '₹10' },
  { color: '#22c55e', label: '₹25' },
  { color: '#374151', label: '₹100' },
  { color: '#a855f7', label: '₹500' },
  { color: '#fbbf24', label: '₹1k' },
  { color: '#f472b6', label: '₹5k' },
];

/* ═══ Poker Chip Stack Component ═══ */
const ChipStack: React.FC<{ chipColor: string; count: number; label: string; hasBorder?: boolean }> = ({ chipColor, count, label, hasBorder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          width: 22, height: 8, borderRadius: 11, position: 'relative',
          background: chipColor, marginTop: i > 0 ? -4 : 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          border: hasBorder ? '1px solid rgba(255,255,255,0.12)' : 'none',
        }}>
          <div style={{ position: 'absolute', inset: '1px 3px', borderRadius: 10, background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ position: 'absolute', left: 2, right: 2, top: '50%', transform: 'translateY(-50%)', height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.3)' }} />
        </div>
      ))}
    </div>
    <div style={{ fontSize: 9, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 0.5, fontFamily: "'Inter', sans-serif" }}>{label}</div>
  </div>
);

/* ═══ Player Pod (Gold Premium) ═══ */
const PlayerPod: React.FC<{
  player: Player;
  onThrowAt?: (seatIndex: number) => void;
  dealerPos?: { x: number; y: number };
}> = ({ player, onThrowAt, dealerPos }) => {
  const folded = player.status === 'fold';
  const thinking = player.status === 'thinking';
  const bgColor = AVATAR_BG[player.seatIndex % AVATAR_BG.length];
  const fgColor = AVATAR_FG[player.seatIndex % AVATAR_FG.length];
  const chipStr = player.chips >= 1000 ? `₹${Math.round(player.chips / 1000)}k` : `₹${player.chips}`;

  const prevCards = useRef<string | null>(null);
  const cardKey = player.cards ? player.cards.map(c => c.value + c.suit).join() : null;
  const isNewDeal = cardKey !== null && cardKey !== prevCards.current;

  useEffect(() => {
    prevCards.current = cardKey;
  }, [cardKey]);

  return (
    <div style={{ opacity: folded ? 0.4 : 1, transition: 'opacity 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, filter: folded ? 'grayscale(0.7)' : 'none' }}>
      {/* Pod body */}
      <div
        onClick={() => !player.isHero && onThrowAt?.(player.seatIndex)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px', borderRadius: 10,
          background: player.isHero ? 'rgba(19,30,48,0.95)' : PANEL_BG,
          border: thinking
            ? `1.5px solid ${GOLD}`
            : player.isHero
              ? `1px solid rgba(212,169,80,0.5)`
              : `1px solid ${GOLD_BORDER}`,
          boxShadow: thinking
            ? `0 0 0 2px rgba(212,169,80,0.3), 0 4px 16px rgba(0,0,0,0.5)`
            : '0 4px 16px rgba(0,0,0,0.5)',
          minWidth: 120, cursor: player.isHero ? 'default' : 'pointer',
          transition: 'all 0.3s',
          animation: thinking ? 'pulse-border 1.5s ease-in-out infinite' : 'none',
        }}
      >
        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: fgColor, fontWeight: 800, fontSize: 13,
            border: `2px solid ${fgColor}20`,
          }}>
            {player.name.charAt(0).toUpperCase()}
          </div>
          {player.isDealer && (
            <div style={{
              position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: '50%',
              background: GOLD, color: '#000', fontSize: 8, fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}>D</div>
          )}
        </div>

        {/* Name + chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 700,
            color: player.isHero ? GOLD : TEXT,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80,
          }}>{player.name}</div>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>{chipStr}</div>
        </div>
      </div>

      {/* Status badge */}
      {player.status && player.status !== 'thinking' && (
        <span style={{
          fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
          padding: '1px 5px', borderRadius: 3,
          background: player.status === 'fold' ? 'rgba(200,50,50,0.15)' : player.status === 'all-in' ? 'rgba(244,90,30,0.15)' : 'rgba(212,169,80,0.15)',
          color: player.status === 'fold' ? '#e05555' : player.status === 'all-in' ? '#f0801a' : GOLD,
        }}>{player.status}</span>
      )}

      {/* Thinking dots */}
      {thinking && (
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: '50%', background: GOLD,
              animation: `pulse 0.8s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
          <style>{`
            @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
            @keyframes pulse-border { 0%,100% { box-shadow: 0 0 0 2px rgba(212,169,80,0.3), 0 4px 16px rgba(0,0,0,0.5); } 50% { box-shadow: 0 0 0 3px rgba(212,169,80,0.6), 0 4px 20px rgba(0,0,0,0.6); } }
          `}</style>
        </div>
      )}

      {/* Cards */}
      {player.cards && (
        <div style={{
          display: 'flex', gap: 4, marginTop: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: folded ? 'translateY(10px) scale(0.9)' : 'translateY(0) scale(1)',
          filter: folded ? 'grayscale(100%) brightness(0.6)' : 'none',
        }}>
          {player.isHero ? (
            <>
              <AnimatedCard card={player.cards[0]} width={44} height={62} dealFrom={isNewDeal ? dealerPos : undefined} dealDelay={0.1} flipDelay={0.4} />
              <AnimatedCard card={player.cards[1]} width={44} height={62} dealFrom={isNewDeal ? dealerPos : undefined} dealDelay={0.25} flipDelay={0.4} />
            </>
          ) : (
            <>
              <AnimatedCard card={{ ...player.cards[0], faceDown: true }} width={32} height={45} faceDown={true} dealFrom={isNewDeal ? dealerPos : undefined} dealDelay={player.seatIndex * 0.1} />
              <AnimatedCard card={{ ...player.cards[1], faceDown: true }} width={32} height={45} faceDown={true} dealFrom={isNewDeal ? dealerPos : undefined} dealDelay={player.seatIndex * 0.1 + 0.05} />
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
  potWinners?: { seatIndex: number; amount: number }[] | null;
  handDescription?: string;
  handColor?: string;
  onThrowAt?: (seatIndex: number) => void;
}

export const GameTable: React.FC<TableProps> = ({
  players, communityCards, pot, potWinners, handDescription, handColor, onThrowAt,
}) => {
  const potRef = usePotPulse(pot);
  const chipStacks = potToChips(pot);

  const dealerSeat = players.find(p => p?.isDealer);
  const dealerPos = dealerSeat ? {
    x: dealerSeat.seatIndex === 0 || dealerSeat.seatIndex === 3 ? 0 : (dealerSeat.seatIndex < 3 ? 400 : -400),
    y: dealerSeat.seatIndex < 3 ? -200 : 200,
  } : undefined;

  const prevCommCount = useRef(communityCards.length);
  useEffect(() => {
    prevCommCount.current = communityCards.length;
  }, [communityCards.length]);

  return (
    <div style={{ position: 'relative', width: '75vw', maxWidth: 950, aspectRatio: '950 / 520' }}>
      {/* ── Outer rail (gold-trimmed) ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'linear-gradient(160deg, #2a1a0a 0%, #1a100a 50%, #2a1a0a 100%)',
        border: '3px solid rgba(212,169,80,0.45)',
        boxShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.6), 0 0 0 6px rgba(212,169,80,0.1), 0 0 0 12px rgba(0,0,0,0.3)',
      }}>
        {/* Felt */}
        <div style={{
          position: 'absolute', inset: 12, borderRadius: '50%', overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 40%, #1e6b34 0%, #1a5c2e 40%, #134521 100%)',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4), inset 0 0 80px rgba(0,0,0,0.2)',
        }}>
          {/* Felt texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.06,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 4L4 0M-1 1L1 -1M3 5L5 3' stroke='%23000' stroke-width='0.5' opacity='0.06'/%3E%3C/svg%3E")`,
            borderRadius: 'inherit', pointerEvents: 'none',
          }} />
          {/* Inner ring */}
          <div style={{
            position: 'absolute', inset: 10, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none',
          }} />

          {/* POT with chip stacks */}
          <div style={{ position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#4a5a70' }}>Total Pot</div>
            <div ref={potRef} style={{
              fontSize: 18, fontWeight: 800, color: GOLD, letterSpacing: 0.5,
              textShadow: '0 0 16px rgba(212,169,80,0.5)',
              fontFamily: "'Cinzel', serif",
            }}>
              ₹{pot.toLocaleString()}
            </div>
            {/* Chip stacks */}
            {chipStacks.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                {chipStacks.map((s, i) => (
                  <ChipStack key={i} chipColor={s.color} count={s.count} label={s.label} hasBorder={s.border} />
                ))}
              </div>
            )}
          </div>

          {/* Pot Win Flying Chips */}
          {potWinners && potWinners.map((w, iter) => {
            const visualIdx = players.findIndex(p => p?.seatIndex === w.seatIndex);
            if (visualIdx === -1) return null;
            const WIN_TARGET: Record<number, { x: number, y: number }> = {
              0: { x: 0, y: -180 }, 1: { x: 320, y: -100 }, 2: { x: 320, y: 150 },
              3: { x: 0, y: 220 }, 4: { x: -320, y: 150 }, 5: { x: -320, y: -100 },
            };
            const target = WIN_TARGET[visualIdx] || { x: 0, y: 0 };
            return (
              <div key={`win-${iter}`} style={{ position: 'absolute', top: '26%', left: '50%', zIndex: 50 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <FlyingChip key={i} delay={i * 0.1} targetX={target.x} targetY={target.y} color={GOLD} />
                ))}
              </div>
            );
          })}

          {/* Community cards */}
          <div style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 5 }}>
            {communityCards.map((c, i) => (
              <AnimatedCard
                key={`${c.value}${c.suit}`}
                card={c} width={60} height={84}
                dealFrom={i >= prevCommCount.current ? dealerPos : undefined}
                dealDelay={(i - prevCommCount.current) * 0.15}
                flipDelay={0.4}
              />
            ))}
            {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
              <div key={`e${i}`} style={{ width: 60, height: 84, borderRadius: 7, border: '2px dashed rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.08)' }} />
            ))}
          </div>

          {/* Hand evaluation badge */}
          {handDescription && (
            <div style={{ position: 'absolute', top: '76%', left: '50%', transform: 'translateX(-50%)', zIndex: 6 }}>
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

      {/* ── Chip legend ── */}
      <div style={{
        position: 'absolute', bottom: -35, right: 0,
        display: 'flex', gap: 5, alignItems: 'center',
        background: 'rgba(7,13,26,0.7)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 6, padding: '5px 8px',
      }}>
        {CHIP_LEGEND.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, border: '1px solid rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: 9, color: '#4a5a70', fontWeight: 600 }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
