'use client';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import type { ReactNode } from 'react';

const fieldLabelsI18n: Record<string, { en: string; ar: string }> = {
  iban: { en: 'IBAN', ar: 'الآيبان (IBAN)' },
  fullName: { en: 'Full name', ar: 'الاسم الكامل' },
  phoneNumber: { en: 'Phone number', ar: 'رقم الهاتف' },
  dateOfBirth: { en: 'Date of birth', ar: 'تاريخ الميلاد' },
  accountNumber: { en: 'Account number', ar: 'رقم الحساب' },
  beneficiaryName: { en: 'Beneficiary name', ar: 'اسم المستفيد' },
  bankName: { en: 'Bank name', ar: 'اسم البنك' },
  clinicName: { en: 'Clinic name', ar: 'اسم العيادة' },
  managerName: { en: 'Manager name', ar: 'اسم المدير' },
  managerPhone: { en: 'Manager phone', ar: 'هاتف المدير' },
  contactPhone: { en: 'Contact phone', ar: 'هاتف التواصل' },
  licenseNumber: { en: 'License number', ar: 'رقم الترخيص' },
  consultFee: { en: 'Consultation fee', ar: 'رسوم الاستشارة' },
};

export function fieldLabel(key: string, language?: string) {
  const lang =
    language ||
    (typeof document !== 'undefined' && document.documentElement.lang === 'ar' ? 'ar' : 'en');
  if (fieldLabelsI18n[key]) {
    return lang === 'ar' ? fieldLabelsI18n[key].ar : fieldLabelsI18n[key].en;
  }
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t(title, title)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <label className="block space-y-1 text-sm">
      <span>{t(label, label)}</span>
      {children}
    </label>
  );
}

export const selectStyle = 'w-full rounded-md border bg-background px-3 py-2 text-sm';

export function useOperation() {
  const { tr } = useLanguage();
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
            {tr(error)}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="rounded border border-green-300 bg-green-50 p-3 text-green-800"
          >
            {tr(message)}
          </p>
        )}
      </>
    ),
  };
}
