export default function HomePage({ onSinglePlayer, onMultiplayer }) {
  return (
    <div className="home">
      <div className="home__hero">
        <div className="home__logo" aria-hidden="true">
          <div className="home__logo-grid">
            {[5,3,0, 6,0,0, 0,9,8,
              0,7,0, 1,9,5, 0,0,0,
              0,0,0, 0,0,0, 0,6,0].map((n, i) => (
              <span key={i} className={n ? 'home__logo-cell--filled' : 'home__logo-cell--empty'}>
                {n || ''}
              </span>
            ))}
          </div>
        </div>
        <h1 className="home__title">Sudoku</h1>
        <p className="home__subtitle">Classic logic puzzle — solo or with friends</p>
      </div>

      <div className="home__modes">
        <button className="mode-card" onClick={onSinglePlayer}>
          <span className="mode-card__icon" aria-hidden="true">&#9899;</span>
          <div className="mode-card__body">
            <h2 className="mode-card__title">Single Player</h2>
            <p className="mode-card__desc">
              Play at your own pace. Choose your board size and difficulty.
            </p>
          </div>
          <span className="mode-card__arrow" aria-hidden="true">&#8250;</span>
        </button>

        <button className="mode-card mode-card--multi" onClick={onMultiplayer}>
          <span className="mode-card__icon" aria-hidden="true">&#128101;</span>
          <div className="mode-card__body">
            <h2 className="mode-card__title">Multiplayer</h2>
            <p className="mode-card__desc">
              Race against 2–10 players. First to finish wins.
            </p>
          </div>
          <span className="mode-card__arrow" aria-hidden="true">&#8250;</span>
        </button>
      </div>

      <footer className="home__footer">
        <p>4&times;4 &bull; 6&times;6 &bull; 9&times;9 &nbsp;|&nbsp; Easy &bull; Medium &bull; Hard</p>
      </footer>
    </div>
  );
}
