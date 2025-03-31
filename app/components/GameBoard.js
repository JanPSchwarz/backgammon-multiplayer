import BoardImage from "@/public/board/board.webp";
import WhiteStone from "@/public/board/whitestone.webp";
import BlackStone from "@/public/board/blackstone.webp";
import { board } from "../utils/board";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function GameBoard({
  socket,
  gameState,
  yourTurn,
  handleGameState,
  handleDiceComplete,
  roomId,
  diceComplete,
}) {
  const [socketRef, setSocketRef] = useState();
  const [selectedField, setSelectedField] = useState();
  const [allMoveOptions, setAllMoveOptions] = useState({});
  const [showOptions, setShowOptions] = useState();
  const [diceResultsCopy, setDiceResultsCopy] = useState([]);
  const [isEndgame, setIsEndGame] = useState(false);

  console.log("move options:", allMoveOptions);
  console.log("diceComplete:", diceComplete);
  useEffect(() => {
    const noOptions = Object.values(allMoveOptions).every(
      (value) => value.singleDiceOptions.length === 0,
    );

    console.log("your turn:", yourTurn);
    console.log("NO options:", noOptions);
    console.log("dice results COPY:", diceResultsCopy);

    console.log("ALL TOGETHER", yourTurn && diceComplete && noOptions);

    if (yourTurn && diceComplete && noOptions) {
      console.log("send switch turn");
      socketRef.send(JSON.stringify({ type: "switch-turn", roomId }));
      handleDiceComplete(false);
    }
  }, [allMoveOptions]);

  useEffect(() => {
    if (!yourTurn) {
      setAllMoveOptions({});
    } else if (yourTurn && gameState && !gameState.diceResults.includes("?")) {
      const fieldsInUse = Object.keys(gameState.board).filter((field) => {
        return gameState.board[field].some(
          ({ color }) => color === gameState.yourColor,
        );
      });

      const prisonId = gameState.yourColor === "black" ? 0 : 25;

      const stonesInPrison = gameState.board[prisonId].length !== 0;

      const fieldsToCalculate = stonesInPrison ? [prisonId] : fieldsInUse;

      const calculatedOptions = fieldsToCalculate
        .map((field) => {
          const calculatedOptions = calculateMoveOptions(Number(field));

          const { singleDiceOptions, combinedOptions } = calculatedOptions;

          if (singleDiceOptions.length === 0 && combinedOptions.length === 0) {
            return null;
          } else {
            return {
              fieldId: Number(field),
              singleDiceOptions,
              combinedOptions,
            };
          }
        })
        .filter((item) => item !== null);

      const resultsObject = calculatedOptions.reduce((acc, item) => {
        acc[item.fieldId] = {
          singleDiceOptions: item?.singleDiceOptions || [],
          combinedOptions: item?.combinedOptions || [],
        };
        return acc;
      }, {});

      setAllMoveOptions(resultsObject);
    }
  }, [gameState, diceResultsCopy, isEndgame]);

  useEffect(() => {
    const { whiteOut, blackOut, ...rest } = gameState.board;
    const stones = Object.values(rest).flat();

    const remainingStones = stones.filter(
      ({ color }) => color === gameState.yourColor,
    ).length;

    const endZoneKeys = Object.keys(rest).filter((key) =>
      gameState.yourColor === "black"
        ? key > 18 && key < 25
        : key > 0 && key < 7,
    );

    const stonesInEndZone = endZoneKeys
      .flatMap((key) => gameState.board[key])
      .filter(({ color }) => gameState.yourColor === color).length;

    if (remainingStones === stonesInEndZone) {
      console.log("Stones in endzone:", stonesInEndZone);
      console.log("remaining Stones:", remainingStones);
      setIsEndGame(true);
    } else {
      setIsEndGame(false);
    }
  }, [gameState]);

  console.log("isEndgame", isEndgame);

  useEffect(() => {
    if (yourTurn && !gameState.diceResults.includes("?")) {
      setDiceResultsCopy(gameState.diceResults);
    }
  }, [gameState.diceResults]);

  useEffect(() => {
    if (!socket.current) return;
    setSocketRef(socket.current);
  }, [socket.current]);

  useEffect(() => {
    function handleOutSideClick(event) {
      if (!event.target.closest(".field")) {
        setSelectedField();
        setShowOptions();
      }
    }

    document.addEventListener("click", handleOutSideClick);

    return () => {
      document.removeEventListener("click", handleOutSideClick);
    };
  }, []);

  useEffect(() => {
    if (!socketRef) return;

    function handleMessage(event) {
      const message = JSON.parse(event.data);

      if (message.type === "new-move") {
        const newBoard = message.board;

        handleGameState("board", newBoard);
      }
    }

    socketRef.addEventListener("message", handleMessage);
  }, [socketRef]);

  function makeMove(targetField) {
    if (selectedField === targetField) {
      setShowOptions();
      setSelectedField();
      return;
    }

    const { board } = gameState;
    const startField = selectedField;

    const isValidTarget = Object.values(
      allMoveOptions[startField]?.singleDiceOptions || [],
    ).includes(targetField);

    if (startField !== undefined && isValidTarget) {
      const newBoard = Object.keys(board).reduce((acc, key) => {
        acc[key] = [...board[key]];
        return acc;
      }, {});

      const enemyStone = newBoard[targetField].find(
        ({ color }) => color !== gameState.yourColor,
      );

      if (enemyStone) {
        const enemyPrison = gameState.yourColor === "black" ? 25 : 0;
        newBoard[targetField].splice(-1, 1);
        newBoard[`${enemyPrison}`].push(enemyStone);
      }

      const stone = newBoard[startField].splice(-1, 1)[0];
      newBoard[targetField].push(stone);

      const relativeTargetField =
        typeof targetField === "number"
          ? targetField
          : gameState.yourColor === "black"
            ? 25
            : 0;

      const usedDice = Math.abs(relativeTargetField - startField);
      setDiceResultsCopy((prev) => {
        const copy = [...prev];
        const index = prev.findIndex((number) => Number(number) === usedDice);

        copy.splice(
          index !== -1
            ? index
            : copy.findIndex((num) => num === Math.max(...copy)),
        );

        return copy;
      });

      setSelectedField();
      setShowOptions();
      socketRef.send(
        JSON.stringify({ type: "make-move", board: newBoard, roomId }),
      );
    }
  }

  function calculateMoveOptions(fieldId) {
    const { board, yourColor } = gameState;
    const direction = yourColor === "black" ? 1 : -1;

    function isValidField(field) {
      return (
        board[field]?.length < 2 ||
        board[field]?.every(({ color }) => color === yourColor) ||
        (gameState.yourColor === "black" && field === "blackOut") ||
        (gameState.yourColor === "white" && field === "whiteOut")
      );
    }

    const singleDiceOptions = diceResultsCopy
      .map((number) => {
        const potentialField = fieldId + number * direction;

        const lastFieldWithStone = Object.entries(gameState.board)
          .filter(([key, stones]) =>
            stones.some(({ color }) => color === gameState.yourColor),
          )
          .map(([key]) => Number(key))
          .filter((key) => !isNaN(key));

        const lastFieldOfYourColor =
          lastFieldWithStone.length > 0
            ? gameState.yourColor === "black"
              ? Math.min(...lastFieldWithStone)
              : Math.max(...lastFieldWithStone)
            : null;

        if (isEndgame && (potentialField === 25 || potentialField === 0)) {
          return gameState.yourColor === "black" ? "blackOut" : "whiteOut";
        } else if (
          isEndgame &&
          fieldId === lastFieldOfYourColor &&
          (potentialField > 24 || potentialField < 1)
        ) {
          return gameState.yourColor === "black" ? "blackOut" : "whiteOut";
        } else {
          return potentialField;
        }
      })
      .filter((field) => isValidField(field));

    if (singleDiceOptions.length === 0) {
      return { singleDiceOptions: [], combinedOptions: [] };
    }

    const combinedMoves = new Set();

    function checkCombination(currentField, remainingDice, usedBefore) {
      if (remainingDice.length === 0) return;

      for (let i = 0; i < remainingDice.length; i++) {
        const nextField = currentField + remainingDice[i] * direction;

        if (isValidField(nextField)) {
          const newRemainingDice = remainingDice.slice();
          newRemainingDice.splice(i, 1);
          if (usedBefore) {
            combinedMoves.add(nextField);
          }
          checkCombination(nextField, newRemainingDice, true);
        }
      }
    }

    checkCombination(fieldId, diceResultsCopy, false);

    const combinedOptions = Array.from(combinedMoves);

    const results = { singleDiceOptions, combinedOptions };

    return results;
  }

  function selectField(fieldId) {
    const allowedField = gameState.board[fieldId].some(
      ({ color }) => color === gameState.yourColor,
    );

    console.log("ALLOWED:", allowedField);

    if (!yourTurn || !allowedField || gameState.diceResults.includes("?"))
      return;

    if (fieldId === selectedField) {
      setSelectedField();
      setShowOptions();
    } else {
      setSelectedField(fieldId);
      const singleDiceOptions = allMoveOptions[fieldId]?.singleDiceOptions;
      const combinedOptions = allMoveOptions[fieldId]?.combinedOptions;
      setShowOptions({ singleDiceOptions, combinedOptions });
    }
  }

  const throwOutArea = [
    {
      key: "whiteOut",
      color: "white",
    },
    {
      key: "blackOut",
      color: "black",
    },
  ];

  function getStones(key) {
    return gameState.board[key].length;
  }

  const prison = [
    { id: "0", color: "black", number: getStones("0") },
    { id: "25", color: "white", number: getStones("25") },
  ];

  function onClickHandler(id) {
    const fieldIsValidOption = Object.values(
      allMoveOptions[selectedField]?.singleDiceOptions || [],
    ).includes(id);

    if (selectedField !== undefined && fieldIsValidOption) {
      makeMove(id);
    } else {
      selectField(id);
    }
  }

  return (
    <div className={`relative w-full max-w-max select-none`}>
      <Image
        src={BoardImage}
        alt="Backgammon board"
        quality={50}
        priority
        className={`max-w-screen h-auto max-h-screen w-auto`}
      />
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
                className={`field relative ${id === selectedField ? `ring-4 ring-red-600` : ``}`}
              >
                <Image
                  key={index}
                  alt="stone"
                  src={color === "black" ? BlackStone : WhiteStone}
                  className={``}
                />
                <p
                  className={`absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 ${color === "black" ? `text-white` : `text-black`}`}
                >
                  {number}
                </p>
              </div>
            );
          })}
      </div>
      <div
        className={`absolute right-[2.5%] top-1/2 flex h-[80%] w-[5%] -translate-y-1/2 flex-col gap-[3%]`}
      >
        {throwOutArea.map(({ key, color }) => {
          const hasContent = gameState.board[key].length !== 0;
          return (
            <div
              key={key}
              id={key}
              onClick={() => {
                onClickHandler(key);
              }}
              className={`flex h-full flex-col items-center gap-[1.5%] rounded-md bg-[#7e524c] ${hasContent || isEndgame ? `opacity-1` : `opacity-0`} ${color === "black" ? `justify-end` : `justify-start`} py-[5%] shadow-lg transition-opacity duration-500 ${showOptions?.singleDiceOptions?.includes(key) ? `ring-8 ring-green-400 ring-offset-2` : ``}`}
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
                      className={twMerge(areaStyles, ``) + ` field`}
                    >
                      {fields.map((id) => {
                        return (
                          <div
                            key={id}
                            id={id}
                            onClick={() => {
                              onClickHandler(id);
                            }}
                            className={twMerge(
                              fieldStyles,
                              `${id === selectedField ? `ring-4 ring-red-600` : ``}`,
                              `${showOptions?.singleDiceOptions?.includes(id) ? `ring-4 ring-green-400` : ``}`,
                              `${showOptions?.combinedOptions?.includes(id) ? `ring-4 ring-black` : ``}`,
                            )}
                          >
                            {gameState.board[id]?.map(
                              ({ field, color }, index) => {
                                const length = gameState.board[id].length;
                                const stack = length > 5;
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
    </div>
  );
}
