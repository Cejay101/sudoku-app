export default function NumberPad({ size, onNumber, onErase, disabled = false }) {
  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  return (
    <div className="number-pad">
      <div className="number-pad__grid" style={{ '--pad-cols': size <= 6 ? size : Math.ceil(size / 2) }}>
        {numbers.map((n) => (
          <button
            key={n}
            className="number-pad__btn"
            onClick={() => onNumber(n)}
            disabled={disabled}
            aria-label={`Enter ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        className="number-pad__erase"
        onClick={onErase}
        disabled={disabled}
        aria-label="Erase cell"
      >
        Erase
      </button>
    </div>
  );
}
