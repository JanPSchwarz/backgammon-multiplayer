import Board from "@/public/board/board.webp";
import WhiteStone from "@/public/board/whitestone.webp";
import BlackStone from "@/public/board/blackstone.webp";

import Image from "next/image";

export default function GameBoard({}) {
  const area1 = [5, 4, 3, 2, 1, 0];
  const area2 = [11, 10, 9, 8, 7, 6];
  const area3 = [12, 13, 14, 15, 16, 17];
  const area4 = [18, 19, 20, 21, 22, 23];

  const gameState = {
    0: [
      { id: 1, color: "black" },
      { id: 2, color: "black" },
    ],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [
      { id: 26, color: "white" },
      { id: 27, color: "white" },
      { id: 28, color: "white" },
      { id: 29, color: "white" },
      { id: 30, color: "white" },
    ],
    6: [],
    7: [
      { id: 23, color: "white" },
      { id: 24, color: "white" },
      { id: 25, color: "white" },
    ],
    8: [],
    9: [],
    10: [],
    11: [
      { id: 3, color: "black" },
      { id: 4, color: "black" },
      { id: 5, color: "black" },
      { id: 6, color: "black" },
      { id: 7, color: "black" },
    ],
    12: [
      { id: 18, color: "white" },
      { id: 19, color: "white" },
      { id: 20, color: "white" },
      { id: 21, color: "white" },
      { id: 22, color: "white" },
    ],
    13: [],
    14: [],
    15: [],
    16: [
      { id: 8, color: "black" },
      { id: 9, color: "black" },
      { id: 10, color: "black" },
    ],
    17: [],
    18: [
      { id: 11, color: "black" },
      { id: 12, color: "black" },
      { id: 13, color: "black" },
      { id: 14, color: "black" },
      { id: 15, color: "black" },
    ],
    19: [],
    20: [],
    21: [],
    22: [],
    23: [
      { id: 16, color: "white" },
      { id: 17, color: "white" },
    ],
  };

  return (
    <div className={`relative w-4/5`}>
      <Image
        src={Board}
        alt="Backgammon board"
        quality={50}
        className={`w-full`}
      />
      <div
        className={`absolute right-1/2 top-1/2 z-10 flex h-[77%] w-[70%] translate-x-[49.5%] translate-y-[-50.5%] flex-col gap-[3%]`}
      >
        <div className={`flex w-full flex-1`}>
          <div className={`grid h-full w-full grid-cols-6`}>
            {area2.map((field) => {
              return (
                <div
                  key={field}
                  id={field}
                  className={`grid translate-x-[5%] grid-cols-1 place-content-start border-[2px] border-red-500`}
                >
                  {/* {field} */}
                  {gameState[field]?.map(({ id, color }, index) => {
                    const length = gameState[field].length;
                    const stack = length > 5;
                    return (
                      <Image
                        key={id}
                        id={id}
                        src={color === "black" ? BlackStone : WhiteStone}
                        alt="Stone"
                        className={``}
                        style={{
                          position: `relative`,
                          top: stack ? `-${index * 71}%` : "0",
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className={`h-full w-[10%]`} />
          <div className={`grid h-full w-full translate-x-[1%] grid-cols-6`}>
            {area1.map((field) => {
              return (
                <div
                  key={field}
                  id={field}
                  className={`grid grid-cols-1 place-content-start border-[2px] border-red-500`}
                >
                  {/* {field} */}
                  {gameState[field]?.map(({ id, color }, index) => {
                    const length = gameState[field].length;
                    const stack = length > 5;
                    return (
                      <Image
                        key={id}
                        id={id}
                        src={color === "black" ? BlackStone : WhiteStone}
                        alt="Stone"
                        className={``}
                        style={{
                          position: `relative`,
                          top: stack ? `-${index * 71}%` : "0",
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className={`flex w-full flex-1`}>
          <div className={`grid w-full translate-x-[-1%] grid-cols-6`}>
            {area3.map((field) => {
              return (
                <div
                  key={field}
                  id={field}
                  className={`grid grid-cols-1 place-content-end gap-[0.5%] border-[2px] border-red-500`}
                >
                  {/* {field} */}
                  {gameState[field]?.map(({ id, color }, index) => {
                    const length = gameState[field].length;
                    const stack = length > 5;
                    return (
                      <Image
                        key={id}
                        id={id}
                        src={color === "black" ? BlackStone : WhiteStone}
                        alt="Stone"
                        className={``}
                        style={{
                          position: `relative`,
                          top: stack ? `-${index * 71}%` : "0",
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className={`h-full w-[10%]`} />
          <div className={`grid w-full translate-x-[-2.5%] grid-cols-6`}>
            {area4.map((field) => {
              return (
                <div
                  key={field}
                  id={field}
                  className={`grid grid-cols-1 place-content-end border-[2px] border-red-500`}
                >
                  {/* {field} */}
                  {gameState[field]?.map(({ id, color }, index) => {
                    const length = gameState[field].length;
                    const stack = length > 5;
                    return (
                      <Image
                        key={id}
                        id={id}
                        src={color === "black" ? BlackStone : WhiteStone}
                        alt="Stone"
                        className={``}
                        style={{
                          position: `relative`,
                          top: stack ? `-${index * 71}%` : "0",
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
