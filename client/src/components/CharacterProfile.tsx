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
import { slugify } from "@/lib/entityTypes";

// ── Relationship color map ──────────
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
    return "faction-leader";
  }
  if (sourceTab === "judiciary" || sourceTab === "legislature") {
    return "constitutional";
  }
  if (sourceTab === "governors" || sourceTab === "security") {
    if (/governor/i.test(portfolio)) return "governor";
  }
  if (sourceTab === "cabinet" || sourceTab === "dashboard") {
    return "cabinet";
  }
  return "general";
}

// ── Bio generator — creates more detailed biographies ─────
function generateDetailedBio(profile: ProfileData): string {
  if (profile.biography && profile.biography !== "No biography available." && profile.biography.length > 100) {
    return profile.biography;
  }

  const parts: string[] = [];

  // Opening
  const honorific = profile.gender === "Female" ? "She" : "He";

  if (profile.age) {
    parts.push(`${profile.name}, aged ${profile.age}, hails from ${profile.state ?? "Nigeria"}.`);
  } else {
    parts.push(`${profile.name} is a prominent figure from ${profile.state ?? "Nigeria"}.`);
  }

  // Education and career
  if (profile.education && profile.education !== "Not specified") {
    parts.push(`${honorific} studied at ${profile.education}.`);
  }

  // Portfolio and current role
  if (profile.role === "cabinet") {
    parts.push(`Currently serving as ${profile.portfolio}, ${honorific.toLowerCase()} brings extensive experience in policy and governance to the role.`);
  } else if (profile.role === "governor") {
    parts.push(`As ${profile.portfolio}, ${honorific.toLowerCase()} oversees one of Nigeria's most strategically important regions.`);
  } else if (profile.role === "constitutional") {
    parts.push(`${honorific} occupies the critical constitutional position of ${profile.portfolio}, a role requiring deep legal expertise and political acumen.`);
  } else if (profile.role === "faction-leader") {
    parts.push(`A key figure in the ${profile.faction} faction, ${honorific.toLowerCase()} wields considerable influence in Nigerian political circles.`);
  }

  // Traits-based personality
  if (profile.traits.length > 0) {
    const traitStr = profile.traits.slice(0, 3).join(", ").toLowerCase();
    parts.push(`Known for being ${traitStr}, ${honorific.toLowerCase()} has built a reputation that precedes ${honorific.toLowerCase() === "he" ? "him" : "her"} in Abuja's corridors of power.`);
  }

  // Faction affiliation
  if (profile.faction && profile.faction !== "Independent") {
    parts.push(`${honorific} maintains strong ties to the ${profile.faction} political bloc, which shapes ${honorific.toLowerCase() === "he" ? "his" : "her"} approach to governance and coalition-building.`);
  }

  // Ethnicity and religion context
  if (profile.ethnicity !== "Unknown" && profile.religion !== "Unknown") {
    parts.push(`Of ${profile.ethnicity} heritage and ${profile.religion} faith, ${honorific.toLowerCase()} navigates the complex ethno-religious dynamics of Nigerian politics with characteristic skill.`);
  }

  // Career history summary
  if (profile.careerHistory.length > 1) {
    const pastRoles = profile.careerHistory.filter(e => !e.current);
    if (pastRoles.length > 0) {
      parts.push(`Prior to the current appointment, ${honorific.toLowerCase()} served as ${pastRoles[0].position}.`);
    }
  }

  // Relationship standing
  const relMap: Record<string, string> = {
    Loyal: "a trusted and loyal ally of the President",
    Friendly: "on good terms with the presidency",
    Neutral: "maintaining a professional distance from the Villa",
    Wary: "increasingly cautious in dealings with the presidency",
    Distrustful: "known to harbour reservations about the current administration",
    Hostile: "openly at odds with the presidential agenda",
  };
  const relDesc = relMap[profile.relationship];
  if (relDesc) {
    parts.push(`${honorific} is widely regarded as ${relDesc}.`);
  }

  return parts.join(" ");
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
  onCharacterClick?: (characterKey: string, sourceTab: string, sourceLabel: string) => void;
  onEntityClick?: (entityId: string, sourceTab: string, sourceLabel: string) => void;
}

// ── Component ─────────────────────────────────────────────
export default function CharacterProfile({ characterKey, sourceTab, onEntityClick }: CharacterProfileProps) {
  const { state } = useGame();

  // Resolve character from game state
  let profile: ProfileData | null = null;

  if (state.characters[characterKey]) {
    profile = adaptCharacterState(state.characters[characterKey], sourceTab);
  }

  if (!profile) {
    const gov = state.governors.find(
      (g) => g.name === characterKey || g.name.toLowerCase().replace(/\s+/g, "-") === characterKey
    );
    if (gov) profile = adaptGovernorState(gov);
  }

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
  const detailedBio = generateDetailedBio(profile);

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
            <p
              className={`text-sm text-white/70 mt-0.5 ${profile.role === "cabinet" && onEntityClick ? "cursor-pointer hover:underline hover:text-white/90 transition-colors" : ""}`}
              onClick={profile.role === "cabinet" && onEntityClick ? () => onEntityClick("ministry:" + slugify(profile!.portfolio), sourceTab, profile!.name) : undefined}
            >
              {profile.portfolio}
            </p>
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
          {/* Bio Card — avatar inside, unlabeled biodata */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex gap-4 mb-3">
                {/* Avatar inside the card */}
                <div
                  className="h-20 w-20 rounded-lg flex items-center justify-center text-3xl border-2 flex-shrink-0"
                  style={{
                    borderColor: "hsl(42, 70%, 50%)",
                    background: "linear-gradient(160deg, #2d4a3e 0%, #0a1f14 60%, #1a3a2a 100%)",
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

                {/* Biodata — no labels, just values */}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {profile.age ? `${profile.age} years` : "—"} · {profile.gender ?? "—"}
                  </p>
                  <p
                    className={`text-sm text-muted-foreground ${profile.state && onEntityClick ? "cursor-pointer hover:underline hover:text-foreground transition-colors" : ""}`}
                    onClick={profile.state && onEntityClick ? () => onEntityClick("state:" + profile!.state!.toLowerCase(), sourceTab, profile!.name) : undefined}
                  >
                    {profile.state ?? "—"} · {profile.ethnicity}
                  </p>
                  <p className="text-sm text-muted-foreground">{profile.religion}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.party} · <span
                      className={`${profile.faction && profile.faction !== "Independent" && onEntityClick ? "cursor-pointer hover:underline hover:text-foreground transition-colors" : ""}`}
                      onClick={profile.faction && profile.faction !== "Independent" && onEntityClick ? () => onEntityClick("faction:" + slugify(profile!.faction), sourceTab, profile!.name) : undefined}
                    >{profile.faction}</span>
                  </p>
                  {profile.education && profile.education !== "Not specified" && (
                    <p className="text-xs text-muted-foreground">{profile.education}</p>
                  )}
                </div>
              </div>

              {/* Traits inline */}
              {profile.traits.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.traits.map((trait) => (
                    <Badge key={trait} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Biography — detailed, generated */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "hsl(42, 70%, 55%)" }}
              >
                Biography
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {detailedBio}
              </p>
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
          {/* Competencies — Professional & Personal in same card, two columns */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "hsl(42, 70%, 55%)" }}
              >
                Competencies
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0">
                {/* Professional column */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Professional</p>
                  <div className="space-y-2">
                    {PROFESSIONAL_KEYS.map((key) => (
                      <CompetencyBar
                        key={key}
                        label={PROFESSIONAL_LABELS[key]}
                        value={profile!.competencies.professional[key]}
                      />
                    ))}
                  </div>
                </div>
                {/* Personal column */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Personal</p>
                  <div className="space-y-2">
                    {PERSONAL_KEYS.map((key) => (
                      <CompetencyBar
                        key={key}
                        label={PERSONAL_LABELS[key]}
                        value={profile!.competencies.personal[key]}
                      />
                    ))}
                  </div>
                </div>
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
