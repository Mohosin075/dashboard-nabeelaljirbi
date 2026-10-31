'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fieldLabel, Field, Panel, selectStyle, useOperation } from '@/components/operations-ui';
import { phaseOne } from '@/services/phase-one.service';
import { useAuthStore } from '@/stores/auth-store';

export default function ProfileChangesPage() {
  const role = useAuthStore((s) => s.role),
    tier = useAuthStore((s) => s.adminTier);
  const admin = role === 'ADMIN',
    review = admin && ['SUPER_ADMIN', 'OPERATIONS'].includes(tier || 'SUPER_ADMIN');
  const op = useOperation();
  const [access, setAccess] = useState<any>(null),
    [requests, setRequests] = useState<any[]>([]),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0);
  const [status, setStatus] = useState('PENDING'),
    [changes, setChanges] = useState<Record<string, string>>({}),
    [reason, setReason] = useState(''),
    [response, setResponse] = useState('');
  const load = async () => {
    const data = await phaseOne.get('profile-changes', {
      status: status || undefined,
      page,
      limit: 25,
    });
    setRequests(data.data);
    setTotal(data.meta.total);
    if (!admin) setAccess(await phaseOne.get('profile-access'));
  };
  useEffect(() => {
    void op.run(load);
  }, [page, status, admin]);
  const submit = () =>
    op.run(async () => {
      const values = Object.fromEntries(
        Object.entries(changes).filter(([key, value]) => String(access.values[key] ?? '') !== value)
      );
      await phaseOne.post('profile-changes', { changes: values, reason });
      setChanges({});
      setReason('');
      await load();
    }, 'Change request submitted for review.');
  return (
    <div className="max-w-5xl space-y-5">
      <h1 className="text-2xl font-semibold">Profile Changes</h1>
      {op.feedback}
      {!admin && access && (
        <Panel
          title={
            access.locked
              ? 'Approved profile — request a change'
              : 'Request an administrative profile correction'
          }
        >
          <p className="text-sm text-muted-foreground">
            Main Admin reviews the requested fields before updating your profile.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {access.fields.map((key: string) => (
              <Field key={key} label={fieldLabel(key)}>
                <Input
                  value={changes[key] ?? String(access.values[key] ?? '')}
                  onChange={(e) => setChanges((c) => ({ ...c, [key]: e.target.value }))}
                />
              </Field>
            ))}
          </div>
          <Field label="Reason">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <Button disabled={op.busy} onClick={submit}>
            Submit request
          </Button>
        </Panel>
      )}
      <Panel title="Request history">
        <Field label="Status">
          <select
            className={selectStyle}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        {review && (
          <Field label="Review response">
            <Input value={response} onChange={(e) => setResponse(e.target.value)} />
          </Field>
        )}
        {requests.map((row) => (
          <article key={row.id} className="space-y-2 rounded-md border p-4">
            <div className="flex justify-between gap-3">
              <strong>
                {row.user.fullName || row.user.phoneNumber} · {row.user.role}
              </strong>
              <span>{row.status}</span>
            </div>
            <p className="text-sm">{row.reason}</p>
            <dl className="space-y-1 text-sm">
              {Object.entries(row.changes.values).map(([key, value]) => (
                <div key={key}>
                  <dt className="inline font-medium">{fieldLabel(key)}: </dt>
                  <dd className="inline">
                    {String(row.changes.before[key] ?? 'Empty')} → {String(value ?? 'Empty')}
                  </dd>
                </div>
              ))}
            </dl>
            {row.adminResponse && <p className="text-sm">Response: {row.adminResponse}</p>}
            {review && row.status === 'PENDING' && (
              <div className="flex gap-2">
                {['APPROVED', 'REJECTED'].map((s) => (
                  <Button
                    key={s}
                    variant={s === 'REJECTED' ? 'outline' : 'default'}
                    disabled={op.busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          `${s === 'APPROVED' ? 'Approve' : 'Reject'} this exact profile change?`
                        )
                      )
                        void op.run(async () => {
                          await phaseOne.patch(`profile-changes/${row.id}`, {
                            status: s,
                            response,
                          });
                          await load();
                        }, 'Review saved.');
                    }}
                  >
                    {s === 'APPROVED' ? 'Approve' : 'Reject'}
                  </Button>
                ))}
              </div>
            )}
          </article>
        ))}
        {!requests.length && <p>No matching requests.</p>}
        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={op.busy || page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span>
            {page} / {Math.max(1, Math.ceil(total / 25))}
          </span>
          <Button
            variant="outline"
            disabled={op.busy || page * 25 >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </Panel>
    </div>
  );
}
