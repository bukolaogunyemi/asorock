import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/GameContext";
import { victoryPaths, failureStates } from "@/lib/victorySystem";
import { motion } from "framer-motion";
import { Trophy, Skull } from "lucide-react";

export default function VictoryDefeatOverlay() {
  const { state, resetGame } = useGame();

  const isVictory = state.phase === "victory";

  const victoryPath = isVictory
    ? victoryPaths.find((p) => p.id === state.victoryPath)
    : null;
  const failState = !isVictory
    ? failureStates.find((f) => f.id === state.defeatState)
    : null;

  const title = isVictory
    ? victoryPath?.name ?? "Victory"
    : failState?.name ?? "Defeat";
  const description = isVictory
    ? victoryPath?.description ?? "You have achieved victory."
    : failState?.description ?? "Your presidency has ended.";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center space-y-6 max-w-lg"
      >
        {/* Icon */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex justify-center"
        >
          {isVictory ? (
            <div className="h-20 w-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(42, 70%, 50%)" }}>
              <Trophy className="h-10 w-10 text-black" />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(0, 60%, 50%)" }}>
              <Skull className="h-10 w-10 text-white" />
            </div>
          )}
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h1
            className="text-xl font-bold"
            style={{
              color: isVictory ? "hsl(153, 60%, 32%)" : "hsl(0, 60%, 50%)",
            }}
          >
            {isVictory ? "VICTORY" : "DEFEAT"}
          </h1>
          <h2 className="text-lg font-semibold mt-2">{title}</h2>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-sm text-muted-foreground"
        >
          {description}
        </motion.p>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="grid grid-cols-2 gap-3 text-left"
        >
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Days in Office</p>
            <p className="text-lg font-semibold tabular-nums">{state.day}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Final Approval</p>
            <p className="text-lg font-semibold tabular-nums">{state.approval}%</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Treasury</p>
            <p className="text-lg font-semibold tabular-nums">₦{state.treasury}T</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Stability</p>
            <p className="text-lg font-semibold tabular-nums">{state.stability}</p>
          </div>
        </motion.div>

        {/* Play Again */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <Button
            data-testid="play-again-btn"
            size="lg"
            className="w-full"
            onClick={resetGame}
            style={{
              backgroundColor: isVictory
                ? "hsl(153, 60%, 32%)"
                : "hsl(0, 60%, 50%)",
            }}
          >
            Play Again
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
