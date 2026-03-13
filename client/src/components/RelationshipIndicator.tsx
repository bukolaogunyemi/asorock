import { Heart, HeartHandshake, Minus, AlertTriangle, ShieldAlert, Skull } from "lucide-react";

export type Rel = "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile";

const relConfig: Record<Rel, { icon: typeof Heart; color: string; label: string }> = {
  Loyal: { icon: HeartHandshake, color: "text-emerald-500", label: "Loyal" },
  Friendly: { icon: Heart, color: "text-green-500", label: "Friendly" },
  Neutral: { icon: Minus, color: "text-gray-400", label: "Neutral" },
  Wary: { icon: AlertTriangle, color: "text-amber-500", label: "Wary" },
  Distrustful: { icon: ShieldAlert, color: "text-orange-500", label: "Distrustful" },
  Hostile: { icon: Skull, color: "text-red-500", label: "Hostile" },
};

export function RelationshipIndicator({ relationship }: { relationship: Rel }) {
  const config = relConfig[relationship] ?? relConfig.Neutral;
  const Icon = config.icon;
  return (
    <div className={`flex items-center gap-1 ${config.color}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
}
