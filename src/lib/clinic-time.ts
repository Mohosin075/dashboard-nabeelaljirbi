/** Working times represent the clinic's wall clock, including legacy ISO-like strings. */
export function formatClinicTime(value?: string | null): string {
  const match = value?.trim().match(
    /^(?:\d{4}-\d{2}-\d{2}T)?(\d{1,2}):([0-5]\d)(?::[0-5]\d)?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/
  );
  if (!match || Number(match[1]) > 23) return '—';
  return `${match[1]!.padStart(2, '0')}:${match[2]}`;
}
