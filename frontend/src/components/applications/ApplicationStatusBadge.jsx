const statusConfig = {
  pending: { label: 'قيد المراجعة', className: 'status-pending' },
  accepted: { label: 'تم القبول', className: 'status-accepted' },
  rejected: { label: 'مرفوض', className: 'status-rejected' },
};

export default function ApplicationStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  return <span className={`application-status-badge ${config.className}`}>{config.label}</span>;
}
