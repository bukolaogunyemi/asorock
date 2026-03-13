import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function TrendIcon({ direction }: { direction: "up" | "down" | "stable" }) {
  if (direction === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (direction === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function TrendIconInverse({ direction }: { direction: "up" | "down" | "stable" }) {
  if (direction === "up") return <TrendingUp className="h-3.5 w-3.5 text-destructive" />;
  if (direction === "down") return <TrendingDown className="h-3.5 w-3.5 text-amber-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}
