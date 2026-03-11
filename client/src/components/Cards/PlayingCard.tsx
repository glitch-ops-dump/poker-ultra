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
        ? `linear-gradient(160deg, #fafafa 0%, ${s.fill} 100%)`
        : `linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)`,
      border: `2px solid ${isFace ? s.color + '30' : '#cbd5e1'}`,
      boxShadow: '0 6px 16px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.2)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Inner border (premium card bleed) */}
      <div style={{
        position: 'absolute', inset: Math.max(2, width * 0.06),
        borderRadius: width * 0.05,
        border: `1px solid ${isFace ? s.color + '40' : '#e2e8f0'}`,
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Top-left corner */}
      <div style={{ padding: `${width * 0.08}px ${width * 0.12}px`, lineHeight: 1, zIndex: 2 }}>
        <div style={{ color: s.color, fontWeight: 900, fontSize: fontSize, lineHeight: 1, textShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>{card.value}</div>
        <div style={{ color: s.color, fontSize: fontSize * 0.8, lineHeight: 1, marginTop: 1, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}>{s.sym}</div>
      </div>

      {/* Center area */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 2,
      }}>
        {isFace ? (
          /* Face card — large crown/knight icon with decorative border */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          }}>
            <span style={{
              fontSize: width * 0.45, color: s.color, lineHeight: 1,
              textShadow: `0 2px 4px ${s.color}44`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
            }}>{faceIcon}</span>
            <span style={{
              fontSize: width * 0.1, fontWeight: 800, letterSpacing: 1.5, color: s.color,
              textTransform: 'uppercase', opacity: 0.6, marginTop: 2,
            }}>{FACE_LABEL[card.value]}</span>
          </div>
        ) : isAce ? (
          /* Ace — large centered suit */
          <span style={{
            fontSize: width * 0.6, color: s.color, lineHeight: 1,
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
          }}>{s.sym}</span>
        ) : (
          /* Number cards — suit pattern */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
          }}>
            <span style={{ fontSize: width * 0.45, color: s.color, lineHeight: 1 }}>{s.sym}</span>
          </div>
        )}

        {/* Decorative line for face cards */}
        {isFace && (
          <div style={{
            position: 'absolute', left: '15%', right: '15%', top: '20%',
            height: 1.5, background: `linear-gradient(90deg, transparent, ${s.color}30, transparent)`,
          }} />
        )}
      </div>

      {/* Bottom-right corner (inverted) */}
      <div style={{
        padding: `${width * 0.08}px ${width * 0.12}px`, lineHeight: 1,
        alignSelf: 'flex-end', transform: 'rotate(180deg)', zIndex: 2,
      }}>
        <div style={{ color: s.color, fontWeight: 900, fontSize: fontSize, lineHeight: 1, textShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>{card.value}</div>
        <div style={{ color: s.color, fontSize: fontSize * 0.8, lineHeight: 1, marginTop: 1, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}>{s.sym}</div>
      </div>

      {/* Subtle shine overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
        pointerEvents: 'none', zIndex: 3,
      }} />
    </div>
  );
};
