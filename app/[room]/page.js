"use client";
import { useEffect, useState, useRef } from "react";
import GameBoard from "../components/GameBoard";
import Controls from "../components/Controls";
import { usePathname } from "next/navigation";
import { intialGameState } from "../utils/gameState";
import Spinner from "@/public/board/infinite-spinner.svg";

export default function Home() {
  const pathname = usePathname();
  const roomId = pathname.substring(1);
  const socketRef = useRef();

  //Game logic
  const [statusText, setStatusText] = useState();
  const [oponentDisconnect, setOpponentDisconnect] = useState(false);
  const [gameState, setGameState] = useState(intialGameState);
  const [diceComplete, setDiceComplete] = useState(false);
  const [diceResultsCopy, setDiceResultsCopy] = useState([]);
  const [yourTurn, setYourTurn] = useState();
  const [readyToStart, setReadyToStart] = useState(false);

  // UI
  const [disableButton, setDisableButton] = useState(false);
  const [boardLoaded, setBoardLoaded] = useState(false);
  const [switchTurnTimer, setSwitchTurnTimer] = useState(false);

  console.log("SWITCH TURN TIMER:", switchTurnTimer);
  // PWA navigation
  const [isPWA, setIsPWA] = useState(false);

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

        if (message.board !== null) {
          handleGameState("board", message.board);
        }

        if (message.isFull) {
          setReadyToStart(true);
        }
      }

      if (message.type === "player-joined") {
        console.log("another player-joined");
        handleGameState("currentTurn", message.turn);
        if (message.wasDisconnect) {
          setOpponentDisconnect(false);
          setStatusText("Opponent reconnected!");
        }
        if (message.isFull) {
          setReadyToStart(true);
        }
      }

      if (message.type === "player-left") {
        console.log("player left the room");
        setOpponentDisconnect(true);
        setStatusText("Opponent disconnected...");
      }

      if (message.type === "switch-turn") {
        console.log("switch turn to:", message.turn);
        handleGameState("currentTurn", message.turn);
        handleGameState("diceResults", ["?", "?"]);
      }

      if (message.type === "error") {
        console.log("error:", message.message);
      }

      if (message.type === "receive-timer") {
        const timer = message.timer;
        setSwitchTurnTimer(timer);
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

  // detect PWA
  useEffect(() => {
    if (window.matchMedia(`(display-mode: standalone)`).matches) {
      setIsPWA(true);
    }
  }, []);

  // adding PROMPT before LEAVING page
  // useEffect(() => {
  //   function beforeUnload(event) {
  //     event.preventDefault();

  //     event.returnValue = true;
  //   }

  //   window.addEventListener("beforeunload", beforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", beforeUnload);
  //   };
  // }, []);

  // UI updates
  useEffect(() => {
    const yourId = gameState.yourId;

    if (yourId === gameState.currentTurn && readyToStart) {
      setYourTurn(true);
      setDisableButton(false);
    } else {
      setYourTurn(false);
      setDisableButton(true);
    }
  }, [gameState.currentTurn, readyToStart]);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setStatusText();
    }, 3000);

    return () => clearTimeout(timeOut);
  }, [statusText]);

  useEffect(() => {
    let timeOut;
    if (switchTurnTimer) {
      timeOut = setTimeout(() => {
        setSwitchTurnTimer();
      }, switchTurnTimer);
    }

    return () => clearTimeout(timeOut);
  }, [switchTurnTimer]);

  // logging
  Object.entries(gameState).map(([key, value]) => {
    if (key !== "board") {
      console.log(`${key}:`, value);
    }
  });

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

  function handleswitchTurnTimer(value) {
    socketRef.current.send(
      JSON.stringify({ type: "send-timer", roomId, timer: value }),
    );
  }

  return (
    <>
      <div
        className={`fixed z-[101] flex h-screen w-screen flex-col items-center justify-center gap-10 ${boardLoaded ? `hidden` : `visible`} top-0 transition-opacity`}
      >
        <Spinner className={`w-[50%] max-w-[250px]`} />
        <p>Loading Game...</p>
      </div>
      <div
        className={`absolute top-0 z-20 ${boardLoaded ? `opacity-1` : `opacity-0`} ${statusText ? `translate-y-0` : `translate-y-[-100%] duration-0`} rounded-b-md transition-all ${oponentDisconnect ? `border-red-400 bg-red-200/90 text-red-800` : `border-blue-400 bg-blue-50/80 text-blue-800`} border border-t-0 p-4 font-semibold md:text-lg`}
      >
        <p className={``}>{statusText}</p>
      </div>
      {!readyToStart && (
        <p
          className={`absolute z-20 ${boardLoaded ? `opacity-1` : `opacity-0`} rounded-lg border-2 border-blue-600 bg-blue-400/90 p-2 text-center text-lg italic text-neutral-800 shadow-xl`}
        >
          Waiting for opponent...
          <span className={`block not-italic`}>
            Use share button to invite a friend!
          </span>
        </p>
      )}
      <div
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
          handleswitchTurnTimer={handleswitchTurnTimer}
        />
        <Controls
          socket={socketRef}
          disableButton={disableButton}
          roomId={roomId}
          gameState={gameState}
          yourTurn={yourTurn}
          diceResultsCopy={diceResultsCopy}
          isPWA={isPWA}
          oponentDisconnect={oponentDisconnect}
          switchTurnTimer={switchTurnTimer}
          readyToStart={readyToStart}
          handleDiceComplete={handleDiceComplete}
          handleGameState={handleGameState}
          handleDisableButton={handleDisableButton}
        />
      </div>
    </>
  );
}
