import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/lib/GameContext";
import { categoryResponses, actionDescriptions } from "@/lib/inboxResponses";
import type { GameInboxMessage } from "@/lib/gameTypes";

const priorityBadge = (priority: string) => {
  if (priority === "Critical") return "destructive" as const;
  if (priority === "Urgent") return "outline" as const;
  return "secondary" as const;
};

const loyaltyColor = (loyalty: number): string => {
  if (loyalty > 65) return "#16a34a";
  if (loyalty >= 40) return "#ca8a04";
  return "#ef4444";
};

const loyaltyLabel = (loyalty: number): string => {
  if (loyalty > 80) return "Devoted";
  if (loyalty > 65) return "Reliable";
  if (loyalty >= 40) return "Uncertain";
  return "Hostile";
};

const metricColor: Record<string, string> = {
  green: "#16a34a",
  yellow: "#ca8a04",
  red: "#ef4444",
};

function formatShortDate(date?: string): string {
  if (!date) return "";
  // "Monday, 29 May, 2023" -> "Mon, 29 May, 2023"
  const parts = date.split(", ");
  if (parts.length >= 2) {
    return parts[0].slice(0, 3) + ", " + parts.slice(1).join(", ");
  }
  return date;
}

/* --- Message List Item --- */
function MessageRow({
  message,
  isSelected,
  onClick,
}: {
  message: GameInboxMessage;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isResponded = !!message.respondedAction;
  const isUnread = !message.read;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3.5 py-2.5 border-b border-[#f0ece4] transition-colors ${
        isSelected
          ? "bg-[rgba(212,175,55,0.06)] border-l-[3px] border-l-[#d4af37]"
          : "border-l-[3px] border-l-transparent hover:bg-[#f8f6f2]"
      } ${isResponded ? "opacity-50" : isUnread ? "" : "opacity-65"}`}
    >
      {/* Row 1: Name (Role) + priority/checkmark */}
      <div className="flex items-baseline justify-between mb-0.5">
        <div className="flex items-baseline gap-1.5 min-w-0">
          {isUnread && !isSelected && (
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 relative top-[1px]" />
          )}
          <span className={`text-xs truncate ${isUnread ? "font-bold text-[#0a1f14]" : "font-semibold text-[#4a5a4e]"}`}>
            {message.sender}{" "}
            <span className="font-normal text-[#6b7c6f]">({message.role})</span>
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {isResponded ? (
            <span className="text-[#22c55e] text-[10px]">&#10003;</span>
          ) : (
            <Badge variant={priorityBadge(message.priority)} className="text-[9px] px-1.5 py-0">
              {message.priority}
            </Badge>
          )}
        </div>
      </div>
      {/* Row 2: Subject + date */}
      <div className="flex items-baseline justify-between">
        <span className={`text-[11px] truncate ${isUnread ? "font-semibold text-[#1a3f2a]" : "text-[#6b7c6f]"}`}>
          {message.subject}
        </span>
        <span className="text-[9px] text-[#8a9a8e] flex-shrink-0 ml-2">
          {formatShortDate(message.date)}
        </span>
      </div>
    </button>
  );
}

/* --- Intelligence Context Box --- */
function IntelligenceContext({ contextData }: { contextData: NonNullable<GameInboxMessage["contextData"]> }) {
  const cells: { label: string; value: string; color: string }[] = [];

  if (contextData.senderLoyalty !== undefined) {
    const loyalty = contextData.senderLoyalty;
    cells.push({ label: "Sender Loyalty", value: `${loyalty}% — ${loyaltyLabel(loyalty)}`, color: loyaltyColor(loyalty) });
  }
  if (contextData.relatedEventTitle) {
    cells.push({ label: "Related Event", value: contextData.relatedEventTitle, color: "#1a3f2a" });
  }
  if (contextData.relevantMetrics) {
    for (const m of contextData.relevantMetrics) {
      cells.push({ label: m.label, value: m.value, color: metricColor[m.color] ?? "#1a3f2a" });
    }
  }
  if (contextData.factionName) {
    cells.push({ label: "Faction Alignment", value: contextData.factionName, color: "#1a3f2a" });
  }

  if (cells.length === 0) return null;

  return (
    <div className="bg-[rgba(212,175,55,0.06)] border border-[rgba(212,175,55,0.2)] rounded-lg p-3.5 mb-5">
      <div className="text-[11px] font-bold uppercase tracking-wide text-[#b8962e] mb-2.5">
        Intelligence Context
      </div>
      <div className={`grid gap-2.5 ${cells.length <= 2 ? "grid-cols-1" : "grid-cols-2"}`}>
        {cells.map((cell) => (
          <div key={cell.label}>
            <span className="text-[10px] text-[#8a9a8e]">{cell.label}</span>
            <div className="text-xs font-semibold" style={{ color: cell.color }}>
              {cell.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- Dossier Panel --- */
function DossierPanel({
  message,
  onAction,
}: {
  message: GameInboxMessage;
  onAction: (actionId: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isResponded = !!message.respondedAction;
  const responseOptions = message.responseOptions ?? categoryResponses[message.source] ?? categoryResponses.random;

  // Scroll to top when message changes
  useEffect(() => {
    panelRef.current?.scrollTo(0, 0);
  }, [message.id]);

  return (
    <div ref={panelRef} className="flex-1 overflow-y-auto bg-[#faf8f5]">
      {/* Memo Header */}
      <div className="px-6 py-5 border-b border-[#e5e0d8] bg-white">
        <div className="flex items-center gap-3 mb-3">
          <CharacterAvatar name={message.sender} initials={message.initials} size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-[#0a1f14]">{message.sender}</div>
            <div className="text-[11px] text-[#6b7c6f]">
              {message.role} · {message.date ?? ""}
            </div>
          </div>
          <Badge variant={priorityBadge(message.priority)} className="text-[10px] flex-shrink-0">
            {message.priority}
          </Badge>
        </div>
        <div className="text-base font-bold text-[#0a1f14]">{message.subject}</div>
      </div>

      {/* Body + Intelligence + Response */}
      <div className="px-6 py-5">
        {/* Message body */}
        <div className="text-[13px] leading-[1.7] text-[#2a3a2e] whitespace-pre-line mb-5">
          {message.fullText}
        </div>

        {/* Intelligence Context */}
        {message.contextData && <IntelligenceContext contextData={message.contextData} />}

        {/* Response section */}
        {isResponded ? (
          /* Sent reply block */
          <div className="bg-[#f0ece4] border border-[#e5e0d8] rounded-lg p-3.5 mb-4">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[#6b7c6f] mb-1">
              Your Response
            </div>
            <div className="text-sm font-semibold text-[#1a3f2a]">
              {message.respondedLabel}
            </div>
          </div>
        ) : (
          /* Response options grid */
          <div className="mb-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7c6f] mb-2.5">
              Presidential Response
            </div>
            <div className="grid grid-cols-2 gap-2">
              {responseOptions.map((option) => (
                <Button
                  key={option.actionId}
                  variant="outline"
                  className="h-auto py-2.5 px-3.5 text-left justify-start flex-col items-start bg-white border-[#d4d0c8] hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.04)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(option.actionId);
                  }}
                >
                  <span className="text-xs font-semibold text-[#1a3f2a]">{option.label}</span>
                  {actionDescriptions[option.actionId] && (
                    <span className="text-[10px] text-[#8a9a8e] mt-0.5">
                      {actionDescriptions[option.actionId]}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Forward / Ignore -- only before responding */}
        {!isResponded && (
          <div className="flex gap-2 pt-2.5 border-t border-[#e5e0d8]">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs text-[#6b7c6f] border-[#d4d0c8]"
              onClick={(e) => {
                e.stopPropagation();
                onAction("forward");
              }}
            >
              Forward to Minister
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[#8a9a8e]"
              onClick={(e) => {
                e.stopPropagation();
                onAction("ignore");
              }}
            >
              Ignore
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Main Component --- */
export default function InboxTab() {
  const { toast } = useToast();
  const { state, markMessageRead, handleInboxAction } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const messages = [...state.inboxMessages].sort((a, b) => b.day - a.day);
  const unreadCount = messages.filter((m) => !m.read).length;
  const selectedMessage = messages.find((m) => m.id === selectedId) ?? null;

  const selectMessage = (message: GameInboxMessage) => {
    setSelectedId(message.id);
    if (!message.read) {
      markMessageRead(message.id);
    }
  };

  const performAction = (message: GameInboxMessage, actionId: string) => {
    handleInboxAction(message.id, actionId);
    const label = (message.responseOptions ?? categoryResponses[message.source] ?? [])
      .find((o) => o.actionId === actionId)?.label ?? actionId;
    toast({ title: `${label} response sent`, description: `${message.sender} has been answered.` });
  };

  return (
    <div className="flex h-full">
      {/* Left: Message List */}
      <div className="w-[35%] min-w-[280px] max-w-[380px] border-r border-[#e5e0d8] bg-white flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#e5e0d8] flex-shrink-0">
          <span className="text-sm font-bold text-[#0a1f14]">Correspondence</span>
          {unreadCount > 0 && (
            <span className="bg-[#d4af37] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        {/* Messages */}
        {messages.length === 0 ? (
          <p className="text-sm text-[#8a9a8e] py-12 text-center">No correspondence yet.</p>
        ) : (
          messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              isSelected={selectedId === message.id}
              onClick={() => selectMessage(message)}
            />
          ))
        )}
      </div>

      {/* Right: Dossier */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedMessage ? (
          <DossierPanel
            message={selectedMessage}
            onAction={(actionId) => performAction(selectedMessage, actionId)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#faf8f5]">
            <p className="text-sm text-[#8a9a8e]">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
