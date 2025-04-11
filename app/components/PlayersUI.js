import { useState } from "react";
import { twMerge } from "tailwind-merge";
import useLocalStorageState from "use-local-storage-state";
import NameModal from "./NameModal";
import PencilIcon from "@/public/pencil.svg";

export default function PlayersUI({
  yourColor,
  yourId,
  opponentName,
  webSocket,
  roomId,
  score,
}) {
  const [yourName, setYourName] = useLocalStorageState("yourName");
  const [showNameModal, setShowNameModal] = useState(false);

  // {63d3530f773: 7, 3d3530f7733: 1}

  const firstPlayer =
    yourColor === "black"
      ? yourName
        ? yourName
        : "Player 1"
      : opponentName
        ? opponentName
        : "Player 1";

  const secondPlayer =
    yourColor === "white"
      ? yourName
        ? yourName
        : "Player 2"
      : opponentName
        ? opponentName
        : "Player 2";

  const yourScore = score[yourId] || "0";

  const opponentScore =
    Object.keys(score)
      .filter((id) => id !== yourId)
      ?.map((id) => score[id])[0] || "0";

  const isFirstGame = Object.keys(score).length === 0;

  const commonTextClasses = `bg-blue-300 gap-1 pl-1 flex justify-between items-center text-sm rounded-md md:text-lg lg:text-xl`;
  const commonWrapperClasses = `absolute`;

  const playerUI = [
    {
      playerName: firstPlayer,
      addWrapperClasses: `left-[10%] top-[2%]`,
      addTextClasses: `bg-stone-900 text-white border-[0.5px] border-white`,
      isYou: yourColor === "black" ? true : false,
      score: yourColor === "black" ? yourScore : opponentScore,
    },
    {
      playerName: secondPlayer,
      addWrapperClasses: `bottom-[2%] right-[10%] `,
      addTextClasses: `bg-white border-[0.5px] border-black`,
      isYou: yourColor === "white" ? true : false,
      score: yourColor === "white" ? yourScore : opponentScore,
    },
  ];

  function handleModal() {
    setShowNameModal(!showNameModal);
  }

  function changeName(value) {
    setYourName(value);
    webSocket.send(JSON.stringify({ type: "send-name", roomId, name: value }));
  }

  return (
    <>
      <div className={`absolute left-0 top-0 h-full w-full`}>
        {playerUI.map(
          (
            { playerName, addTextClasses, addWrapperClasses, isYou, score },
            index,
          ) => {
            return (
              <button onClick={isYou ? handleModal : undefined} key={index}>
                <div
                  className={twMerge(commonWrapperClasses, addWrapperClasses)}
                  id={playerName}
                >
                  <p className={twMerge(commonTextClasses, addTextClasses)}>
                    {isYou && (
                      <PencilIcon
                        className={`size-3 md:size-4 ${yourColor === "black" ? `fill-white` : `fill-black`}`}
                      />
                    )}
                    {playerName}
                    <span
                      className={`rounded-r bg-orange-300 px-0.5 text-black`}
                    >
                      {!isFirstGame && `${score}`}
                    </span>
                  </p>
                </div>
              </button>
            );
          },
        )}
      </div>
      {showNameModal && (
        <NameModal
          closeModal={handleModal}
          changeName={changeName}
          yourName={yourName}
        />
      )}
    </>
  );
}
