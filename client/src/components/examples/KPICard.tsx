import KPICard from '../KPICard';

export default function KPICardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <KPICard
        name="Employee Retention Rate"
        currentValue="94.2"
        baselineValue="87.5"
        delta={6.7}
        deltaPercentage={7.7}
        trend="up"
        confidence="high"
        unit="%"
        sparklineData={[
          { value: 87.5 },
          { value: 88.2 },
          { value: 89.1 },
          { value: 90.5 },
          { value: 91.8 },
          { value: 93.2 },
          { value: 94.2 }
        ]}
      />
      <KPICard
        name="Time to Fill Position"
        currentValue="28"
        baselineValue="42"
        delta={-14}
        deltaPercentage={-33.3}
        trend="up"
        confidence="high"
        unit="days"
        sparklineData={[
          { value: 42 },
          { value: 40 },
          { value: 38 },
          { value: 35 },
          { value: 32 },
          { value: 30 },
          { value: 28 }
        ]}
      />
      <KPICard
        name="Leadership Pipeline Strength"
        currentValue="8.1"
        baselineValue="6.4"
        delta={1.7}
        deltaPercentage={26.6}
        trend="up"
        confidence="medium"
        unit="/10"
        sparklineData={[
          { value: 6.4 },
          { value: 6.7 },
          { value: 7.0 },
          { value: 7.3 },
          { value: 7.6 },
          { value: 7.9 },
          { value: 8.1 }
        ]}
      />
    </div>
  );
}
