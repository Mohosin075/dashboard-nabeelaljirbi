const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
function load(file){const m=new Module(file,module);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,file);return m.exports;}
const {checkRouteAccess}=load('src/lib/route-permissions.ts');
const {canAdminAction}=load('src/lib/admin-permissions.ts');
const tiers=['SUPER_ADMIN','OPERATIONS','FINANCE','SUPPORT','READ_ONLY'];
test('admin action permissions match backend operations, finance and notification guards',()=>{
  for(const tier of [...tiers,'INVALID']){
    assert.equal(canAdminAction(tier,'operations'),['SUPER_ADMIN','OPERATIONS'].includes(tier));
    assert.equal(canAdminAction(tier,'finance'),['SUPER_ADMIN','FINANCE'].includes(tier));
    assert.equal(canAdminAction(tier,'notify'),['SUPER_ADMIN','OPERATIONS','SUPPORT'].includes(tier));
  }
});
test('every role has only its role dashboard, money and staff controls',()=>{
  const matrix={
    '/dashboard/doctor-overview':['DOCTOR'],
    '/dashboard/booking-management':['ADMIN','CLINIC','MANAGER','DOCTOR'],
    '/dashboard/payout-profile':['CLINIC','DOCTOR'],
    '/dashboard/ledger-reports':['ADMIN','CLINIC','DOCTOR'],
    '/dashboard/receptionists':['ADMIN','CLINIC'],
    '/dashboard/account-controls':['ADMIN'],
  };
  for(const[path,allowed]of Object.entries(matrix))for(const role of ['ADMIN','CLINIC','MANAGER','DOCTOR','PATIENT'])assert.equal(checkRouteAccess(path,role,'SUPER_ADMIN').hasAccess,allowed.includes(role),path+' '+role);
  assert.equal(checkRouteAccess('/dashboard/ledger-reports',null,null).hasAccess,false);
});
test('finance/support/read-only cannot enter unrelated admin control pages',()=>{
  for(const tier of tiers){
    assert.equal(checkRouteAccess('/dashboard/account-controls','ADMIN',tier).hasAccess,['SUPER_ADMIN','OPERATIONS'].includes(tier));
    assert.equal(checkRouteAccess('/dashboard/country-finance','ADMIN',tier).hasAccess,['SUPER_ADMIN','FINANCE','READ_ONLY'].includes(tier));
    assert.equal(checkRouteAccess('/dashboard/admin-staff','ADMIN',tier).hasAccess,tier==='SUPER_ADMIN');
    assert.equal(checkRouteAccess('/dashboard/otp-system','ADMIN',tier).hasAccess,['SUPER_ADMIN','OPERATIONS','SUPPORT','READ_ONLY'].includes(tier));
  }
});
