"use client";

import DiceBox from "@3d-dice/dice-box-threejs";
import { useEffect, useState } from "react";
import HomeIcon from "@/public/home.svg";
import LeavePrompt from "../components/LeavePrompt";
import DiceIcon from "@/public/dice.svg";
import ShareIcon from "@/public/share.svg";
import SharePrompt from "./SharePrompt";

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
  const [showShareModal, setShowShareModal] = useState(false);

  // define and set DICE
  useEffect(() => {
    const dpr = window.devicePixelRatio;
    const diceScale = Math.min(
      Math.max(Math.round(0.06 * window.innerWidth), 50),
      85,
    );

    if (typeof window !== "undefined" && !Dice) {
      const DiceBoxInstance = new DiceBox("#app", {
        light_intensity: 1.5,
        gravity_multiplier: 200,
        strength: 1.5,
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
      canvas.style.position = "absolute";
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
        setTimeout(() => {
          const newWidth =
            window.visualViewport?.width ||
            document.documentElement.clientWidth;
          const newHeight =
            window.visualViewport?.height ||
            document.documentElement.clientHeight;

          const newDiceScale = Math.min(
            Math.max(Math.round(0.06 * window.innerWidth), 50),
            85,
          );

          Dice.DiceFactory.baseScale = newDiceScale;
          Dice.renderer.setSize(newWidth, newHeight, false);
          Dice.camera.aspect = newWidth / newHeight;
          Dice.camera.updateProjectionMatrix();
        }, 200);
      }

      function waitForOrientationChange() {
        const timeOut = 1000;
        const interval = 50;

        return new Promise((resolve) => {
          const start = Date.now();
          const targetIsLandscape =
            screen.orientation.type.includes("landscape");

          function check() {
            const width = window.innerWidth;
            const height = window.innerWidth;
            const isLandscape = width > height;

            const matches = targetIsLandscape === isLandscape;
            const timedOut = Date.now() - start > timeOut;

            if (matches || timedOut) {
              resolve();
            } else {
              setTimeout(check, interval);
            }
          }

          check();
        });
      }

      screen.orientation.addEventListener("change", () => {
        waitForOrientationChange().then(() => {
          resizeCanvas();
        });
      });

      window.addEventListener("resize", () => {
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (!isIos) {
          resizeCanvas();
        }
      });

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        screen.orientation.removeEventListener("change", resizeCanvas);
      };
    }
  }, [Dice]);

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

  function handleLeaveModal() {
    setShowLeaveModal(!showLeaveModal);
  }

  function handleShareModal() {
    setShowShareModal(!showShareModal);
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
        className={`relative z-10 flex max-h-min w-full flex-1 flex-col items-center justify-center p-2 portrait:mb-6 portrait:w-[40%] portrait:max-w-[250px] landscape:mr-4 landscape:w-[15%] landscape:max-w-[120px] landscape:md:max-w-[150px]`}
      >
        <div
          className={`relative flex h-12 w-full items-center justify-center transition-all duration-500 [perspective:_1000px] [transform-style:_preserve-3d] ${yourTurn ? `[transform:_rotateX(180deg)]` : `[transform:_rotateX(0)]`}`}
        >
          <p
            className={`absolute text-nowrap text-zinc-600 rounded-xl text-sm md:text-lg p-2 text-center font-semibold [backface-visibility:_hidden] [box-shadow:inset_3px_3px_7px_#828282,inset_-3px_-3px_7px_#ffffff]`}
          >
            Not your turn
          </p>
          <p
            className={`absolute text-nowrap text-sm md:text-lg rounded-xl p-2 text-center font-semibold [backface-visibility:_hidden] [box-shadow:_5px_5px_10px_#828282,_-5px_-5px_10px_#ffffff] [transform:_rotateX(180deg)]`}
          >
            Your turn!
          </p>
        </div>
        <button
          className={`my-6 mt-4 w-full rounded-lg border-b-4 border-b-blue-800 bg-blue-400 p-3 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/50 transition-all [box-shadow:_5px_5px_10px_#828282,_-5px_-5px_10px_#ffffff] active:scale-90 disabled:border-transparent disabled:border-zinc-600 disabled:bg-zinc-300 disabled:text-zinc-600 disabled:shadow-zinc-500/50 md:my-8 md:p-4 md:px-8 md:text-lg landscape:my-4`}
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
                className={`h-full w-full rounded-md border border-none py-4 text-center transition-all duration-300 [box-shadow:_3px_3px_7px_#bebebe,_-3px_-3px_7px_#ffffff] ${result ? `opacity-1` : `opacity-0`} ${!yourTurn || result === "?" ? `bg-gray-200 shadow-gray-500/50` : used ? `bg-rose-300 shadow-rose-500/50` : `bg-blue-300 shadow-blue-500/50`} text-lg font-semibold shadow-md md:text-2xl`}
              >
                {result || 0}
              </p>
            );
          })}
        </div>
      </div>
      <div
        className={`absolute right-0 mr-1 flex h-full flex-col items-end justify-between py-2`}
      >
        <button
          onClick={clearDice}
          className={`relative flex aspect-square max-w-min items-center justify-center rounded-full border border-slate-50 bg-gray-300 [box-shadow:_3px_3px_7px_#bebebe,_-3px_-3px_7px_#ffffff] active:scale-90`}
        >
          <DiceIcon className={`m-2 size-6 fill-red-400`} />
          <div
            className={`absolute right-1/2 top-1/2 h-0.5 w-4/5 translate-x-1/2 rotate-45 bg-red-400`}
          ></div>
        </button>
        <div
          className={`flex flex-col items-center gap-1 landscape:flex-row landscape:md:flex-col`}
        >
          <button
            onClick={handleShareModal}
            className={`flex aspect-square max-w-min items-center justify-center rounded-full bg-blue-500/100 [box-shadow:_3px_3px_7px_#bebebe,_-3px_-3px_7px_#ffffff] active:scale-90`}
          >
            <ShareIcon className={`m-1 size-8 fill-slate-100/90`} />
          </button>
          <div className={`flex flex-col items-center gap-1`}>
            <button
              onClick={handleLeaveModal}
              className={`flex aspect-square max-w-min items-center justify-center rounded-full bg-blue-500/100 [box-shadow:_3px_3px_7px_#bebebe,_-3px_-3px_7px_#ffffff] active:scale-90`}
            >
              <HomeIcon className={`m-0.5 size-9 fill-slate-100/90`} />
            </button>
          </div>
        </div>
      </div>
      {showLeaveModal && <LeavePrompt closeModal={handleLeaveModal} />}
      {showShareModal && (
        <SharePrompt closeModal={handleShareModal} roomId={roomId} />
      )}
    </>
  );
}
