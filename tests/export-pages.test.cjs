const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// Load the pure TS utility using the project's existing TypeScript dependency.
// This test suite also runs when the dashboard is checked out on its own.
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(
  fs.readFileSync(filename, 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText, filename);
const { exportPages } = require('../src/lib/export-pages.ts');

test('export includes all pages and keeps the original row values', async () => {
  const pages = [[{ id: '1', amount: 75.5 }, { id: '2', phone: '+218000' }], [{ id: '3', amount: 7.55 }]];
  const rows = await exportPages(async page => ({ rows: pages[page - 1], total: 3 }));
  assert.equal(rows.length, 3);
  assert.equal(rows[0].amount, 75.5);
  assert.equal(rows[1].phone, '+218000');
});
test('export rejects changing totals and duplicate pages rather than silently losing data', async () => {
  await assert.rejects(exportPages(async page => ({ rows: [{ id: String(page) }], total: page === 1 ? 2 : 3 })), /changed/);
  await assert.rejects(exportPages(async () => ({ rows: [{ id: 'same' }], total: 2 })), /changed/);
});
test('export rejects a truncated response', async () => {
  await assert.rejects(exportPages(async () => ({ rows: [], total: 20 })), /Incomplete/);
});
test('export rejects invalid totals, missing IDs and responses exceeding the reported total', async () => {
  for (const total of [NaN, -1, undefined, 1.5]) {
    await assert.rejects(exportPages(async () => ({ rows: [], total })), /Invalid export response/);
  }
  await assert.rejects(exportPages(async () => ({ rows: [{}], total: 1 })), /Invalid export record/);
  await assert.rejects(exportPages(async () => ({ rows: [{ id: 'unexpected' }], total: 0 })), /Records changed/);
});
