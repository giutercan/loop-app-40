import ConfidenceBadge from '../ConfidenceBadge';

export default function ConfidenceBadgeExample() {
  return (
    <div className="flex gap-4 p-6 flex-wrap">
      <ConfidenceBadge level="high" />
      <ConfidenceBadge level="medium" />
      <ConfidenceBadge level="low" />
    </div>
  );
}
