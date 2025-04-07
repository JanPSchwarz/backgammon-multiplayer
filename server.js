import { WebSocketServer } from "ws";
import { createServer } from "http";
import express from "express";
import { uid } from "uid";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

const rooms = {};

app.get("/", (req, res) => {
  res.status(200).send("WebSocket Server is running");
});

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.id = uid();

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "create-room") {
      const roomId = data.roomId;

      if (!rooms[roomId]) {
        rooms[roomId] = {
          players: [],
          sockets: {},
          turn: null,
          board: null,
          colors: [],
        };
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

        const otherPlayer = rooms[roomId].players.filter(
          (player) => player !== ws.id,
        )[0];

        rooms[roomId].turn =
          rooms[roomId].players.length === 1
            ? ws.id
            : rooms[roomId].turn === undefined
              ? ws.id
              : otherPlayer;

        const alreadyGivenColor = rooms[roomId].colors
          .filter((item) => item?.client !== ws.id)
          .map((item) => item?.color)[0];

        const yourColor =
          rooms[roomId].colors.length === 0
            ? "black"
            : alreadyGivenColor === "black"
              ? "white"
              : "black";

        rooms[roomId].colors.push({ client: ws.id, color: yourColor });

        ws.send(
          JSON.stringify({
            type: "room-joined",
            roomId,
            id: ws.id,
            turn: rooms[roomId].turn,
            color: yourColor,
            board: rooms[roomId]?.board,
          }),
        );
        broadCastToOtherPlayer(roomId, ws, {
          type: "player-joined",
          turn: rooms[roomId].turn,
        });
        logRoom();
        return;
      } else {
        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
      }
    }

    if (data.type === "make-move") {
      const newBoard = data.board;
      const roomId = data.roomId;
      rooms[roomId].board = newBoard;
      broadCastToOtherPlayer(roomId, ws, { type: "new-move", board: newBoard });
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
      } else {
        rooms[roomId].turn = undefined;
      }
    }

    if (data.type === "roll-dice") {
      const diceConfig = data.diceConfig;
      const roomId = data.roomId;

      broadCastToRoom(roomId, { type: "dice-rolled", diceConfig });
    }

    if (data.type === "check-exist") {
      const roomId = data.roomId;
      const exists = Object.keys(rooms).includes(roomId);
      ws.send(JSON.stringify({ type: "room-exists", exists, roomId }));
    }
  });

  ws.on("close", () => {
    for (const roomId in rooms) {
      if (rooms[roomId].sockets[ws.id]) {
        delete rooms[roomId].sockets[ws.id];

        rooms[roomId].players = rooms[roomId].players.filter(
          (playerId) => playerId !== ws.id,
        );

        rooms[roomId].colors = rooms[roomId].colors.filter(
          (item) => item.client !== ws.id,
        );

        rooms[roomId].turn =
          rooms[roomId].turn === ws.id ? undefined : rooms[roomId].turn;

        if (Object.keys(rooms[roomId].sockets).length === 0) {
          delete rooms[roomId];
        } else {
          broadCastToRoom(roomId, { type: "player-left" });
        }
      }
    }
  });
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
