function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getSubgridDims(size) {
  if (size === 4) return { subRows: 2, subCols: 2 };
  if (size === 6) return { subRows: 2, subCols: 3 };
  if (size === 9) return { subRows: 3, subCols: 3 };
  throw new Error(`Unsupported board size: ${size}`);
}

function isValid(board, row, col, num, size) {
  const { subRows, subCols } = getSubgridDims(size);

  for (let c = 0; c < size; c++) {
    if (board[row][c] === num) return false;
  }
  for (let r = 0; r < size; r++) {
    if (board[r][col] === num) return false;
  }

  const startRow = Math.floor(row / subRows) * subRows;
  const startCol = Math.floor(col / subCols) * subCols;
  for (let r = startRow; r < startRow + subRows; r++) {
    for (let c = startCol; c < startCol + subCols; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

function fillBoard(board, size) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) {
        const nums = shuffle([...Array(size).keys()].map((i) => i + 1));
        for (const num of nums) {
          if (isValid(board, r, c, num, size)) {
            board[r][c] = num;
            if (fillBoard(board, size)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(board, size) {
  let count = 0;

  function solve() {
    let emptyRow = -1,
      emptyCol = -1;
    outer: for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) {
          emptyRow = r;
          emptyCol = c;
          break outer;
        }
      }
    }

    if (emptyRow === -1) {
      count++;
      return count >= 2;
    }

    for (let num = 1; num <= size; num++) {
      if (isValid(board, emptyRow, emptyCol, num, size)) {
        board[emptyRow][emptyCol] = num;
        if (solve()) return true;
        board[emptyRow][emptyCol] = 0;
      }
    }
    return false;
  }

  solve();
  return count;
}

const CLUE_COUNTS = {
  4: { easy: 12, medium: 10, hard: 7 },
  6: { easy: 24, medium: 18, hard: 12 },
  9: { easy: 45, medium: 35, hard: 25 },
};

export function generatePuzzle(size, difficulty) {
  const solved = Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));
  fillBoard(solved, size);

  const targetClues = CLUE_COUNTS[size][difficulty];
  const totalCells = size * size;
  const toRemove = totalCells - targetClues;

  const puzzle = solved.map((row) => [...row]);

  let positions = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push([r, c]);
    }
  }
  positions = shuffle(positions);

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= toRemove) break;

    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    const boardCopy = puzzle.map((row) => [...row]);
    const solutions = countSolutions(boardCopy, size);

    if (solutions === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup;
    }
  }

  return {
    puzzle: puzzle.map((row) => [...row]),
    solution: solved,
    size,
    difficulty,
  };
}

export function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
