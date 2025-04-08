import Modal from "./Modal";
import { useState, useEffect } from "react";
import CopyIcon from "@/public/copy.svg";

export default function SharePrompt({ closeModal, roomId }) {
  const [idCopied, setIdCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [deviceCanShare, setDeviceCanShare] = useState(false);

  // share capability
  useEffect(() => {
    const canShare = !!navigator.share;
    if (canShare) {
      setDeviceCanShare(true);
    }
  }, []);

  async function shareRoom(data, handleUI) {
    if (deviceCanShare) {
      try {
        await navigator.share(data);
      } catch (error) {
        console.log("error writing to clipboard:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(data);
        handleUI();
      } catch (error) {
        console.log("error writing to clipboard:", error);
      }
    }
  }

  function shareId() {
    const text = `${roomId}`;

    function handleUI() {
      setIdCopied(true);
      setTimeout(() => {
        setIdCopied(false);
      }, 1000);
    }

    const nativeShareData = {
      text: text,
    };

    const sendData = deviceCanShare ? nativeShareData : text;

    shareRoom(sendData, handleUI);
  }

  function shareUrl() {
    const baseURL = window.location.href;
    const url = `${baseURL}${roomId}`;

    const nativeShareData = {
      title: "Wanna play Backgammon?\n",
      url: `${url}`,
    };

    const sendData = deviceCanShare ? nativeShareData : url;

    function handleUI() {
      setUrlCopied(true);
      setTimeout(() => {
        setUrlCopied(false);
      }, 1000);
    }

    shareRoom(sendData, handleUI);
  }

  return (
    <>
      <Modal onClose={closeModal}>
        <div className={`flex flex-col gap-4 p-6`}>
          <button onClick={shareId} className={`group flex gap-4`}>
            <div
              className={`flex aspect-square w-10 items-center justify-center rounded-full bg-blue-500 text-center font-semibold text-white group-active:scale-90`}
            >
              {idCopied ? <CopyIcon className={`size-5 fill-white`} /> : "ID"}
            </div>
            <p className={`flex items-center justify-center`}>Share RoomID</p>
          </button>
          <button onClick={shareUrl} className={`flex group gap-4`}>
            <div
              className={`flex aspect-square w-10 items-center justify-center rounded-full bg-blue-500 text-center font-semibold text-white group-active:scale-90`}
            >
              {urlCopied ? <CopyIcon className={`size-5 fill-white`} /> : "URL"}
            </div>
            <p className={`flex items-center justify-center`}>
              Share complete URL
            </p>
          </button>
        </div>
      </Modal>
    </>
  );
}
