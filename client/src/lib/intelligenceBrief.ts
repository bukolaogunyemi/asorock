import type { GameState, IntelligenceBriefData, BriefItem } from "./gameTypes";

const FLOAT_THRESHOLD = 0.01;

interface MetricDef {
  key: keyof GameState;
  label: string;
}

const TRACKED_METRICS: MetricDef[] = [
  { key: "approval", label: "Approval" },
  { key: "stability", label: "Stability" },
  { key: "treasury", label: "Treasury" },
  { key: "politicalCapital", label: "Political Capital" },
  { key: "stress", label: "Stress" },
  { key: "trust", label: "Trust" },
  { key: "outrage", label: "Outrage" },
  { key: "health", label: "Health" },
];

function computeMetricChanges(
  prev: GameState,
  next: GameState
): { label: string; from: number; to: number }[] {
  const changes: { label: string; from: number; to: number }[] = [];
  for (const { key, label } of TRACKED_METRICS) {
    const from = prev[key] as number;
    const to = next[key] as number;
    if (Math.abs(to - from) > FLOAT_THRESHOLD) {
      changes.push({ label, from, to });
    }
  }
  return changes;
}

function buildExecutiveSummary(
  day: number,
  metricChanges: { label: string; from: number; to: number }[],
  newEventCount: number
): string {
  const developmentCount = metricChanges.length + newEventCount;

  // Find the most significant change for the key description
  let keyDescription = "";
  if (metricChanges.length > 0) {
    // Sort by absolute delta magnitude descending, pick the most prominent
    const sorted = [...metricChanges].sort(
      (a, b) => Math.abs(b.to - b.from) - Math.abs(a.to - a.from)
    );
    const top = sorted[0];
    const delta = Math.round(top.to - top.from);
    const direction = delta > 0 ? "rose" : "dropped";
    const absDelta = Math.abs(delta);

    if (top.label === "Approval" || top.label === "Stability") {
      keyDescription = `${top.label} ${direction} ${absDelta} point${absDelta !== 1 ? "s" : ""}`;
    } else if (top.label === "Treasury") {
      const absTreasuryDelta = Math.abs(top.to - top.from).toFixed(1);
      keyDescription = `Treasury ${direction} by ₦${absTreasuryDelta}bn`;
    } else {
      keyDescription = `${top.label} ${direction} ${absDelta} point${absDelta !== 1 ? "s" : ""}`;
    }
  } else if (newEventCount > 0) {
    keyDescription = `${newEventCount} new event${newEventCount !== 1 ? "s" : ""} require${newEventCount === 1 ? "s" : ""} attention`;
  } else {
    keyDescription = "No significant changes to report";
  }

  // Count critical matters: approval < 30, stability < 30, or any critical metric change
  const criticalCount = metricChanges.filter((m) => {
    if (m.label === "Approval" && m.to < 30) return true;
    if (m.label === "Stability" && m.to < 30) return true;
    if (m.label === "Trust" && m.to < 20) return true;
    return false;
  }).length;

  let summary = `Day ${day}: ${developmentCount} development${developmentCount !== 1 ? "s" : ""}. ${keyDescription}.`;
  if (criticalCount > 0) {
    summary += ` ${criticalCount} critical matter${criticalCount !== 1 ? "s" : ""} require attention.`;
  }

  return summary;
}

function buildPoliticalSection(prev: GameState, next: GameState): BriefItem[] {
  const items: BriefItem[] = [];

  // Faction grievance changes
  for (const [key, nextFaction] of Object.entries(next.factions)) {
    const prevFaction = prev.factions[key];
    if (!prevFaction) continue;

    const grievanceDelta = nextFaction.grievance - prevFaction.grievance;

    if (Math.abs(grievanceDelta) > FLOAT_THRESHOLD) {
      const direction = grievanceDelta > 0 ? "risen" : "fallen";
      let severity: BriefItem["severity"];

      if (nextFaction.grievance > 70 || nextFaction.loyalty < 30) {
        severity = "critical";
      } else if (nextFaction.grievance > 50) {
        severity = "warning";
      } else {
        severity = "intel";
      }

      items.push({
        severity,
        text: `${nextFaction.name}: grievance has ${direction} to ${Math.round(nextFaction.grievance)} (${grievanceDelta > 0 ? "+" : ""}${Math.round(grievanceDelta)}).`,
      });
    }
  }

  // VP mood changes
  const prevVP = prev.vicePresident;
  const nextVP = next.vicePresident;

  if (prevVP.mood !== nextVP.mood) {
    let severity: BriefItem["severity"];
    if (nextVP.loyalty < 30) {
      severity = "critical";
    } else if (nextVP.mood === "Plotting") {
      severity = "warning";
    } else {
      severity = "intel";
    }
    items.push({
      severity,
      text: `Vice President ${nextVP.name}'s mood has shifted from ${prevVP.mood} to ${nextVP.mood}.`,
    });
  } else if (nextVP.loyalty < 30) {
    items.push({
      severity: "critical",
      text: `Vice President ${nextVP.name}'s loyalty is critically low at ${nextVP.loyalty}.`,
    });
  }

  return items;
}

function buildEconomicSection(prev: GameState, next: GameState): BriefItem[] {
  const items: BriefItem[] = [];

  const prevMacro = prev.macroEconomy;
  const nextMacro = next.macroEconomy;

  const macroChecks: { key: keyof typeof nextMacro; label: string }[] = [
    { key: "inflation", label: "Inflation" },
    { key: "fxRate", label: "Exchange Rate" },
    { key: "oilOutput", label: "Oil Output" },
    { key: "reserves", label: "Reserves" },
  ];

  for (const { key, label } of macroChecks) {
    const from = prevMacro[key] as number;
    const to = nextMacro[key] as number;
    const delta = to - from;

    if (Math.abs(delta) <= FLOAT_THRESHOLD) continue;

    const direction = delta > 0 ? "increased" : "decreased";
    const absDelta = Math.abs(delta);

    let severity: BriefItem["severity"];
    if (absDelta > 10) {
      severity = "critical";
    } else if (absDelta > 5) {
      severity = "warning";
    } else if (absDelta > 2) {
      severity = "intel";
    } else {
      severity = "memo";
    }

    const formatted =
      key === "fxRate"
        ? `₦${to.toFixed(0)}/$ (${delta > 0 ? "+" : ""}${delta.toFixed(0)})`
        : key === "oilOutput"
          ? `${to.toFixed(2)}mb/d (${delta > 0 ? "+" : ""}${delta.toFixed(2)})`
          : `${to.toFixed(1)} (${delta > 0 ? "+" : ""}${delta.toFixed(1)})`;

    items.push({
      severity,
      text: `${label} has ${direction} to ${formatted}.`,
    });
  }

  // Treasury changes
  const treasuryDelta = next.treasury - prev.treasury;
  if (Math.abs(treasuryDelta) > FLOAT_THRESHOLD) {
    const direction = treasuryDelta > 0 ? "increased" : "decreased";
    const absDelta = Math.abs(treasuryDelta);

    let severity: BriefItem["severity"];
    if (absDelta > 0.5) {
      severity = "critical";
    } else if (absDelta > 0.2) {
      severity = "warning";
    } else if (absDelta > 0.05) {
      severity = "intel";
    } else {
      severity = "memo";
    }

    items.push({
      severity,
      text: `Treasury has ${direction} by ₦${absDelta.toFixed(2)}bn to ₦${next.treasury.toFixed(2)}bn.`,
    });
  }

  return items;
}

function buildSecuritySection(prev: GameState, next: GameState): BriefItem[] {
  const items: BriefItem[] = [];

  // Stability changes
  const stabilityDelta = next.stability - prev.stability;
  if (Math.abs(stabilityDelta) > FLOAT_THRESHOLD) {
    const direction = stabilityDelta > 0 ? "improved" : "deteriorated";
    const absDelta = Math.abs(stabilityDelta);

    let severity: BriefItem["severity"];
    if (stabilityDelta < -10) {
      severity = "critical";
    } else if (stabilityDelta < -5) {
      severity = "warning";
    } else {
      severity = "intel";
    }

    items.push({
      severity,
      text: `National stability has ${direction} by ${Math.round(absDelta)} point${absDelta !== 1 ? "s" : ""} to ${Math.round(next.stability)}.`,
    });
  }

  // Security-category active events
  const securityEvents = next.activeEvents.filter(
    (e) => e.category === "security"
  );
  for (const event of securityEvents) {
    const severity: BriefItem["severity"] =
      event.severity === "critical"
        ? "critical"
        : event.severity === "warning"
          ? "warning"
          : "intel";
    items.push({
      severity,
      text: event.title + (event.description ? `: ${event.description}` : ""),
      relatedEventId: event.id,
    });
  }

  return items;
}

function buildDiplomaticSection(prev: GameState, next: GameState): BriefItem[] {
  const items: BriefItem[] = [];

  // Diplomatic-category events from the turn log for the current day
  const currentDay = next.day;
  const diplomaticEntries = next.turnLog.filter(
    (entry) => entry.day === currentDay && entry.category === "event"
  );

  // Also check active events for diplomacy category
  const diplomaticEvents = next.activeEvents.filter(
    (e) => e.category === "diplomacy"
  );

  for (const entry of diplomaticEntries) {
    if (entry.event.toLowerCase().includes("diplomat") ||
        entry.event.toLowerCase().includes("foreign") ||
        entry.event.toLowerCase().includes("bilateral") ||
        entry.event.toLowerCase().includes("international")) {
      items.push({
        severity: "intel",
        text: entry.event,
      });
    }
  }

  for (const event of diplomaticEvents) {
    items.push({
      severity: "intel",
      text: event.title + (event.description ? `: ${event.description}` : ""),
      relatedEventId: event.id,
    });
  }

  return items;
}

export function generateBrief(
  prevState: GameState,
  newState: GameState
): IntelligenceBriefData {
  const metricChanges = computeMetricChanges(prevState, newState);

  // Count new events (events in newState not in prevState)
  const prevEventIds = new Set(prevState.activeEvents.map((e) => e.id));
  const newEventCount = newState.activeEvents.filter(
    (e) => !prevEventIds.has(e.id)
  ).length;

  const executiveSummary = buildExecutiveSummary(
    newState.day,
    metricChanges,
    newEventCount
  );

  return {
    day: newState.day,
    executiveSummary,
    sections: {
      political: buildPoliticalSection(prevState, newState),
      economic: buildEconomicSection(prevState, newState),
      security: buildSecuritySection(prevState, newState),
      diplomatic: buildDiplomaticSection(prevState, newState),
    },
    metricChanges,
    dismissed: false,
  };
}
