import type { GameState, SaveGameData } from "./gameTypes";

const SAVE_VERSION = 1;

export function serializeGameState(state: GameState): string {
  const payload: SaveGameData = {
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadGameState(state: GameState): void {
  const blob = new Blob([serializeGameState(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = state.presidentName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "aso-rock";
  anchor.href = url;
  anchor.download = `${safeName}-day-${state.day}.aso-rock-save.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function looksLikeGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GameState>;
  return typeof candidate.day === "number"
    && typeof candidate.date === "string"
    && typeof candidate.phase === "string"
    && typeof candidate.approval === "number"
    && Array.isArray(candidate.inboxMessages)
    && Array.isArray(candidate.activeEvents)
    && Array.isArray(candidate.turnLog);
}

export async function loadGameStateFromFile(file: File): Promise<GameState> {
  const raw = await file.text();
  const parsed = JSON.parse(raw) as Partial<SaveGameData> & { state?: unknown };
  const stateCandidate = parsed?.state;
  if (!looksLikeGameState(stateCandidate)) {
    throw new Error("Invalid save file");
  }
  return stateCandidate;
}
