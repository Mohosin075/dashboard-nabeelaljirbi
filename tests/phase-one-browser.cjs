// Run against our separate QA dashboard/API only; never the production host.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const base = 'http://127.0.0.1:7039';
let browser;
before(async () => { browser = await chromium.launch({ channel: 'msedge', headless: true }); fs.mkdirSync('tmp/phase-one-browser', { recursive: true }); });
after(async () => { await browser.close(); });
async function session(role, id) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  await context.route('**/*', route => { const url = new URL(route.request().url()); return ['127.0.0.1', 'localhost'].includes(url.hostname) ? route.continue() : route.abort(); });
  await context.addInitScript(({ role, id }) => {
    localStorage.setItem('auth-storage', JSON.stringify({ state: { accessToken: id, refreshToken: 'synthetic', role, adminTier: role === 'ADMIN' ? 'SUPER_ADMIN' : null, isAuthenticated: true, profileCompleted: true }, version: 0 }));
    localStorage.setItem('salama_dashboard_language', 'en');
  }, { role, id });
  const page = await context.newPage(); page.setDefaultTimeout(60000);
  return { context, page };
}
test('clinic can filter >500 rows, manually cancel for doctor absence, and download filtered PDF', { timeout: 180000 }, async () => {
  const { context, page } = await session('CLINIC', 'phase1-clinic-user');
  try {
    await page.goto(base + '/dashboard/booking-management');
    await page.getByRole('heading', { name: 'Booking Management', exact: true }).waitFor();
    await page.getByLabel('Rows', { exact: true }).selectOption('1000');
    await page.getByLabel('Status', { exact: true }).selectOption('PENDING');
    await page.getByLabel('Patient', { exact: true }).selectOption('phase1-patient');
    await page.getByRole('checkbox', { name: 'Select booking phase1-legacy-booking' }).check();
    await page.getByLabel('Bulk action').selectOption('DOCTOR_ABSENT');
    await page.getByPlaceholder('Reason for cancellation or absence').fill('Synthetic browser QA doctor absence');
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Apply to selected', exact: true }).click();
    await page.getByRole('status').filter({ hasText: '1 succeeded; 0 failed.' }).waitFor();
    await page.getByLabel('Status', { exact: true }).selectOption('DOCTOR_ABSENT');
    await page.getByText('DOCTOR_ABSENT', { exact: true }).last().waitFor();
    const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'PDF', exact: true }).click();
    const file = await downloaded; assert.equal(file.suggestedFilename(), 'salama-bookings.pdf'); assert.equal(await file.failure(), null);
    await page.screenshot({ path: 'tmp/phase-one-browser/booking-management.png', fullPage: true });
  } catch (error) { console.log('QA page:', page.url(), (await page.locator('body').innerText()).slice(-2000)); await page.screenshot({path:'tmp/phase-one-browser/failure.png',fullPage:true}); throw error; } finally { await context.close(); }
});
test('clinic saves a bank profile and submits an actual cash payout request', { timeout: 180000 }, async () => {
  const { context, page } = await session('CLINIC', 'phase1-clinic-user');
  try {
    await page.goto(base + '/dashboard/payout-profile');
    await page.getByLabel('Beneficiary name').fill('Synthetic Browser Owner'); await page.getByLabel('Bank name').fill('Synthetic Browser Bank'); await page.getByLabel('IBAN', { exact: true }).fill('SYNTHETIC-BROWSER-IBAN');
    await page.getByRole('button', { name: 'Save details', exact: true }).click(); await page.getByRole('status').filter({ hasText: 'Bank details saved.' }).waitFor();
    await page.getByLabel('Amount', { exact: true }).fill('1.25'); await page.getByLabel('Payout method').selectOption('CASH');
    page.once('dialog', dialog => dialog.accept()); await page.getByRole('button', { name: 'Submit request', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Request submitted.' }).waitFor();
    await page.getByText('1.25 · CASH', { exact: true }).first().waitFor();
    await page.screenshot({ path: 'tmp/phase-one-browser/payout-profile.png', fullPage: true });
  } finally { await context.close(); }
});
test('Main Admin finance and profile review screens load; doctor sees only own dashboard', { timeout: 180000 }, async () => {
  const admin = await session('ADMIN', 'phase1-admin');
  try {
    for (const [url, heading] of [['country-finance', 'Country Fees & Financial Monitoring'], ['profile-changes', 'Profile Changes'], ['account-controls', 'Account Controls'], ['receptionists', 'Receptionists'], ['ledger-reports', 'Wallet Ledger & Reports']]) {
      await admin.page.goto(base + '/dashboard/' + url);
      await admin.page.getByRole('heading', { name: heading, exact: true }).waitFor();
      await admin.page.waitForTimeout(500);
      assert.equal((await admin.page.getByRole('alert').allTextContents()).filter(text => text.trim()).length, 0, url + ' should load without an error');
    }
  } finally { await admin.context.close(); }
  const doctor = await session('DOCTOR', 'phase1-doctor-user');
  try {
    await doctor.page.goto(base + '/dashboard/doctor-overview'); await doctor.page.getByRole('heading', { name: 'Doctor Dashboard', exact: true }).waitFor();
    await doctor.page.getByRole('heading', { name: 'Upcoming appointments', exact: true }).waitFor();
    assert.equal(await doctor.page.getByRole('link', { name: 'Country Finance', exact: true }).count(), 0);
    await doctor.page.goto(base + '/dashboard/account-controls'); await doctor.page.getByText('Access Restricted', { exact: true }).waitFor();
  } finally { await doctor.context.close(); }
});
