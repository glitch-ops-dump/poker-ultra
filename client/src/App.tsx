import { useAppStore } from './store/gameStore';
import { LobbyView } from './components/Lobby/LobbyView';
import { TableView } from './components/Table/TableView';

function App() {
  const { roomCode } = useAppStore();

  return (
    <>
      <div className="text-white min-h-screen">
        {roomCode ? <TableView /> : <LobbyView />}
      </div>
    </>
  );
}

export default App;
