import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const requireModule = createRequire(import.meta.url);
const directory = path.dirname(fileURLToPath(import.meta.url));

function load(relative, mocks = {}) {
  const filename = path.join(directory, '..', relative);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loadedModule = { exports: {} };
  new Function('require', 'module', 'exports', source)(
    (name) => name in mocks ? mocks[name] : requireModule(name), loadedModule, loadedModule.exports,
  );
  return loadedModule.exports;
}

function database(rows, cap = 500) {
  return { from() {
    let filtered = [...rows];
    const orders = [];
    const query = {
      select() { return query; },
      eq(key, value) { filtered = filtered.filter(row => row[key] === value); return query; },
      order(key, { ascending }) { orders.push([key, ascending]); return query; },
      async range(start, end) {
        filtered.sort((a, b) => {
          for (const [key, ascending] of orders) {
            if (a[key] !== b[key]) return (a[key] < b[key] ? -1 : 1) * (ascending ? 1 : -1);
          }
          return 0;
        });
        return { data: filtered.slice(start, Math.min(end + 1, start + cap)), error: null };
      },
    };
    return query;
  } };
}
const { getAwaitingReimbursements } = load('lib/supabase/queries.ts');
const row = (id, date, extra = {}) => ({ id, date, amount: '1000', paid_by: 'joint', reimbursed: false, category_id: 'food', ...extra });

test('all months, stable oldest-first order, and reimbursement eligibility', async () => {
  const result = await getAwaitingReimbursements(database([
    row('b', '2026-09-01'), row('z', '2025-01-01'), row('a', '2026-09-01'),
    row('paid', '2024-01-01', { reimbursed: true }),
    row('personal', '2024-01-01', { paid_by: 'daniel' }),
    row('adel', '2024-01-01', { paid_by: 'adel' }),
  ]));
  assert.deepEqual(result.map(t => t.id), ['z', 'a', 'b']);
  assert.equal(result.reduce((sum, t) => sum + t.amount, 0), 3000);
});

test('reads beyond 1000 rows and respects smaller server caps', async () => {
  const rows = Array.from({ length: 1103 }, (_, i) => row(String(i).padStart(4, '0'), '2026-01-01'));
  const result = await getAwaitingReimbursements(database(rows, 137));
  assert.equal(result.length, 1103);
  assert.equal(new Set(result.map(t => t.id)).size, 1103);
  assert.equal(result.reduce((sum, t) => sum + t.amount, 0), 1103000);
  assert.deepEqual(await getAwaitingReimbursements(database([])), []);
});

test('query failures are surfaced instead of showing an empty queue', async () => {
  const db = database([]);
  const query = db.from();
  query.range = async () => ({ data: null, error: new Error('offline') });
  await assert.rejects(getAwaitingReimbursements({ from: () => query }), /offline/);
});

test('mark, refresh, undo and failed saves preserve correct data', async () => {
  const rows = [row('one', '2025-02-01')];
  const invalidated = [];
  let fail = false;
  const query = {
    update(fields) { query.fields = fields; return query; },
    eq() { return query; }, select() { return query; },
    async single() {
      if (fail) return { data: null, error: new Error('denied') };
      Object.assign(rows[0], query.fields);
      return { data: { id: 'one' }, error: null };
    },
  };
  const { setReimbursed } = load('app/reimbursements/actions.ts', {
    'next/cache': { revalidatePath: p => invalidated.push(p) },
    '../../lib/supabase/server': { createClient: async () => ({ from: () => query }) },
  });
  assert.equal((await setReimbursed('one', '2026-09-07')).error, null);
  assert.equal(rows[0].reimbursed_date, '2026-09-07');
  assert.deepEqual(await getAwaitingReimbursements(database(rows)), []);
  assert.deepEqual(invalidated, ['/', '/transactions', '/joint-spending', '/reimbursements']);
  assert.equal((await setReimbursed('one', null)).error, null);
  assert.equal(rows[0].reimbursed_date, null);
  assert.equal((await getAwaitingReimbursements(database(rows))).length, 1);
  fail = true;
  assert.ok((await setReimbursed('one', '2026-09-07')).error);
  assert.equal((await getAwaitingReimbursements(database(rows))).length, 1);
  assert.ok((await setReimbursed('one', 'bad-date')).error);
});

test('queue renders full dates, amounts, accessible actions and empty state', () => {
  const { default: Queue } = load('app/reimbursements/ReimbursementQueue.tsx', {
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    '../../lib/settlement': { formatIDR: amount => `Rp ${amount}` },
    './actions': { setReimbursed: async () => ({ error: null }) },
  });
  const html = renderToStaticMarkup(React.createElement(Queue, {
    transactions: [{ id: 'a', date: '2025-01-02', amount: 1000, note: 'Groceries', categoryId: 'food' }],
    categories: [{ id: 'food', name: 'Food', icon: '🍎' }],
  }));
  assert.match(html, /Jan 2, 2025/);
  assert.match(html, /Mark reimbursed/);
  assert.match(html, /Rp 1000/);
  assert.match(html, /aria-busy="false"/);
  const empty = renderToStaticMarkup(React.createElement(Queue, { transactions: [], categories: [] }));
  assert.match(empty, /All caught up—no reimbursements awaiting payment/);
  assert.doesNotMatch(empty, /Mark reimbursed/);
});
