import { Building2, HardHat, Heart, GraduationCap, Wheat, Shield, TreePine, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGame } from "@/lib/GameContext";

interface GovernanceHubProps {
  onSelectSubTab: (id: string) => void;
}

const DOMAINS = [
  { id: "economy", label: "Economy", icon: Building2, description: "Macro-economic policy, budget, and fiscal management" },
  { id: "infrastructure", label: "Infrastructure", icon: HardHat, description: "Power, oil & gas, transport, and digital infrastructure" },
  { id: "health", label: "Health", icon: Heart, description: "Public health systems and healthcare access" },
  { id: "education", label: "Education", icon: GraduationCap, description: "Education policy and institutional development" },
  { id: "agriculture", label: "Agriculture", icon: Wheat, description: "Food security, crop production, and rural development" },
  { id: "interior", label: "Interior", icon: Shield, description: "Borders, immigration, civil registry, and corrections" },
  { id: "environment", label: "Environment", icon: TreePine, description: "Climate adaptation, gas flaring, and conservation" },
  { id: "youthEmployment", label: "Labour", icon: Users, description: "Youth programs, skills development, and job creation" },
];

export default function GovernanceHub({ onSelectSubTab }: GovernanceHubProps) {
  const { state } = useGame();

  function getStatus(domain: string): { label: string; color: string } {
    if (domain === "economy") {
      const inflation = state.macroEconomy?.inflation ?? 15;
      if (inflation < 12) return { label: "Healthy", color: "text-green-400" };
      if (inflation < 25) return { label: "Caution", color: "text-yellow-400" };
      return { label: "Critical", color: "text-red-400" };
    }
    const sectorKey = domain === "health" ? "healthSector" : domain;
    const sector = (state as any)[sectorKey];
    if (sector?.crisisZone === "green") return { label: "Healthy", color: "text-green-400" };
    if (sector?.crisisZone === "red") return { label: "Critical", color: "text-red-400" };
    return { label: "Caution", color: "text-yellow-400" };
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Governance</h2>
        <p className="text-sm text-muted-foreground">National systems and institutional management</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DOMAINS.map((domain) => {
          const status = getStatus(domain.id);
          const Icon = domain.icon;
          return (
            <Card key={domain.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onSelectSubTab(domain.id)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{domain.label}</h3>
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{domain.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
