import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";

type DemoStage = "discover" | "build-value" | "align" | "handoff";

interface DemoModeContextType {
  isDemoMode: boolean;
  demoAccount: string | null;
  startDemo: (accountName?: string) => void;
  endDemo: () => void;
  tourRunning: boolean;
  setTourRunning: (running: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  currentStage: DemoStage;
  setCurrentStage: (stage: DemoStage) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoAccount, setDemoAccount] = useState<string | null>(null);
  const [tourRunning, setTourRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentStage, setCurrentStage] = useState<DemoStage>("discover");
  const [location] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "chanel") {
      setIsDemoMode(true);
      setDemoAccount("Chanel");
    }
  }, [location]);

  const startDemo = useCallback((accountName: string = "Chanel") => {
    setIsDemoMode(true);
    setDemoAccount(accountName);
    setCurrentStep(0);
    setCurrentStage("discover");
    setTourRunning(true);
  }, []);

  const endDemo = useCallback(() => {
    setIsDemoMode(false);
    setDemoAccount(null);
    setTourRunning(false);
    setCurrentStep(0);
    setCurrentStage("discover");
  }, []);

  return (
    <DemoModeContext.Provider value={{
      isDemoMode,
      demoAccount,
      startDemo,
      endDemo,
      tourRunning,
      setTourRunning,
      currentStep,
      setCurrentStep,
      currentStage,
      setCurrentStage,
    }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}
