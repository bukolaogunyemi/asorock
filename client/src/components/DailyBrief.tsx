import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/lib/GameContext";
import { motion } from "framer-motion";
import {
  Sun,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  X,
} from "lucide-react";

interface DailyBriefProps {
  onDismiss: () => void;
}

function TrendIcon({ value, prev }: { value: number; prev: number }) {
  if (value > prev) return <TrendingUp className="h-3.5 w-3.5 text-green-600" />;
  if (value < prev) return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function DailyBrief({ onDismiss }: DailyBriefProps) {
  const { state } = useGame();

  // Derive critical flags from current state
  const criticalFlags: { label: string; severity: "warning" | "danger" }[] = [];

  if (state.approval < 25)
    criticalFlags.push({ label: `Approval critical at ${state.approval}%`, severity: "danger" });
  else if (state.approval < 35)
    criticalFlags.push({ label: `Approval low at ${state.approval}%`, severity: "warning" });

  if (state.stability < 30)
    criticalFlags.push({ label: `Stability crisis: ${state.stability}`, severity: "danger" });

  if (state.stress > 80)
    criticalFlags.push({ label: `Presidential stress at ${state.stress}%`, severity: "warning" });

  if (state.treasury < 0.5)
    criticalFlags.push({ label: `Treasury dangerously low: ₦${state.treasury}T`, severity: "danger" });

  if (state.politicalCapital < 15)
    criticalFlags.push({ label: `Political capital depleted: ${state.politicalCapital}`, severity: "warning" });

  // Pull recent turn log entries as "overnight developments"
  const recentEvents = state.turnLog.slice(-3);

  const metrics = [
    { label: "Approval", value: `${state.approval}%`, raw: state.approval, threshold: 35 },
    { label: "Treasury", value: `₦${state.treasury}T`, raw: state.treasury, threshold: 0.8 },
    { label: "Stability", value: `${state.stability}`, raw: state.stability, threshold: 40 },
    { label: "Political Capital", value: `${state.politicalCapital}`, raw: state.politicalCapital, threshold: 20 },
    { label: "Public Trust", value: `${state.trust}%`, raw: state.trust, threshold: 30 },
    { label: "Outrage", value: `${state.outrage}%`, raw: state.outrage, threshold: 70 },
    { label: "Stress", value: `${state.stress}%`, raw: state.stress, threshold: 75 },
    { label: "Health", value: `${state.health}%`, raw: state.health, threshold: 50 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-background border rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "hsl(42, 70%, 50%)" }}
            >
              <Sun className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Daily Brief</h2>
              <p className="text-xs text-muted-foreground">
                {state.date}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Critical Flags */}
          {criticalFlags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Critical Flags
              </h3>
              <div className="flex flex-wrap gap-2">
                {criticalFlags.map((flag, i) => (
                  <Badge
                    key={i}
                    variant={flag.severity === "danger" ? "destructive" : "outline"}
                    className={
                      flag.severity === "warning"
                        ? "border-amber-500 text-amber-700 dark:text-amber-400"
                        : ""
                    }
                  >
                    {flag.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div>
            <h3 className="text-sm font-semibold mb-2">State of the Nation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {metrics.map((m) => {
                const isLow = m.label === "Outrage" || m.label === "Stress"
                  ? m.raw > m.threshold
                  : m.raw < m.threshold;
                return (
                  <Card key={m.label} className={isLow ? "border-red-300 dark:border-red-800" : ""}>
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className={`text-lg font-bold tabular-nums ${isLow ? "text-red-600 dark:text-red-400" : ""}`}>
                        {m.value}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Overnight Developments */}
          {recentEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Overnight Developments</h3>
              <div className="space-y-1.5">
                {recentEvents.map((entry, i) => (
                  <div
                    key={i}
                    className="text-sm text-muted-foreground pl-3 border-l-2 border-muted"
                  >
                    {entry.event}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Crises count */}
          {state.activeChains.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {state.activeChains.length} active event chain{state.activeChains.length > 1 ? "s" : ""} in progress.
            </p>
          )}

          {/* Dismiss */}
          <Button
            className="w-full"
            onClick={onDismiss}
            style={{ backgroundColor: "hsl(153, 60%, 28%)" }}
          >
            Begin Day {state.day}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
