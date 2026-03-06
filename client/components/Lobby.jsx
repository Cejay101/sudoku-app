'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';

export default function Lobby({ room, playerId, onStartGame, onBack }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}?room=${room.id}`;
  const isHost = room.hostId === playerId;
  const playerCount = room.players.length;
  const canStart = isHost && playerCount >= 2;

  useEffect(() => {
    QRCode.toDataURL(shareUrl, { width: 200, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [shareUrl]);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyCode() {
    navigator.clipboard.writeText(room.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 max-w-[800px] mx-auto w-full gap-6 bg-app-bg">
      <motion.button
        className="self-start flex items-center gap-1.5 px-3 py-2 text-[0.875rem] font-medium text-app-secondary rounded-app-sm hover:text-app-text hover:bg-app-border transition-colors"
        onClick={onBack}
        whileTap={{ scale: 0.97 }}
      >
        &#8592; Leave
      </motion.button>

      <div className="flex flex-col gap-1">
        <h2 className="font-board text-[2rem] font-semibold text-app-text">Waiting Room</h2>
        <p className="text-[0.9rem] text-app-secondary">
          {room.boardSize}&times;{room.boardSize} &bull;{' '}
          <span className="font-semibold text-app-accent capitalize">{room.difficulty}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Players list */}
        <div className="flex flex-col gap-4">
          <div className="bg-app-surface border-2 border-app-border rounded-app p-5 flex flex-col gap-4">
            <h3 className="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-app-secondary">
              Players ({playerCount}/10)
            </h3>

            <ul className="flex flex-col gap-2">
              {room.players.map((p) => (
                <motion.li
                  key={p.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-app-sm ${
                    p.id === playerId ? 'bg-app-accent-light border border-app-accent-border' : 'bg-app-raised'
                  }`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="w-2 h-2 rounded-full bg-app-success flex-shrink-0" />
                  <span className="flex-1 font-medium text-[0.9rem] flex items-center gap-1.5">
                    {p.name}
                    {p.isHost && (
                      <span className="text-[0.65rem] font-bold tracking-[0.06em] uppercase px-1.5 py-0.5 rounded-[3px] bg-[#fef3c7] text-[#92400e]">
                        HOST
                      </span>
                    )}
                    {p.id === playerId && (
                      <span className="text-[0.65rem] font-bold tracking-[0.06em] uppercase px-1.5 py-0.5 rounded-[3px] bg-app-accent-light text-app-accent">
                        YOU
                      </span>
                    )}
                  </span>
                </motion.li>
              ))}
            </ul>

            {!isHost && (
              <p className="text-[0.85rem] text-app-secondary italic">Waiting for host to start the game...</p>
            )}
          </div>

          {isHost && (
            <motion.button
              className={`flex items-center justify-center px-7 py-3.5 rounded-app font-semibold text-base border-2 transition-all ${
                canStart
                  ? 'bg-app-accent text-white border-app-accent hover:bg-app-accent-hover shadow-sm hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)]'
                  : 'bg-[#e5e7eb] text-[#9ca3af] border-[#e5e7eb] cursor-not-allowed'
              }`}
              onClick={onStartGame}
              disabled={!canStart}
              whileTap={canStart ? { scale: 0.98 } : {}}
            >
              {canStart
                ? `Start Game (${playerCount} player${playerCount > 1 ? 's' : ''})`
                : 'Need at least 2 players'}
            </motion.button>
          )}
        </div>

        {/* Invite section */}
        <div className="bg-app-surface border-2 border-app-border rounded-app p-5 flex flex-col items-center gap-4">
          <h3 className="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-app-secondary self-start">
            Invite Players
          </h3>

          {qrDataUrl && (
            <div className="p-2 bg-white border-2 border-app-border rounded-app-sm">
              <img src={qrDataUrl} alt={`QR code for room ${room.id}`} width={160} height={160} />
            </div>
          )}

          <div className="flex items-center gap-3 w-full justify-center">
            <span className="font-board text-[2rem] font-semibold tracking-[0.18em] text-app-accent bg-app-accent-light px-5 py-2 rounded-app-sm">
              {room.id}
            </span>
            <motion.button
              className="px-3 py-2 text-[0.8rem] font-semibold bg-app-surface border-2 border-app-border-light rounded-app-sm text-app-text hover:bg-app-raised hover:border-app-accent hover:text-app-accent transition-colors"
              onClick={copyCode}
              whileTap={{ scale: 0.97 }}
            >
              Copy Code
            </motion.button>
          </div>

          <motion.button
            className="w-full px-3 py-2 text-[0.8rem] font-semibold bg-app-surface border-2 border-app-border-light rounded-app-sm text-app-text hover:bg-app-raised hover:border-app-accent hover:text-app-accent transition-colors"
            onClick={copyLink}
            whileTap={{ scale: 0.97 }}
          >
            {copied ? '✓ Copied!' : 'Copy Invite Link'}
          </motion.button>

          <p className="text-[0.7rem] text-app-muted break-all text-center">{shareUrl}</p>
        </div>
      </div>
    </div>
  );
}
