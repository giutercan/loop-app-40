import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from "react-joyride";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

const TOUR_STORAGE_KEY = "kf-app-tour-completed";
const DISCOVERY_TOUR_KEY = "kf-discovery-tour-completed";
const ACCOUNT_HUB_TOUR_KEY = "kf-account-hub-tour-completed";

const projectsDashboardSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Welcome to Korn Ferry Loop</h3>
        <p>This quick tour will show you how to manage client engagements from Discovery to Value Realization.</p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-testid="button-new-project"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Create New Initiative</h3>
        <p>Start a new client engagement by clicking here. You'll enter the company name and select an engagement type.</p>
      </div>
    ),
    placement: "left",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Your Initiatives</h3>
        <p>All your client engagements will appear on this page. Click on any initiative card to open it and continue your work.</p>
      </div>
    ),
    placement: "center",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Client Value Loop</h3>
        <p>Each engagement moves through five connected phases:</p>
        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
          <li><strong>Discover & Qualify</strong> - Research & understand the client</li>
          <li><strong>Shape & Sell</strong> - Build value propositions</li>
          <li><strong>Deliver & Realise</strong> - Execute and track outcomes</li>
          <li><strong>Review & Renew</strong> - QBR and expand opportunities</li>
          <li><strong>Learn & Scale</strong> - Capture learnings and replicate</li>
        </ul>
      </div>
    ),
    placement: "center",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">You're All Set!</h3>
        <p>Create your first initiative to get started. You can restart this tour anytime using the help button.</p>
      </div>
    ),
    placement: "center",
  },
];

const discoverySteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Discovery Phase Guide</h3>
        <p>This tour will show you how to research your client and set up priorities for the engagement.</p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-testid="phase-nav"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Engagement Phases</h3>
        <p>Navigate between the three phases here. Each phase builds on the previous one.</p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-testid="tab-research"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Organisation Tab</h3>
        <p>Use AI to research the company and generate strategic insights. The AI maps findings to Korn Ferry capabilities.</p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-testid="tab-jobs"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Jobs & Priorities</h3>
        <p>This is where you'll select up to 3 priority jobs to focus on. These become the foundation for your value cases.</p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Selecting Priorities</h3>
        <p>In the Jobs tab, you'll see:</p>
        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
          <li><strong>3 Priority Slots</strong> - Your selected jobs appear at the top</li>
          <li><strong>Strategic Pillar</strong> - Assign each priority to a pillar</li>
          <li><strong>Finalize</strong> - Lock in choices when you have 3 priorities</li>
        </ul>
      </div>
    ),
    placement: "center",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Ready to Begin!</h3>
        <p>Start by researching the company, then select your priorities. You can restart this tour anytime using the help button.</p>
      </div>
    ),
    placement: "center",
  },
];

const accountHubSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Welcome to the Account Hub</h3>
        <p>This is your central command center for managing client accounts across the value loop.</p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-testid="button-value-spine"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Value Spine</h3>
        <p>Jump to the Value Spine for a comprehensive view of promised vs realized value across all initiatives.</p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-testid="select-phase-filter"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Filter by Phase</h3>
        <p>Focus on initiatives in specific phases - from Discovery to Value Realization.</p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Initiative Cards</h3>
        <p>Each initiative card shows:</p>
        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
          <li><strong>Phase</strong> - Current stage in the journey</li>
          <li><strong>KPI Status</strong> - Track progress across metrics</li>
          <li><strong>Value</strong> - Promised vs realized value</li>
          <li><strong>Quick Links</strong> - Jump directly to any phase</li>
        </ul>
      </div>
    ),
    placement: "center",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Role-Based Views</h3>
        <p>Access tailored dashboards for different roles: Sales, Consultant, Delivery, CSM, and Client Sponsor. Each view shows relevant metrics and actions.</p>
      </div>
    ),
    placement: "center",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">You're Ready!</h3>
        <p>Navigate seamlessly between the Account Hub, Value Spine, and individual initiatives. Start by exploring your initiatives or filtering by phase.</p>
      </div>
    ),
    placement: "center",
  },
];

export type TourContext = "dashboard" | "discovery" | "accountHub";

interface AppTourProps {
  autoStart?: boolean;
  context?: TourContext;
}

export function AppTour({ autoStart = false, context = "dashboard" }: AppTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  
  const getStorageKey = () => {
    switch (context) {
      case "discovery": return DISCOVERY_TOUR_KEY;
      case "accountHub": return ACCOUNT_HUB_TOUR_KEY;
      default: return TOUR_STORAGE_KEY;
    }
  };
  
  const getSteps = () => {
    switch (context) {
      case "discovery": return discoverySteps;
      case "accountHub": return accountHubSteps;
      default: return projectsDashboardSteps;
    }
  };
  
  const storageKey = getStorageKey();
  const steps = getSteps();

  useEffect(() => {
    if (autoStart) {
      const hasCompletedTour = localStorage.getItem(storageKey);
      if (!hasCompletedTour) {
        setTimeout(() => setRun(true), 1000);
      }
    }
  }, [autoStart, storageKey]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;
    
    if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + 1);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setStepIndex(0);
      localStorage.setItem(storageKey, "true");
    }
  };

  const startTour = () => {
    setStepIndex(0);
    setRun(true);
  };

  const filteredSteps = steps.filter((step) => {
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

export function resetTour(context?: TourContext) {
  if (context === "discovery") {
    localStorage.removeItem(DISCOVERY_TOUR_KEY);
  } else if (context === "dashboard") {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  } else if (context === "accountHub") {
    localStorage.removeItem(ACCOUNT_HUB_TOUR_KEY);
  } else {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(DISCOVERY_TOUR_KEY);
    localStorage.removeItem(ACCOUNT_HUB_TOUR_KEY);
  }
}
