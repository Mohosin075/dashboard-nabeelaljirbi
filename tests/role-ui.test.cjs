// Local dashboard with intercepted synthetic API responses.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const { chromium } = require('@playwright/test');
const permissions = new Module('permissions', module);
permissions._compile(ts.transpileModule(fs.readFileSync('src/lib/route-permissions.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, 'permissions');
const { checkRouteAccess } = permissions.exports;
const base = 'http://127.0.0.1:7039';
let browser;
before(async () => { browser = await chromium.launch({ channel: 'msedge', headless: true }); });
after(async () => { await browser.close(); });

async function session(role, tier = 'SUPER_ADMIN', language = 'en') {
  const context = await browser.newContext();
  const calls = [];
  await context.addInitScript(({ role, tier, language }) => {
    localStorage.setItem('auth-storage', JSON.stringify({ state: {
      role, adminTier: tier, isAuthenticated: true, accessToken: 'synthetic', profileCompleted: true,
    }, version: 0 }));
    localStorage.setItem('salama_dashboard_language', language);
  }, { role, tier, language });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (!url.pathname.includes('/api/v1/')) {
      return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
    }
    calls.push({ path: url.pathname, params: url.searchParams, method: route.request().method() });
    let data = { data: [], meta: { total: 0, page: 1, limit: 50 } };
    if (url.pathname.endsWith('/admin/stats')) data = {
      patientCount: 2, doctorCount: 2, clinicCount: 2, totalBookings: 2,
      pendingVerifications: 1, pendingSettlements: 1, openComplaints: 1, pendingBookings: 1,
    };
    if (/subscription\/$|\/insurance$/.test(url.pathname)) data = [];
    if (url.pathname.endsWith('/booking-options')) data = { clinics: [], doctors: [], patients: [] };
    if (url.pathname.endsWith('/manager/booking-history')) data = {
      meta: { total: url.searchParams.get('searchTerm') ? 1 : 62, page: Number(url.searchParams.get('page')), limit: 50 },
      data: [{ id: 'booking', serialNumber: 37, consultDate: '2030-01-02T00:00:00Z',
        startTime: '09:00.000Z', endTime: '17:00.000Z', status: 'PENDING',
        doctor: { user: { fullName: 'Clinic Doctor' } }, patient: { user: { fullName: 'Test Patient', phoneNumber: '+218123' } } }],
    };
    await route.fulfill({ json: { success: true, data, meta: { total: 0, page: 1, limit: 50 } } });
  });
  return { context, page: await context.newPage(), calls };
}

test('Admin home cards, sidebar and alerts respect every admin tier', { timeout: 120000 }, async () => {
  for (const tier of ['SUPER_ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'READ_ONLY']) {
    const { context, page } = await session('ADMIN', tier);
    try {
      await page.goto(base + '/dashboard/admin');
      await page.locator('main a').first().waitFor();
      for (const href of await page.locator('a[href^="/dashboard"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        assert.equal(checkRouteAccess(href.split('?')[0], 'ADMIN', tier).hasAccess, true, tier + ' ' + href);
      }
      await page.locator('header button').filter({ has: page.locator('svg.lucide-bell') }).click();
      for (const target of ['/dashboard/settlements', '/dashboard/clinics', '/dashboard/complaints']) {
        if (!checkRouteAccess(target, 'ADMIN', tier).hasAccess) {
          assert.equal(await page.locator('[role="dialog"] a[href="' + target + '"]').count(), 0);
        }
      }
    } finally { await context.close(); }
  }
});

test('Clinic, Staff and Doctor controls stay within their roles', { timeout: 120000 }, async () => {
  for (const role of ['CLINIC', 'MANAGER', 'DOCTOR']) {
    const { context, page } = await session(role);
    try {
      await page.goto(base + '/dashboard/booking-management');
      await page.locator('aside').waitFor();
      const sidebar = page.locator('aside');
      const hrefs = await sidebar.locator('a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
      assert.equal(new Set(hrefs).size, hrefs.length, role + ' duplicate menu entry');
      assert.equal(await sidebar.locator('a[href="/dashboard/booking-requests"]').count(), role === 'DOCTOR' ? 0 : 1);
      assert.equal(await sidebar.locator('a[href="/dashboard/financials"]').count(), role === 'CLINIC' ? 1 : 0);
      assert.equal(await sidebar.locator('a[href="/dashboard/country-finance"]').count(), 0);
      await page.locator('header button').last().click();
      assert.equal(await page.getByRole('menuitem', { name: 'Profile', exact: true }).count(), 0);
      assert.equal(await page.getByRole('menuitem', { name: 'Settings', exact: true }).count(), 0);
      if (role === 'CLINIC') {
        await page.goto(base + '/dashboard/clinic-subscriptions');
        await page.getByText('Access Restricted', { exact: true }).waitFor();
      }
    } finally { await context.close(); }
  }
});

test('Read Only subscription and insurance editors cannot submit changes', { timeout: 60000 }, async () => {
  const { context, page, calls } = await session('ADMIN', 'READ_ONLY');
  try {
    for (const path of ['clinic-subscriptions', 'patient-subscriptions', 'insurance']) {
      await page.goto(base + '/dashboard/' + path);
      const add = page.getByRole('button', { name: /Add (Subscription|Insurance)/ }).first();
      await add.waitFor();
      assert.equal(await add.isDisabled(), true, path);
    }
    assert.equal(calls.filter(call => call.method !== 'GET').length, 0);
  } finally { await context.close(); }
});

test('Booking Requests paginate, format legacy times and search the server', { timeout: 60000 }, async () => {
  const { context, page, calls } = await session('MANAGER');
  try {
    await page.goto(base + '/dashboard/booking-requests');
    await page.getByText('09:00 - 17:00', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForFunction(() => document.body.innerText.includes('2 / 2'));
    assert.equal(calls.filter(call => call.path.endsWith('/booking-history')).at(-1).params.get('page'), '2');
    await page.locator('input[type="text"]').fill('#37');
    await page.waitForTimeout(500);
    const search = calls.filter(call => call.path.endsWith('/booking-history')).at(-1);
    assert.equal(search.params.get('searchTerm'), '#37');
    assert.equal(search.params.get('page'), '1');
    await page.locator('input[type="date"]').fill('2030-01-02');
    await page.waitForTimeout(500);
    assert.equal(calls.filter(call => call.path.endsWith('/booking-history')).at(-1).params.get('consultDate'), '2030-01-02');
  } finally { await context.close(); }
});


test('old booking links retain their selected status in the shared management screen', {timeout:60000}, async () => {
  const {context,page,calls} = await session('CLINIC');
  try {
    await page.goto(base + '/dashboard/bookings?status=INPROGRESS');
    await page.waitForURL('**/dashboard/booking-management?status=INPROGRESS');
    await page.waitForTimeout(500);
    const request = calls.filter(call => call.path.endsWith('/phase-one/bookings')).at(-1);
    assert.equal(request.params.get('status'),'ARRIVED');
    assert.equal(request.params.get('statusView'),'simple');
  } finally {await context.close();}
});

test('Schedules reads the API envelope and keeps the last selected doctor', { timeout: 60000 }, async () => {
  const { context, page } = await session('CLINIC');
  let releaseFirst;
  const firstResponse = new Promise(resolve => { releaseFirst = resolve; });
  const pending = [];
  await context.route('**/api/v1/clinic/manager/doctors', route => route.fulfill({json:{success:true,data:{data:[
    {doctorId:'first',name:'First Schedule Doctor',specialty:'General'},
    {doctorId:'second',name:'Second Schedule Doctor',specialty:'General'},
  ]}}}));
  await context.route('**/api/v1/clinic/doctor-appointments/*?*', async route => {
    const id = new URL(route.request().url()).pathname.split('/').at(-1);
    pending.push(id);
    if (id === 'first') await firstResponse;
    await route.fulfill({json:{success:true,data:{doctor:{schedule:[{day:'MONDAY',slots:[{
      startTime:id === 'first' ? '09:00.000Z' : '14:30.000Z',endTime:'16:00.000Z',capacity:5,
    }]}]},data:[],meta:{total:0,page:1,limit:10}}}});
  });
  try {
    await page.goto(base + '/dashboard/schedules');
    await page.getByRole('button', {name:/Second Schedule Doctor/}).click();
    await page.getByText('14:30 - 16:00',{exact:true}).waitFor();
    releaseFirst();
    await page.waitForTimeout(300);
    assert.ok(pending.includes('first'));
    assert.equal(await page.getByText('09:00 - 16:00',{exact:true}).count(),0);
    assert.equal(await page.getByText('14:30 - 16:00',{exact:true}).count(),1);
  } finally { releaseFirst(); await context.close(); }
});

test('Read Only cannot restore or toggle notification templates', {timeout:60000}, async () => {
  const {context,page} = await session('ADMIN','READ_ONLY');
  let templates = [];
  const writes = [];
  await context.route('**/api/v1/notification-templates**', route => {
    if (route.request().method() !== 'GET') writes.push(route.request().method());
    return route.fulfill({json:{success:true,data:templates}});
  });
  try {
    await page.goto(base + '/dashboard/notification-templates');
    const restore = page.getByRole('button',{name:'Restore Default Templates',exact:true});
    await restore.waitFor();
    assert.equal(await restore.isDisabled(),true);
    templates = [{id:'template',eventKey:'BOOKING_CONFIRMED',name:'Booking confirmation',titleEn:'Confirmed',bodyEn:'Booking confirmed',titleAr:'Confirmed',bodyAr:'Booking confirmed',variables:[],isActive:true,pushEnabled:true,inAppEnabled:true,smsEnabled:false,whatsappEnabled:false}];
    await page.reload();
    await page.getByRole('switch').first().waitFor();
    assert.equal(await page.getByRole('switch').first().isDisabled(),true);
    await page.getByTitle('Card View',{exact:true}).click();
    await page.getByRole('button',{name:'Edit',exact:true}).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    for (const toggle of await dialog.getByRole('switch').all()) assert.equal(await toggle.isDisabled(),true);
    assert.equal(writes.length,0);
  } finally {await context.close();}
});

test('Reports keeps server matches for a doctor phone search', {timeout:60000}, async () => {
  const {context,page} = await session('CLINIC');
  await context.route('**/api/v1/specialist**', route => route.fulfill({json:{success:true,data:[]}}));
  await context.route('**/api/v1/clinic/reconciliation-reports?*', route => {
    const searched = new URL(route.request().url()).searchParams.get('searchTerm') === '+218987';
    return route.fulfill({json:{success:true,meta:{total:searched?1:0,page:1,limit:15,totalPages:1},data:{summary:null,doctorBreakdown:[],clinicBreakdown:[],data:searched?[{
      id:'phone-match',serialNumber:19,consultDate:'2030-01-02T00:00:00Z',status:'COMPLETE',
      startTime:'09:00.000Z',endTime:'10:00.000Z',consultFee:5,clinicServiceFee:1,serviceFeeAmount:2,
      doctor:{user:{fullName:'Audit doctor',phoneNumber:'+218987'}},
      patient:{user:{fullName:'Report audit patient',phoneNumber:'+218111'}},
      clinic:{clinicName:'Audit clinic'},feeCountry:'LIBYA',
    }]:[]}}});
  });
  try {
    await page.goto(base + '/dashboard/reports');
    const search = page.getByPlaceholder('Search patient, phone, doctor, clinic...');
    await search.fill('+218987');
    await search.press('Enter');
    await page.getByText('Report audit patient',{exact:true}).waitFor();
    assert.equal(await page.getByText('Report audit patient',{exact:true}).count(),1);
  } finally {await context.close();}
});

test('Reports preserves mixed and unknown currencies, full counts and server currency filters', { timeout: 60000 }, async () => {
  const { context, page, calls } = await session('CLINIC');
  await context.route('**/api/v1/specialist**', route => route.fulfill({ json: { success: true, data: [] } }));
  await context.route('**/api/v1/clinic/reconciliation-reports?*', route => {
    const currency = new URL(route.request().url()).searchParams.get('currency');
    calls.push({ currency });
    const groups = [
      { country: 'EGYPT', currency: 'EGP', totalConsultFees: 23.5, totalServiceFees: 1, netClinicReceivable: 22.5 },
      { country: 'TUNISIA', currency: 'TND', totalConsultFees: 90, totalServiceFees: 2, netClinicReceivable: 88 },
      { country: 'HISTORICAL_UNSPECIFIED', currency: 'Unspecified', totalConsultFees: 9, totalServiceFees: 0, netClinicReceivable: 9 },
    ];
    return route.fulfill({ json: { success: true, meta: { total: 42, page: 1, limit: 15, totalPages: 3 }, data: {
      summary: { byCountry: currency ? groups.filter(group => group.currency === currency) : groups,
        totalBookings: 42, totalCompleted: 30, totalNoShow: 5, totalCancelled: 7 },
      doctorBreakdown: [], clinicBreakdown: [], data: [],
    } } });
  });
  try {
    await page.goto(base + '/dashboard/reports');
    await page.getByText('EGYPT / EGP', { exact: true }).waitFor();
    assert.equal(await page.getByText('See country totals', { exact: true }).count(), 3);
    await page.getByText('HISTORICAL_UNSPECIFIED / Unspecified', { exact: true }).waitFor();
    assert.match(await page.locator('body').innerText(), /30 Completed/);
    await page.locator('select').filter({ has: page.locator('option[value="EGP"]') }).selectOption('EGP');
    await page.getByText('TUNISIA / TND', { exact: true }).waitFor({ state: 'detached' });
    assert.ok(calls.some(call => call.currency === 'EGP'));
    assert.equal(await page.getByText('See country totals', { exact: true }).count(), 0);
    await page.screenshot({ path: 'tmp/acceptance-report-currency.png', fullPage: true });
  } finally { await context.close(); }
});

test('Queue hides pending no-show actions and retains a failed status dialog', {timeout:60000}, async () => {
  const {context,page} = await session('CLINIC');
  try {
    await page.goto(base + '/dashboard/appointments');
    await page.getByText('Test Patient',{exact:true}).waitFor();
    assert.equal(await page.getByRole('button',{name:'No Show',exact:true}).count(),0);
    await context.route('**/api/v1/clinic/manager/booking-history?*',route=>route.fulfill({json:{success:true,data:{meta:{total:1,page:1,limit:15},data:[{
      id:'confirmed',serialNumber:1,consultDate:'2030-01-02T00:00:00Z',status:'CONFIRMED',startTime:'09:00',endTime:'10:00',doctor:{user:{fullName:'Audit doctor'}},patient:{user:{fullName:'Confirmed patient'}}
    }]}}}));
    await context.route('**/api/v1/clinic/manager-update/appointment-status',route=>route.fulfill({status:400,json:{success:false,message:'Synthetic status failure'}}));
    await page.reload();
    await page.getByRole('button',{name:'No Show',exact:true}).click();
    const dialog=page.getByRole('dialog');
    const confirm=dialog.getByRole('button',{name:'Confirm',exact:true});
    assert.equal(await confirm.isDisabled(),true);
    await dialog.locator('textarea').fill('Patient could not attend');
    const response=page.waitForResponse(res=>res.url().endsWith('/manager-update/appointment-status'));
    await confirm.click();
    await response;
    await page.waitForTimeout(300);
    assert.equal(await dialog.isVisible(),true);
    assert.equal(await dialog.locator('textarea').inputValue(),'Patient could not attend');
  } finally {await context.close();}
});

test('Arabic booking screens render RTL for Admin, Clinic and Staff on desktop and mobile', { timeout: 120000 }, async () => {
  for (const role of ['ADMIN', 'CLINIC', 'MANAGER']) {
    const { context, page } = await session(role, 'SUPER_ADMIN', 'ar');
    try {
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + '/dashboard/booking-management');
        await page.locator('html[lang="ar"][dir="rtl"]').waitFor();
        await page.getByRole('heading').filter({ hasText: /[\u0600-\u06ff]/ }).first().waitFor();
        assert.equal(await page.locator('main').evaluate(main => main.scrollWidth <= main.clientWidth), true);
        const sort = page.locator('select').filter({ has: page.locator('option[value="newest"]') });
        assert.doesNotMatch(await sort.innerText(), /Newest first|Request time/);
        const bulk = page.locator('select').filter({ has: page.locator('option[value="CONFIRMED"]') }).last();
        assert.doesNotMatch(await bulk.innerText(), /CONFIRMED|ARRIVED|COMPLETE|CANCELLED/);
        assert.ok(await page.locator('main').getByRole('button').count());
        await page.screenshot({ path: `tmp/acceptance-arabic-${role}-${width}.png`, fullPage: true });
      }
    } finally { await context.close(); }
  }
});
