"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export default function Room() {
  const [newRoomId, setNewRoomId] = useState();

  const socketRef = useRef(null);

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("connected to websocket");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "room-created") {
        setNewRoomId(message.roomId);
        console.log("room created:", message.roomId);
      }
    };

    ws.onclose = () => {
      console.log("websocket disconnected");
    };

    socketRef.current = ws;

    // return () => ws.close();
    console.log(ws);
  }, []);

  function createRoom() {
    const newRoomId = uuidv4();

    socketRef.current.send(
      JSON.stringify({ type: "create-room", roomId: newRoomId }),
    );
  }

  return (
    <div className={`flex flex-col`}>
      <button
        className={`my-6 rounded-md bg-orange-500 p-6 text-xl font-semibold`}
        onClick={createRoom}
      >
        Create Rooom
      </button>
      <Link
        href={`/${newRoomId}`}
        className={`${newRoomId ? `opacity-100` : `opacity-0`} rounded-md bg-green-300 p-2 text-center transition-opacity duration-300`}
      >
        Your room is ready
      </Link>
    </div>
  );
}
