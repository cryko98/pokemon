import express from "express";
import path from "path";
import { createServer as createHttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createHttpServer(app);
  
  // Set up socket.io with the HTTP server
  const io = new SocketServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Return true/dynamically echo origin to sustain credential transfer
        callback(null, origin || "*");
      },
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  // Track rooms for real-time multiplayer
  // roomId -> { players: { [socketId]: { idStr: 'player'|'cpu', pokemonId: string, name: string, ready: boolean } } }
  const rooms: { [roomId: string]: { players: { [socketId: string]: { idStr: 'player' | 'cpu'; pokemonId: string; name: string; ready: boolean } } } } = {};

  io.on("connection", (socket) => {
    socket.on("join_room", ({ roomId, name, pokemonId }) => {
      // Limit roomId formatting and sanitization
      const cleanRoomId = String(roomId).trim().toUpperCase();
      if (!cleanRoomId) return;

      socket.join(cleanRoomId);

      // Create room if not exists
      if (!rooms[cleanRoomId]) {
        rooms[cleanRoomId] = { players: {} };
      }

      const room = rooms[cleanRoomId];
      const participantCount = Object.keys(room.players).length;

      if (participantCount >= 2) {
        socket.emit("room_full", { message: "Ez a szoba már megtelt! Maximum 2 játékos engedélyezett." });
        return;
      }

      // Determine role: player 1 is the room creator, player 2 is defender
      const side = participantCount === 0 ? "player" : "cpu"; 

      room.players[socket.id] = {
        idStr: side,
        pokemonId: pokemonId,
        name: name || `Mester #${socket.id.slice(0, 4)}`,
        ready: true
      };

      console.log(`Socket ${socket.id} joined room ${cleanRoomId} as ${side}`);

      // Notify the joining player of their setup
      socket.emit("joined_room_info", {
        roomId: cleanRoomId,
        side,
        players: room.players
      });

      // Broadcast updated roster to other colleagues in room
      io.to(cleanRoomId).emit("room_info_update", {
        players: room.players
      });

      // If we now have exactly 2 players, start the battle
      if (Object.keys(room.players).length === 2) {
        const playersList = Object.values(room.players);
        io.to(cleanRoomId).emit("match_ready", {
          p1: playersList.find(p => p.idStr === 'player'),
          p2: playersList.find(p => p.idStr === 'cpu')
        });
      }
    });

    // Handle fighter real-time replication state sync
    socket.on("sync_state", (data) => {
      const { roomId } = data;
      if (roomId) {
        // Broadcast state payload to other player in the room
        socket.to(roomId).emit("remote_state", data);
      }
    });

    // Handle interactive triggers (Projectiles, shockwaves, damage, sounds, combo ticks, ultimate alerts...)
    socket.on("remote_action", (data) => {
      const { roomId, action, payload } = data;
      if (roomId) {
        socket.to(roomId).emit("remote_action_triggered", { action, payload });
      }
    });

    // Handle room exit or disconnection helper
    socket.on("leave_room", ({ roomId }) => {
      if (!roomId) return;
      const cleanRoomId = String(roomId).trim().toUpperCase();
      if (rooms[cleanRoomId] && rooms[cleanRoomId].players[socket.id]) {
        delete rooms[cleanRoomId].players[socket.id];
        socket.leave(cleanRoomId);
        
        io.to(cleanRoomId).emit("player_disconnected", { message: "A másik játékos kilépett a szobából." });
        
        if (Object.keys(rooms[cleanRoomId].players).length === 0) {
          delete rooms[cleanRoomId];
        } else {
          io.to(cleanRoomId).emit("room_info_update", {
            players: rooms[cleanRoomId].players
          });
        }
      }
    });

    socket.on("disconnect", () => {
      // Find room socket was in and clean it up
      Object.keys(rooms).forEach((roomId) => {
        const room = rooms[roomId];
        if (room.players[socket.id]) {
          delete room.players[socket.id];
          io.to(roomId).emit("player_disconnected", { message: "A másik játékos kilépett a szobából." });
          
          if (Object.keys(room.players).length === 0) {
            delete rooms[roomId];
          } else {
            io.to(roomId).emit("room_info_update", {
              players: room.players
            });
          }
        }
      });
    });
  });

  // API Health Indicator endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", activeRooms: Object.keys(rooms).length });
  });

  // Configure Vite middleware for development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[STADIUM SERVER] Pokémon Fighting Arena running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("FATAL: Failed to spin up stadium server:", err);
});
