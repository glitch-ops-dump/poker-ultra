import React, { useState } from 'react';

/* ═══ Design Tokens ═══ */
const GOLD = '#d4a950';
const GOLD_DIM = 'rgba(212,169,80,0.06)';
const GOLD_BORDER = 'rgba(212,169,80,0.25)';
const PANEL_BG = '#131e30';
const TEXT_DIM = '#4a5a70';

interface Props {
  canCheck: boolean;
  minRaise: number;
  maxRaise: number;
  callAmount: number;
  pot: number;
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  onAllIn: () => void;
}

export const ActionControls: React.FC<Props> = ({
  canCheck, minRaise, maxRaise, callAmount, pot,
  onFold, onCheck, onCall, onRaise, onAllIn,
}) => {
  const [ra, setRa] = useState(minRaise);

  const btnStyle: React.CSSProperties = {
    flex: 1,
    height: 48,
    background: GOLD_DIM,
    border: `1.5px solid ${GOLD_BORDER}`,
    borderRadius: 8,
    color: GOLD,
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.18s',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  };

  const handleHover = (e: React.MouseEvent, enter: boolean) => {
    const el = e.currentTarget as HTMLElement;
    el.style.borderColor = enter ? GOLD : GOLD_BORDER;
    el.style.background = enter ? 'rgba(212,169,80,0.14)' : GOLD_DIM;
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      background: PANEL_BG,
      border: `1px solid ${GOLD_BORDER}`,
      borderRadius: 12, padding: 14, minWidth: 360,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {/* "Your Turn" header */}
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: 2.5, color: TEXT_DIM,
        paddingBottom: 8, borderBottom: `1px solid ${GOLD_BORDER}`,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{
          width: 4, height: 4, borderRadius: '50%', background: GOLD,
          animation: 'blink-dot 1.5s ease-in-out infinite',
        }} />
        Your Turn
        <style>{`@keyframes blink-dot { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
      </div>

      {/* Main buttons row (horizontal) */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onFold} style={btnStyle}
          onMouseEnter={e => handleHover(e, true)}
          onMouseLeave={e => handleHover(e, false)}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
          <span>FOLD</span>
          <span style={{ fontSize: 8, fontWeight: 500, opacity: 0.55, letterSpacing: 0.5, textTransform: 'none' }}>surrender</span>
        </button>

        {canCheck ? (
          <button onClick={onCheck} style={btnStyle}
            onMouseEnter={e => handleHover(e, true)}
            onMouseLeave={e => handleHover(e, false)}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
            <span>CHECK</span>
            <span style={{ fontSize: 8, fontWeight: 500, opacity: 0.55, letterSpacing: 0.5, textTransform: 'none' }}>₹0 to call</span>
          </button>
        ) : (
          <button onClick={onCall} style={btnStyle}
            onMouseEnter={e => handleHover(e, true)}
            onMouseLeave={e => handleHover(e, false)}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
            <span>CALL</span>
            <span style={{ fontSize: 8, fontWeight: 500, opacity: 0.55, letterSpacing: 0.5, textTransform: 'none' }}>₹{callAmount.toLocaleString()}</span>
          </button>
        )}

        <button onClick={() => onRaise(ra)} style={btnStyle}
          onMouseEnter={e => handleHover(e, true)}
          onMouseLeave={e => handleHover(e, false)}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
          <span>RAISE</span>
          <span style={{ fontSize: 8, fontWeight: 500, opacity: 0.55, letterSpacing: 0.5, textTransform: 'none' }}>₹{ra.toLocaleString()}</span>
        </button>

        <button onClick={onAllIn} style={btnStyle}
          onMouseEnter={e => handleHover(e, true)}
          onMouseLeave={e => handleHover(e, false)}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
          <span>ALL-IN</span>
        </button>
      </div>

      {/* Raise slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: TEXT_DIM }}>Raise to</span>
        <input type="range" min={minRaise} max={maxRaise} value={ra}
          onChange={e => setRa(Number(e.target.value))}
          style={{
            flex: 1, height: 3, borderRadius: 2,
            background: `linear-gradient(90deg, ${GOLD} ${((ra - minRaise) / (maxRaise - minRaise || 1)) * 100}%, rgba(255,255,255,0.1) ${((ra - minRaise) / (maxRaise - minRaise || 1)) * 100}%)`,
            outline: 'none', cursor: 'pointer',
            WebkitAppearance: 'none',
          }} />
        <span style={{
          fontSize: 16, fontWeight: 800, color: GOLD,
          fontFamily: "'Cinzel', serif", minWidth: 80, textAlign: 'right',
        }}>₹{ra.toLocaleString()}</span>
      </div>

      {/* Preset buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
        {[['Min', minRaise], ['½ Pot', Math.min(Math.floor(pot / 2), maxRaise)], ['Pot', Math.min(pot, maxRaise)], ['All-In', maxRaise]].map(([l, v]) => (
          <button key={l as string} onClick={() => setRa(v as number)}
            style={{
              background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 5, padding: '4px 2px', fontSize: 10, fontWeight: 600,
              color: '#7a8fa8', cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; e.currentTarget.style.background = 'rgba(212,169,80,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#7a8fa8'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            {l as string}
          </button>
        ))}
      </div>
    </div>
  );
};
