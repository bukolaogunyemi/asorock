import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { loadGameStateFromFile, downloadGameState } from "@/lib/gamePersistence";
import { useGame } from "@/lib/GameContext";
import {
  Sun,
  Moon,
  Upload,
  Download,
} from "lucide-react";

interface TopBarProps {
  dark: boolean;
  toggleDark: () => void;
}

export default function TopBar({ dark, toggleDark }: TopBarProps) {
  const { toast } = useToast();
  const { state, loadGameState } = useGame();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isPlaying = state.phase === "playing" || state.phase === "victory" || state.phase === "defeat";

  const handleExport = () => {
    if (!isPlaying) {
      toast({ title: "No active presidency", description: "Start a campaign before exporting a save." });
      return;
    }
    downloadGameState(state);
    toast({ title: "Save exported", description: `Downloaded a save for ${state.date}.` });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const loadedState = await loadGameStateFromFile(file);
      loadGameState(loadedState);
      toast({ title: "Save loaded", description: `Restored the presidency at ${loadedState.date}.` });
    } catch {
      toast({ title: "Import failed", description: "That file is not a valid Aso Rock save." });
    } finally {
      event.target.value = "";
    }
  };

  return (
    <header
      className="border-b border-[rgba(212,175,55,0.2)] px-4 py-3"
      style={{ background: "linear-gradient(90deg, #0f2b1e 0%, #163822 50%, #0f2b1e 100%)" }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span
            className="text-lg font-extrabold tracking-wider"
            style={{
              background: "linear-gradient(135deg, #d4af37, #f5d060, #d4af37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ASO ROCK
          </span>
          {isPlaying && (
            <Badge className="bg-[rgba(212,175,55,0.15)] text-[#d4af37] border border-[rgba(212,175,55,0.3)] text-[10px] uppercase tracking-wider">
              Term {state.term.current}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-[rgba(212,175,55,0.3)] text-[#d4af37] bg-transparent hover:bg-[rgba(212,175,55,0.1)]"
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5" /> Export Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-[rgba(212,175,55,0.3)] text-[#d4af37] bg-transparent hover:bg-[rgba(212,175,55,0.1)]"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" /> Import Save
          </Button>
          <Button
            data-testid="dark-mode-toggle"
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="text-[#8a9a7a] hover:text-[#d4af37] hover:bg-[rgba(212,175,55,0.1)]"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
