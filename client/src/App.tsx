import { useState, useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { GameProvider, useGame } from "@/lib/GameContext";
import OnboardingFlow from "@/components/OnboardingFlow";
import VictoryDefeatOverlay from "@/components/VictoryDefeatOverlay";
import TitleScreen from "@/components/TitleScreen";

function GameRouter({ dark, toggleDark }: { dark: boolean; toggleDark: () => void }) {
  const { state, goToSetup } = useGame();

  if (state.phase === "menu") {
    return (
      <TitleScreen
        onNewGame={() => goToSetup()}
      />
    );
  }

  if (state.phase === "setup") {
    return <OnboardingFlow />;
  }

  if (state.phase === "victory" || state.phase === "defeat") {
    return <VictoryDefeatOverlay />;
  }

  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/">
          <Home dark={dark} toggleDark={toggleDark} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  const [dark, setDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <GameProvider>
          <GameRouter dark={dark} toggleDark={toggleDark} />
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
