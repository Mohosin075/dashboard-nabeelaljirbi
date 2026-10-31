'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Panel, selectStyle, useOperation } from '@/components/operations-ui';
import { phaseOne } from '@/services/phase-one.service';
export default function LedgerReportsPage() {
  const op = useOperation();
  const [filters, setFilters] = useState({ startDate: '', endDate: '', type: 'ALL', limit: 25 });
  const [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const data = await phaseOne.get('wallet-history', { ...filters, page });
    setRows(data.data);
    setTotal(data.meta.total);
  };
  useEffect(() => {
    void op.run(load);
  }, [page, filters]);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Wallet Ledger & Reports</h1>
      <p className="text-sm text-muted-foreground">
        Every export preserves the selected filters and includes all matching pages. Booking fee
        reports are available from Booking Management.
      </p>
      {op.feedback}
      <Panel title="Filters">
        <div className="grid gap-3 sm:grid-cols-4">
          {['startDate', 'endDate'].map((k) => (
            <Field key={k} label={k === 'startDate' ? 'From date' : 'To date'}>
              <Input
                type="date"
                value={filters[k as 'startDate']}
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({ ...f, [k]: e.target.value }));
                }}
              />
            </Field>
          ))}
          <Field label="Type">
            <select
              className={selectStyle}
              value={filters.type}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, type: e.target.value }));
              }}
            >
              {[
                'ALL',
                'RECHARGE',
                'REFERALL',
                'BOOKING',
                'WITHDRAW',
                'CANCEL',
                'REFUND',
                'PENALTY',
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Rows">
            <select
              className={selectStyle}
              value={filters.limit}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, limit: Number(e.target.value) }));
              }}
            >
              {[25, 100, 500, 1000, 5000].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex gap-3">
          {['pdf', 'xlsx'].map((format) => (
            <Button
              key={format}
              variant="outline"
              disabled={op.busy}
              onClick={() => op.run(() => phaseOne.download('wallet', format, filters))}
            >
              {format === 'pdf' ? 'Download PDF' : 'Download Excel'}
            </Button>
          ))}
        </div>
      </Panel>
      <Panel title={`${total} ledger records`}>
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {['Date', 'Source record', 'Booking', 'Type', 'Direction', 'Amount'].map((h) => (
                  <th className="border-b p-3" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr className="border-b" key={r.id}>
                  <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-3">{r.id}</td>
                  <td className="p-3">{r.appointmentId || '—'}</td>
                  <td className="p-3">{r.type}</td>
                  <td className="p-3">{r.direction}</td>
                  <td className="p-3">{r.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <p>No matching transactions.</p>}
        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={op.busy || page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button
            variant="outline"
            disabled={op.busy || page * filters.limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </Panel>
    </div>
  );
}
