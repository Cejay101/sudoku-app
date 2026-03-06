'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const SIZES = [
  { value: 4, label: '4×4' },
  { value: 6, label: '6×6' },
  { value: 9, label: '9×9' },
];

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard',   label: 'Hard' },
];

export default function MultiplayerSetup({ onCreateRoom, onJoinRoom, onBack, initialRoomId = '' }) {
  const [tab, setTab] = useState(initialRoomId ? 'join' : 'create');
  const [playerName, setPlayerName] = useState('');
  const [size, setSize] = useState(9);
  const [difficulty, setDifficulty] = useState('medium');
  const [roomCode, setRoomCode] = useState(initialRoomId);
  const [error, setError] = useState('');

  function handleCreate() {
    if (!playerName.trim()) { setError('Please enter your name'); return; }
    setError('');
    onCreateRoom(playerName.trim(), size, difficulty);
  }

  function handleJoin() {
    if (!playerName.trim()) { setError('Please enter your name'); return; }
    if (!roomCode.trim())   { setError('Please enter a room code'); return; }
    setError('');
    onJoinRoom(playerName.trim(), roomCode.trim().toUpperCase());
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 max-w-[560px] mx-auto w-full gap-6 bg-app-bg">
      <motion.button
        className="self-start flex items-center gap-1.5 px-3 py-2 text-[0.875rem] font-medium text-app-secondary rounded-app-sm hover:text-app-text hover:bg-app-border transition-colors"
        onClick={onBack}
        whileTap={{ scale: 0.97 }}
      >
        &#8592; Back
      </motion.button>

      <h2 className="font-board text-[2rem] font-semibold text-app-text">Multiplayer</h2>

      {/* Name input */}
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-app-secondary" htmlFor="player-name">
          Your Name
        </label>
        <input
          id="player-name"
          className="w-full px-[14px] py-[11px] border-2 border-app-border-light rounded-app-sm text-base bg-app-surface text-app-text outline-none focus:border-app-accent transition-colors"
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          onKeyDown={(e) => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-2 border-app-border-light rounded-app-sm overflow-hidden bg-app-bg">
        {['create', 'join'].map((t) => (
          <button
            key={t}
            className={`flex-1 py-2.5 font-semibold text-[0.9rem] transition-colors
              ${tab === t ? 'bg-app-accent text-white' : 'text-app-secondary hover:text-app-text hover:bg-app-border'}`}
            onClick={() => setTab(t)}
          >
            {t === 'create' ? 'Create Room' : 'Join Room'}
          </button>
        ))}
      </div>

      {/* Create tab */}
      {tab === 'create' && (
        <motion.div
          key="create"
          className="flex flex-col gap-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <section className="flex flex-col gap-2.5">
            <h3 className="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-app-secondary">Board Size</h3>
            <div className="flex flex-wrap gap-2.5">
              {SIZES.map((s) => (
                <motion.button
                  key={s.value}
                  className={`flex-1 py-2.5 px-3.5 border-2 rounded-app-sm font-bold text-base transition-colors
                    ${size === s.value ? 'border-app-accent bg-app-accent-light text-app-accent' : 'border-app-border bg-app-surface text-app-text hover:border-app-accent-border hover:bg-app-accent-light'}`}
                  onClick={() => setSize(s.value)}
                  whileTap={{ scale: 0.97 }}
                >
                  {s.label}
                </motion.button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <h3 className="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-app-secondary">Difficulty</h3>
            <div className="flex flex-wrap gap-2.5">
              {DIFFICULTIES.map((d) => (
                <motion.button
                  key={d.value}
                  className={`flex-1 py-2.5 px-3.5 border-2 rounded-app-sm font-bold text-base transition-colors
                    ${difficulty === d.value ? 'border-app-accent bg-app-accent-light text-app-accent' : 'border-app-border bg-app-surface text-app-text hover:border-app-accent-border hover:bg-app-accent-light'}`}
                  onClick={() => setDifficulty(d.value)}
                  whileTap={{ scale: 0.97 }}
                >
                  {d.label}
                </motion.button>
              ))}
            </div>
          </section>

          {error && <p className="text-app-error text-[0.85rem] px-3 py-2 bg-app-error-light rounded-app-sm border border-[#fca5a5]">{error}</p>}

          <motion.button
            className="flex items-center justify-center px-7 py-3.5 rounded-app bg-app-accent text-white font-semibold text-base border-2 border-app-accent hover:bg-app-accent-hover transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
            onClick={handleCreate}
            whileTap={{ scale: 0.98 }}
          >
            Create Room
          </motion.button>
        </motion.div>
      )}

      {/* Join tab */}
      {tab === 'join' && (
        <motion.div
          key="join"
          className="flex flex-col gap-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col gap-2">
            <label className="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-app-secondary" htmlFor="room-code">
              Room Code
            </label>
            <input
              id="room-code"
              className="w-full px-[14px] py-[11px] border-2 border-app-border-light rounded-app-sm bg-app-surface text-app-text outline-none focus:border-app-accent transition-colors tracking-[0.25em] text-xl font-bold text-center uppercase"
              type="text"
              placeholder="XXXXXX"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>

          {error && <p className="text-app-error text-[0.85rem] px-3 py-2 bg-app-error-light rounded-app-sm border border-[#fca5a5]">{error}</p>}

          <motion.button
            className="flex items-center justify-center px-7 py-3.5 rounded-app bg-app-accent text-white font-semibold text-base border-2 border-app-accent hover:bg-app-accent-hover transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
            onClick={handleJoin}
            whileTap={{ scale: 0.98 }}
          >
            Join Room
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
