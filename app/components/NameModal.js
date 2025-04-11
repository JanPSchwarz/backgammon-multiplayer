import Modal from "./Modal";

export default function NameModal({ closeModal, changeName, yourName }) {
  function onSubmit(event) {
    event.preventDefault();
    event.target.checkValidity();

    const value = event.target[0].value.trim();

    if (!value || yourName === value) return;

    changeName(value);
    closeModal();
  }

  return (
    <Modal onClose={closeModal}>
      <form onSubmit={onSubmit} className={`flex flex-col gap-4 p-8`}>
        <label
          className={`text-center font-semibold text-stone-800`}
          htmlFor="name"
        >
          Set your Name
        </label>
        <input
          className={`w-full rounded-sm border placeholder:px-1 invalid:border-red-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-red-400 focus:invalid:ring-red-400`}
          id="name"
          type="text"
          pattern="[A-Za-z ]+"
          maxLength={10}
          autoFocus
          title="max. 10 chars and only letters"
          placeholder={yourName ? yourName : "Your Name..."}
        />
        <div className={`grid grid-cols-2 gap-2`}>
          <button type="submit" className={`rounded-md bg-gray-300 px-2`}>
            Ok
          </button>
          <button
            onClick={closeModal}
            className={`rounded-md bg-gray-300 px-2`}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
