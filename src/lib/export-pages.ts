/** Fetch every matching page using one captured set of filters, not just the visible page. */
export async function exportPages<T extends { id: string }>(fetchPage: (page: number) => Promise<{ rows: T[]; total: number }>): Promise<T[]> {
  const rows: T[] = [];
  const ids = new Set<string>();
  let expected: number | undefined;
  for (let page = 1; page <= 2000; page++) {
    const result = await fetchPage(page);
    if (!Number.isSafeInteger(result.total) || result.total < 0 || !Array.isArray(result.rows)) {
      throw new Error('Invalid export response. Please retry.');
    }
    if (expected === undefined) expected = result.total;
    if (result.total !== expected) throw new Error('Records changed during export. Please retry.');
    for (const row of result.rows) {
      if (!row || typeof row.id !== 'string' || !row.id) throw new Error('Invalid export record. Please retry.');
      if (ids.has(row.id)) throw new Error('Records changed during export. Please retry.');
      ids.add(row.id); rows.push(row);
    }
    if (rows.length > expected) throw new Error('Records changed during export. Please retry.');
    if (rows.length === expected) return rows;
    if (!result.rows.length) throw new Error('Incomplete export response. Please retry.');
  }
  throw new Error('Too many records. Narrow the date filter before exporting.');
}

export async function downloadExcel(rows: Record<string, unknown>[], filename: string) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  // Values stay string cells, including phone numbers and formula-like user input.
  XLSX.utils.book_append_sheet(workbook, sheet, 'Records');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
