import { useCallback, useState, useMemo } from "react";
import { useGame } from "@/lib/GameContext";
import {
  CABINET_CLUSTERS,
  PORTFOLIO_SECTOR_MAP,
  computeMinisterPerformance,
  computeMinisterStatus,
  relationshipToScore,
  STATUS_CONFIG,
} from "@/lib/cabinetSystem";
import { averageProfessionalCompetence } from "@/lib/competencyUtils";
import { CharacterAvatar } from "./CharacterAvatar";
import { AppointmentModal, type AppointmentModalCandidate } from "./AppointmentModal";
import { APPOINTMENT_POSITIONS, cabinetCandidates, AGENCY_HEAD_POSITIONS, agencyHeadCandidates } from "@/lib/handcraftedCharacters";
import FederalCharacterPanel from "./cabinet/FederalCharacterPanel";
import MinisterDetailPanel from "./cabinet/MinisterDetailPanel";
import { FECMeeting } from "./cabinet/FECMeeting";
import { PerformanceReview } from "./cabinet/PerformanceReview";
import { ReassignModal, DismissModal } from "./cabinet/CabinetActionModals";
import { CabinetRetreat } from "./cabinet/CabinetRetreat";
import { BudgetMeeting } from "./cabinet/BudgetMeeting";
import { CabinetRecords } from "./cabinet/CabinetRecords";
import { isRetreatDue, isOctoberBudgetMonth } from "@/lib/cabinetRetreats";
import type { GameState, Relationship, CharacterState } from "@/lib/gameTypes";
import type { CareerEntry, InteractionEntry } from "@/lib/competencyTypes";

interface CabinetTabProps {
  onCharacterClick?: (name: string) => void;
  onEntityClick?: (entityId: string) => void;
}

// Constitutional officers — must match APPOINTMENT_POSITIONS keys
const CABINET_OFFICERS = [
  "Chief of Staff",
  "Secretary to the Government",
  "National Security Adviser",
  "Chief Economic Adviser",
  "Director of National Intelligence",
  "National Political Adviser",
  "National Media Adviser",
] as const;

// Helpers
function getSectorHealth(state: GameState, portfolio: string): number | null {
  const sectorKey = PORTFOLIO_SECTOR_MAP[portfolio];
  if (!sectorKey) return null;
  const sector = (state as any)[sectorKey];
  return sector?.health ?? 50;
}

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

type ModalState =
  | null
  | { type: "review"; name: string; portfolio: string }
  | { type: "reassign"; name: string; portfolio: string }
  | { type: "dismiss"; name: string; portfolio: string };

type CabinetView = "cabinet" | "records";

// Action button config
const ACTION_BUTTONS = [
  { id: "convene-fec", label: "Convene FEC", icon: "📋" },
  { id: "summon-minister", label: "Summon Minister", icon: "🔔" },
  { id: "reshuffle", label: "Reshuffle", icon: "🔄" },
  { id: "retreat", label: "Retreat", icon: "🏛️" },
] as const;

// ── Shared card for filled positions (governance-style) ──
function FilledPositionCard({
  name,
  char,
  role,
  onClick,
  statusLine,
  borderClass,
}: {
  name: string;
  char: CharacterState;
  role: string;
  onClick: () => void;
  statusLine?: string;
  borderClass?: string;
}) {
  const loyalty = char.competencies.personal.loyalty;
  const competence = averageProfessionalCompetence(char.competencies);
  const badge = relationBadge(char.relationship);

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border border-gray-200 bg-[#faf8f5] p-2 text-left hover:bg-gray-50 transition-colors ${borderClass ?? ""}`}
    >
      <div className="flex items-center gap-2">
        <CharacterAvatar
          name={name}
          initials={char.avatar || name.slice(0, 2).toUpperCase()}
          size="sm"
          gender={char.gender}
          role={role}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#0a1f14] truncate">{name}</p>
          <p className="text-[10px] text-gray-500 truncate">{role}</p>
        </div>
        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-medium shrink-0 ${badge.color}`}>
          {badge.label}
        </span>
      </div>
      {/* Trait pills */}
      {char.traits.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {char.traits.slice(0, 2).map((trait) => (
            <span key={trait} className="inline-block px-1.5 py-0.5 rounded text-[8px] font-medium bg-[#0a1f14]/5 text-[#0a1f14]/70 capitalize">
              {trait}
            </span>
          ))}
        </div>
      )}
      <div className="mt-1.5 flex gap-3">
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[9px] text-gray-400">Loy</span>
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${statColor(loyalty)}`} style={{ width: `${loyalty}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[9px] text-gray-400">Comp</span>
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${statColor(competence)}`} style={{ width: `${competence}%` }} />
          </div>
        </div>
      </div>
      {statusLine && <p className="text-[9px] text-gray-400 mt-1">{statusLine}</p>}
    </button>
  );
}

// ── Shared card for vacant positions ──
function VacantPositionCard({ role, onAppoint }: { role: string; onAppoint: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-[#d4af37]/40 bg-[#faf8f5] p-2.5">
      <p className="text-xs font-semibold text-[#0a1f14] mb-0.5">{role}</p>
      <p className="text-[10px] text-gray-400 mb-2">Position vacant</p>
      <button
        onClick={onAppoint}
        className="w-full py-1.5 rounded-md text-[10px] font-bold text-white transition-all hover:opacity-90"
        style={{ backgroundColor: "#d4af37" }}
      >
        Make Appointment
      </button>
    </div>
  );
}

// ── Appointment candidate adapter ──
interface RawCandidate {
  name: string;
  avatar: string;
  loyalty: number;
  competence: number;
  age: number;
  state: string;
  gender: string;
  religion: string;
  ethnicity: string;
  traits?: string[];
  tradeOff?: string;
  note?: string;
  bio?: string;
  faction?: string;
  competencies?: Record<string, number>;
}

function adaptCandidates(raw: RawCandidate[]): AppointmentModalCandidate[] {
  return raw.map(c => ({
    name: c.name,
    avatar: c.avatar,
    age: c.age,
    state: c.state,
    gender: c.gender,
    faction: c.faction,
    traits: c.traits,
    bio: c.tradeOff ?? c.bio ?? "",
    note: c.tradeOff ?? c.note ?? "",
    stats: [
      { label: "Loyalty", value: c.loyalty },
      { label: "Competence", value: c.competence },
    ],
  }));
}

function buildCharacterFromCandidate(candidate: RawCandidate, role: string): CharacterState {
  const admin = candidate.competence;
  const pol = Math.round(candidate.competence * 0.9);
  const net = Math.round(candidate.competence * 0.85);
  const disc = Math.round(candidate.competence * 0.8);
  const loy = candidate.loyalty;

  return {
    name: candidate.name,
    portfolio: role,
    faction: candidate.faction ?? "",
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
    traits: candidate.traits ?? [],
    careerHistory: [] as CareerEntry[],
    interactionLog: [] as InteractionEntry[],
    biography: candidate.bio,
    education: (candidate as any).education,
    religion: candidate.religion,
    ethnicity: candidate.ethnicity,
  };
}

export default function CabinetTab({ onCharacterClick }: CabinetTabProps) {
  const { state, conveneFEC, clearFECMemos, applyRetreat, submitBudget, makeAppointment } = useGame();
  const isPlaying = state.phase === "playing";
  const pendingMemos = state.cabinetRetreats.pendingFECMemos;
  const hasPendingFEC = pendingMemos.length > 0;

  const [selectedMinister, setSelectedMinister] = useState<{ name: string; portfolio: string } | null>(null);
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [showRetreat, setShowRetreat] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [view, setView] = useState<CabinetView>("cabinet");
  const [appointingRole, setAppointingRole] = useState<string | null>(null);

  const retreatDue = isPlaying && isRetreatDue(state.cabinetRetreats.lastRetreatDay, state.day);
  const budgetDue = retreatDue && isOctoberBudgetMonth(state.day);

  const handleMinisterClick = useCallback(
    (name: string, portfolio: string) => setSelectedMinister({ name, portfolio }),
    [],
  );

  const handleAction = useCallback((actionId: string) => {
    switch (actionId) {
      case "convene-fec": conveneFEC(); break;
      case "summon-minister": break; // TODO: open minister picker
      case "reshuffle": break; // TODO: open reshuffle flow
      case "retreat": setShowRetreat(true); break;
    }
  }, [conveneFEC]);

  // Resolve constitutional officers
  const cabinetOfficers = useMemo(() =>
    CABINET_OFFICERS.map((office) => {
      const appointment = state.appointments?.find((a) => a.office === office);
      const name = appointment?.appointee ?? null;
      const char = name ? state.characters[name] ?? null : null;
      return { office, name, char };
    }),
    [state.appointments, state.characters],
  );

  // Resolve agency heads
  const agencyHeads = useMemo(() =>
    AGENCY_HEAD_POSITIONS.map((office) => {
      const appointment = state.appointments?.find((a) => a.office === office);
      const name = appointment?.appointee ?? null;
      const char = name ? state.characters[name] ?? null : null;
      return { office, name, char };
    }),
    [state.appointments, state.characters],
  );

  // Get candidates for the current appointing role
  const { rawCandidates, modalCandidates } = useMemo(() => {
    if (!appointingRole) return { rawCandidates: [] as RawCandidate[], modalCandidates: [] as AppointmentModalCandidate[] };

    // Try APPOINTMENT_POSITIONS first (presidential staff)
    const posMatch = APPOINTMENT_POSITIONS.find(p => p.position === appointingRole);
    if (posMatch) {
      const raw = posMatch.candidates as unknown as RawCandidate[];
      return { rawCandidates: raw, modalCandidates: adaptCandidates(raw) };
    }

    // Try agencyHeadCandidates (CBN, FIRS, Customs, NNPCL)
    const agencyKey = (AGENCY_HEAD_POSITIONS as readonly string[]).find(k =>
      k.toLowerCase() === appointingRole.toLowerCase()
    ) as keyof typeof agencyHeadCandidates | undefined;
    if (agencyKey) {
      const raw = agencyHeadCandidates[agencyKey] as unknown as RawCandidate[];
      return { rawCandidates: raw, modalCandidates: adaptCandidates(raw) };
    }

    // Try cabinetCandidates (minister portfolios)
    const cabinetKey = Object.keys(cabinetCandidates).find(k =>
      k.toLowerCase() === appointingRole.toLowerCase()
    ) as keyof typeof cabinetCandidates | undefined;
    if (cabinetKey) {
      const raw = cabinetCandidates[cabinetKey] as unknown as RawCandidate[];
      return { rawCandidates: raw, modalCandidates: adaptCandidates(raw) };
    }

    return { rawCandidates: [] as RawCandidate[], modalCandidates: [] as AppointmentModalCandidate[] };
  }, [appointingRole]);

  const handleModalSelect = useCallback((index: number) => {
    if (!appointingRole || !rawCandidates[index]) return;
    const candidate = rawCandidates[index];
    const newChar = buildCharacterFromCandidate(candidate, appointingRole);

    // Presidential staff uses office-based appointment; ministers use portfolio
    const isStaff = CABINET_OFFICERS.includes(appointingRole as any);
    makeAppointment(appointingRole, candidate.name, newChar);

    // For ministers, also set cabinetAppointments
    if (!isStaff) {
      // cabinetAppointments is handled by the MAKE_APPOINTMENT reducer for portfolio-based
    }

    setAppointingRole(null);
  }, [appointingRole, rawCandidates, makeAppointment]);

  // FEC meeting overlay
  if (hasPendingFEC) {
    return (
      <div className="h-full min-h-0 p-4 max-w-2xl mx-auto">
        <FECMeeting memos={pendingMemos} onComplete={clearFECMemos} />
      </div>
    );
  }

  // Retreat overlay
  if (showRetreat || (retreatDue && !budgetDue && !showBudget)) {
    return (
      <div className="h-full min-h-0 p-4 max-w-2xl mx-auto">
        <CabinetRetreat
          onComplete={(priorities) => {
            applyRetreat(priorities);
            setShowRetreat(false);
          }}
        />
      </div>
    );
  }

  // Budget meeting overlay
  if (showBudget || budgetDue) {
    return (
      <div className="h-full min-h-0 p-4 max-w-2xl mx-auto">
        <BudgetMeeting
          onComplete={(allocation) => {
            submitBudget(allocation);
            setShowBudget(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      {/* ── LEFT COLUMN: Actions + Federal Character ── */}
      {isPlaying && (
        <div className="w-[220px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-3 flex flex-col gap-4">
          {/* Presidential Actions */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-2">
              Presidential Actions
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {ACTION_BUTTONS.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleAction(btn.id)}
                  className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-center transition-all bg-white border border-gray-200 text-[#0a1f14] hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  <span className="text-base">{btn.icon}</span>
                  <span className="text-[10px] font-semibold leading-tight">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Federal Character Compliance */}
          <FederalCharacterPanel />
        </div>
      )}

      {/* ── RIGHT COLUMN: Tab pills + Cabinet/Records content ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        {/* Sub-tab pills (governance style) */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
          <button
            onClick={() => setView("cabinet")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              view === "cabinet"
                ? "bg-[#d4af37] text-white"
                : "text-gray-500 hover:text-[#0a1f14] bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Cabinet
          </button>
          <button
            onClick={() => setView("records")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              view === "records"
                ? "bg-[#d4af37] text-white"
                : "text-gray-500 hover:text-[#0a1f14] bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Records & Reforms
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === "records" ? (
            <CabinetRecords />
          ) : selectedMinister ? (
            <MinisterDetailPanel
              ministerName={selectedMinister.name}
              portfolio={selectedMinister.portfolio}
              onClose={() => setSelectedMinister(null)}
              onSummon={() => console.log("Summon:", selectedMinister.name)}
              onDirective={() => console.log("Directive:", selectedMinister.name)}
              onReview={() => setActiveModal({ type: "review", ...selectedMinister })}
              onReassign={() => setActiveModal({ type: "reassign", ...selectedMinister })}
              onDismiss={() => setActiveModal({ type: "dismiss", ...selectedMinister })}
              onViewProfile={() => onCharacterClick?.(selectedMinister.name)}
            />
          ) : (
            <div className="space-y-4">
              {/* Presidential Staff cluster */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-2">
                  Presidential Staff
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {cabinetOfficers.map(({ office, name, char }) =>
                    char && name ? (
                      <FilledPositionCard
                        key={office}
                        name={name}
                        char={char}
                        role={office}
                        onClick={() => onCharacterClick?.(name)}
                      />
                    ) : (
                      <VacantPositionCard
                        key={office}
                        role={office}
                        onAppoint={() => setAppointingRole(office)}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Agency Heads cluster */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-2">
                  Agency Heads
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {agencyHeads.map(({ office, name, char }) =>
                    char && name ? (
                      <FilledPositionCard
                        key={office}
                        name={name}
                        char={char}
                        role={office}
                        onClick={() => onCharacterClick?.(name)}
                      />
                    ) : (
                      <VacantPositionCard
                        key={office}
                        role={office}
                        onAppoint={() => setAppointingRole(office)}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Minister cluster grids */}
              {CABINET_CLUSTERS.map((cluster) => (
                <div key={cluster.id}>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-2">
                    {cluster.label}
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {cluster.portfolios.map((portfolio) => {
                      const appointedName = state.cabinetAppointments[portfolio];
                      const char = appointedName ? state.characters[appointedName] : null;

                      if (!appointedName || !char) {
                        return (
                          <VacantPositionCard
                            key={portfolio}
                            role={portfolio}
                            onAppoint={() => setAppointingRole(portfolio)}
                          />
                        );
                      }

                      const sectorHealth = getSectorHealth(state, portfolio);
                      const competenceAvg = averageProfessionalCompetence(char.competencies);
                      const relScore = relationshipToScore(char.relationship);
                      const performance = computeMinisterPerformance(sectorHealth, competenceAvg, relScore);
                      const ms = state.ministerStatuses?.[appointedName];
                      const status = computeMinisterStatus(
                        sectorHealth ?? 50, relScore,
                        ms?.onProbation ?? false, ms?.appointmentDay ?? 0, state.day,
                      );
                      const statusConfig = STATUS_CONFIG[status];

                      return (
                        <FilledPositionCard
                          key={portfolio}
                          name={appointedName}
                          char={char}
                          role={`Minister of ${portfolio}`}
                          onClick={() => handleMinisterClick(appointedName, portfolio)}
                          statusLine={`${status} · ${Math.round(performance)}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Modal */}
      {appointingRole && modalCandidates.length > 0 && (
        <AppointmentModal
          title={appointingRole}
          headerLabel="Appointment"
          candidates={modalCandidates}
          onSelect={handleModalSelect}
          onCancel={() => setAppointingRole(null)}
        />
      )}

      {/* Action Modals */}
      {activeModal?.type === "review" && (
        <PerformanceReview
          ministerName={activeModal.name}
          portfolio={activeModal.portfolio}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === "reassign" && (
        <ReassignModal
          ministerName={activeModal.name}
          currentPortfolio={activeModal.portfolio}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === "dismiss" && (
        <DismissModal
          ministerName={activeModal.name}
          portfolio={activeModal.portfolio}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
