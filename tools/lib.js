'use strict';
/* tools 共通: index.html が読み込むデータファイルを Node 上で評価する */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function dataScripts() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="(js\/data\/[^"]+)"><\/script>/g)].map((m) => m[1]);
}

/** index.html の data スクリプト（+ 追加ファイル）を読み込み、window を返す */
function loadData(extraFiles = []) {
  const srcs = dataScripts();
  // tools/plan.js は収録計画（開発時のみ利用）。アプリ側では読み込まない
  const devOnly = ['tools/plan.js'].filter((f) => fs.existsSync(path.resolve(ROOT, f)));
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const s of [...srcs, ...devOnly, ...extraFiles]) {
    const file = path.resolve(ROOT, s);
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  }
  return { srcs, win: ctx.window };
}

function categoryIndex(CATS) {
  const map = new Map();
  for (const lv of Object.keys(CATS)) {
    for (const g of CATS[lv].groups) {
      for (const c of g.cats) map.set(c.id, { ...c, level: lv, group: g });
    }
  }
  return map;
}

module.exports = { ROOT, loadData, dataScripts, categoryIndex };
