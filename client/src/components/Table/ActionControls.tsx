import React, { useState } from 'react';

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

  const compactBtn = (bg: string, border: string, clr: string): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 0, padding: '8px 14px', borderRadius: 8, fontWeight: 900, fontSize: 11, letterSpacing: 0.5,
    cursor: 'pointer', transition: 'transform 0.1s, opacity 0.15s, background 0.15s', border: `1.5px solid ${border}`,
    background: bg, color: clr, minWidth: 72, whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px', minWidth: 340 }}>
      {/* Main buttons row (horizontal) */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
        <button onClick={onFold} style={compactBtn('rgba(127,29,29,0.6)','#dc2626','#fca5a5')}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.4)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(127,29,29,0.6)'}>
          <span>FOLD</span>
        </button>
        {canCheck ? (
          <button onClick={onCheck} style={compactBtn('rgba(113,63,18,0.6)','#d97706','#fde68a')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(113,63,18,0.6)'}>
            <span>CHECK</span>
          </button>
        ) : (
          <button onClick={onCall} style={compactBtn('rgba(30,58,95,0.6)','#3b82f6','#93c5fd')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,58,95,0.6)'}>
            <span>CALL</span><span style={{ fontSize: 8 }}>₹{callAmount}</span>
          </button>
        )}
        <button onClick={() => onRaise(ra)} style={compactBtn('rgba(20,83,45,0.6)','#22c55e','#86efac')}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.4)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,83,45,0.6)'}>
          <span>RAISE</span><span style={{ fontSize: 8 }}>₹{ra.toLocaleString()}</span>
        </button>
        <button onClick={onAllIn} style={compactBtn('rgba(120,53,15,0.6)','#f59e0b','#fde68a')}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.4)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(120,53,15,0.6)'}>
          <span>ALL-IN</span>
        </button>
      </div>

      {/* Raise slider row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap', minWidth: 50 }}>Raise:</span>
        <input type="range" min={minRaise} max={maxRaise} value={ra}
          onChange={e => setRa(Number(e.target.value))}
          style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer' }} />
        <span style={{ fontSize: 9, color: '#4ade80', fontFamily: 'monospace', fontWeight: 700, minWidth: 60, textAlign: 'right' }}>₹{ra.toLocaleString()}</span>
      </div>

      {/* Preset buttons row */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
        {[['Min',minRaise],['½ Pot',Math.min(Math.floor(pot/2),maxRaise)],['Pot',Math.min(pot,maxRaise)],['All-In',maxRaise]].map(([l,v]) => (
          <button key={l as string} onClick={() => setRa(v as number)}
            style={{ fontSize: 8, fontWeight: 700, padding: '4px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', cursor: 'pointer', whiteSpace: 'nowrap', flex: 1, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            {l as string}
          </button>
        ))}
      </div>
    </div>
  );
};
