'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Field, Panel, useOperation } from '@/components/operations-ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { phaseOne } from '@/services/phase-one.service';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { ArrowUpRight, Save } from 'lucide-react';

const COUNTRY_INFO: Record<string, { name: string; flag: string; nativeName: string; currency: string }> = {
  LIBYA: { name: 'Libya', flag: '🇱🇾', nativeName: 'ليبيا', currency: 'LYD' },
  TUNISIA: { name: 'Tunisia', flag: '🇹🇳', nativeName: 'تونس', currency: 'TND' },
  EGYPT: { name: 'Egypt', flag: '🇪🇬', nativeName: 'مصر', currency: 'EGP' },
  ALGERIA: { name: 'Algeria', flag: '🇩🇿', nativeName: 'الجزائر', currency: 'DZD' },
};
export default function CountryFinancePage() {
  const { t } = useLanguage();
  const op = useOperation(),
    tier = useAuthStore((s) => s.adminTier);
  const editable = ['SUPER_ADMIN', 'FINANCE'].includes(tier || 'SUPER_ADMIN');
  const [fees, setFees] = useState<any[]>([]),
    [monitor, setMonitor] = useState<any>(null);
  const [missingCountries, setMissingCountries] = useState<string[]>([]);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const load = async () => {
    const [saved, data] = await Promise.all([
      phaseOne.get('country-fees'),
      phaseOne.get('financial-monitoring', dates),
    ]);
    setMissingCountries(['LIBYA', 'TUNISIA', 'EGYPT', 'ALGERIA'].filter(country => !saved.some((f: any) => f.country === country && f.amount != null)));
    setFees(
      ['LIBYA', 'TUNISIA', 'EGYPT', 'ALGERIA'].map((country) => {
        const found = saved.find((f: any) => f.country === country);
        return {
          country,
          amount: found?.amount != null ? String(found.amount) : '',
          modelBPercentage: found?.modelBPercentage != null ? String(found.modelBPercentage) : '',
          clinicFeePercentage: found?.clinicFeePercentage != null ? String(found.clinicFeePercentage) : '',
          ...found,
        };
      })
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
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t("Country Fees & Financial Monitoring", "Country Fees & Financial Monitoring")}
          </h1>
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold">
            Global Rules
          </Badge>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          {t("countryFeesSubtitle", "Configure fixed patient consultation service fees and platform percentage commissions by country.")}
        </p>
      </div>
      {op.feedback}
      {missingCountries.length > 0 && <div role="alert" className="rounded border border-amber-400 bg-amber-50 p-4 text-amber-950">{t("Model A bookings are blocked until the fixed patient fee is configured for:", "Model A bookings are blocked until the fixed patient fee is configured for:")} {missingCountries.join(', ')}{t(". Enter the agreed fees below and save. No default fee will be charged.", ". Enter the agreed fees below and save. No default fee will be charged.")}</div>}
      <Panel title={t("Country fee rules", "Country fee rules")}>
        <p className="text-sm text-muted-foreground">
          {t("New bookings use the clinic’s country. Model A collects the fixed patient fee; Model B applies the patient percentage to the consultation amount. Clinic fees are separate. Existing booking snapshots retain their original values.", "New bookings use the clinic’s country. Model A collects the fixed patient fee; Model B applies the patient percentage to the consultation amount. Clinic fees are separate. Existing booking snapshots retain their original values.")}
        </p>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (window.confirm(t('Apply these rules to future bookings?', 'Apply these rules to future bookings?')))
              void op.run(async () => {
                await phaseOne.put('country-fees', {
                  records: fees.map((f) => ({
                    country: f.country,
                    amount: f.amount !== '' && f.amount != null ? Number(f.amount) : 0,
                    modelBPercentage: f.modelBPercentage !== '' && f.modelBPercentage != null ? Number(f.modelBPercentage) : 0,
                    clinicFeePercentage: f.clinicFeePercentage !== '' && f.clinicFeePercentage != null ? Number(f.clinicFeePercentage) : 0,
                  })),
                });
                await load();
              }, 'Country fee rules saved.');
          }}
        >
          {/* Model Explanations Overview Bar */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                  A
                </span>
                <h3 className="text-xs font-bold text-blue-950 sm:text-sm">
                  {t('Model A · Cash consultation', 'Model A · Cash consultation')}
                </h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-blue-800">
                {t(
                  'Salama collects the fixed patient service fee. The consultation fee is paid directly at the clinic.',
                  'Salama collects the fixed patient service fee. The consultation fee is paid directly at the clinic.'
                )}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                    B
                  </span>
                  <h3 className="text-xs font-bold text-emerald-950 sm:text-sm">
                    {t('Model B · Wallet consultation', 'Model B · Wallet consultation')}
                  </h3>
                </div>
                <Link
                  className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700 underline hover:text-emerald-900"
                  href="/dashboard/clinics"
                >
                  {t('Clinic Models', 'Clinic Models')}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                {t(
                  'Salama collects the full doctor consultation fee plus the configured patient percentage.',
                  'Salama collects the full doctor consultation fee plus the configured patient percentage.'
                )}
              </p>
            </div>
          </div>

          {/* Pricing Matrix Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader className="bg-gray-50/90">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-[180px] text-start text-xs font-semibold uppercase tracking-wider text-gray-700">
                      {t('Country', 'Country')}
                    </TableHead>
                    <TableHead className="text-start text-xs font-semibold uppercase tracking-wider text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                          A
                        </span>
                        <span>{t('Fixed patient service fee', 'Model A Patient Fee (Fixed)')}</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-start text-xs font-semibold uppercase tracking-wider text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                          B
                        </span>
                        <span>{t('Patient service fee (%)', 'Model B Patient Fee (%)')}</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-start text-xs font-semibold uppercase tracking-wider text-gray-700">
                      <span>{t('Separate clinic platform fee (%)', 'Clinic Platform Fee (%)')}</span>
                    </TableHead>
                    <TableHead className="w-[120px] text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                      {t('Status', 'Status')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((f, i) => {
                    const info = COUNTRY_INFO[f.country] || {
                      name: f.country,
                      flag: '🌍',
                      nativeName: '',
                      currency: 'LYD',
                    };
                    const isComplete =
                      f.amount !== '' &&
                      f.modelBPercentage !== '' &&
                      f.clinicFeePercentage !== '';
                    return (
                      <TableRow
                        key={f.country}
                        className="border-b border-gray-100 transition-colors hover:bg-slate-50/70"
                      >
                        {/* 1. Country */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl" role="img" aria-label={info.name}>
                              {info.flag}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{info.name}</div>
                              {info.nativeName && (
                                <div className="text-[11px] font-medium text-gray-500">
                                  {info.nativeName}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Model A Fixed Fee */}
                        <TableCell className="py-3.5">
                          <div className="relative max-w-[150px]">
                            <Input
                              required
                              type="number"
                              min="0"
                              step="0.01"
                              disabled={!editable}
                              value={f.amount ?? ''}
                              placeholder="0.00"
                              onChange={(e) => update(i, 'amount', e.target.value)}
                              className="h-9 border-gray-200 pe-11 font-mono text-xs font-semibold text-gray-900 focus:border-blue-500"
                            />
                            <span className="pointer-events-none absolute end-2.5 top-2 text-[11px] font-bold text-gray-500">
                              {info.currency}
                            </span>
                          </div>
                        </TableCell>

                        {/* 3. Model B Percentage */}
                        <TableCell className="py-3.5">
                          <div className="relative max-w-[140px]">
                            <Input
                              required
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              disabled={!editable}
                              value={f.modelBPercentage ?? ''}
                              placeholder="0.00"
                              onChange={(e) => update(i, 'modelBPercentage', e.target.value)}
                              className="h-9 border-gray-200 pe-8 font-mono text-xs font-semibold text-gray-900 focus:border-emerald-500"
                            />
                            <span className="pointer-events-none absolute end-2.5 top-2 text-xs font-bold text-gray-400">
                              %
                            </span>
                          </div>
                        </TableCell>

                        {/* 4. Clinic Fee Percentage */}
                        <TableCell className="py-3.5">
                          <div className="relative max-w-[140px]">
                            <Input
                              required
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              disabled={!editable}
                              value={f.clinicFeePercentage ?? ''}
                              placeholder="0.00"
                              onChange={(e) => update(i, 'clinicFeePercentage', e.target.value)}
                              className="h-9 border-gray-200 pe-8 font-mono text-xs font-semibold text-gray-900 focus:border-purple-500"
                            />
                            <span className="pointer-events-none absolute end-2.5 top-2 text-xs font-bold text-gray-400">
                              %
                            </span>
                          </div>
                        </TableCell>

                        {/* 5. Status */}
                        <TableCell className="py-3.5 text-center">
                          {isComplete ? (
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {t('configured', 'Active')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              {t('incomplete', 'Incomplete')}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Save Button Toolbar */}
            {editable && (
              <div className="flex flex-col items-center justify-between gap-3 border-t bg-gray-50/80 px-4 py-3 sm:flex-row">
                <p className="text-center text-xs text-muted-foreground sm:text-start">
                  {t(
                    'Applied instantly to new bookings created in the respective country.',
                    'Applied instantly to new bookings created in the respective country.'
                  )}
                </p>
                <Button
                  type="submit"
                  disabled={op.busy}
                  className="gap-2 bg-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 sm:text-sm"
                >
                  <Save className="h-4 w-4" />
                  {t('Save country rules', 'Save country rules')}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Panel>
      {monitor && (
        <>


          <Panel title={t("Booking fee snapshots by country", "Booking fee snapshots by country")}>
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
                {t("Apply dates", "Apply dates")}
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
