import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CompetencyBar } from "@/components/CompetencyBar";
import { RelationshipIndicator, type Rel } from "@/components/RelationshipIndicator";
import type { ReactNode } from "react";

export interface PersonnelCardProps {
  name: string;
  avatar: string;
  title?: string;
  age?: number;
  state?: string;
  gender?: string;
  traits?: string[];
  loyalty: number;
  competence: number;
  ambition?: number;
  relationship: Rel;
  faction?: string;
  note?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Unified personnel card used across all tabs.
 * Layout: Avatar + Name (age, state, gender) | Title | Traits | Competency bars | Relationship | Actions
 */
export function PersonnelCard({
  name,
  avatar,
  title,
  age,
  state,
  gender,
  traits,
  loyalty,
  competence,
  ambition,
  relationship,
  faction,
  note,
  actions,
  className,
}: PersonnelCardProps) {
  // Build demographic subtitle: "54, Anambra, Female"
  const demographics = [age, state].filter(Boolean).join(", ");

  // Derive influence (avg of loyalty + competence) and reliability (loyalty - ambition/2, floored at 0)
  const influence = Math.round((loyalty + competence) / 2);
  const reliability = Math.round(Math.max(0, loyalty - (ambition ?? 0) / 2));

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-3">
        {/* Header: Avatar + Name + Demographics */}
        <div className="flex items-start gap-3">
          <CharacterAvatar name={name} initials={avatar} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold truncate">{name}</p>
              {faction && (
                <Badge variant="outline" className="text-[10px]">{faction}</Badge>
              )}
            </div>
            {demographics && (
              <p className="text-xs text-muted-foreground">{demographics}</p>
            )}
            {title && (
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{title}</p>
            )}
          </div>
          <RelationshipIndicator relationship={relationship} />
        </div>

        {/* Traits */}
        {traits && traits.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {traits.slice(0, 3).map((trait) => (
              <Badge key={trait} variant="secondary" className="text-[10px]">{trait}</Badge>
            ))}
          </div>
        )}

        {/* Competency bars */}
        <div className="space-y-1">
          <CompetencyBar label="Loyalty" value={loyalty} />
          <CompetencyBar label="Competence" value={competence} />
          {ambition !== undefined && <CompetencyBar label="Ambition" value={ambition} />}
          <CompetencyBar label="Influence" value={influence} />
          <CompetencyBar label="Reliability" value={reliability} />
        </div>

        {/* Note */}
        {note && (
          <p className="text-xs text-muted-foreground italic leading-relaxed">{note}</p>
        )}

        {/* Actions slot */}
        {actions}
      </CardContent>
    </Card>
  );
}
