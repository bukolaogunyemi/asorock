import { useEffect, useMemo } from "react";
import { useGame } from "../lib/GameContext";
import type { BriefItem } from "../lib/gameTypes";

interface IntelligenceBriefProps {
  onDismiss: () => void;
}

const severityDot: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  intel: "bg-blue-500",
  memo: "bg-gray-400",
};

function SectionBlock({ title, items }: { title: string; items: BriefItem[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#0a1f14] mb-2 uppercase tracking-wide">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Nothing to report</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className={`mt-1 w-2 h-2 rounded-full shrink-0 ${severityDot[item.severity] ?? "bg-gray-400"}`}
              />
              <span className="text-xs text-gray-700 leading-snug">
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MetricDelta({ label, from, to }: { label: string; from: number; to: number }) {
  const diff = to - from;
  const isPositiveMetric = !["outrage", "stress"].some((k) =>
    label.toLowerCase().includes(k),
  );
  const improved = isPositiveMetric ? diff > 0 : diff < 0;
  const color = improved ? "#16a34a" : diff === 0 ? "#6b7280" : "#dc2626";

  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-white border border-gray-200"
      style={{ color }}
    >
      <span className="font-medium text-gray-500">{label}:</span>
      {from} &rarr; {to}
    </span>
  );
}

/** Generate daily itinerary items based on game state */
function generateItinerary(_date: string, day: number): { time: string; event: string; type: "scheduled" | "tentative" | "recurring" }[] {
  const items: { time: string; event: string; type: "scheduled" | "tentative" | "recurring" }[] = [];

  items.push({ time: "07:00", event: "Morning prayers & personal time", type: "recurring" });
  items.push({ time: "08:30", event: "Daily briefing with PA & Chief of Staff", type: "recurring" });

  const dayMod = day % 7;
  if (dayMod === 1) {
    items.push({ time: "10:00", event: "Federal Executive Council meeting", type: "scheduled" });
    items.push({ time: "14:00", event: "Security briefing with NSA", type: "scheduled" });
  } else if (dayMod === 2) {
    items.push({ time: "10:00", event: "Meeting with CBN Governor on monetary policy", type: "scheduled" });
    items.push({ time: "14:00", event: "Courtesy call — visiting delegation", type: "tentative" });
  } else if (dayMod === 3) {
    items.push({ time: "10:00", event: "National Economic Council session", type: "scheduled" });
    items.push({ time: "15:00", event: "Bilateral meeting with state governors", type: "scheduled" });
  } else if (dayMod === 4) {
    items.push({ time: "10:00", event: "Intelligence review with DSS Director", type: "scheduled" });
    items.push({ time: "13:00", event: "Working lunch with Senate leadership", type: "tentative" });
  } else if (dayMod === 5) {
    items.push({ time: "10:00", event: "Cabinet reshuffle review meeting", type: "tentative" });
    items.push({ time: "14:00", event: "Infrastructure projects update", type: "scheduled" });
  } else if (dayMod === 6) {
    items.push({ time: "10:00", event: "Diplomatic engagements — ECOWAS matters", type: "scheduled" });
    items.push({ time: "14:00", event: "Media & communications strategy session", type: "tentative" });
  } else {
    items.push({ time: "10:00", event: "Private study & document review", type: "recurring" });
    items.push({ time: "14:00", event: "Family time", type: "recurring" });
  }

  items.push({ time: "17:00", event: "Review and sign presidential papers", type: "recurring" });
  items.push({ time: "19:00", event: "State dinner or private engagement", type: "tentative" });

  return items;
}

/** Generate upcoming events/calendar items */
function generateUpcomingEvents(day: number): { daysAway: number; event: string; priority: "high" | "medium" | "low" }[] {
  const events: { daysAway: number; event: string; priority: "high" | "medium" | "low" }[] = [];

  const daysInTerm = 1460;
  const dayInTerm = day % daysInTerm;
  const daysLeft = daysInTerm - dayInTerm;

  if (daysLeft <= 30) {
    events.push({ daysAway: daysLeft, event: "Term ends — election or handover", priority: "high" });
  }
  if (daysLeft <= 180 && daysLeft > 30) {
    events.push({ daysAway: daysLeft, event: "Pre-election positioning begins", priority: "medium" });
  }

  const upcoming = [
    { daysAway: 3, event: "NNPC quarterly report due", priority: "medium" as const },
    { daysAway: 5, event: "UN General Assembly address preparation", priority: "high" as const },
    { daysAway: 7, event: "National budget presentation to NASS", priority: "high" as const },
    { daysAway: 10, event: "State visit — Republic of Ghana", priority: "medium" as const },
    { daysAway: 14, event: "Quarterly economic review", priority: "medium" as const },
    { daysAway: 21, event: "Independence Day celebrations", priority: "low" as const },
  ];

  const offset = day % 5;
  events.push(...upcoming.slice(offset, offset + 4));

  return events.sort((a, b) => a.daysAway - b.daysAway);
}

const itineraryTypeStyle: Record<string, string> = {
  scheduled: "text-emerald-600",
  tentative: "text-amber-600",
  recurring: "text-gray-400",
};

export default function IntelligenceBrief({ onDismiss }: IntelligenceBriefProps) {
  const { state } = useGame();
  const brief = state.lastBriefData;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onDismiss]);

  const itinerary = useMemo(
    () => generateItinerary(state.date, state.day),
    [state.date, state.day]
  );

  const upcomingEvents = useMemo(
    () => generateUpcomingEvents(state.day),
    [state.day]
  );

  if (!brief) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div
        className="rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border"
        style={{ backgroundColor: "#faf8f5", borderColor: "rgba(212,175,55,0.3)" }}
      >
        {/* Header — official document style */}
        <div
          className="px-6 pt-5 pb-4 border-b"
          style={{ borderColor: "rgba(212,175,55,0.2)", background: "linear-gradient(135deg, #0a1f14 0%, #163822 100%)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#d4af37]/60 mb-1">
                Presented by the Principal Aide
              </p>
              <h2 className="text-lg font-bold text-[#d4af37]">
                Daily Briefing &mdash; {state.date}
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Good morning, Mr. President. Here is your briefing for today.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-[#d4af37]/15 text-[#d4af37] rounded tracking-wider border border-[#d4af37]/30">
                FOR YOUR EYES
              </span>
              <p className="text-[10px] text-white/30 mt-1">Day {state.day} of Presidency</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Executive Summary */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <h3 className="text-xs font-bold text-[#0a1f14] uppercase tracking-wide mb-2">
              Executive Summary
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {brief.executiveSummary}
            </p>
          </div>

          {/* Two-column: Left = Intel sections, Right = Itinerary & Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            {/* Left: Intelligence Sections */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SectionBlock title="Political" items={brief.sections.political} />
                <SectionBlock title="Economic" items={brief.sections.economic} />
                <SectionBlock title="Security" items={brief.sections.security} />
                <SectionBlock title="Diplomatic" items={brief.sections.diplomatic} />
              </div>

              {/* Metric Changes */}
              {brief.metricChanges.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[#0a1f14] uppercase tracking-wide mb-2">
                    Key Metric Changes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {brief.metricChanges.map((mc, i) => (
                      <MetricDelta key={i} label={mc.label} from={mc.from} to={mc.to} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Itinerary & Upcoming Events */}
            <div className="space-y-4">
              {/* Today's Itinerary */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-xs font-bold text-[#0a1f14] uppercase tracking-wide mb-3">
                  Today&apos;s Itinerary
                </h3>
                <div className="space-y-2">
                  {itinerary.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[10px] font-mono text-[#b8960c] w-10 shrink-0 pt-0.5">
                        {item.time}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-snug">
                          {item.event}
                        </p>
                        <span className={`text-[9px] capitalize ${itineraryTypeStyle[item.type]}`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-xs font-bold text-[#0a1f14] uppercase tracking-wide mb-3">
                  Upcoming Events
                </h3>
                <div className="space-y-2">
                  {upcomingEvents.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className={`text-[10px] font-mono w-14 shrink-0 pt-0.5 ${
                        item.priority === "high" ? "text-red-500" :
                        item.priority === "medium" ? "text-amber-500" : "text-gray-400"
                      }`}>
                        +{item.daysAway}d
                      </span>
                      <p className="text-xs text-gray-700 leading-snug flex-1">
                        {item.event}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dismiss button */}
        <div className="px-6 pb-5 pt-2">
          <button
            onClick={onDismiss}
            className="w-full py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-[#0a1f14] hover:brightness-110 transition-all"
          >
            Dismiss Briefing
          </button>
        </div>
      </div>
    </div>
  );
}
