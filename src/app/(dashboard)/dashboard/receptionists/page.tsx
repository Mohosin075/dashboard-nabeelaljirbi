'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fieldLabel, Field, Panel, selectStyle, useOperation } from '@/components/operations-ui';
import { phaseOne } from '@/services/phase-one.service';
import { useAuthStore } from '@/stores/auth-store';
export default function ReceptionistsPage() {
  const admin = useAuthStore((s) => s.role) === 'ADMIN',
    op = useOperation();
  const [clinicId, setClinicId] = useState(''),
    [clinics, setClinics] = useState<any[]>([]),
    [staff, setStaff] = useState<any[]>([]);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', email: '', password: '' });
  const load = async () => {
    if (!admin || clinicId) setStaff(await phaseOne.get('receptionists', { clinicId }));
    else setStaff([]);
  };
  useEffect(() => {
    if (admin) void op.run(async () => setClinics((await phaseOne.get('booking-options')).clinics));
  }, [admin]);
  useEffect(() => {
    void op.run(load);
  }, [clinicId, admin]);
  return (
    <div className="max-w-4xl space-y-5">
      <h1 className="text-2xl font-semibold">Receptionists</h1>
      <p className="text-sm text-muted-foreground">
        Receptionists manage bookings for their assigned clinic. Use the existing staff login with
        email and password.
      </p>
      {op.feedback}
      {admin && (
        <Field label="Clinic">
          <select
            className={selectStyle}
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
          >
            <option value="">Choose a clinic</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.clinicName}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Panel title="Add receptionist">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void op.run(async () => {
              await phaseOne.post('receptionists', { ...form, clinicId });
              setForm({ fullName: '', phoneNumber: '', email: '', password: '' });
              await load();
            }, 'Receptionist created.');
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(form).map(([key, value]) => (
              <Field label={fieldLabel(key)} key={key}>
                <Input
                  required
                  type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                  minLength={key === 'password' ? 8 : undefined}
                  autoComplete={key === 'password' ? 'new-password' : 'off'}
                  value={value}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </Field>
            ))}
          </div>
          <Button disabled={op.busy || (admin && !clinicId)} type="submit">
            Create receptionist
          </Button>
        </form>
      </Panel>
      <Panel title="Clinic staff">
        {staff.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b py-3"
          >
            <div>
              <strong>{s.user.fullName}</strong>
              <p className="text-sm">
                {s.user.email} · {s.user.phoneNumber} · {s.user.status}
              </p>
            </div>
            <Button
              variant="outline"
              disabled={op.busy}
              onClick={() => {
                if (window.confirm(`Change access for ${s.user.fullName}?`))
                  void op.run(async () => {
                    await phaseOne.patch(`receptionists/${s.user.id}`, {
                      clinicId,
                      status: s.user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                    });
                    await load();
                  }, 'Staff access updated.');
              }}
            >
              {s.user.status === 'ACTIVE' ? 'Suspend access' : 'Activate access'}
            </Button>
          </div>
        ))}
        {!staff.length && <p>No receptionists to display.</p>}
      </Panel>
    </div>
  );
}
