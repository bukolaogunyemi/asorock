import { useEffect, useMemo, useState } from "react";
import { useGame } from "../lib/GameContext";
import { getWhisper } from "../lib/advisoryWhispers";

interface AdvisoryWhisperProps {
  activeTab: string;
}

export function AdvisoryWhisper({ activeTab }: AdvisoryWhisperProps) {
  const { state } = useGame();
  const [recentRuleIds, setRecentRuleIds] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  const whisper = useMemo(
    () => getWhisper(state, activeTab, recentRuleIds),
    [state, activeTab, recentRuleIds],
  );

  useEffect(() => {
    if (whisper.ruleId) {
      setRecentRuleIds((prev) => {
        if (prev[prev.length - 1] === whisper.ruleId) return prev;
        const next = [...prev, whisper.ruleId].slice(-5);
        return next;
      });
    }
    // Trigger fade-in
    setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [whisper.ruleId]);

  return (
    <div
      className="flex items-center gap-2 px-4 py-1.5 text-sm italic transition-opacity duration-500"
      style={{
        backgroundColor: "rgba(10,31,20,0.6)",
        opacity: visible ? 1 : 0,
      }}
    >
      <span className="text-gray-300">{whisper.text}</span>
      <span className="ml-auto whitespace-nowrap text-xs font-semibold" style={{ color: "#d4af37" }}>
        &mdash; {whisper.adviserName}
      </span>
    </div>
  );
}
