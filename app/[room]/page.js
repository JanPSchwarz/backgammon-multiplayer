"use client";
import { useEffect, useState, useRef } from "react";
import GameBoard from "../components/GameBoard";
import DiceControls from "../components/DiceControls";
import { usePathname } from "next/navigation";
import { intialGameState } from "../utils/gameState";

export default function Home() {
  const pathname = usePathname();
  const roomId = pathname.substring(1);
  const socketRef = useRef();

  const [gameState, setGameState] = useState(intialGameState);
  const [diceComplete, setDiceComplete] = useState(false);
  const [yourTurn, setYourTurn] = useState();

  console.log("is your turn:", yourTurn);

  function handleGameState(key, value) {
    setGameState((prev) => {
      return { ...prev, [key]: value };
    });
  }

  function handleDiceComplete(value) {
    setDiceComplete(value);
  }

  useEffect(() => {
    let timeOut;
    if (yourTurn && !gameState.diceResults.includes("?")) {
      timeOut = setTimeout(() => {
        setDiceComplete(true);
      }, 2000);
    }
    return () => clearTimeout(timeOut);
  }, [gameState.diceResults]);

  useEffect(() => {
    const yourId = gameState.yourId;

    if (yourId === gameState.currentTurn) {
      setYourTurn(true);
    } else {
      setYourTurn(false);
    }
  }, [gameState.currentTurn]);

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("connected to websocket");
      ws.send(JSON.stringify({ type: "join-room", roomId }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "room-joined") {
        console.log("you joined room:", message.roomId);
        handleGameState("yourId", message.id);
        handleGameState("currentTurn", message.turn);
        handleGameState("yourColor", message.color);
      }

      if (message.type === "player-joined") {
        console.log("another player-joined");
      }

      if (message.type === "player-left") {
        console.log("player left the room");
      }

      if (message.type === "switch-turn") {
        console.log("switch turn to:", message.turn);
        handleGameState("currentTurn", message.turn);
        handleGameState("diceResults", ["?", "?"])
      }

      if (message.type === "error") {
        console.log("error:", message.message);
      }
    };

    ws.onclose = () => {
      console.log("disconnect from websocket");
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  Object.entries(gameState).map(([key, value]) => {
    if (key !== "board") {
      console.log(`${key}:`, value);
    }
  });

  return (
    <>
      <div
        id="gameboard"
        className={`relative flex items-center justify-center`}
      >
        <GameBoard
          socket={socketRef}
          gameState={gameState}
          yourTurn={yourTurn}
          handleGameState={handleGameState}
          handleDiceComplete={handleDiceComplete}
          diceComplete={diceComplete}
          roomId={roomId}
        />
        <DiceControls
          socket={socketRef}
          roomId={roomId}
          gameState={gameState}
          yourTurn={yourTurn}
          handleDiceComplete={handleDiceComplete}
          handleGameState={handleGameState}
        />
      </div>
    </>
  );
}
