import { useMemo, useState, useCallback } from "react";
import { useGame } from "@/lib/GameContext";
import { generateEconomyBriefing } from "@/lib/economyBriefing";
import { averageProfessionalCompetence } from "@/lib/competencyUtils";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { AppointmentModal, type AppointmentModalCandidate } from "@/components/AppointmentModal";
import { APPOINTMENT_POSITIONS } from "@/lib/handcraftedCharacters";
import type { TeamMemberConfig } from "@/lib/governanceSections";
import type { CharacterState, Relationship } from "@/lib/gameTypes";
import type { CharacterCompetencies, CareerEntry, InteractionEntry } from "@/lib/competencyTypes";

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
    Loyal: { label: "Loyal", color: "bg-emerald-500/20 text-emerald-700" },
    Friendly: { label: "Friendly", color: "bg-emerald-500/20 text-emerald-700" },
    Neutral: { label: "Neutral", color: "bg-amber-500/20 text-amber-700" },
    Wary: { label: "Wary", color: "bg-amber-500/20 text-amber-700" },
    Distrustful: { label: "Distrustful", color: "bg-red-500/20 text-red-700" },
    Hostile: { label: "Hostile", color: "bg-red-500/20 text-red-700" },
  };
  return map[rel];
}

interface ResolvedTeamMember {
  config: TeamMemberConfig;
  name: string | null;
  character: CharacterState | null;
}

/* ─── Appointment Candidate type (from handcraftedCharacters) ─── */
interface AppointmentCandidate {
  name: string;
  avatar: string;
  loyalty: number;
  competence: number;
  age: number;
  state: string;
  gender: string;
  religion: string;
  ethnicity: string;
  traits: string[];
  note: string;
  bio: string;
  competencies: Record<string, number>;
}

/* ─── Main Component ──────────────────────────────────────────── */

export function EconomyTeamPanel({ teamConfig, briefingCooldownKey, subsection, onCharacterClick }: Props) {
  const { state, summonBriefing, makeAppointment } = useGame();
  const [appointingRole, setAppointingRole] = useState<string | null>(null);

  // Resolve team members from state
  const teamMembers = useMemo((): ResolvedTeamMember[] => {
    return teamConfig.map(config => {
      if (config.lookupSource === "appointments" && config.appointmentPosition) {
        const appointment = state.appointments
          ?.find(a => a.office === config.appointmentPosition && a.confirmed);
        if (appointment) {
          const character = state.characters[appointment.appointee] ?? null;
          return { config, name: appointment.appointee, character };
        }
        return { config, name: null, character: null };
      }

      for (const [name, char] of Object.entries(state.characters)) {
        if (char.portfolio.toLowerCase().includes(config.portfolioMatch.toLowerCase())) {
          return { config, name, character: char };
        }
      }

      return { config, name: null, character: null };
    });
  }, [teamConfig, state.characters, state.appointments]);

  // Get candidates for a role from APPOINTMENT_POSITIONS
  const getCandidatesForRole = useCallback((role: string): AppointmentCandidate[] => {
    const match = APPOINTMENT_POSITIONS.find(p =>
      p.position.toLowerCase() === role.toLowerCase() ||
      role.toLowerCase().includes(p.position.toLowerCase()) ||
      p.position.toLowerCase().includes(role.toLowerCase().replace("minister of ", "").replace(" & investment", ""))
    );
    if (match) return match.candidates as AppointmentCandidate[];

    // Generate placeholder candidates for positions not in APPOINTMENT_POSITIONS (min 3)
    return [
      {
        name: `Alh. Musa Adamu`, avatar: "MA", loyalty: 70, competence: 65,
        age: 54, state: "Katsina", gender: "Male", religion: "Islam", ethnicity: "Hausa",
        traits: ["Experienced", "Steady", "Connected"],
        note: "A reliable loyalist. Strong party connections but may lack technical depth.",
        bio: `Veteran civil servant with over 20 years across federal ministries. Well-connected in party circles. Served as Permanent Secretary in two ministries.`,
        competencies: { loyalty: 4, administration: 3, political: 4, discretion: 3, networks: 3 },
      },
      {
        name: `Dr. Amara Obi`, avatar: "AO", loyalty: 55, competence: 82,
        age: 44, state: "Anambra", gender: "Female", religion: "Christianity", ethnicity: "Igbo",
        traits: ["Technocrat", "Reformist", "Independent"],
        note: "Brilliant technocrat. IMF-trained. May clash with old guard but will deliver results.",
        bio: `Former World Bank consultant who led governance reform programs in 3 West African countries. PhD from Harvard Kennedy School. Outspoken on transparency.`,
        competencies: { loyalty: 3, administration: 4, political: 2, discretion: 4, networks: 4 },
      },
      {
        name: `Barr. Funke Adeyemi`, avatar: "FA", loyalty: 62, competence: 73,
        age: 49, state: "Oyo", gender: "Female", religion: "Christianity", ethnicity: "Yoruba",
        traits: ["Pragmatic", "Diplomatic", "Bridge-Builder"],
        note: "Consensus builder. Won't make waves but keeps the machinery running smoothly.",
        bio: `Corporate lawyer turned public administrator. Chaired the Presidential Committee on Ease of Doing Business. Known for finding middle ground between competing interests.`,
        competencies: { loyalty: 3, administration: 4, political: 3, discretion: 4, networks: 3 },
      },
    ];
  }, []);

  // Resolve raw candidates for the appointing role
  const rawCandidates = useMemo(
    () => appointingRole ? getCandidatesForRole(appointingRole) : [],
    [appointingRole, getCandidatesForRole],
  );

  // Adapt AppointmentCandidate[] → AppointmentModalCandidate[] for the shared modal
  const modalCandidates = useMemo((): AppointmentModalCandidate[] => {
    return rawCandidates.map(c => ({
      name: c.name,
      avatar: c.avatar,
      age: c.age,
      state: c.state,
      gender: c.gender,
      traits: c.traits,
      bio: c.bio,
      note: c.note,
      stats: Object.entries(c.competencies).map(([key, val]) => ({
        label: key,
        value: (val as number) * 20,
      })),
    }));
  }, [rawCandidates]);

  const handleAppoint = useCallback((role: string, candidate: AppointmentCandidate) => {
    const admin = (candidate.competencies.administration ?? 3) * 20;
    const pol = (candidate.competencies.political ?? 3) * 18;
    const net = (candidate.competencies.networks ?? 3) * 18;
    const disc = (candidate.competencies.discretion ?? 3) * 18;
    const loy = (candidate.competencies.loyalty ?? 3) * 20;

    const newChar: CharacterState = {
      name: candidate.name,
      portfolio: role,
      faction: "",
      relationship: "Neutral" as Relationship,
      avatar: candidate.avatar,
      age: candidate.age,
      state: candidate.state,
      gender: candidate.gender,
      competencies: {
        professional: {
          economics: admin,
          diplomacy: net,
          security: disc,
          media: pol,
          legal: disc,
          administration: admin,
          technology: Math.round((admin + net) / 2),
        },
        personal: {
          loyalty: loy,
          charisma: pol,
          leadership: Math.round((pol + admin) / 2),
          ambition: 50,
          integrity: disc,
          resilience: 60,
          intrigue: Math.round(net * 0.7),
        },
      },
      hooks: [],
      traits: candidate.traits,
      careerHistory: [] as CareerEntry[],
      interactionLog: [] as InteractionEntry[],
    };

    // Determine if this is an appointment-based or character-based position
    const teamCfg = teamConfig.find(tc => tc.role === role);
    if (teamCfg?.lookupSource === "appointments" && teamCfg.appointmentPosition) {
      makeAppointment(teamCfg.appointmentPosition, candidate.name, newChar);
    } else {
      // For portfolio-based lookups, add with matching portfolio
      makeAppointment(role, candidate.name, newChar);
    }
    setAppointingRole(null);
  }, [teamConfig, makeAppointment]);

  const handleModalSelect = useCallback((index: number) => {
    if (!appointingRole) return;
    const candidate = rawCandidates[index];
    if (candidate) handleAppoint(appointingRole, candidate);
  }, [appointingRole, rawCandidates, handleAppoint]);

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
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
        Economic Team
      </h3>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {teamMembers.map(({ config, name, character }) => {
          if (!character || !name) {
            // Vacant position card with "Make Appointment" button
            return (
              <div key={config.role} className="rounded-lg border border-dashed border-[#d4af37]/40 bg-[#faf8f5] p-2.5">
                <p className="text-xs font-semibold text-[#0a1f14] mb-0.5">{config.role}</p>
                <p className="text-[10px] text-gray-400 mb-2">Position vacant</p>
                <button
                  onClick={() => setAppointingRole(config.role)}
                  className="w-full py-1.5 rounded-md text-[10px] font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#d4af37" }}
                >
                  Make Appointment
                </button>
              </div>
            );
          }

          const portfolio = character.portfolio || config.role;
          const loyalty = character.competencies.personal.loyalty;
          const competence = averageProfessionalCompetence(character.competencies);
          const relationship = character.relationship;
          const badge = relationBadge(relationship);

          return (
            <button
              key={name}
              onClick={() => onCharacterClick?.(name)}
              className="w-full rounded-lg border border-gray-200 bg-[#faf8f5] p-2 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {/* Avatar — using CharacterAvatar with gender */}
                <CharacterAvatar
                  name={name}
                  initials={character.avatar || name.slice(0, 2).toUpperCase()}
                  size="sm"
                  gender={character.gender}
                  role={portfolio}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#0a1f14] truncate">{name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{portfolio}</p>
                </div>
                <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-medium shrink-0 ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              {/* Compact stats — displayed on 0-5 scale */}
              <div className="mt-1.5 flex gap-3">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[9px] text-gray-400">Loy</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${statColor(loyalty)}`} style={{ width: `${loyalty}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-400 w-5 text-right">{loyalty}</span>
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[9px] text-gray-400">Comp</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${statColor(competence)}`} style={{ width: `${competence}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-400 w-5 text-right">{competence}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summon Team button */}
      <button
        onClick={handleSummon}
        disabled={!hasTeam || onCooldown}
        className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
          !hasTeam
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : onCooldown
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-white hover:from-[#b8960c] hover:to-[#d4af37] shadow-lg shadow-[#d4af37]/20"
        }`}
      >
        {!hasTeam
          ? "No team to summon"
          : onCooldown
          ? `Available in ${cooldownDaysLeft} days`
          : "Summon Team"
        }
      </button>

      {/* Appointment Modal (shared component) */}
      {appointingRole && modalCandidates.length > 0 && (
        <AppointmentModal
          title={appointingRole}
          headerLabel="Appointment"
          candidates={modalCandidates}
          onSelect={handleModalSelect}
          onCancel={() => setAppointingRole(null)}
        />
      )}
    </div>
  );
}
