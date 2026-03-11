import React from 'react';

/* ═══ Types ═══ */
export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  faceDown?: boolean;
}

/* ═══ Suit config ═══ */
const SUIT_CFG: Record<string, { sym: string; color: string; fill: string }> = {
  hearts:   { sym: '♥', color: '#dc2626', fill: '#fef2f2' },
  diamonds: { sym: '♦', color: '#dc2626', fill: '#fef2f2' },
  clubs:    { sym: '♣', color: '#1e293b', fill: '#f8fafc' },
  spades:   { sym: '♠', color: '#1e293b', fill: '#f8fafc' },
};

/* Face card crown/symbols */
const FACE_ICON: Record<string, string> = {
  'K': '♚',
  'Q': '♛',
  'J': '♞',
  'A': '★',
};

const FACE_LABEL: Record<string, string> = {
  'K': 'KING',
  'Q': 'QUEEN',
  'J': 'JACK',
  'A': 'ACE',
};

/* ═══ Premium Playing Card ═══ */
interface CardProps {
  card: Card;
  width?: number;
  height?: number;
}

export const PlayingCard: React.FC<CardProps> = ({ card, width = 56, height = 80 }) => {
  if (card.faceDown) {
    return (
      <div style={{
        width, height, borderRadius: width * 0.1,
        background: 'linear-gradient(135deg, #1e3a5f 0%, #172554 100%)',
        border: '2px solid #334155',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Cross-hatch pattern */}
        <div style={{
          position: 'absolute', inset: 4, borderRadius: width * 0.06,
          border: '1px solid rgba(255,255,255,0.08)',
          background: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px),
                       repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 6px)`,
        }} />
        {/* Center logo */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: width * 0.45, height: width * 0.45, borderRadius: '50%',
          background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: width * 0.2, color: 'rgba(96,165,250,0.4)',
        }}>♠</div>
      </div>
    );
  }

  const s = SUIT_CFG[card.suit];
  const isFace = ['K', 'Q', 'J'].includes(card.value);
  const isAce = card.value === 'A';
  const faceIcon = FACE_ICON[card.value];
  const fontSize = width * 0.28;

  return (
    <div style={{
      width, height, borderRadius: width * 0.1,
      background: isFace
        ? `linear-gradient(160deg, #fff 0%, ${s.fill} 100%)`
        : '#ffffff',
      border: `1.5px solid ${isFace ? s.color + '30' : '#d1d5db'}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top-left corner */}
      <div style={{ padding: `${width * 0.06}px ${width * 0.1}px`, lineHeight: 1 }}>
        <div style={{ color: s.color, fontWeight: 900, fontSize: fontSize, lineHeight: 1 }}>{card.value}</div>
        <div style={{ color: s.color, fontSize: fontSize * 0.75, lineHeight: 1, marginTop: 1 }}>{s.sym}</div>
      </div>

      {/* Center area */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {isFace ? (
          /* Face card — large crown/knight icon with decorative border */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          }}>
            <span style={{
              fontSize: width * 0.45, color: s.color, lineHeight: 1,
              textShadow: `0 2px 4px ${s.color}22`,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
            }}>{faceIcon}</span>
            <span style={{
              fontSize: 6, fontWeight: 800, letterSpacing: 1.5, color: s.color,
              textTransform: 'uppercase', opacity: 0.5, marginTop: 2,
            }}>{FACE_LABEL[card.value]}</span>
          </div>
        ) : isAce ? (
          /* Ace — large centered suit */
          <span style={{
            fontSize: width * 0.55, color: s.color, lineHeight: 1,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
          }}>{s.sym}</span>
        ) : (
          /* Number cards — suit pattern */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2,
          }}>
            <span style={{ fontSize: width * 0.4, color: s.color, lineHeight: 1 }}>{s.sym}</span>
          </div>
        )}

        {/* Decorative line for face cards */}
        {isFace && (
          <div style={{
            position: 'absolute', left: '15%', right: '15%', top: '20%',
            height: 1, background: `linear-gradient(90deg, transparent, ${s.color}20, transparent)`,
          }} />
        )}
      </div>

      {/* Bottom-right corner (inverted) */}
      <div style={{
        padding: `${width * 0.06}px ${width * 0.1}px`, lineHeight: 1,
        alignSelf: 'flex-end', transform: 'rotate(180deg)',
      }}>
        <div style={{ color: s.color, fontWeight: 900, fontSize: fontSize, lineHeight: 1 }}>{card.value}</div>
        <div style={{ color: s.color, fontSize: fontSize * 0.75, lineHeight: 1, marginTop: 1 }}>{s.sym}</div>
      </div>

      {/* Subtle shine overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};
