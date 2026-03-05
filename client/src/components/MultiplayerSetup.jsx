import { useState } from 'react';

const SIZES = [
  { value: 4, label: '4×4' },
  { value: 6, label: '6×6' },
  { value: 9, label: '9×9' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export default function MultiplayerSetup({ onCreateRoom, onJoinRoom, onBack, initialRoomId = '' }) {
  const [tab, setTab] = useState(initialRoomId ? 'join' : 'create');
  const [playerName, setPlayerName] = useState('');
  const [size, setSize] = useState(9);
  const [difficulty, setDifficulty] = useState('medium');
  const [roomCode, setRoomCode] = useState(initialRoomId);
  const [error, setError] = useState('');

  function handleCreate() {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    setError('');
    onCreateRoom(playerName.trim(), size, difficulty);
  }

  function handleJoin() {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setError('');
    onJoinRoom(playerName.trim(), roomCode.trim().toUpperCase());
  }

  return (
    <div className="setup">
      <button className="back-btn" onClick={onBack}>&#8592; Back</button>
      <h2 className="setup__title">Multiplayer</h2>

      <div className="setup__name-row">
        <label className="setup__label" htmlFor="player-name">Your Name</label>
        <input
          id="player-name"
          className="input"
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          onKeyDown={(e) => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
        />
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === 'create' ? 'tab--active' : ''}`}
          onClick={() => setTab('create')}
        >
          Create Room
        </button>
        <button
          className={`tab ${tab === 'join' ? 'tab--active' : ''}`}
          onClick={() => setTab('join')}
        >
          Join Room
        </button>
      </div>

      {tab === 'create' && (
        <div className="setup__tab-content">
          <section className="setup__section">
            <h3 className="setup__label">Board Size</h3>
            <div className="setup__options setup__options--row">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  className={`option-card option-card--small ${size === s.value ? 'option-card--active' : ''}`}
                  onClick={() => setSize(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section className="setup__section">
            <h3 className="setup__label">Difficulty</h3>
            <div className="setup__options setup__options--row">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  className={`option-card option-card--small ${difficulty === d.value ? 'option-card--active' : ''}`}
                  onClick={() => setDifficulty(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </section>

          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn--primary btn--large" onClick={handleCreate}>
            Create Room
          </button>
        </div>
      )}

      {tab === 'join' && (
        <div className="setup__tab-content">
          <div className="setup__section">
            <label className="setup__label" htmlFor="room-code">Room Code</label>
            <input
              id="room-code"
              className="input input--code"
              type="text"
              placeholder="Enter 6-letter code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn--primary btn--large" onClick={handleJoin}>
            Join Room
          </button>
        </div>
      )}
    </div>
  );
}
