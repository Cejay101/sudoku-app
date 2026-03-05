import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function Lobby({ room, playerId, onStartGame, onBack }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}?room=${room.id}`;
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
    <div className="lobby">
      <button className="back-btn" onClick={onBack}>&#8592; Leave</button>

      <div className="lobby__header">
        <h2 className="lobby__title">Waiting Room</h2>
        <p className="lobby__info">
          {room.boardSize}&times;{room.boardSize} &bull; <span className="lobby__difficulty">{room.difficulty}</span>
        </p>
      </div>

      <div className="lobby__body">
        <div className="lobby__left">
          <div className="lobby__players">
            <h3 className="lobby__section-title">
              Players ({playerCount}/10)
            </h3>
            <ul className="lobby__player-list">
              {room.players.map((p) => (
                <li key={p.id} className={`lobby__player ${p.id === playerId ? 'lobby__player--me' : ''}`}>
                  <span className="lobby__player-dot" />
                  <span className="lobby__player-name">
                    {p.name}
                    {p.isHost && <span className="lobby__host-badge">HOST</span>}
                    {p.id === playerId && <span className="lobby__me-badge">YOU</span>}
                  </span>
                </li>
              ))}
            </ul>

            {!isHost && (
              <p className="lobby__waiting-msg">Waiting for host to start the game...</p>
            )}
          </div>

          {isHost && (
            <button
              className={`btn btn--large ${canStart ? 'btn--primary' : 'btn--disabled'}`}
              onClick={onStartGame}
              disabled={!canStart}
            >
              {canStart
                ? `Start Game (${playerCount} player${playerCount > 1 ? 's' : ''})`
                : 'Need at least 2 players'}
            </button>
          )}
        </div>

        <div className="lobby__right">
          <div className="lobby__invite">
            <h3 className="lobby__section-title">Invite Players</h3>

            {qrDataUrl && (
              <div className="lobby__qr">
                <img src={qrDataUrl} alt={`QR code for room ${room.id}`} width={160} height={160} />
              </div>
            )}

            <div className="lobby__code-row">
              <span className="lobby__code">{room.id}</span>
              <button className="btn btn--secondary btn--small" onClick={copyCode}>
                Copy Code
              </button>
            </div>

            <button className="btn btn--secondary btn--small lobby__link-btn" onClick={copyLink}>
              {copied ? '&#10003; Copied!' : 'Copy Invite Link'}
            </button>

            <p className="lobby__link-text">{shareUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
