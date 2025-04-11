import Spinner from "@/public/board/infinite-spinner.svg";

export default function LoadingScreen({ boardLoaded }) {
  return (
    <>
      <div
        className={`fixed z-[101] flex h-screen w-screen flex-col items-center justify-center gap-10 ${boardLoaded ? `hidden` : `visible`} top-0 transition-opacity`}
      >
        <Spinner className={`w-[50%] max-w-[250px]`} />
        <p>Loading Game...</p>
      </div>
    </>
  );
}
