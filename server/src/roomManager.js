'use strict';

const rooms = new Map();

function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(id) ? generateRoomId() : id;
}

function createRoom({ hostId, hostName, boardSize, difficulty, puzzle, solution }) {
  const roomId = generateRoomId();
  const room = {
    id: roomId,
    hostId,
    boardSize,
    difficulty,
    puzzle,
    solution,
    status: 'waiting',
    players: [
      {
        id: hostId,
        name: hostName,
        isHost: true,
        status: 'waiting',
        completionTime: null,
        rank: null,
      },
    ],
    leaderboard: [],
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  return room;
}

function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

function joinRoom(roomId, playerId, playerName) {
  const room = rooms.get(roomId);
  if (!room) return { error: 'Room not found. Check your room code.' };
  if (room.status !== 'waiting') return { error: 'This game has already started.' };
  if (room.players.length >= 10) return { error: 'Room is full (maximum 10 players).' };

  const existing = room.players.find((p) => p.id === playerId);
  if (existing) return { room };

  room.players.push({
    id: playerId,
    name: playerName,
    isHost: false,
    status: 'waiting',
    completionTime: null,
    rank: null,
  });

  return { room };
}

function startGame(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.status = 'playing';
  room.startedAt = Date.now();
  room.players.forEach((p) => {
    p.status = 'playing';
  });
  return room;
}

function playerCompleted(roomId, playerId, time) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player || player.status === 'finished') return null;

  player.status = 'finished';
  player.completionTime = time;

  const finished = room.players
    .filter((p) => p.status === 'finished' && p.completionTime !== null)
    .sort((a, b) => a.completionTime - b.completionTime);

  finished.forEach((p, i) => {
    p.rank = i + 1;
  });

  room.leaderboard = finished.map((p) => ({
    id: p.id,
    name: p.name,
    time: p.completionTime,
    rank: p.rank,
  }));

  const allFinished = room.players.every((p) => p.status === 'finished');
  if (allFinished) room.status = 'finished';

  return { room, allFinished };
}

function resetRoom(roomId, puzzle, solution) {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.status = 'waiting';
  room.leaderboard = [];
  room.puzzle = puzzle;
  room.solution = solution;
  room.startedAt = null;
  room.players.forEach((p) => {
    p.status = 'waiting';
    p.completionTime = null;
    p.rank = null;
  });

  return room;
}

function removePlayer(roomId, playerId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(roomId);
    return null;
  }

  if (room.hostId === playerId && room.players.length > 0) {
    room.hostId = room.players[0].id;
    room.players[0].isHost = true;
  }

  return room;
}

function getPublicRoom(room) {
  return {
    id: room.id,
    hostId: room.hostId,
    boardSize: room.boardSize,
    difficulty: room.difficulty,
    status: room.status,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      status: p.status,
      rank: p.rank,
      completionTime: p.completionTime,
    })),
    leaderboard: room.leaderboard,
  };
}

module.exports = {
  createRoom,
  getRoom,
  joinRoom,
  startGame,
  playerCompleted,
  resetRoom,
  removePlayer,
  getPublicRoom,
};
