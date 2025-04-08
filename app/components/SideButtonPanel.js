import { twMerge } from "tailwind-merge";
import { useState } from "react";
import CirceTimer from "./CircleTimer";

import HomeIcon from "@/public/home.svg";
import LeavePrompt from "../components/LeavePrompt";
import DisconnectModal from "./DisconnectModal";
import DiceIcon from "@/public/dice.svg";
import ShareIcon from "@/public/share.svg";
import SharePrompt from "./SharePrompt";
import ExclamationIcon from "@/public/exclamation.svg";

export default function SideButtonPanel({
  clearDice,
  oponentDisconnect,
  roomId,
  switchTurnTimer,
}) {
  const [showModals, setShowModals] = useState({
    leaveModal: false,
    shareModal: false,
    disconnectModal: false,
  });

  const { leaveModal, shareModal, disconnectModal } = showModals;

  function handleShowModal(key) {
    setShowModals((prev) => {
      const newState = {};

      for (const key in prev) {
        newState[key] = false;
      }
      newState[key] = true;
      return newState;
    });
  }

  function handleCloseModal() {
    setShowModals((prev) =>
      Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {}),
    );
  }

  const sharedWrapperClassNames = `relative flex aspect-square max-w-min items-center justify-center rounded-full [box-shadow:_3px_3px_7px_#bebebe,_-3px_-3px_7px_#ffffff] active:scale-90 bg-blue-500/100`;

  const sharedIconClassNames = `m-1 size-6 md:size-8 md:m-2 fill-slate-100/90`;

  return (
    <>
      <div
        className={`absolute right-0 mr-1 flex h-full flex-col items-end justify-between py-2`}
      >
        <button
          onClick={clearDice}
          className={twMerge(
            sharedWrapperClassNames,
            `border border-slate-50 bg-gray-300`,
          )}
        >
          <DiceIcon className={twMerge(sharedIconClassNames, `fill-red-400`)} />
          <div
            className={`absolute right-1/2 top-1/2 h-0.5 w-4/5 translate-x-1/2 rotate-45 bg-red-400`}
          ></div>
        </button>
        <div
          className={`flex flex-col items-center gap-2 landscape:flex-row landscape:md:flex-col`}
        >
          {switchTurnTimer && (
            <div
              className={twMerge(
                sharedWrapperClassNames,
                `h-8 w-8 border-2 border-blue-500 bg-transparent p-1 md:h-11 md:w-11`,
              )}
            >
              <CirceTimer time={switchTurnTimer} />
            </div>
          )}
          {oponentDisconnect && (
            <button
              onClick={() => handleShowModal("disconnectModal")}
              className={twMerge(sharedWrapperClassNames, `bg-red-500/100`)}
            >
              <ExclamationIcon className={twMerge(sharedIconClassNames, ``)} />
            </button>
          )}
          <button
            onClick={() => handleShowModal("shareModal")}
            className={twMerge(sharedWrapperClassNames, ``)}
          >
            <ShareIcon className={twMerge(sharedIconClassNames, ``)} />
          </button>
          <div className={`flex flex-col items-center gap-1`}>
            <button
              onClick={() => handleShowModal("leaveModal")}
              className={twMerge(sharedWrapperClassNames, ``)}
            >
              <HomeIcon className={twMerge(sharedIconClassNames, ``)} />
            </button>
          </div>
        </div>
      </div>
      {leaveModal && <LeavePrompt closeModal={handleCloseModal} />}
      {shareModal && (
        <SharePrompt closeModal={handleCloseModal} roomId={roomId} />
      )}
      {disconnectModal && <DisconnectModal closeModal={handleCloseModal} />}
    </>
  );
}
