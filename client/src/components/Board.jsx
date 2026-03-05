import { getSubgridDims } from '../utils/sudokuGenerator';

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

  function getCellState(row, col) {
    const states = new Set();
    const value = board[row][col];
    const isPrefilled = puzzle[row][col] !== 0;
    const isRevealed = revealedCells.has(`${row},${col}`);

    if (isPrefilled) states.add('prefilled');
    if (isRevealed) states.add('revealed');

    if (selectedCell) {
      const [sr, sc] = selectedCell;
      const isSelected = row === sr && col === sc;

      if (isSelected) {
        states.add('selected');
      } else {
        const inSameRow = row === sr;
        const inSameCol = col === sc;
        const inSameSubgrid =
          Math.floor(row / subRows) === Math.floor(sr / subRows) &&
          Math.floor(col / subCols) === Math.floor(sc / subCols);

        if (inSameRow || inSameCol || inSameSubgrid) states.add('highlight');

        const selectedNum = board[sr][sc];
        if (selectedNum !== 0 && value === selectedNum) states.add('same-number');
      }
    }

    if (value !== 0 && !isPrefilled && value !== solution[row][col]) {
      states.add('error');
    }

    return states;
  }

  function getBorderStyle(row, col) {
    return {
      borderTop: row % subRows === 0 ? '2.5px solid var(--border-bold)' : '1px solid var(--border-light)',
      borderLeft: col % subCols === 0 ? '2.5px solid var(--border-bold)' : '1px solid var(--border-light)',
      borderBottom: row === size - 1 ? '2.5px solid var(--border-bold)' : '0',
      borderRight: col === size - 1 ? '2.5px solid var(--border-bold)' : '0',
    };
  }

  return (
    <div
      className={`board board--${size} ${completed ? 'board--completed' : ''}`}
      style={{ '--board-size': size }}
      role="grid"
      aria-label="Sudoku board"
    >
      {board.map((row, r) =>
        row.map((value, c) => {
          const states = getCellState(r, c);
          const isPrefilled = puzzle[r][c] !== 0;
          const classNames = ['cell', ...Array.from(states).map((s) => `cell--${s}`)].join(' ');

          return (
            <div
              key={`${r}-${c}`}
              className={classNames}
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
