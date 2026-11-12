const labels: Record<string, [string, string]> = {
  ACTIVE: ['active', 'Active'],
  SUSPENDED: ['suspended', 'Suspended'],
  PENDING: ['pending', 'Pending'],
  UNDER_REVIEW: ['underReview', 'Under Review'],
  APPROVED: ['approved', 'Approved'],
  REJECTED: ['rejected', 'Rejected'],
  COMPLETED: ['completed', 'Completed'],
  PAID: ['paid', 'Paid'],
  CANCELLED: ['cancelled', 'Cancelled'],
  RESOLVED: ['resolved', 'Resolved'],
  DISMISSED: ['dismissed', 'Dismissed'],
  OPEN: ['open', 'Open'],
  IN_PROGRESS: ['underReview', 'Under Review'],
};

export function recordStatusLabel(
  status: string,
  translate: (key: string, fallback?: string) => string
) {
  const label = labels[status];
  return label ? translate(label[0], label[1]) : status.replaceAll('_', ' ');
}
