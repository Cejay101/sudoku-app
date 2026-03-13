'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Board from './Board';
import NumberPad from './NumberPad';
import Timer from './Timer';
import PowerUps from './PowerUps';
import Leaderboard from './Leaderboard';
import CompletionModal from './CompletionModal';
import ThemeToggle from './ThemeToggle';
import { useTimer } from '@/hooks/useTimer';

export default function Game({
  puzzle,
  solution,
  size,
  difficulty,
  mode,
  socket,
  roomId,
  playerId,
  players,
  onHome,
  onReturnToLobby,
  serverStartTime,
  isHost,
}) {
  const [board, setBoard] = useState(() => puzzle.map((row) => [...row]));
  const [selectedCell, setSelectedCell] = useState(null);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [hintsLeft, setHintsLeft] = useState(1);
  const [wildcardsLeft, setWildcardsLeft] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [roomPlayers, setRoomPlayers] = useState(players || []);
  const [completed, setCompleted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { elapsed, running, start, stop, startFrom } = useTimer();
  const elapsedRef = useRef(0);
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

  useEffect(() => {
    if (serverStartTime) startFrom(serverStartTime);
    else start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Multiplayer socket listeners
  useEffect(() => {
    if (!socket) return;

    function onPlayerCompleted({ leaderboard: lb, room }) {
      setLeaderboard(lb);
      if (room?.players) setRoomPlayers(room.players);
    }
    function onGameOver({ leaderboard: lb, room }) {
      setLeaderboard(lb);
      if (room?.players) setRoomPlayers(room.players);
      setGameOver(true);
    }

    socket.on('player:completed', onPlayerCompleted);
    socket.on('game:over', onGameOver);
    return () => {
      socket.off('player:completed', onPlayerCompleted);
      socket.off('game:over', onGameOver);
    };
  }, [socket]);

  // Keyboard input
  useEffect(() => {
    function handleKeyDown(e) {
      if (completed) return;
      if (!selectedCell) return;
      const [r, c] = selectedCell;

      if (e.key >= '1' && e.key <= String(size)) {
        handleNumberInput(parseInt(e.key));
        return;
      }
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleErase();
        return;
      }

      const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (moves[e.key]) {
        const [dr, dc] = moves[e.key];
        setSelectedCell([Math.max(0, Math.min(size - 1, r + dr)), Math.max(0, Math.min(size - 1, c + dc))]);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, completed, size]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCellClick(r, c) {
    if (puzzle[r][c] !== 0) return;
    setSelectedCell([r, c]);
  }

  const handleNumberInput = useCallback(
    (num) => {
      if (!selectedCell || completed) return;
      const [r, c] = selectedCell;
      if (puzzle[r][c] !== 0) return;

      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = num;
      setBoard(newBoard);
      checkCompletion(newBoard);
    },
    [selectedCell, board, completed, puzzle] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function handleErase() {
    if (!selectedCell || completed) return;
    const [r, c] = selectedCell;
    if (puzzle[r][c] !== 0 || revealedCells.has(`${r},${c}`)) return;
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
  }

  function checkCompletion(currentBoard) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentBoard[r][c] !== solution[r][c]) return;
      }
    }
    handleCompletion();
  }

  function handleCompletion() {
    stop();
    setCompleted(true);
    setSelectedCell(null);
    if (mode === 'multi' && socket) {
      socket.emit('game:complete', { roomId, time: elapsedRef.current });
    }
  }

  function handleHint() {
    if (hintsLeft === 0 || completed) return;
    const emptyCells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0 && puzzle[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return;

    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = solution[r][c];
    setRevealedCells((prev) => new Set([...prev, `${r},${c}`]));
    setBoard(newBoard);
    setHintsLeft(0);
    setSelectedCell([r, c]);
    checkCompletion(newBoard);
  }

  function handleWildcard() {
    if (wildcardsLeft === 0 || !selectedCell || completed) return;
    const [r, c] = selectedCell;
    if (puzzle[r][c] !== 0) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = solution[r][c];
    setRevealedCells((prev) => new Set([...prev, `${r},${c}`]));
    setBoard(newBoard);
    setWildcardsLeft(0);
    checkCompletion(newBoard);
  }

  const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[difficulty] || difficulty;
  const isWildcardValid =
    selectedCell &&
    puzzle[selectedCell[0]][selectedCell[1]] === 0 &&
    !revealedCells.has(`${selectedCell[0]},${selectedCell[1]}`);
  const totalPlayers = roomPlayers.length || 1;

  return (
    <div className="min-h-screen flex flex-col bg-app-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-app-surface border-b-2 border-app-border gap-3 sticky top-0 z-10">
        <motion.button
          className="flex items-center gap-1.5 px-3 py-2 text-[0.875rem] font-medium text-app-secondary rounded-app-sm hover:text-app-text hover:bg-app-border transition-colors"
          onClick={onHome}
          whileTap={{ scale: 0.97 }}
        >
          &#8592; Exit
        </motion.button>

        <div className="flex gap-2 items-center">
          <span className="text-[0.75rem] font-bold tracking-[0.06em] px-2 py-[3px] rounded bg-app-bg border border-app-border-light text-app-secondary uppercase">
            {size}&times;{size}
          </span>
          <span className="text-[0.75rem] font-bold tracking-[0.06em] px-2 py-[3px] rounded bg-app-accent-light border border-app-accent-border text-app-accent capitalize">
            {difficultyLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Timer elapsed={elapsed} running={running} />
          <ThemeToggle />
        </div>
      </div>

      {/* Main body */}
      <div className="flex-1 flex justify-center items-start px-4 py-6 gap-8 flex-wrap md:flex-nowrap">
        <div className="flex flex-col items-center gap-4">
          <Board
            board={board}
            puzzle={puzzle}
            solution={solution}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            size={size}
            revealedCells={revealedCells}
            completed={completed}
          />
        </div>

        {mode === 'multi' && (
          <div className="w-full md:w-60 md:flex-shrink-0 pt-0 md:pt-2">
            <Leaderboard
              leaderboard={leaderboard}
              players={roomPlayers}
              currentPlayerId={playerId}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      {!completed && (
        <div className="flex flex-col items-center gap-4 px-4 py-6 bg-app-surface border-t-2 border-app-border">
          <PowerUps
            hintsLeft={hintsLeft}
            wildcardsLeft={wildcardsLeft}
            onHint={handleHint}
            onWildcard={handleWildcard}
            disabled={completed}
          />
          <NumberPad
            size={size}
            onNumber={handleNumberInput}
            onErase={handleErase}
            disabled={!selectedCell || puzzle[selectedCell?.[0]]?.[selectedCell?.[1]] !== 0}
          />
        </div>
      )}

      {/* Multiplayer: waiting for others */}
      {mode === 'multi' && completed && !gameOver && (
        <div className="px-6 py-6 flex flex-col items-center gap-4">
          <p className="text-base text-app-secondary italic text-center">
            You finished! Waiting for other players...
          </p>
          <Leaderboard leaderboard={leaderboard} players={roomPlayers} currentPlayerId={playerId} />
        </div>
      )}

      {/* Game over modal */}
      {mode === 'multi' && gameOver && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-app-surface rounded-app p-8 max-w-[500px] w-full shadow-app-lg flex flex-col gap-4"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <h2 className="font-board text-[2rem] font-semibold text-app-text text-center">Game Over!</h2>
            <Leaderboard leaderboard={leaderboard} players={roomPlayers} currentPlayerId={playerId} />
            <div className="flex justify-center gap-3 mt-2">
              {isHost ? (
                <motion.button
                  className="px-5 py-2.5 rounded-app-sm bg-app-accent text-white font-semibold text-[0.9rem] border-2 border-app-accent hover:bg-app-accent-hover transition-colors"
                  onClick={onReturnToLobby}
                  whileTap={{ scale: 0.97 }}
                >
                  Back to Lobby
                </motion.button>
              ) : (
                <p className="text-sm text-app-secondary italic">
                  Waiting for host to return to lobby...
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Single player completion */}
      {mode === 'single' && completed && (
        <CompletionModal
          time={elapsed}
          mode="single"
          rank={1}
          totalPlayers={1}
          onPlayAgain={() => typeof window !== 'undefined' && window.location.reload()}
          onHome={onHome}
        />
      )}
    </div>
  );
}
