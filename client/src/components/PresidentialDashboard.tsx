import { useState } from "react";
import { ProfilePanel } from "./ProfilePanel";
import { GovernanceIndicators } from "./GovernanceIndicators";
import { CollapsedDashboard } from "./CollapsedDashboard";

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
  RiskRadarPanel = () => <div className="w-[250px]" />;
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
  const [expanded, setExpanded] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(
    null,
  );

  return (
    <div
      className="relative border-b transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: "#0a1f14",
        borderColor: "rgba(212,175,55,0.3)",
      }}
    >
      {expanded ? (
        <>
          {/* Collapse toggle */}
          <button
            className="absolute right-3 top-2 z-10 text-xs opacity-60 hover:opacity-100"
            style={{ color: "#d4af37" }}
            onClick={() => setExpanded(false)}
            aria-label="Collapse dashboard"
          >
            &#9660;
          </button>

          {/* Three-panel layout */}
          <div className="flex">
            <div className="w-[230px] shrink-0">
              <ProfilePanel />
            </div>
            <div className="min-w-0 flex-1">
              <GovernanceIndicators
                onNavigate={onNavigate}
                onShowDetail={setSelectedIndicator}
                pulsingIndicators={pulsingIndicators}
              />
            </div>
            <div className="w-[250px] shrink-0">
              <RiskRadarPanel />
            </div>
          </div>
        </>
      ) : (
        <CollapsedDashboard onExpand={() => setExpanded(true)} />
      )}

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
