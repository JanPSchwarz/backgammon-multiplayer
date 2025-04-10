import { useState } from "react";
import { twMerge } from "tailwind-merge";
import useLocalStorageState from "use-local-storage-state";
import NameModal from "./NameModal";

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

  const commonTextClasses = `px-1 bg-blue-300 text-sm rounded-md md:text-lg lg:text-2xl`;
  const commonWrapperClasses = `absolute`;

  const playerUI = [
    {
      playerName: firstPlayer,
      addWrapperClasses: `left-16 top-1 portrait:-top-3`,
      addTextClasses: `bg-stone-900 text-white`,
      isYou: yourColor === "black" ? true : false,
    },
    {
      playerName: secondPlayer,
      addWrapperClasses: `bottom-1 right-16 portrait:-bottom-3`,
      addTextClasses: `bg-white`,
      isYou: yourColor === "white" ? true : false,
    },
  ];

  function handleModal(event) {
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
