export default function DisconnectMessage({
  boardLoaded,
  oponentDisconnect,
  statusText,
}) {
  return (
    <>
      <div
        className={`absolute top-0 z-20 ${boardLoaded ? `opacity-1` : `opacity-0`} ${statusText ? `translate-y-0` : `translate-y-[-100%] duration-0`} rounded-b-md transition-all ${oponentDisconnect ? `border-red-400 bg-red-200/90 text-red-800` : `border-blue-400 bg-blue-50/80 text-blue-800`} border border-t-0 p-4 font-semibold md:text-lg`}
      >
        <p className={``}>{statusText}</p>
      </div>
    </>
  );
}
