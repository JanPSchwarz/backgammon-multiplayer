export default function EndFields({
  gameState,
  onClickHandler,
  isEndgame,
  showOptions,
}) {
  // UI mapping
  const endFieldsUI = [
    {
      key: "whiteOut",
      color: "white",
    },
    {
      key: "blackOut",
      color: "black",
    },
  ];

  return (
    <div
      className={`absolute right-[2.5%] top-1/2 z-10 flex h-[80%] w-[5%] -translate-y-1/2 flex-col gap-[3%]`}
    >
      {endFieldsUI.map(({ key, color }) => {
        const hasContent = gameState.board[key].length !== 0;
        return (
          <div
            key={key}
            id={key}
            onClick={() => {
              onClickHandler(key);
            }}
            className={`flex h-full flex-col items-center gap-[1.5%] rounded-md ${color === "black" ? `bg-gradient-to-b` : `bg-gradient-to-t`} from-zinc-300 to-orange-200 ${hasContent || isEndgame ? `opacity-1` : `opacity-0`} ${color === "black" ? `justify-end` : `justify-start`} py-[5%] shadow-lg transition-opacity duration-500 ${showOptions?.singleDiceOptions?.includes(key) ? `ring-2 ring-green-400 ring-offset-2 md:ring-4` : ``}`}
          >
            {gameState.board[key].map((item, index) => {
              return (
                <div
                  key={index}
                  className={`${color === "black" ? "bg-black" : "bg-white"} h-[5%] w-[90%] rounded-md`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
