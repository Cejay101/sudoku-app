import { useState, useEffect, useCallback, useRef } from 'react';
import Board from './Board';
import NumberPad from './NumberPad';
import Timer from './Timer';
import PowerUps from './PowerUps';
import Leaderboard from './Leaderboard';
import CompletionModal from './CompletionModal';
import { useTimer } from '../hooks/useTimer';

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
  serverStartTime,
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
  const [myRank, setMyRank] = useState(null);
  const { elapsed, running, start, stop, startFrom } = useTimer();
  const elapsedRef = useRef(0);
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

  // Start the timer
  useEffect(() => {
    if (serverStartTime) {
      startFrom(serverStartTime);
    } else {
      start();
    }
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

      if (selectedCell) {
        const [r, c] = selectedCell;

        if (e.key >= '1' && e.key <= String(size)) {
          const num = parseInt(e.key);
          handleNumberInput(num);
          return;
        }

        if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
          handleErase();
          return;
        }

        // Arrow key navigation
        const moves = {
          ArrowUp: [-1, 0],
          ArrowDown: [1, 0],
          ArrowLeft: [0, -1],
          ArrowRight: [0, 1],
        };
        if (moves[e.key]) {
          const [dr, dc] = moves[e.key];
          const newR = Math.max(0, Math.min(size - 1, r + dr));
          const newC = Math.max(0, Math.min(size - 1, c + dc));
          setSelectedCell([newR, newC]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, completed, size]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCellClick(r, c) {
    if (puzzle[r][c] !== 0) return; // Can't select prefilled
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

    if (mode === 'single') {
      // Single player: just show the completion modal
    }
  }

  function handleHint() {
    if (hintsLeft === 0 || completed) return;

    const emptyCells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0 && puzzle[r][c] === 0) {
          emptyCells.push([r, c]);
        }
      }
    }

    if (emptyCells.length === 0) return;

    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = solution[r][c];

    const key = `${r},${c}`;
    setRevealedCells((prev) => new Set([...prev, key]));
    setBoard(newBoard);
    setHintsLeft(0);
    setSelectedCell([r, c]);
    checkCompletion(newBoard);
  }

  function handleWildcard() {
    if (wildcardsLeft === 0 || !selectedCell || completed) return;
    const [r, c] = selectedCell;

    if (puzzle[r][c] !== 0) return; // Can't use on prefilled

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = solution[r][c];

    const key = `${r},${c}`;
    setRevealedCells((prev) => new Set([...prev, key]));
    setBoard(newBoard);
    setWildcardsLeft(0);
    checkCompletion(newBoard);
  }

  // Determine rank for single player completion (always rank 1 for SP)
  function getMyRank() {
    if (mode === 'single') return 1;
    const entry = leaderboard.find((e) => e.id === playerId);
    return entry ? entry.rank : null;
  }

  const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[difficulty] || difficulty;
  const isEmpty = !selectedCell || board[selectedCell[0]][selectedCell[1]] === 0;
  const isWildcardValid =
    selectedCell &&
    puzzle[selectedCell[0]][selectedCell[1]] === 0 &&
    !revealedCells.has(`${selectedCell[0]},${selectedCell[1]}`);

  const totalPlayers = roomPlayers.length || 1;

  return (
    <div className={`game game--${mode}`}>
      {/* Header */}
      <div className="game__header">
        <button className="back-btn" onClick={onHome}>&#8592; Exit</button>
        <div className="game__meta">
          <span className="game__badge">{size}&times;{size}</span>
          <span className="game__badge game__badge--difficulty">{difficultyLabel}</span>
        </div>
        <Timer elapsed={elapsed} running={running} />
      </div>

      {/* Main area */}
      <div className="game__body">
        <div className="game__board-area">
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

        {/* Sidebar for multiplayer leaderboard */}
        {mode === 'multi' && (
          <div className="game__sidebar">
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
        <div className="game__controls">
          <PowerUps
            hintsLeft={hintsLeft}
            wildcardsLeft={wildcardsLeft}
            onHint={handleHint}
            onWildcard={handleWildcard}
            disabled={completed || (wildcardsLeft > 0 && !isWildcardValid && false)}
          />
          <NumberPad
            size={size}
            onNumber={handleNumberInput}
            onErase={handleErase}
            disabled={!selectedCell || puzzle[selectedCell?.[0]]?.[selectedCell?.[1]] !== 0}
          />
        </div>
      )}

      {/* Multiplayer leaderboard (bottom on mobile when completed) */}
      {mode === 'multi' && completed && !gameOver && (
        <div className="game__finished-waiting">
          <p className="game__finished-msg">
            You finished! Waiting for other players...
          </p>
          <Leaderboard
            leaderboard={leaderboard}
            players={roomPlayers}
            currentPlayerId={playerId}
          />
        </div>
      )}

      {/* Game over (all players finished in multiplayer) */}
      {mode === 'multi' && gameOver && (
        <div className="modal-overlay">
          <div className="modal modal--wide">
            <h2 className="modal__title">Game Over!</h2>
            <Leaderboard
              leaderboard={leaderboard}
              players={roomPlayers}
              currentPlayerId={playerId}
            />
            <div className="modal__actions">
              <button className="btn btn--primary" onClick={onHome}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single player completion */}
      {mode === 'single' && completed && (
        <CompletionModal
          time={elapsed}
          mode="single"
          rank={1}
          totalPlayers={1}
          onPlayAgain={() => window.location.reload()}
          onHome={onHome}
        />
      )}
    </div>
  );
}
