import { useState } from "react";
import { createPortal } from "react-dom";
import { CharacterAvatar } from "./CharacterAvatar";

// ── Shared candidate shape ────────────────────────────────
export interface AppointmentModalCandidate {
  name: string;
  avatar: string;
  age?: number;
  state?: string;
  gender?: string;
  faction?: string;
  traits?: string[];
  bio?: string;
  /** Adviser's note or trade-off description */
  note?: string;
  scandalRisk?: "Low" | "Medium" | "High";
  /** Flexible stat bars — each caller decides which stats to show */
  stats: { label: string; value: number }[];
  /** Optional consequence descriptions (e.g. from game events) */
  impacts?: string[];
}

export interface AppointmentModalProps {
  /** Modal title, e.g. "Appoint Minister of Finance" or "Chief of Staff" */
  title: string;
  /** Small label above the title, e.g. "Appointment" or "Review Candidates" */
  headerLabel?: string;
  candidates: AppointmentModalCandidate[];
  onSelect: (index: number) => void;
  onCancel: () => void;
}

// Color helper
function statColor(value: number): string {
  if (value > 70) return "bg-emerald-500";
  if (value >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export function AppointmentModal({
  title,
  headerLabel = "Appointment",
  candidates,
  onSelect,
  onCancel,
}: AppointmentModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const candidate = candidates[selectedIdx];
  const count = candidates.length;
  const goPrev = () => setSelectedIdx((selectedIdx - 1 + count) % count);
  const goNext = () => setSelectedIdx((selectedIdx + 1) % count);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Left arrow */}
      <button
        onClick={e => { e.stopPropagation(); goPrev(); }}
        className="relative z-10 mr-3 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#0a1f14] transition-all"
      >
        <span className="text-lg">&lsaquo;</span>
      </button>

      <div
        className="relative w-[560px] max-w-[85vw] max-h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "#faf8f5" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3 shrink-0 flex items-center justify-between" style={{ backgroundColor: "#0a1f14" }}>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">{headerLabel}</p>
            <h3 className="text-sm font-bold" style={{ color: "#d4af37" }}>{title}</h3>
          </div>
          <span className="text-[10px] text-gray-400">
            Candidate {selectedIdx + 1} of {count}
          </span>
        </div>

        {/* Candidate tabs — compact dots + names for ≤3, just dots for >3 */}
        <div className="flex items-center justify-center gap-1.5 py-2 border-b border-gray-200 shrink-0">
          {candidates.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setSelectedIdx(i)}
              className={`transition-all ${
                count <= 3
                  ? `px-3 py-1 rounded-full text-[10px] font-medium border ${
                      i === selectedIdx
                        ? "bg-[#d4af37] text-white border-[#d4af37]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-[#d4af37]/50"
                    }`
                  : `rounded-full ${
                      i === selectedIdx
                        ? "w-6 h-2 bg-[#d4af37]"
                        : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                    }`
              }`}
              title={c.name}
            >
              {count <= 3 ? c.name.split(" ").pop() : ""}
            </button>
          ))}
        </div>

        {/* Candidate detail */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {/* Profile header */}
          <div className="flex items-start gap-4">
            <CharacterAvatar
              name={candidate.name}
              initials={candidate.avatar}
              size="lg"
              gender={candidate.gender ?? "Male"}
              role={title}
            />
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-[#0a1f14]">{candidate.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {[
                  candidate.age ? `Age ${candidate.age}` : null,
                  candidate.state,
                  candidate.gender,
                ].filter(Boolean).join(" · ")}
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {candidate.faction && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {candidate.faction}
                  </span>
                )}
                {candidate.scandalRisk && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    candidate.scandalRisk === "High" ? "bg-red-50 text-red-600 border-red-200" :
                    candidate.scandalRisk === "Medium" ? "bg-amber-50 text-amber-600 border-amber-200" :
                    "bg-green-50 text-green-600 border-green-200"
                  }`}>
                    {candidate.scandalRisk} Risk
                  </span>
                )}
                {candidate.traits?.slice(0, 4).map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          {candidate.bio && (
            <p className="text-xs text-gray-600 leading-relaxed">{candidate.bio}</p>
          )}

          {/* Adviser note / Trade-off */}
          {candidate.note && (
            <div className="rounded-md bg-[#d4af37]/10 border border-[#d4af37]/20 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#b8960c] mb-0.5">Adviser&apos;s Note</p>
              <p className="text-xs text-gray-700 italic">{candidate.note}</p>
            </div>
          )}

          {/* Stat bars */}
          {candidate.stats.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Assessment</p>
              {candidate.stats.map(stat => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-20 capitalize">{stat.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statColor(stat.value)}`}
                      style={{ width: `${stat.value}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 w-6 text-right">{stat.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Expected impact (from game event consequences) */}
          {candidate.impacts && candidate.impacts.length > 0 && (
            <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Expected Impact</p>
              {candidate.impacts.map((impact, i) => (
                <p key={i} className="text-xs text-gray-600">{impact}</p>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-3.5 border-t border-gray-200 shrink-0">
          <button
            onClick={() => onSelect(selectedIdx)}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#d4af37" }}
          >
            Appoint {candidate.name.split(" ").pop()}
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Right arrow */}
      <button
        onClick={e => { e.stopPropagation(); goNext(); }}
        className="relative z-10 ml-3 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#0a1f14] transition-all"
      >
        <span className="text-lg">&rsaquo;</span>
      </button>
    </div>,
    document.body,
  );
}
