import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { CharacterState } from "@/lib/GameContext";
import { Shield, Brain, Flame, Users, Heart } from "lucide-react";

interface NPCDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: CharacterState | null;
}

const relationshipColors: Record<string, string> = {
  Loyal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Friendly: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  Wary: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  Distrustful: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  Hostile: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

function StatBar({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3 w-3" />
          {label}
        </span>
        <span className="font-mono font-medium">{value}</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

export default function NPCDetailDrawer({
  open,
  onOpenChange,
  character,
}: NPCDetailDrawerProps) {
  if (!character) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="pb-4">
          {/* Avatar and name */}
          <div className="flex items-center gap-3">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
              style={{ backgroundColor: "hsl(153, 60%, 28%)" }}
            >
              {character.avatar}
            </div>
            <div>
              <SheetTitle className="text-left">{character.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">{character.portfolio}</p>
            </div>
          </div>
        </SheetHeader>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge className={relationshipColors[character.relationship] ?? ""}>
            {character.relationship}
          </Badge>
          {character.faction && (
            <Badge variant="outline">{character.faction}</Badge>
          )}
          {character.traits.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>

        <Separator className="mb-4" />

        {/* Core Stats */}
        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-semibold">Core Attributes</h4>
          <StatBar label="Loyalty" value={character.loyalty} icon={Heart} color="green" />
          <StatBar label="Competence" value={character.competence} icon={Brain} color="blue" />
          <StatBar label="Ambition" value={character.ambition} icon={Flame} color="orange" />
        </div>

        <Separator className="mb-4" />

        {/* Derived Info */}
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-semibold">Intelligence</h4>
          <div className="text-xs space-y-1.5 text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Betrayal threshold:</span>{" "}
              {character.betrayalThreshold < 30
                ? "Very low — watch closely"
                : character.betrayalThreshold < 50
                ? "Moderate — could flip under pressure"
                : "High — unlikely to betray soon"}
            </p>
            <p>
              <span className="font-medium text-foreground">Risk profile:</span>{" "}
              {character.ambition > 70 && character.loyalty < 40
                ? "Dangerous. High ambition, low loyalty."
                : character.ambition > 60
                ? "Ambitious but manageable."
                : "Low risk for now."}
            </p>
          </div>
        </div>

        {/* Hooks */}
        {character.hooks.length > 0 && (
          <>
            <Separator className="mb-4" />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Hooks ({character.hooks.length})
              </h4>
              <div className="space-y-2">
                {character.hooks.map((hook) => (
                  <div
                    key={hook.id}
                    className="text-xs p-2 rounded bg-muted"
                  >
                    <p className="font-medium">{hook.id}</p>
                    <p className="text-muted-foreground mt-0.5">
                      Target: {hook.target}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
