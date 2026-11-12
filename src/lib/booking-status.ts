export const bookingStatuses = [
  'PENDING',
  'CONFIRMED',
  'ARRIVED',
  'COMPLETE',
  'CANCELLED',
  'PATIENT_NO_SHOW',
  'DOCTOR_ABSENT',
];

const labels: Record<string, [string, string]> = {
  PENDING: ['pending', 'Pending'],
  NOT_UPDATED: ['pending', 'Pending'],
  CONFIRMED: ['confirmed', 'Confirmed'],
  ARRIVED: ['arrived', 'Arrived'],
  INPROGRESS: ['arrived', 'Arrived'],
  COMPLETE: ['completed', 'Completed'],
  COMPLETED: ['completed', 'Completed'],
  CANCELLED: ['cancelled', 'Cancelled'],
  REJECTED: ['cancelled', 'Cancelled'],
  DOCTOR_ABSENT: ['doctorNoShow', 'Doctor No-Show'],
  PATIENT_NO_SHOW: ['patientNoShow', 'Patient No-Show'],
  AUTO_UNRESOLVED: ['patientNoShow', 'Patient No-Show'],
  NOT_SHOW: ['patientNoShow', 'Patient No-Show'],
};

export function bookingStatusLabel(
  status: string,
  translate: (key: string, fallback?: string) => string
) {
  const label = labels[status];
  return label ? translate(label[0], label[1]) : status;
}
