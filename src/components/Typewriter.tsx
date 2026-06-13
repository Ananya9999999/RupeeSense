import { useEffect, useState } from "react";

export function Typewriter({ text, speed = 22, className }: { text: string; speed?: number; className?: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <span className={className}>
      {shown}
      <span className="inline-block w-[2px] h-[1em] align-middle bg-current ml-0.5 animate-pulse" />
    </span>
  );
}
