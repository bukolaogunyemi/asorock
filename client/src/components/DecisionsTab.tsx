import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/lib/GameContext";
import { quickActionDefinitions } from "@/lib/gameContent";
import { getChainById } from "@/lib/eventChains";
import { Info, Link2, ChevronLeft, ChevronRight, Zap } from "lucide-react";

const severityBadge = (severity: string) => {
  if (severity === "critical") return "destructive" as const;
  if (severity === "warning") return "outline" as const;
  return "secondary" as const;
};

const severityBorderClass = (severity: string) => {
  if (severity === "critical") return "border-l-4 border-l-red-500";
  if (severity === "warning") return "border-l-4 border-l-amber-500";
  return "border-l-4 border-l-blue-500";
};

const chainCategoryBadge = (category: string) => {
  if (category === "crisis") return "destructive" as const;
  if (category === "opportunity") return "default" as const;
  if (category === "intrigue") return "secondary" as const;
  return "outline" as const;
};

const formatRequirements = (requirements?: { metric: string; min?: number; max?: number }[]) => {
  if (!requirements?.length) return null;
  return requirements.map((requirement) => {
    if (requirement.min !== undefined) return `${requirement.metric} >= ${requirement.min}`;
    if (requirement.max !== undefined) return `${requirement.metric} <= ${requirement.max}`;
    return requirement.metric;
  }).join(" • ");
};

export default function DecisionsTab() {
  const { toast } = useToast();
  const {
    state,
    canResolveChoice,
    executeQuickAction,
    resolveChainChoice,
    resolveEventChoice,
  } = useGame();
  const [chainIndex, setChainIndex] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);

  const activeChains = useMemo(() => state.activeChains
    .filter((instance) => !instance.resolved)
    .map((instance) => {
      const chain = getChainById(instance.chainId);
      if (!chain) return null;
      const currentStep = chain.steps[instance.currentStepIndex] ?? chain.steps[0];
      return { instance, chain, currentStep, totalSteps: chain.steps.length };
    })
    .filter(Boolean), [state.activeChains]) as {
      instance: { chainId: string; currentStepIndex: number; startedDay: number; resolved: boolean };
      chain: NonNullable<ReturnType<typeof getChainById>>;
      currentStep: NonNullable<ReturnType<typeof getChainById>>["steps"][number];
      totalSteps: number;
    }[];

  const activeEvents = state.activeEvents;

  return (
    <div className="space-y-4">
      {activeChains.length > 0 && (
        <Card className="border border-border" data-testid="active-event-chains-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Active Event Chains
              <Badge variant="secondary" className="text-xs ml-auto">{activeChains.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" disabled={chainIndex === 0} onClick={() => setChainIndex((value) => value - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                {(() => {
                  const current = activeChains[Math.min(chainIndex, activeChains.length - 1)];
                  if (!current) return null;
                  return (
                    <Card className="border border-border border-l-4 border-l-amber-500">
                      <CardHeader className="p-3 pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={chainCategoryBadge(current.chain.category)} className="text-xs">{current.chain.category}</Badge>
                          <CardTitle className="text-sm font-semibold">{current.chain.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: current.totalSteps }, (_, index) => (
                            <div key={index} className={`h-1.5 flex-1 rounded-full ${index < current.instance.currentStepIndex ? "bg-green-500" : index === current.instance.currentStepIndex ? "bg-amber-500" : "bg-muted"}`} />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1 tabular-nums">{current.instance.currentStepIndex + 1}/{current.totalSteps}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-1 space-y-3">
                        <p className="text-xs text-muted-foreground">{current.currentStep.narrative}</p>
                        <div className="flex flex-col gap-1.5">
                          {current.currentStep.choices.map((choice, choiceIndex) => {
                            const enabled = canResolveChoice(choice.requirements);
                            return (
                              <div key={`${current.instance.chainId}-${choiceIndex}`} className="space-y-1">
                                <Button
                                  data-testid={`chain-${current.instance.chainId}-choice-${choiceIndex}`}
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-xs"
                                  disabled={!enabled}
                                  onClick={() => {
                                    resolveChainChoice(current.instance.chainId, choiceIndex);
                                    toast({ title: current.chain.title, description: `${choice.label} recorded.` });
                                  }}
                                >
                                  {choice.label}
                                </Button>
                                {!enabled && choice.requirements && (
                                  <p className="text-[11px] text-muted-foreground">Requires {formatRequirements(choice.requirements)}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" disabled={chainIndex >= activeChains.length - 1} onClick={() => setChainIndex((value) => value + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border" data-testid="decisions-active-events">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Active Files Requiring a Decision</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {activeEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground">The desk is clear for now. Use strategic directives or proceed to the next day.</p>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" disabled={eventIndex === 0} onClick={() => setEventIndex((value) => value - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                {(() => {
                  const event = activeEvents[Math.min(eventIndex, activeEvents.length - 1)];
                  if (!event) return null;
                  return (
                    <Card className={`border border-border ${severityBorderClass(event.severity)}`} data-testid={`decision-event-${event.id}`}>
                      <CardHeader className="p-3 pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={severityBadge(event.severity)} className="text-xs">{event.severity}</Badge>
                          <Badge variant="outline" className="text-xs">{event.category}</Badge>
                          <CardTitle className="text-sm font-semibold">{event.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-1 space-y-3">
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <div className="flex flex-col gap-1.5">
                          {event.choices.map((choice, choiceIndex) => {
                            const enabled = canResolveChoice(choice.requirements);
                            return (
                              <div key={`${event.id}-${choiceIndex}`} className="space-y-1">
                                <Button
                                  data-testid={`decision-event-${event.id}-choice-${choiceIndex}`}
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-xs"
                                  disabled={!enabled}
                                  onClick={() => {
                                    resolveEventChoice(event.id, choiceIndex);
                                    toast({ title: choice.label, description: `${event.title} has been updated.` });
                                  }}
                                >
                                  {choice.label}
                                </Button>
                                <p className="text-[11px] text-muted-foreground">{choice.context}</p>
                                {!enabled && choice.requirements && (
                                  <p className="text-[11px] text-muted-foreground">Requires {formatRequirements(choice.requirements)}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" disabled={eventIndex >= activeEvents.length - 1} onClick={() => setEventIndex((value) => value + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert className="py-3 px-4">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-xs font-medium">Turn Loop</AlertTitle>
        <AlertDescription className="text-xs">
          Resolve critical files first, use directives to shape the board, then proceed to process delayed consequences, random pressure, court movement, and faction drift.
        </AlertDescription>
      </Alert>

      <Card className="border border-border" data-testid="strategic-directives-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" /> Strategic Directives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {quickActionDefinitions.map((action) => {
            const lastUsedDay = state.lastActionAtDay[action.id];
            const coolingDown = lastUsedDay !== undefined && state.day - lastUsedDay < 2;
            return (
              <Card key={action.id} className="border border-border">
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{action.label}</p>
                      {coolingDown && <Badge variant="secondary" className="text-[11px]">Cooling down</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{action.summary}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={coolingDown}
                    onClick={() => {
                      executeQuickAction(action.id);
                      toast({ title: action.label, description: action.context });
                    }}
                  >
                    Issue Directive
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}







