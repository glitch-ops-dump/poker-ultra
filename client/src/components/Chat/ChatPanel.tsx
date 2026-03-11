import React, { useState, useRef, useEffect } from 'react';

interface Props {
  activePlayers: { name: string; color: string }[];
}

const MOCK_MSGS = [
  { id: '1', sender: 'System', text: 'Welcome to Poker Ultra!', color: '#4ade80' },
];

export const ChatPanel: React.FC<Props> = ({ activePlayers }) => {
  const [messages, setMessages] = useState(MOCK_MSGS);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'You', text: input, color: '#3b82f6' }]);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: 12 }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 800, color: '#94a3b8', fontSize: 13 }}>
        Chat
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map(m => (
          <div key={m.id}>
            <span style={{ color: m.color, fontWeight: 700, fontSize: 11 }}>{m.sender}</span>
            <div style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.4 }}>{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Active Players */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
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

      {/* Input */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ fontSize: 16, cursor: 'pointer' }}>😊</span>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message…"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#94a3b8', fontSize: 11, fontWeight: 500,
          }} />
        <button onClick={handleSend} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontWeight: 900, fontSize: 14 }}>›</button>
      </div>
    </div>
  );
};
