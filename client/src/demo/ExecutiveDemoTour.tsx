import Joyride, { CallBackProps, STATUS, Step, EVENTS, ACTIONS } from "react-joyride";
import { useDemoMode } from "./DemoModeContext";
import { useCallback } from "react";
import { useLocation } from "wouter";

const SALES_DISCOVER_STEPS: Step[] = [
  {
    target: '[data-demo-step="account-header"]',
    title: "Welcome to the Client Value Hub",
    content: "This is your single source of truth for client engagement. Every insight, outcome, and value commitment lives here - from first discovery to realized business impact.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="workflow-progress"]',
    title: "Visual Sales Journey",
    content: "The 4-stage workflow guides Sales through a proven methodology: Discover → Build Value → Align → Handoff. Green checkmarks show completion at a glance.",
    placement: "right",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="discovery-research"]',
    title: "AI-Powered Discovery Intelligence",
    content: "Our AI analyzes 50+ data sources in seconds - annual reports, earnings calls, news, and industry benchmarks. What used to take hours now happens instantly. For Chanel, we uncovered 5 critical talent insights.",
    placement: "right",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="value-summary"]',
    title: "Executive Value Dashboard",
    content: "Real-time view of promised value and realized outcomes. This is the ROI story that wins renewals and expands accounts. Every number traces back to the original discovery.",
    placement: "left",
    disableBeacon: true,
    spotlightPadding: 8,
  },
];

const SALES_BUILDVALUE_STEPS: Step[] = [
  {
    target: '[data-demo-step="kpi-suggestions"]',
    title: "AI-Suggested Outcomes - The Game Changer",
    content: "This is where the magic happens: AI transforms discovery insights into measurable outcomes - complete with Industry Benchmarks and Korn Ferry research. Zero manual re-entry. Full traceability.",
    placement: "left",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="benchmark-display"]',
    title: "Data-Driven Baseline Recommendations",
    content: "Every outcome includes Industry Benchmarks (low/mid/high ranges), Korn Ferry best-practice data, and AI-generated baseline reasoning. Clients see exactly where they stand vs. industry leaders.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="multi-select"]',
    title: "Batch Outcome Selection",
    content: "Select multiple outcomes at once using checkboxes, then add them all in one action. Consultants report 70% faster outcome setup compared to manual entry in spreadsheets.",
    placement: "right",
    disableBeacon: true,
    spotlightPadding: 8,
  },
];

const SALES_ALIGN_STEPS: Step[] = [
  {
    target: '[data-demo-step="kpi-pipeline"]',
    title: "Visual Outcome Pipeline",
    content: "Track every outcome from draft to client confirmation. The purple 'AI Generated' badges show full provenance - executives love the audit trail that links outcomes back to discovery insights.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 8,
  },
];

const SALES_HANDOFF_STEPS: Step[] = [
  {
    target: '[data-demo-step="handoff-section"]',
    title: "Seamless Sales-to-Delivery Handoff",
    content: "One click bundles confirmed outcomes into a handoff package with executive summary. Delivery team receives complete context - targets, rationale, and provenance. No information lost in transition.",
    placement: "left",
    disableBeacon: true,
    spotlightPadding: 8,
  },
];

const tourStyles = {
  options: {
    primaryColor: "#7c3aed",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    arrowColor: "#ffffff",
    overlayColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 10000,
    width: 380,
  },
  tooltipContainer: {
    textAlign: "left" as const,
  },
  tooltipTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "8px",
    color: "#111827",
  },
  tooltipContent: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#4b5563",
  },
  buttonNext: {
    backgroundColor: "#7c3aed",
    fontSize: "14px",
    fontWeight: 500,
    padding: "10px 20px",
    borderRadius: "6px",
  },
  buttonBack: {
    color: "#6b7280",
    fontSize: "14px",
  },
  buttonClose: {
    display: "none",
  },
  buttonSkip: {
    color: "#9ca3af",
    fontSize: "13px",
  },
  spotlight: {
    borderRadius: "8px",
  },
};

export function ExecutiveDemoTour() {
  const { tourRunning, setTourRunning, currentStep, setCurrentStep, currentStage, setCurrentStage } = useDemoMode();
  const [, setLocation] = useLocation();

  const getStepsForStage = useCallback(() => {
    switch (currentStage) {
      case "discover":
        return SALES_DISCOVER_STEPS;
      case "build-value":
        return SALES_BUILDVALUE_STEPS;
      case "align":
        return SALES_ALIGN_STEPS;
      case "handoff":
        return SALES_HANDOFF_STEPS;
      default:
        return SALES_DISCOVER_STEPS;
    }
  }, [currentStage]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index, action } = data;
    const currentSteps = getStepsForStage();
    const stages: Array<"discover" | "build-value" | "align" | "handoff"> = ["discover", "build-value", "align", "handoff"];

    if (type === EVENTS.STEP_AFTER) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      if (nextIndex >= currentSteps.length) {
        const currentIdx = stages.indexOf(currentStage);
        
        if (currentIdx < stages.length - 1) {
          const nextStage = stages[currentIdx + 1];
          setCurrentStage(nextStage);
          setCurrentStep(0);
        } else {
          setTourRunning(false);
          setCurrentStep(0);
          setCurrentStage("discover");
        }
      } else {
        setCurrentStep(nextIndex);
      }
    }

    if (type === EVENTS.TARGET_NOT_FOUND) {
      setCurrentStep(index + 1);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setTourRunning(false);
      setCurrentStep(0);
      setCurrentStage("discover");
    }
  }, [setTourRunning, setCurrentStep, currentStage, setCurrentStage, getStepsForStage]);

  if (!tourRunning) return null;

  const steps = getStepsForStage();
  const stages = ["discover", "build-value", "align", "handoff"];
  const stageIndex = stages.indexOf(currentStage);
  const totalStages = stages.length;

  return (
    <>
      <div className="fixed bottom-4 left-4 z-[10001] bg-white rounded-lg shadow-lg p-3 border border-purple-200">
        <div className="text-xs text-muted-foreground mb-1">Demo Stage</div>
        <div className="flex gap-1">
          {stages.map((stage, idx) => (
            <div
              key={stage}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                idx === stageIndex 
                  ? "bg-purple-600 text-white" 
                  : idx < stageIndex 
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {idx + 1}. {stage.charAt(0).toUpperCase() + stage.slice(1).replace("-", " ")}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Click the stage tabs above to navigate, then click "Next" to continue tour
        </div>
      </div>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={tourRunning}
        scrollToFirstStep
        showProgress
        showSkipButton
        stepIndex={currentStep}
        steps={steps}
        styles={tourStyles}
        locale={{
          back: "Back",
          close: "Close",
          last: currentStage === "handoff" ? "Finish Tour" : "Next Stage",
          next: "Next",
          skip: "Skip Demo",
        }}
        floaterProps={{
          disableAnimation: false,
        }}
      />
    </>
  );
}
