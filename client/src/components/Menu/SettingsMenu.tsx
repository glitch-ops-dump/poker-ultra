import React from 'react';
import { useAppStore } from '../../store/gameStore';

interface Props {
  onClose: () => void;
}

export const SettingsMenu: React.FC<Props> = ({ onClose }) => {
  const { isSoundEnabled, isMusicEnabled, toggleSound, toggleMusic } = useAppStore();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
    }} onClick={onClose}>
      
      <div style={{
        background: 'rgba(30,41,59,0.95)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
        padding: '30px 40px', width: 320, boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        color: '#f8fafc',
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, color: '#e2e8f0' }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Sound Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1' }}>Sound Effects</span>
            <button onClick={toggleSound} style={{
              width: 50, height: 26, borderRadius: 13, cursor: 'pointer',
              background: isSoundEnabled ? '#4ade80' : 'rgba(255,255,255,0.1)',
              border: isSoundEnabled ? 'none' : '1px solid rgba(255,255,255,0.2)',
              position: 'relative', transition: 'background 0.3s',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: isSoundEnabled ? 26 : 2,
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          {/* Music Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1' }}>Background Music</span>
            <button onClick={toggleMusic} style={{
              width: 50, height: 26, borderRadius: 13, cursor: 'pointer',
              background: isMusicEnabled ? '#3b82f6' : 'rgba(255,255,255,0.1)',
              border: isMusicEnabled ? 'none' : '1px solid rgba(255,255,255,0.2)',
              position: 'relative', transition: 'background 0.3s',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: isMusicEnabled ? 26 : 2,
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
