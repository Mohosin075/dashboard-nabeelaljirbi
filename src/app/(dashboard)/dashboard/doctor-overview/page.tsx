'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Panel, useOperation } from '@/components/operations-ui';
import { phaseOne } from '@/services/phase-one.service';
export default function DoctorOverviewPage() {
  const op = useOperation(),
    [data, setData] = useState<any>(null);
  useEffect(() => {
    void op.run(async () => setData(await phaseOne.get('overview')));
  }, []);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Doctor Dashboard</h1>
      {op.feedback}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Panel title="Today’s bookings">
              <p className="text-3xl font-semibold">{data.todayCount}</p>
            </Panel>
            <Panel title="Wallet balance">
              <p className="text-3xl font-semibold">{data.wallet.toFixed(2)}</p>
            </Panel>
            <Panel title="Frozen balance">
              <p className="text-3xl font-semibold">{data.frozenWallet.toFixed(2)}</p>
            </Panel>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {Object.entries(data.statusCounts).map(([s, n]) => (
              <Panel key={s} title={s}>
                <p className="text-2xl">{String(n)}</p>
              </Panel>
            ))}
          </div>
          <Panel title="Upcoming appointments">
            {data.upcoming.map((b: any) => (
              <div key={b.id} className="border-b py-3">
                <strong>{b.patient.user.fullName}</strong>
                <p>
                  {b.consultDate.slice(0, 10)} · {b.startTime} · #{b.serialNumber} · {b.status}
                </p>
                <p>{b.clinic.clinicName}</p>
              </div>
            ))}
            {!data.upcoming.length && <p>No upcoming appointments.</p>}
            <Link
              href="/dashboard/booking-management"
              className="inline-block text-blue-700 underline"
            >
              View and filter all appointments
            </Link>
          </Panel>
          <div className="flex flex-wrap gap-5">
            <Link className="text-blue-700 underline" href="/dashboard/ledger-reports">
              Ledger & reports
            </Link>
            <Link className="text-blue-700 underline" href="/dashboard/payout-profile">
              Bank details & withdrawals
            </Link>
            <Link className="text-blue-700 underline" href="/dashboard/profile-changes">
              Profile changes
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
