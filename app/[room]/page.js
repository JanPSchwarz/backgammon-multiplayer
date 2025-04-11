"use client";
import { useEffect, useState, useRef } from "react";
import useLocalStorageState from "use-local-storage-state";
import GameBoard from "../components/GameBoard";
import Controls from "../components/Controls";
import { usePathname } from "next/navigation";
import { intialGameState } from "../utils/gameState";
import LoadingScreen from "../components/LoadingScreen";
import DisconnectMessage from "../components/DisconnectMessage";
import GameEnd from "../components/GameEnd";

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
  const [isEndgame, setIsEndGame] = useState(false);

  // UI
  const [gameEnd, setGameEnd] = useState(false);
  const [score, setScore] = useState({});
  const [disableButton, setDisableButton] = useState(false);
  const [boardLoaded, setBoardLoaded] = useState(false);
  const [switchTurnTimer, setSwitchTurnTimer] = useState(false);
  const [yourName, setYourName] = useLocalStorageState("yourName", {
    defaultValue: "",
  });
  const [opponentName, setOpponentName] = useState("");
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(null);

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
        handleGameState("currentTurn", message.turn);
        handleGameState("diceResults", ["?", "?"]);
      }

      if (message.type === "error") {
        console.error("error:", message.message);
      }

      if (message.type === "receive-timer") {
        const timer = message.timer;
        setSwitchTurnTimer(timer);
      }

      if (message.type === "receive-name") {
        const opponentName = message.opponentName;
        setOpponentName(opponentName);
      }

      if (message.type === "game-end") {
        setGameEnd(true);
        setScore(message.score);
      }

      if (message.type === "wants-rematch") {
        setOpponentWantsRematch(message.answer);
      }

      if (message.type === "start-rematch") {
        handleGameState("currentTurn", message.turn);
        handleGameState("diceResults", ["?", "?"]);
        handleGameState("board", intialGameState.board);
        setIsEndGame(false);
        setGameEnd(false);
        setOpponentWantsRematch(null);
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

  // detect end game
  useEffect(() => {
    const endZoneKey =
      gameState.yourColor === "black" ? "blackOut" : "whiteOut";
    const isEnd = gameState.board[endZoneKey].length === 15;

    if (isEnd) {
      socketRef.current.send(JSON.stringify({ type: "game-end", roomId }));
    }
  }, [gameState.board]);

  // detect PWA
  useEffect(() => {
    if (window.matchMedia(`(display-mode: standalone)`).matches) {
      setIsPWA(true);
    }
  }, []);

  // adding PROMPT before LEAVING page
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

  useEffect(() => {
    if (gameState.yourId) {
      socketRef.current.send(
        JSON.stringify({ type: "send-name", name: yourName, roomId }),
      );
    }
  }, [gameState.yourId]);

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

  function closeEndGameModal() {
    setGameEnd(!gameEnd);
  }

  function handleIsEndGame(value) {
    setIsEndGame(value);
  }

  return (
    <>
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
          opponentName={opponentName}
          readyToStart={readyToStart}
          score={score}
          isEndgame={isEndgame}
          handleIsEndGame={handleIsEndGame}
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
      <LoadingScreen boardLoaded={boardLoaded} />
      <DisconnectMessage
        boardLoaded={boardLoaded}
        oponentDisconnect={oponentDisconnect}
        statusText={statusText}
      />
      {gameEnd && (
        <GameEnd
          score={score}
          closeModal={closeEndGameModal}
          yourName={yourName}
          opponentName={opponentName}
          yourId={gameState.yourId}
          yourColor={gameState.yourColor}
          opponentWantsRematch={opponentWantsRematch}
          webSocket={socketRef.current}
          roomId={roomId}
        />
      )}
    </>
  );
}
