// client/src/components/ProfileBreadcrumbNav.tsx
import { ChevronRight } from "lucide-react";
import { useProfileNavigation } from "@/lib/ProfileNavigationContext";

export function ProfileBreadcrumbNav() {
  const { stack, popToIndex } = useProfileNavigation();
  if (stack.length === 0) return null;

  const firstEntry = stack[0];

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-3 flex-wrap">
      {/* Source tab — clicking returns to the tab */}
      <button
        onClick={() => popToIndex(0)}
        className="hover:text-foreground transition-colors font-medium"
      >
        {firstEntry.sourceLabel}
      </button>

      {/* Each profile in the stack */}
      {stack.map((crumb, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {index === stack.length - 1 ? (
            <span className="text-foreground font-semibold">{crumb.label}</span>
          ) : (
            <button
              onClick={() => popToIndex(index + 1)}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  );
}
