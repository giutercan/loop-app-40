import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";

interface DemoModeContextType {
  isDemoMode: boolean;
  demoAccount: string | null;
  startDemo: (accountName?: string) => void;
  endDemo: () => void;
  tourRunning: boolean;
  setTourRunning: (running: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoAccount, setDemoAccount] = useState<string | null>(null);
  const [tourRunning, setTourRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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
    setTourRunning(true);
  }, []);

  const endDemo = useCallback(() => {
    setIsDemoMode(false);
    setDemoAccount(null);
    setTourRunning(false);
    setCurrentStep(0);
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
