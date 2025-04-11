import { useEffect, useRef } from "react";
import Close from "@/public/close.svg";

export default function Modal({ children, onClose }) {
  const dialogRef = useRef();

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [dialogRef]);

  function closeModal(event) {
    event.stopPropagation();
    if (dialogRef.current && onClose) {
      dialogRef.current.close();
      onClose();
    }
  }

  function handleKeyDown(event) {
    if (event.code === "Escape") {
      if (onClose) {
        onClose();
      } else {
        event.preventDefault();
      }
    }
  }

  return (
    <>
      <dialog
        onKeyDown={handleKeyDown}
        className={`rounded-xl`}
        onClick={closeModal}
        ref={dialogRef}
      >
        <div className={``} onClick={(event) => event.stopPropagation()}>
          {onClose && (
            <button
              className={`absolute right-0 top-0 m-1 max-w-min rounded-full`}
              onClick={closeModal}
            >
              <Close className={`size-6 fill-red-400`} />
            </button>
          )}
          {children}
        </div>
      </dialog>
    </>
  );
}
