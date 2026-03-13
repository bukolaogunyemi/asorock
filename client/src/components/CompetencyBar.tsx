// Color-coded horizontal mini-bar replacement for stars
// 90+ = Expert (green), 70-89 = Excellent (blue), 50-69 = Good (gold), 30-49 = Fair (amber), <30 = Weak (red)

function getBarColor(value: number): string {
  if (value >= 90) return "bg-emerald-500";
  if (value >= 70) return "bg-blue-500";
  if (value >= 50) return "bg-[hsl(42,70%,50%)]";
  if (value >= 30) return "bg-amber-500";
  return "bg-red-500";
}

function getBarLabel(value: number): string {
  if (value >= 90) return "Expert";
  if (value >= 70) return "Excellent";
  if (value >= 50) return "Good";
  if (value >= 30) return "Fair";
  return "Weak";
}

/** Replaces StarRating — shows a color-coded horizontal mini-bar with value 0–100 */
export function CompetencyBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground w-20 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden min-w-[60px] max-w-[100px]">
        <div
          className={`h-full rounded-full transition-all ${getBarColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums w-6 text-right">{clamped}</span>
    </div>
  );
}

/** Replaces CompetencyStars in onboarding — shows a 1-5 scale as mini-bar (scaled to 0-100) */
export function CompetencyBarSmall({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getBarColor(pct)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums w-3 text-right">{value}</span>
      </div>
    </div>
  );
}

/** Loyalty/sentiment on scale of 5 — shows discrete pips */
export function SentimentIndicator({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i <= clamped
                ? clamped >= 4
                  ? "bg-emerald-500"
                  : clamped >= 3
                  ? "bg-[hsl(42,70%,50%)]"
                  : "bg-red-500"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
