'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Panel, useOperation } from '@/components/operations-ui';
import { phaseOne } from '@/services/phase-one.service';
import { useAuthStore } from '@/stores/auth-store';
export default function CountryFinancePage() {
  const op = useOperation(),
    tier = useAuthStore((s) => s.adminTier);
  const editable = ['SUPER_ADMIN', 'FINANCE'].includes(tier || 'SUPER_ADMIN');
  const [fees, setFees] = useState<any[]>([]),
    [monitor, setMonitor] = useState<any>(null);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const load = async () => {
    const [saved, data] = await Promise.all([
      phaseOne.get('country-fees'),
      phaseOne.get('financial-monitoring', dates),
    ]);
    setFees(
      ['LIBYA', 'TUNISIA', 'EGYPT', 'ALGERIA'].map((country) => ({
        country,
        amount: '',
        modelBPercentage: '',
        clinicFeePercentage: '',
        ...saved.find((f: any) => f.country === country),
      }))
    );
    setMonitor(data);
  };
  useEffect(() => {
    void op.run(load);
  }, []);
  const update = (i: number, key: string, value: string) =>
    setFees((f) => f.map((row, index) => (index === i ? { ...row, [key]: value } : row)));
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Country Fees & Financial Monitoring</h1>
      {op.feedback}
      <Panel title="Country fee rules">
        <p className="text-sm text-muted-foreground">
          New bookings use the clinic’s country. Model A collects the fixed patient fee; Model B
          applies the patient percentage to the consultation amount. Clinic fees are separate.
          Existing booking snapshots retain their original values.
        </p>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (window.confirm('Apply these rules to future bookings?'))
              void op.run(async () => {
                await phaseOne.put('country-fees', {
                  records: fees.map((f) => ({
                    country: f.country,
                    amount: Number(f.amount),
                    modelBPercentage: Number(f.modelBPercentage),
                    clinicFeePercentage: Number(f.clinicFeePercentage),
                  })),
                });
                await load();
              }, 'Country fee rules saved.');
          }}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {fees.map((f, i) => (
              <section key={f.country} className="space-y-3 rounded-lg border p-4">
                <h2 className="font-semibold">{f.country}</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['amount', 'Model A fixed patient fee'],
                    ['modelBPercentage', 'Model B patient fee %'],
                    ['clinicFeePercentage', 'Clinic platform fee %'],
                  ].map(([key, label]) => (
                    <Field key={key} label={label!}>
                      <Input
                        required
                        type="number"
                        min="0"
                        max={key === 'amount' ? undefined : 100}
                        step="0.01"
                        disabled={!editable}
                        value={f[key!]}
                        onChange={(e) => update(i, key!, e.target.value)}
                      />
                    </Field>
                  ))}
                </div>
              </section>
            ))}
          </div>
          {editable && <Button disabled={op.busy}>Save country rules</Button>}
        </form>
      </Panel>
      {monitor && (
        <>
          <Panel title="Wallets and withdrawals — all time">
            <p className="text-xs text-muted-foreground">
              Balances below are separated by registered country; amounts in different currencies
              must not be treated as a converted total.
            </p>
            {monitor.walletsByCountry?.map((g: any) => (
              <p key={g.country}>
                {g.country || 'Unspecified'}: wallet {g.wallet.toFixed(2)} · frozen{' '}
                {g.frozenWallet.toFixed(2)}
              </p>
            ))}
            <div className="grid gap-3 sm:grid-cols-3">
              {monitor.withdrawals.map((w: any) => (
                <div className="rounded border p-3" key={`${w.country}:${w.status}`}>
                  <strong>
                    {w.country} · {w.status}
                  </strong>
                  <p>
                    {w.count} requests · {w.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Captured platform fees by country">
            <p className="text-sm text-muted-foreground">
              These amounts come from the platform fee ledger. Date filters use the related
              appointment date. Each country is reported separately.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {monitor.capturedFeesByCountry?.map((g: any) => (
                <section key={`${g.country}:${g.model}`} className="rounded border p-4">
                  <strong>
                    {g.country} · {g.model}
                  </strong>
                  <p>Patient fees: {g.patientFee.toFixed(2)}</p>
                  <p>Clinic fees: {g.clinicFee.toFixed(2)}</p>
                  <p>Total captured fees: {g.total.toFixed(2)}</p>
                </section>
              ))}
            </div>
            {!monitor.capturedFeesByCountry?.length && <p>No captured fees match these dates.</p>}
          </Panel>
          <Panel title="Completed consultation sales by country">
            <p className="text-sm text-muted-foreground">
              Gross consultation value for completed bookings. Model A includes cash paid at the
              clinic; it is not platform revenue.
            </p>
            {monitor.completedSalesByCountry?.map((g: any) => (
              <p key={`${g.country}:${g.model}`}>
                {g.country} · {g.model}: {g.count} consultations · {g.gross.toFixed(2)}
              </p>
            ))}
            {!monitor.completedSalesByCountry?.length && (
              <p>No completed consultations match these dates.</p>
            )}
          </Panel>
          <Panel title="Booking fee snapshots by country">
            <div className="flex flex-wrap items-end gap-3">
              {['startDate', 'endDate'].map((key) => (
                <Field key={key} label={key === 'startDate' ? 'From date' : 'To date'}>
                  <Input
                    type="date"
                    value={dates[key as 'startDate']}
                    onChange={(e) => setDates((d) => ({ ...d, [key]: e.target.value }))}
                  />
                </Field>
              ))}
              <Button
                variant="outline"
                disabled={op.busy}
                onClick={() =>
                  op.run(async () => setMonitor(await phaseOne.get('financial-monitoring', dates)))
                }
              >
                Apply dates
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{monitor.notes}</p>
            <div className="overflow-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    {[
                      'Country',
                      'Model',
                      'Status',
                      'Count',
                      'Consultation face value',
                      'Patient fee snapshot',
                      'Clinic fee snapshot',
                    ].map((h) => (
                      <th key={h} className="border-b p-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monitor.bookingGroups.map((g: any, i: number) => (
                    <tr key={i} className="border-b">
                      {[
                        g.country,
                        g.model,
                        g.status,
                        g.count,
                        g.consultationFaceValue.toFixed(2),
                        g.patientFeeSnapshot.toFixed(2),
                        g.clinicFeeSnapshot.toFixed(2),
                      ].map((v, j) => (
                        <td key={j} className="p-3">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
