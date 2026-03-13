import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/gameStore';

interface Props {
  activePlayers: { name: string; color: string }[];
}

const GOLD = '#d4a950';

const MOCK_MSGS = [
  { id: '1', sender: 'System', text: 'Welcome to Poker Ultra!', color: '#4ade80' },
];

/* ── Parse raw log strings into collapsible hand entries ── */
interface HandEntry {
  handNum: number;
  winner?: string;
  amount?: string;
  hand?: string;
  logs: string[];
  inProgress: boolean;
}

function parseHands(logs: string[]): HandEntry[] {
  const hands: HandEntry[] = [];
  let current: HandEntry | null = null;
  let handCount = 0;

  for (const log of logs) {
    // Detect new hand start
    if (log.includes('New hand') || log.includes('dealing') || log.includes('Dealer:')) {
      handCount++;
      current = { handNum: handCount, logs: [log], inProgress: true };
      hands.push(current);
      continue;
    }

    if (!current) {
      // Logs before first hand — put in hand 1
      if (hands.length === 0) {
        handCount++;
        current = { handNum: handCount, logs: [], inProgress: true };
        hands.push(current);
      } else {
        current = hands[hands.length - 1];
      }
    }

    current.logs.push(log);

    // Detect winner
    const winMatch = log.match(/🏆\s*(.+?)\s+wins\s+₹([\d,]+)(.*)/);
    if (winMatch) {
      current.winner = winMatch[1];
      current.amount = winMatch[2];
      const withMatch = winMatch[3].match(/with\s+(.+?)!/);
      if (withMatch) current.hand = withMatch[1];
      current.inProgress = false;
    }

    // Uncontested win
    const uncontestedMatch = log.match(/(.+?)\s+wins\s+₹([\d,]+)\s*\(uncontested\)/);
    if (uncontestedMatch) {
      current.winner = uncontestedMatch[1];
      current.amount = uncontestedMatch[2];
      current.inProgress = false;
    }
  }

  return hands;
}

/* ── Collapsible Hand Component ── */
const HandBlock: React.FC<{ hand: HandEntry; defaultOpen: boolean }> = ({ hand, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);

  const headerColor = hand.inProgress ? GOLD : hand.winner ? '#4ade80' : '#94a3b8';

  return (
    <div style={{ marginBottom: 4, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '6px 8px', cursor: 'pointer',
          background: open ? 'rgba(255,255,255,0.04)' : 'transparent',
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'background 0.15s',
        }}
      >
        <span style={{ fontSize: 8, color: '#475569', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>▶</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: headerColor }}>
            Hand #{hand.handNum} {hand.inProgress ? '• In Progress' : ''}
          </div>
          {hand.winner && (
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
              🏆 <strong style={{ color: '#4ade80' }}>{hand.winner}</strong>
              {' '}₹{hand.amount}
              {hand.hand && <span style={{ color: GOLD }}>{' '}— {hand.hand}</span>}
            </div>
          )}
        </div>
      </div>
      {open && (
        <div style={{ padding: '4px 8px 6px 20px', background: 'rgba(0,0,0,0.15)' }}>
          {hand.logs.map((log, i) => {
            let color = '#64748b';
            if (log.includes('fold')) color = '#e05555';
            else if (log.includes('call')) color = '#3b82f6';
            else if (log.includes('raise')) color = GOLD;
            else if (log.includes('wins') || log.includes('🏆')) color = '#4ade80';
            else if (log.includes('check')) color = '#94a3b8';
            return (
              <div key={i} style={{ fontSize: 10, color, padding: '1px 0', lineHeight: 1.5 }}>{log}</div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ChatPanel: React.FC<Props> = ({ activePlayers }) => {
  const [messages, setMessages] = useState(MOCK_MSGS);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [showEmojis, setShowEmojis] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { tableState } = useAppStore();
  const logs = tableState?.logs || [];
  const hands = useMemo(() => parseHands(logs), [logs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, logs, activeTab]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'You', text: input, color: '#3b82f6' }]);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: 12 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1, padding: '10px 0', textAlign: 'center', cursor: 'pointer',
            fontWeight: 800, fontSize: 12, border: 'none',
            background: activeTab === 'chat' ? 'rgba(74,222,128,0.08)' : 'transparent',
            color: activeTab === 'chat' ? '#4ade80' : '#64748b',
            borderBottom: activeTab === 'chat' ? '2px solid #4ade80' : '2px solid transparent',
          }}>
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1, padding: '10px 0', textAlign: 'center', cursor: 'pointer',
            fontWeight: 800, fontSize: 12, border: 'none',
            background: activeTab === 'history' ? 'rgba(212,169,80,0.08)' : 'transparent',
            color: activeTab === 'history' ? GOLD : '#64748b',
            borderBottom: activeTab === 'history' ? `2px solid ${GOLD}` : '2px solid transparent',
          }}>
          📜 History
        </button>
      </div>

      {/* Messages / History */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {activeTab === 'chat' ? (
          <>
            {messages.map(m => (
              <div key={m.id}>
                <span style={{ color: m.color, fontWeight: 700, fontSize: 11 }}>{m.sender}</span>
                <div style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.4 }}>{m.text}</div>
              </div>
            ))}
            {/* Active Players */}
            <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#475569', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
                ● Active Players
              </div>
              {activePlayers.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 900, color: '#fff' }}>
                    {p.name[0]}
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>{p.name}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          hands.length > 0 ? (
            hands.map((h, i) => (
              <HandBlock key={i} hand={h} defaultOpen={i === hands.length - 1} />
            ))
          ) : (
            <div style={{ color: '#475569', fontSize: 11, textAlign: 'center', padding: 20 }}>No hands played yet</div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input (only in chat tab) */}
      {activeTab === 'chat' && (
        <div style={{ position: 'relative', display: 'flex', gap: 6, padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {showEmojis && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 10, marginBottom: 8,
              background: 'rgba(30,41,59,0.95)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 8,
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, zIndex: 100,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}>
              {['😂','👍','🔥','😎','🎉','😡','💰','♠️','♥️','🍀'].map(em => (
                <button key={em} onClick={() => { setInput(prev => prev + em); setShowEmojis(false); }}
                  style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {em}
                </button>
              ))}
            </div>
          )}
          <span onClick={() => setShowEmojis(!showEmojis)} style={{ fontSize: 16, cursor: 'pointer' }}>😊</span>
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#94a3b8', fontSize: 11, fontWeight: 500,
            }} />
          <button onClick={handleSend} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontWeight: 900, fontSize: 14 }}>›</button>
        </div>
      )}
    </div>
  );
};
