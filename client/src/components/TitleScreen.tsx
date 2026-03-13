import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Landmark, Plus, FolderOpen, Settings, Info } from "lucide-react";

interface TitleScreenProps {
  onNewGame: () => void;
  onContinue?: () => void;
  hasSaveData?: boolean;
}

export default function TitleScreen({
  onNewGame,
  onContinue,
  hasSaveData = false,
}: TitleScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, hsl(153, 60%, 10%) 0%, hsl(153, 40%, 18%) 40%, hsl(42, 30%, 22%) 100%)",
      }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center space-y-8 px-4"
      >
        {/* Seal icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center"
        >
          <div
            className="h-24 w-24 rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: "hsla(42, 70%, 50%, 0.15)",
              borderColor: "hsl(42, 70%, 50%)",
            }}
          >
            <Landmark
              className="h-12 w-12"
              style={{ color: "hsl(42, 70%, 50%)" }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h1
            className="text-5xl sm:text-6xl font-bold tracking-tight"
            style={{ color: "hsl(45, 10%, 92%)" }}
          >
            ASO ROCK
          </h1>
          <p
            className="mt-2 text-sm tracking-[0.3em] uppercase"
            style={{ color: "hsl(42, 70%, 50%)" }}
          >
            A Presidential Simulation
          </p>
        </motion.div>

        {/* Menu buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto"
        >
          <Button
            size="lg"
            className="w-full text-base font-semibold"
            style={{
              backgroundColor: "hsl(153, 60%, 28%)",
              color: "white",
            }}
            onClick={onNewGame}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Game
          </Button>

          {hasSaveData && onContinue && (
            <Button
              size="lg"
              variant="outline"
              className="w-full text-base border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
              onClick={onContinue}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Continue
            </Button>
          )}

          <div className="flex gap-3 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white/80 hover:bg-white/5"
              disabled
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white/80 hover:bg-white/5"
              disabled
            >
              <Info className="h-4 w-4 mr-1" />
              Credits
            </Button>
          </div>
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="text-xs"
          style={{ color: "hsla(45, 10%, 90%, 0.3)" }}
        >
          v0.1.0 — Prototype
        </motion.p>
      </motion.div>
    </div>
  );
}
