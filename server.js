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

  const senderId = ws.id;

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    const roomId = data?.roomId;
    const thisRoom = rooms[roomId];

    if (data.type === "create-room") {
      if (!thisRoom) {
        rooms[roomId] = {
          players: [],
          sockets: {},
          turn: null,
          board: null,
          colors: [],
          wasDisconnect: false,
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
      if (thisRoom?.players.includes(senderId)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Your are already connected to the room",
          }),
        );
        return;
      }

      if (thisRoom?.players.length === 2) {
        ws.send(
          JSON.stringify({ type: "error", message: "Room is full already" }),
        );
        return;
      }

      if (thisRoom) {
        thisRoom.players.push(senderId);
        thisRoom.sockets[senderId] = ws;

        const otherPlayer = thisRoom.players.filter(
          (player) => player !== senderId,
        )[0];

        thisRoom.turn =
          thisRoom.players.length === 1
            ? senderId
            : thisRoom.turn === undefined
              ? senderId
              : otherPlayer;

        const alreadyGivenColor = thisRoom.colors
          .filter((item) => item?.client !== senderId)
          .map((item) => item?.color)[0];

        const yourColor =
          thisRoom.colors.length === 0
            ? "black"
            : alreadyGivenColor === "black"
              ? "white"
              : "black";

        thisRoom.colors.push({ client: senderId, color: yourColor });

        ws.send(
          JSON.stringify({
            type: "room-joined",
            roomId,
            id: senderId,
            turn: thisRoom.turn,
            color: yourColor,
            board: thisRoom?.board,
          }),
        );
        broadCastToOtherPlayer(roomId, ws, {
          type: "player-joined",
          turn: thisRoom.turn,
          wasDisconnect: thisRoom.wasDisconnect,
        });
        logRoom();
        return;
      } else {
        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
      }
    }

    if (data.type === "make-move") {
      const newBoard = data.board;
      thisRoom.board = newBoard;
      broadCastToOtherPlayer(roomId, ws, { type: "new-move", board: newBoard });
    }

    if (data.type === "switch-turn") {
      const otherPlayer = thisRoom.players.filter(
        (playersId) => playersId !== senderId,
      )[0];

      if (otherPlayer) {
        thisRoom.turn = otherPlayer;
        broadCastToRoom(roomId, {
          type: "switch-turn",
          turn: otherPlayer,
        });
      } else {
        thisRoom.turn = undefined;
      }
    }

    if (data.type === "roll-dice") {
      const diceConfig = data.diceConfig;
      broadCastToRoom(roomId, { type: "dice-rolled", diceConfig });
    }

    if (data.type === "check-exist") {
      const exists = Object.keys(rooms).includes(roomId);
      ws.send(JSON.stringify({ type: "room-exists", exists, roomId }));
    }

    if (data.type === "send-timer") {
      const timer = data.timer;
      broadCastToRoom(roomId, { type: "receive-timer", timer });
    }
  });

  ws.on("close", () => {
    for (const roomId in rooms) {
      const thisRoom = rooms[roomId];
      if (thisRoom.sockets[senderId]) {
        delete thisRoom.sockets[senderId];

        thisRoom.players = thisRoom.players.filter(
          (playerId) => playerId !== senderId,
        );

        thisRoom.colors = thisRoom.colors.filter(
          (item) => item.client !== senderId,
        );

        thisRoom.turn = thisRoom.turn === senderId ? undefined : thisRoom.turn;

        thisRoom.wasDisconnect = true;

        if (Object.keys(thisRoom.sockets).length === 0) {
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
  console.log("Rooms:", rooms);
  Object.keys(rooms).map((room) => {
    console.log(`number of clients in ${room}:`, rooms[room].players.length);
  });
}
