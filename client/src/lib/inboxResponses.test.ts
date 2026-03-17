// aso-rock/client/src/lib/inboxResponses.test.ts
import { describe, it, expect } from "vitest";
import { resolveActionLabel, categoryResponses } from "./inboxResponses";

describe("inboxResponses", () => {
  it("resolves label from responseOptions first", () => {
    const options = [{ label: "Custom Label", actionId: "acknowledge" }];
    expect(resolveActionLabel("acknowledge", options, "seed")).toBe("Custom Label");
  });

  it("falls back to categoryResponses by source", () => {
    expect(resolveActionLabel("acknowledge", undefined, "seed")).toBe("Acknowledge");
  });

  it("returns 'Forward to Minister' for forward action", () => {
    expect(resolveActionLabel("forward", undefined, "seed")).toBe("Forward to Minister");
  });

  it("returns 'Ignore' for ignore action", () => {
    expect(resolveActionLabel("ignore", undefined, "seed")).toBe("Ignore");
  });

  it("capitalizes unknown actionId as fallback", () => {
    expect(resolveActionLabel("custom-action", undefined, "unknown")).toBe("Custom-action");
  });

  it("has category responses for all known sources", () => {
    expect(Object.keys(categoryResponses)).toEqual(
      expect.arrayContaining(["seed", "system", "decision", "chain", "court", "random", "faction-demand"])
    );
  });

  describe("persistence scenario: labels resolved by handleInboxAction", () => {
    it("resolves respondedLabel from message responseOptions when present", () => {
      // handleInboxAction calls resolveActionLabel(actionId, message.responseOptions, message.source)
      // and stores the result as respondedLabel on the message
      const responseOptions = [
        { label: "Approve the Budget", actionId: "approve" },
        { label: "Reject Proposal", actionId: "reject" },
      ];
      expect(resolveActionLabel("approve", responseOptions, "decision")).toBe("Approve the Budget");
      expect(resolveActionLabel("reject", responseOptions, "decision")).toBe("Reject Proposal");
    });

    it("resolves respondedLabel from categoryResponses when no responseOptions", () => {
      // When message.responseOptions is undefined, falls back to category-level defaults
      expect(resolveActionLabel("acknowledge", undefined, "seed")).toBe("Acknowledge");
      expect(resolveActionLabel("acknowledge", undefined, "system")).toBe("Acknowledge");
    });

    it("persists 'Forward to Minister' label for forward action regardless of source or options", () => {
      // forward is a special built-in action — always resolves the same label
      const options = [{ label: "Some Other Label", actionId: "forward" }];
      expect(resolveActionLabel("forward", options, "decision")).toBe("Forward to Minister");
      expect(resolveActionLabel("forward", undefined, "seed")).toBe("Forward to Minister");
    });

    it("persists 'Ignore' label for ignore action regardless of source or options", () => {
      // ignore is a special built-in action — always resolves the same label
      const options = [{ label: "Some Other Label", actionId: "ignore" }];
      expect(resolveActionLabel("ignore", options, "faction-demand")).toBe("Ignore");
      expect(resolveActionLabel("ignore", undefined, "court")).toBe("Ignore");
    });

    it("persists capitalized actionId as respondedLabel when no match is found", () => {
      // Ensures unknown custom actions still get a readable label stored on the message
      expect(resolveActionLabel("custom-response", undefined, "unknown-source")).toBe("Custom-response");
      expect(resolveActionLabel("escalate", undefined, "unknown-source")).toBe("Escalate");
    });
  });
});
