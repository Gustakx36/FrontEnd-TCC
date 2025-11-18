import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string | null | undefined;
  speed?: number;
}

const TypeWriter: React.FC<TypewriterProps> = ({ text, speed = 10 }) => {
  const [letters, setLetters] = useState<string[]>([]);

  useEffect(() => {
    setLetters(text.split(" "));
  }, []);

  return (
    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {letters.map((char, idx) => (
            <span
            key={idx}
            className="inline-block opacity-0 animate-fade-in-letter"
            style={{ animationDelay: `${idx * speed}ms` }}
            >
            {`${char}\u00A0`}
            </span>)
        )}
    </span>
  );
};

export default TypeWriter;