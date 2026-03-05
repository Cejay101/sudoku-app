import { formatTime } from '../utils/sudokuGenerator';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ leaderboard, players, currentPlayerId, compact = false }) {
  // Build combined list: finished players (ranked) + still playing
  const finished = leaderboard || [];
  const finishedIds = new Set(finished.map((p) => p.id));
  const playing = (players || []).filter(
    (p) => !finishedIds.has(p.id) && p.status !== 'waiting'
  );

  return (
    <div className={`leaderboard ${compact ? 'leaderboard--compact' : ''}`}>
      {!compact && <h3 className="leaderboard__title">Leaderboard</h3>}

      {finished.length === 0 && playing.length === 0 && (
        <p className="leaderboard__empty">Waiting for players to finish...</p>
      )}

      <ul className="leaderboard__list">
        {finished.map((entry, i) => (
          <li
            key={entry.id}
            className={`leaderboard__item leaderboard__item--finished ${
              entry.id === currentPlayerId ? 'leaderboard__item--me' : ''
            }`}
          >
            <span className="leaderboard__rank">
              {i < 3 ? MEDALS[i] : `#${entry.rank}`}
            </span>
            <span className="leaderboard__name">
              {entry.name}
              {entry.id === currentPlayerId && ' (you)'}
            </span>
            <span className="leaderboard__time">{formatTime(entry.time)}</span>
          </li>
        ))}

        {playing.map((player) => (
          <li
            key={player.id}
            className={`leaderboard__item leaderboard__item--playing ${
              player.id === currentPlayerId ? 'leaderboard__item--me' : ''
            }`}
          >
            <span className="leaderboard__rank">&#9654;</span>
            <span className="leaderboard__name">
              {player.name}
              {player.id === currentPlayerId && ' (you)'}
            </span>
            <span className="leaderboard__time leaderboard__time--playing">Playing...</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
