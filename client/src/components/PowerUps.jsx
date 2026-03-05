export default function PowerUps({ hintsLeft, wildcardsLeft, onHint, onWildcard, disabled = false }) {
  return (
    <div className="power-ups">
      <button
        className={`power-ups__btn ${hintsLeft === 0 ? 'power-ups__btn--used' : ''}`}
        onClick={onHint}
        disabled={disabled || hintsLeft === 0}
        title="Hint: reveals a correct value in a random empty cell"
      >
        <span className="power-ups__icon">&#128161;</span>
        <span className="power-ups__label">Hint</span>
        <span className="power-ups__count">{hintsLeft}/1</span>
      </button>

      <button
        className={`power-ups__btn ${wildcardsLeft === 0 ? 'power-ups__btn--used' : ''}`}
        onClick={onWildcard}
        disabled={disabled || wildcardsLeft === 0}
        title="Wildcard: reveals the correct value for the selected cell"
      >
        <span className="power-ups__icon">&#127183;</span>
        <span className="power-ups__label">Wildcard</span>
        <span className="power-ups__count">{wildcardsLeft}/1</span>
      </button>
    </div>
  );
}
