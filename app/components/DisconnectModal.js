import Modal from "./Modal";

export default function DisconnectModal({ closeModal }) {
  return (
    <>
      <Modal onClose={closeModal}>
        <div className={`max-w-[400px] p-6`}>
          <p className={`text-pretty leading-6`}>
            The opponent is still disconnected. You can end your turn, while the
            opponent is away.
            <span className={`my-4 block`}>
              If you leave the room while the opponent is still disconnected,
              the room will be closed and gone.
            </span>
          </p>
        </div>
      </Modal>
    </>
  );
}
