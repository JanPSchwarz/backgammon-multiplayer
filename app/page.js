"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { uid } from "uid";
import PWAManual from "./components/PWAManual";
import ShareIcon from "@/public/share.svg";
import { useRouter } from "next/navigation";

export default function Room() {
  const [newRoomId, setNewRoomId] = useState();
  const [showText, setShowText] = useState(false);
  const [deviceCanShare, setDeviceCanShare] = useState(false);

  const [pwaNOTinstalled, setpwaNOTinstalled] = useState(false);
  const [storedPrompt, setStorePrompt] = useState(false);
  const [showManualForPWA, setShowManualForPWA] = useState(false);

  const [noRoom, setNoRoom] = useState(false);

  const socketRef = useRef(null);
  const router = useRouter();

  // handle WS && MESSAGES
  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

    console.log("WEBSOCKET_URL:", WS_URL);

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("connected to websocket");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "room-created") {
        setNewRoomId(message.roomId);
        console.log("room created:", message.roomId);
      }

      if (message.type === "error") {
        console.log("ws-error", message.message);
      }

      if (message.type === "room-exists") {
        const roomExists = message.exists;
        if (roomExists) {
          const roomId = message.roomId;
          router.push(`/${roomId}`);
        } else {
          setNoRoom(true);
        }
      }
    };

    ws.onclose = () => {
      console.log("websocket disconnected");
    };

    socketRef.current = ws;
    console.log(ws);
  }, []);

  useEffect(() => {
    const isChromium =
      !!window.chrome &&
      (/Chrome/.test(navigator.userAgent) ||
        /chromium/.test(navigator.userAgent));

    // for iOs (Safari) && Firefox && other not Chromium Browser
    if (!isChromium) {
      const isPWA = window.matchMedia("(display-mode: standalone)").matches;
      setpwaNOTinstalled(!isPWA);
    }

    // for Chromium Browsers
    function handleInstallPrompt(event) {
      event.preventDefault();
      setStorePrompt(event);
      setpwaNOTinstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    return () =>
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  // clipboard notification
  useEffect(() => {
    let timeOut;
    if (showText) {
      timeOut = setTimeout(() => {
        setShowText(false);
      }, 3500);
    }

    return () => clearTimeout(timeOut);
  }, [showText]);

  // share capability
  useEffect(() => {
    const canShare = !!navigator.share;
    if (canShare) {
      setDeviceCanShare(true);
    }
  }, []);

  useEffect(() => {
    if (noRoom) {
      setTimeout(() => {
        setNoRoom(false);
      }, 4000);
    }
  }, [noRoom]);

  function createRoom() {
    const newRoomId = uid();

    setNewRoomId(newRoomId);

    socketRef.current.send(
      JSON.stringify({ type: "create-room", roomId: newRoomId }),
    );
  }

  function installPWA() {
    if (storedPrompt) {
      storedPrompt.prompt();
    } else {
      setShowManualForPWA(true);
    }
  }

  function handleShowManual() {
    setShowManualForPWA(false);
  }

  async function shareLink() {
    if (newRoomId) {
      const baseURL = window.location.href;
      const newURL = `${baseURL}${newRoomId}`;

      const data = {
        title: "Wanna play Backgammon?\n",
        url: `${newURL}`,
        text: `\nURL: ${newURL}\n\nRoom id: ${newRoomId}\n`,
      };

      if (deviceCanShare) {
        try {
          await navigator.share(data);
        } catch (error) {
          console.log("error writing to clipboard:", error);
        }
      } else {
        const text = `URL: ${newURL}\n\nRoom Id: ${newRoomId}`;
        try {
          await navigator.clipboard.writeText(text);
          setShowText(true);
        } catch (error) {
          console.log("error writing to clipboard:", error);
        }
      }
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!event.target.checkValidity()) {
      return;
    }
    if (event.target[0].value) {
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());
      socketRef.current.send(
        JSON.stringify({ type: "check-exist", roomId: data.roomId }),
      );
    }
  }

  return (
    <div className={`flex max-w-[200px] flex-col items-center justify-center`}>
      {showManualForPWA && <PWAManual handleShowManual={handleShowManual} />}
      {pwaNOTinstalled && (
        <button
          className={`absolute right-0 top-0 m-6 rounded-md bg-green-400/80 p-2 text-sm font-semibold shadow-md shadow-green-800/30 md:p-4 md:py-3 md:text-base`}
          onClick={installPWA}
        >
          Install App!
        </button>
      )}
      <button
        className={`my-6 w-full rounded-md bg-orange-500 p-6 text-xl font-semibold`}
        onClick={createRoom}
      >
        Create Room
      </button>
      <div
        className={`relative flex w-full ${newRoomId ? `opacity-100` : `opacity-0`} items-center gap-2 transition-opacity duration-300`}
      >
        <Link
          href={`/${newRoomId}`}
          className={`w-full rounded-md bg-indigo-300 p-2 text-center font-semibold`}
        >
          Your room is ready
        </Link>
        <button
          className={`absolute -right-1 translate-x-[100%]`}
          onClick={shareLink}
        >
          <ShareIcon className={`size-10 rounded-md bg-indigo-300 p-1`} />
        </button>
        <p
          className={`pointer-events-none absolute max-h-min w-full rounded-md bg-slate-400 bg-opacity-20 p-2 text-center text-sm transition-all duration-300 ${showText ? `opacity-1 top-[200%]` : `top-[150%] opacity-0`}`}
        >
          Link copied! Share with a friend ❤️
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className={`relative flex translate-y-12 flex-col gap-2`}
      >
        <label
          className={`max-w-min text-nowrap rounded-md bg-white p-1`}
          htmlFor="roomId"
        >
          Join Room
        </label>
        <div className={`flex gap-2`}>
          <input
            className={`w-full rounded p-2 placeholder:px-1 invalid:border-red-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:invalid:border-red-400 focus:invalid:ring-red-400`}
            id="roomId"
            type="text"
            pattern="[a-z0-9]{11}"
            title="11 characters, only numbers and small letters"
            maxLength={11}
            name="roomId"
            placeholder="Room Id"
          />
          <button className={`rounded-md bg-green-400 p-1.5`} type="submit">
            Go
          </button>
          {noRoom && (
            <p
              className={`absolute bottom-0 my-2 w-full translate-y-[200%] rounded-md bg-red-400/50 p-1`}
            >
              Room doesn't exist...
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
