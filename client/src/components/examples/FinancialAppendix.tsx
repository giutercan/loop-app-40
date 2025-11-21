import FinancialAppendix from '../FinancialAppendix';

export default function FinancialAppendixExample() {
  const data = [
    {
      year: 1,
      incrementalCashFlow: 2400000,
      cumulative: 2400000,
      npv: 2181818,
      notes: "Initial impact from retention improvement",
      calculation: "NPV = $2,400,000 / (1 + 0.10)^1 = $2,181,818\nAssumptions:\n- 15% reduction in turnover\n- Average replacement cost: $85,000\n- Baseline turnover: 18.5%"
    },
    {
      year: 2,
      incrementalCashFlow: 3100000,
      cumulative: 5500000,
      npv: 2561983,
      notes: "Compounding effects + pipeline strength",
      calculation: "NPV = $3,100,000 / (1 + 0.10)^2 = $2,561,983\nAssumptions:\n- Additional 8% improvement\n- Leadership pipeline reducing external hires"
    },
    {
      year: 3,
      incrementalCashFlow: 3800000,
      cumulative: 9300000,
      npv: 2854176,
      notes: "Full program maturity",
      calculation: "NPV = $3,800,000 / (1 + 0.10)^3 = $2,854,176\nAssumptions:\n- Sustained retention gains\n- Faster time-to-productivity for new hires"
    }
  ];

  return (
    <div className="p-6 max-w-6xl">
      <FinancialAppendix
        data={data}
        totalNPV={7597977}
        paybackMonths={8}
        discountRate={10}
      />
    </div>
  );
}
