"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { uid } from "uid";
import PWAManual from "./components/PWAManual";
import ShareIcon from "@/public/share.svg";

export default function Room() {
  const [newRoomId, setNewRoomId] = useState();
  const [showText, setShowText] = useState(false);
  const [deviceCanShare, setDeviceCanShare] = useState(false);

  const [pwaNOTinstalled, setpwaNOTinstalled] = useState(false);
  const [storedPrompt, setStorePrompt] = useState(false);
  const [showManualForPWA, setShowManualForPWA] = useState(false);

  const socketRef = useRef(null);

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

  function createRoom() {
    const newRoomId = uid();

    const baseURL = window.location.href;
    const newURL = `${baseURL}/${newRoomId}`;
    navigator.clipboard.writeText(newURL);

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

  function shareLink() {
    if (newRoomId) {
      const baseURL = window.location.href;
      const newURL = `${baseURL}${newRoomId}`;

      const data = {
        title: "Wanna play Backgammon?",
        url: newURL,
      };

      if (deviceCanShare) {
        navigator.share(data);
      } else {
        navigator.clipboard.writeText(newURL);
        setShowText(true);
      }
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center`}>
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
        className={`my-6 rounded-md bg-orange-500 p-6 text-xl font-semibold`}
        onClick={createRoom}
      >
        Create Room
      </button>
      <div
        className={`flex ${newRoomId ? `opacity-100` : `opacity-0`} items-center gap-2 transition-opacity duration-300`}
      >
        <Link
          href={`/${newRoomId}`}
          className={`rounded-md bg-indigo-300 p-2 text-center font-semibold`}
        >
          Your room is ready
        </Link>
        <button className={``} onClick={shareLink}>
          <ShareIcon className={`size-10 rounded-md bg-indigo-300 p-1`} />
        </button>
      </div>

      <p
        className={`relative m-6 rounded-md bg-slate-400 bg-opacity-20 p-2 text-center text-sm transition-all duration-300 ${showText ? `opacity-1 top-0` : `-top-[20px] opacity-0`}`}
      >
        Link was copied to Clipboard! Share it with a friend ❤️
      </p>
    </div>
  );
}
