import BoardImage from "@/public/board/board.webp";
import WhiteStone from "@/public/board/whitestone.webp";
import BlackStone from "@/public/board/blackstone.webp";
import { board } from "../utils/board";
import { twMerge } from "tailwind-merge";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function GameBoard({
  socket,
  gameState,
  yourTurn,
  handleGameState,
  handleDiceComplete,
  handleDiceResultsCopy,
  diceResultsCopy,
  roomId,
  diceComplete,
  handleGameBoardUI,
}) {
  //UI
  const [socketRef, setSocketRef] = useState();
  const [selectedField, setSelectedField] = useState();
  const [showOptions, setShowOptions] = useState();

  //Logic
  const [allMoveOptions, setAllMoveOptions] = useState(null);
  const [isEndgame, setIsEndGame] = useState(false);

  const initalStepControl = {
    boardUpdated: false,
    endGameUpdated: false,
    diceResultsCopyUpdated: false,
    moveOptionsUpdated: false,
  };

  const [stepControl, setStepControl] = useState(initalStepControl);

  // HELPER function stepControl
  function changeStepControl(key, value) {
    if (key === "allTrue") {
      setStepControl({
        boardUpdated: true,
        endGameUpdated: true,
        diceResultsCopyUpdated: true,
        moveOptionsUpdated: true,
      });
      return;
    }
    if (key === "reset") {
      setStepControl(initalStepControl);
      return;
    }
    setStepControl((prev) => ({ ...prev, [key]: value }));
  }

  // handling dis-select field
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

  // setting SOCKET from passed prop
  useEffect(() => {
    if (!socket.current) return;
    setSocketRef(socket.current);
  }, [socket.current]);

  // setting MESSAGE HANDLING for socket
  // handling GAMESTATE from REMOTE changes
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

  // initial setting of DICE RESULTS COPY
  // UP TO DATE NEEDED: gameState.diceResults
  useEffect(() => {
    console.log("STEP 0");
    if (yourTurn && !gameState.diceResults.includes("?")) {
      console.log("STEP 0 EXECUTE");
      handleDiceResultsCopy(gameState.diceResults);
      changeStepControl("allTrue");
    }
  }, [gameState.diceResults, yourTurn]);

  // setting ISENDGAME
  // UP TO DATE NEEDED: gameState.board
  useEffect(() => {
    console.log("STEP 1");
    if (stepControl.boardUpdated) {
      console.log("STEP 1 EXECUTE");
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
        setIsEndGame(true);
      } else {
        setIsEndGame(false);
      }
      changeStepControl("endGameUpdated", true);
    }
  }, [stepControl.boardUpdated]);

  // calculate OPTIONS
  // UP TO DATE NEEDED: gameState.board && isEndgame && diceResultsCopy
  useEffect(() => {
    console.log("STEP 2");
    if (
      stepControl.boardUpdated &&
      stepControl.endGameUpdated &&
      stepControl.diceResultsCopyUpdated
    ) {
      if (!yourTurn) {
        setAllMoveOptions(null);
      } else if (
        yourTurn &&
        gameState &&
        !gameState.diceResults.includes("?")
      ) {
        console.log("STEP 2 EXECUTE");
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

            if (
              singleDiceOptions.length === 0 &&
              combinedOptions.length === 0
            ) {
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

        console.log("RESULTS OBJECT:", resultsObject);
        changeStepControl("moveOptionsUpdated", true);
      }
    }
  }, [stepControl]);

  // passing TURN
  useEffect(() => {
    console.log("STEP 3");
    console.log("CALCULATED MOVES 0:", allMoveOptions);
    if (stepControl.moveOptionsUpdated && allMoveOptions) {
      console.log("STEP 3 EXECUTE");
      const noOptions = Object.values(allMoveOptions).every(
        (value) => value.singleDiceOptions.length === 0,
      );

      console.log("NO-OPTIONS:", noOptions);
      console.log("YOUR TURN:", yourTurn);
      console.log("DICE COMPLETE:", diceComplete);

      console.log("CALCULATED MOVES 1:", allMoveOptions);
      console.log("ALL TOGETHER:", yourTurn && diceComplete && noOptions);

      if (yourTurn && diceComplete && noOptions) {
        setTimeout(() => {
          socketRef.send(JSON.stringify({ type: "switch-turn", roomId }));
          handleDiceComplete(false);
          setAllMoveOptions(null);
        }, 1000);
      }
    }
    changeStepControl("reset");
  }, [stepControl.moveOptionsUpdated, allMoveOptions]);

  console.log("CALCULATED MOVES 2:", allMoveOptions);

  // handling MOVING STONES onClick
  // UPDATES diceResultsCopy && gameState.board && sends message to WS
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

      const newDiceResults = [...diceResultsCopy];
      const index = newDiceResults.findIndex(
        (number) => Number(number) === usedDice,
      );

      if (index !== -1) {
        newDiceResults.splice(index, 1);
      } else {
        const index = newDiceResults.findIndex(
          (number) => Number(number) === Math.max(...newDiceResults),
        );
        newDiceResults.splice(index, 1);
      }

      handleDiceResultsCopy(newDiceResults);

      setSelectedField();
      setShowOptions();
      handleGameState("board", newBoard);
      changeStepControl("diceResultsCopyUpdated", true);
      changeStepControl("boardUpdated", true);

      socketRef.send(
        JSON.stringify({ type: "make-move", board: newBoard, roomId }),
      );
    }
  }

  // HELPER for calculating MOVE OPTIONS
  function calculateMoveOptions(fieldId) {
    const { board, yourColor } = gameState;
    const direction = yourColor === "black" ? 1 : -1;

    function isValidField(field) {
      return (
        ((board[field]?.length < 2 ||
          board[field]?.every(({ color }) => color === yourColor)) &&
          field > 0 &&
          field < 25) ||
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

  // SELECT FIELD
  function selectField(fieldId) {
    const allowedField = gameState.board[fieldId].some(
      ({ color }) => color === gameState.yourColor,
    );

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

  // handling FINAL CLICK EVENT
  function onClickHandler(id) {
    if (allMoveOptions == null) return;

    const fieldIsValidOption = Object.values(
      allMoveOptions[selectedField]?.singleDiceOptions || [],
    ).includes(id);

    if (selectedField !== undefined && fieldIsValidOption) {
      makeMove(id);
    } else {
      selectField(id);
    }
  }

  // function for UI loading
  function handleUILoading() {
    const randomTime = Math.floor(Math.random() * 1000 + 1500);
    console.log("RANDOM TIME", randomTime);
    setTimeout(() => {
      handleGameBoardUI(true);
    }, randomTime);
  }

  // UI mapping
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

  // UI mapping
  const prison = [
    { id: "0", color: "black", number: getStones("0") },
    { id: "25", color: "white", number: getStones("25") },
  ];

  const isNoOption =
    allMoveOptions !== null && diceResultsCopy.length !== 0
      ? Object.keys(allMoveOptions).length === 0
      : false;

  return (
    <>
      <div className={`relative w-full max-w-max select-none`}>
        <div
          className={`absolute ${isNoOption ? `opacity-1` : `opacity-0`} right-1/2 top-1/2 z-30 -translate-y-1/2 translate-x-1/2 bg-red-500/40 px-[3vw] py-[1vh] font-semibold shadow-md shadow-red-500/50 backdrop-blur-sm transition-opacity`}
        >
          Sorry, no Options
        </div>
        <Image
          src={BoardImage}
          alt="Backgammon board"
          quality={50}
          loading="eager"
          priority
          className={`max-w-screen h-auto max-h-screen w-auto`}
          onLoad={handleUILoading}
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
                className={`flex h-full flex-col items-center gap-[1.5%] rounded-md ${color === "black" ? `bg-gradient-to-b` : `bg-gradient-to-t`} from-zinc-300 to-orange-200 ${hasContent || isEndgame ? `opacity-1` : `opacity-0`} ${color === "black" ? `justify-end` : `justify-start`} py-[5%] shadow-lg transition-opacity duration-500 ${showOptions?.singleDiceOptions?.includes(key) ? `ring-8 ring-green-400 ring-offset-2` : ``}`}
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
                    // shadow-[inset_0px_4px_15px_5px_rgba(0,_0,_0,_0.5),_0px_1px_5px_5px_rgba(0,_0,_0,_0.5)]
                    return (
                      <div
                        key={index}
                        className={
                          twMerge(areaStyles, `grid h-full grid-cols-6`) +
                          ` field`
                        }
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
                                `grid grid-cols-1 rounded-xl`,
                                `${id === selectedField ? `bg-red-500/30 shadow-2xl shadow-red-500/30 ring ring-inset ring-red-500/30` : ``}`,
                                `${showOptions?.singleDiceOptions?.includes(id) ? `bg-blue-500/40 shadow-2xl shadow-blue-400/50 ring ring-inset ring-blue-400/50` : ``}`,
                                `${showOptions?.combinedOptions?.includes(id) ? `bg-orange-400/30 shadow-2xl shadow-orange-400/30 ring ring-inset ring-orange-400/30` : ``}`,
                              )}
                            >
                              {gameState.board[id]?.map(
                                ({ id: field, color }, index) => {
                                  const numberOfStones =
                                    gameState.board[id].length;
                                  const isOtherSide = id > 12 && id < 25;
                                  const stack = numberOfStones > 5;
                                  const direction = isOtherSide ? -1 : 1;
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
      </div>
    </>
  );
}
