export interface DoctorQualification {
  degree: string;
  institute: string;
  year: string;
}

/**
 * Parses doctor qualifications stored in the biography field.
 * Handles both JSON encoded arrays and plain multiline/comma separated text.
 */
export function parseDoctorQualifications(raw?: string | null): DoctorQualification[] {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return [];
  }

  const trimmed = raw.trim();

  // 1. Try parsing JSON format
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item: any) => ({
            degree: item?.degree || item?.title || item?.name || '',
            institute: item?.institute || item?.institution || item?.university || item?.college || '',
            year: item?.year !== undefined && item?.year !== null ? String(item.year).trim() : '',
          }))
          .filter((q) => q.degree || q.institute || q.year);
      } else if (typeof parsed === 'object' && parsed !== null) {
        return [{
          degree: parsed.degree || parsed.title || '',
          institute: parsed.institute || parsed.university || '',
          year: parsed.year ? String(parsed.year) : '',
        }].filter((q) => q.degree || q.institute || q.year);
      }
    } catch {
      // Not valid JSON, fall through to text parsing
    }
  }

  // 2. Fallback: Parse line-by-line text
  // Ignore HTTP image URLs if any legacy URL was stored
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return [];
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    // Check if line format is like "MBBS - Harvard University (2020)" or "Degree, Institute, Year"
    const matchWithYear = line.match(/^(.*?)(?:\s*[-–—|,]\s*|\s+at\s+|\s+from\s+)(.*?)(?:\s*\((\d{4})\)|\s*[-–—|,]\s*(\d{4}))?$/i);
    if (matchWithYear) {
      return {
        degree: matchWithYear[1]?.trim() || line,
        institute: matchWithYear[2]?.replace(/\(\d{4}\)/, '').trim() || '',
        year: matchWithYear[3] || matchWithYear[4] || '',
      };
    }
    return {
      degree: line,
      institute: '',
      year: '',
    };
  });
}
