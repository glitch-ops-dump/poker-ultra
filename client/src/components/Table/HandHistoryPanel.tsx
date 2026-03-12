import React, { useState, useRef, useEffect } from 'react';

/* ═══ Design Tokens ═══ */
const GOLD = '#d4a950';
const GOLD_BORDER = 'rgba(212,169,80,0.25)';
const PANEL_BG = '#131e30';
const PANEL_HOVER = '#1a2840';
const TEXT = '#e8ddc8';
const TEXT_MUTED = '#7a8fa8';
const TEXT_DIM = '#4a5a70';

interface HandEntry {
  id: number;
  logs: string[];
  winner?: string;
  handStrength?: string;
  pot?: number;
}

interface Props {
  logs: string[];
  onClose: () => void;
}

/** Parse raw log strings into structured hand entries */
function parseHands(logs: string[]): HandEntry[] {
  const hands: HandEntry[] = [];
  let current: HandEntry | null = null;
  let handNum = 0;

  for (const log of logs) {
    // Detect new hand start
    if (log.includes('New hand') || log.includes('Dealing') || log.includes('Hand #')) {
      handNum++;
      current = { id: handNum, logs: [log] };
      hands.push(current);
    } else if (current) {
      current.logs.push(log);
      // Detect winner
      if (log.includes('wins') || log.includes('won')) {
        const winMatch = log.match(/(\w+)\s+(wins|won)\s+₹?([\d,]+)/);
        if (winMatch) {
          current.winner = winMatch[1];
          current.pot = parseInt(winMatch[3].replace(/,/g, ''));
        }
      }
      // Detect hand strength
      if (log.includes('Pair') || log.includes('Flush') || log.includes('Straight') ||
          log.includes('Full House') || log.includes('Three') || log.includes('Two Pair') ||
          log.includes('Royal') || log.includes('Four')) {
        current.handStrength = log;
      }
    } else {
      // Pre-hand logs go into a default entry
      if (hands.length === 0) {
        current = { id: 0, logs: [log] };
        hands.push(current);
      } else {
        hands[hands.length - 1].logs.push(log);
      }
    }
  }

  return hands.reverse(); // Most recent first
}

export const HandHistoryPanel: React.FC<Props> = ({ logs, onClose }) => {
  const [openHand, setOpenHand] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const hands = parseHands(logs);

  // Auto-scroll to top on new logs
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [logs.length]);

  const getActionColor = (log: string) => {
    if (log.includes('fold')) return '#e05555';
    if (log.includes('call')) return '#5baaee';
    if (log.includes('raise') || log.includes('bet')) return GOLD;
    if (log.includes('wins') || log.includes('won')) return '#7fc97a';
    if (log.includes('check')) return TEXT_MUTED;
    return TEXT_MUTED;
  };

  return (
    <div style={{
      width: 240, flexShrink: 0,
      background: PANEL_BG,
      borderRight: `1px solid ${GOLD_BORDER}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 14px 10px',
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: 2, color: GOLD,
        borderBottom: `1px solid ${GOLD_BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ opacity: 0.7, fontSize: 13 }}>📜</span>
          Hand History
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: TEXT_DIM,
          cursor: 'pointer', fontSize: 14, padding: '0 4px',
        }}>✕</button>
      </div>

      {/* List */}
      <div ref={listRef} style={{
        flex: 1, overflowY: 'auto', padding: '8px 0',
        scrollbarWidth: 'thin', scrollbarColor: `${GOLD_BORDER} transparent`,
      }}>
        {hands.length === 0 && logs.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: TEXT_DIM, fontSize: 11 }}>
            No hands played yet
          </div>
        ) : hands.length === 0 ? (
          /* Fallback: show raw logs */
          <div style={{ padding: '8px 14px' }}>
            {logs.map((log, i) => (
              <div key={i} style={{
                fontSize: 11, color: getActionColor(log), lineHeight: 1.9,
                padding: '2px 0',
              }}>{log}</div>
            ))}
          </div>
        ) : (
          hands.map(hand => {
            const isOpen = openHand === hand.id;
            return (
              <div key={hand.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {/* Header */}
                <div
                  onClick={() => setOpenHand(isOpen ? null : hand.id)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    transition: 'background 0.15s',
                    background: isOpen ? PANEL_HOVER : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = PANEL_HOVER; }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    color: GOLD, fontSize: 10, marginTop: 2, flexShrink: 0,
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}>▶</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: TEXT_DIM, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                      Hand #{hand.id}{hand.id === hands[0]?.id ? ' · Current' : ''}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {hand.winner ? <><span style={{ color: GOLD }}>{hand.winner}</span> won</> : <span style={{ color: GOLD }}>In Progress</span>}
                    </div>
                    {hand.handStrength && (
                      <div style={{ fontSize: 11, color: '#7fc97a', marginTop: 2, fontWeight: 500 }}>{hand.handStrength}</div>
                    )}
                  </div>

                  {hand.pot && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 9, color: TEXT_DIM, fontWeight: 400 }}>POT</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>₹{hand.pot.toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* Body */}
                {isOpen && (
                  <div style={{
                    padding: '0 14px 12px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.9, paddingTop: 8 }}>
                      {hand.logs.map((log, i) => (
                        <div key={i} style={{ color: getActionColor(log) }}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* If no structured hands but raw logs exist, show them */}
        {hands.length === 0 && logs.length > 0 && (
          <div style={{ padding: '8px 14px' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ fontSize: 11, color: getActionColor(log), lineHeight: 1.9 }}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
