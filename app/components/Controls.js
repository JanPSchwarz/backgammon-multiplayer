"use client";

import DiceBox from "@3d-dice/dice-box-threejs";
import { useEffect, useState } from "react";
import DiceControlsPanel from "./DiceControlsPanel";
import SideButtonPanel from "./SideButtonPanel";

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
  oponentDisconnect,
  switchTurnTimer,
  readyToStart,
}) {
  const [Dice, setDice] = useState(null);

  const [diceColor, setDiceColor] = useState(undefined);

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

  // UI useEffects

  useEffect(() => {
    if (!diceColor) {
      const randomColor = pickRandomColor();
      setDiceColor(randomColor);
    }
  }, [diceColor]);

  console.log("DICE COLOR:", diceColor);

  // handle socket MESSAGES
  useEffect(() => {
    if (!socket.current) return;

    function handleMessage(event) {
      const message = JSON.parse(event.data);
      if (message.type === "dice-rolled") {
        handleGameState("diceResults", ["?", "?"]);
        const { determinedNumbers, theme_colorset } = message.diceConfig;

        console.log("THEME LOG:", message.diceConfig);

        Dice.updateConfig({ theme_colorset }).then(() => {
          Dice.roll(`2dpip@${determinedNumbers}`);
        });
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
      "fire",
      "earth",
      "ice",
      "force",
      "bloodmoon",
      "swrpg_abi",
      "swa_red",
    ];
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
    const theme_colorset = diceColor;
    console.log("THEME:", theme_colorset);

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

  return (
    <>
      <DiceControlsPanel
        diceResultsCopy={diceResultsCopy}
        gameState={gameState}
        yourTurn={yourTurn}
        disableButton={disableButton}
        rollDice={rollDice}
      />
      <SideButtonPanel
        clearDice={clearDice}
        oponentDisconnect={oponentDisconnect}
        roomId
        switchTurnTimer={switchTurnTimer}
        readyToStart={readyToStart}
      />
    </>
  );
}
