// client/src/lib/ProfileNavigationContext.tsx
import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";

export interface ProfileBreadcrumb {
  key: string;              // character name OR entity id ("state:lagos")
  type: "character" | "entity";
  label: string;
  sourceTab: string;
  sourceLabel: string;
}

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

interface ProfileNavContextValue {
  stack: ProfileBreadcrumb[];
  isProfileOpen: boolean;
  currentProfile: ProfileBreadcrumb | null;
  pushProfile: (crumb: ProfileBreadcrumb) => void;
  popToIndex: (index: number) => void;
  clearStack: () => void;
}

const ProfileNavContext = createContext<ProfileNavContextValue | null>(null);

export function ProfileNavigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(profileNavReducer, { stack: [] });

  const pushProfile = useCallback((crumb: ProfileBreadcrumb) => {
    dispatch({ type: "PUSH_PROFILE", payload: crumb });
  }, []);

  const popToIndex = useCallback((index: number) => {
    dispatch({ type: "POP_TO_PROFILE", payload: index });
  }, []);

  const clearStack = useCallback(() => {
    dispatch({ type: "CLEAR_PROFILE_STACK" });
  }, []);

  const value: ProfileNavContextValue = {
    stack: state.stack,
    isProfileOpen: state.stack.length > 0,
    currentProfile: state.stack.length > 0 ? state.stack[state.stack.length - 1] : null,
    pushProfile,
    popToIndex,
    clearStack,
  };

  return (
    <ProfileNavContext.Provider value={value}>
      {children}
    </ProfileNavContext.Provider>
  );
}

export function useProfileNavigation(): ProfileNavContextValue {
  const ctx = useContext(ProfileNavContext);
  if (!ctx) throw new Error("useProfileNavigation must be used within ProfileNavigationProvider");
  return ctx;
}
