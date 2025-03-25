"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import GameBoard from "./components/GameBoard";

const DiceComponent = dynamic(() => import("@3d-dice/dice-box"), {
  ssr: false,
});

export default function Home() {
  const [Dice, setDice] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@3d-dice/dice-box").then((module) => {
        const DiceBox = module.default;

        const diceInstance = new DiceBox({
          id: "dice-canvas",
          container: "#roll-box",
          assetPath: "/assets/",
          startingHeight: 8,
          throwForce: 6,
          spinForce: 5,
          lightIntensity: 0.9,
          scale: 15,
          onDieComplete: (result) => console.log(result),
        });

        diceInstance.init().then(() => {
          console.log("Dice ready");
        });

        const canvas = document.querySelector(`#dice-canvas`);

        if (canvas) {
          canvas.style.width = "100%";
          canvas.style.height = "100%";
        }

        setDice(diceInstance);
      });
    }
  }, []);

  console.log(Dice);

  function rollDice(event) {
    event.preventDefault();
    const attr = event.currentTarget.id.replace("roll-", "");
    Dice.show().roll("2d6", attr);
  }

  return (
    <>
      <div className={`flex items-center justify-center`}>
        <GameBoard />
        <div id="roll-box" className={`w-full flex-1 border-[3px]`}></div>
        <button
          onClick={(event) => {
            rollDice(event);
          }}
        >
          Roll dice
        </button>
      </div>
    </>
  );
}
