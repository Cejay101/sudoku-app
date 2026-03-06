'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { generatePuzzle } = require('./sudoku');
const {
  createRoom,
  getRoom,
  joinRoom,
  startGame,
  playerCompleted,
  removePlayer,
  getPublicRoom,
} = require('./roomManager');

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

const io = new Server(server, {
  cors: {
    origin: [CLIENT_ORIGIN, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: [CLIENT_ORIGIN, 'http://localhost:3000'] }));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ── Recent game results ───────────────────────────────────────
app.get('/api/results/recent', async (req, res) => {
  try {
    const sessions = await prisma.gameSession.findMany({
      orderBy: { endedAt: 'desc' },
      take: 20,
      where: { endedAt: { not: null } },
      include: {
        results: { orderBy: { rank: 'asc' } },
      },
    });
    res.json(sessions);
  } catch (err) {
    console.error('[api/results] error', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// ── Socket.io events ──────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  // Create a new room
  socket.on('room:create', ({ playerName, boardSize, difficulty }) => {
    try {
      console.log(`[room:create] ${playerName} | ${boardSize}x${boardSize} | ${difficulty}`);
      const { puzzle, solution } = generatePuzzle(boardSize, difficulty);

      const room = createRoom({
        hostId: socket.id,
        hostName: playerName,
        boardSize,
        difficulty,
        puzzle,
        solution,
      });

      socket.join(room.id);
      socket.emit('room:created', {
        roomId: room.id,
        playerId: socket.id,
        room: getPublicRoom(room),
      });
    } catch (err) {
      console.error('[room:create] error', err);
      socket.emit('room:error', { message: 'Failed to create room. Please try again.' });
    }
  });

  // Join an existing room
  socket.on('room:join', ({ roomId, playerName }) => {
    try {
      console.log(`[room:join] ${playerName} -> ${roomId}`);
      const result = joinRoom(roomId.toUpperCase(), socket.id, playerName);

      if (result.error) {
        socket.emit('room:error', { message: result.error });
        return;
      }

      socket.join(result.room.id);
      socket.emit('room:joined', {
        roomId: result.room.id,
        playerId: socket.id,
        room: getPublicRoom(result.room),
      });

      socket.to(result.room.id).emit('room:updated', {
        room: getPublicRoom(result.room),
      });
    } catch (err) {
      console.error('[room:join] error', err);
      socket.emit('room:error', { message: 'Failed to join room. Please try again.' });
    }
  });

  // Get room state (for reconnections)
  socket.on('room:get', ({ roomId }) => {
    const room = getRoom(roomId);
    if (room) {
      socket.emit('room:updated', { room: getPublicRoom(room) });
    } else {
      socket.emit('room:error', { message: 'Room not found.' });
    }
  });

  // Start the game
  socket.on('game:start', async ({ roomId }) => {
    try {
      const room = getRoom(roomId);
      if (!room) { socket.emit('room:error', { message: 'Room not found.' }); return; }
      if (room.hostId !== socket.id) { socket.emit('room:error', { message: 'Only the host can start the game.' }); return; }
      if (room.players.length < 2) { socket.emit('room:error', { message: 'Need at least 2 players to start.' }); return; }

      const updatedRoom = startGame(roomId);
      const startTime = Date.now();

      // Persist game session to database (non-blocking)
      prisma.gameSession.upsert({
        where: { roomId },
        create: { roomId, boardSize: updatedRoom.boardSize, difficulty: updatedRoom.difficulty },
        update: { startedAt: new Date() },
      }).catch((dbErr) => console.error('[game:start] db error (non-fatal):', dbErr.message));

      io.to(roomId).emit('game:started', {
        puzzle: updatedRoom.puzzle,
        solution: updatedRoom.solution,
        boardSize: updatedRoom.boardSize,
        difficulty: updatedRoom.difficulty,
        startTime,
        room: getPublicRoom(updatedRoom),
      });
    } catch (err) {
      console.error('[game:start] error', err);
      socket.emit('room:error', { message: 'Failed to start game.' });
    }
  });

  // Player completed the puzzle
  socket.on('game:complete', async ({ roomId, time }) => {
    try {
      const result = playerCompleted(roomId, socket.id, time);
      if (!result) return;

      const { room, allFinished } = result;

      io.to(roomId).emit('player:completed', {
        playerId: socket.id,
        leaderboard: room.leaderboard,
        room: getPublicRoom(room),
      });

      if (allFinished) {
        // Persist all results to database (non-blocking)
        prisma.gameSession.findUnique({ where: { roomId } }).then(async (session) => {
          if (!session) return;
          await prisma.gameSession.update({ where: { roomId }, data: { endedAt: new Date() } });
          await prisma.gameResult.createMany({
            data: room.leaderboard.map((entry) => ({
              sessionId: session.id,
              playerName: entry.name,
              completionTime: entry.time,
              rank: entry.rank,
            })),
            skipDuplicates: true,
          });
        }).catch((dbErr) => console.error('[game:complete] db error (non-fatal):', dbErr.message));

        io.to(roomId).emit('game:over', {
          leaderboard: room.leaderboard,
          room: getPublicRoom(room),
        });
      }
    } catch (err) {
      console.error('[game:complete] error', err);
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`[disconnect] ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Sudoku server running on http://localhost:${PORT}`);
});
