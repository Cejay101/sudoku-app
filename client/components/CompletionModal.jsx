'use client';

import { motion } from 'framer-motion';
import { formatTime } from '@/utils/sudokuGenerator';

export default function CompletionModal({ time, mode, rank, totalPlayers, onPlayAgain, onHome }) {
  const isFirst = rank === 1;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-app-surface rounded-app px-9 py-10 max-w-[380px] w-full text-center shadow-app-lg flex flex-col gap-4"
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="text-[3.5rem] leading-none" aria-hidden="true">
          {isFirst ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎉'}
        </div>

        <h2 className="font-board text-[2rem] font-semibold text-app-text">
          {mode === 'single' ? 'Puzzle Complete!' : isFirst ? 'You Won!' : `You Finished #${rank}!`}
        </h2>

        <p className="text-[1.1rem] text-app-secondary">
          Your time: <strong className="text-[1.4rem] text-app-text">{formatTime(time)}</strong>
        </p>

        {mode === 'multi' && (
          <p className="text-base text-app-secondary">
            Rank: <strong className="text-app-accent">{rank} / {totalPlayers}</strong>
          </p>
        )}

        <div className="flex gap-3 justify-center mt-2">
          {mode === 'single' && (
            <motion.button
              className="flex items-center justify-center px-5 py-2.5 rounded-app-sm bg-app-accent text-white font-semibold text-[0.9rem] border-2 border-app-accent hover:bg-app-accent-hover transition-colors"
              onClick={onPlayAgain}
              whileTap={{ scale: 0.97 }}
            >
              Play Again
            </motion.button>
          )}
          <motion.button
            className="flex items-center justify-center px-5 py-2.5 rounded-app-sm bg-app-surface text-app-text font-semibold text-[0.9rem] border-2 border-app-border-light hover:bg-app-raised hover:border-app-accent hover:text-app-accent transition-colors"
            onClick={onHome}
            whileTap={{ scale: 0.97 }}
          >
            Home
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
