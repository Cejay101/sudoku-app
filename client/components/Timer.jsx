'use client';

import { formatTime } from '@/utils/sudokuGenerator';

export default function Timer({ elapsed, running, compact = false }) {
  return (
    <div className={`flex items-center gap-1.5 font-board font-normal text-app-text min-w-[80px] ${compact ? 'text-base' : 'text-[1.4rem]'}`}>
      <span className="opacity-60 text-base" aria-hidden="true">&#9201;</span>
      <span className="tabular-nums">{formatTime(elapsed)}</span>
    </div>
  );
}
