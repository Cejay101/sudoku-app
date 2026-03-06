'use client';

import { motion } from 'framer-motion';
import { getSubgridDims } from '@/utils/sudokuGenerator';

export default function Board({
  board,
  puzzle,
  solution,
  selectedCell,
  onCellClick,
  size,
  revealedCells = new Set(),
  completed = false,
}) {
  const { subRows, subCols } = getSubgridDims(size);

  function getCellClasses(row, col) {
    const value = board[row][col];
    const isPrefilled = puzzle[row][col] !== 0;
    const isRevealed = revealedCells.has(`${row},${col}`);
    const isError = value !== 0 && !isPrefilled && value !== solution[row][col];

    let base = `cell-${size} flex items-center justify-center font-board font-normal cursor-pointer relative select-none transition-colors `;

    // Priority: error > selected > revealed > highlight/same > prefilled
    if (selectedCell) {
      const [sr, sc] = selectedCell;
      if (row === sr && col === sc) {
        return base + 'bg-app-accent text-white cursor-pointer';
      }
    }

    if (isError) return base + 'text-app-error !bg-cell-error-bg cursor-pointer';

    if (isRevealed) return base + 'text-app-success bg-cell-revealed cursor-default';

    if (selectedCell) {
      const [sr, sc] = selectedCell;
      const inSameRow = row === sr;
      const inSameCol = col === sc;
      const inSameSubgrid =
        Math.floor(row / subRows) === Math.floor(sr / subRows) &&
        Math.floor(col / subCols) === Math.floor(sc / subCols);
      const selectedNum = board[sr][sc];
      const isSameNum = selectedNum !== 0 && value === selectedNum;

      if (isSameNum) return base + (isPrefilled ? 'text-app-text' : 'text-app-accent') + ' bg-cell-same cursor-pointer';
      if (inSameRow || inSameCol || inSameSubgrid) {
        return base + (isPrefilled ? 'text-app-text' : 'text-app-accent') + ' bg-cell-highlight cursor-pointer';
      }
    }

    if (isPrefilled) return base + 'text-app-text bg-app-surface cursor-default';
    return base + 'text-app-accent bg-app-surface cursor-pointer';
  }

  function getBorderStyle(row, col) {
    return {
      borderTop:    row % subRows === 0 ? '2.5px solid var(--border-bold)' : '1px solid var(--border-light)',
      borderLeft:   col % subCols === 0 ? '2.5px solid var(--border-bold)' : '1px solid var(--border-light)',
      borderBottom: row === size - 1 ? '2.5px solid var(--border-bold)' : '0',
      borderRight:  col === size - 1 ? '2.5px solid var(--border-bold)' : '0',
    };
  }

  return (
    <div
      className={`grid border-[2.5px] border-app-border-bold rounded-[2px] overflow-hidden bg-app-border-bold board-grid-${size} ${completed ? 'cursor-default' : ''}`}
      style={{ gap: 0 }}
      role="grid"
      aria-label="Sudoku board"
    >
      {board.map((row, r) =>
        row.map((value, c) => {
          const isPrefilled = puzzle[r][c] !== 0;
          return (
            <div
              key={`${r}-${c}`}
              className={getCellClasses(r, c)}
              style={getBorderStyle(r, c)}
              onClick={() => !completed && !isPrefilled && onCellClick(r, c)}
              role="gridcell"
              aria-label={`Row ${r + 1}, Column ${c + 1}${value ? `, value ${value}` : ', empty'}`}
              tabIndex={isPrefilled ? -1 : 0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (!completed && !isPrefilled) onCellClick(r, c);
                }
              }}
            >
              {value !== 0 ? value : ''}
            </div>
          );
        })
      )}
    </div>
  );
}
