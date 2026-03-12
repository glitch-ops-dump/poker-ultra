import React, { useState, useEffect, useCallback } from 'react';

/* ═══ Throwable Animation System ═══
 * Renders animated projectiles thrown between players.
 * Supported: snowball, fireworks, laughing emoji, thumbs up, tomato
 */

export interface ThrowableItem {
  id: string;
  type: 'snowball' | 'fireworks' | 'laughing' | 'thumbsup' | 'tomato';
  fromSeat: number;  // seat index of thrower
  toSeat: number;    // seat index of target
}

const ITEM_EMOJI: Record<string, string> = {
  snowball: '❄️',
  fireworks: '🎆',
  laughing: '😂',
  thumbsup: '👍',
  tomato: '🍅',
};

const SPLASH_EMOJI: Record<string, string> = {
  snowball: '💥',
  fireworks: '✨🎇✨',
  laughing: '🤣🤣🤣',
  thumbsup: '👍👍',
  tomato: '💦',
};

/* Seat positions (center of each pod) relative to the table container */
const SEAT_CENTERS: Record<number, { x: string; y: string }> = {
  0: { x: '50%', y: '5%' },
  1: { x: '88%', y: '18%' },
  2: { x: '88%', y: '72%' },
  3: { x: '50%', y: '92%' },
  4: { x: '12%', y: '72%' },
  5: { x: '12%', y: '18%' },
};

const ThrowableAnimation: React.FC<{
  item: ThrowableItem;
  onComplete: (id: string) => void;
}> = ({ item, onComplete }) => {
  const [phase, setPhase] = useState<'flying' | 'splash' | 'done'>('flying');

  const from = SEAT_CENTERS[item.fromSeat] || SEAT_CENTERS[3];
  const to = SEAT_CENTERS[item.toSeat] || SEAT_CENTERS[0];

  useEffect(() => {
    const flyTimer = setTimeout(() => setPhase('splash'), 600);
    const splashTimer = setTimeout(() => {
      setPhase('done');
      onComplete(item.id);
    }, 1600);
    return () => { clearTimeout(flyTimer); clearTimeout(splashTimer); };
  }, [item.id, onComplete]);

  if (phase === 'done') return null;

  if (phase === 'splash') {
    return (
      <div style={{
        position: 'absolute', left: to.x, top: to.y,
        transform: 'translate(-50%, -50%)',
        zIndex: 100, pointerEvents: 'none',
        animation: 'splashPop 1s ease-out forwards',
      }}>
        <span style={{ fontSize: 48, filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.5))' }}>
          {SPLASH_EMOJI[item.type]}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', zIndex: 100, pointerEvents: 'none',
      left: from.x, top: from.y,
      transform: 'translate(-50%, -50%)',
      animation: `throwTo_${item.id} 0.6s cubic-bezier(0.2,0.8,0.3,1) forwards`,
    }}>
      <span style={{
        fontSize: 36,
        display: 'inline-block',
        animation: 'spin 0.6s linear',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
      }}>
        {ITEM_EMOJI[item.type]}
      </span>

      {/* Inject keyframes for this specific throw */}
      <style>{`
        @keyframes throwTo_${item.id} {
          0% { left: ${from.x}; top: ${from.y}; opacity: 1; transform: translate(-50%,-50%) scale(0.5); }
          50% { transform: translate(-50%,-80%) scale(1.2); }
          100% { left: ${to.x}; top: ${to.y}; opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes splashPop {
          0% { transform: translate(-50%,-50%) scale(0.3); opacity: 1; }
          30% { transform: translate(-50%,-50%) scale(1.8); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

/* ═══ Throwable Manager ═══ */

// ThrowableLayer must be a standalone component exported at module level — never defined inside a hook.
export const ThrowableLayer: React.FC<{ items: ThrowableItem[]; onRemove: (id: string) => void }> = ({ items, onRemove }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
    {items.map(item => (
      <ThrowableAnimation key={item.id} item={item} onComplete={onRemove} />
    ))}
  </div>
);

export const useThrowables = () => {
  const [items, setItems] = useState<ThrowableItem[]>([]);

  const throwItem = useCallback((type: ThrowableItem['type'], fromSeat: number, toSeat: number) => {
    const id = `throw_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setItems(prev => [...prev, { id, type, fromSeat, toSeat }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  return { throwItem, items, removeItem };
};


/* ═══ Throwable Picker Menu ═══ */
export const ThrowPicker: React.FC<{
  targetSeat: number;
  heroSeat: number;
  onThrow: (type: ThrowableItem['type'], fromSeat: number, toSeat: number) => void;
  onClose: () => void;
}> = ({ targetSeat, heroSeat, onThrow, onClose }) => {
  const items: { type: ThrowableItem['type']; label: string; emoji: string }[] = [
    { type: 'snowball', label: 'Snowball', emoji: '❄️' },
    { type: 'fireworks', label: 'Fireworks', emoji: '🎆' },
    { type: 'laughing', label: 'Laugh', emoji: '😂' },
    { type: 'thumbsup', label: 'Nice!', emoji: '👍' },
    { type: 'tomato', label: 'Tomato', emoji: '🍅' },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
      padding: 8, display: 'flex', gap: 4, zIndex: 50,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map(i => (
        <button key={i.type} onClick={() => { onThrow(i.type, heroSeat, targetSeat); onClose(); }}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
            padding: '6px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ fontSize: 22 }}>{i.emoji}</span>
          <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>{i.label}</span>
        </button>
      ))}
      <button onClick={onClose} style={{
        position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%',
        background: '#475569', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
    </div>
  );
};
