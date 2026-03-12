import { useAppStore } from './store/gameStore';
import { LobbyView } from './components/Lobby/LobbyView';
import { TableView } from './components/Table/TableView';

function App() {
  const { roomCode, tableState } = useAppStore();

  return (
    <>
      <div className="text-white min-h-screen">
        {!roomCode ? (
          <LobbyView />
        ) : !tableState ? (
          <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f18' }}>
            <span style={{ color: '#4ade80', fontSize: 22, fontWeight: 900, fontStyle: 'italic' }}>Connecting to table…</span>
          </div>
        ) : (
          <TableView />
        )}
      </div>
    </>
  );
}

export default App;
