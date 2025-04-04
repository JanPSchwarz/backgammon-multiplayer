"use client";
import { useEffect, useState, useRef } from "react";
import GameBoard from "../components/GameBoard";
import DiceControls from "../components/DiceControls";
import { usePathname } from "next/navigation";
import { intialGameState } from "../utils/gameState";
import Spinner from "@/public/board/infinite-spinner.svg";
import HomeIcon from "@/public/home.svg";
import LeavePrompt from "../components/LeavePrompt";

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

  // PWA navigation
  const [isPWA, setIsPWA] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // setting If dice COMPLETE
  useEffect(() => {
    if (yourTurn && !gameState.diceResults.includes("?")) {
      setDiceComplete(true);
    }
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

  // detect PWA
  useEffect(() => {
    if (window.matchMedia(`(display-mode: standalone)`).matches) {
      setIsPWA(true);
    }
  }, []);

  // adding HANDLER before LEAVING page
  useEffect(() => {
    function beforeUnload(event) {
      event.preventDefault();

      event.returnValue = true;
    }

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

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

  function handleModal() {
    setShowLeaveModal(false);
  }

  return (
    <>
      <div
        className={`fixed z-[101] flex h-screen w-screen flex-col items-center justify-center gap-10 ${boardLoaded ? `hidden` : `visible`} top-0 transition-opacity`}
      >
        <Spinner className={`w-[50%] max-w-[250px]`} />
        <p>Loading Game...</p>
      </div>
      <button
        onClick={() => {
          setShowLeaveModal(true);
        }}
        className={`absolute ${boardLoaded ? `opacity-1` : `opacity-0`} bottom-0 right-0 z-10 p-3`}
      >
        <HomeIcon className={`m-2 size-8 fill-blue-500 md:size-10`} />
      </button>
      {showLeaveModal && <LeavePrompt closeModal={handleModal} />}
      <div
        id="gameboard"
        className={`relative flex h-full w-full items-center justify-center gap-4 portrait:flex-col ${boardLoaded ? `opacity-1` : `opacity-0`} transition-opacity duration-500 landscape:flex-row`}
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
          handleDisableButton={handleDisableButton}
        />
        <DiceControls
          socket={socketRef}
          disableButton={disableButton}
          roomId={roomId}
          gameState={gameState}
          yourTurn={yourTurn}
          diceResultsCopy={diceResultsCopy}
          isPWA={isPWA}
          handleDiceComplete={handleDiceComplete}
          handleGameState={handleGameState}
          handleDisableButton={handleDisableButton}
        />
      </div>
    </>
  );
}
