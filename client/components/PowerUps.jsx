'use client';

import { motion } from 'framer-motion';

function PowerUpBtn({ icon, label, count, used, onClick, disabled, title }) {
  return (
    <motion.button
      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-app-surface border-2 border-app-border-light rounded-app-sm transition-colors
        ${used ? 'opacity-45 cursor-not-allowed' : 'hover:bg-app-accent-light hover:border-app-accent'}`}
      onClick={onClick}
      disabled={disabled || used}
      title={title}
      whileTap={!used && !disabled ? { scale: 0.97 } : {}}
    >
      <span className="text-xl" aria-hidden="true">{icon}</span>
      <span className="font-semibold text-[0.85rem] text-app-text">{label}</span>
      <span className="text-[0.75rem] text-app-muted">{count}/1</span>
    </motion.button>
  );
}

export default function PowerUps({ hintsLeft, wildcardsLeft, onHint, onWildcard, disabled = false }) {
  return (
    <div className="flex gap-3 justify-center w-full max-w-[420px]">
      <PowerUpBtn
        icon="💡"
        label="Hint"
        count={hintsLeft}
        used={hintsLeft === 0}
        onClick={onHint}
        disabled={disabled}
        title="Hint: reveals a correct value in a random empty cell"
      />
      <PowerUpBtn
        icon="🃏"
        label="Wildcard"
        count={wildcardsLeft}
        used={wildcardsLeft === 0}
        onClick={onWildcard}
        disabled={disabled}
        title="Wildcard: reveals the correct value for the selected cell"
      />
    </div>
  );
}
