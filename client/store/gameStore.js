'use client';

import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // Navigation
  screen: 'home',

  // Game configuration
  gameConfig: null, // { size, difficulty, mode }
  gameData: null,   // { puzzle, solution, startTime }

  // Player info
  playerInfo: { name: '', id: null },

  // Room (multiplayer)
  room: null,

  // Socket instance (non-serializable, stored directly)
  socket: null,

  // ── Setters ──────────────────────────────────────────────────
  setScreen:     (screen)  => set({ screen }),
  setGameConfig: (config)  => set({ gameConfig: config }),
  setGameData:   (data)    => set({ gameData: data }),
  setPlayerInfo: (info)    => set({ playerInfo: info }),
  setRoom:       (room)    => set({ room }),
  setSocket:     (socket)  => set({ socket }),

  // ── Actions ──────────────────────────────────────────────────
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  goHome: () => {
    get().disconnectSocket();
    set({
      screen: 'home',
      room: null,
      gameData: null,
      gameConfig: null,
      playerInfo: { name: '', id: null },
    });
  },
}));

export default useGameStore;
