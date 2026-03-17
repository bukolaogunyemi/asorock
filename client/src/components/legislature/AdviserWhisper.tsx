import { useState } from "react";
import { useGame } from "@/lib/GameContext";
import { generateAdviserComment, type AdviserContext } from "@/lib/legislativeAdviser";
import { LEGISLATIVE_ADVISER } from "@/lib/handcraftedCharacters";
import { CharacterAvatar } from "../CharacterAvatar";

interface AdviserWhisperProps {
  context: AdviserContext;
  onCharacterClick?: (characterKey: string) => void;
}

export function AdviserWhisper({ context, onCharacterClick }: AdviserWhisperProps) {
  const { state } = useGame();
  const [collapsed, setCollapsed] = useState(false);

  const comment = generateAdviserComment(state, context, LEGISLATIVE_ADVISER.competence);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="w-full px-4 py-1.5 border-t border-gray-200 bg-[#d4af37]/5 flex items-center gap-2 hover:bg-[#d4af37]/10 transition-colors"
      >
        <span className="text-[10px] text-[#d4af37] font-medium">Legislative Adviser</span>
        <span className="text-gray-400 text-xs">▲</span>
      </button>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-[#d4af37]/5 px-4 py-2">
      <div className="flex items-start gap-2">
        <button
          onClick={() => onCharacterClick?.(LEGISLATIVE_ADVISER.name)}
          className="shrink-0"
        >
          <CharacterAvatar
            name={LEGISLATIVE_ADVISER.name}
            initials={LEGISLATIVE_ADVISER.avatar}
            size="sm"
            gender={LEGISLATIVE_ADVISER.gender}
            role="Legislative Adviser"
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onCharacterClick?.(LEGISLATIVE_ADVISER.name)}
              className="text-[10px] font-semibold text-[#0a1f14] hover:underline"
            >
              {LEGISLATIVE_ADVISER.name}
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="text-gray-400 text-xs hover:text-gray-600"
            >
              ▼
            </button>
          </div>
          <p className="text-[11px] text-gray-700 italic mt-0.5 leading-relaxed">
            "{comment}"
          </p>
        </div>
      </div>
    </div>
  );
}
