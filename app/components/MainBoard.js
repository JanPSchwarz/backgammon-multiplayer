import WhiteStone from "@/public/board/whitestone.webp";
import BlackStone from "@/public/board/blackstone.webp";
import Image from "next/image";
import { board } from "../utils/board";
import { twMerge } from "tailwind-merge";

export default function MainBoard({ gameState, selectedField, showOptions, onClickHandler }) {
  return (
    <>
      <div
        className={`absolute right-1/2 top-1/2 z-10 flex h-[77%] w-[70%] translate-x-[49.5%] translate-y-[-50.5%] flex-col gap-[3%]`}
      >
        {board.map((area, index) => {
          return (
            <div key={index} className={`flex w-full flex-1 gap-[5%]`}>
              {area.map(
                ({ fields, areaStyles, fieldStyles, stoneStyles }, index) => {
                  return (
                    <div
                      key={index}
                      className={
                        twMerge(areaStyles, `grid h-full grid-cols-6`) +
                        ` field`
                      }
                    >
                      {fields.map((id) => {
                        const isBottom = id > 12 && id < 25;
                        return (
                          <div
                            key={id}
                            id={id}
                            onClick={() => {
                              onClickHandler(id);
                            }}
                            className={twMerge(
                              fieldStyles,
                              `relative grid grid-cols-1 ${isBottom ? `rounded-t-xl` : `rounded-b-xl`}`,
                              `${id === selectedField ? `bg-red-500/40 shadow-2xl shadow-red-500/50 ring-inset ring-red-500/30` : ``}`,
                              `${showOptions?.singleDiceOptions?.includes(id) ? `bg-blue-500/50 shadow-2xl shadow-blue-400/50 ring-inset ring-blue-400/50` : ``}`,
                              `${showOptions?.combinedOptions?.includes(id) ? `bg-orange-400/40 shadow-2xl shadow-orange-400/30 ring-inset ring-orange-400/30` : ``}`,
                            )}
                          >
                            {gameState.board[id]?.map(
                              ({ id: field, color }, index) => {
                                const numberOfStones =
                                  gameState.board[id].length;
                                const isBottom = id > 12 && id < 25;
                                const stack = numberOfStones > 5;
                                const direction = isBottom ? -1 : 1;
                                const spacing = 438 / numberOfStones;
                                const value = index * spacing * direction;
                                return (
                                  <Image
                                    key={field}
                                    id={field}
                                    src={
                                      color === "black"
                                        ? BlackStone
                                        : WhiteStone
                                    }
                                    alt="Stone"
                                    className={twMerge(stoneStyles, ``)}
                                    style={{
                                      position: stack && "absolute",
                                      transform:
                                        stack && `translateY(${value}%)`,
                                    }}
                                  />
                                );
                              },
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                },
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
