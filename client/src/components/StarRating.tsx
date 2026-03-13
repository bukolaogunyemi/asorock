import { Star, StarHalf } from "lucide-react";

export function StarRating({ value, label }: { value: number; label: string }) {
  const stars = (value / 100) * 5;
  const full = Math.floor(stars);
  const hasHalf = stars - full >= 0.25 && stars - full < 0.75;
  const adjustedFull = stars - full >= 0.75 ? full + 1 : full;
  const empty = 5 - adjustedFull - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: adjustedFull }).map((_, i) => (
          <Star key={`f-${i}`} className="h-3 w-3 fill-amber-400 text-amber-400" />
        ))}
        {hasHalf && <StarHalf className="h-3 w-3 fill-amber-400 text-amber-400" />}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e-${i}`} className="h-3 w-3 text-muted-foreground/30" />
        ))}
      </div>
    </div>
  );
}
