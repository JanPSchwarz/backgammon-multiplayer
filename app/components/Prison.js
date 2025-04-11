import Image from "next/image";
import WhiteStone from "@/public/board/whitestone.webp";
import BlackStone from "@/public/board/blackstone.webp";

export default function Prison({ gameState }) {
  // UI mapping
  const prison = [
    { id: "0", color: "black", number: gameState.board[0].length },
    { id: "25", color: "white", number: gameState.board[25].length },
  ];

  return (
    <>
      <div
        className={`absolute right-1/2 top-1/2 z-20 h-[14%] w-[5%] -translate-y-1/2 translate-x-[38%]`}
      >
        {prison
          .filter(({ number }) => number !== 0)
          .map(({ color, number, id }, index) => {
            return (
              <div
                id={id}
                key={id}
                onClick={() => onClickHandler(id)}
                className={`field relative ${id === selectedField ? `bg-red-500/30 shadow-2xl shadow-red-500/30 ring ring-red-500/30` : ``}`}
              >
                <Image
                  key={index}
                  alt="stone"
                  src={color === "black" ? BlackStone : WhiteStone}
                  className={``}
                />
                <p
                  className={`absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 text-xs md:text-base ${color === "black" ? `text-white` : `text-black`}`}
                >
                  {number}
                </p>
              </div>
            );
          })}
      </div>
    </>
  );
}
