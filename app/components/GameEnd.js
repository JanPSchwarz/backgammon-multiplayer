import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";

export default function GameEnd({
  score,
  closeModal,
  yourName,
  opponentName,
  yourId,
  yourColor,
  opponentWantsRematch,
  webSocket,
  roomId,
}) {
  const [youWantRematch, setYouWantRematch] = useState(null);

  const router = useRouter();

  const yourScore = score[yourId];
  const opponentScore = Object.keys(score)
    .filter((id) => id !== yourId)
    ?.map((id) => score[id])[0];

  const yourSelf =
    yourName || (yourColor === "black" ? "Player 1" : "Player 2");

  const opponent =
    opponentName || (yourColor === "black" ? "Player 2" : "Player 1");

  const scoreUI = [
    { name: yourSelf, score: yourScore },
    { name: opponent, score: opponentScore },
  ];

  function handleRematch(value) {
    webSocket.send(
      JSON.stringify({ type: "wants-rematch", answer: value, roomId }),
    );

    setYouWantRematch(value);
    if (value === false) {
      router.push("/");
    }
  }

  return (
    <>
      <Modal>
        <div className={`flex flex-col items-center justify-center gap-4 p-8`}>
          <h2 className={`text-lg font-semibold`}>Game End!</h2>
          <div className={`grid grid-cols-2 gap-2`}>
            {scoreUI.map(({ name, score }, index) => {
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center`}
                >
                  <p className={`mb-2`}>{name}</p>
                  <p
                    className={`rounded border border-dashed border-black bg-gray-200 p-4 font-mono text-lg`}
                  >
                    {score || "0"}
                  </p>
                </div>
              );
            })}
          </div>
          <p>Re-Match?</p>
          <div className={`grid grid-cols-2 gap-2`}>
            <button
              onClick={() => handleRematch(true)}
              className={`rounded-md px-4 py-1 ${
                youWantRematch !== null && youWantRematch === false
                  ? `bg-gray-300 text-gray-600`
                  : `bg-green-300 text-green-600`
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleRematch(false)}
              className={`rounded-md bg-red-300 px-4 py-1 text-red-600`}
            >
              Leave
            </button>
          </div>
          {opponentWantsRematch !== null && (
            <p
              className={`my-4 rounded-md px-2 py-1 ${opponentWantsRematch ? `bg-green-400/90` : `bg-red-400/90`}`}
            >
              {opponentName}{" "}
              {opponentWantsRematch ? " wants " : " doesn't want "}
              to rematch!
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
