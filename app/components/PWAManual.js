import Modal from "./Modal";
import ShareIcon from "@/public/share.svg";
import { useState, useEffect } from "react";

export default function PWAManual({ handleShowManual }) {
  const [isFireFox, setIsFireFox] = useState(false);

  useEffect(() => {
    if (navigator.userAgent.includes("Firefox")) {
      setIsFireFox(true);
    }
  }, []);

  const UI = [
    {
      step: "1",
      description: (
        <>
          Click this
          <ShareIcon className={`mx-2 inline size-6 align-baseline`} />
          in your browser's address bar or menu!
        </>
      ),
    },
    {
      step: "2",
      description: (
        <>
          A menu opens up where you can see (maybe you have to scroll down)
          something like{" "}
          <span className={`mx-1 rounded bg-gray-400/50 p-0.5 italic`}>
            Add to Home Screen
          </span>{" "}
          or
          <span className={`mx-1 rounded bg-gray-400/50 p-0.5 italic`}>
            Add to Dock
          </span>{" "}
          and click install!
        </>
      ),
    },
    {
      step: "3",
      description: (
        <span className={`font-bold`}>
          Done! Open Backgammon just like an App!
        </span>
      ),
    },
  ];

  return (
    <>
      <Modal onClose={handleShowManual}>
        <div
          className={`flex max-w-[700px] flex-col items-center justify-center gap-8 p-6`}
        >
          <div className={`text-center`}>
            <h1 className={`m-4 text-xl font-bold md:text-2xl`}>
              How to install Backgammon on your Device!
            </h1>
            <p className={`text-sm italic`}>
              On non-Chromium browsers, you have to install manually...
              {isFireFox && (
                <span className={`block`}>
                  For Firefox you need a extra extension for this feature!
                </span>
              )}
            </p>
          </div>
          <div className={`flex flex-col gap-6 text-sm md:text-lg`}>
            {UI.map(({ step, description }) => {
              return (
                <>
                  <div
                    className={`grid grid-cols-6 items-center gap-4 md:grid-cols-10`}
                  >
                    <div
                      className={`col-span-1 flex aspect-square items-center justify-center rounded-full bg-blue-400 text-white`}
                    >
                      {step}
                    </div>
                    <p className={`col-span-5 md:col-span-9`}>{description}</p>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
}
