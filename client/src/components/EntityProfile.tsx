import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/GameContext";
import { resolveEntityProfile } from "@/lib/entityAdapters";
import { ENTITY_TYPE_COLORS } from "@/lib/entityTypes";
import type { EntityPerson, EntityStat, EntityAction } from "@/lib/entityTypes";

// ── Props ─────────────────────────────────────────────────
interface EntityProfileProps {
  entityId: string;
  onCharacterClick: (characterKey: string, sourceTab: string, sourceLabel: string) => void;
  onEntityClick: (entityId: string, sourceTab: string, sourceLabel: string) => void;
}

// ── Helpers ───────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Sub-components ────────────────────────────────────────

function PersonnelCard({
  person,
  entityId,
  entityName,
  onCharacterClick,
}: {
  person: EntityPerson;
  entityId: string;
  entityName: string;
  onCharacterClick: (characterKey: string, sourceTab: string, sourceLabel: string) => void;
}) {
  const isVacant = person.characterKey === "ambassador-placeholder" || person.name === "Not assigned";

  if (isVacant) {
    return (
      <Card className="border border-border bg-muted/20 opacity-50">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
            ?
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Vacant</p>
            <p className="text-xs text-muted-foreground">{person.role}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all border border-border bg-muted/20"
      onClick={() => onCharacterClick(person.characterKey, entityId, entityName)}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
          {getInitials(person.name)}
        </div>
        <div>
          <p className="text-sm font-medium group-hover:underline">{person.name}</p>
          <p className="text-xs text-muted-foreground">{person.role}</p>
        </div>
        {person.relationship && (
          <Badge variant="outline" className="ml-auto text-xs">
            {person.relationship}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function StatBar({ stat }: { stat: EntityStat }) {
  const pct = Math.min(100, Math.max(0, (stat.value / stat.max) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{stat.label}</span>
        <span className="text-muted-foreground">
          {stat.value}/{stat.max}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${stat.color || "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ActionButton({
  action,
  entityId,
  executeEntityAction,
}: {
  action: EntityAction;
  entityId: string;
  executeEntityAction: (entityId: string, actionId: string) => void;
}) {
  function handleClick() {
    if (action.actionType === "appoint") {
      // Appointment actions are informational — show a browser alert for now
      alert(action.description || `Appoint action: ${action.label}`);
    } else {
      executeEntityAction(entityId, action.id);
    }
  }

  return (
    <Button
      key={action.id}
      variant="outline"
      size="sm"
      disabled={!action.enabled}
      className={!action.enabled ? "opacity-50" : ""}
      title={action.disabledReason || action.description}
      onClick={handleClick}
    >
      {action.label}
    </Button>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function EntityProfile({
  entityId,
  onCharacterClick,
  onEntityClick: _onEntityClick,
}: EntityProfileProps) {
  const { state, executeEntityAction } = useGame();

  const profile = resolveEntityProfile(entityId, state);

  if (!profile) {
    return (
      <Card className="border border-border bg-muted/20 m-4">
        <CardContent className="p-4">
          <p className="text-muted-foreground">Entity not found: {entityId}</p>
        </CardContent>
      </Card>
    );
  }

  const typeColors = ENTITY_TYPE_COLORS[profile.type];

  return (
    <div className="space-y-2 p-4">
      {/* ── Section 1: Header ─────────────────────────── */}
      <div>
        <div className="flex items-start gap-3">
          <h2 className="text-2xl font-bold flex-1">{profile.name}</h2>
          <Badge className={`${typeColors.bg} ${typeColors.text} flex-shrink-0`}>
            {profile.typeLabel}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2">{profile.description}</p>
      </div>

      {/* ── Section 2: Metadata Grid ──────────────────── */}
      {profile.metadata.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {profile.metadata.map((m) => (
            <Card key={m.label} className="border border-border bg-muted/20">
              <CardContent className="p-3">
                <p className="text-xs uppercase text-muted-foreground">{m.label}</p>
                <p className="text-sm font-semibold">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Section 3: Key Personnel ──────────────────── */}
      {profile.keyPersonnel.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mt-6 mb-3">Key Personnel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.keyPersonnel.map((person) => (
              <PersonnelCard
                key={person.characterKey}
                person={person}
                entityId={entityId}
                entityName={profile.name}
                onCharacterClick={onCharacterClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Section 4: Indicators/Stats ───────────────── */}
      {profile.stats && profile.stats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mt-6 mb-3">Indicators</h3>
          <div className="space-y-2">
            {profile.stats.map((stat) => (
              <StatBar key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      )}

      {/* ── Section 5: Actions ────────────────────────── */}
      {profile.actions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mt-6 mb-3">Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {profile.actions.map((action) => (
              <ActionButton
                key={action.id}
                action={action}
                entityId={entityId}
                executeEntityAction={executeEntityAction}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
