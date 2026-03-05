import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { generatePuzzle } from './utils/sudokuGenerator';
import HomePage from './components/HomePage';
import SinglePlayerSetup from './components/SinglePlayerSetup';
import MultiplayerSetup from './components/MultiplayerSetup';
import Lobby from './components/Lobby';
import Game from './components/Game';

// In dev, Vite proxies /socket.io to localhost:3001
// In prod, use the same origin as the page
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || window.location.origin;

export default function App() {
  const [screen, setScreen] = useState('home');
  const [gameConfig, setGameConfig] = useState(null);
  const [playerInfo, setPlayerInfo] = useState({ name: '', id: null });
  const [room, setRoom] = useState(null);
  const [gameData, setGameData] = useState(null);
  const socketRef = useRef(null);

  // Check URL for room code on load (from shared links)
  const [initialRoomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || '';
  });

  useEffect(() => {
    if (initialRoomId) {
      setScreen('multiplayer');
    }
  }, [initialRoomId]);

  // Clean URL after reading room param
  useEffect(() => {
    if (initialRoomId && window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [initialRoomId]);

  function connectSocket() {
    if (socketRef.current?.connected) return socketRef.current;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[socket] connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('[socket] connect error:', err.message);
      alert('Could not connect to server. Make sure the server is running on port 3001.');
    });

    socketRef.current = socket;
    return socket;
  }

  function disconnectSocket() {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }

  // ── Single Player ────────────────────────────────────────────────
  function handleSinglePlayerStart(size, difficulty) {
    const data = generatePuzzle(size, difficulty);
    setGameConfig({ size, difficulty, mode: 'single' });
    setGameData(data);
    setScreen('game-single');
  }

  // ── Multiplayer ──────────────────────────────────────────────────
  function handleCreateRoom(playerName, size, difficulty) {
    const socket = connectSocket();
    setPlayerInfo((prev) => ({ ...prev, name: playerName }));

    // Register one-time listeners before emitting
    socket.once('room:created', ({ roomId, playerId, room: r }) => {
      setPlayerInfo({ name: playerName, id: playerId });
      setRoom(r);
      setGameConfig({ size: r.boardSize, difficulty: r.difficulty, mode: 'multi' });
      setScreen('lobby');
    });

    socket.once('room:error', ({ message }) => {
      alert(`Error: ${message}`);
    });

    socket.emit('room:create', { playerName, boardSize: size, difficulty });
  }

  function handleJoinRoom(playerName, roomId) {
    const socket = connectSocket();
    setPlayerInfo((prev) => ({ ...prev, name: playerName }));

    socket.once('room:joined', ({ playerId, room: r }) => {
      setPlayerInfo({ name: playerName, id: playerId });
      setRoom(r);
      setGameConfig({ size: r.boardSize, difficulty: r.difficulty, mode: 'multi' });
      setScreen('lobby');
    });

    socket.once('room:error', ({ message }) => {
      alert(`Error: ${message}`);
    });

    socket.emit('room:join', { roomId, playerName });
  }

  function handleStartGame() {
    if (!room || !socketRef.current) return;
    socketRef.current.emit('game:start', { roomId: room.id });
  }

  // Listen for room updates and game start while in lobby
  useEffect(() => {
    if (screen !== 'lobby' || !socketRef.current) return;
    const socket = socketRef.current;

    function onRoomUpdated({ room: r }) {
      setRoom(r);
    }

    function onGameStarted({ puzzle, solution, boardSize, difficulty, startTime, room: r }) {
      setRoom(r);
      setGameData({ puzzle, solution, size: boardSize, difficulty, startTime });
      setGameConfig({ size: boardSize, difficulty, mode: 'multi' });
      setScreen('game-multi');
    }

    function onRoomError({ message }) {
      alert(`Room error: ${message}`);
    }

    socket.on('room:updated', onRoomUpdated);
    socket.on('game:started', onGameStarted);
    socket.on('room:error', onRoomError);

    return () => {
      socket.off('room:updated', onRoomUpdated);
      socket.off('game:started', onGameStarted);
      socket.off('room:error', onRoomError);
    };
  }, [screen]);

  function handleHome() {
    disconnectSocket();
    setScreen('home');
    setRoom(null);
    setGameData(null);
    setGameConfig(null);
    setPlayerInfo({ name: '', id: null });
  }

  // ── Render ───────────────────────────────────────────────────────
  if (screen === 'home') {
    return (
      <HomePage
        onSinglePlayer={() => setScreen('setup-single')}
        onMultiplayer={() => setScreen('multiplayer')}
      />
    );
  }

  if (screen === 'setup-single') {
    return (
      <SinglePlayerSetup
        onStart={handleSinglePlayerStart}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'multiplayer') {
    return (
      <MultiplayerSetup
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onBack={() => setScreen('home')}
        initialRoomId={initialRoomId}
      />
    );
  }

  if (screen === 'lobby' && room) {
    return (
      <Lobby
        room={room}
        playerId={playerInfo.id}
        onStartGame={handleStartGame}
        onBack={handleHome}
      />
    );
  }

  if (screen === 'game-single' && gameData) {
    return (
      <Game
        puzzle={gameData.puzzle}
        solution={gameData.solution}
        size={gameConfig.size}
        difficulty={gameConfig.difficulty}
        mode="single"
        socket={null}
        roomId={null}
        playerId={null}
        players={[]}
        onHome={() => setScreen('home')}
        serverStartTime={null}
      />
    );
  }

  if (screen === 'game-multi' && gameData) {
    return (
      <Game
        puzzle={gameData.puzzle}
        solution={gameData.solution}
        size={gameConfig.size}
        difficulty={gameConfig.difficulty}
        mode="multi"
        socket={socketRef.current}
        roomId={room?.id}
        playerId={playerInfo.id}
        players={room?.players || []}
        onHome={handleHome}
        serverStartTime={gameData.startTime}
      />
    );
  }

  // Fallback
  return <HomePage onSinglePlayer={() => setScreen('setup-single')} onMultiplayer={() => setScreen('multiplayer')} />;
}
