import PhaseCard from '../PhaseCard';
import { Search, Handshake, TrendingUp } from 'lucide-react';

export default function PhaseCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <PhaseCard
        phaseNumber={1}
        title="Discovery"
        description="Rapid understanding using public data and live note capture"
        icon={Search}
        outcomes={[
          "Complete organisation profile with confidence scoring",
          "Auto-suggested exposure with provenance",
          "Draft value hypothesis ready for client review"
        ]}
      />
      <PhaseCard
        phaseNumber={2}
        title="Alignment"
        description="Customer confirms challenges, KPIs, and creates a 12-month plan"
        icon={Handshake}
        outcomes={[
          "Top 3 strategic challenges mapped to solutions",
          "Signed baseline with email confirmation",
          "Visual 12-month timeline with governance"
        ]}
      />
      <PhaseCard
        phaseNumber={3}
        title="Realisation"
        description="Track progress, measure value, and generate board-ready reports"
        icon={TrendingUp}
        outcomes={[
          "Real-time KPI tracking with confidence levels",
          "NPV calculations with full transparency",
          "Analytics-approved final report"
        ]}
      />
    </div>
  );
}
