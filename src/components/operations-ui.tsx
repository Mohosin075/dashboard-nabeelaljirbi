'use client';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReactNode } from 'react';
export function fieldLabel(key: string) {
  const labels: Record<string, string> = {
    iban: 'IBAN',
    fullName: 'Full name',
    phoneNumber: 'Phone number',
    dateOfBirth: 'Date of birth',
    accountNumber: 'Account number',
    beneficiaryName: 'Beneficiary name',
    bankName: 'Bank name',
    clinicName: 'Clinic name',
    managerName: 'Manager name',
    managerPhone: 'Manager phone',
    contactPhone: 'Contact phone',
    licenseNumber: 'License number',
    consultFee: 'Consultation fee',
  };
  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span>{label}</span>
      {children}
    </label>
  );
}
export const selectStyle = 'w-full rounded-md border bg-background px-3 py-2 text-sm';
export function useOperation() {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  const run = async (operation: () => Promise<void>, success = '') => {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await operation();
      setMessage(success);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return {
    busy,
    run,
    feedback: (
      <>
        {error && (
          <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="rounded border border-green-300 bg-green-50 p-3 text-green-800"
          >
            {message}
          </p>
        )}
      </>
    ),
  };
}
