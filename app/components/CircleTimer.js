import { useState, useEffect, useRef } from "react";

export default function CirceTimer({ time }) {
  const [progress, setProgress] = useState(1);
  const startRef = useRef();

  useEffect(() => {
    const duration = time / 1000;
    function animate(timeStamp) {
      if (!startRef.current) startRef.current = timeStamp;

      const elapsed = (timeStamp - startRef.current) / 1000;
      const newProgress = Math.max(1 - elapsed / duration, 0);
      setProgress(newProgress);

      if (newProgress > 0) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [time]);

  const angle = progress * 2 * Math.PI;

  const x = 50 + 50 * Math.sin(angle);
  const y = 50 - 50 * Math.cos(angle);
  const largeArcFlag = progress > 0.5 ? 1 : 0;

  const pathData = `
  M 50 50
  L 50 0
  A 50 50 0 ${largeArcFlag} 1 ${x} ${y}
  Z`;

  return (
    <>
      <svg viewBox="0 0 100 100" className={`h-full w-full`}>
        {progress > 0 && <path d={pathData} className={`fill-blue-500`} />}
      </svg>
    </>
  );
}
