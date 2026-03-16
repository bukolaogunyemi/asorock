import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CompetencyBar } from "@/components/CompetencyBar";
import { RelationshipIndicator, type Rel } from "@/components/RelationshipIndicator";
import { getTopN } from "@/lib/competencyUtils";
import { PROFESSIONAL_LABELS, PERSONAL_LABELS } from "@/lib/competencyTypes";
import type { CharacterCompetencies } from "@/lib/competencyTypes";
import type { ReactNode } from "react";

export interface PersonnelCardProps {
  name: string;
  avatar: string;
  title?: string;
  age?: number;
  state?: string;
  gender?: string;
  traits?: string[];
  competencies: CharacterCompetencies;
  relationship: Rel;
  faction?: string;
  note?: string;
  actions?: ReactNode;
  className?: string;
  onClick?: () => void;
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
  competencies,
  relationship,
  faction,
  note,
  actions,
  className,
  onClick,
}: PersonnelCardProps) {
  // Build demographic subtitle: "54, Anambra, Female"
  const demographics = [age, state].filter(Boolean).join(", ");

  // Top-3 professional and personal competencies
  const topProfessional = getTopN(competencies.professional as unknown as Record<string, number>, 3);
  const topPersonal = getTopN(competencies.personal as unknown as Record<string, number>, 3);

  return (
    <Card
      className={`${className ?? ""} group ${onClick ? "cursor-pointer hover:border-primary/50 hover:shadow-md transition-all" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Avatar + Name + Demographics */}
        <div className="flex items-start gap-3">
          <CharacterAvatar name={name} initials={avatar} size="md" gender={gender} role={title} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-semibold truncate ${onClick ? "group-hover:underline" : ""}`}>{name}</p>
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

        {/* Competency bars — top 3 professional + top 3 personal */}
        <div className="space-y-1">
          {topProfessional.map(({ key, value }) => (
            <CompetencyBar
              key={key}
              label={PROFESSIONAL_LABELS[key as keyof typeof PROFESSIONAL_LABELS] ?? key}
              value={value}
            />
          ))}
          {topPersonal.map(({ key, value }) => (
            <CompetencyBar
              key={key}
              label={PERSONAL_LABELS[key as keyof typeof PERSONAL_LABELS] ?? key}
              value={value}
            />
          ))}
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
