import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from "react-joyride";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

const TOUR_STORAGE_KEY = "kf-app-tour-completed";

const tourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Welcome to Korn Ferry Value Lifecycle</h3>
        <p>This quick tour will show you how to manage client engagements from Discovery to Value Realization.</p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-testid="sidebar-projects"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Your Projects</h3>
        <p>All your client engagements appear here. Click on any project to open it.</p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-testid="button-new-project"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Create New Project</h3>
        <p>Start a new client engagement by clicking here. You'll enter the company name and engagement details.</p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-testid="phase-nav"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Engagement Phases</h3>
        <p>Each project moves through three phases:</p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><strong>Discovery</strong> - Research & understand the client</li>
          <li><strong>Alignment</strong> - Build value cases with KPIs</li>
          <li><strong>Realization</strong> - Track actual value delivered</li>
        </ul>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-testid="tab-research"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">AI-Powered Research</h3>
        <p>Use AI to research the company and generate strategic insights. The AI analyzes public information and maps findings to Korn Ferry capabilities.</p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-testid="tab-jobs"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Jobs & Priorities</h3>
        <p>Select up to 3 priority jobs to focus on. These become the foundation for your value cases and KPI tracking.</p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-testid="priority-slot-0"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Priority Slots</h3>
        <p>Your selected priorities appear here. You can:</p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Assign each to a Strategic Pillar using the dropdown</li>
          <li>Remove priorities with the X button</li>
          <li>See how many KPIs are linked</li>
        </ul>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-testid="button-finalize-inline"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Finalize Discovery</h3>
        <p>Once you've selected 3 priorities, click Finalize to lock in your choices and move to the Alignment phase.</p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-testid="sidebar-dashboard"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Your Dashboard</h3>
        <p>Access your personalized dashboard with customizable widgets. Drag and drop to arrange them how you like.</p>
      </div>
    ),
    placement: "right",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">You're All Set!</h3>
        <p>That's the basics! You can restart this tour anytime using the help button.</p>
        <p className="text-sm text-muted-foreground">Tip: Look for helpful tooltips and guidance throughout the app.</p>
      </div>
    ),
    placement: "center",
  },
];

interface AppTourProps {
  autoStart?: boolean;
}

export function AppTour({ autoStart = false }: AppTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (autoStart) {
      const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasCompletedTour) {
        setTimeout(() => setRun(true), 1000);
      }
    }
  }, [autoStart]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;
    
    if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + 1);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setStepIndex(0);
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    }
  };

  const startTour = () => {
    setStepIndex(0);
    setRun(true);
  };

  const filteredSteps = tourSteps.filter((step) => {
    if (step.target === "body") return true;
    const element = document.querySelector(step.target as string);
    return element !== null;
  });

  return (
    <>
      <Joyride
        steps={filteredSteps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        hideCloseButton={false}
        scrollToFirstStep
        disableOverlayClose
        spotlightClicks
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "hsl(var(--primary))",
            backgroundColor: "hsl(var(--background))",
            textColor: "hsl(var(--foreground))",
            arrowColor: "hsl(var(--background))",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: "8px",
            padding: "16px",
          },
          buttonNext: {
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            borderRadius: "6px",
            padding: "8px 16px",
          },
          buttonBack: {
            color: "hsl(var(--muted-foreground))",
            marginRight: "8px",
          },
          buttonSkip: {
            color: "hsl(var(--muted-foreground))",
          },
          spotlight: {
            borderRadius: "8px",
          },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          skip: "Skip Tour",
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={startTour}
        title="Start guided tour"
        data-testid="button-start-tour"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
    </>
  );
}

export function resetTour() {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}
