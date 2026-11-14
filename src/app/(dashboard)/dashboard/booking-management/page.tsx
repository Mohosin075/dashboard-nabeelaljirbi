'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { phaseOne } from '@/services/phase-one.service';
import { getErrorMessage } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguage } from '@/contexts/language-context';
import { bookingStatuses as statuses, bookingStatusLabel, normalizeBookingStatus } from '@/lib/booking-status';

const selectClass = 'rounded-md border bg-background p-2 text-sm';
function BookingManagementContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const statusLabel = (status: string) => bookingStatusLabel(status, t);
  const role = useAuthStore((s) => s.role),
    tier = useAuthStore((s) => s.adminTier);
  const canEdit =
    role === 'CLINIC' ||
    role === 'MANAGER' ||
    (role === 'ADMIN' && ['SUPER_ADMIN', 'OPERATIONS'].includes(tier || 'SUPER_ADMIN'));
  const [filters, setFilters] = useState({
    clinicId: '',
    doctorId: '',
    patientId: '',
    status: normalizeBookingStatus(searchParams.get('status') || 'ALL'),
    statusView: 'simple',
    startDate: '',
    endDate: '',
    searchTerm: '',
    sort: 'newest',
    limit: 25,
  });
  const [page, setPage] = useState(1),
    [rows, setRows] = useState<any[]>([]),
    [total, setTotal] = useState(0);
  const [options, setOptions] = useState<any>({ clinics: [], doctors: [], patients: [] });
  const [selected, setSelected] = useState<string[]>([]),
    [action, setAction] = useState('CONFIRMED'),
    [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(''),
    [result, setResult] = useState<any>(null);
  const generation = useRef(0);
  const change = (key: string, value: unknown) => {
    setPage(1);
    setSelected([]);
    setRows([]);
    setLoading(true);
    setFilters((f) => ({
      ...f,
      [key]: value,
      ...(key === 'clinicId'
        ? { doctorId: '', patientId: '' }
        : ['doctorId', 'searchTerm'].includes(key)
          ? { patientId: '' }
          : {}),
    }));
  };
  const load = async () => {
    const current = ++generation.current;
    setLoading(true);
    setError('');
    try {
      const data = await phaseOne.get('bookings', { ...filters, page });
      if (current === generation.current) {
        setRows(data.data);
        setTotal(data.meta.total);
        setSelected([]);
      }
    } catch (e) {
      if (current === generation.current) {
        setError(getErrorMessage(e));
        setRows([]);
      }
    } finally {
      if (current === generation.current) setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => {
      clearTimeout(timer);
      generation.current++;
    };
  }, [filters, page]);
  useEffect(() => {
    let live = true;
    phaseOne
      .get('booking-options', {
        clinicId: filters.clinicId,
        doctorId: filters.doctorId,
        patientSearch: filters.searchTerm,
      })
      .then((data) => {
        if (live) setOptions(data);
      })
      .catch((e) => {
        if (live) setError(getErrorMessage(e));
      });
    return () => {
      live = false;
    };
  }, [filters.clinicId, filters.doctorId, filters.searchTerm]);
  const apply = async () => {
    if (!window.confirm(`${t('applyToSelected', 'Apply to selected')} (${selected.length}): ${statusLabel(action)}?`))
      return;
    setBusy(true);
    setError('');
    try {
      setResult(await phaseOne.post('bookings/bulk', { ids: selected, action, reason }));
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const download = async (format: string) => {
    setBusy(true);
    try {
      await phaseOne.download('bookings', format, filters);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{t('bookingManagement', 'Booking Management')}</h1>
        <p className="text-sm text-muted-foreground">
          {t(
            'bookingManagementDescription',
            'Filter appointments, select bookings, and review each action result.'
          )}
        </p>
      </div>
      <Card>
        <CardContent className="grid gap-3 p-5 md:grid-cols-3 xl:grid-cols-4">
          <label className="text-sm">
            {t('search', 'Name or phone')}
            <Input
              aria-label={t("Name or phone", "Name or phone")}
              value={filters.searchTerm}
              onChange={(e) => change('searchTerm', e.target.value)}
            />
          </label>
          <label className="text-sm">
            {t('clinic', 'Clinic')}
            <select
              className={`${selectClass} w-full`}
              aria-label={t("Clinic", "Clinic")}
              value={filters.clinicId}
              onChange={(e) => change('clinicId', e.target.value)}
            >
              <option value="">{t('allClinics', 'All clinics')}</option>
              {options.clinics.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.clinicName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            {t('doctor', 'Doctor')}
            <select
              className={`${selectClass} w-full`}
              aria-label={t("Doctor", "Doctor")}
              value={filters.doctorId}
              onChange={(e) => change('doctorId', e.target.value)}
            >
              <option value="">{t('allDoctors', 'All doctors')}</option>
              {options.doctors.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.user.fullName} · {d.user.phoneNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            {t('patient', 'Patient')}
            <select
              aria-label={t("Patient", "Patient")}
              className={`${selectClass} w-full`}
              value={filters.patientId}
              onChange={(e) => change('patientId', e.target.value)}
            >
              <option value="">{t('allPatients', 'All patients')}</option>
              {options.patients.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.user.fullName} · {p.user.phoneNumber}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              {t('patientSearchHint', 'Use name or phone search to narrow patient choices.')}
            </span>
          </label>
          <label className="text-sm">
            {t('status', 'Status')}
            <select
              className={`${selectClass} w-full`}
              aria-label={t("Status", "Status")}
              value={filters.status}
              onChange={(e) => change('status', e.target.value)}
            >
              <option value="ALL">{t('allStatuses', 'All statuses')}</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            {t('fromDate', 'From date')}
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => change('startDate', e.target.value)}
            />
          </label>
          <label className="text-sm">
            {t('toDate', 'To date')}
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => change('endDate', e.target.value)}
            />
          </label>
          <div className="flex items-end gap-2">
            <label className="text-sm">
              {t('sort', 'Sort')}
              <select
                className={`${selectClass} block`}
                aria-label={t("Sort", "Sort")}
                value={filters.sort}
                onChange={(e) => change('sort', e.target.value)}
              >
                {['requests', 'date', 'newest', 'serial'].map((s) => (
                  <option key={s} value={s}>
                    {s === 'requests'
                      ? 'Request time (oldest first)'
                      : s === 'newest'
                        ? 'Newest first'
                        : s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              {t('rows', 'Rows')}
              <select
                className={`${selectClass} block`}
                aria-label={t("Rows", "Rows")}
                value={filters.limit}
                onChange={(e) => change('limit', Number(e.target.value))}
              >
                {[25, 100, 500, 1000, 5000].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>
        </CardContent>
      </Card>
      {error && (
        <p role="alert" className="rounded border border-red-300 p-3 text-red-700">
          {error}
        </p>
      )}
      {canEdit && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <span>{selected.length}/100 {t('selected', 'selected')}</span>
            <select
              aria-label={t("Bulk action", "Bulk action")}
              className={selectClass}
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              {[
                'CONFIRMED',
                'ARRIVED',
                'COMPLETE',
                'CANCELLED',
                'DOCTOR_ABSENT',
                'PATIENT_NO_SHOW',
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Input
              className="max-w-sm"
              placeholder={t('absenceOrCancellationReason', 'Reason for cancellation or absence')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              disabled={
                busy ||
                loading ||
                !selected.length ||
                (['CANCELLED', 'DOCTOR_ABSENT', 'PATIENT_NO_SHOW'].includes(action) &&
                  !reason.trim())
              }
              onClick={apply}
            >
              {t('applyToSelected', 'Apply to selected')}
            </Button>
          </CardContent>
        </Card>
      )}
      {result && (
        <div role="status" className="rounded border p-4">
          {result.successCount} {t("succeeded;", "succeeded;")} {result.failureCount} {t("failed.", "failed.")}
          {result.results
            .filter((r: any) => r.message)
            .map((r: any) => (
              <p key={r.id} className="text-sm text-red-700">
                {r.id}: {r.message}
              </p>
            ))}
        </div>
      )}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{total} {t('appointments', 'Appointments')}</CardTitle>
          {role !== 'MANAGER' && (
            <div className="flex gap-2">
              <Button variant="outline" disabled={busy || loading} onClick={() => download('pdf')}>
                PDF
              </Button>
              <Button variant="outline" disabled={busy || loading} onClick={() => download('xlsx')}>
                Excel
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <p role="status">{t("Loading appointments…", "Loading appointments…")}</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr>
                    {[
                      'Select',
                      'Date / Serial',
                      'Patient / Phone',
                      'Doctor',
                      'Clinic',
                      'Status',
                      'Consultation',
                      'Patient fee',
                      'Clinic fee',
                      'Model / Country',
                    ].map((h) => (
                      <th key={h} className="border-b p-3">
                        {t(h, h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="p-3">
                        {canEdit && (
                          <input
                            type="checkbox"
                            aria-label={`Select booking ${row.id}`}
                            checked={selected.includes(row.id)}
                            disabled={
                              busy || (selected.length >= 100 && !selected.includes(row.id))
                            }
                            onChange={(e) =>
                              setSelected((ids) =>
                                e.target.checked
                                  ? [...ids, row.id]
                                  : ids.filter((id) => id !== row.id)
                              )
                            }
                          />
                        )}
                      </td>
                      <td className="p-3">
                        {row.consultDate.slice(0, 10)}
                        <br />#{row.serialNumber}
                      </td>
                      <td className="p-3">
                        {row.familyMemberName ? <><strong>{row.familyMemberName}</strong> ({row.familyMemberRelation || 'Family'})<br />{t("Account:", "Account:")} </> : null}{row.patient.user.fullName}
                        <br />
                        {row.patient.user.phoneNumber}
                      </td>
                      <td className="p-3">{row.doctor.user.fullName}</td>
                      <td className="p-3">{row.clinic?.clinicName || '—'}</td>
                      <td className="p-3">{statusLabel(row.displayStatus)}</td>
                      <td className="p-3">{row.consultFee.toFixed(2)}</td>
                      <td className="p-3">{row.serviceFeeAmount.toFixed(2)}</td>
                      <td className="p-3">{row.clinicServiceFee.toFixed(2)}</td>
                      <td className="p-3">
                        {row.collectionMode}
                        <br />
                        {row.feeCountry || 'Historical unspecified'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rows.length && (
                <p className="p-6 text-center">{t('noMatchingAppointments', 'No appointments match these filters.')}</p>
              )}
            </div>
          )}
          <div className="mt-4 flex items-center gap-4">
            <Button
              variant="outline"
              disabled={loading || page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t('previous', 'Previous')}
            </Button>
            <span>
              {t("Page", "Page")} {page} / {Math.max(1, Math.ceil(total / filters.limit))}
            </span>
            <Button
              variant="outline"
              disabled={loading || page * filters.limit >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('next', 'Next')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingManagementPage() {
  return <Suspense><BookingManagementContent /></Suspense>;
}
