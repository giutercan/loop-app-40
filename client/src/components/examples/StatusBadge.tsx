import StatusBadge from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-4 p-6 flex-wrap">
      <StatusBadge status="draft" />
      <StatusBadge status="locked" />
      <StatusBadge status="pending" />
    </div>
  );
}
