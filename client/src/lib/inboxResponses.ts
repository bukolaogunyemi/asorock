// aso-rock/client/src/lib/inboxResponses.ts

/** Default response options by message source — shared between UI and engine */
export const categoryResponses: Record<string, readonly { label: string; actionId: string }[]> = {
  seed:             [{ label: "Acknowledge", actionId: "acknowledge" }, { label: "Investigate", actionId: "investigate" }, { label: "Defer", actionId: "defer" }],
  system:           [{ label: "Acknowledge", actionId: "acknowledge" }, { label: "Note for Review", actionId: "note" }],
  decision:         [{ label: "Acknowledge", actionId: "acknowledge" }, { label: "Review Personally", actionId: "investigate" }, { label: "Assign to Minister", actionId: "delegate" }],
  chain:            [{ label: "Accept Outcome", actionId: "accept" }, { label: "Escalate", actionId: "escalate" }, { label: "Order Investigation", actionId: "investigate" }],
  court:            [{ label: "Comply", actionId: "comply" }, { label: "Appeal Ruling", actionId: "appeal" }, { label: "Seek Delay", actionId: "delay" }],
  random:           [{ label: "Address Directly", actionId: "address" }, { label: "Delegate", actionId: "delegate" }, { label: "Monitor", actionId: "acknowledge" }],
  "faction-demand": [{ label: "Schedule Dialogue", actionId: "engage" }, { label: "Send Emissary", actionId: "acknowledge" }, { label: "Dismiss", actionId: "dismiss" }],
};

/** Human-readable descriptions for response actions, shown in the dossier UI */
export const actionDescriptions: Record<string, string> = {
  acknowledge: "Note receipt, no commitment",
  investigate: "Look into this personally",
  defer: "Postpone decision",
  note: "Flag for later review",
  delegate: "Pass to relevant minister",
  approve: "Give formal approval",
  comply: "Accept and follow through",
  engage: "Open direct dialogue",
  accept: "Accept the outcome",
  escalate: "Elevate to higher priority",
  appeal: "Challenge the ruling",
  delay: "Request more time",
  address: "Handle directly",
  dismiss: "Reject outright",
  reject: "Formally refuse",
  modify: "Accept with changes",
  forward: "Delegate to relevant team",
  ignore: "Leave unanswered",
};

/**
 * Resolve the display label for a given actionId on a message.
 * Checks message.responseOptions first, then categoryResponses by source.
 * Falls back to capitalizing the actionId.
 */
export function resolveActionLabel(
  actionId: string,
  responseOptions: readonly { label: string; actionId: string }[] | undefined,
  source: string,
): string {
  if (actionId === "forward") return "Forward to Minister";
  if (actionId === "ignore") return "Ignore";

  const options = responseOptions ?? categoryResponses[source] ?? [];
  const match = options.find((o) => o.actionId === actionId);
  if (match) return match.label;

  return actionId.charAt(0).toUpperCase() + actionId.slice(1);
}
