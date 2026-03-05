import { useState } from 'react';

const SIZES = [
  { value: 4, label: '4×4', desc: 'Section A — Quick & fun' },
  { value: 6, label: '6×6', desc: 'Section B — Medium challenge' },
  { value: 9, label: '9×9', desc: 'Section C — Classic Sudoku' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', desc: 'More numbers pre-filled' },
  { value: 'medium', label: 'Medium', desc: 'Balanced challenge' },
  { value: 'hard', label: 'Hard', desc: 'Fewer starting numbers' },
];

export default function SinglePlayerSetup({ onStart, onBack }) {
  const [size, setSize] = useState(9);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  function handleStart() {
    setLoading(true);
    // Use setTimeout to allow UI to update before puzzle generation blocks
    setTimeout(() => {
      onStart(size, difficulty);
    }, 50);
  }

  return (
    <div className="setup">
      <button className="back-btn" onClick={onBack}>&#8592; Back</button>
      <h2 className="setup__title">New Game</h2>

      <section className="setup__section">
        <h3 className="setup__label">Board Size</h3>
        <div className="setup__options">
          {SIZES.map((s) => (
            <button
              key={s.value}
              className={`option-card ${size === s.value ? 'option-card--active' : ''}`}
              onClick={() => setSize(s.value)}
            >
              <span className="option-card__title">{s.label}</span>
              <span className="option-card__desc">{s.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="setup__section">
        <h3 className="setup__label">Difficulty</h3>
        <div className="setup__options">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              className={`option-card ${difficulty === d.value ? 'option-card--active' : ''}`}
              onClick={() => setDifficulty(d.value)}
            >
              <span className="option-card__title">{d.label}</span>
              <span className="option-card__desc">{d.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <button
        className="btn btn--primary btn--large"
        onClick={handleStart}
        disabled={loading}
      >
        {loading ? 'Generating puzzle...' : 'Start Game'}
      </button>
    </div>
  );
}
