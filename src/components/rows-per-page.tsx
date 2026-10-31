'use client';
export function RowsPerPage({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      Rows per page
      <select
        className="rounded border bg-background p-2"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {[10, 25, 100, 500, 1000, 5000].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
