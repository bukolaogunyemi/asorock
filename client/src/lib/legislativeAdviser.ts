import type { GameState } from "./gameTypes";
import type { Bill } from "./legislativeTypes";

export interface AdviserContext {
  tab: "bills" | "floor" | "history";
  selectedBillId: string | null;
  selectedChamber?: "house" | "senate";
  isWhipping?: boolean;
}

export interface OppositionEvent {
  id: string;
  text: string;
  day: number;
}

export function calculateOverrideRisk(
  state: GameState,
  bill: Bill,
): { probability: number; houseVotesShort: number; senateVotesShort: number } {
  const houseYes = bill.houseSupport.firmYes + bill.houseSupport.leaningYes;
  const senateYes = bill.senateSupport.firmYes + bill.senateSupport.leaningYes;
  const houseThreshold = 240;
  const senateThreshold = 73;

  const houseShort = Math.max(0, houseThreshold - houseYes);
  const senateShort = Math.max(0, senateThreshold - senateYes);

  const approval = state.approval ?? 50;
  const approvalFactor = 1 - approval / 100;
  const housePct = houseShort === 0 ? 1 : Math.max(0, 1 - houseShort / 30);
  const senatePct = senateShort === 0 ? 1 : Math.max(0, 1 - senateShort / 15);
  const raw = (housePct * 0.5 + senatePct * 0.5) * (0.5 + approvalFactor * 0.5);
  const probability = Math.round(raw * 100);

  return { probability, houseVotesShort: houseShort, senateVotesShort: senateShort };
}

export function generateAdviserComment(
  state: GameState,
  context: AdviserContext,
  adviserCompetence: number = 70,
): string {
  const legislature = state.legislature;
  if (!legislature) return "The National Assembly has not yet been convened.";

  const accuracy = adviserCompetence / 100;

  if (context.tab === "bills") {
    if (context.selectedBillId) {
      const bill =
        legislature.activeBills.find((b) => b.id === context.selectedBillId) ??
        legislature.pendingSignature.find((b) => b.id === context.selectedBillId);

      if (bill) {
        if (legislature.pendingSignature.some((b) => b.id === bill.id)) {
          const risk = calculateOverrideRisk(state, bill);
          if (risk.probability > 50) {
            return `Mr. President, override probability is high at ~${applyNoise(risk.probability, accuracy)}%. I would advise against a veto unless politically necessary.`;
          }
          return `Override probability is ${risk.probability <= 20 ? "low" : "moderate"} — vetoing is ${risk.probability <= 20 ? "safe" : "risky"}, but it will cost political capital.`;
        }

        if (bill.isCrisis) {
          const rounds = legislature.activeCrisis?.totalRounds ?? 3;
          const current = legislature.activeCrisis?.currentRound ?? 1;
          return `Mr. President, this is urgent. We have ${rounds - current} rounds remaining to secure votes or the bill fails.`;
        }

        const houseYes = bill.houseSupport.firmYes + bill.houseSupport.leaningYes;
        const houseMajority = 181;
        const gap = houseMajority - houseYes;
        if (gap > 0) {
          return `This bill is ${applyNoise(gap, accuracy)} votes short in the House. The Opp. Moderates may be persuadable if we offer concessions.`;
        }
        return `This bill has sufficient House support. Focus on securing the Senate vote.`;
      }
    }

    const committeeBills = legislature.activeBills.filter(
      (b) => b.houseStage === "committee" || b.senateStage === "committee",
    ).length;
    if (committeeBills > 0) {
      return `Mr. President, we have ${committeeBills} bill${committeeBills > 1 ? "s" : ""} in committee. The opposition is consolidating — consider lobbying early.`;
    }
    if (legislature.activeBills.length === 0) {
      return "The legislative calendar is clear, Mr. President. Consider proposing a bill to advance your agenda.";
    }
    return `We have ${legislature.activeBills.length} active bills in the pipeline. Select one to review its progress.`;
  }

  if (context.tab === "floor") {
    if (context.isWhipping) {
      return "Promising patronage will win us votes but antagonize the opposition further. Choose your levers wisely, Mr. President.";
    }
    return "Select a bill at floor-debate stage to begin whipping votes.";
  }

  if (context.tab === "history") {
    const passRate = legislature.sessionStats.billsPassed > 0
      ? Math.round(
          (legislature.sessionStats.billsPassed /
            Math.max(1, legislature.sessionStats.billsIntroduced)) *
            100,
        )
      : 0;
    return `Your legislative pass rate stands at ${passRate}%, Mr. President.`;
  }

  return "How may I advise you, Mr. President?";
}

export function getOppositionActivity(state: GameState): OppositionEvent[] {
  const legislature = state.legislature;
  if (!legislature) return [];

  const events: OppositionEvent[] = [];

  for (const bill of legislature.activeBills) {
    if (bill.sponsor === "opposition") {
      events.push({
        id: bill.id,
        text: `Opposition introduced ${bill.title} (${capitalize(bill.subjectTag)})`,
        day: bill.introducedOnDay,
      });
    } else if (bill.sponsor === "cross-party") {
      events.push({
        id: bill.id,
        text: `Cross-party coalition forming around ${bill.title}`,
        day: bill.introducedOnDay,
      });
    }
  }

  events.sort((a, b) => b.day - a.day);
  return events;
}

function applyNoise(value: number, accuracy: number): number {
  const noise = (1 - accuracy) * 15;
  const offset = Math.round((Math.random() - 0.5) * 2 * noise);
  return Math.max(0, value + offset);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
