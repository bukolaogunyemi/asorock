import { useGame } from "../lib/GameContext";
import { useMemo } from "react";

const TERM_LENGTH = 1460;

interface Milestone {
  day: number;
  label: string;
}

const MILESTONES: Milestone[] = [
  { day: 100, label: "100 Days" },
  { day: 300, label: "Budget Season" },
  { day: 730, label: "Midterm" },
  { day: 1030, label: "Budget Season" },
  { day: 1280, label: "Campaign" },
];

export function TermProgressBar() {
  const { state } = useGame();
  const day = state.day;
  const pct = Math.min(100, (day / TERM_LENGTH) * 100);

  const barColor = day >= 1280 ? "#ef4444" : day >= 1100 ? "#f59e0b" : "#d4af37";

  const nextMilestone = useMemo(
    () => MILESTONES.find((m) => m.day > day),
    [day],
  );

  const tooltip = `Day ${day} of ${TERM_LENGTH} · ${TERM_LENGTH - day} days remaining${
    nextMilestone ? ` · Next: ${nextMilestone.label} (Day ${nextMilestone.day})` : ""
  }`;

  return (
    <div className="relative w-full h-2 bg-[#1a3a2a] rounded-full overflow-hidden group" title={tooltip}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: barColor }}
      />
      {MILESTONES.map((m) => (
        <div
          key={m.day}
          className="absolute top-0 h-full w-px bg-[rgba(212,175,55,0.4)]"
          style={{ left: `${(m.day / TERM_LENGTH) * 100}%` }}
          title={`${m.label} — Day ${m.day}`}
        />
      ))}
    </div>
  );
}
