import { useState } from "react";
import { ProfilePanel } from "./ProfilePanel";
import { GovernanceIndicators } from "./GovernanceIndicators";

// RiskRadarPanel and IndicatorDetailPopup may not exist yet — lazy-import stubs
let RiskRadarPanel: React.FC;
let IndicatorDetailPopup: React.FC<{
  indicatorKey: string;
  onClose: () => void;
  onNavigate: (tab: string, subTab?: string) => void;
}>;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  RiskRadarPanel = require("./RiskRadarPanel").RiskRadarPanel;
} catch {
  RiskRadarPanel = () => null;
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  IndicatorDetailPopup = require("./IndicatorDetailPopup").IndicatorDetailPopup;
} catch {
  IndicatorDetailPopup = () => null;
}

interface PresidentialDashboardProps {
  onNavigate: (tab: string, subTab?: string) => void;
  pulsingIndicators?: string[];
}

export function PresidentialDashboard({
  onNavigate,
  pulsingIndicators,
}: PresidentialDashboardProps) {
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(
    null,
  );

  return (
    <div
      className="relative border-b"
      style={{
        backgroundColor: "#0a1f14",
        borderColor: "rgba(212,175,55,0.3)",
      }}
    >
      {/* Compact two-row layout: Profile row + Indicators row */}
      <div className="flex flex-col">
        {/* Row 1: Profile info */}
        <ProfilePanel />

        {/* Row 2: Governance indicators grid */}
        <div className="px-3 pb-2">
          <GovernanceIndicators
            onNavigate={onNavigate}
            onShowDetail={setSelectedIndicator}
            pulsingIndicators={pulsingIndicators}
          />
        </div>

        {/* Risk radar (if available) */}
        <RiskRadarPanel />
      </div>

      {/* Indicator detail popup */}
      {selectedIndicator && (
        <IndicatorDetailPopup
          indicatorKey={selectedIndicator}
          onClose={() => setSelectedIndicator(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
