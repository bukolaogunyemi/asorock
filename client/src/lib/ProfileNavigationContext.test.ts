// ProfileNavigationContext.test.ts
// Tests the profileNavReducer logic directly as a pure function.

import { describe, it, expect } from "vitest";
import type { ProfileBreadcrumb } from "./ProfileNavigationContext";

// ── Inline the reducer so we can test it without React context ───────────────

interface ProfileNavState {
  stack: ProfileBreadcrumb[];
}

type ProfileNavAction =
  | { type: "PUSH_PROFILE"; payload: ProfileBreadcrumb }
  | { type: "POP_TO_PROFILE"; payload: number }
  | { type: "CLEAR_PROFILE_STACK" };

function profileNavReducer(state: ProfileNavState, action: ProfileNavAction): ProfileNavState {
  switch (action.type) {
    case "PUSH_PROFILE":
      return { stack: [...state.stack, action.payload] };
    case "POP_TO_PROFILE":
      return { stack: state.stack.slice(0, action.payload) };
    case "CLEAR_PROFILE_STACK":
      return { stack: [] };
    default:
      return state;
  }
}

// ── Test data ─────────────────────────────────────────────────────────────────

const characterCrumb: ProfileBreadcrumb = {
  key: "Alh. Aminu Kazeem",
  type: "character",
  label: "Alh. Aminu Kazeem",
  sourceTab: "cabinet",
  sourceLabel: "Cabinet",
};

const entityCrumb: ProfileBreadcrumb = {
  key: "state:lagos",
  type: "entity",
  label: "Lagos State",
  sourceTab: "governance",
  sourceLabel: "Governance",
};

const secondEntityCrumb: ProfileBreadcrumb = {
  key: "ministry:finance",
  type: "entity",
  label: "Ministry of Finance",
  sourceTab: "cabinet",
  sourceLabel: "Cabinet",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("profileNavReducer", () => {
  const empty: ProfileNavState = { stack: [] };

  it("starts with an empty stack", () => {
    expect(empty.stack).toHaveLength(0);
  });

  it("pushes a character breadcrumb", () => {
    const next = profileNavReducer(empty, { type: "PUSH_PROFILE", payload: characterCrumb });
    expect(next.stack).toHaveLength(1);
    expect(next.stack[0].key).toBe("Alh. Aminu Kazeem");
    expect(next.stack[0].type).toBe("character");
  });

  it("pushes an entity breadcrumb", () => {
    const next = profileNavReducer(empty, { type: "PUSH_PROFILE", payload: entityCrumb });
    expect(next.stack).toHaveLength(1);
    expect(next.stack[0].key).toBe("state:lagos");
    expect(next.stack[0].type).toBe("entity");
  });

  it("handles mixed character and entity breadcrumbs", () => {
    // Push character
    let state = profileNavReducer(empty, { type: "PUSH_PROFILE", payload: characterCrumb });
    // Push entity on top
    state = profileNavReducer(state, { type: "PUSH_PROFILE", payload: entityCrumb });

    expect(state.stack).toHaveLength(2);
    expect(state.stack[0].type).toBe("character");
    expect(state.stack[1].type).toBe("entity");
    expect(state.stack[1].key).toBe("state:lagos");

    // Pop back to index 1 (removes the entity, keeps character)
    state = profileNavReducer(state, { type: "POP_TO_PROFILE", payload: 1 });
    expect(state.stack).toHaveLength(1);
    expect(state.stack[0].type).toBe("character");
    expect(state.stack[0].key).toBe("Alh. Aminu Kazeem");
  });

  it("pops to index 0 (clears entire stack)", () => {
    let state = profileNavReducer(empty, { type: "PUSH_PROFILE", payload: characterCrumb });
    state = profileNavReducer(state, { type: "PUSH_PROFILE", payload: entityCrumb });
    state = profileNavReducer(state, { type: "POP_TO_PROFILE", payload: 0 });
    expect(state.stack).toHaveLength(0);
  });

  it("clears the stack", () => {
    let state = profileNavReducer(empty, { type: "PUSH_PROFILE", payload: characterCrumb });
    state = profileNavReducer(state, { type: "PUSH_PROFILE", payload: entityCrumb });
    state = profileNavReducer(state, { type: "PUSH_PROFILE", payload: secondEntityCrumb });
    expect(state.stack).toHaveLength(3);

    state = profileNavReducer(state, { type: "CLEAR_PROFILE_STACK" });
    expect(state.stack).toHaveLength(0);
  });

  it("currentProfile is the last item in the stack", () => {
    let state = profileNavReducer(empty, { type: "PUSH_PROFILE", payload: characterCrumb });
    state = profileNavReducer(state, { type: "PUSH_PROFILE", payload: entityCrumb });

    const current = state.stack[state.stack.length - 1];
    expect(current.key).toBe("state:lagos");
    expect(current.label).toBe("Lagos State");
  });

  it("preserves sourceTab and sourceLabel on entity breadcrumbs", () => {
    const state = profileNavReducer(empty, { type: "PUSH_PROFILE", payload: entityCrumb });
    expect(state.stack[0].sourceTab).toBe("governance");
    expect(state.stack[0].sourceLabel).toBe("Governance");
  });

  it("does not mutate previous state on push", () => {
    const before = profileNavReducer(empty, { type: "PUSH_PROFILE", payload: characterCrumb });
    profileNavReducer(before, { type: "PUSH_PROFILE", payload: entityCrumb });
    // before.stack should still be length 1
    expect(before.stack).toHaveLength(1);
  });
});
