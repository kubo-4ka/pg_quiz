#!/usr/bin/env node
'use strict';
/*
 * 問題データの検証
 *   node tools/validate.js           形式チェック + カテゴリ別の収録数
 *   node tools/validate.js --links   さらに参照リンク（ページとアンカー）の存在を確認
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ROOT, loadData, categoryIndex } = require('./lib');

const CHECK_LINKS = process.argv.includes('--links');
const errors = [];
const warns = [];

const { srcs, win } = loadData();
const CATS = categoryIndex(win.PGQ_CATEGORIES);
const Q = win.PGQ_QUESTIONS || [];

// index.html に読み込まれていない問題ファイル
const qdir = path.join(ROOT, 'js', 'data', 'questions');
if (fs.existsSync(qdir)) {
  for (const f of fs.readdirSync(qdir)) {
    if (f.endsWith('.js') && !srcs.includes(`js/data/questions/${f}`)) errors.push(`index.html に読み込まれていない問題ファイル: ${f}`);
  }
}

const oddBackticks = (s) => (String(s).match(/`/g) || []).length % 2 === 1;
const ids = new Set();
for (const q of Q) {
  const where = q.id || String(q.q).slice(0, 30);
  const err = (m) => errors.push(`${where}: ${m}`);
  const warn = (m) => warns.push(`${where}: ${m}`);

  if (!q.id) err('id がありません');
  else if (ids.has(q.id)) err('id が重複しています');
  ids.add(q.id);

  const cat = CATS.get(q.cat);
  if (!cat) err(`不明なカテゴリ: ${q.cat}`);
  else {
    if (cat.level !== q.level) err(`level (${q.level}) がカテゴリのレベル (${cat.level}) と一致しません`);
    if (q.id && !q.id.startsWith(`${q.cat}-`)) err('id の接頭辞がカテゴリと一致しません');
  }
  if (typeof q.q !== 'string' || !q.q.trim()) err('問題文がありません');
  if (!Array.isArray(q.choices) || q.choices.length !== 5) err('選択肢は5つ必要です');
  else {
    if (new Set(q.choices.map((c) => String(c).trim())).size !== 5) err('選択肢が重複しています');
    const lens = q.choices.map((c) => String(c).length);
    const want = Array.isArray(q.answer) ? q.answer : [q.answer];
    const maxAns = Math.max(...lens.filter((_, i) => want.includes(i)));
    const maxOther = Math.max(...lens.filter((_, i) => !want.includes(i)));
    if (maxAns > maxOther * 1.5 && maxAns - maxOther > 20) warn('正解の選択肢だけが極端に長く、推測されやすい可能性があります');
  }
  // answer は 0〜4 の整数（単一選択）または 2〜3 個の配列（複数選択）
  const pick = Array.isArray(q.answer) ? q.answer : [q.answer];
  if (!pick.length || !pick.every((a) => Number.isInteger(a) && a >= 0 && a <= 4)) err('answer は 0〜4 の整数、または その配列です');
  else if (new Set(pick).size !== pick.length) err('answer に同じ選択肢が複数あります');
  else if (pick.length > 3) err('複数選択は3つまでです');
  else if (typeof q.q === 'string') {
    const m = q.q.match(/([1-3１-３])つ選びなさい/);
    if (!m) err('問題文に「Nつ選びなさい」がありません');
    else if ('123'['１２３'.indexOf(m[1]) >= 0 ? '１２３'.indexOf(m[1]) : '123'.indexOf(m[1])] !== String(pick.length)) {
      err(`問題文の選択数と answer の数（${pick.length}）が一致しません`);
    }
  }
  // ランダムに出題されるため、問題文は他の問題に依存してはいけない
  if (/前問|前の問題|次の問題|上の問題/.test(q.q)) err('問題文が他の問題を前提にしています（単独で成立させてください）');
  if (q.type !== undefined && q.type !== 'scenario') err("type は 'scenario' のみ指定できます（知識確認は省略）");
  if (typeof q.exp !== 'string' || !q.exp.trim()) err('解説がありません');
  if (!Array.isArray(q.refs) || !q.refs.length) err('refs がありません');
  else q.refs.forEach((r) => { if (!Array.isArray(r) || r.length !== 2 || !r[0] || !r[1]) err('refs の形式が不正です'); });
  [q.q, q.exp, ...(q.choices || [])].forEach((s) => { if (oddBackticks(s)) warn('バッククォートの数が奇数です'); });
}

async function checkLinks() {
  const base = win.PGQ_DOC_BASE;
  const urls = new Map();
  const add = (u, who) => { if (!urls.has(u)) urls.set(u, []); urls.get(u).push(who); };
  Q.forEach((q) => (q.refs || []).forEach(([, u]) => add(/^https?:/.test(u) ? u : base + u, q.id)));
  (win.PGQ_REFERENCES || []).forEach((g) => g.items.forEach((it) => add(it.url, 'references.js')));

  const cacheDir = path.join(os.tmpdir(), 'pg_quiz_linkcache');
  fs.mkdirSync(cacheDir, { recursive: true });
  const pages = [...new Set([...urls.keys()].map((u) => u.split('#')[0]))];
  const result = new Map();
  let next = 0;
  async function worker() {
    while (next < pages.length) {
      const page = pages[next++];
      const cf = path.join(cacheDir, Buffer.from(page).toString('base64url') + '.json');
      if (fs.existsSync(cf) && Date.now() - fs.statSync(cf).mtimeMs < 7 * 864e5) {
        result.set(page, JSON.parse(fs.readFileSync(cf, 'utf8')));
        continue;
      }
      try {
        const res = await fetch(page, { redirect: 'follow' });
        const body = await res.text();
        const v = { status: res.status, ids: [...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]) };
        if (res.status === 200) fs.writeFileSync(cf, JSON.stringify(v));
        result.set(page, v);
      } catch (e) {
        result.set(page, { status: `ERR ${e.message}`, ids: [] });
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  for (const [u, who] of urls) {
    const [page, anchor] = u.split('#');
    const v = result.get(page);
    if (v.status !== 200) errors.push(`リンク切れ (${v.status}): ${u} [${who.join(', ')}]`);
    else if (anchor && !v.ids.includes(anchor)) errors.push(`アンカーが見つかりません: ${u} [${who.join(', ')}]`);
  }
  return { urls: urls.size, pages: pages.length };
}

(async () => {
  // カテゴリ別の収録数
  const PLAN = (win.PGQ_PLAN && win.PGQ_PLAN.cats) || {};
  const planTarget = (id) => (PLAN[id] ? PLAN[id].topics.reduce((a, t) => a + t.est, 0) : 0);
  const pct = (n, d) => (d ? Math.round((n * 100) / d) : 0);
  let sumN = 0;
  let sumT = 0;
  let sumCap = 0;
  let examN = 0;
  let examT = 0;
  let examCap = 0;
  console.log('カテゴリ別の収録数（収録 / 目標の概算、[重要度]）');
  for (const lv of Object.keys(win.PGQ_CATEGORIES)) {
    const def = win.PGQ_CATEGORIES[lv];
    const cats = [...CATS.values()].filter((x) => x.level === lv);
    const total = Q.filter((q) => q.level === lv).length;
    const target = cats.reduce((a, c) => a + planTarget(c.id), 0);
    console.log(`\n[${def.name}${def.outOfScope ? '（試験範囲外）' : ''}] ${total} / 約${target}問（${pct(total, target)}%）${def.examQuestions ? `  模試 ${def.examQuestions}問` : ''}`);
    for (const c of cats) {
      const n = Q.filter((q) => q.cat === c.id).length;
      const t = planTarget(c.id);
      const cap = Math.min(n, t);
      sumN += n; sumT += t; sumCap += cap;
      if (!def.outOfScope) { examN += n; examT += t; examCap += cap; }
      const filled = Math.round(Math.min(1, n / (t || 1)) * 20);
      console.log(`  ${c.id.padEnd(5)} ${String(n).padStart(3)} / ${String(t).padStart(3)}  ${'█'.repeat(filled)}${'░'.repeat(20 - filled)}  ${c.weight ? `[${c.weight}] ` : ''}${c.name}`);
      if (c.weight && n < c.weight) warns.push(`${c.id}: 収録数 ${n} が重要度 ${c.weight} に足りません（模試で他カテゴリから補充されます）`);
      if (!PLAN[c.id]) warns.push(`${c.id}: plan.js に収録計画がありません`);
    }
  }
  console.log(`\n試験範囲: ${examN} / 約${examT}問（進捗 ${pct(examCap, examT)}%）  全体: ${sumN} / 約${sumT}問（進捗 ${pct(sumCap, sumT)}%）`);

  // 出題タイプ別の件数
  const scen = Q.filter((q) => q.type === 'scenario');
  const lvCount = (list, lv) => list.filter((q) => q.level === lv).length;
  console.log(`\n出題タイプ: 知識確認 ${Q.length - scen.length}問 ／ 状況判断 ${scen.length}問（Silver ${lvCount(scen, 'silver')} / Gold ${lvCount(scen, 'gold')} / Ver差分 ${lvCount(scen, 'ver')}）`);

  // 並べ替えない問題の正解位置の偏り（複数選択はそれぞれの正解位置を数える）
  const fixed = Q.filter((q) => q.shuffle === false);
  if (fixed.length) {
    const dist = [0, 0, 0, 0, 0];
    fixed.forEach((q) => [].concat(q.answer).forEach((a) => dist[a]++));
    console.log(`\nshuffle:false の問題 ${fixed.length}問の正解位置: ${dist.map((n, i) => 'ABCDE'[i] + '=' + n).join(' ')}`);
  }

  if (CHECK_LINKS) {
    const r = await checkLinks();
    console.log(`\nリンク確認: ${r.urls} URL / ${r.pages} ページ`);
  }

  console.log(`\n合計 ${Q.length}問`);
  warns.forEach((w) => console.log(`WARN  ${w}`));
  errors.forEach((e) => console.log(`ERROR ${e}`));
  console.log(errors.length ? `\n✗ エラー ${errors.length}件` : '\n✓ エラーはありません');
  process.exit(errors.length ? 1 : 0);
})();
