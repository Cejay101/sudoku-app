import { formatTime } from '../utils/sudokuGenerator';

export default function Timer({ elapsed, running, compact = false }) {
  const display = formatTime(elapsed);

  return (
    <div className={`timer ${running ? 'timer--running' : ''} ${compact ? 'timer--compact' : ''}`}>
      <span className="timer__icon">&#9201;</span>
      <span className="timer__display">{display}</span>
    </div>
  );
}
