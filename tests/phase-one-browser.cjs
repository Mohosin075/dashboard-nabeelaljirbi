// Run against our separate QA dashboard/API only; never the production host.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const base = 'http://127.0.0.1:7039';
let browser;
before(async () => { browser = await chromium.launch({ channel: 'msedge', headless: true }); fs.mkdirSync('tmp/phase-one-browser', { recursive: true }); });
after(async () => { await browser.close(); });
async function session(role, id, tier = 'SUPER_ADMIN') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  await context.route('**/*', route => { const url = new URL(route.request().url()); return ['127.0.0.1', 'localhost'].includes(url.hostname) ? route.continue() : route.abort(); });
  await context.addInitScript(({ role, id, tier }) => {
    localStorage.setItem('auth-storage', JSON.stringify({ state: { accessToken: id, refreshToken: 'synthetic', role, adminTier: role === 'ADMIN' ? tier : null, isAuthenticated: true, profileCompleted: true }, version: 0 }));
    localStorage.setItem('salama_dashboard_language', 'en');
  }, { role, id, tier });
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
      if (url === 'country-finance') {
        await admin.page.getByRole('group', {name:'Model A · Cash consultation'}).first().waitFor();
        await admin.page.getByRole('group', {name:'Model B · Wallet consultation'}).first().waitFor();
      }
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

test('clinic payout filters retain unsaved bank edits and export matching receipt records', { timeout: 180000 }, async () => {
  const {context,page} = await session('CLINIC','phase1-clinic-user');
  try {
    await page.goto(base+'/dashboard/payout-profile');
    await page.getByLabel('Beneficiary name').fill('Unsaved destination');
    await page.getByLabel('Rows per page').selectOption('1000');
    await page.getByLabel('Search name, phone or reference').fill('SYNTHETIC-CASH');
    await page.getByRole('link',{name:'View payment receipt'}).first().waitFor();
    assert.equal(await page.getByLabel('Beneficiary name').inputValue(),'Unsaved destination');
    const download = page.waitForEvent('download');
    await page.getByRole('button',{name:'Download Excel',exact:true}).click();
    assert.equal(await (await download).failure(),null);
  } finally {await context.close();}
});

test('wallet receipt search renders the payment reference and receipt destination', { timeout: 180000 }, async () => {
  const {context,page} = await session('CLINIC','phase1-clinic-user');
  try {
    await page.goto(base+'/dashboard/ledger-reports');
    await page.getByLabel('Search record, booking or payment reference').fill('SYNTHETIC-CASH');
    const receipt = page.getByRole('link',{name:'View receipt',exact:true}).first();
    await receipt.waitFor();
    assert.equal(await receipt.getAttribute('href'),'https://example.test/cash-receipt.pdf');
    await page.getByRole('combobox', {name:/Rows/}).selectOption('1000');
    const download = page.waitForEvent('download'); await page.getByRole('button',{name:'Download Excel'}).click();
    assert.equal(await (await download).failure(),null);
  } finally {await context.close();}
});

test('doctor earnings date range separates actual journal earnings from consultation gross', { timeout: 180000 }, async () => {
  const {context,page} = await session('DOCTOR','phase1-doctor-user');
  try {
    await page.goto(base+'/dashboard/doctor-overview');
    await page.getByLabel('From date').fill('2026-09-10'); await page.getByLabel('To date').fill('2026-09-10');
    const loaded = page.waitForResponse(r => r.url().includes('/overview?') && r.url().includes('2026-09-10') && r.ok());
    await page.getByRole('button',{name:'Apply earnings dates'}).click(); await loaded;
    await page.getByText('Net recorded wallet earnings',{exact:true}).locator('..').getByText('12.00',{exact:true}).waitFor();
    await page.getByText('Paid wallet withdrawals',{exact:true}).locator('..').getByText('4.00',{exact:true}).waitFor();
  } finally {await context.close();}
});

test('Main Admin financial and complaint tables apply large row controls and phone search', { timeout: 180000 }, async () => {
  const {context,page} = await session('ADMIN','phase1-admin');
  try {
    await page.goto(base+'/dashboard/settlements');
    await page.getByLabel('Rows per page').selectOption('1000');
    await page.getByPlaceholder(/Search.*phone/).fill('+218900000002');
    const fetched = page.waitForResponse(r => r.url().includes('/admin/settlements?') && r.url().includes('searchTerm=') && r.ok());
    await page.getByRole('button',{name:'Apply search'}).click(); await fetched;
    const download = page.waitForEvent('download'); await page.getByRole('button',{name:'Download Excel',exact:true}).click();
    assert.equal(await (await download).failure(),null);
    await page.goto(base+'/dashboard/complaints');
    await page.getByLabel('Rows per page').selectOption('1000');
    await page.getByPlaceholder('Search complaints...').fill('+218');
    const searched = page.waitForResponse(r => r.url().includes('/admin/complaints?') && r.url().includes('searchTerm=') && r.ok());
    await page.getByRole('button',{name:'Apply search'}).click(); await searched;
    const complaints = page.waitForEvent('download'); await page.getByRole('button',{name:'Export Excel'}).click();
    assert.equal(await (await complaints).failure(),null);
    await page.goto(base+'/dashboard/platform-financials');
    const ledger = page.waitForResponse(r => r.url().includes('/admin/financial-ledger?') && r.url().includes('limit=1000') && r.ok());
    await page.getByLabel('Rows per page').selectOption('1000'); await ledger;
  } finally {await context.close();}
});

test('late history responses cannot overwrite newer financial search results', { timeout: 180000 }, async () => {
  for (const [screen, endpoint, label, empty] of [
    ['ledger-reports','wallet-history','Search record, booking or payment reference','No matching transactions.'],
    ['payout-profile','payouts','Search name, phone or reference','No withdrawal requests.'],
  ]) {
    const {context,page} = await session('CLINIC','phase1-clinic-user');
    let release, seen;
    const released = new Promise(resolve => {release=resolve;});
    const started = new Promise(resolve => {seen=resolve;});
    try {
      await context.route(`**/phase-one/${endpoint}?**`, async route => {
        const response = await route.fetch();
        if (new URL(route.request().url()).searchParams.get('searchTerm') === 'SYNTHETIC-CASH') {seen();await released;}
        await route.fulfill({response});
      });
      await page.goto(base+'/dashboard/'+screen);
      await page.getByLabel(label).fill('SYNTHETIC-CASH'); await started;
      await page.getByLabel(label).fill('MISSING-REFERENCE'); await page.getByText(empty,{exact:true}).waitFor();
      const oldResponse = page.waitForResponse(r => r.url().includes(endpoint+'?') && r.url().includes('SYNTHETIC-CASH'));
      release(); await oldResponse;
      await page.waitForTimeout(300);
      assert.equal(await page.getByText(empty,{exact:true}).count(),1,screen);
      assert.equal(await page.getByRole('link',{name:/View.*receipt/}).count(),0,screen);
    } finally {release();await context.close();}
  }
});

test('all five Admin tiers see controls matching their actual permissions', {timeout:180000},async()=>{
  for(const tier of ['SUPER_ADMIN','OPERATIONS','FINANCE','SUPPORT','READ_ONLY']){
    const {context,page}=await session('ADMIN','phase1-role-'+tier,tier);
    try{
      await page.goto(base+'/dashboard/clinics');
      const wallet=page.getByRole('button',{name:/^(Update Wallet|Add Funds)$/}).first();await wallet.waitFor();
      assert.equal(await wallet.isEnabled(),['SUPER_ADMIN','FINANCE'].includes(tier),tier+' wallet');
      assert.equal(await wallet.locator('..').getByRole('button',{name:/^(Notify|Notifications)$/}).isEnabled(),['SUPER_ADMIN','OPERATIONS','SUPPORT'].includes(tier),tier+' notification');
      assert.equal(await page.getByRole('button',{name:/^(Verify Clinic|Unverified|Verify|Unverify)$/}).first().isEnabled(),['SUPER_ADMIN','OPERATIONS'].includes(tier),tier+' verification');
      const financePage=page.getByRole('link',{name:'Country Finance',exact:true});
      assert.equal(await financePage.count(),['SUPER_ADMIN','FINANCE','READ_ONLY'].includes(tier)?1:0,tier+' finance navigation');
      await page.goto(base+'/dashboard/account-controls');
      if(['SUPER_ADMIN','OPERATIONS'].includes(tier)){
        await page.getByRole('heading',{name:'Account Controls',exact:true}).waitFor();
        assert.equal(await page.getByText('Main Admin account approval',{exact:true}).count(),tier==='SUPER_ADMIN'?1:0);
      } else await page.getByText('Access Restricted',{exact:true}).waitFor();
    } finally{await context.close();}
  }
});

test('receptionist, doctor, clinic and patient dashboard boundaries hold', {timeout:180000},async()=>{
  for(const [role,id]of [['MANAGER','phase1-role-manager'],['DOCTOR','phase1-doctor-user'],['CLINIC','phase1-clinic-user'],['PATIENT','phase1-patient-user']]){
    const {context,page}=await session(role,id);
    try{
      await page.goto(base+'/dashboard/booking-management');
      if(role==='PATIENT'){await page.getByText('Access Denied',{exact:true}).waitFor();continue;}
      await page.getByRole('heading',{name:'Booking Management',exact:true}).waitFor();
      assert.equal(await page.getByRole('button',{name:'Apply to selected',exact:true}).count(),role==='DOCTOR'?0:1,role+' booking writes');
      await page.goto(base+'/dashboard/payout-profile');
      if(role==='MANAGER')await page.getByText('Access Restricted',{exact:true}).waitFor();
      else await page.getByRole('heading',{name:'Bank Details & Withdrawals',exact:true}).waitFor();
      if(role==='MANAGER'){
        const requests=[];page.on('request',r=>requests.push(r.url()));
        await page.goto(base+'/dashboard/doctors');
        await page.getByRole('heading',{name:'Clinic Doctors',exact:true}).waitFor();
        assert.equal(await page.getByRole('button',{name:'Join Requests',exact:true}).count(),0);
        assert.equal(requests.some(url=>url.includes('/clinic/join-requests')),false);
      }
      if(role==='CLINIC'){
        await page.goto(base+'/dashboard/settlements');
        await page.getByRole('heading',{name:/Settlements/}).first().waitFor();
        assert.equal(await page.getByRole('button',{name:'Direct settlement',exact:true}).count(),0);
      }
    }finally{await context.close();}
  }
});

test('patient request flows through clinic confirmation, patient arrival and receptionist completion with matching histories', {timeout:180000},async()=>{
  const fixture=JSON.parse(fs.readFileSync('../backend-nabeelaljirbi/tmp/booking-browser-fixture.json','utf8'));
  const api='http://127.0.0.1:55440/api/v1';
  async function call(path,actor,method='GET',body){
    const response=await fetch(api+path,{method,headers:{Authorization:'Bearer '+actor,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    const result=await response.json();assert.equal(response.ok,true,result.message);return result.data;
  }
  const patient='phase1-flow-patient-user';
  const b=await call('/patient/appointment-booking',patient,'POST',{...fixture,bookedFor:'FAMILY',familyMemberName:'Browser dependent',familyMemberRelation:'CHILD'});
  assert.equal(b.status,'PENDING');assert.equal(b.collectionMode,'MODE_B');assert.equal(b.holdAmount,83.05);
  async function dashboardAction(role,id,status,action){
    const {context,page}=await session(role,id);
    try{
      await page.goto(base+'/dashboard/booking-management');
      await page.getByLabel('Status',{exact:true}).selectOption(status);
      await page.getByRole('checkbox',{name:'Select booking '+b.id,exact:true}).check();
      await page.getByLabel('Bulk action').selectOption(action);
      page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Apply to selected',exact:true}).click();
      await page.getByRole('status').filter({hasText:'1 succeeded; 0 failed.'}).waitFor();
    }finally{await context.close();}
  }
  await dashboardAction('CLINIC','phase1-flow-clinic-user','PENDING','CONFIRMED');
  const confirmed=await call('/patient/appointment-history?limit=5000',patient);assert.equal(confirmed.data.find(row=>row.id===b.id).status,'CONFIRMED');
  await call('/patient/appointment-arrived/'+b.id,patient,'PATCH',{});
  const doctor=await call('/doctor/appointments?limit=5000','phase1-doctor-user');assert.equal(doctor.data.find(row=>row.id===b.id).status,'ARRIVED');
  const before=await call('/phase-one/wallet-history?searchTerm='+b.id,patient);
  await dashboardAction('MANAGER','phase1-flow-manager','ARRIVED','COMPLETE');
  const completed=await call('/patient/appointment-history?limit=5000',patient);assert.equal(completed.data.find(row=>row.id===b.id).status,'COMPLETE');
  const after=await call('/phase-one/wallet-history?searchTerm='+b.id,patient);assert.deepEqual(after,before);assert.equal(after.data[0].amount,83.05);
});
