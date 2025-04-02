"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { uid } from "uid";

export default function Room() {
  const [newRoomId, setNewRoomId] = useState();
  const [showText, setShowText] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

    console.log("WEBSOCKET_URL:", WS_URL);

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

      if (message.type === "error") {
        console.log("ws-error", message.message);
      }
    };

    ws.onclose = () => {
      console.log("websocket disconnected");
    };

    socketRef.current = ws;
    console.log(ws);
  }, []);

  function createRoom() {
    const newRoomId = uid();

    const baseURL = window.location.href;
    const newURL = `${baseURL}/${newRoomId}`;
    navigator.clipboard.writeText(newURL);

    setNewRoomId(newRoomId);
    setShowText(true);

    socketRef.current.send(
      JSON.stringify({ type: "create-room", roomId: newRoomId }),
    );
  }

  useEffect(() => {
    let timeOut;
    if (showText) {
      timeOut = setTimeout(() => {
        setShowText(false);
      }, 3500);
    }

    return () => clearTimeout(timeOut);
  }, [showText]);

  return (
    <div className={`flex flex-col items-center justify-center`}>
      <button
        className={`my-6 rounded-md bg-orange-500 p-6 text-xl font-semibold`}
        onClick={createRoom}
      >
        Create Room
      </button>
      <Link
        href={`/${newRoomId}`}
        className={`${newRoomId ? `opacity-100` : `opacity-0`} rounded-md bg-indigo-300 p-2 text-center font-semibold transition-opacity duration-300`}
      >
        Your room is ready
      </Link>

      <p
        className={`relative m-6 rounded-md bg-slate-400 bg-opacity-20 p-2 text-center text-sm transition-all delay-500 duration-300 ${showText ? `opacity-1 top-0` : `-top-[20px] opacity-0`}`}
      >
        Link was copied to Clipboard! Share it with a friend ❤️
      </p>
    </div>
  );
}
