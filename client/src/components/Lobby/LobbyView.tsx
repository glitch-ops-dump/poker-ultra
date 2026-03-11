import React, { useState } from 'react';
import { useAppStore } from '../../store/gameStore';

const MOCK_TABLES = [
  { name: 'NEON NIGHTS', players: 4, max: 6, blinds: '₹100/₹200' },
  { name: 'ROYAL RUSH',  players: 3, max: 6, blinds: '₹50/₹100' },
  { name: 'ACES HIGH',   players: 5, max: 6, blinds: '₹500/₹1000' },
];

export const LobbyView: React.FC = () => {
  const { displayName, setDisplayName, createRoom, joinRoom, balance } = useAppStore();
  const [joinCode, setJoinCode] = useState('');

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
      background: 'radial-gradient(ellipse at 50% 0%, #1a2c20 0%, #0a0f18 50%, #060a10 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, background: 'radial-gradient(ellipse, rgba(52,211,153,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ═══ Nav Bar ═══ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px',
        background: 'rgba(10,15,24,0.7)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Lobby', 'Tables', 'Cash Games'].map((t, i) => (
            <span key={t} style={{
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              color: i === 0 ? '#4ade80' : '#64748b',
              borderBottom: i === 0 ? '2px solid #4ade80' : 'none',
              paddingBottom: 4,
            }}>{t}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#94a3b8' }}>
          <span>Balance</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 16, color: '#fff' }}>₹{balance.toLocaleString()}</span>
        </div>
      </div>

      {/* ═══ Main Glass Panel ═══ */}
      <div style={{
        width: '100%', maxWidth: 580, zIndex: 10,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20, padding: '32px 36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontSize: 52, fontWeight: 900, fontStyle: 'italic', letterSpacing: -2, lineHeight: 1,
            color: '#4ade80',
            textShadow: '0 0 40px rgba(52,211,153,0.3), 0 0 80px rgba(52,211,153,0.1)',
            margin: 0,
          }}>
            POKER<br />ULTRA
          </h1>
        </div>

        {/* Name + Balance Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 20, color: '#64748b' }}>👤</span>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>Display Name</label>
            <input type="text" maxLength={12} value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="Your Display Name"
              style={{
                width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '8px 12px', color: '#fff', fontWeight: 600, fontSize: 14,
                outline: 'none',
              }} />
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>Balance</label>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: '#fff' }}>₹{balance.toLocaleString()}</div>
          </div>
        </div>

        {/* Create + Join Row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <button disabled={!displayName.trim()} onClick={() => createRoom()}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 10, border: '1.5px solid #22c55e',
              background: 'linear-gradient(180deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 100%)',
              color: '#4ade80', fontWeight: 900, fontSize: 14, letterSpacing: 1, cursor: 'pointer',
              boxShadow: '0 0 20px rgba(34,197,94,0.1)',
              opacity: displayName.trim() ? 1 : 0.4,
            }}>
            ⊕ CREATE TABLE
          </button>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: 1 }}>JOIN TABLE</label>
              <input type="text" maxLength={6} value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter Code"
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, padding: '8px 10px', color: '#fff', fontWeight: 700, fontSize: 13,
                  fontFamily: 'monospace', textAlign: 'center', letterSpacing: 3, outline: 'none',
                  textTransform: 'uppercase',
                }} />
            </div>
            <button disabled={!displayName.trim() || joinCode.length !== 6}
              onClick={() => joinRoom(joinCode)}
              style={{
                alignSelf: 'flex-end', padding: '8px 16px', borderRadius: 8,
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                color: '#93c5fd', fontWeight: 800, fontSize: 12, cursor: 'pointer',
                opacity: (displayName.trim() && joinCode.length === 6) ? 1 : 0.4,
              }}>
              JOIN →
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

        {/* Active Tables */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>Active Tables</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_TABLES.map(t => (
            <div key={t.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 16 }}>🎴</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>👤 {t.players}/{t.max} · Blinds: {t.blinds}</div>
                </div>
              </div>
              <button disabled={!displayName.trim()} onClick={() => createRoom()}
                style={{
                  padding: '7px 20px', borderRadius: 20,
                  background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                  color: '#4ade80', fontWeight: 800, fontSize: 12, cursor: 'pointer',
                  letterSpacing: 1,
                }}>
                JOIN →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
