import { useState } from "react";
import { twMerge } from "tailwind-merge";

export default function PlayersUI() {
  const commonTextClasses = `px-1 bg-blue-300 text-sm rounded-md md:text-lg lg:text-2xl`;
  const commonWrapperClasses = `absolute`;

  const playerUI = [{ playerName: "Jan", textClasses: ``, wrapperClasses: `` }];

  return (
    <>
      <div className={`absolute left-0 top-0 h-full w-full`}>
        <div
          className={twMerge(
            commonWrapperClasses,
            `left-16 top-1 portrait:-top-3`,
          )}
          id="player1"
        >
          <p className={twMerge(commonTextClasses, `bg-stone-900 text-white`)}>
            Jan
          </p>
        </div>
        <div
          className={twMerge(
            commonWrapperClasses,
            `bottom-1 right-16 portrait:-bottom-3`,
          )}
          id="player2"
        >
          <p className={twMerge(commonTextClasses, `bg-white`)}>Carla</p>
        </div>
      </div>
    </>
  );
}
