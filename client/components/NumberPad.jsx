'use client';

import { motion } from 'framer-motion';

export default function NumberPad({ size, onNumber, onErase, disabled = false }) {
  const numbers = Array.from({ length: size }, (_, i) => i + 1);
  const cols = size <= 6 ? size : Math.ceil(size / 2);
  const gridClass = `pad-grid-${cols}`;

  return (
    <div className="flex flex-col items-center gap-2.5 w-full max-w-[420px]">
      <div className={`grid ${gridClass} gap-1.5 w-full`}>
        {numbers.map((n) => (
          <motion.button
            key={n}
            className="aspect-square flex items-center justify-center font-board text-[1.4rem] font-normal bg-app-surface border-2 border-app-border-light rounded-app-sm text-app-accent min-h-[44px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-app-accent-light hover:border-app-accent"
            onClick={() => onNumber(n)}
            disabled={disabled}
            aria-label={`Enter ${n}`}
            whileHover={!disabled ? { scale: 1.06 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          >
            {n}
          </motion.button>
        ))}
      </div>
      <motion.button
        className="w-full py-2.5 bg-app-surface border-2 border-app-border-light rounded-app-sm text-[0.9rem] font-semibold text-app-secondary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-app-error-light hover:border-app-error hover:text-app-error transition-colors"
        onClick={onErase}
        disabled={disabled}
        aria-label="Erase cell"
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        Erase
      </motion.button>
    </div>
  );
}
