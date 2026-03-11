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

const btn = (bg: string, border: string, clr: string): React.CSSProperties => ({
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: 1, padding: '10px 20px', borderRadius: 8, fontWeight: 900, fontSize: 12, letterSpacing: 0.5,
  cursor: 'pointer', transition: 'transform 0.1s, opacity 0.15s', border: `1.5px solid ${border}`,
  background: bg, color: clr, minWidth: 80,
});

export const ActionControls: React.FC<Props> = ({
  canCheck, minRaise, maxRaise, callAmount, pot,
  onFold, onCheck, onCall, onRaise, onAllIn,
}) => {
  const [ra, setRa] = useState(minRaise);

  return (
    <div style={{ padding: '10px 24px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Buttons row */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button onClick={onFold} style={btn('rgba(127,29,29,0.6)','#dc2626','#fca5a5')}>
          <span>FOLD</span><span style={{ fontSize: 9, opacity: 0.6 }}>₹</span>
        </button>
        {canCheck ? (
          <button onClick={onCheck} style={btn('rgba(113,63,18,0.6)','#d97706','#fde68a')}>
            <span>CHECK</span><span style={{ fontSize: 9, opacity: 0.6 }}>✓</span>
          </button>
        ) : (
          <button onClick={onCall} style={btn('rgba(30,58,95,0.6)','#3b82f6','#93c5fd')}>
            <span>CALL</span><span style={{ fontSize: 9, fontFamily: 'monospace' }}>₹{callAmount.toLocaleString()}</span>
          </button>
        )}
        <button onClick={() => onRaise(ra)} style={btn('rgba(20,83,45,0.6)','#22c55e','#86efac')}>
          <span>RAISE</span><span style={{ fontSize: 9, fontFamily: 'monospace' }}>₹{ra.toLocaleString()}</span>
        </button>
        <button onClick={onAllIn} style={{ ...btn('rgba(120,53,15,0.6)','#f59e0b','#fde68a'), fontStyle: 'italic' }}>
          <span>ALL-IN</span><span style={{ fontSize: 9, fontFamily: 'monospace', fontStyle: 'normal' }}>₹{maxRaise.toLocaleString()}</span>
        </button>
      </div>

      {/* Slider row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, whiteSpace: 'nowrap' }}>
          RAISE TO: <span style={{ color: '#4ade80', fontFamily: 'monospace' }}>₹{ra.toLocaleString()}</span>
        </span>
        <span style={{ fontSize: 9, color: '#475569', whiteSpace: 'nowrap' }}>min {minRaise}</span>
        <input type="range" min={minRaise} max={maxRaise} value={ra}
          onChange={e => setRa(Number(e.target.value))} style={{ width: 200 }} />
        <span style={{ fontSize: 9, color: '#475569', whiteSpace: 'nowrap' }}>max {maxRaise.toLocaleString()}</span>
        {[['Min',minRaise],['½ Pot',Math.min(Math.floor(pot/2),maxRaise)],['Pot',Math.min(pot,maxRaise)],['All-In',maxRaise]].map(([l,v]) => (
          <button key={l as string} onClick={() => setRa(v as number)}
            style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {l as string}
          </button>
        ))}
      </div>
    </div>
  );
};
