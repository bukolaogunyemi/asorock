import { useMemo } from "react";
import { useGame } from "@/lib/GameContext";
import { generateEconomyBriefing } from "@/lib/economyBriefing";
import { averageProfessionalCompetence } from "@/lib/competencyUtils";
import type { TeamMemberConfig } from "@/lib/governanceSections";
import type { CharacterState, Relationship } from "@/lib/gameTypes";

interface Props {
  teamConfig: TeamMemberConfig[];
  briefingCooldownKey: string;
  subsection: string | null;
  onCharacterClick?: (name: string) => void;
}

// Color helpers
function statColor(value: number): string {
  if (value > 70) return "bg-emerald-500";
  if (value >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function relationBadge(rel: Relationship): { label: string; color: string } {
  const map: Record<Relationship, { label: string; color: string }> = {
    Loyal: { label: "Loyal", color: "bg-emerald-500/20 text-emerald-400" },
    Friendly: { label: "Friendly", color: "bg-emerald-500/20 text-emerald-400" },
    Neutral: { label: "Neutral", color: "bg-amber-500/20 text-amber-400" },
    Wary: { label: "Wary", color: "bg-amber-500/20 text-amber-400" },
    Distrustful: { label: "Distrustful", color: "bg-red-500/20 text-red-400" },
    Hostile: { label: "Hostile", color: "bg-red-500/20 text-red-400" },
  };
  return map[rel];
}

interface ResolvedTeamMember {
  config: TeamMemberConfig;
  name: string | null;
  character: CharacterState | null;
}

export function EconomyTeamPanel({ teamConfig, briefingCooldownKey, subsection, onCharacterClick }: Props) {
  const { state, summonBriefing } = useGame();

  // Resolve team members from state
  const teamMembers = useMemo((): ResolvedTeamMember[] => {
    return teamConfig.map(config => {
      if (config.lookupSource === "appointments" && config.appointmentPosition) {
        // Look up from appointments
        const appointment = state.appointments
          ?.find(a => a.office === config.appointmentPosition && a.confirmed);
        if (appointment) {
          const character = state.characters[appointment.appointee] ?? null;
          return { config, name: appointment.appointee, character };
        }
        return { config, name: null, character: null };
      }

      // Look up from characters by portfolio substring match
      for (const [name, char] of Object.entries(state.characters)) {
        if (char.portfolio.toLowerCase().includes(config.portfolioMatch.toLowerCase())) {
          return { config, name, character: char };
        }
      }

      return { config, name: null, character: null };
    });
  }, [teamConfig, state.characters, state.appointments]);

  // Compute average competence
  const avgCompetence = useMemo(() => {
    const competences = teamMembers
      .filter((m): m is ResolvedTeamMember & { character: CharacterState } => m.character !== null)
      .map(m => averageProfessionalCompetence(m.character.competencies));
    return competences.length > 0
      ? competences.reduce((a, b) => a + b, 0) / competences.length
      : 0;
  }, [teamMembers]);

  // Cooldown check
  const lastBriefingDay = state.lastActionAtDay[briefingCooldownKey] ?? 0;
  const onCooldown = state.day - lastBriefingDay < 7;
  const cooldownDaysLeft = 7 - (state.day - lastBriefingDay);
  const hasTeam = teamMembers.some(m => m.character);

  const handleSummon = () => {
    if (onCooldown || !hasTeam) return;
    const event = generateEconomyBriefing(state, subsection ?? undefined, avgCompetence);
    summonBriefing(event, briefingCooldownKey);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">
        Economic Team
      </h3>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {teamMembers.map(({ config, name, character }) => {
          if (!character || !name) {
            // Ghost card
            return (
              <div key={config.role} className="rounded-lg border border-dashed border-amber-500/10 bg-black/10 p-2 opacity-50">
                <p className="text-xs text-amber-400/40">Vacant — {config.role}</p>
              </div>
            );
          }

          const portfolio = character.portfolio || config.role;
          const loyalty = character.competencies.personal.loyalty;
          const competence = averageProfessionalCompetence(character.competencies);
          const relationship = character.relationship;
          const avatar = character.avatar || name.slice(0, 2).toUpperCase();
          const badge = relationBadge(relationship);

          return (
            <button
              key={name}
              onClick={() => onCharacterClick?.(name)}
              className="w-full rounded-lg border border-amber-500/10 bg-black/30 p-2 text-left hover:bg-amber-500/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                  {avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-100 truncate">{name}</p>
                  <p className="text-xs text-amber-400/50 truncate">{portfolio}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-400/40 w-14">Loyalty</span>
                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${statColor(loyalty)}`} style={{ width: `${loyalty}%` }} />
                  </div>
                  <span className="text-[10px] text-amber-400/60 w-6 text-right">{loyalty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-400/40 w-14">Competence</span>
                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${statColor(competence)}`} style={{ width: `${competence}%` }} />
                  </div>
                  <span className="text-[10px] text-amber-400/60 w-6 text-right">{competence}</span>
                </div>
              </div>

              {/* Relationship badge */}
              <div className="mt-1.5">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summon Team button */}
      <button
        onClick={handleSummon}
        disabled={!hasTeam || onCooldown}
        className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
          !hasTeam
            ? "bg-gray-700/30 text-gray-500 cursor-not-allowed"
            : onCooldown
            ? "bg-gray-700/30 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-amber-600 to-amber-500 text-black hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-500/20"
        }`}
      >
        {!hasTeam
          ? "No team to summon"
          : onCooldown
          ? `Available in ${cooldownDaysLeft} days`
          : "Summon Team"
        }
      </button>
    </div>
  );
}
