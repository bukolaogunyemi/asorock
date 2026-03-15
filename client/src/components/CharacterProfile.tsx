import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CompetencyBar } from "@/components/CompetencyBar";
import { useGame } from "@/lib/GameContext";
import { migrateOldCompetencies } from "@/lib/competencyUtils";
import type { CharacterState, GovernorState, Hook } from "@/lib/gameTypes";
import type { ConstitutionalCandidate } from "@/lib/constitutionalOfficers";
import type {
  CharacterCompetencies,
  CareerEntry,
  InteractionEntry,
} from "@/lib/competencyTypes";
import {
  PROFESSIONAL_KEYS,
  PERSONAL_KEYS,
  PROFESSIONAL_LABELS,
  PERSONAL_LABELS,
} from "@/lib/competencyTypes";

// ── Relationship color map (shared with NPCDetailDrawer) ──────────
const relationshipColors: Record<string, string> = {
  Loyal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Friendly: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  Wary: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  Distrustful: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  Hostile: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

// ── ProfileData normalization type ────────────────────────
type ProfileRole = "cabinet" | "faction-leader" | "governor" | "constitutional" | "general";

interface ProfileData {
  name: string;
  title?: string;
  portfolio: string;
  avatar: string;
  age?: number;
  state?: string;
  gender?: string;
  ethnicity: string;
  religion: string;
  party: string;
  faction: string;
  relationship: string;
  traits: string[];
  competencies: CharacterCompetencies;
  biography: string;
  education: string;
  careerHistory: CareerEntry[];
  interactionLog: InteractionEntry[];
  hooks: Hook[];
  role: ProfileRole;
}

// ── Role detection ────────────────────────────────────────
function detectRole(sourceTab: string, portfolio: string): ProfileRole {
  if (sourceTab === "politics" || sourceTab === "factions") {
    // Faction leaders are characters viewed from the politics tab
    return "faction-leader";
  }
  if (sourceTab === "judiciary" || sourceTab === "legislature") {
    return "constitutional";
  }
  if (sourceTab === "governors" || sourceTab === "security") {
    // Check if this looks like a governor
    if (/governor/i.test(portfolio)) return "governor";
  }
  if (sourceTab === "cabinet" || sourceTab === "dashboard") {
    return "cabinet";
  }
  return "general";
}

// ── Adapter: CharacterState → ProfileData ─────────────────
function adaptCharacterState(char: CharacterState, sourceTab: string): ProfileData {
  return {
    name: char.name,
    title: char.title,
    portfolio: char.portfolio,
    avatar: char.avatar,
    age: char.age,
    state: char.state,
    gender: char.gender,
    ethnicity: char.ethnicity ?? "Unknown",
    religion: char.religion ?? "Unknown",
    party: char.party ?? "Ruling Party",
    faction: char.faction,
    relationship: char.relationship,
    traits: char.traits,
    competencies: char.competencies,
    biography: char.biography ?? "No biography available.",
    education: char.education ?? "Not specified",
    careerHistory: char.careerHistory ?? [],
    interactionLog: char.interactionLog ?? [],
    hooks: char.hooks ?? [],
    role: detectRole(sourceTab, char.portfolio),
  };
}

// ── Adapter: GovernorState → ProfileData ──────────────────
function adaptGovernorState(gov: GovernorState): ProfileData {
  const competencies = migrateOldCompetencies({
    loyalty: gov.loyalty,
    competence: gov.competence,
    ambition: 50,
    portfolio: "Governor",
  });

  return {
    name: gov.name,
    title: "His Excellency",
    portfolio: `Governor of ${gov.zone}`,
    avatar: gov.avatar,
    age: undefined,
    state: undefined,
    gender: undefined,
    ethnicity: "Unknown",
    religion: "Unknown",
    party: gov.party,
    faction: gov.zone,
    relationship: gov.relationship,
    traits: [],
    competencies,
    biography: `${gov.name} serves as a governor in the ${gov.zone} geopolitical zone. Current demands: ${gov.demands}`,
    education: "Not specified",
    careerHistory: [
      { position: `Governor (${gov.zone})`, period: "Current term", current: true },
    ],
    interactionLog: [],
    hooks: [],
    role: "governor",
  };
}

// ── Adapter: ConstitutionalCandidate → ProfileData ────────
function adaptConstitutionalCandidate(officer: ConstitutionalCandidate): ProfileData {
  const competencies = migrateOldCompetencies({
    loyalty: officer.loyalty,
    competence: officer.competence,
    ambition: officer.ambition,
    portfolio: officer.portfolio,
  });

  return {
    name: officer.name,
    title: undefined,
    portfolio: officer.portfolio,
    avatar: officer.avatar,
    age: officer.age,
    state: officer.state,
    gender: officer.gender,
    ethnicity: "Unknown",
    religion: officer.religion,
    party: "Ruling Party",
    faction: "Independent",
    relationship: officer.relationship,
    traits: [],
    competencies,
    biography: `${officer.name} holds the position of ${officer.portfolio}. ${officer.agenda}`,
    education: "Not specified",
    careerHistory: [
      { position: officer.portfolio, period: "Current term", current: true },
    ],
    interactionLog: [],
    hooks: [],
    role: "constitutional",
  };
}

// ── Contextual action buttons by role ─────────────────────
const ROLE_ACTIONS: Record<ProfileRole, string[]> = {
  cabinet: ["Summon", "Reassign", "Dismiss", "Investigate"],
  "faction-leader": ["Negotiate", "Appease", "Investigate"],
  governor: ["Summon", "Pressure", "Support", "Investigate"],
  constitutional: ["Summon", "Review Performance", "Investigate"],
  general: ["Investigate"],
};

function getActionVariant(action: string): "default" | "destructive" | "outline" | "secondary" {
  if (action === "Dismiss") return "destructive";
  if (action === "Investigate") return "outline";
  if (action === "Summon" || action === "Negotiate") return "default";
  return "secondary";
}

// ── Interaction category icons ────────────────────────────
function getCategoryIcon(category: string): string {
  switch (category) {
    case "appointment": return "\u{1F4CB}";
    case "dismissal": return "\u{1F6AB}";
    case "summon": return "\u{1F4E2}";
    case "investigation": return "\u{1F50D}";
    case "event": return "\u26A1";
    case "hook": return "\u{1F517}";
    default: return "\u{1F4AC}";
  }
}

// ── Props ─────────────────────────────────────────────────
interface CharacterProfileProps {
  characterKey: string;
  sourceTab: string;
  onCharacterClick?: (key: string, label: string) => void;
}

// ── Component ─────────────────────────────────────────────
export default function CharacterProfile({ characterKey, sourceTab }: CharacterProfileProps) {
  const { state } = useGame();

  // Resolve character from game state
  let profile: ProfileData | null = null;

  // Check characters map
  if (state.characters[characterKey]) {
    profile = adaptCharacterState(state.characters[characterKey], sourceTab);
  }

  // Check governors
  if (!profile) {
    const gov = state.governors.find(
      (g) => g.name === characterKey || g.name.toLowerCase().replace(/\s+/g, "-") === characterKey
    );
    if (gov) profile = adaptGovernorState(gov);
  }

  // Check constitutional officers
  if (!profile) {
    const officer = state.constitutionalOfficers.find(
      (o) => o.name === characterKey || o.name.toLowerCase().replace(/\s+/g, "-") === characterKey
    );
    if (officer) profile = adaptConstitutionalCandidate(officer);
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Character not found: {characterKey}</p>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const actions = ROLE_ACTIONS[profile.role];
  const maxInteractions = 20;
  const displayedInteractions = profile.interactionLog.slice(-maxInteractions).reverse();

  return (
    <div className="h-full overflow-y-auto">
      {/* ── Header Band ──────────────────────────────── */}
      <div
        className="px-6 py-5 border-b"
        style={{
          background: "linear-gradient(135deg, hsl(153, 60%, 12%) 0%, hsl(153, 40%, 18%) 100%)",
          borderColor: "hsl(42, 70%, 45%)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {profile.title && (
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: "hsl(42, 70%, 55%)" }}
              >
                {profile.title}
              </p>
            )}
            <h1 className="text-2xl font-bold text-white truncate">{profile.name}</h1>
            <p className="text-sm text-white/70 mt-0.5">{profile.portfolio}</p>
          </div>
          <Badge className={`flex-shrink-0 ${relationshipColors[profile.relationship] ?? relationshipColors.Neutral}`}>
            {profile.relationship}
          </Badge>
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
        {/* ── Left Column ──────────────────────────── */}
        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex justify-center">
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center text-3xl border-2 flex-shrink-0"
              style={{
                borderColor: "hsl(42, 70%, 50%)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              {profile.gender ? (
                <CharacterAvatar
                  name={profile.name}
                  initials={initials}
                  size="lg"
                  gender={profile.gender}
                  role={profile.portfolio}
                />
              ) : (
                <span className="text-white font-bold text-xl">{initials}</span>
              )}
            </div>
          </div>

          {/* Biodata Grid */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "hsl(42, 70%, 55%)" }}
              >
                Biodata
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <BioRow label="Age" value={profile.age ? `${profile.age} years` : "—"} />
                <BioRow label="State" value={profile.state ?? "—"} />
                <BioRow label="Ethnicity" value={profile.ethnicity} />
                <BioRow label="Religion" value={profile.religion} />
                <BioRow label="Party" value={profile.party} />
                <BioRow label="Faction" value={profile.faction} />
                <BioRow label="Education" value={profile.education} />
              </div>
            </CardContent>
          </Card>

          {/* Career History */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "hsl(42, 70%, 55%)" }}
              >
                Career History
              </h3>
              {profile.careerHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No career records available.</p>
              ) : (
                <div className="space-y-1.5">
                  {profile.careerHistory.map((entry, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm pl-2"
                      style={{
                        borderLeft: entry.current
                          ? "3px solid hsl(153, 60%, 32%)"
                          : "3px solid transparent",
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={entry.current ? "font-semibold text-foreground" : "text-muted-foreground"}>
                          {entry.position}
                        </p>
                        <p className="text-xs text-muted-foreground">{entry.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column ─────────────────────────── */}
        <div className="space-y-5">
          {/* Biography */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "hsl(42, 70%, 55%)" }}
              >
                Biography
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.biography}
              </p>
            </CardContent>
          </Card>

          {/* Traits */}
          {profile.traits.length > 0 && (
            <Card>
              <CardContent className="pt-4 pb-3">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "hsl(42, 70%, 55%)" }}
                >
                  Traits
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.traits.map((trait) => (
                    <Badge key={trait} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Professional Competencies */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "hsl(42, 70%, 55%)" }}
              >
                Professional Competencies
              </h3>
              <div className="space-y-2">
                {PROFESSIONAL_KEYS.map((key) => (
                  <CompetencyBar
                    key={key}
                    label={PROFESSIONAL_LABELS[key]}
                    value={profile!.competencies.professional[key]}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Competencies */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "hsl(42, 70%, 55%)" }}
              >
                Personal Competencies
              </h3>
              <div className="space-y-2">
                {PERSONAL_KEYS.map((key) => (
                  <CompetencyBar
                    key={key}
                    label={PERSONAL_LABELS[key]}
                    value={profile!.competencies.personal[key]}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interactions */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "hsl(42, 70%, 55%)" }}
              >
                Interactions
              </h3>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                {actions.map((action) => (
                  <Button
                    key={action}
                    variant={getActionVariant(action)}
                    size="sm"
                    onClick={() => {
                      // Placeholder — actions are visual-only for now
                    }}
                  >
                    {action}
                  </Button>
                ))}
              </div>

              <Separator className="mb-3" />

              {/* Interaction Timeline */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {displayedInteractions.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No recorded interactions.
                  </p>
                ) : (
                  displayedInteractions.map((entry, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="flex-shrink-0 mt-0.5">{getCategoryIcon(entry.category)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Day {entry.day}</span>
                          {entry.date && <span className="ml-1 text-muted-foreground">({entry.date})</span>}
                        </p>
                        <p className="text-muted-foreground">{entry.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Helper: Biodata row ───────────────────────────────────
function BioRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}
