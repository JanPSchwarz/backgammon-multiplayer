import { useState } from "react";

export default function PlayersUI() {
  const paragraphStyles = `flex`;

  return (
    <>
      <div className={`absolute left-0 top-0 h-full w-full`}>
        <div className={``} id="player1">
          <p className={``}>Jan</p>
        </div>
        <div className={``} id="player2">
          <p className={``}>Carla</p>
        </div>
      </div>
    </>
  );
}
