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
      className="relative border-b border-gray-200"
      style={{
        backgroundColor: "#faf8f5",
      }}
    >
      {/* Single-row layout: Profile card left + Indicators grid right */}
      <div className="flex items-start gap-3 px-3 py-2">
        {/* Profile card */}
        <div className="shrink-0">
          <ProfilePanel />
        </div>

        {/* Indicators — fills remaining space */}
        <div className="flex-1 min-w-0">
          <GovernanceIndicators
            onNavigate={onNavigate}
            onShowDetail={setSelectedIndicator}
            pulsingIndicators={pulsingIndicators}
          />
        </div>
      </div>

      {/* Risk radar (if available) */}
      <RiskRadarPanel />

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
