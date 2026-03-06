'use client';

import { motion } from 'framer-motion';
import { formatTime } from '@/utils/sudokuGenerator';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ leaderboard, players, currentPlayerId, compact = false }) {
  const finished = leaderboard || [];
  const finishedIds = new Set(finished.map((p) => p.id));
  const playing = (players || []).filter((p) => !finishedIds.has(p.id) && p.status !== 'waiting');

  return (
    <div className="bg-app-surface border-2 border-app-border rounded-app p-4">
      {!compact && (
        <h3 className="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-app-secondary mb-3">
          Leaderboard
        </h3>
      )}

      {finished.length === 0 && playing.length === 0 && (
        <p className="text-[0.85rem] text-app-muted italic">Waiting for players to finish...</p>
      )}

      <ul className="flex flex-col gap-1.5">
        {finished.map((entry, i) => (
          <motion.li
            key={entry.id}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-app-sm text-[0.875rem] bg-app-success-light border border-[#bbf7d0]
              ${entry.id === currentPlayerId ? '!border-2 !border-app-accent !bg-app-accent-light' : ''}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <span className="text-[1.1rem] min-w-[28px] text-center">
              {i < 3 ? MEDALS[i] : `#${entry.rank}`}
            </span>
            <span className="flex-1 font-medium">
              {entry.name}{entry.id === currentPlayerId && ' (you)'}
            </span>
            <span className="font-board text-base font-semibold text-app-success">{formatTime(entry.time)}</span>
          </motion.li>
        ))}

        {playing.map((player) => (
          <li
            key={player.id}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-app-sm text-[0.875rem] bg-app-raised opacity-80
              ${player.id === currentPlayerId ? 'border-2 border-app-accent bg-app-accent-light' : ''}`}
          >
            <span className="text-[1.1rem] min-w-[28px] text-center">&#9654;</span>
            <span className="flex-1 font-medium">
              {player.name}{player.id === currentPlayerId && ' (you)'}
            </span>
            <span className="text-[0.8rem] text-app-muted italic">Playing...</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
