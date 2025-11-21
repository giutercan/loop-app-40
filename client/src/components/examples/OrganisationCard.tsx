import OrganisationCard from '../OrganisationCard';

export default function OrganisationCardExample() {
  return (
    <div className="p-6 max-w-6xl">
      <OrganisationCard
        name="Acme Corporation"
        sector="Technology & Enterprise Software"
        dataPoints={[
          { label: "Annual Revenue", value: "$2.4B", confidence: "high", source: "Q3 2024 Earnings Report" },
          { label: "Employee Count", value: "12,500", confidence: "high", source: "LinkedIn Data" },
          { label: "Market Cap", value: "$18.7B", confidence: "medium", source: "NYSE Real-time" },
          { label: "Revenue Growth", value: "+24% YoY", confidence: "high", source: "Investor Presentation" }
        ]}
        revenueData={[
          { month: "Jan", revenue: 180 },
          { month: "Feb", revenue: 195 },
          { month: "Mar", revenue: 210 },
          { month: "Apr", revenue: 205 },
          { month: "May", revenue: 220 },
          { month: "Jun", revenue: 240 }
        ]}
        headlines={[
          {
            title: "Acme Corporation announces strategic partnership with major cloud provider",
            date: "2 days ago",
            source: "TechCrunch",
            url: "#"
          },
          {
            title: "Q3 earnings beat expectations, stock rises 12%",
            date: "1 week ago",
            source: "Reuters",
            url: "#"
          },
          {
            title: "New AI-powered product line launched targeting enterprise market",
            date: "2 weeks ago",
            source: "Bloomberg",
            url: "#"
          }
        ]}
      />
    </div>
  );
}
