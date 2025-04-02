"use client";
import { useEffect, useState, useRef } from "react";
import GameBoard from "../components/GameBoard";
import DiceControls from "../components/DiceControls";
import { usePathname } from "next/navigation";
import { intialGameState } from "../utils/gameState";
import Spinner from "@/public/board/infinite-spinner.svg";

export default function Home() {
  const pathname = usePathname();
  const roomId = pathname.substring(1);
  const socketRef = useRef();

  //Game logic
  const [gameState, setGameState] = useState(intialGameState);
  const [diceComplete, setDiceComplete] = useState(false);
  const [diceResultsCopy, setDiceResultsCopy] = useState([]);
  const [yourTurn, setYourTurn] = useState();

  // UI
  const [disableButton, setDisableButton] = useState(false);
  const [boardLoaded, setBoardLoaded] = useState(false);

  useEffect(() => {
    let timeOut;
    if (yourTurn && !gameState.diceResults.includes("?")) {
      //   timeOut = setTimeout(() => {
      setDiceComplete(true);
      //   }, 2000);
    }
    return () => clearTimeout(timeOut);
  }, [gameState.diceResults]);

  // websocket && MESSAGE handling setup
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
        handleGameState("diceResults", ["?", "?"]);
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

  // UI updates
  useEffect(() => {
    const yourId = gameState.yourId;

    if (yourId === gameState.currentTurn) {
      setYourTurn(true);
      setDisableButton(false);
    } else {
      setYourTurn(false);
      setDisableButton(true);
    }
  }, [gameState.currentTurn]);

  // logging
  //   Object.entries(gameState).map(([key, value]) => {
  //     if (key !== "board") {
  //       console.log(`${key}:`, value);
  //     }
  //   });

  // helper functions
  function handleDisableButton(value) {
    setDisableButton(value);
  }

  function handleDiceResultsCopy(value) {
    setDiceResultsCopy(value);
  }

  function handleGameState(key, value) {
    setGameState((prev) => {
      return { ...prev, [key]: value };
    });
  }

  function handleDiceComplete(value) {
    setDiceComplete(value);
  }

  function handleGameBoardUI(value) {
    setBoardLoaded(value);
  }

  return (
    <>
      <div
        className={`fixed flex h-screen w-screen flex-col items-center justify-center gap-10 ${boardLoaded ? `hidden` : `visible`} top-0 transition-opacity`}
      >
        <Spinner className={`w-[50%] max-w-[250px]`} />
        <p>Loading Game...</p>
      </div>
      <div
        id="gameboard"
        className={`relative flex h-full w-full items-center justify-evenly gap-4 portrait:flex-col ${boardLoaded ? `opacity-1` : `opacity-0`} transition-opacity duration-500 landscape:flex-row`}
      >
        <GameBoard
          socket={socketRef}
          gameState={gameState}
          yourTurn={yourTurn}
          diceComplete={diceComplete}
          roomId={roomId}
          diceResultsCopy={diceResultsCopy}
          handleGameState={handleGameState}
          handleDiceComplete={handleDiceComplete}
          handleDiceResultsCopy={handleDiceResultsCopy}
          handleGameBoardUI={handleGameBoardUI}
        />
        <DiceControls
          socket={socketRef}
          disableButton={disableButton}
          roomId={roomId}
          gameState={gameState}
          yourTurn={yourTurn}
          diceResultsCopy={diceResultsCopy}
          handleDiceComplete={handleDiceComplete}
          handleGameState={handleGameState}
          handleDisableButton={handleDisableButton}
        />
      </div>
    </>
  );
}
