import { formatTime } from '../utils/sudokuGenerator';

export default function CompletionModal({ time, mode, rank, totalPlayers, onPlayAgain, onHome }) {
  const isFirst = rank === 1;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__confetti" aria-hidden="true">
          {isFirst ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎉'}
        </div>

        <h2 className="modal__title">
          {mode === 'single'
            ? 'Puzzle Complete!'
            : isFirst
            ? 'You Won!'
            : `You Finished #${rank}!`}
        </h2>

        <p className="modal__time">
          Your time: <strong>{formatTime(time)}</strong>
        </p>

        {mode === 'multi' && (
          <p className="modal__rank">
            Rank: <strong>
              {rank} / {totalPlayers}
            </strong>
          </p>
        )}

        <div className="modal__actions">
          {mode === 'single' && (
            <button className="btn btn--primary" onClick={onPlayAgain}>
              Play Again
            </button>
          )}
          <button className="btn btn--secondary" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
