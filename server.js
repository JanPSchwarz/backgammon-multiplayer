import { WebSocketServer } from "ws";
import { createServer } from "http";
import express from "express";
import { uid } from "uid";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

const rooms = {};

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.id = uid();

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "create-room") {
      const roomId = data.roomId;

      if (!rooms[roomId]) {
        rooms[roomId] = { players: [], sockets: {}, turn: null };
        ws.send(JSON.stringify({ type: "room-created", roomId }));
        logRoom();
      } else {
        ws.send(
          JSON.stringify({ type: "error", message: "room already exists" }),
        );
      }
    }

    if (data.type === "join-room") {
      const roomId = data.roomId;

      if (rooms[roomId]?.players.includes(ws.id)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Your are already connected to the room",
          }),
        );
        return;
      }

      if (rooms[roomId]?.players.length === 2) {
        ws.send(
          JSON.stringify({ type: "error", message: "Room is full already" }),
        );
        return;
      }

      if (rooms[roomId]) {
        rooms[roomId].players.push(ws.id);
        rooms[roomId].sockets[ws.id] = ws;
        rooms[roomId].turn =
          rooms[roomId].players.length === 1 ? ws.id : rooms[roomId].turn;

        const color = rooms[roomId].players.length === 1 ? "black" : "white";

        console.log(rooms[roomId].players.length);

        ws.send(
          JSON.stringify({
            type: "room-joined",
            roomId,
            id: ws.id,
            turn: rooms[roomId].turn,
            color,
          }),
        );
        broadCastToOtherPlayer(roomId, ws, { type: "player-joined" });
        logRoom();
        return;
      } else {
        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
      }
    }

    if (data.type === "make-move") {
      const newBoard = data.board;
      const roomId = data.roomId;
      broadCastToRoom(roomId, { type: "new-move", board: newBoard });
    }

    if (data.type === "switch-turn") {
      const roomId = data.roomId;
      const otherPlayer = rooms[roomId].players.filter(
        (player) => player !== ws.id,
      )[0];

      console.log("other player id:", otherPlayer);

      if (otherPlayer) {
        rooms[roomId].turn = otherPlayer;
        broadCastToRoom(roomId, {
          type: "switch-turn",
          turn: otherPlayer,
        });
      }
    }

    if (data.type === "roll-dice") {
      const diceConfig = data.diceConfig;
      const roomId = data.roomId;

      broadCastToRoom(roomId, { type: "dice-rolled", diceConfig });
    }
  });

  ws.on("close", () => {
    for (const roomId in rooms) {
      if (rooms[roomId].sockets[ws.id]) {
        delete rooms[roomId].sockets[ws.id];

        rooms[roomId].players = rooms[roomId].players.filter(
          (playerId) => playerId !== ws.id,
        );

        if (Object.keys(rooms[roomId].sockets).length === 0) {
          delete rooms[roomId];
        } else {
          broadCastToRoom(roomId, { type: "player-left" });
        }
      }
    }
  });
});

server.on("upgrade", (request, socket, head) => {
  const origin = request.headers.origin;
  if (origin?.includes("vercel.app") || origin?.includes("localhost")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`WebSocket Server running on ${PORT}`);
});

//helpers

function broadCastToRoom(roomId, message) {
  if (!rooms[roomId] || !rooms[roomId].sockets) return;

  Object.values(rooms[roomId].sockets).forEach((socket) => {
    socket.send(JSON.stringify(message));
  });
}

function broadCastToOtherPlayer(roomId, ws, message) {
  if (!rooms[roomId] || !rooms[roomId].sockets) return;

  Object.entries(rooms[roomId].sockets).forEach(([playerId, socket]) => {
    if (ws.id !== playerId) {
      socket.send(JSON.stringify(message));
    }
  });
}

function logRoom() {
  console.log("number of rooms", Object.keys(rooms).length);
  console.log(rooms);
  Object.keys(rooms).map((room) => {
    console.log(`number of clients in ${room}:`, rooms[room].players.length);
  });
}
