import React from 'react';

/* ═══ Types ═══ */
export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  faceDown?: boolean;
}

/* ═══ Suit config ═══ */
const SUIT_CFG: Record<string, { sym: string; color: string; fill: string; borderFill: string }> = {
  hearts:   { sym: '♥', color: '#c0392b', fill: '#fff8f8', borderFill: '#e8c0c0' },
  diamonds: { sym: '♦', color: '#c0392b', fill: '#fff8f5', borderFill: '#e8c0b0' },
  clubs:    { sym: '♣', color: '#1a1a2e', fill: '#f8fafc', borderFill: '#c0c8d8' },
  spades:   { sym: '♠', color: '#1a1a2e', fill: '#f8fafc', borderFill: '#c8d0e0' },
};

/* ═══ SVG Face Card Art ═══ */

const KingSVG: React.FC<{ suit: string; color: string }> = ({ suit, color }) => {
  const isRed = color === '#c0392b';
  const robeColor = isRed ? '#8B0000' : '#1a1a2e';
  const crownJewel = isRed ? '#ff4400' : '#a0a8c0';
  const crownGem = isRed ? '#ffd700' : '#c0c8d8';
  const suitSym = SUIT_CFG[suit]?.sym || '♠';

  return (
    <svg viewBox="0 0 56 78" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="56" height="78" fill={isRed ? '#fff8f5' : '#f8fafc'} rx="3"/>
      <rect x="3" y="3" width="50" height="72" fill="none" stroke={isRed ? '#e8c0b0' : '#c8d0e0'} strokeWidth="0.8" rx="2"/>
      {/* Crown */}
      <rect x="13" y="18" width="30" height="5" fill={robeColor} rx="1.5"/>
      <rect x="15" y="8" width="4" height="11" fill={robeColor} rx="1" opacity="0.9"/>
      <rect x="26" y="5" width="4" height="14" fill={robeColor} rx="1"/>
      <rect x="37" y="8" width="4" height="11" fill={robeColor} rx="1" opacity="0.9"/>
      <circle cx="17" cy="8" r="2.5" fill={crownGem}/>
      <circle cx="28" cy="5" r="2.8" fill={crownJewel}/>
      <circle cx="39" cy="8" r="2.5" fill={crownGem}/>
      {/* Face */}
      <ellipse cx="28" cy="33" rx="10" ry="12" fill="#f0c89a"/>
      <ellipse cx="28" cy="42" rx="8" ry="5" fill="#c09060" opacity="0.3"/>
      <path d="M 21 27 Q 25 24 29 26" stroke="#5a3820" strokeWidth="1.5" fill="none"/>
      <path d="M 27 26 Q 31 24 35 27" stroke="#5a3820" strokeWidth="1.5" fill="none"/>
      <ellipse cx="23.5" cy="30" rx="2" ry="1.5" fill="#1a0e08"/>
      <ellipse cx="32.5" cy="30" rx="2" ry="1.5" fill="#1a0e08"/>
      <path d="M 26 36 Q 28 39 30 36" stroke="#b07040" strokeWidth="1" fill="none"/>
      <path d="M 22.5 42 Q 28 45 33.5 42" stroke="#803020" strokeWidth="1.2" fill="none"/>
      <path d="M 22.5 39.5 Q 28 37.5 33.5 39.5" stroke="#704020" strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Robes */}
      <path d="M 17 46 L 15 64 L 41 64 L 39 46 Q 34 51 28 52 Q 22 51 17 46 Z" fill={robeColor} opacity="0.8"/>
      <rect x="25" y="47" width="6" height="17" fill="rgba(255,200,0,0.2)" rx="1"/>
      <path d="M 17 46 Q 22 51 28 52 Q 34 51 39 46" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none"/>
      {/* Suit accents */}
      <text x="8" y="73" fontSize="7" fill={color} opacity="0.4">{suitSym}</text>
      <text x="48" y="73" fontSize="7" fill={color} opacity="0.4" textAnchor="end">{suitSym}</text>
    </svg>
  );
};

const QueenSVG: React.FC<{ suit: string; color: string }> = ({ suit, color }) => {
  const isRed = color === '#c0392b';
  const crownColor = isRed ? '#8B0000' : '#2c1a4a';
  const dressColor = isRed ? '#6a0020' : '#2c1a4a';
  const gemColor = isRed ? '#e03050' : '#7928ca';
  const gemLight = isRed ? '#ff6080' : '#c084fc';
  const suitSym = SUIT_CFG[suit]?.sym || '♠';

  return (
    <svg viewBox="0 0 56 78" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="56" height="78" fill={isRed ? '#fff8f8' : '#f8f8fc'} rx="3"/>
      <rect x="3" y="3" width="50" height="72" fill="none" stroke={isRed ? '#e8c0c0' : '#c8d0e0'} strokeWidth="0.8" rx="2"/>
      {/* Crown */}
      <ellipse cx="28" cy="14" rx="15" ry="5" fill={crownColor} opacity="0.75"/>
      <circle cx="17" cy="10" r="3" fill={gemColor}/>
      <circle cx="24" cy="7" r="2.5" fill={gemLight} opacity="0.8"/>
      <circle cx="28" cy="6" r="3.2" fill={gemLight}/>
      <circle cx="32" cy="7" r="2.5" fill={gemLight} opacity="0.8"/>
      <circle cx="39" cy="10" r="3" fill={gemColor}/>
      <rect x="13" y="14" width="30" height="4" fill={crownColor} rx="1.5"/>
      {/* Face */}
      <ellipse cx="28" cy="32" rx="10" ry="12" fill="#f5d0b0"/>
      <path d="M 18 24 Q 16 18 28 17 Q 40 18 38 24" fill={dressColor} opacity="0.85"/>
      <path d="M 18 24 Q 15 33 17 40" fill={dressColor} opacity="0.65"/>
      <path d="M 38 24 Q 41 33 39 40" fill={dressColor} opacity="0.65"/>
      <path d="M 21 26 Q 25 23 29 25" stroke="#3a1a30" strokeWidth="1.3" fill="none"/>
      <path d="M 27 25 Q 31 23 35 26" stroke="#3a1a30" strokeWidth="1.3" fill="none"/>
      <ellipse cx="23.5" cy="29" rx="2.3" ry="1.7" fill="#1c1020"/>
      <ellipse cx="32.5" cy="29" rx="2.3" ry="1.7" fill="#1c1020"/>
      <circle cx="24.3" cy="28" r="0.8" fill="white" opacity="0.6"/>
      <circle cx="33.3" cy="28" r="0.8" fill="white" opacity="0.6"/>
      <path d="M 26.5 35 Q 28 37 29.5 35" stroke="#b07060" strokeWidth="0.9" fill="none"/>
      <path d="M 23 41 Q 28 44.5 33 41" stroke="#c04060" strokeWidth="1.3" fill="none"/>
      {/* Dress */}
      <path d="M 16 45 L 14 64 L 42 64 L 40 45 Q 34 51 28 52 Q 22 51 16 45 Z" fill={dressColor} opacity="0.82"/>
      <rect x="25" y="47" width="6" height="17" fill={isRed ? 'rgba(255,160,180,0.15)' : 'rgba(192,132,252,0.2)'} rx="1"/>
      <path d="M 16 45 Q 22 51 28 52 Q 34 51 40 45" stroke={isRed ? 'rgba(255,160,180,0.5)' : 'rgba(192,132,252,0.5)'} strokeWidth="2" fill="none"/>
      {/* Suit accents */}
      <text x="8" y="73" fontSize="7" fill={color} opacity="0.4">{suitSym}</text>
      <text x="48" y="73" fontSize="7" fill={color} opacity="0.4" textAnchor="end">{suitSym}</text>
    </svg>
  );
};

const JackSVG: React.FC<{ suit: string; color: string }> = ({ suit, color }) => {
  const isRed = color === '#c0392b';
  const hatColor = isRed ? '#6a0020' : '#1a1a3e';
  const tunicColor = isRed ? '#6a0020' : '#1a1a4a';
  const featherColor = isRed ? '#e03050' : '#c04020';
  const suitSym = SUIT_CFG[suit]?.sym || '♠';

  return (
    <svg viewBox="0 0 56 78" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="56" height="78" fill={isRed ? '#fff8f8' : '#f8fafc'} rx="3"/>
      <rect x="3" y="3" width="50" height="72" fill="none" stroke={isRed ? '#e8c0c0' : '#c0c8d8'} strokeWidth="0.8" rx="2"/>
      {/* Hat */}
      <path d="M 12 22 Q 16 8 28 6 Q 40 8 44 22 Z" fill={hatColor} opacity="0.85"/>
      <path d="M 40 16 Q 48 6 52 12 Q 46 10 44 18" fill={featherColor} opacity="0.8"/>
      <rect x="11" y="20" width="34" height="4" fill={hatColor} rx="2"/>
      {/* Face */}
      <ellipse cx="28" cy="33" rx="10" ry="11.5" fill="#f5d0b0"/>
      <ellipse cx="28" cy="41" rx="7.5" ry="4.5" fill="#d4a870" opacity="0.25"/>
      <path d="M 21.5 27.5 Q 25 25 29 27" stroke="#6a3820" strokeWidth="1.3" fill="none"/>
      <path d="M 27 27 Q 31 25 34.5 27.5" stroke="#6a3820" strokeWidth="1.3" fill="none"/>
      <ellipse cx="23.5" cy="30.5" rx="2.1" ry="1.6" fill="#2c1a10"/>
      <ellipse cx="32.5" cy="30.5" rx="2.1" ry="1.6" fill="#2c1a10"/>
      <path d="M 26 36 Q 28 38.5 30 36" stroke="#b07040" strokeWidth="1" fill="none"/>
      <path d="M 22 42 Q 28 47 34 42" stroke="#a03020" strokeWidth="1.3" fill="none"/>
      {/* Tunic */}
      <path d="M 18 45 L 15 64 L 41 64 L 38 45 Q 33 49 28 50 Q 23 49 18 45 Z" fill={tunicColor} opacity="0.85"/>
      <line x1="18" y1="46" x2="38" y2="62" stroke={isRed ? 'rgba(200,100,120,0.3)' : 'rgba(100,120,200,0.3)'} strokeWidth="1.5"/>
      <line x1="28" y1="45" x2="40" y2="60" stroke={isRed ? 'rgba(200,100,120,0.2)' : 'rgba(100,120,200,0.2)'} strokeWidth="1.5"/>
      {/* Lance */}
      <rect x="40" y="12" width="3.5" height="50" fill="#603010" rx="1" transform="rotate(5 41.5 37)"/>
      <path d="M 40 12 L 43.5 14 L 42 6 Z" fill="#808090"/>
      {/* Suit accents */}
      <text x="8" y="73" fontSize="7" fill={color} opacity="0.4">{suitSym}</text>
      <text x="48" y="73" fontSize="7" fill={color} opacity="0.4" textAnchor="end">{suitSym}</text>
    </svg>
  );
};

const AceSVG: React.FC<{ suit: string; color: string }> = ({ suit, color }) => {
  const s = SUIT_CFG[suit];
  const borderFill = s?.borderFill || '#c8d0e0';
  const suitSym = s?.sym || '♠';

  // Aces get ornate frames with a large centered suit
  if (suit === 'hearts') {
    return (
      <svg viewBox="0 0 56 78" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect width="56" height="78" fill="#fff8f8" rx="3"/>
        <rect x="4" y="4" width="48" height="70" fill="none" stroke="#e8c0c0" strokeWidth="1" rx="2.5"/>
        <rect x="7" y="7" width="42" height="64" fill="none" stroke="#f0d0d0" strokeWidth="0.6" rx="2"/>
        <path d="M 10 10 Q 13 7 16 10 Q 13 13 10 10 Z" fill="#e8c0c0"/>
        <path d="M 46 10 Q 43 7 40 10 Q 43 13 46 10 Z" fill="#e8c0c0"/>
        <path d="M 10 68 Q 13 71 16 68 Q 13 65 10 68 Z" fill="#e8c0c0"/>
        <path d="M 46 68 Q 43 71 40 68 Q 43 65 46 68 Z" fill="#e8c0c0"/>
        <circle cx="28" cy="42" r="18" fill="none" stroke="#f0c0c0" strokeWidth="0.5" opacity="0.6"/>
        <circle cx="28" cy="42" r="13" fill="none" stroke="#f0c0c0" strokeWidth="0.5" opacity="0.5"/>
        <path d="M 28 60 Q 8 48 8 34 Q 8 22 18 22 Q 23 22 28 28 Q 33 22 38 22 Q 48 22 48 34 Q 48 48 28 60 Z" fill="#c0392b" filter="url(#ace-shadow)"/>
        <path d="M 20 27 Q 25 24 28 30" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <defs><filter id="ace-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(192,57,43,0.4)"/></filter></defs>
      </svg>
    );
  }
  if (suit === 'diamonds') {
    return (
      <svg viewBox="0 0 56 78" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect width="56" height="78" fill="#fff8f5" rx="3"/>
        <rect x="4" y="4" width="48" height="70" fill="none" stroke="#e8c0b0" strokeWidth="1" rx="2.5"/>
        <rect x="7" y="7" width="42" height="64" fill="none" stroke="#f0d0c0" strokeWidth="0.6" rx="2"/>
        <path d="M 10 10 Q 13 7 16 10 Q 13 13 10 10 Z" fill="#e8c0b0"/>
        <path d="M 46 10 Q 43 7 40 10 Q 43 13 46 10 Z" fill="#e8c0b0"/>
        <path d="M 10 68 Q 13 71 16 68 Q 13 65 10 68 Z" fill="#e8c0b0"/>
        <path d="M 46 68 Q 43 71 40 68 Q 43 65 46 68 Z" fill="#e8c0b0"/>
        <circle cx="28" cy="42" r="18" fill="none" stroke="#f0d0c0" strokeWidth="0.5" opacity="0.6"/>
        <path d="M 28 18 L 48 42 L 28 66 L 8 42 Z" fill="#c0392b" filter="url(#ace-d-shadow)"/>
        <line x1="28" y1="18" x2="28" y2="66" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <line x1="8" y1="42" x2="48" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <path d="M 28 18 L 8 42 L 28 42 Z" fill="rgba(255,255,255,0.12)"/>
        <defs><filter id="ace-d-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(192,57,43,0.35)"/></filter></defs>
      </svg>
    );
  }
  // Spades / Clubs ace
  return (
    <svg viewBox="0 0 56 78" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="56" height="78" fill="#f8fafc" rx="3"/>
      <rect x="4" y="4" width="48" height="70" fill="none" stroke={borderFill} strokeWidth="1" rx="2.5"/>
      <rect x="7" y="7" width="42" height="64" fill="none" stroke={borderFill} strokeWidth="0.6" rx="2" opacity="0.7"/>
      <path d="M 10 10 Q 13 7 16 10 Q 13 13 10 10 Z" fill={borderFill} opacity="0.7"/>
      <path d="M 46 10 Q 43 7 40 10 Q 43 13 46 10 Z" fill={borderFill} opacity="0.7"/>
      <path d="M 10 68 Q 13 71 16 68 Q 13 65 10 68 Z" fill={borderFill} opacity="0.7"/>
      <path d="M 46 68 Q 43 71 40 68 Q 43 65 46 68 Z" fill={borderFill} opacity="0.7"/>
      <circle cx="28" cy="44" r="18" fill="none" stroke={color} strokeWidth="0.4" opacity="0.1"/>
      <circle cx="28" cy="44" r="13" fill="none" stroke={color} strokeWidth="0.4" opacity="0.1"/>
      <text x="28" y="56" fontSize="42" textAnchor="middle" fill={color} fontFamily="serif" opacity="0.95">{suitSym}</text>
    </svg>
  );
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
        background: 'linear-gradient(140deg, #1a2f5a 0%, #0f1e3c 100%)',
        border: '2px solid #2a4080',
        boxShadow: '0 6px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.3)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Cross-hatch pattern */}
        <div style={{
          position: 'absolute', inset: 4, borderRadius: width * 0.06,
          border: '1px solid rgba(255,255,255,0.07)',
          background: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.025) 3px, rgba(255,255,255,0.025) 6px),
                       repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 6px)`,
        }} />
        {/* Center logo */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          fontSize: width * 0.25, color: 'rgba(100,160,255,0.3)',
          fontFamily: "'Cinzel', serif",
        }}>♠</div>
      </div>
    );
  }

  const s = SUIT_CFG[card.suit];
  const isFace = ['K', 'Q', 'J'].includes(card.value);
  const isAce = card.value === 'A';
  const fontSize = width * 0.28;

  // Face cards and Aces get SVG art
  if (isFace || isAce) {
    return (
      <div style={{
        width, height, borderRadius: width * 0.1,
        background: `linear-gradient(135deg, #ffffff 0%, ${s.fill} 100%)`,
        border: `2px solid ${s.borderFill}`,
        boxShadow: '0 6px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.3)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Top-left corner */}
        <div style={{ padding: `${width * 0.07}px ${width * 0.1}px`, lineHeight: 1, zIndex: 2, flexShrink: 0 }}>
          <div style={{ color: s.color, fontWeight: 700, fontSize: fontSize, lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{card.value}</div>
          <div style={{ color: s.color, fontSize: fontSize * 0.8, lineHeight: 1, marginTop: 1 }}>{s.sym}</div>
        </div>

        {/* SVG Art center */}
        <div style={{ flex: 1, position: 'relative', zIndex: 2, overflow: 'hidden' }}>
          {card.value === 'K' && <KingSVG suit={card.suit} color={s.color} />}
          {card.value === 'Q' && <QueenSVG suit={card.suit} color={s.color} />}
          {card.value === 'J' && <JackSVG suit={card.suit} color={s.color} />}
          {card.value === 'A' && <AceSVG suit={card.suit} color={s.color} />}
        </div>

        {/* Bottom-right corner (inverted) */}
        <div style={{
          padding: `${width * 0.07}px ${width * 0.1}px`, lineHeight: 1,
          alignSelf: 'flex-end', transform: 'rotate(180deg)', zIndex: 2, flexShrink: 0,
        }}>
          <div style={{ color: s.color, fontWeight: 700, fontSize: fontSize, lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{card.value}</div>
          <div style={{ color: s.color, fontSize: fontSize * 0.8, lineHeight: 1, marginTop: 1 }}>{s.sym}</div>
        </div>

        {/* Shine overlay */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%)',
          pointerEvents: 'none', zIndex: 4,
        }} />
        {/* Inner border decoration */}
        <div style={{
          position: 'absolute', inset: Math.max(3, width * 0.06), borderRadius: width * 0.04,
          border: `1px solid rgba(0,0,0,0.06)`, pointerEvents: 'none', zIndex: 1,
        }} />
      </div>
    );
  }

  // Number cards — suit pattern
  return (
    <div style={{
      width, height, borderRadius: width * 0.1,
      background: `linear-gradient(135deg, #ffffff 0%, #f5f0e8 100%)`,
      border: `2px solid ${s.borderFill}`,
      boxShadow: '0 6px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.3)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Inner border */}
      <div style={{
        position: 'absolute', inset: Math.max(3, width * 0.06), borderRadius: width * 0.04,
        border: '1px solid rgba(0,0,0,0.06)', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Top-left corner */}
      <div style={{ padding: `${width * 0.08}px ${width * 0.12}px`, lineHeight: 1, zIndex: 2 }}>
        <div style={{ color: s.color, fontWeight: 700, fontSize: fontSize, lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{card.value}</div>
        <div style={{ color: s.color, fontSize: fontSize * 0.8, lineHeight: 1, marginTop: 1 }}>{s.sym}</div>
      </div>

      {/* Center pip */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <span style={{
          fontSize: width * 0.5, color: s.color, lineHeight: 1,
          filter: `drop-shadow(0 2px 4px ${s.color === '#c0392b' ? 'rgba(192,57,43,0.3)' : 'rgba(0,0,0,0.3)'})`,
        }}>{s.sym}</span>
      </div>

      {/* Bottom-right corner (inverted) */}
      <div style={{
        padding: `${width * 0.08}px ${width * 0.12}px`, lineHeight: 1,
        alignSelf: 'flex-end', transform: 'rotate(180deg)', zIndex: 2,
      }}>
        <div style={{ color: s.color, fontWeight: 700, fontSize: fontSize, lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{card.value}</div>
        <div style={{ color: s.color, fontSize: fontSize * 0.8, lineHeight: 1, marginTop: 1 }}>{s.sym}</div>
      </div>

      {/* Shine overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
        pointerEvents: 'none', zIndex: 3,
      }} />
    </div>
  );
};
