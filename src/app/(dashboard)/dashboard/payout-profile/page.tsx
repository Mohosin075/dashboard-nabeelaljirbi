'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fieldLabel, Field, Panel, selectStyle, useOperation } from '@/components/operations-ui';
import { phaseOne } from '@/services/phase-one.service';
import { useAuthStore } from '@/stores/auth-store';
import { RowsPerPage } from '@/components/rows-per-page';
export default function PayoutProfilePage() {
  const op = useOperation(),
    role = useAuthStore((s) => s.role);
  const [bank, setBank] = useState({
    beneficiaryName: '',
    bankName: '',
    iban: '',
    accountNumber: '',
  });
  const [eligible, setEligible] = useState(false),
    [amount, setAmount] = useState(''),
    [method, setMethod] = useState('BANK'),
    [status, setStatus] = useState('ALL');
  const [rows, setRows] = useState<any[]>([]),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', searchTerm: '', limit: 25 });
  const requestVersion = useRef(0);
  const load = async () => {
    const version = ++requestVersion.current;
    const history = await phaseOne.get('payouts', { ...filters, status, page });
    if (version !== requestVersion.current) return;
    setRows(history.data);
    setTotal(history.meta.total);
  };
  useEffect(() => {
    void op.run(async () => {
      const profile = await phaseOne.get('payout-profile');
      setBank(
        profile.bankDetails || { beneficiaryName: '', bankName: '', iban: '', accountNumber: '' }
      );
      setEligible(role === 'CLINIC' || profile.remoteConsultationsEnabled);
    });
  }, [role]);
  useEffect(() => {
    void op.run(load);
    return () => {
      requestVersion.current++;
    };
  }, [page, status, filters]);
  return (
    <div className="max-w-4xl space-y-5">
      <h1 className="text-2xl font-semibold">Bank Details & Withdrawals</h1>
      {op.feedback}
      <Panel title="Saved bank details">
        <p className="text-sm text-muted-foreground">
          Your saved destination is copied to each bank withdrawal request. Later edits apply to
          future requests.
        </p>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void op.run(async () => {
              await phaseOne.put('payout-profile', bank);
            }, 'Bank details saved.');
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(bank).map(([key, value]) => (
              <Field key={key} label={fieldLabel(key)}>
                <Input
                  value={value}
                  maxLength={160}
                  required={['beneficiaryName', 'bankName'].includes(key)}
                  onChange={(e) => setBank((b) => ({ ...b, [key]: e.target.value }))}
                />
              </Field>
            ))}
          </div>
          <Button disabled={op.busy}>Save details</Button>
        </form>
      </Panel>
      <Panel title="Request withdrawal">
        {!eligible && (
          <p>Doctor withdrawals are available after Main Admin enables remote consultations.</p>
        )}
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (window.confirm(`Submit ${method} withdrawal request for ${amount}?`))
              void op.run(async () => {
                await phaseOne.post('payouts', { amount: Number(amount), payoutMethod: method });
                setAmount('');
                await load();
              }, 'Request submitted. Admin approval is required before payment.');
          }}
        >
          <Field label="Amount">
            <Input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Payout method">
            <select
              className={selectStyle}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="BANK">Bank transfer</option>
              <option value="CASH">Cash</option>
            </select>
          </Field>
          <Button disabled={op.busy || !eligible}>Submit request</Button>
        </form>
      </Panel>
      <Panel title="Request history">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Search name, phone or reference">
            <Input
              value={filters.searchTerm}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, searchTerm: e.target.value }));
              }}
            />
          </Field>
          {['startDate', 'endDate'].map((key) => (
            <Field key={key} label={key === 'startDate' ? 'From date' : 'To date'}>
              <Input
                type="date"
                value={filters[key as 'startDate']}
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({ ...f, [key]: e.target.value }));
                }}
              />
            </Field>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <RowsPerPage
            value={filters.limit}
            onChange={(limit) => {
              setPage(1);
              setFilters((f) => ({ ...f, limit }));
            }}
          />
          {['pdf', 'xlsx'].map((format) => (
            <Button
              key={format}
              disabled={op.busy}
              variant="outline"
              onClick={() =>
                op.run(() => phaseOne.download('payouts', format, { ...filters, status }))
              }
            >
              {format === 'pdf' ? 'Download PDF' : 'Download Excel'}
            </Button>
          ))}
        </div>
        <Field label="Status">
          <select
            className={selectStyle}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED', 'REJECTED'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        {rows.map((r) => (
          <article className="space-y-2 rounded border p-4" key={r.id}>
            <div className="flex justify-between gap-3">
              <strong>
                {r.amount.toFixed(2)} · {r.payoutMethod || 'Historical'}
              </strong>
              <span>{r.status === 'COMPLETED' ? 'PAID' : r.status}</span>
            </div>
            <p className="text-sm">
              {r.settlementNumber} · {new Date(r.createdAt).toLocaleString()}
            </p>
            {r.bankDetails && (
              <p className="text-sm">
                {r.bankDetails.beneficiaryName} · {r.bankDetails.bankName} ·{' '}
                {r.bankDetails.iban || r.bankDetails.accountNumber}
              </p>
            )}
            {r.reference && <p>Reference: {r.reference}</p>}
            {r.receiptUrl && /^https?:\/\//i.test(r.receiptUrl) && (
              <a
                className="text-blue-700 underline"
                href={r.receiptUrl}
                target="_blank"
                rel="noreferrer"
              >
                View payment receipt
              </a>
            )}
          </article>
        ))}
        {!rows.length && <p>No withdrawal requests.</p>}
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
