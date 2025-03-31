"use client";

// import DiceBox from "@3d-dice/dice-box";
import DiceBox from "@3d-dice/dice-box-threejs";
import { useEffect, useState } from "react";

export default function DiceControls({
  socket,
  roomId,
  handleGameState,
  gameState,
  yourTurn,
  handleDiceComplete,
}) {
  const [Dice, setDice] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !Dice) {
      const DiceBoxInstance = new DiceBox("#app", {
        light_intensity: 1.5,
        gravity_multiplier: 400,
        strength: 1,
        baseScale: 80,
        assetPath: "/",
      });

      DiceBoxInstance.onRollComplete = (result) => {
        const values = result.sets[0].rolls.map((roll) => roll.value);

        if (values[0] === values[1]) {
          handleGameState("diceResults", [...values, ...values]);
        } else {
          handleGameState("diceResults", values);
        }
        setIsRolling(false);
      };

      DiceBoxInstance.initialize();
      setDice(DiceBoxInstance);
    }

    const canvas = document.querySelector(`#app canvas`);

    if (canvas) {
      canvas.style.position = "fixed";
      canvas.style.visibility = "visible";
      canvas.style.top = "0";
      canvas.style.zIndex = "100";
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.pointerEvents = "none";
    }

    return () => {
      canvas.remove();
    };
  }, []);

  useEffect(() => {
    if (!socket.current) return;

    function handleMessage(event) {
      const message = JSON.parse(event.data);
      if (message.type === "dice-rolled") {
        handleGameState("diceResults", ["?", "?"]);
        setIsRolling(true);
        const { determinedNumbers, theme_colorset } = message.diceConfig;

        Dice.updateConfig({ theme_colorset });
        Dice.roll(`2dpip@${determinedNumbers}`);
      }
    }

    socket.current.addEventListener("message", handleMessage);
  }, [socket.current]);

  function pickRandomColor() {
    const themes = [
      "white",
      "black",
      "rainbow",
      "bronze",
      "necrotic",
      "thunder",
    ];
    const random = Math.floor(Math.random() * themes.length);

    return themes[random];
  }

  function rollDice(event) {
    event.preventDefault();
    handleDiceComplete(false);

    const randomResult1 = Math.floor(Math.random() * 5) + 1;
    const randomResult2 = Math.floor(Math.random() * 5) + 1;
    const determinedNumbers = `${randomResult1}, ${randomResult2}`;
    const theme_colorset = pickRandomColor();

    const diceConfig = { determinedNumbers, theme_colorset };

    if (socket.current) {
      socket.current.send(
        JSON.stringify({ type: "roll-dice", diceConfig, roomId }),
      );
    }
  }
  function rollDiceTest(event) {
    event.preventDefault();
    handleDiceComplete(false);

    const randomResult1 = 6;
    const randomResult2 = 6;
    const determinedNumbers = `${randomResult1}, ${randomResult2}`;
    const theme_colorset = pickRandomColor();

    const diceConfig = { determinedNumbers, theme_colorset };

    if (socket.current) {
      socket.current.send(
        JSON.stringify({ type: "roll-dice", diceConfig, roomId }),
      );
    }
  }

  return (
    <>
      <div
        className={`relative flex w-[10%] flex-col items-center justify-center`}
      >
        <p>{yourTurn ? "Your" : "Not Your"} turn!</p>
        <button
          className={`my-6 rounded bg-green-400 p-4 px-8 font-semibold shadow-md transition-all active:scale-90 disabled:bg-gray-200`}
          disabled={isRolling || !yourTurn}
          onClick={rollDice}
        >
          Roll dice
        </button>
        <button
          className={`my-6 rounded bg-green-400 p-4 px-8 font-semibold shadow-md transition-all active:scale-90 disabled:bg-gray-200`}
          disabled={isRolling}
          onClick={rollDiceTest}
        >
          Roll test
        </button>

        <div className={`flex flex-wrap items-center justify-center gap-4`}>
          {gameState?.diceResults?.map((result, index) => (
            <p
              key={index}
              className={`rounded-md border ${yourTurn ? `bg-green-200` : `bg-gray-200`} p-4 text-2xl font-semibold shadow-md`}
            >
              {result}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
