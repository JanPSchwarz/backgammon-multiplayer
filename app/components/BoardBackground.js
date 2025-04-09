import Image from "next/image";
import BoardImage from "@/public/board/board.webp";

export default function BoardBackground({handleUILoading, noOptions}) {
  return (
    <>
      <Image
        src={BoardImage}
        alt="Backgammon board"
        quality={50}
        loading="eager"
        priority
        className={`h-auto max-h-dvh w-auto`}
        onLoad={handleUILoading}
      />
      <div
        className={`absolute ${noOptions ? `opacity-1` : `opacity-0`} pointer-events-none right-1/2 top-1/2 z-30 -translate-y-1/2 translate-x-1/2 border border-red-400 bg-red-200/70 px-[3vw] py-[1vh] text-sm font-semibold text-red-800 shadow-md shadow-red-300/20 backdrop-blur-sm transition-opacity md:text-xl`}
      >
        No Options
      </div>
    </>
  );
}
