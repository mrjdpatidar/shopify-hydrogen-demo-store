import { useEffect, useState } from "react";

interface Props {
  messages: string[];
  interval: number;
}

export default function TopTextCarousel({
  messages,
  interval,
}: Props): JSX.Element | null {
  const [index, setIndex] = useState(0);

 
  useEffect(() => {
    if (!messages.length) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages, interval]);

  if (!messages.length) return null;

  return (
    <>
    <div className="w-full bg-black text-white text-sm">
      <div className="flex flex-col items-center py-2">
        <p className="transition-all duration-300">
          {messages[index]}
        </p>

        <div className="mt-1 flex gap-1.5">
          {messages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-1.5 rounded-full ${
                i === index ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
