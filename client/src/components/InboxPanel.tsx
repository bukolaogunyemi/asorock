import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/lib/GameContext";
import type { GameInboxMessage } from "@/lib/gameTypes";

const replyOptions = [
  { label: "Terrible", actionId: "reply-terrible" },
  { label: "Poor", actionId: "reply-poor" },
  { label: "Good", actionId: "reply-good" },
  { label: "Excellent", actionId: "reply-excellent" },
] as const;

const priorityBadge = (priority: string) => {
  if (priority === "Critical") return "destructive" as const;
  if (priority === "Urgent") return "outline" as const;
  return "secondary" as const;
};

interface InboxPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: GameInboxMessage[];
}

export default function InboxPanel({ open, onOpenChange, messages }: InboxPanelProps) {
  const { toast } = useToast();
  const { markMessageRead, handleInboxAction } = useGame();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = messages.filter((message) => !message.read).length;

  const expandMessage = (message: GameInboxMessage) => {
    setExpandedId((current) => current === message.id ? null : message.id);
    if (!message.read) {
      markMessageRead(message.id);
    }
  };

  const performAction = (message: GameInboxMessage, actionId: string, title: string, description: string) => {
    handleInboxAction(message.id, actionId);
    toast({ title, description });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
        <SheetHeader className="p-4 pb-2 border-b border-border">
          <SheetTitle className="text-sm font-semibold">
            Presidential Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">{unreadCount} unread</Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="p-3 space-y-2">
          {messages.map((message) => {
            const isExpanded = expandedId === message.id;
            return (
              <Card
                key={message.id}
                className={`border border-border cursor-pointer transition-colors ${message.read ? "" : "bg-muted/40"}`}
                data-testid={`inbox-msg-${message.id}`}
                onClick={() => expandMessage(message)}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    {!message.read && <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    <CharacterAvatar name={message.sender} initials={message.initials} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate">{message.sender}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge variant={priorityBadge(message.priority)} className="text-xs">{message.priority}</Badge>
                          <span className="text-xs text-muted-foreground tabular-nums">Day {message.day}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{message.role}</p>
                      <p className="text-xs font-medium mt-1">{message.subject}</p>
                      {!isExpanded && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{message.preview}</p>}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 pt-1">
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{message.fullText}</p>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">Response quality</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {replyOptions.map((option) => (
                            <Button
                              key={option.actionId}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={(event) => {
                                event.stopPropagation();
                                performAction(message, option.actionId, `${option.label} reply sent`, `${message.sender} has been answered.`);
                              }}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={(event) => {
                              event.stopPropagation();
                              performAction(message, "forward", "Forwarded", `${message.subject} was delegated to the relevant team.`);
                            }}
                          >
                            Forward to Minister
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground"
                            onClick={(event) => {
                              event.stopPropagation();
                              performAction(message, "ignore", "Ignored", `${message.subject} was left to sit for now.`);
                            }}
                          >
                            Ignore
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export type { GameInboxMessage as InboxMessage };
