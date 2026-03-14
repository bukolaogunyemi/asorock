import { ChevronRight } from "lucide-react";

interface SubTabDef {
  id: string;
  label: string;
}

interface BreadcrumbNavProps {
  hubName: string;
  activeSubTab: string;
  subTabs: SubTabDef[];
  onSelectSubTab: (id: string) => void;
  onBackToHub: () => void;
}

export default function BreadcrumbNav({ hubName, activeSubTab, subTabs, onSelectSubTab, onBackToHub }: BreadcrumbNavProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
      <div className="flex items-center gap-1 text-sm">
        <button onClick={onBackToHub} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
          {hubName}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-foreground font-semibold">
          {subTabs.find((t) => t.id === activeSubTab)?.label ?? activeSubTab}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectSubTab(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              tab.id === activeSubTab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
