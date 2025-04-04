import Modal from "./Modal";
import Link from "next/link";

export default function LeavePrompt({ closeModal }) {
  return (
    <>
      <Modal onClose={closeModal}>
        <div className={`my-4 min-w-[300px] p-4`}>
          <p className={`mb-4 text-center font-bold`}>
            Do you really wanna Leave?
            <span className={`my-2 block text-sm font-thin italic`}>
              The game data will be gone
            </span>
          </p>
          <div className={`grid grid-cols-2 gap-6 font-medium`}>
            <Link href={"/"} className={`rounded-md bg-red-300 text-center`}>
              Leave
            </Link>
            <button onClick={closeModal} className={`rounded-md bg-green-300`}>
              Stay
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
