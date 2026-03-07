'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import useGameStore from '@/store/gameStore';
import { generatePuzzle } from '@/utils/sudokuGenerator';

import HomePage from '@/components/HomePage';
import SinglePlayerSetup from '@/components/SinglePlayerSetup';
import MultiplayerSetup from '@/components/MultiplayerSetup';
import Lobby from '@/components/Lobby';
import Game from '@/components/Game';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.15 } },
};

function AppContent() {
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get('room') || '';

  const {
    screen, setScreen,
    gameConfig, setGameConfig,
    gameData, setGameData,
    playerInfo, setPlayerInfo,
    room, setRoom,
    socket, setSocket,
    goHome,
  } = useGameStore();

  // Jump to multiplayer screen if deep-linked with ?room=
  useEffect(() => {
    if (initialRoomId) setScreen('multiplayer');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Socket helpers ──────────────────────────────────────────
  function connectSocket() {
    if (socket?.connected) return socket;
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    s.on('connect', () => console.log('[socket] connected:', s.id));
    s.on('connect_error', (err) => {
      console.error('[socket] error:', err.message);
      alert('Could not connect to server. Make sure the server is running.');
    });
    setSocket(s);
    return s;
  }

  // ── Single player ───────────────────────────────────────────
  function handleSinglePlayerStart(size, difficulty) {
    const data = generatePuzzle(size, difficulty);
    setGameConfig({ size, difficulty, mode: 'single' });
    setGameData(data);
    setScreen('game-single');
  }

  // ── Multiplayer ─────────────────────────────────────────────
  function handleCreateRoom(playerName, size, difficulty) {
    const s = connectSocket();
    setPlayerInfo({ name: playerName, id: null });

    s.once('room:created', ({ playerId, room: r }) => {
      setPlayerInfo({ name: playerName, id: playerId });
      setRoom(r);
      setGameConfig({ size: r.boardSize, difficulty: r.difficulty, mode: 'multi' });
      setScreen('lobby');
    });
    s.once('room:error', ({ message }) => alert(`Error: ${message}`));
    s.emit('room:create', { playerName, boardSize: size, difficulty });
  }

  function handleJoinRoom(playerName, roomId) {
    const s = connectSocket();
    setPlayerInfo({ name: playerName, id: null });

    s.once('room:joined', ({ playerId, room: r }) => {
      setPlayerInfo({ name: playerName, id: playerId });
      setRoom(r);
      setGameConfig({ size: r.boardSize, difficulty: r.difficulty, mode: 'multi' });
      setScreen('lobby');
    });
    s.once('room:error', ({ message }) => alert(`Error: ${message}`));
    s.emit('room:join', { roomId, playerName });
  }

  function handleStartGame() {
    if (!room || !socket) return;
    socket.emit('game:start', { roomId: room.id });
  }

  function handleReturnToLobby() {
    if (!room || !socket) return;
    socket.emit('room:returnToLobby', { roomId: room.id });
  }

  // Listen for returnToLobby while in game-multi screen
  useEffect(() => {
    if (screen !== 'game-multi' || !socket) return;

    function onReturnedToLobby({ room: r }) {
      setRoom(r);
      setGameData(null);
      setScreen('lobby');
    }

    socket.on('room:returnedToLobby', onReturnedToLobby);
    return () => { socket.off('room:returnedToLobby', onReturnedToLobby); };
  }, [screen, socket]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for lobby events while in lobby screen
  useEffect(() => {
    if (screen !== 'lobby' || !socket) return;

    function onRoomUpdated({ room: r }) { setRoom(r); }
    function onGameStarted({ puzzle, solution, boardSize, difficulty, startTime, room: r }) {
      setRoom(r);
      setGameData({ puzzle, solution, size: boardSize, difficulty, startTime });
      setGameConfig({ size: boardSize, difficulty, mode: 'multi' });
      setScreen('game-multi');
    }
    function onRoomError({ message }) { alert(`Room error: ${message}`); }

    socket.on('room:updated', onRoomUpdated);
    socket.on('game:started', onGameStarted);
    socket.on('room:error', onRoomError);

    return () => {
      socket.off('room:updated', onRoomUpdated);
      socket.off('game:started', onGameStarted);
      socket.off('room:error', onRoomError);
    };
  }, [screen, socket]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ──────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      {screen === 'home' && (
        <motion.div key="home" {...pageVariants}>
          <HomePage
            onSinglePlayer={() => setScreen('setup-single')}
            onMultiplayer={() => setScreen('multiplayer')}
          />
        </motion.div>
      )}

      {screen === 'setup-single' && (
        <motion.div key="setup-single" {...pageVariants}>
          <SinglePlayerSetup
            onStart={handleSinglePlayerStart}
            onBack={() => setScreen('home')}
          />
        </motion.div>
      )}

      {screen === 'multiplayer' && (
        <motion.div key="multiplayer" {...pageVariants}>
          <MultiplayerSetup
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onBack={() => setScreen('home')}
            initialRoomId={initialRoomId}
          />
        </motion.div>
      )}

      {screen === 'lobby' && room && (
        <motion.div key="lobby" {...pageVariants}>
          <Lobby
            room={room}
            playerId={playerInfo.id}
            onStartGame={handleStartGame}
            onBack={goHome}
          />
        </motion.div>
      )}

      {screen === 'game-single' && gameData && (
        <motion.div key="game-single" {...pageVariants}>
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
        </motion.div>
      )}

      {screen === 'game-multi' && gameData && (
        <motion.div key="game-multi" {...pageVariants}>
          <Game
            puzzle={gameData.puzzle}
            solution={gameData.solution}
            size={gameConfig.size}
            difficulty={gameConfig.difficulty}
            mode="multi"
            socket={socket}
            roomId={room?.id}
            playerId={playerInfo.id}
            players={room?.players || []}
            onHome={goHome}
            serverStartTime={gameData.startTime}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AppContent />
    </Suspense>
  );
}
