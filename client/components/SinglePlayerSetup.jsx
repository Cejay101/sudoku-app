'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const SIZES = [
  { value: 4, label: '4×4', desc: 'Quick & fun' },
  { value: 6, label: '6×6', desc: 'Medium challenge' },
  { value: 9, label: '9×9', desc: 'Classic Sudoku' },
];

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy',   desc: 'More numbers pre-filled' },
  { value: 'medium', label: 'Medium', desc: 'Balanced challenge' },
  { value: 'hard',   label: 'Hard',   desc: 'Fewer starting numbers' },
];

function OptionCard({ active, onClick, title, desc }) {
  return (
    <motion.button
      className={`flex flex-col gap-[3px] px-[18px] py-[14px] border-2 rounded-app-sm text-left transition-colors
        ${active
          ? 'border-app-accent bg-app-accent-light'
          : 'border-app-border bg-app-surface hover:border-app-accent-border hover:bg-app-accent-light'
        }`}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      <span className="font-bold text-base text-app-text">{title}</span>
      {desc && <span className="text-[0.8rem] text-app-secondary">{desc}</span>}
    </motion.button>
  );
}

export default function SinglePlayerSetup({ onStart, onBack }) {
  const [size, setSize] = useState(9);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  function handleStart() {
    setLoading(true);
    setTimeout(() => onStart(size, difficulty), 50);
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 max-w-[560px] mx-auto w-full gap-6 bg-app-bg">
      <motion.button
        className="self-start flex items-center gap-1.5 px-3 py-2 text-[0.875rem] font-medium text-app-secondary rounded-app-sm hover:text-app-text hover:bg-app-border transition-colors"
        onClick={onBack}
        whileTap={{ scale: 0.97 }}
      >
        &#8592; Back
      </motion.button>

      <h2 className="font-board text-[2rem] font-semibold text-app-text">New Game</h2>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-app-secondary">Board Size</h3>
        <div className="flex flex-col gap-2.5">
          {SIZES.map((s) => (
            <OptionCard key={s.value} active={size === s.value} onClick={() => setSize(s.value)} title={s.label} desc={s.desc} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-app-secondary">Difficulty</h3>
        <div className="flex flex-col gap-2.5">
          {DIFFICULTIES.map((d) => (
            <OptionCard key={d.value} active={difficulty === d.value} onClick={() => setDifficulty(d.value)} title={d.label} desc={d.desc} />
          ))}
        </div>
      </section>

      <motion.button
        className="flex items-center justify-center px-7 py-3.5 rounded-app bg-app-accent text-white font-semibold text-base border-2 border-app-accent
          hover:bg-app-accent-hover hover:border-app-accent-hover disabled:opacity-45 disabled:cursor-not-allowed shadow-sm hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all"
        onClick={handleStart}
        disabled={loading}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? 'Generating puzzle...' : 'Start Game'}
      </motion.button>
    </div>
  );
}
