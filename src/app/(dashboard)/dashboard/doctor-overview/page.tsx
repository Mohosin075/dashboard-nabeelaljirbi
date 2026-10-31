'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Panel, useOperation } from '@/components/operations-ui';
import { phaseOne } from '@/services/phase-one.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/operations-ui';
export default function DoctorOverviewPage() {
  const op = useOperation(),
    [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState({ startDate: '', endDate: '' });
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
          <Panel title="Earnings and withdrawals">
            <div className="flex flex-wrap items-end gap-3">
              {['startDate', 'endDate'].map((key) => (
                <Field key={key} label={key === 'startDate' ? 'From date' : 'To date'}>
                  <Input
                    type="date"
                    value={period[key as 'startDate']}
                    onChange={(e) => setPeriod((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </Field>
              ))}
              <Button
                disabled={op.busy}
                variant="outline"
                onClick={() => op.run(async () => setData(await phaseOne.get('overview', period)))}
              >
                Apply earnings dates
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Wallet amounts are in {data.walletCountry || 'your registered country'} wallet units.
              Earnings use journal dates; consultation values use appointment dates. Today’s
              bookings and upcoming appointments remain current.
            </p>
            {data.earnings && (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['bookingCredits', 'Recorded booking credits'],
                    ['referralCredits', 'Referral earnings'],
                    ['feeDebits', 'Booking fee debits'],
                    ['refundDebits', 'Refund debits'],
                    ['netRecordedEarnings', 'Net recorded wallet earnings'],
                    ['paidWithdrawals', 'Paid wallet withdrawals'],
                  ].map(([key, label]) => (
                    <div className="rounded border p-4" key={key}>
                      <p className="text-sm">{label}</p>
                      <strong className="text-xl">{data.earnings[key!].toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Net recorded wallet earnings excludes wallet top-ups and withdrawals. Cash
                  consultation value is shown separately.{' '}
                  {data.earnings.unclassifiedHistoricalBookings} historical booking entries have no
                  explicit credit/debit classification and are excluded from this earnings
                  calculation.
                </p>
                <h2 className="font-semibold">Completed consultation value by country</h2>
                {data.earnings.completedConsultations.map((c: any) => (
                  <p key={`${c.country}:${c.model}`}>
                    {c.country} · {c.model}: {c.count} consultations · {c.gross.toFixed(2)}
                  </p>
                ))}
                {!data.earnings.completedConsultations.length && (
                  <p>No completed consultations in this period.</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Consultation gross value includes clinic collections; it is not a statement of
                  doctor remuneration.
                </p>
              </>
            )}
          </Panel>
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
