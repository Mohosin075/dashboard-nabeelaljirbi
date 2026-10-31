'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Panel, selectStyle, useOperation } from '@/components/operations-ui';
import { phaseOne } from '@/services/phase-one.service';
import { adminService } from '@/services/admin.service';
import { useAuthStore } from '@/stores/auth-store';
export default function AccountControlsPage() {
  const op = useOperation(),
    superAdmin = (useAuthStore((s) => s.adminTier) || 'SUPER_ADMIN') === 'SUPER_ADMIN';
  const [clinics, setClinics] = useState<any[]>([]),
    [clinicId, setClinicId] = useState(''),
    [field, setField] = useState('contact'),
    [phoneNumber, setPhone] = useState('');
  const [kind, setKind] = useState('DOCTOR'),
    [search, setSearch] = useState(''),
    [users, setUsers] = useState<any[]>([]),
    [userId, setUserId] = useState(''),
    [enabled, setEnabled] = useState(false);
  const [controlReady, setControlReady] = useState(false);
  useEffect(() => {
    let active = true;
    setControlReady(false);
    if (userId)
      void op.run(async () => {
        const current = await phaseOne.get(`accounts/${userId}/controls`);
        if (active) {
          setEnabled(
            kind === 'DOCTOR' ? current.remoteConsultationsEnabled : current.profileApproved
          );
          setControlReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, [userId, kind]);
  useEffect(() => {
    void op.run(async () => setClinics((await phaseOne.get('booking-options')).clinics));
  }, []);
  const searchAccounts = () =>
    op.run(async () => {
      const response =
        kind === 'DOCTOR'
          ? await adminService.getDoctors({ search, limit: 100 })
          : await adminService.getPatients({ search, limit: 100 });
      setUsers(response.data.data);
      setUserId('');
      setEnabled(false);
    });
  return (
    <div className="max-w-4xl space-y-5">
      <h1 className="text-2xl font-semibold">Account Controls</h1>
      {op.feedback}
      <Panel title="Correct a clinic phone">
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (window.confirm('Save this clinic phone correction?'))
              void op.run(async () => {
                await phaseOne.patch('clinic-phone', { clinicId, field, phoneNumber });
                setPhone('');
              }, 'Clinic phone updated and audited.');
          }}
        >
          <Field label="Clinic">
            <select
              required
              className={selectStyle}
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
            >
              <option value="">Choose clinic</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clinicName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phone field">
            <select
              className={selectStyle}
              value={field}
              onChange={(e) => setField(e.target.value)}
            >
              <option value="contact">Public contact phone</option>
              <option value="manager">Clinic manager phone</option>
              <option value="login">Login phone</option>
            </select>
          </Field>
          <Field label="New phone">
            <Input
              required
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Button className="self-end" disabled={op.busy || !clinicId}>
            Save phone
          </Button>
        </form>
      </Panel>
      {superAdmin && (
        <Panel title="Main Admin account approval">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Account type">
              <select
                className={selectStyle}
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value);
                  setUsers([]);
                  setUserId('');
                  setEnabled(false);
                }}
              >
                <option value="DOCTOR">Doctor remote consultation eligibility</option>
                <option value="PATIENT">Patient profile approval</option>
              </select>
            </Field>
            <Field label="Search name or phone">
              <Input value={search} onChange={(e) => setSearch(e.target.value)} />
            </Field>
            <Button variant="outline" disabled={op.busy} onClick={searchAccounts}>
              Find accounts
            </Button>
          </div>
          <Field label="Account">
            <select
              className={selectStyle}
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setEnabled(false);
              }}
            >
              <option value="">Choose an account</option>
              {users.map((u) => (
                <option key={u.id} value={u.userId || u.id}>
                  {u.fullName || u.name || u.phoneNumber} · {u.phoneNumber}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={!controlReady || op.busy}
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            {kind === 'DOCTOR'
              ? 'Enable remote consultation withdrawal requests'
              : 'Approve and lock core patient profile'}
          </label>
          <p className="text-sm text-muted-foreground">
            Doctor eligibility only permits submitting a request. Every payment still requires
            finance review.
          </p>
          <Button
            disabled={op.busy || !userId || !controlReady}
            onClick={() => {
              if (
                window.confirm(`Set this account control to ${enabled ? 'enabled' : 'disabled'}?`)
              )
                void op.run(async () => {
                  await phaseOne.patch(`accounts/${userId}/controls`, {
                    [kind === 'DOCTOR' ? 'remoteConsultationsEnabled' : 'profileApproved']: enabled,
                  });
                }, 'Account control saved and audited.');
            }}
          >
            Save account control
          </Button>
        </Panel>
      )}
    </div>
  );
}
