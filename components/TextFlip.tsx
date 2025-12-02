"use client";

import { useEffect, useState } from "react";

interface TextFlipProps {
  text: string;
  words: string[];
  duration?: number;
  className?: string;
}

export default function TextFlip({ 
  text, 
  words, 
  duration = 3000,
  className = "" 
}: TextFlipProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setIsFlipping(false);
      }, 300);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  const nextWordIndex = (currentWordIndex + 1) % words.length;

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {text}
      <span className="inline-block relative h-[1.2em] min-w-[120px] text-left overflow-hidden ml-1">
        <span
          className={`inline-block text-flip-word ${
            isFlipping ? "flip-out" : "flip-in"
          }`}
        >
          {words[currentWordIndex]}
        </span>
        {isFlipping && (
          <span className="inline-block absolute top-0 left-0 text-flip-word flip-in-new">
            {words[nextWordIndex]}
          </span>
        )}
      </span>
    </span>
  );
}

