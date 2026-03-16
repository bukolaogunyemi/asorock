import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../lib/GameContext";
import { getWhisper } from "../lib/advisoryWhispers";

interface AdvisoryWhisperProps {
  activeTab: string;
}

export function AdvisoryWhisper({ activeTab }: AdvisoryWhisperProps) {
  const { state } = useGame();
  const recentRuleIdsRef = useRef<string[]>([]);
  const [visible, setVisible] = useState(false);

  const whisper = useMemo(
    () => getWhisper(state, activeTab, recentRuleIdsRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, activeTab],
  );

  useEffect(() => {
    if (whisper.ruleId) {
      const prev = recentRuleIdsRef.current;
      if (prev[prev.length - 1] !== whisper.ruleId) {
        recentRuleIdsRef.current = [...prev, whisper.ruleId].slice(-5);
      }
    }
    // Trigger fade-in
    setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [whisper.ruleId]);

  return (
    <div
      className="flex items-center gap-2 px-4 py-1 text-xs italic transition-opacity duration-500 border-b border-gray-200"
      style={{
        backgroundColor: "rgba(250,248,245,0.9)",
        opacity: visible ? 1 : 0,
      }}
    >
      <span className="text-gray-600">{whisper.text}</span>
      <span className="ml-auto whitespace-nowrap text-xs font-semibold" style={{ color: "#d4af37" }}>
        &mdash; {whisper.adviserName}
      </span>
    </div>
  );
}
