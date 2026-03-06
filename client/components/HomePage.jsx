'use client';

import { motion } from 'framer-motion';

const LOGO_PATTERN = [5,3,0, 6,0,0, 0,9,8, 0,7,0, 1,9,5, 0,0,0, 0,0,0, 0,0,0, 0,6,0];

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' },
  }),
  hover: { y: -3, transition: { duration: 0.15 } },
  tap:   { y: 0, scale: 0.98 },
};

export default function HomePage({ onSinglePlayer, onMultiplayer }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-8 bg-app-bg">
      {/* Hero */}
      <motion.div
        className="flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Mini sudoku logo */}
        <div className="grid gap-[1px] mb-1" style={{ gridTemplateColumns: 'repeat(9, 8px)', gridTemplateRows: 'repeat(3, 8px)' }} aria-hidden="true">
          {LOGO_PATTERN.map((n, i) => (
            <span key={i} className={`rounded-[1px] ${n ? 'bg-app-accent' : 'bg-app-border-light'}`} />
          ))}
        </div>

        <h1 className="font-board text-6xl font-semibold tracking-tight text-app-text leading-none">
          Sudoku
        </h1>
        <p className="text-app-secondary text-base">Classic logic puzzle — solo or with friends</p>
      </motion.div>

      {/* Mode cards */}
      <div className="flex flex-col gap-4 w-full max-w-[440px]">
        <motion.button
          className="flex items-center gap-4 px-6 py-5 bg-app-surface border-2 border-app-border rounded-app text-left shadow-app hover:border-app-accent hover:shadow-app-lg"
          onClick={onSinglePlayer}
          custom={0}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
        >
          <span className="text-[1.75rem] w-11 text-center flex-shrink-0" aria-hidden="true">&#9899;</span>
          <div className="flex-1">
            <h2 className="text-[1.1rem] font-bold text-app-text mb-[3px]">Single Player</h2>
            <p className="text-[0.85rem] text-app-secondary">Play at your own pace. Choose your board size and difficulty.</p>
          </div>
          <span className="text-2xl text-app-muted" aria-hidden="true">&#8250;</span>
        </motion.button>

        <motion.button
          className="flex items-center gap-4 px-6 py-5 bg-app-surface border-2 border-app-border rounded-app text-left shadow-app hover:border-purple-600 hover:shadow-app-lg"
          onClick={onMultiplayer}
          custom={1}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
        >
          <span className="text-[1.75rem] w-11 text-center flex-shrink-0" aria-hidden="true">&#128101;</span>
          <div className="flex-1">
            <h2 className="text-[1.1rem] font-bold text-app-text mb-[3px]">Multiplayer</h2>
            <p className="text-[0.85rem] text-app-secondary">Race against 2–10 players. First to finish wins.</p>
          </div>
          <span className="text-2xl text-app-muted" aria-hidden="true">&#8250;</span>
        </motion.button>
      </div>

      <footer className="text-[0.8rem] text-app-muted text-center">
        <p>4&times;4 &bull; 6&times;6 &bull; 9&times;9 &nbsp;|&nbsp; Easy &bull; Medium &bull; Hard</p>
      </footer>
    </div>
  );
}
