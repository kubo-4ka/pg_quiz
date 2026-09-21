#!/usr/bin/env node
'use strict';
/*
 * 問題データの整形
 *   node tools/format.js [取り込むファイル...]
 *
 * index.html が読み込んでいる問題（+ 引数のファイル）をカテゴリ順に並べ、
 * js/data/questions/<S1|S2|...|G4>.js に書き出して index.html の読み込みタグを更新します。
 * 取り込み元の旧ファイルは削除しません。
 */
const fs = require('fs');
const path = require('path');
const { ROOT, loadData, categoryIndex } = require('./lib');

const extra = process.argv.slice(2).map((f) => path.resolve(f));
const { win } = loadData(extra);
const CATS = categoryIndex(win.PGQ_CATEGORIES);
const CAT_ORDER = [...CATS.keys()];
const Q = win.PGQ_QUESTIONS || [];

const seen = new Set();
for (const q of Q) {
  if (seen.has(q.id)) { console.error(`id が重複しています: ${q.id}`); process.exit(1); }
  seen.add(q.id);
  if (!CATS.has(q.cat)) { console.error(`不明なカテゴリ: ${q.id} ${q.cat}`); process.exit(1); }
}

const s = (v) => "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'";

function serialize(q) {
  const L = ['{'];
  L.push(`  id: ${s(q.id)}, level: ${s(q.level)}, cat: ${s(q.cat)},${q.type === 'scenario' ? " type: 'scenario'," : ''}`);
  L.push(`  q: ${s(q.q)},`);
  if (q.code) L.push(`  code: ${s(q.code)},`);
  L.push('  choices: [');
  q.choices.forEach((c, i) => L.push(`    ${s(c)}${i < q.choices.length - 1 ? ',' : ''}`));
  L.push('  ],');
  L.push(`  answer: ${Array.isArray(q.answer) ? '[' + q.answer.join(', ') + ']' : q.answer},`);
  if (q.shuffle === false) L.push('  shuffle: false,');
  L.push(`  exp: ${s(q.exp)},`);
  if (q.evidence) {
    L.push('  evidence: [');
    q.evidence.forEach(([t, body], i) => {
      L.push(`    [${s(t)},`);
      L.push(`      ${s(body)}]${i < q.evidence.length - 1 ? ',' : ''}`);
    });
    L.push('  ],');
  }
  L.push('  refs: [');
  q.refs.forEach(([t, u], i) => L.push(`    [${s(t)}, ${s(u)}]${i < q.refs.length - 1 ? ',' : ''}`));
  L.push('  ]');
  L.push('},');
  return L.join('\n');
}

const idNum = (id) => parseInt(id.split('-').pop(), 10) || 0;
const sorted = Q.slice().sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || idNum(a.id) - idNum(b.id) || a.id.localeCompare(b.id));

const outDir = path.join(ROOT, 'js', 'data', 'questions');
fs.mkdirSync(outDir, { recursive: true });

const groups = [];
for (const lv of Object.keys(win.PGQ_CATEGORIES)) for (const g of win.PGQ_CATEGORIES[lv].groups) groups.push({ lv, g });

const written = [];
for (const { lv, g } of groups) {
  const qs = sorted.filter((q) => CATS.get(q.cat).group.id === g.id);
  const file = path.join(outDir, `${g.id}.js`);
  if (!qs.length) { if (fs.existsSync(file)) fs.unlinkSync(file); continue; }
  let out = `/*\n * ${win.PGQ_CATEGORIES[lv].name} ${g.id} ${g.name}（${qs.length}問）\n` +
    (win.PGQ_CATEGORIES[lv].outOfScope
      ? ' * 試験範囲外。PostgreSQL 各バージョンのリリースノートや文書に基づくオリジナル問題。形式は DEVELOPMENT.md を参照。\n'
      : ' * PostgreSQL 14 文書に基づくオリジナル問題。形式は DEVELOPMENT.md を参照。\n') +
    ' * tools/format.js で整形しています（node tools/format.js）。\n */\n' +
    '(window.PGQ_QUESTIONS = window.PGQ_QUESTIONS || []).push(\n';
  for (const c of g.cats) {
    const cqs = qs.filter((q) => q.cat === c.id);
    if (!cqs.length) continue;
    out += `\n/* ---------------- ${c.id} ${c.name}（${c.weight ? `重要度 ${c.weight} / ` : ''}${cqs.length}問） ---------------- */\n`;
    out += cqs.map(serialize).join('\n') + '\n';
  }
  out += '\n);\n';
  fs.writeFileSync(file, out);
  written.push(`js/data/questions/${g.id}.js`);
  console.log(`${g.id}.js  ${qs.length}問`);
}

// index.html の読み込みタグを更新
const htmlPath = path.join(ROOT, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const re = /(<!-- questions:start -->)[\s\S]*?(\s*<!-- questions:end -->)/;
if (!re.test(html)) { console.error('index.html に <!-- questions:start --> / <!-- questions:end --> がありません'); process.exit(1); }
const tags = written.map((w) => `\n  <script src="${w}"></script>`).join('');
fs.writeFileSync(htmlPath, html.replace(re, `$1${tags}$2`));
console.log(`index.html を更新しました（合計 ${sorted.length}問）`);
