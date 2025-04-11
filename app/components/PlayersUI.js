import { useState } from "react";
import { twMerge } from "tailwind-merge";
import useLocalStorageState from "use-local-storage-state";
import NameModal from "./NameModal";
import PencilIcon from "@/public/pencil.svg";

export default function PlayersUI({
  yourColor,
  opponentName,
  webSocket,
  roomId,
}) {
  const [yourName, setYourName] = useLocalStorageState("yourName");
  const [showNameModal, setShowNameModal] = useState(false);

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

  const commonTextClasses = `px-1 bg-blue-300 gap-1 flex justify-center items-center text-sm rounded-md md:text-lg lg:text-xl`;
  const commonWrapperClasses = `absolute`;

  const playerUI = [
    {
      playerName: firstPlayer,
      addWrapperClasses: `left-[10%] top-[2%]`,
      addTextClasses: `bg-stone-900 text-white border-[0.5px] border-white`,
      isYou: yourColor === "black" ? true : false,
    },
    {
      playerName: secondPlayer,
      addWrapperClasses: `bottom-[2%] right-[10%] `,
      addTextClasses: `bg-white border-[0.5px] border-black`,
      isYou: yourColor === "white" ? true : false,
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
          ({ playerName, addTextClasses, addWrapperClasses, isYou }, index) => {
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
