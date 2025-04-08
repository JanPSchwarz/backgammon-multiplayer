export default function DiceControlsPanel({
  diceResultsCopy,
  gameState,
  yourTurn,
  disableButton,
  rollDice,
}) {

  const diceCount = diceResultsCopy.reduce((acc, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {});

  const diceUI = gameState.diceResults.map((result) => {
    const isUsed = diceCount[result] > 0 ? false : true;
    if (!isUsed) diceCount[result]--;

    return { result, used: isUsed };
  });

  return (
    <>
      <div
        className={`relative z-10 flex max-h-min w-full flex-1 flex-col items-center justify-center p-2 portrait:mb-6 portrait:w-[40%] portrait:max-w-[250px] landscape:mr-4 landscape:w-[15%] landscape:max-w-[120px] landscape:md:max-w-[150px]`}
      >
        <div
          className={`min-w-min transform-gpu text-nowrap text-center text-sm font-medium transition-all will-change-[box-shadow] md:text-base ${yourTurn ? `animate-neumorphOut scale-[99%]` : `animate-neumorphIn scale-100`} rounded-xl p-2`}
        >
          <p
            className={`absolute right-1/2 translate-x-1/2 text-slate-800 transition-all duration-200 ${yourTurn ? `opacity-1 scale-100 blur-none delay-100` : `opacity-0 blur-[1px]`}`}
          >
            Your Turn!
          </p>
          <p
            className={`text-stone-600 transition-all duration-200 ${yourTurn ? `opacity-0 blur-[1px]` : `opacity-1 scale-90 blur-none delay-100`}`}
          >
            Not Your Turn!
          </p>
        </div>
        <button
          className={`my-6 mt-4 w-full rounded-lg border-b-4 border-b-blue-800 bg-blue-400 p-3 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/50 transition-all [box-shadow:_5px_5px_10px_#828282,_-5px_-5px_10px_#ffffff] active:scale-90 disabled:border-transparent disabled:border-zinc-600 disabled:bg-zinc-300 disabled:text-zinc-600 disabled:shadow-zinc-500/50 md:my-8 md:p-4 md:px-8 md:text-lg landscape:my-4`}
          disabled={disableButton}
          onClick={rollDice}
        >
          Roll dice
        </button>
        <div
          className={`m-1 grid w-full grid-cols-2 grid-rows-2 place-items-center gap-2`}
        >
          {diceUI.map(({ result, used }, index) => {
            return (
              <p
                key={index}
                className={`h-full w-full rounded-md border border-none py-2 text-center transition-all duration-300 [box-shadow:_3px_3px_7px_#bebebe,_-3px_-3px_7px_#ffffff] md:py-4 ${result ? `opacity-1` : `opacity-0`} ${!yourTurn || result === "?" ? `bg-gray-200 text-slate-600 shadow-gray-500/50` : used ? `bg-rose-300/80 text-red-700 shadow-rose-500/50` : `bg-blue-300/80 text-blue-800 shadow-blue-500/50`} text-lg font-semibold shadow-md md:text-2xl`}
              >
                {result || 0}
              </p>
            );
          })}
        </div>
      </div>
    </>
  );
}
