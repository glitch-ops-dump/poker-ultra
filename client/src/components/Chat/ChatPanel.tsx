import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/gameStore';

interface Props {
  activePlayers: { name: string; color: string }[];
}

const MOCK_MSGS = [
  { id: '1', sender: 'System', text: 'Welcome to Poker Ultra!', color: '#4ade80' },
];

export const ChatPanel: React.FC<Props> = ({ activePlayers }) => {
  const [messages, setMessages] = useState(MOCK_MSGS);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [showEmojis, setShowEmojis] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { tableState } = useAppStore();
  const logs = tableState?.logs || [];

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
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div 
          onClick={() => setActiveTab('chat')}
          style={{ flex: 1, padding: '10px 0', textAlign: 'center', cursor: 'pointer', fontWeight: 800, color: activeTab === 'chat' ? '#4ade80' : '#64748b', borderBottom: activeTab === 'chat' ? '2px solid #4ade80' : '2px solid transparent' }}>
          Chat
        </div>
        <div 
          onClick={() => setActiveTab('history')}
          style={{ flex: 1, padding: '10px 0', textAlign: 'center', cursor: 'pointer', fontWeight: 800, color: activeTab === 'history' ? '#4ade80' : '#64748b', borderBottom: activeTab === 'history' ? '2px solid #4ade80' : '2px solid transparent' }}>
          History
        </div>
      </div>

      {/* Messages / History */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeTab === 'chat' ? (
          messages.map(m => (
            <div key={m.id}>
              <span style={{ color: m.color, fontWeight: 700, fontSize: 11 }}>{m.sender}</span>
              <div style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.4 }}>{m.text}</div>
            </div>
          ))
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ color: '#94a3b8', fontSize: 11, padding: '4px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
              {log}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Active Players (Only show in Chat tab) */}
      {activeTab === 'chat' && (
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
      )}

      {/* Input */}
      <div style={{ position: 'relative', display: 'flex', gap: 6, padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        
        {/* Emoji Picker Popup */}
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
    </div>
  );
};
