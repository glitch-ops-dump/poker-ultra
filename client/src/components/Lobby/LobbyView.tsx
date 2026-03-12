import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/gameStore';

type TableSize = 2 | 4 | 6;

export const LobbyView: React.FC = () => {
  const { displayName, setDisplayName, createRoom, joinRoom, balance, activeRooms, fetchRooms } = useAppStore();
  const [joinCode, setJoinCode] = useState('');
  const [tableSize, setTableSize] = useState<TableSize>(6);
  const [withBots, setWithBots] = useState(true);

  // Fetch real rooms on mount and refresh every 5s
  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleCreate = () => createRoom(tableSize, withBots);

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
      background: 'radial-gradient(ellipse at 50% 0%, #1a2c20 0%, #0a0f18 50%, #060a10 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, background: 'radial-gradient(ellipse, rgba(52,211,153,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Nav bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px',
        background: 'rgba(10,15,24,0.7)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Lobby', 'Cash Games', 'Tournaments'].map((t, i) => (
            <span key={t} style={{ fontSize: 13, fontWeight: 700, cursor: 'pointer', color: i === 0 ? '#4ade80' : '#64748b', borderBottom: i === 0 ? '2px solid #4ade80' : 'none', paddingBottom: 4 }}>{t}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
          <span>Balance</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 16, color: '#fff' }}>₹{balance.toLocaleString()}</span>
        </div>
      </div>

      {/* Glass panel */}
      <div style={{
        width: '100%', maxWidth: 580, zIndex: 10,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
        padding: '28px 32px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, fontStyle: 'italic', letterSpacing: -2, lineHeight: 1, color: '#4ade80', textShadow: '0 0 40px rgba(52,211,153,0.3)', margin: 0 }}>
            POKER<br />ULTRA
          </h1>
        </div>

        {/* Name + Balance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>👤</span>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>Display Name</label>
            <input type="text" maxLength={12} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your Display Name"
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px', color: '#fff', fontWeight: 600, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Balance</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace', color: '#fff' }}>₹{balance.toLocaleString()}</div>
          </div>
        </div>

        {/* Table size selector + Bot Toggle */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Table Size</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {([2, 4, 6] as TableSize[]).map(n => (
                <button key={n} onClick={() => setTableSize(n)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer',
                    border: tableSize === n ? '1.5px solid #4ade80' : '1px solid rgba(255,255,255,0.08)',
                    background: tableSize === n ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)',
                    color: tableSize === n ? '#4ade80' : '#64748b',
                    transition: 'all 0.15s',
                  }}>
                  {n} Players
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: 120 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Fill with Bots</label>
            <div 
              onClick={() => setWithBots(!withBots)}
              style={{
                height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', padding: '0 12px', cursor: 'pointer', transition: 'all 0.2s',
                color: withBots ? '#4ade80' : '#64748b', gap: 8,
              }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor',
                background: withBots ? 'currentColor' : 'transparent', transition: 'all 0.2s'
              }} />
              <span style={{ fontSize: 13, fontWeight: 800 }}>{withBots ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>

        {/* Create + Join */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button disabled={!displayName.trim()} onClick={handleCreate}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 10,
              border: '1.5px solid #22c55e',
              background: 'linear-gradient(180deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 100%)',
              color: '#4ade80', fontWeight: 900, fontSize: 13, letterSpacing: 0.5, cursor: 'pointer',
              opacity: displayName.trim() ? 1 : 0.4,
            }}>
            ⊕ CREATE TABLE
          </button>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: 1, marginBottom: 4 }}>JOIN TABLE</div>
              <input type="text" maxLength={6} value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter Code"
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 10px', color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'monospace', textAlign: 'center', letterSpacing: 3, outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box' }} />
            </div>
            <button disabled={!displayName.trim() || joinCode.length !== 6} onClick={() => joinRoom(joinCode)}
              style={{ alignSelf: 'flex-end', padding: '7px 16px', borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', fontWeight: 800, fontSize: 12, cursor: 'pointer', opacity: (displayName.trim() && joinCode.length === 6) ? 1 : 0.4 }}>
              JOIN →
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />

        {/* Active Tables — REAL rooms from server */}
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>Active Tables</span>
          <span style={{ fontSize: 10, color: '#334155', cursor: 'pointer' }} onClick={fetchRooms}>↻ Refresh</span>
        </div>

        {activeRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#334155', fontSize: 12, fontWeight: 600 }}>
            No active tables — create one!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
            {activeRooms.map(room => (
              <div key={room.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 14 }}>🎴</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.3 }}>{room.name}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      👤 {room.players}/{room.maxPlayers} &nbsp;·&nbsp; {room.blinds} &nbsp;·&nbsp;
                      <span style={{ color: room.state === 'WAITING' ? '#64748b' : '#4ade80' }}>
                        {room.state === 'WAITING' ? 'Waiting' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
                <button disabled={!displayName.trim()} onClick={() => joinRoom(room.id)}
                  style={{ padding: '6px 18px', borderRadius: 18, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#4ade80', fontWeight: 800, fontSize: 11, cursor: 'pointer', letterSpacing: 0.5, opacity: displayName.trim() ? 1 : 0.4 }}>
                  JOIN →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
