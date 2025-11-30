import Joyride, { CallBackProps, STATUS, Step, EVENTS, ACTIONS } from "react-joyride";
import { useDemoMode } from "./DemoModeContext";
import { useCallback } from "react";

const TOUR_STEPS: Step[] = [
  {
    target: '[data-demo-step="account-header"]',
    title: "Welcome to the Client Value Hub",
    content: "This is your single source of truth for client engagement. Every insight, KPI, and value commitment lives here - from first discovery to realized business impact.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="workflow-progress"]',
    title: "Visual Sales Journey",
    content: "The 4-stage workflow guides Sales through a proven methodology: Discover → Build Value → Align → Handoff. Green checkmarks show completion at a glance.",
    placement: "bottom",
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
    target: '[data-demo-step="insight-card"]',
    title: "Actionable, Prioritized Insights",
    content: "Each insight is automatically prioritized by business impact and mapped to Korn Ferry capabilities. See how the 'Leadership Succession Gap' directly connects to our Succession Planning solutions.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="kpi-suggestions"]',
    title: "AI-Suggested KPIs - The Game Changer",
    content: "This is where the magic happens: AI transforms discovery insights into measurable KPIs - complete with Industry Benchmarks and Korn Ferry research. Zero manual re-entry. Full traceability.",
    placement: "left",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="benchmark-display"]',
    title: "Data-Driven Baseline Recommendations",
    content: "Every KPI includes Industry Benchmarks (low/mid/high ranges), Korn Ferry best-practice data, and AI-generated baseline reasoning. Clients see exactly where they stand vs. industry leaders.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="multi-select"]',
    title: "Batch KPI Selection",
    content: "Select multiple KPIs at once using checkboxes, then add them all in one action. Consultants report 70% faster KPI setup compared to manual entry in spreadsheets.",
    placement: "right",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="kpi-pipeline"]',
    title: "Visual KPI Pipeline",
    content: "Track every KPI from draft to client confirmation. The purple 'AI Generated' badges show full provenance - executives love the audit trail that links outcomes back to discovery insights.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="handoff-section"]',
    title: "Seamless Sales-to-Delivery Handoff",
    content: "One click bundles confirmed KPIs into a handoff package with executive summary. Delivery team receives complete context - targets, rationale, and provenance. No information lost in transition.",
    placement: "left",
    disableBeacon: true,
    spotlightPadding: 8,
  },
  {
    target: '[data-demo-step="value-summary"]',
    title: "Executive Value Dashboard",
    content: "Real-time view of €12.5M in promised value with €4.8M already realized. This is the ROI story that wins renewals and expands accounts. Every number traces back to the original discovery.",
    placement: "bottom",
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
  const { tourRunning, setTourRunning, currentStep, setCurrentStep } = useDemoMode();

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setCurrentStep(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setTourRunning(false);
      setCurrentStep(0);
    }
  }, [setTourRunning, setCurrentStep]);

  if (!tourRunning) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={tourRunning}
      scrollToFirstStep
      showProgress
      showSkipButton
      stepIndex={currentStep}
      steps={TOUR_STEPS}
      styles={tourStyles}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish Tour",
        next: "Next",
        skip: "Skip Demo",
      }}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  );
}
