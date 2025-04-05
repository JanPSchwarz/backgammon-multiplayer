"use client";

// import DiceBox from "@3d-dice/dice-box";
import DiceBox from "@3d-dice/dice-box-threejs";
import { useEffect, useState } from "react";
import HomeIcon from "@/public/home.svg";
import LeavePrompt from "../components/LeavePrompt";
import DiceIcon from "@/public/dice.svg";
import ShareIcon from "@/public/share.svg";

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

  //UI
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // define and set DICE
  useEffect(() => {
    const dpr = window.devicePixelRatio;
    const diceScale = Math.max(Math.round(0.0422 * window.innerWidth), 50);

    console.log("DPR:", dpr);

    if (typeof window !== "undefined" && !Dice) {
      const DiceBoxInstance = new DiceBox("#app", {
        light_intensity: 1.5,
        gravity_multiplier: 200,
        strength: 10,
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
      canvas.width = canvas.width * dpr;
      canvas.height = canvas.height * dpr;
    }

    return () => {
      if (canvas) canvas.remove();
    };
  }, []);

  // drawing canvas correctly ratio to dpr
  useEffect(() => {
    if (Dice) {
      Dice.renderer.setPixelRatio(window.devicePixelRatio);

      function resizeCanvas() {
        const body = document.querySelector("body");

        setTimeout(() => {
          const newWidth = Number(
            getComputedStyle(body).getPropertyValue("width").split("px")[0],
          );

          const newHeight = Number(
            getComputedStyle(body).getPropertyValue("height").split("px")[0],
          );

          const dpr = window.devicePixelRatio;
          const newDiceScale = Math.max(
            Math.round(0.0422 * window.innerWidth),
            50,
          );

          console.log("NEW WIDTH", newWidth);
          console.log("NEW HEIGHT", newHeight);

          Dice.renderer.setSize(newWidth, newHeight, true);
          Dice.camera.aspect = newWidth / newHeight;
          Dice.camera.updateProjectionMatrix();
          Dice.DiceFactory.baseScale = newDiceScale;
        }, 100);
      }

      window.addEventListener("resize", resizeCanvas);
      window.addEventListener("orientationchange", resizeCanvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        window.removeEventListener("orientationchange", resizeCanvas);
      };
    }
  }, [Dice]);

  if (Dice) {
    console.log("RENDERER PIXEL RATIO", Dice.renderer.getPixelRatio());
    console.log("CAMERA PERSPECTIVE", Dice);
  }

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

  function clearDice() {
    if (Dice) {
      Dice.renderer.clear();
    }
  }

  function handleModal() {
    setShowLeaveModal(false);
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
        className={`relative flex max-h-min w-full flex-1 flex-col items-center justify-center portrait:mb-6 portrait:w-[30%] portrait:max-w-[250px] landscape:mr-4 landscape:w-[15%] landscape:max-w-[120px] landscape:md:max-w-[150px]`}
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
      <button
        onClick={() => {
          setShowLeaveModal(true);
        }}
        className={`absolute bottom-0 right-0 z-10`}
      >
        <HomeIcon className={`m-2 size-10 fill-blue-500 md:size-10`} />
      </button>
      <button
        onClick={clearDice}
        className={`absolute right-0 top-0 m-1 rounded-full bg-gray-300 p-2`}
      >
        <DiceIcon className={`size-6 fill-red-400`} />
        <div
          className={`absolute right-1/2 top-1/2 h-0.5 w-4/5 translate-x-1/2 rotate-45 bg-red-400`}
        ></div>
      </button>
      {showLeaveModal && <LeavePrompt closeModal={handleModal} />}
    </>
  );
}
