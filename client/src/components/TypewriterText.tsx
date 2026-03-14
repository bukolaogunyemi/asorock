import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function TypewriterText({
  text,
  speed = 30,
  delay = 0,
  onComplete,
  className = "",
  style,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  // Use ref to avoid onComplete in dependency array (prevents infinite re-renders)
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      setDone(true);
      onCompleteRef.current?.();
      return;
    }
    const interval = setTimeout(
      () => setDisplayed(text.slice(0, displayed.length + 1)),
      speed
    );
    return () => clearTimeout(interval);
  }, [started, displayed, text, speed]);

  if (!started) return null;

  return (
    <span className={className} style={style}>
      {displayed}
      {!done && <span className="typewriter-cursor">|</span>}
    </span>
  );
}
