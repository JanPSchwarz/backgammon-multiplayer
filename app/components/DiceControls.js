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
  isPWA,
  handleDiceComplete,
  diceResultsCopy,
  disableButton,
  handleDisableButton,
}) {
  const [Dice, setDice] = useState(null);

  // define and set DICE
  useEffect(() => {
    const diceScale = Math.max(Math.round(0.0422 * window.innerWidth), 50);

    if (typeof window !== "undefined" && !Dice) {
      const DiceBoxInstance = new DiceBox("#app", {
        light_intensity: 1.5,
        gravity_multiplier: 400,
        strength: 1,
        baseScale: diceScale,
        assetPath: "/",
      });

      DiceBoxInstance.onRollComplete = (result) => {
        const values = result.sets[0].rolls.map((roll) => roll.value);

        if (values[0] === values[1]) {
          handleGameState("diceResults", [...values, ...values]);
        } else {
          handleGameState("diceResults", values);
        }
      };

      DiceBoxInstance.initialize();
      setDice(DiceBoxInstance);
    }

    const canvas = document.querySelector(`#app canvas`);

    if (canvas) {
      canvas.style.position = "fixed";
      canvas.style.padding = "10px";
      canvas.style.zIndex = "100";
      canvas.style.pointerEvents = "none";
    }

    function resizeCanvas() {
      let timeOut;
      if (canvas) {
        console.log("CHANGE CANVAS");

        clearTimeout(timeOut);
        timeOut = setTimeout(() => {
          const body = document.querySelector("body");
          const newWidth = getComputedStyle(body).getPropertyValue("width");
          const newHeight = getComputedStyle(body).getPropertyValue("height");

          console.log(getComputedStyle(body).getPropertyValue("width"));
          const dpr = 1;
          console.log("DPR:", dpr);

          canvas.style.width = newWidth + `px`;
          canvas.style.height = newHeight + `px`;
          canvas.width = newWidth * dpr;
          canvas.height = newHeight * dpr;
        }, 100);
      }
    }

    window.addEventListener("orientationchange", resizeCanvas);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      if (canvas) canvas.remove();
      window.removeEventListener("orientationchange", resizeCanvas);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // handle socket MESSAGES
  useEffect(() => {
    if (!socket.current) return;

    function handleMessage(event) {
      const message = JSON.parse(event.data);
      if (message.type === "dice-rolled") {
        handleGameState("diceResults", ["?", "?"]);
        const { determinedNumbers, theme_colorset } = message.diceConfig;

        Dice.updateConfig({ theme_colorset });
        Dice.roll(`2dpip@${determinedNumbers}`);
      }
    }

    socket.current.addEventListener("message", handleMessage);
  }, [socket.current]);

  function pickRandomColor() {
    const themes = ["white", "black", "rainbow", "bronze", "necrotic"];
    const random = Math.floor(Math.random() * themes.length);

    return themes[random];
  }

  function rollDice(event) {
    event.preventDefault();
    handleDiceComplete(false);
    handleDisableButton(true);

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

  // UI mapping
  const diceCount = diceResultsCopy.reduce((acc, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {});

  const diceUI = gameState.diceResults.map((result) => {
    const isUsed = diceCount[result] > 0 ? false : true;
    if (!isUsed) diceCount[result]--;

    return { result, used: isUsed };
  });
  return (
    <>
      <div
        className={`relative flex w-full max-w-[250px] flex-col items-center justify-center portrait:w-[30%] landscape:w-[15%]`}
      >
        <p className={`text-center`}>{yourTurn ? "Your" : "Not Your"} turn!</p>
        <button
          className={`my-6 w-full rounded bg-blue-400 p-3 px-6 text-sm font-semibold shadow-md shadow-blue-500/50 transition-all active:scale-90 disabled:bg-zinc-300 disabled:shadow-zinc-500/50 md:p-4 md:px-8`}
          disabled={disableButton}
          onClick={rollDice}
        >
          Roll dice
        </button>
        <div
          className={`m-1 grid w-full grid-cols-2 grid-rows-2 place-items-center gap-2`}
        >
          {diceUI.map(({ result, used }, index) => {
            return (
              <p
                key={index}
                className={`h-full w-full rounded-md border border-none py-4 text-center transition-all duration-300 ${result ? `opacity-1` : `opacity-0`} ${!yourTurn || result === "?" ? `bg-gray-200 shadow-gray-500/50` : used ? `bg-rose-300 shadow-rose-500/50` : `bg-blue-300 shadow-blue-500/50`} text-lg font-semibold shadow-md md:text-2xl`}
              >
                {result || 0}
              </p>
            );
          })}
        </div>
      </div>
    </>
  );
}
