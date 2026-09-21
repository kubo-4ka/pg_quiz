/*
 * pg_quiz - PostgreSQL 14 / OSS-DB 対策クイズ
 */
(function () {
  'use strict';

  /* =====================================================================
   * 定数・データ
   * ===================================================================== */
  const QUESTIONS = (window.PGQ_QUESTIONS || []).slice();
  const CATS = window.PGQ_CATEGORIES;
  const REFS = window.PGQ_REFERENCES || [];
  const DOC_BASE = window.PGQ_DOC_BASE || 'https://www.postgresql.jp/document/14/html/';
  const MOCK_MINUTES = 80;
  const RESULT_PAGE = 50; // 結果画面で一度に表示する問題数
  const TRACKS = Object.keys(CATS); // silver, gold, ver
  const LEVELS = TRACKS.filter((lv) => !CATS[lv].outOfScope); // 試験範囲（silver, gold）
  const LETTERS = 'ABCDE';
  const WEEKDAYS = '日月火水木金土';
  const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
  const MODE_LABEL = { normal: '通常', unseen: '未出題優先', review: '復習', mock: '模試', retry: '再挑戦', single: '個別' };
  const LEVEL_LABEL = { all: '試験範囲', silver: 'Silver', gold: 'Gold', ver: 'Ver差分' };
  const STATUS_LABEL = { unseen: '未出題', review: '復習対象', learned: '習得済' };
  // 出題タイプ: 知識確認（既定）／状況判断（設定・出力・SQL・障害状況などを示して判断させる問題）
  const TYPE_LABEL = { knowledge: '知識確認', scenario: '状況判断' };
  const qType = (q) => (q.type === 'scenario' ? 'scenario' : 'knowledge');
  const typeMatch = (q, t) => !t || t === 'all' || qType(q) === t;
  const typeBadge = (t) => `<span class="badge ${t === 'scenario' ? 'scenario' : 'knowledge'}">${TYPE_LABEL[t]}</span>`;

  /* ---- 解答（単一選択 / 複数選択の共通ヘルパー） ----
     q.answer は数値（単一選択）または数値の配列（複数選択）。
     セッションの解答も同様に、数値 / 数値の配列 / -1（わからない）/ null（未回答）。 */
  const ansArr = (q) => (Array.isArray(q.answer) ? q.answer : [q.answer]);
  const pickCount = (q) => ansArr(q).length;
  const isMulti = (q) => pickCount(q) > 1;
  const selArr = (ch) => (Array.isArray(ch) ? ch : ch === null || ch === undefined || ch === -1 ? [] : [ch]);
  const ansLetters = (q, perm) => ansArr(q).map((a) => LETTERS[perm ? perm.indexOf(a) : a]).sort().join('・');
  const chLabel = (ch, perm) => (ch === null || ch === undefined ? '未回答' : ch === -1 ? 'わからない' : selArr(ch).map((i) => LETTERS[perm ? perm.indexOf(i) : i]).sort().join('・') || '未回答');

  function gradeOk(q, ch) {
    if (ch === null || ch === undefined || ch === -1) return false;
    const want = ansArr(q);
    const got = selArr(ch);
    return got.length === want.length && want.every((a) => got.includes(a));
  }

  // 'none' 未回答 ／ 'partial' 選択途中（複数選択のみ）／ 'done' 必要数まで選択済
  function answerState(ss, qid) {
    const ch = ss.answers[qid];
    if (ch === undefined || ch === null) return 'none';
    if (ch === -1) return 'done';
    const got = selArr(ch);
    if (!got.length) return 'none';
    return got.length === pickCount(QMAP.get(qid)) ? 'done' : 'partial';
  }

  // 通常モードで正誤・解説を表示してよいか（複数選択は「回答する」で確定させる）
  function isDecided(ss, qid) {
    const ch = ss.answers[qid];
    if (ch === undefined || ch === null) return false;
    if (Array.isArray(ch)) return !!ss.locked[qid];
    return true;
  }
  const APP = window.PGQ_APP || {};

  const QMAP = new Map(QUESTIONS.map((q) => [q.id, q]));
  const CATMAP = new Map();
  TRACKS.forEach((lv) => CATS[lv].groups.forEach((g) => g.cats.forEach((c) => CATMAP.set(c.id, { ...c, group: g, level: lv }))));
  const inScope = (q) => !CATS[q.level].outOfScope;
  const CAT_ORDER = [...CATMAP.keys()];
  QUESTIONS.sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || a.id.localeCompare(b.id));

  const $view = document.getElementById('view');
  const D = () => Store.data;
  const ST = () => Store.data.settings;

  let timerId = null;
  const ui = { homeCatOpen: false, homeMockOpen: false, listFilterOpen: true, listOpen: { silver: false, gold: false, ver: false }, resultFilter: 'all', resultLimit: 50, resultId: null, historyFilter: 'all', historyLimit: 30 };
  const listState = { level: 'all', cat: '', status: 'all', qtype: 'all', q: '' };

  /* =====================================================================
   * ユーティリティ
   * ===================================================================== */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // `code` と **強調**（否定形の問題文で「適切でないもの」を目立たせる）に対応
  const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  const pct = (n, d) => (d ? Math.round((n * 100) / d) : 0);
  const refUrl = (u) => (/^https?:/.test(u) ? u : DOC_BASE + u);

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function fmtDate(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  function fmtDur(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60);
    if (m >= 60) return `${Math.floor(m / 60)}時間${m % 60}分`;
    return `${m}分${String(sec % 60).padStart(2, '0')}秒`;
  }
  const levelBadge = (lv) => (CATS[lv] ? `<span class="badge ${lv}">${LEVEL_LABEL[lv]}</span>` : `<span class="badge neutral">${LEVEL_LABEL[lv] || '混合'}</span>`);
  const catName = (id) => (CATMAP.get(id) ? CATMAP.get(id).name : id);
  const catBadge = (id) => `<span class="badge cat" title="${esc(catName(id))}">${esc(id)}</span>`;

  function statusOf(qid) {
    const s = Store.stat(qid);
    if (!s || !s.a) return 'unseen';
    return s.r ? 'review' : 'learned';
  }
  function statusBadge(st) {
    const cls = { unseen: 'neutral', review: 'warn', learned: 'good' }[st];
    return `<span class="badge ${cls}">${STATUS_LABEL[st]}</span>`;
  }

  let toastTimer = null;
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  function modal({ title, body, buttons }) {
    const root = document.getElementById('modalRoot');
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2><div class="modal-body">${body || ''}</div><div class="modal-foot"></div></div>`;
    const foot = back.querySelector('.modal-foot');
    const opener = document.activeElement;
    const close = () => {
      back.remove();
      if (opener && opener.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    };
    back.closeModal = close;
    back.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const items = [...back.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    (buttons || [{ label: '閉じる' }]).forEach((b) => {
      const el = document.createElement('button');
      el.className = 'btn block ' + (b.cls || '');
      el.textContent = b.label;
      el.addEventListener('click', () => { close(); if (b.onClick) b.onClick(); });
      foot.appendChild(el);
    });
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    root.appendChild(back);
    const first = foot.querySelector('.btn');
    if (first) first.focus({ preventScroll: true });
    return { el: back, close };
  }
  const closeModals = () => { [...document.querySelectorAll('#modalRoot .modal-back')].reverse().forEach((m) => m.closeModal()); };
  const hasModal = () => !!document.querySelector('#modalRoot .modal-back');

  function confirmModal(title, body, okLabel, onOk, danger) {
    modal({ title, body, buttons: [{ label: okLabel, cls: danger ? 'danger' : 'primary', onClick: onOk }, { label: 'キャンセル' }] });
  }

  const EVIDENCE_OPEN_LINES = 12; // これより短い出力は開いた状態で表示する

  /** 解説に添える、実機で採取した出力 */
  function evidenceHtml(q) {
    if (!q.evidence || !q.evidence.length) return '';
    const items = q.evidence.map(([title, body]) => {
      const lines = body.split('\n').length;
      return `<details class="ev" ${lines <= EVIDENCE_OPEN_LINES ? 'open' : ''}><summary>${esc(title)} <span class="sum-note">${lines}行</span></summary><pre class="code">${esc(body)}</pre></details>`;
    }).join('');
    return `<div class="ev-box"><div class="ev-title">🖥 実際の出力</div>${items}</div>`;
  }

  function explainHtml(q) {
    const refs = (q.refs || []).map(([t, u]) => `<li><a href="${esc(refUrl(u))}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('');
    return `<div class="exp">${fmt(q.exp)}</div>` + evidenceHtml(q) +
      (refs ? `<div class="refs"><div class="refs-title">📖 参照ドキュメント</div><ul>${refs}</ul></div>` : '');
  }

  /* =====================================================================
   * テーマ
   * ===================================================================== */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    document.getElementById('themeSelect').value = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
  }

  /* =====================================================================
   * 目標（1日あたりの目安）
   * ===================================================================== */
  function goalProgress(g) {
    const qs = QUESTIONS.filter((q) => (g.scope === 'all' ? inScope(q) : q.level === g.scope));
    const L = Math.max(1, +g.laps || 1);
    let done = 0;
    qs.forEach((q) => { const s = Store.stat(q.id); done += Math.min(s ? s.a : 0, L); });
    return { n: qs.length, laps: L, required: qs.length * L, done, remaining: qs.length * L - done };
  }
  const goalKey = (g) => [g.date, g.laps, g.scope, QUESTIONS.length].join('|');

  function ensureGoalSnapshot() {
    const g = D().goal;
    if (!g.date) return;
    const day = Store.dayKey();
    const key = goalKey(g);
    if (!g.snap || g.snap.day !== day || g.snap.key !== key) {
      g.snap = { day, key, remaining: goalProgress(g).remaining };
    }
  }
  Store.onBeforeRecord = ensureGoalSnapshot;

  const goalWeekdays = (g) => (Array.isArray(g.days) && g.days.length ? g.days : ALL_DAYS);
  const fmtDay = (dt) => `${dt.getMonth() + 1}/${dt.getDate()}（${WEEKDAYS[dt.getDay()]}）`;

  function goalInfo() {
    const g = D().goal;
    if (!g.date) return null;
    ensureGoalSnapshot();
    const p = goalProgress(g);
    const weekdays = goalWeekdays(g);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(g.date + 'T00:00:00');
    const days = Math.round((target - today) / 86400000) + 1; // 今日と目標日を含む暦日数
    // 今日から目標日までの学習日の数
    let studyLeft = 0;
    for (let dt = new Date(today); dt <= target; dt.setDate(dt.getDate() + 1)) {
      if (weekdays.includes(dt.getDay())) studyLeft++;
    }
    const todayStudy = weekdays.includes(today.getDay());
    const base = g.snap ? g.snap.remaining : p.remaining; // 今日の開始時点の残り
    const perStudyDay = studyLeft > 0 ? Math.ceil(base / studyLeft) : base;
    const dailyTarget = todayStudy ? perStudyDay : 0;
    const todayDone = Math.max(0, base - p.remaining);
    let next = null;
    if (!todayStudy && studyLeft > 0) {
      next = new Date(today);
      do { next.setDate(next.getDate() + 1); } while (!weekdays.includes(next.getDay()));
    }
    return { ...p, days, studyLeft, todayStudy, perStudyDay, dailyTarget, todayDone, next, weekdays };
  }

  /* =====================================================================
   * ルーティング
   * ===================================================================== */
  function route() {
    clearInterval(timerId);
    timerId = null;
    closeModals();
    const h = location.hash.replace(/^#\/?/, '') || 'home';
    const [name, arg] = h.split('/');
    document.body.classList.toggle('in-quiz', name === 'quiz');
    document.querySelectorAll('.tabbar a').forEach((a) => {
      a.classList.toggle('active', a.dataset.tab === name || (name === 'result' && a.dataset.tab === 'history'));
    });
    const views = { home: renderHome, quiz: renderQuiz, result: renderResult, history: renderHistory, list: renderList, refs: renderRefs, analysis: renderAnalysis };
    $view.scrollTop = 0;
    (views[name] || renderHome)(arg ? decodeURIComponent(arg) : undefined);
  }
  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  /* =====================================================================
   * 出題プール
   * ===================================================================== */
  function filteredPool() {
    const s = ST();
    return QUESTIONS.filter((q) => (s.level === 'all' ? inScope(q) : q.level === s.level) && !s.excludedCats.includes(q.cat) && typeMatch(q, s.qtype));
  }
  function countOptions(n) {
    const opts = [];
    [5, 10, 20, 30].forEach((v) => { if (v < n) opts.push(v); });
    for (let v = 40; v < n && v <= 100; v += 10) opts.push(v);
    for (let v = 150; v < n; v += 50) opts.push(v);
    return opts;
  }
  function effectiveCount(n) {
    const c = ST().count;
    if (!c || c >= n || !countOptions(n).includes(c)) return n;
    return c;
  }
  function pickUnseenFirst(pool, n) {
    const unseen = shuffle(pool.filter((q) => statusOf(q.id) === 'unseen'));
    const rest = shuffle(pool.filter((q) => statusOf(q.id) !== 'unseen'))
      .sort((a, b) => (Store.stat(a.id) ? Store.stat(a.id).a : 0) - (Store.stat(b.id) ? Store.stat(b.id).a : 0));
    return unseen.concat(rest).slice(0, n);
  }

  function buildMock(level) {
    const def = CATS[level];
    const picks = [];
    const short = [];
    def.groups.forEach((g) => g.cats.forEach((c) => {
      const cand = shuffle(QUESTIONS.filter((q) => q.level === level && q.cat === c.id));
      const take = cand.slice(0, c.weight);
      picks.push(...take);
      if (take.length < c.weight) short.push(`${c.id}（${take.length}/${c.weight}）`);
    }));
    const lack = def.examQuestions - picks.length;
    let filled = 0;
    if (lack > 0) {
      const used = new Set(picks.map((q) => q.id));
      const fill = shuffle(QUESTIONS.filter((q) => q.level === level && !used.has(q.id))).slice(0, lack);
      filled = fill.length;
      picks.push(...fill);
    }
    let notice = '';
    if (short.length) {
      notice = `収録数が不足しているカテゴリがあります: ${short.join('、')}。` +
        (filled ? `同レベルの他カテゴリから${filled}問を補充しました。` : '') +
        (picks.length < def.examQuestions ? `全${picks.length}問で実施します。` : '');
    }
    return { ids: picks.map((q) => q.id), notice };
  }

  /* =====================================================================
   * セッション
   * ===================================================================== */
  function startSession(mode, qids, meta) {
    const doStart = () => {
      const perms = {};
      qids.forEach((id) => {
        const q = QMAP.get(id);
        const idx = q.choices.map((_, i) => i);
        perms[id] = ST().shuffle && q.shuffle !== false ? shuffle(idx) : idx;
      });
      D().session = {
        id: 's' + Date.now().toString(36),
        mode,
        level: meta.level || 'all',
        qtype: meta.qtype || 'all',
        label: meta.label || '',
        qids,
        perms,
        idx: 0,
        answers: {},
        locked: {},
        flags: {},
        startedAt: Date.now(),
        endsAt: mode === 'mock' ? Date.now() + MOCK_MINUTES * 60000 : null,
        notice: meta.notice || ''
      };
      Store.save();
      go('#/quiz');
    };
    if (D().session) {
      confirmModal('中断中のクイズがあります', '中断中のクイズを破棄して、新しく始めますか？', '破棄して開始', doStart, true);
    } else {
      doStart();
    }
  }

  // 出題時の選択肢の並び順（シャッフルしていなければ保存しない）
  function shownOrder(ss, q) {
    const perm = ss.perms && ss.perms[q.id];
    if (!Array.isArray(perm) || perm.length !== q.choices.length) return undefined;
    return perm.every((v, i) => v === i) ? undefined : perm;
  }

  function answeredCount(ss) {
    return ss.qids.filter((id) => answerState(ss, id) === 'done').length;
  }

  function finishSession(timeUp) {
    const ss = D().session;
    if (!ss) return;
    clearInterval(timerId);
    timerId = null;
    const isMock = ss.mode === 'mock';
    const items = [];
    ss.qids.forEach((id) => {
      const q = QMAP.get(id);
      if (!q) return;
      const ch = ss.answers[id];
      if (isMock) {
        const ok = gradeOk(q, ch);
        Store.record(id, ok); // 模試は採点時にまとめて記録（未回答・選択不足は不正解扱い）
        items.push({ id, ch: ch === undefined ? null : ch, ok, pm: shownOrder(ss, q) });
      } else if (isDecided(ss, id)) {
        items.push({ id, ch, ok: gradeOk(q, ch), pm: shownOrder(ss, q) });
      }
    });
    const end = Date.now();
    const entry = {
      id: ss.id,
      mode: ss.mode,
      level: ss.level,
      qtype: ss.qtype,
      label: ss.label,
      startedAt: ss.startedAt,
      endedAt: end,
      duration: Math.round((Math.min(end, ss.endsAt || end) - ss.startedAt) / 1000),
      planned: ss.qids.length,
      total: items.length,
      correct: items.filter((i) => i.ok).length,
      timeUp: !!timeUp,
      items
    };
    D().session = null;
    if (items.length) Store.addHistory(entry);
    Store.save();
    if (items.length) {
      go('#/result/' + entry.id);
      if (timeUp) toast('⏰ 制限時間になったため採点しました');
    } else {
      toast('解答した問題がないため、履歴には保存しませんでした');
      go('#/home');
    }
  }

  /* =====================================================================
   * ホーム
   * ===================================================================== */
  function renderHome() {
    ensureGoalSnapshot();
    const s = ST();
    const d = D();
    let unseen = 0;
    let review = 0;
    QUESTIONS.forEach((q) => { const st = statusOf(q.id); if (st === 'unseen') unseen++; if (st === 'review') review++; });
    const todayN = d.daily[Store.dayKey()] || 0;

    let h = '';
    if (Store.newer) h += `<div class="notice">新しいバージョンのアプリで保存された学習データがあります。データを守るため、この画面では保存を止めています。ページを再読み込みしてください。</div>`;
    else if (!Store.available) h += `<div class="notice">ブラウザの保存領域が利用できないため、学習データが保存されません（プライベートモードなど）。</div>`;

    if (d.session) {
      const ss = d.session;
      const rem = ss.endsAt ? ss.endsAt - Date.now() : null;
      const expired = rem !== null && rem <= 0;
      h += `<div class="card resume">
        <h2>▶ 中断中のクイズ</h2>
        <div class="small">${MODE_LABEL[ss.mode] || esc(ss.mode)}${ss.label ? '・' + esc(ss.label) : ''} ／ ${answeredCount(ss)} / ${ss.qids.length}問 解答済${rem !== null ? ' ／ 残り ' + (expired ? '時間切れ' : fmtDur(rem / 1000)) : ''}</div>
        <div class="btn-row" style="margin-top:8px">
          <button class="btn primary" data-act="resume">${expired ? '採点する' : '再開する'}</button>
          <button class="btn" data-act="discard">破棄</button>
        </div>
      </div>`;
    }

    h += `<div class="hero">
      <div class="tile"><div class="tv">${QUESTIONS.length}</div><div class="tl">収録問題</div></div>
      <div class="tile"><div class="tv">${unseen}</div><div class="tl">未出題</div></div>
      <div class="tile"><div class="tv">${review}</div><div class="tl">復習対象</div></div>
      <div class="tile"><div class="tv">${todayN}</div><div class="tl">今日の解答</div></div>
    </div>`;

    const gi = goalInfo();
    if (gi && gi.days > 0 && gi.studyLeft > 0 && gi.remaining + gi.todayDone > 0) {
      const p = Math.min(100, pct(gi.todayDone, gi.dailyTarget));
      h += `<a class="card" href="#/analysis" style="display:block;text-decoration:none;color:inherit">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap">
          <strong>🎯 今日の目標</strong><span class="small muted">目標日まであと${gi.days}日（学習日 ${gi.studyLeft}日）</span>
        </div>
        ${gi.todayStudy ? `<div style="display:flex;align-items:center;gap:10px;margin-top:4px">
          <div class="meter" style="flex:1"><div style="width:${p}%"></div></div>
          <span class="nowrap"><strong>${gi.todayDone}</strong> / ${gi.dailyTarget}問</span>
        </div>` : `<div class="small" style="margin-top:4px">今日は学習日ではありません。次の学習日 ${fmtDay(gi.next)} の目安は <strong>${gi.perStudyDay}問</strong> です。${gi.todayDone ? `（今日は ${gi.todayDone}問 進みました）` : ''}</div>`}
      </a>`;
    }

    h += homeStartCard();
    h += homeSettingsFold();
    const issues = APP.repoUrl ? `<a href="${esc(APP.repoUrl.replace(/\/$/, ''))}/issues" target="_blank" rel="noopener">GitHub の Issues</a>` : 'GitHub リポジトリの Issues';
    h += `<details class="fold"><summary>ℹ️ このアプリについて</summary><div class="fold-body small">
      <div class="disclaimer">
        <strong>⚠️ ご利用にあたって</strong><br>
        本アプリは<strong>個人が開発・公開している非公式の学習用アプリ</strong>です。LPI-Japan（OSS-DB 技術者認定試験の運営団体）や PostgreSQL Global Development Group などの公式なものではなく、それらの団体とは関係ありません。<br>
        問題と解説は PostgreSQL 14 文書を参照し、正確さに注意して作成していますが、誤りや古い情報が含まれている可能性があります。お気づきの点がありましたら、${issues} でお知らせいただけると助かります。<br>
        試験の最新情報は必ず公式サイトでご確認ください。本アプリの利用によって生じた結果について、開発者は責任を負いかねます。
      </div>
      <p>PostgreSQL 14 の日本語文書に基づいて作成した、OSS-DB 技術者認定試験（Silver / Gold）対策向けのクイズアプリです。問題はすべてオリジナルで、各解説から該当するドキュメントを参照できます。</p>
      <ul>
        <li><strong>通常</strong>: 選択するとその場で正誤と解説を表示します。</li>
        <li><strong>未出題</strong>: まだ一度も解いていない問題を優先して出題します。</li>
        <li><strong>復習</strong>: 一度でも間違えた問題は、連続2回正解するまで復習対象になります。</li>
        <li><strong>模試</strong>: 出題範囲の重要度の数だけ各カテゴリから出題します（Silver 50問 / Gold 30問、制限時間${MOCK_MINUTES}分）。本試験の試験時間は試験後のアンケートを含めて90分のため、模試では解答にあてる時間として${MOCK_MINUTES}分にしています。解説は採点後にまとめて表示します。未回答は不正解として記録します。</li>
        <li><strong>出題タイプ</strong>: 「知識確認」は機能・仕様・既定値などを問う問題、「状況判断」は設定・コマンドやビューの出力・ログ・症状を示して、結果や原因・対処を判断させる問題です。ホームで絞り込めます。</li>
        <li><strong>Ver差分</strong>: レベルで「Ver差分」を選ぶと、試験範囲外のバージョン間の主な変更点・非互換を出題します。模試や「試験範囲」の集計には含まれません。</li>
      </ul>
      <p>学習データはこのブラウザ内（localStorage）にのみ保存されます。複数の端末で学習する場合は「設定・データ管理」から、一方でエクスポートしたファイルをもう一方で統合してください。</p>
      <p>ブラウザのメニューから「ホーム画面に追加」（「アプリをインストール」）すると、アプリのように起動できます。一度開いた後は、通信できない場所でも出題と解説を表示できます（解説のリンク先の文書を除く）。</p>
      <p>解説を開いているときは、右上の「▴ 問題」で問題文と選択肢をたたんで、解説を画面いっぱいに表示できます。状況判断の問題では、解説に実際の出力を折り畳みで添えています。</p>
      <p>キーボード操作: 1〜5 または A〜E で選択、Enter で次へ、← → で模試の前後移動。</p>
      ${APP.version ? `<p class="muted">バージョン ${esc(APP.version)}</p>` : ''}
    </div></details>`;

    $view.innerHTML = h;
    bindHome();
  }

  function homeStartCard() {
    const s = ST();
    const modes = [['normal', '通常', 'ランダム'], ['unseen', '未出題', '優先出題'], ['review', '復習', '間違えた問題'], ['mock', '模試', '本番形式']];
    let h = `<section class="card"><h2>🚀 クイズを始める</h2>
      <div class="field"><span class="label">モード</span>
        <div class="seg" data-seg="mode">${modes.map(([v, l, sub]) => `<button type="button" data-v="${v}" class="${s.mode === v ? 'on' : ''}">${l}<span class="seg-sub">${sub}</span></button>`).join('')}</div>
      </div>`;

    if (s.mode === 'mock') {
      const lv = s.mockLevel;
      const def = CATS[lv];
      const avail = QUESTIONS.filter((q) => q.level === lv).length;
      let rows = '';
      let shortCats = 0;
      def.groups.forEach((g) => g.cats.forEach((c) => {
        const n = QUESTIONS.filter((q) => q.cat === c.id).length;
        if (n < c.weight) shortCats++;
        rows += `<tr><td>${esc(c.id)}</td><td>${esc(c.name)}</td><td class="num">${c.weight}問</td><td class="num ${n < c.weight ? '' : 'muted'}">${n < c.weight ? '⚠ ' : ''}収録${n}</td></tr>`;
      }));
      h += `<div class="field"><span class="label">試験レベル</span>
          <div class="seg" data-seg="mockLevel">
            <button type="button" data-v="silver" class="${lv === 'silver' ? 'on' : ''}">Silver<span class="seg-sub">${CATS.silver.examQuestions}問</span></button>
            <button type="button" data-v="gold" class="${lv === 'gold' ? 'on' : ''}">Gold<span class="seg-sub">${CATS.gold.examQuestions}問</span></button>
          </div>
        </div>
        <p class="start-summary">${def.name} 模試: ${def.examQuestions}問 ／ 制限時間 ${MOCK_MINUTES}分（本試験はアンケートを含めて90分）。解答中は正誤を表示せず、終了後にまとめて採点・解説します。</p>
        ${avail < def.examQuestions ? `<div class="notice">収録問題が${avail}問のため、${avail}問で実施します（問題の追加で本番と同じ${def.examQuestions}問になります）。</div>` : shortCats ? `<div class="notice">一部カテゴリの収録数が不足しているため、同レベルの他カテゴリから補充します。</div>` : ''}
        <details class="sub" id="mockDist" ${ui.homeMockOpen ? 'open' : ''}><summary>出題配分（重要度）</summary><div class="sub-body" style="padding-left:0">
          <table class="mock-table">${rows}</table>
          <p class="small muted">出典: <a href="${def.outlineUrl}" target="_blank" rel="noopener">OSS-DB ${def.name} 出題範囲</a></p>
        </div></details>
        <button class="btn primary block" data-act="start" ${avail ? '' : 'disabled'} style="margin-top:8px">⏱ ${def.name} 模試を開始</button>`;
      return h + '</section>';
    }

    // 通常 / 未出題 / 復習
    const pool = filteredPool();
    const target = s.mode === 'review' ? pool.filter((q) => statusOf(q.id) === 'review') : pool;
    const n = target.length;
    const opts = countOptions(n);
    const eff = effectiveCount(n);
    const unseenN = pool.filter((q) => statusOf(q.id) === 'unseen').length;

    const levels = s.level === 'all' ? LEVELS : [s.level];
    const scopeCats = levels.flatMap((lv) => CATS[lv].groups.flatMap((g) => g.cats));
    const selCats = scopeCats.filter((c) => !s.excludedCats.includes(c.id)).length;
    // 「全問」が収録数全体ではなく、選択中の範囲の全問であることを示す
    const allLabel = (s.mode === 'review' ? '復習対象' : selCats === scopeCats.length ? LEVEL_LABEL[s.level] : '選択カテゴリ') + (s.qtype && s.qtype !== 'all' ? '・' + TYPE_LABEL[s.qtype] : '');

    let catHtml = '';
    levels.forEach((lv) => {
      const allOn = CATS[lv].groups.every((g) => g.cats.every((c) => !s.excludedCats.includes(c.id)));
      catHtml += `<div class="cat-group-head">${levelBadge(lv)} <button type="button" class="btn small ghost" data-bulk="${lv}" data-on="${allOn ? 0 : 1}">${allOn ? 'すべて解除' : 'すべて選択'}</button></div>`;
      CATS[lv].groups.forEach((g) => {
        catHtml += `<div class="small muted" style="margin-top:4px">${esc(g.id)} ${esc(g.name)}</div>`;
        g.cats.forEach((c) => {
          const qs = QUESTIONS.filter((q) => q.cat === c.id);
          const extra = s.mode === 'review' ? `復習${qs.filter((q) => statusOf(q.id) === 'review').length}` : s.mode === 'unseen' ? `未出題${qs.filter((q) => statusOf(q.id) === 'unseen').length}` : '';
          catHtml += `<label class="cat-item"><input type="checkbox" data-cat="${c.id}" ${s.excludedCats.includes(c.id) ? '' : 'checked'}>
            <span>${esc(c.id)} ${esc(c.name)}</span><span class="cnt">${extra ? extra + ' / ' : ''}${qs.length}問</span></label>`;
        });
      });
    });

    let summary;
    if (s.mode === 'review') summary = n ? `復習対象 ${n}問から ${eff}問を出題します。` : '選択した範囲に復習対象の問題はありません。';
    else if (s.mode === 'unseen') summary = n ? `対象 ${n}問（うち未出題 ${unseenN}問）から、未出題を優先して ${eff}問を出題します。` : '選択した範囲に問題がありません。';
    else summary = n ? `対象 ${n}問から ${eff}問をランダムに出題します。` : '選択した範囲に問題がありません。';

    h += `<div class="field"><span class="label">レベル</span>
        <div class="seg" data-seg="level">
          <button type="button" data-v="silver" class="${s.level === 'silver' ? 'on' : ''}">Silver<span class="seg-sub">試験</span></button>
          <button type="button" data-v="gold" class="${s.level === 'gold' ? 'on' : ''}">Gold<span class="seg-sub">試験</span></button>
          <button type="button" data-v="all" class="${s.level === 'all' ? 'on' : ''}">試験範囲<span class="seg-sub">S + G</span></button>
          <button type="button" data-v="ver" class="${s.level === 'ver' ? 'on' : ''}">Ver差分<span class="seg-sub">範囲外</span></button>
        </div>
      </div>
      <div class="field"><span class="label">出題タイプ</span>
        <div class="seg" data-seg="qtype">${[['all', 'すべて'], ['knowledge', '知識確認'], ['scenario', '状況判断']].map(([v, l]) => `<button type="button" data-v="${v}" class="${(s.qtype || 'all') === v ? 'on' : ''}">${l}<span class="seg-sub">${QUESTIONS.filter((q) => (s.level === 'all' ? inScope(q) : q.level === s.level) && typeMatch(q, v)).length}問</span></button>`).join('')}</div>
      </div>
      <details class="sub" id="catFold" ${ui.homeCatOpen ? 'open' : ''}>
        <summary><span>出題カテゴリ: <strong>${selCats === scopeCats.length ? 'すべて' : `${selCats} / ${scopeCats.length}件`}</strong></span></summary>
        <div class="sub-body" style="padding-left:0">${catHtml}</div>
      </details>
      <div class="field inline" style="margin-top:8px"><label class="label" for="countSel">問題数</label>
        <select class="input" id="countSel" ${n ? '' : 'disabled'}>
          ${opts.map((v) => `<option value="${v}" ${eff === v ? 'selected' : ''}>${v}問</option>`).join('')}
          <option value="0" ${eff === n ? 'selected' : ''}>全問（${allLabel} ${n}問）</option>
        </select>
      </div>
      <p class="start-summary">${summary}</p>
      <button class="btn primary block" data-act="start" ${n ? '' : 'disabled'}>▶ スタート</button>`;
    return h + '</section>';
  }

  function homeSettingsFold() {
    const s = ST();
    const backup = Store.backupInfo();
    return `<details class="fold"><summary>⚙️ 設定・データ管理</summary><div class="fold-body">
      <label class="check"><input type="checkbox" id="optShuffle" ${s.shuffle ? 'checked' : ''}> 選択肢の順番をシャッフルする</label>
      <h3>学習データ</h3>
      <p class="small muted" style="margin-top:0">成績・履歴・目標はこのブラウザに保存されています。PC とスマートフォンなど複数の端末で学習する場合は、一方でエクスポートしたファイルをもう一方で「統合」してください。</p>
      <div class="btn-row">
        <button class="btn small" data-act="export">⬇ エクスポート</button>
        <button class="btn small" data-act="import">⬆ インポート</button>
        <input type="file" id="importFile" accept="application/json,.json" hidden>
      </div>
      <div class="btn-row" style="margin-top:8px">
        ${backup ? `<button class="btn small" data-act="restore">↩ 直前の状態に戻す</button>` : ''}
        <button class="btn small danger" data-act="reset">🗑 成績・履歴をリセット</button>
      </div>
      ${backup ? `<p class="small muted" style="margin:6px 0 0">「直前の状態に戻す」: ${fmtDate(backup.savedAt)} に行ったインポートまたはリセットの前の状態（解答 ${backup.answers}件）に戻します。</p>` : ''}
    </div></details>`;
  }

  function bindHome() {
    const s = ST();
    $view.querySelectorAll('[data-seg] button').forEach((b) => b.addEventListener('click', () => {
      const key = b.parentElement.dataset.seg;
      s[key] = b.dataset.v;
      Store.save();
      rerender(renderHome);
    }));
    $view.querySelectorAll('input[data-cat]').forEach((cb) => cb.addEventListener('change', () => {
      const id = cb.dataset.cat;
      s.excludedCats = s.excludedCats.filter((x) => x !== id);
      if (!cb.checked) s.excludedCats.push(id);
      Store.save();
      rerender(renderHome);
    }));
    $view.querySelectorAll('[data-bulk]').forEach((b) => b.addEventListener('click', () => {
      const ids = CATS[b.dataset.bulk].groups.flatMap((g) => g.cats.map((c) => c.id));
      s.excludedCats = s.excludedCats.filter((x) => !ids.includes(x));
      if (b.dataset.on === '0') s.excludedCats.push(...ids);
      Store.save();
      rerender(renderHome);
    }));
    const catFold = document.getElementById('catFold');
    if (catFold) catFold.addEventListener('toggle', () => { ui.homeCatOpen = catFold.open; });
    const mockDist = document.getElementById('mockDist');
    if (mockDist) mockDist.addEventListener('toggle', () => { ui.homeMockOpen = mockDist.open; });
    const countSel = document.getElementById('countSel');
    if (countSel) countSel.addEventListener('change', () => { s.count = +countSel.value; Store.save(); rerender(renderHome); });

    const on = (act, fn) => $view.querySelectorAll(`[data-act="${act}"]`).forEach((el) => el.addEventListener('click', fn));
    on('start', startFromHome);
    on('resume', () => go('#/quiz'));
    on('discard', () => confirmModal('クイズを破棄', '中断中のクイズを破棄します。解答済みの問題の成績（通常モード）は記録されたままです。', '破棄する', () => {
      D().session = null; Store.save(); rerender(renderHome);
    }, true));
    on('export', exportData);
    on('reset', () => confirmModal('成績・履歴をリセット', '全問題の成績、復習対象、挑戦履歴、目標、中断中のクイズを削除します。<br>リセット前の状態は1世代だけ保存され、「直前の状態に戻す」で戻せます。', 'リセットする', () => {
      try {
        Store.reset(true); toast('リセットしました'); rerender(renderHome);
      } catch (e) {
        modal({ title: 'リセットできませんでした', body: esc(e.message) });
      }
    }, true));
    const optShuffle = document.getElementById('optShuffle');
    optShuffle.addEventListener('change', () => { s.shuffle = optShuffle.checked; Store.save(); });
    const importFile = document.getElementById('importFile');
    on('import', () => importFile.click());
    importFile.addEventListener('change', () => {
      const f = importFile.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => importDialog(String(reader.result));
      reader.readAsText(f);
      importFile.value = '';
    });
    on('restore', () => confirmModal('直前の状態に戻す', '直前に行ったインポートまたはリセットの前の状態に戻します。その後に解いた記録は失われます。', '戻す', () => {
      try {
        Store.restoreBackup();
        applyTheme(ST().theme);
        toast('元に戻しました');
        rerender(renderHome);
      } catch (e) {
        modal({ title: '元に戻せませんでした', body: esc(e.message) });
      }
    }, true));
  }

  function importDialog(text) {
    let info;
    try {
      info = Store.inspectImport(text);
    } catch (e) {
      modal({ title: 'インポートできません', body: esc(e.message) });
      return;
    }
    const when = info.exportedAt ? fmtDate(Date.parse(info.exportedAt)) : '不明';
    const body = `<p style="margin-top:0">ファイルの内容（${esc(when)} に書き出し）: 解答 <strong>${info.answers}件</strong>・挑戦履歴 <strong>${info.history}回</strong><br>
      このうち、この端末にない記録: 解答 <strong>${info.newAnswers}件</strong>・挑戦履歴 <strong>${info.newHistory}回</strong></p>
      <ul class="small" style="padding-left:1.2em;margin:0">
        <li><strong>統合</strong>: この端末の記録に、ファイルの記録を追加します。同じ記録が重複することはありません。設定と目標はこの端末のものを残します。</li>
        <li><strong>置き換え</strong>: この端末の記録・設定・目標を、ファイルの内容で置き換えます（中断中のクイズはこの端末のものを残します）。</li>
      </ul>
      <p class="small muted" style="margin-bottom:0">実行前の状態は保存されるので、「直前の状態に戻す」で元に戻せます。</p>`;
    const done = (msg) => { applyTheme(ST().theme); toast(msg); rerender(renderHome); };
    const run = (fn, msg) => { try { fn(); done(msg); } catch (e) { modal({ title: 'インポートに失敗しました', body: esc(e.message) }); } };
    modal({
      title: 'データのインポート',
      body,
      buttons: [
        { label: '統合する', cls: 'primary', onClick: () => run(() => Store.mergeImport(text), `統合しました（解答 ${info.newAnswers}件・履歴 ${info.newHistory}回を追加）`) },
        { label: '置き換える', cls: 'danger', onClick: () => run(() => Store.replaceImport(text), '置き換えました') },
        { label: 'キャンセル' }
      ]
    });
  }

  function rerender(fn, arg) {
    const top = $view.scrollTop;
    fn(arg);
    $view.scrollTop = top;
  }

  function startFromHome() {
    const s = ST();
    if (s.mode === 'mock') {
      const { ids, notice } = buildMock(s.mockLevel);
      if (!ids.length) return toast('問題がありません');
      startSession('mock', ids, { level: s.mockLevel, label: `${LEVEL_LABEL[s.mockLevel]} 模試`, notice });
      return;
    }
    let pool = filteredPool();
    if (s.mode === 'review') pool = pool.filter((q) => statusOf(q.id) === 'review');
    if (!pool.length) return toast('対象の問題がありません');
    const n = effectiveCount(pool.length);
    const picks = s.mode === 'unseen' ? pickUnseenFirst(pool, n) : shuffle(pool).slice(0, n);
    const typeNote = s.qtype && s.qtype !== 'all' ? `・${TYPE_LABEL[s.qtype]}` : '';
    startSession(s.mode, picks.map((q) => q.id), { level: s.level, qtype: s.qtype || 'all', label: `${LEVEL_LABEL[s.level]}${typeNote}・${picks.length}問` });
  }

  // all = true のときは、ホームの問題数設定によらず渡された問題をすべて出題する
  function startQuick(mode, qs, label, all = false) {
    if (!qs.length) return toast('対象の問題がありません');
    const n = mode === 'single' || all ? qs.length : Math.min(qs.length, ST().count || qs.length);
    const picks = mode === 'unseen' ? pickUnseenFirst(qs, n) : mode === 'single' ? qs : shuffle(qs).slice(0, n);
    const lvs = [...new Set(picks.map((q) => q.level))];
    startSession(mode, picks.map((q) => q.id), { level: lvs.length === 1 ? lvs[0] : 'all', label: `${label}・${picks.length}問` });
  }

  function exportData() {
    const blob = new Blob([Store.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pg_quiz_backup_${Store.dayKey().replace(/-/g, '')}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* =====================================================================
   * クイズ画面
   * ===================================================================== */
  function renderQuiz() {
    const ss = D().session;
    if (!ss) { location.replace('#/home'); return; }
    ss.qids = ss.qids.filter((id) => QMAP.has(id));
    if (!ss.qids.length) { D().session = null; Store.save(); location.replace('#/home'); return; }
    if (ss.idx >= ss.qids.length) ss.idx = ss.qids.length - 1;

    const isMock = ss.mode === 'mock';
    if (isMock && Date.now() >= ss.endsAt) { finishSession(true); return; }

    const qid = ss.qids[ss.idx];
    const q = QMAP.get(qid);
    const perm = ss.perms[qid] && ss.perms[qid].length === q.choices.length ? ss.perms[qid] : q.choices.map((_, i) => i);
    const chosen = ss.answers[qid];
    const multi = isMulti(q);
    const need = pickCount(q);
    const got = selArr(chosen);
    const state = answerState(ss, qid);
    const revealed = !isMock && isDecided(ss, qid);
    const total = ss.qids.length;
    const last = ss.idx === total - 1;

    const progress = isMock ? pct(answeredCount(ss), total) : pct(ss.idx + (revealed ? 1 : 0), total);
    const correctSoFar = isMock ? 0 : ss.qids.filter((id) => isDecided(ss, id) && gradeOk(QMAP.get(id), ss.answers[id])).length;

    let head = `<div class="qhead">
      <button class="icon-btn" data-act="quit" aria-label="中断・終了">✕</button>
      <span class="progress-text">${ss.idx + 1}<span class="muted" style="font-weight:400"> / ${total}</span></span>
      <div class="qprogress" aria-hidden="true"><div style="width:${progress}%"></div></div>`;
    if (isMock) {
      head += `<span class="timer" id="timer" aria-label="残り時間">--:--</span>
        <button class="icon-btn" data-act="palette">☰ 一覧</button>`;
    } else {
      head += `<span class="small nowrap">⭕ ${correctSoFar}</span>`;
    }
    head += '</div>';

    const showNotice = ss.notice && ss.idx === 0 && answeredCount(ss) === 0;
    let body = `<div class="qbody" id="qbody">
      ${showNotice ? `<div class="notice">${esc(ss.notice)}</div>` : ''}
      <div class="qmeta">${levelBadge(q.level)}${inScope(q) ? '' : '<span class="badge neutral">試験範囲外</span>'}${catBadge(q.cat)}${qType(q) === 'scenario' ? typeBadge('scenario') : ''}<span class="small muted">${esc(catName(q.cat))}</span><span class="qid">${esc(q.id)}</span></div>
      <div class="qtext">${fmt(q.q)}</div>
      ${q.code ? `<pre class="code">${esc(q.code)}</pre>` : ''}
      ${multi && !revealed ? `<div class="pickbar"><span class="badge multi">${need}つ選択</span><span class="small muted">選択 ${got.length} / ${need}</span></div>` : ''}
      <ol class="choices${multi ? ' multi' : ''}">`;
    perm.forEach((orig, pos) => {
      let cls = '';
      let mark = '';
      if (revealed) {
        if (ansArr(q).includes(orig)) { cls = 'ok'; mark = '✓'; }
        else if (got.includes(orig)) { cls = 'ng'; mark = '✗'; }
        else cls = 'dim';
      } else if (got.includes(orig)) {
        cls = 'sel';
      }
      const state = cls === 'ok' ? '（正解）' : cls === 'ng' ? '（あなたの解答・不正解）' : cls === 'sel' ? '（選択中）' : '';
      body += `<li><button class="choice ${cls}" data-choice="${orig}" ${revealed ? 'disabled' : ''} aria-label="${LETTERS[pos]}: ${esc(q.choices[orig])}${state}">
        <span class="key">${LETTERS[pos]}</span><span class="ct">${fmt(q.choices[orig])}</span>${mark ? `<span class="mark">${mark}</span>` : ''}
      </button></li>`;
    });
    body += '</ol></div>';

    let sheet = '';
    if (revealed) {
      const ok = gradeOk(q, chosen);
      const collapsed = ST().sheetCollapsed;
      const wide = ST().expWide;
      sheet = `<section class="sheet ${ok ? 'ok' : 'ng'} ${collapsed ? 'collapsed' : ''}" id="sheet">
        <div class="sheet-head">
          <button class="sheet-toggle" data-act="sheet" aria-expanded="${!collapsed}">
            <span class="verdict">${ok ? '⭕ 正解' : chosen === -1 ? '💡 わからない' : '❌ 不正解'}</span>
            <span class="small muted">正解は ${ansLetters(q, perm)}</span>
            <span class="chev" id="sheetChev">${collapsed ? '解説を表示 ▴' : 'たたむ ▾'}</span>
          </button>
          <button class="icon-btn qfold-btn ${wide ? 'on' : ''}" data-act="qfold" id="qfoldBtn" aria-pressed="${wide}" ${collapsed ? 'hidden' : ''}>${wide ? '▾ 問題' : '▴ 問題'}</button>
        </div>
        <div class="sheet-body">${explainHtml(q)}</div>
      </section>`;
    }

    let foot = '<div class="qfoot">';
    if (isMock) {
      const flagged = !!ss.flags[qid];
      foot += `<button class="btn narrow" data-act="prev" ${ss.idx === 0 ? 'disabled' : ''} aria-label="前の問題">←</button>
        <button class="btn narrow ${flagged ? 'icon-btn on' : ''}" data-act="flag" aria-pressed="${flagged}">🚩<span class="small">見直し</span></button>
        ${last ? '<button class="btn primary" data-act="submit">採点する</button>' : '<button class="btn primary" data-act="next">次へ →</button>'}`;
    } else if (revealed) {
      foot += `<button class="btn primary" data-act="next">${last ? '結果を見る' : '次の問題 →'}</button>`;
    } else if (multi) {
      foot += `<button class="btn narrow" data-act="skip">わからない</button>
        <button class="btn primary" data-act="commit" ${state === 'done' ? '' : 'disabled'}>回答する（${got.length}/${need}）</button>`;
    } else {
      foot += '<button class="btn" data-act="skip">わからない（解説を見る）</button>';
    }
    foot += '</div>';

    $view.innerHTML = `<div class="quiz">${head}${body}${sheet}${foot}</div>`;
    bindQuiz();
    applyExpWide();

    if (isMock) {
      tickTimer();
      clearInterval(timerId);
      timerId = setInterval(tickTimer, 1000);
    }
  }

  function bindQuiz() {
    $view.querySelectorAll('[data-choice]').forEach((b) => b.addEventListener('click', () => choose(+b.dataset.choice)));
    const acts = {
      quit: quitQuiz,
      palette: showPalette,
      skip: () => choose(-1),
      commit: commitAnswer,
      next: nextQuestion,
      prev: () => moveTo(D().session.idx - 1),
      flag: toggleFlag,
      submit: submitMock,
      sheet: toggleSheet,
      qfold: toggleQFold
    };
    $view.querySelectorAll('[data-act]').forEach((el) => el.addEventListener('click', () => acts[el.dataset.act] && acts[el.dataset.act]()));
  }

  function redrawQuiz() {
    const top = document.getElementById('qbody').scrollTop;
    renderQuiz();
    document.getElementById('qbody').scrollTop = top;
  }

  function choose(orig) {
    const ss = D().session;
    if (!ss) return;
    const qid = ss.qids[ss.idx];
    const q = QMAP.get(qid);
    const isMock = ss.mode === 'mock';
    if (!isMock && isDecided(ss, qid)) return; // 確定済みの問題は変更しない
    if (orig < 0) {
      if (isMock) return; // 模試に「わからない」はない
      ss.answers[qid] = -1;
      Store.record(qid, false);
    } else if (isMulti(q)) {
      const cur = selArr(ss.answers[qid]).slice();
      const at = cur.indexOf(orig);
      if (at >= 0) cur.splice(at, 1);
      else if (cur.length >= pickCount(q)) { toast(`選択できるのは${pickCount(q)}つまでです`); return; }
      else cur.push(orig);
      cur.sort((a, b) => a - b);
      ss.answers[qid] = cur.length ? cur : null;
    } else if (isMock) {
      ss.answers[qid] = ss.answers[qid] === orig ? null : orig;
    } else {
      ss.answers[qid] = orig;
      Store.record(qid, gradeOk(q, orig));
    }
    Store.save();
    redrawQuiz();
  }

  // 複数選択の問題を確定する（通常モードのみ）
  function commitAnswer() {
    const ss = D().session;
    if (!ss || ss.mode === 'mock') return;
    const qid = ss.qids[ss.idx];
    if (isDecided(ss, qid) || answerState(ss, qid) !== 'done') return;
    ss.locked[qid] = true;
    Store.record(qid, gradeOk(QMAP.get(qid), ss.answers[qid]));
    Store.save();
    redrawQuiz();
  }

  function nextQuestion() {
    const ss = D().session;
    if (!ss) return;
    if (ss.mode !== 'mock') {
      const qid = ss.qids[ss.idx];
      if (!isDecided(ss, qid)) return;
      if (ss.idx >= ss.qids.length - 1) { finishSession(false); return; }
    }
    moveTo(ss.idx + 1);
  }

  function moveTo(i) {
    const ss = D().session;
    if (!ss || i < 0 || i >= ss.qids.length) return;
    ss.idx = i;
    Store.save();
    clearInterval(timerId);
    renderQuiz();
  }

  function toggleFlag() {
    const ss = D().session;
    const qid = ss.qids[ss.idx];
    if (ss.flags[qid]) delete ss.flags[qid];
    else ss.flags[qid] = true;
    Store.save();
    clearInterval(timerId);
    renderQuiz();
  }

  function toggleSheet() {
    const s = ST();
    s.sheetCollapsed = !s.sheetCollapsed;
    Store.save();
    const sheet = document.getElementById('sheet');
    sheet.classList.toggle('collapsed', s.sheetCollapsed);
    sheet.querySelector('.sheet-toggle').setAttribute('aria-expanded', String(!s.sheetCollapsed));
    document.getElementById('sheetChev').textContent = s.sheetCollapsed ? '解説を表示 ▴' : 'たたむ ▾';
    document.getElementById('qfoldBtn').hidden = s.sheetCollapsed;
    applyExpWide();
  }

  /** 解説を広く表示するために、問題文と選択肢をたたむ */
  function toggleQFold() {
    const s = ST();
    s.expWide = !s.expWide;
    Store.save();
    const btn = document.getElementById('qfoldBtn');
    btn.classList.toggle('on', s.expWide);
    btn.setAttribute('aria-pressed', String(s.expWide));
    btn.textContent = s.expWide ? '▾ 問題' : '▴ 問題';
    applyExpWide();
  }

  function applyExpWide() {
    const s = ST();
    const quiz = $view.querySelector('.quiz');
    if (quiz) quiz.classList.toggle('exp-wide', !!s.expWide && !s.sheetCollapsed && !!document.getElementById('sheet'));
  }

  function tickTimer() {
    const ss = D().session;
    const el = document.getElementById('timer');
    if (!ss || !ss.endsAt || !el) { clearInterval(timerId); timerId = null; return; }
    const rem = ss.endsAt - Date.now();
    const sec = Math.max(0, Math.ceil(rem / 1000));
    el.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    el.classList.toggle('warn', sec <= 600 && sec > 300);
    el.classList.toggle('danger', sec <= 300);
    if (rem <= 0) {
      clearInterval(timerId);
      timerId = null;
      closeModals();
      finishSession(true);
    }
  }

  function showPalette() {
    const ss = D().session;
    const answered = answeredCount(ss);
    const flagged = ss.qids.filter((id) => ss.flags[id]).length;
    const btns = ss.qids.map((id, i) => {
      const st = answerState(ss, id);
      const a = st === 'done';
      return `<button type="button" data-jump="${i}" class="${a ? 'answered' : st === 'partial' ? 'partial' : ''} ${ss.flags[id] ? 'flag' : ''} ${i === ss.idx ? 'current' : ''}" aria-label="問題${i + 1}${a ? ' 解答済' : st === 'partial' ? ' 選択途中' : ' 未回答'}${ss.flags[id] ? ' 見直し' : ''}">${i + 1}</button>`;
    }).join('');
    const m = modal({
      title: '問題一覧',
      body: `<div class="palette-legend"><span>解答済 <strong>${answered}</strong></span><span>未回答 <strong>${ss.qids.length - answered}</strong></span><span>🚩 見直し <strong>${flagged}</strong></span></div>
        <div class="palette">${btns}</div>`,
      buttons: [{ label: '採点する', cls: 'primary', onClick: submitMock }, { label: '閉じる' }]
    });
    m.el.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => { m.close(); moveTo(+b.dataset.jump); }));
  }

  function submitMock() {
    const ss = D().session;
    const un = ss.qids.length - answeredCount(ss);
    const fl = ss.qids.filter((id) => ss.flags[id]).length;
    let body = '模試を終了して採点します。採点後は解答を変更できません。';
    if (un) body += `<br><strong>未回答が ${un}問</strong> あります（不正解として扱います）。`;
    if (fl) body += `<br>🚩 見直しの印が ${fl}問 に付いています。`;
    confirmModal('採点しますか？', body, '採点する', () => finishSession(false));
  }

  function quitQuiz() {
    const ss = D().session;
    if (ss.mode === 'mock') {
      modal({
        title: '模試の中断・終了',
        body: '一時中断してもタイマーは止まりません。ホームから再開できます。',
        buttons: [
          { label: '終了して採点する', cls: 'primary', onClick: submitMock },
          { label: '一時中断してホームへ', onClick: () => go('#/home') },
          { label: 'キャンセル' }
        ]
      });
    } else {
      const n = answeredCount(ss);
      modal({
        title: 'クイズの中断・終了',
        body: `解答済み: ${n} / ${ss.qids.length}問`,
        buttons: [
          { label: 'ここで終了して結果を見る', cls: 'primary', onClick: () => finishSession(false) },
          { label: '一時中断してホームへ（あとで再開）', onClick: () => go('#/home') },
          { label: 'キャンセル' }
        ]
      });
    }
  }

  /* =====================================================================
   * 結果画面
   * ===================================================================== */
  function renderResult(id) {
    const h = D().history.find((x) => x.id === id);
    if (!h) {
      $view.innerHTML = '<div class="empty">この結果は見つかりませんでした。<br><a href="#/history">履歴へ戻る</a></div>';
      return;
    }
    const items = h.items.filter((it) => QMAP.has(it.id));
    const p = pct(h.correct, h.total);
    const wrong = items.filter((it) => !it.ok);
    const unanswered = items.filter((it) => !selArr(it.ch).length && it.ch !== -1).length;

    // カテゴリ別
    const byCat = new Map();
    items.forEach((it) => {
      const c = QMAP.get(it.id).cat;
      const v = byCat.get(c) || { n: 0, ok: 0 };
      v.n++;
      if (it.ok) v.ok++;
      byCat.set(c, v);
    });
    const catRows = [...byCat.entries()].sort((a, b) => CAT_ORDER.indexOf(a[0]) - CAT_ORDER.indexOf(b[0])).map(([c, v]) => `
      <tr><td>${catBadge(c)} <span class="small">${esc(catName(c))}</span></td>
      <td class="num">${v.ok}/${v.n}</td>
      <td style="width:30%"><div class="meter"><div style="width:${pct(v.ok, v.n)}%"></div></div></td>
      <td class="num">${pct(v.ok, v.n)}%</td></tr>`).join('');

    // 出題タイプ別
    const typeRows = ['knowledge', 'scenario'].map((t) => {
      const list = items.filter((it) => qType(QMAP.get(it.id)) === t);
      if (!list.length) return '';
      const ok = list.filter((it) => it.ok).length;
      return `<tr><td>${typeBadge(t)}</td><td class="num">${ok}/${list.length}</td>
        <td style="width:30%"><div class="meter"><div style="width:${pct(ok, list.length)}%"></div></div></td>
        <td class="num">${pct(ok, list.length)}%</td></tr>`;
    }).join('');

    let html = `<div class="card score-hero">
      <div class="small muted">${MODE_LABEL[h.mode] || esc(h.mode)}${h.label ? '・' + esc(h.label) : ''}</div>
      <div class="pct">${p}<span style="font-size:22px">%</span></div>
      <div class="frac">${h.correct} / ${h.total} 問正解</div>
      <div class="meta">${fmtDate(h.startedAt)} ／ 所要 ${fmtDur(h.duration)}${h.mode === 'mock' && unanswered ? ` ／ 未回答 ${unanswered}問` : ''}${h.timeUp ? ' ／ ⏰ 時間切れ' : ''}${h.planned && h.planned !== h.total && h.mode !== 'mock' ? ` ／ ${h.planned}問中${h.total}問で終了` : ''}</div>
      <div class="btn-row" style="margin-top:12px">
        ${wrong.length ? `<button class="btn primary" data-act="retry">❌ 間違えた${wrong.length}問に再挑戦</button>` : ''}
        <a class="btn" href="#/home">🏠 ホーム</a>
      </div>
    </div>
    <details class="fold" ${h.mode === 'mock' ? 'open' : ''}><summary>📂 カテゴリ・出題タイプ別の結果</summary><div class="fold-body">
      <div class="table-wrap"><table class="data"><tbody>${typeRows}</tbody></table></div>
      <div class="table-wrap" style="margin-top:8px"><table class="data"><tbody>${catRows}</tbody></table></div>
    </div></details>
    <details class="fold" id="resultFold" ${items.length <= RESULT_PAGE ? 'open' : ''}><summary>📝 解答と解説 <span class="sum-note">${items.length}問</span></summary><div class="fold-body">`;

    // 別の結果を開いたら、絞り込みと表示件数を初期状態に戻す
    if (ui.resultId !== id) { ui.resultId = id; ui.resultFilter = 'all'; ui.resultLimit = RESULT_PAGE; }
    const skipped = items.filter((it) => it.ch === -1 || !selArr(it.ch).length);
    const filters = [['all', 'すべて', items], ['wrong', '不正解', wrong]];
    if (skipped.length) filters.push(['skip', h.mode === 'mock' ? '未回答' : 'わからない', skipped]);
    if (!filters.some(([v]) => v === ui.resultFilter)) ui.resultFilter = 'all';
    html += `<div class="seg" id="resultFilter" style="margin-bottom:6px">${filters.map(([v, label, list]) =>
      `<button type="button" data-v="${v}" class="${ui.resultFilter === v ? 'on' : ''}">${label}（${list.length}）</button>`).join('')}</div>`;

    const filtered = filters.find(([v]) => v === ui.resultFilter)[2];
    const shown = filtered.slice(0, ui.resultLimit);
    if (!filtered.length) html += '<div class="empty">該当する問題はありません 🎉</div>';
    shown.forEach((it) => {
      const q = QMAP.get(it.id);
      const no = items.indexOf(it) + 1;
      // 出題時の並び順（シャッフルしなかった問題は収録順）
      const order = it.pm || q.choices.map((_, i) => i);
      const choicesHtml = order.map((orig, pos) => {
        const isAns = ansArr(q).includes(orig);
        const isMine = selArr(it.ch).includes(orig);
        const cls = isAns ? 'correct' : isMine ? 'wrong' : '';
        const tag = [isAns ? '正解' : '', isMine ? 'あなたの解答' : ''].filter(Boolean).join('・');
        return `<li class="${cls}"><span class="k">${LETTERS[pos]}.</span><span>${fmt(q.choices[orig])}</span>${tag ? `<span class="tag">${tag}</span>` : ''}</li>`;
      }).join('');
      html += `<details class="sub" ${!it.ok && h.mode === 'mock' && filtered.length <= 5 ? 'open' : ''}>
        <summary><div class="rq-summary">
          <div class="rq-line">${it.ok ? '✅' : '❌'} <strong>Q${no}</strong> ${levelBadge(q.level)} ${catBadge(q.cat)}${qType(q) === 'scenario' ? ' ' + typeBadge('scenario') : ''} <span class="small muted">解答: ${chLabel(it.ch, order)} ／ 正解: ${ansLetters(q, order)}</span></div>
          <div class="rq-text">${fmt(q.q)}</div>
        </div></summary>
        <div class="sub-body">
          <div class="qtext">${fmt(q.q)}</div>
          ${q.code ? `<pre class="code">${esc(q.code)}</pre>` : ''}
          <ul class="result-choices">${choicesHtml}</ul>
          ${explainHtml(q)}
          <div class="small muted" style="margin-top:6px">${esc(q.id)} ／ 現在の状態: ${statusBadge(statusOf(q.id))}</div>
        </div>
      </details>`;
    });
    if (filtered.length > shown.length) {
      const next = Math.min(RESULT_PAGE, filtered.length - shown.length);
      html += `<button class="btn small block" id="resultMore" style="margin-top:8px">さらに${next}問を表示（残り ${filtered.length - shown.length}問）</button>`;
    }
    html += '</div></details>';

    $view.innerHTML = html;
    const retry = $view.querySelector('[data-act="retry"]');
    if (retry) retry.addEventListener('click', () => startQuick('retry', shuffle(wrong.map((it) => QMAP.get(it.id))), '間違えた問題', true));
    $view.querySelectorAll('#resultFilter button').forEach((b) => b.addEventListener('click', () => {
      ui.resultFilter = b.dataset.v;
      ui.resultLimit = RESULT_PAGE;
      rerender(renderResult, id);
      const fold = document.getElementById('resultFold');
      if (fold) fold.open = true;
    }));
    const more = document.getElementById('resultMore');
    if (more) more.addEventListener('click', () => {
      const top = $view.scrollTop;
      ui.resultLimit += RESULT_PAGE;
      renderResult(id);
      document.getElementById('resultFold').open = true;
      $view.scrollTop = top;
    });
  }

  /* =====================================================================
   * 履歴
   * ===================================================================== */
  function renderHistory() {
    const all = D().history;
    const filt = ui.historyFilter;
    const list = all.filter((h) => filt === 'all' || (filt === 'mock' ? h.mode === 'mock' : h.mode !== 'mock'));
    const totalAns = all.reduce((a, h) => a + h.total, 0);
    const totalOk = all.reduce((a, h) => a + h.correct, 0);
    const mocks = all.filter((h) => h.mode === 'mock');

    let html = `<h1 class="page-title">🕘 挑戦の履歴</h1>
      <div class="hero">
        <div class="tile"><div class="tv">${all.length}</div><div class="tl">挑戦回数</div></div>
        <div class="tile"><div class="tv">${totalAns}</div><div class="tl">解答数</div></div>
        <div class="tile"><div class="tv">${pct(totalOk, totalAns)}%</div><div class="tl">正答率</div></div>
        <div class="tile"><div class="tv">${mocks.length}</div><div class="tl">模試</div></div>
      </div>
      <div class="seg" id="histFilter" style="margin-bottom:12px">
        <button type="button" data-v="all" class="${filt === 'all' ? 'on' : ''}">すべて</button>
        <button type="button" data-v="quiz" class="${filt === 'quiz' ? 'on' : ''}">クイズ</button>
        <button type="button" data-v="mock" class="${filt === 'mock' ? 'on' : ''}">模試</button>
      </div>`;

    if (!list.length) {
      const emptyMsg = !all.length ? 'まだ履歴がありません。' : filt === 'mock' ? '模試の履歴はまだありません。' : 'クイズの履歴はまだありません。';
      html += `<div class="card empty">${emptyMsg}<br><a href="#/home">${filt === 'mock' && all.length ? '模試に挑戦しましょう' : 'クイズを始めましょう'}</a></div>`;
    } else {
      html += '<div class="card" style="padding-top:2px;padding-bottom:2px">';
      list.slice(0, ui.historyLimit).forEach((h) => {
        const p = pct(h.correct, h.total);
        html += `<a class="hist-item" href="#/result/${encodeURIComponent(h.id)}">
          <div class="hp" style="color:${p >= 70 ? 'var(--good)' : p >= 50 ? 'var(--text)' : 'var(--bad)'}">${p}%</div>
          <div class="hm">
            <div class="list-item-head"><span class="badge ${h.mode === 'mock' ? 'warn' : 'neutral'}">${MODE_LABEL[h.mode] || esc(h.mode)}</span>${levelBadge(h.level)}${h.qtype && h.qtype !== 'all' ? typeBadge(h.qtype) : ''}<span class="small">${h.correct}/${h.total}問正解</span></div>
            <div class="hs">${fmtDate(h.startedAt)} ／ ${fmtDur(h.duration)}${h.timeUp ? ' ／ ⏰時間切れ' : ''}</div>
          </div>
          <span class="muted">›</span>
        </a>`;
      });
      html += '</div>';
      if (list.length > ui.historyLimit) html += `<button class="btn block" id="histMore">さらに表示（残り${list.length - ui.historyLimit}件）</button>`;
    }
    html += '<p class="small muted">履歴は最新300件まで保存されます。</p>';
    $view.innerHTML = html;

    $view.querySelectorAll('#histFilter button').forEach((b) => b.addEventListener('click', () => {
      ui.historyFilter = b.dataset.v;
      ui.historyLimit = 30;
      renderHistory();
    }));
    const more = document.getElementById('histMore');
    if (more) more.addEventListener('click', () => { ui.historyLimit += 30; rerender(renderHistory); });
  }

  /* =====================================================================
   * 問題一覧
   * ===================================================================== */
  function renderList() {
    const L = listState;
    const levels = L.level === 'all' ? TRACKS : [L.level];
    if (L.cat && !levels.includes(CATMAP.get(L.cat).level)) L.cat = '';
    const catOpts = levels.map((lv) => `<optgroup label="${LEVEL_LABEL[lv]}">${CATS[lv].groups.flatMap((g) => g.cats).map((c) =>
      `<option value="${c.id}" ${L.cat === c.id ? 'selected' : ''}>${c.id} ${esc(c.name)}</option>`).join('')}</optgroup>`).join('');

    $view.innerHTML = `<h1 class="page-title">📚 問題一覧</h1>
      <details class="fold" id="listFilter" ${ui.listFilterOpen ? 'open' : ''}>
        <summary>🔍 絞り込み <span class="sum-note" id="listCount"></span></summary>
        <div class="fold-body">
          <div class="field"><div class="seg" id="listLevel">
            <button type="button" data-v="all" class="${L.level === 'all' ? 'on' : ''}">すべて</button>
            <button type="button" data-v="silver" class="${L.level === 'silver' ? 'on' : ''}">Silver</button>
            <button type="button" data-v="gold" class="${L.level === 'gold' ? 'on' : ''}">Gold</button>
            <button type="button" data-v="ver" class="${L.level === 'ver' ? 'on' : ''}">Ver差分</button>
          </div></div>
          <div class="grid-2">
            <div class="field"><label class="label" for="listCat">カテゴリ</label><select class="input" id="listCat"><option value="">すべて</option>${catOpts}</select></div>
            <div class="field"><label class="label" for="listStatus">状態</label><select class="input" id="listStatus">
              ${[['all', 'すべて'], ['unseen', '未出題'], ['review', '復習対象'], ['learned', '習得済']].map(([v, l]) => `<option value="${v}" ${L.status === v ? 'selected' : ''}>${l}</option>`).join('')}
            </select></div>
          </div>
          <div class="field"><span class="label">出題タイプ</span><div class="seg" id="listType">${[['all', 'すべて'], ['knowledge', '知識確認'], ['scenario', '状況判断']].map(([v, l]) => `<button type="button" data-v="${v}" class="${L.qtype === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
          <div class="field" style="margin-bottom:4px"><label class="label" for="listQ">キーワード</label><input class="input" id="listQ" type="search" placeholder="問題文・選択肢・解説・IDを検索" value="${esc(L.q)}"></div>
          <button class="btn small block" id="listSolve">▶ 表示中の問題でクイズ</button>
        </div>
      </details>
      <div class="card" id="listItems" style="padding-top:2px;padding-bottom:2px"></div>`;

    document.getElementById('listFilter').addEventListener('toggle', (e) => { ui.listFilterOpen = e.target.open; });
    $view.querySelectorAll('#listLevel button').forEach((b) => b.addEventListener('click', () => { L.level = b.dataset.v; rerender(renderList); }));
    document.getElementById('listCat').addEventListener('change', (e) => { L.cat = e.target.value; renderListItems(); });
    document.getElementById('listStatus').addEventListener('change', (e) => { L.status = e.target.value; renderListItems(); });
    $view.querySelectorAll('#listType button').forEach((b) => b.addEventListener('click', () => {
      L.qtype = b.dataset.v;
      $view.querySelectorAll('#listType button').forEach((x) => x.classList.toggle('on', x === b));
      renderListItems();
    }));
    document.getElementById('listQ').addEventListener('input', (e) => { L.q = e.target.value; renderListItems(); });
    document.getElementById('listSolve').addEventListener('click', () => startQuick('normal', listFiltered(), '問題一覧から', true));
    renderListItems();
  }

  function listFiltered() {
    const L = listState;
    const kw = L.q.trim().toLowerCase();
    return QUESTIONS.filter((q) =>
      (L.level === 'all' || q.level === L.level) &&
      (!L.cat || q.cat === L.cat) &&
      (L.status === 'all' || statusOf(q.id) === L.status) &&
      typeMatch(q, L.qtype) &&
      (!kw || [q.id, q.q, q.code || '', q.exp, ...q.choices].join('\n').toLowerCase().includes(kw)));
  }

  function renderListItems() {
    const qs = listFiltered();
    document.getElementById('listCount').textContent = `${qs.length} / ${QUESTIONS.length}問`;
    // 出題数をボタンに明示し、0件なら押せないようにする
    const solve = document.getElementById('listSolve');
    solve.disabled = !qs.length;
    solve.textContent = qs.length ? `▶ 表示中の ${qs.length}問でクイズ` : '▶ 表示中の問題でクイズ';
    const box = document.getElementById('listItems');
    if (!qs.length) { box.innerHTML = '<div class="empty">該当する問題はありません</div>'; return; }

    // レベル単位で折りたたむ（キーワード検索中は自動的に開く）
    const searching = !!listState.q.trim();
    const item = (q) => `<details class="sub" data-qid="${q.id}">
      <summary><div class="rq-summary">
        <div class="rq-line"><strong class="small">${esc(q.id)}</strong> ${levelBadge(q.level)}${qType(q) === 'scenario' ? ' ' + typeBadge('scenario') : ''} ${statusBadge(statusOf(q.id))}</div>
        <div class="rq-text">${fmt(q.q)}</div>
      </div></summary>
      <div class="sub-body"></div>
    </details>`;
    box.innerHTML = TRACKS.map((lv) => {
      const lqs = qs.filter((q) => q.level === lv);
      if (!lqs.length) return '';
      const open = searching || ui.listOpen[lv];
      return `<details class="sub lv-group" data-lvgroup="${lv}" ${open ? 'open' : ''}>
        <summary><div class="rq-summary"><div class="rq-line">${levelBadge(lv)}<strong class="small">${CATS[lv].outOfScope ? esc(CATS[lv].name) + '（試験範囲外）' : esc(CATS[lv].groups.length ? '出題範囲' : CATS[lv].name)}</strong><span class="small muted nowrap" style="margin-left:auto">${lqs.length}問</span></div></div></summary>
        <div class="sub-body" style="padding-left:0">${lqs.map(item).join('')}</div>
      </details>`;
    }).join('');
    box.firstElementChild.style.borderTop = '0';
    box.querySelectorAll('[data-lvgroup]').forEach((g) => {
      const inner = g.querySelector('.sub-body').firstElementChild;
      if (inner) inner.style.borderTop = '0';
      g.addEventListener('toggle', () => { if (!searching) ui.listOpen[g.dataset.lvgroup] = g.open; });
    });
    box.querySelectorAll('details[data-qid]').forEach((det) => det.addEventListener('toggle', () => {
      const bodyEl = det.querySelector('.sub-body');
      if (!det.open || bodyEl.childElementCount) return;
      const q = QMAP.get(det.dataset.qid);
      const s = Store.stat(q.id);
      bodyEl.innerHTML = `<div class="small muted">${esc(q.cat)} ${esc(catName(q.cat))}</div>
        <div class="qtext">${fmt(q.q)}</div>
        ${q.code ? `<pre class="code">${esc(q.code)}</pre>` : ''}
        <ul class="result-choices">${q.choices.map((c, i) => `<li><span class="k">${LETTERS[i]}.</span><span>${fmt(c)}</span></li>`).join('')}</ul>
        <details class="sub"><summary>正解と解説を表示</summary><div class="sub-body">
          <p style="margin:0 0 6px"><strong>正解: ${ansLetters(q)}</strong></p>${explainHtml(q)}
        </div></details>
        <div class="small muted" style="margin:6px 0">挑戦 ${s ? s.a : 0}回 ／ 正解 ${s ? s.c : 0}回 ／ 連続正解 ${s ? s.s : 0}回${s && s.t ? ` ／ 最終 ${fmtDate(s.t)}` : ''}</div>
        <button class="btn small" data-solve="${q.id}">▶ この問題を解く</button>`;
      bodyEl.querySelector('[data-solve]').addEventListener('click', () => startQuick('single', [q], q.id));
    }));
  }

  /* =====================================================================
   * 参考ページ
   * ===================================================================== */
  function renderRefs() {
    let html = '<h1 class="page-title">🔗 参考ページ</h1>';
    REFS.forEach((g, gi) => {
      html += `<details class="fold" ${gi === 0 ? 'open' : ''}><summary>${esc(g.group)} <span class="sum-note">${g.items.length}件</span></summary><div class="fold-body"><ul style="margin:0;padding-left:18px">
        ${g.items.map((it) => `<li style="margin:4px 0"><a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.title)}</a></li>`).join('')}
      </ul></div></details>`;
    });

    // 問題の解説で参照している文書を集計
    const pages = new Map();
    QUESTIONS.forEach((q) => (q.refs || []).forEach(([t, u]) => {
      const url = refUrl(u);
      const page = url.split('#')[0];
      if (!pages.has(page)) pages.set(page, new Map());
      const links = pages.get(page);
      if (!links.has(url)) links.set(url, { title: t, qids: [] });
      links.get(url).qids.push(q.id);
    }));
    const sorted = [...pages.entries()].sort((a, b) => {
      const ca = [...a[1].values()].reduce((n, v) => n + v.qids.length, 0);
      const cb = [...b[1].values()].reduce((n, v) => n + v.qids.length, 0);
      return cb - ca || a[0].localeCompare(b[0]);
    });

    html += `<details class="fold" open><summary>📖 解説で参照している文書 <span class="sum-note">${sorted.length}ページ</span></summary><div class="fold-body">`;
    sorted.forEach(([page, links]) => {
      const count = [...links.values()].reduce((n, v) => n + v.qids.length, 0);
      const file = page.replace(DOC_BASE, '');
      const titles = [...new Set([...links.values()].map((v) => v.title))];
      html += `<details class="sub"><summary><div class="rq-summary"><div class="rq-line"><strong class="small">${esc(file)}</strong><span class="badge neutral">${count}問</span></div><div class="small muted">${esc(titles.slice(0, 3).join(' ／ '))}${titles.length > 3 ? ' …' : ''}</div></div></summary><div class="sub-body"><ul style="margin:0;padding-left:16px">
        ${[...links.entries()].map(([url, v]) => `<li style="margin:4px 0"><a href="${esc(url)}" target="_blank" rel="noopener">${esc(v.title)}</a>
          <div class="small muted">${v.qids.map(esc).join('、')}</div></li>`).join('')}
      </ul></div></details>`;
    });
    html += '</div></details>';
    $view.innerHTML = html;
  }

  /* =====================================================================
   * 状況分析
   * ===================================================================== */
  function coverage(qs) {
    const c = { n: qs.length, unseen: 0, review: 0, learned: 0, a: 0, ok: 0 };
    qs.forEach((q) => {
      c[statusOf(q.id)]++;
      const s = Store.stat(q.id);
      if (s) { c.a += s.a; c.ok += s.c; }
    });
    return c;
  }
  function stackBar(c) {
    if (!c.n) return '<div class="stack"></div>';
    const seg = (cls, v) => (v ? `<span class="${cls}" style="width:${(v * 100) / c.n}%"></span>` : '');
    return `<div class="stack" role="img" aria-label="習得済${c.learned}、復習対象${c.review}、未出題${c.unseen}">${seg('s-learned', c.learned)}${seg('s-review', c.review)}${seg('s-unseen', c.unseen)}</div>`;
  }

  function renderAnalysis() {
    ensureGoalSnapshot();
    const d = D();
    const all = coverage(QUESTIONS);
    const days = Object.keys(d.daily).filter((k) => d.daily[k] > 0).length;

    let html = `<h1 class="page-title">📊 状況分析</h1>
      <div class="hero">
        <div class="tile"><div class="tv">${d.history.length}</div><div class="tl">挑戦回数</div></div>
        <div class="tile"><div class="tv">${all.a}</div><div class="tl">解答数</div></div>
        <div class="tile"><div class="tv">${all.a ? pct(all.ok, all.a) + '%' : '—'}</div><div class="tl">正答率</div></div>
        <div class="tile"><div class="tv">${days}</div><div class="tl">学習日数</div></div>
      </div>`;

    // 進捗
    html += '<section class="card"><h2>🧭 問題の消化状況</h2>';
    const trackRow = (lv) => [lv, CATS[lv].outOfScope ? `${CATS[lv].name}（試験範囲外）` : CATS[lv].name, QUESTIONS.filter((q) => q.level === lv)];
    [...LEVELS.map(trackRow), ['exam', '試験範囲（Silver + Gold）', QUESTIONS.filter(inScope)], ...TRACKS.filter((lv) => !LEVELS.includes(lv)).map(trackRow)].forEach(([, label, qs]) => {
      const c = coverage(qs);
      html += `<div style="margin:8px 0 10px">
        <div style="display:flex;justify-content:space-between;gap:8px;font-size:13.5px"><strong>${label}</strong>
          <span class="small muted">${c.n}問 ／ 未出題 ${pct(c.unseen, c.n)}% ／ 復習 ${pct(c.review, c.n)}% ／ 正答率 ${c.a ? pct(c.ok, c.a) + '%' : '—'}</span></div>
        ${stackBar(c)}
      </div>`;
    });
    html += `<div class="legend">
        <span><i style="background:var(--good)"></i>習得済 ${all.learned}</span>
        <span><i style="background:var(--warn)"></i>復習対象 ${all.review}</span>
        <span><i style="background:var(--neutral-fill)"></i>未出題 ${all.unseen}</span>
      </div>
      <p class="small muted" style="margin:6px 0 0">習得済 = 1回以上解答し、復習対象ではない問題。復習対象 = 間違えた後、まだ連続2回正解していない問題。</p>
    </section>`;

    // 出題タイプ別（試験範囲）
    html += '<section class="card"><h2>🧩 出題タイプ別（試験範囲）</h2>';
    ['knowledge', 'scenario'].forEach((t) => {
      const c = coverage(QUESTIONS.filter((q) => inScope(q) && qType(q) === t));
      html += `<div style="margin:8px 0 10px">
        <div style="display:flex;justify-content:space-between;gap:8px;font-size:13.5px">${typeBadge(t)}
          <span class="small muted">${c.n}問 ／ 未出題 ${pct(c.unseen, c.n)}% ／ 復習 ${pct(c.review, c.n)}% ／ 正答率 ${c.a ? pct(c.ok, c.a) + '%' : '—'}</span></div>
        ${stackBar(c)}
      </div>`;
    });
    html += '<p class="small muted" style="margin:6px 0 0">状況判断 = 設定・出力・ログ・症状などを示して判断させる問題。どちらかの正答率が低い場合は、ホームで出題タイプを絞って練習できます。</p></section>';

    // おすすめ
    const recs = [];
    if (all.review) recs.push({ text: `復習対象が <strong>${all.review}問</strong> あります。`, label: '復習する', act: 'rec-review' });
    const examUnseen = QUESTIONS.filter((q) => inScope(q) && statusOf(q.id) === 'unseen').length;
    if (examUnseen) recs.push({ text: `試験範囲の未出題が <strong>${examUnseen}問</strong> あります。`, label: '未出題を解く', act: 'rec-unseen' });
    const catStats = CAT_ORDER.map((id) => ({ id, ...coverage(QUESTIONS.filter((q) => q.cat === id)) })).filter((c) => c.n);
    const weak = catStats.filter((c) => c.a >= 3 && pct(c.ok, c.a) < 70).sort((a, b) => a.ok / a.a - b.ok / b.a).slice(0, 3);
    weak.forEach((c) => recs.push({ text: `${catBadge(c.id)} ${esc(catName(c.id))} の正答率が <strong>${pct(c.ok, c.a)}%</strong> です。`, label: '集中練習', act: 'rec-cat', cat: c.id }));
    LEVELS.forEach((lv) => {
      if (!d.history.some((h) => h.mode === 'mock' && h.level === lv) && all.a >= 20) {
        recs.push({ text: `${LEVEL_LABEL[lv]} の模試にまだ挑戦していません。`, label: '模試へ', act: 'rec-mock', level: lv });
      }
    });
    if (recs.length) {
      html += `<section class="card"><h2>💡 おすすめの学習</h2>${recs.map((r, i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:6px 0;${i ? 'border-top:1px solid var(--border)' : ''}">
          <div style="flex:1;font-size:13.5px">${r.text}</div>
          <button class="btn small" data-rec="${i}">${r.label}</button>
        </div>`).join('')}</section>`;
    }

    // 目標
    const g = d.goal;
    const gi = goalInfo();
    html += `<section class="card"><h2>🎯 目標設定</h2>
      <div class="grid-2">
        <div class="field"><label class="label" for="goalDate">目標日</label>
          <div class="row-inline">
            <input class="input" type="date" id="goalDate" value="${esc(g.date)}">
            <button type="button" class="btn small ghost" data-act="goalClear" ${g.date ? '' : 'disabled'}>クリア</button>
          </div>
        </div>
        <div class="field"><label class="label" for="goalLaps">目標周回数</label><select class="input" id="goalLaps">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => `<option value="${v}" ${+g.laps === v ? 'selected' : ''}>${v}周</option>`).join('')}</select></div>
      </div>
      <div class="field"><span class="label">対象</span><div class="seg" id="goalScope">
        ${['silver', 'gold', 'all', 'ver'].map((v) => `<button type="button" data-v="${v}" class="${g.scope === v ? 'on' : ''}">${LEVEL_LABEL[v]}</button>`).join('')}
      </div></div>
      <div class="field"><span class="label">学習できる曜日</span>
        <div class="dow" id="goalDays">
          ${[1, 2, 3, 4, 5, 6, 0].map((dw) => { const on = goalWeekdays(g).includes(dw); return `<button type="button" data-d="${dw}" class="${on ? 'on' : ''}" aria-pressed="${on}">${WEEKDAYS[dw]}</button>`; }).join('')}
        </div>
        <div class="btn-row" style="margin-top:6px">
          <button type="button" class="btn small ghost" data-dows="all">毎日</button>
          <button type="button" class="btn small ghost" data-dows="weekday">平日のみ</button>
          <button type="button" class="btn small ghost" data-dows="weekend">土日のみ</button>
        </div>
      </div>`;
    if (!gi) {
      html += '<p class="small muted" style="margin:0">目標日を設定すると、学習日1日あたりに解くべき問題数の目安を表示します。</p>';
    } else {
      const lapPct = pct(gi.done, gi.required);
      const recent = lastDays(7).reduce((a, x) => a + x.v, 0) / 7;
      const eta = gi.remaining > 0 && recent > 0 ? Math.ceil(gi.remaining / recent) : null;
      const active = gi.days > 0 && gi.studyLeft > 0;
      const dayNames = [1, 2, 3, 4, 5, 6, 0].filter((dw) => gi.weekdays.includes(dw)).map((dw) => WEEKDAYS[dw]).join('・');
      html += `<div style="display:flex;gap:10px;flex-wrap:wrap;margin:4px 0 10px">
          <div class="tile"><div class="tl">学習日1日あたりの目安</div><div class="big-num">${active ? gi.perStudyDay : '—'}<span style="font-size:14px"> 問</span></div></div>
          <div class="tile"><div class="tl">今日の進捗</div>${gi.todayStudy
            ? `<div class="big-num">${gi.todayDone}<span style="font-size:14px"> / ${active ? gi.dailyTarget : '—'}</span></div>`
            : `<div class="big-num">${gi.todayDone}<span style="font-size:14px"> 問</span></div><div class="small muted">今日は学習日以外${gi.next ? `・次は ${fmtDay(gi.next)}` : ''}</div>`}</div>
        </div>
        ${gi.days <= 0 ? '<div class="notice">目標日を過ぎています。新しい目標日を設定してください。</div>' : ''}
        ${gi.days > 0 && gi.studyLeft === 0 ? '<div class="notice">目標日までに学習できる曜日がありません。曜日か目標日を見直してください。</div>' : ''}
        ${gi.remaining <= 0 ? '<div class="notice" style="background:var(--good-soft)">🎉 目標周回数を達成しました！</div>' : ''}
        <div class="kv">
          <span>目標日まで</span><span class="v">${gi.days > 0 ? `あと${gi.days}日（今日を含む）` : '期限切れ'}</span>
          <span>残りの学習日</span><span class="v">${gi.days > 0 ? `${gi.studyLeft}日（${dayNames}）` : '—'}</span>
          <span>対象問題数 × 周回数</span><span class="v">${gi.n}問 × ${gi.laps}周 = ${gi.required}</span>
          <span>達成済み</span><span class="v">${gi.done}（${lapPct}%）</span>
          <span>残り</span><span class="v">${Math.max(0, gi.remaining)}問</span>
          <span>直近7日の平均ペース</span><span class="v">${recent.toFixed(1)}問/日</span>
          <span>このペースでの達成見込み</span><span class="v">${gi.remaining <= 0 ? '達成済み' : eta ? `約${eta}日後` : '—'}</span>
        </div>
        <div class="meter" style="margin-top:8px"><div style="width:${Math.min(100, lapPct)}%"></div></div>
        <p class="small muted" style="margin:6px 0 0">周回の進捗は「各問題を目標周回数まで解いた回数」の合計で数えます（同じ問題を周回数より多く解いても加算されません）。未出題優先モードを使うと効率よく周回できます。</p>`;
    }
    html += '</section>';

    // アクティビティ
    const days14 = lastDays(14);
    const chartTarget = gi && gi.days > 0 && gi.studyLeft > 0 ? gi.perStudyDay : 0;
    html += `<section class="card"><h2>📅 直近14日の解答数</h2>
      <div class="chart-wrap" id="actChart">${activitySvg(days14, chartTarget, gi ? gi.weekdays : null)}<div class="chart-tip" hidden></div></div>
      ${gi && gi.weekdays.length < 7 ? '<p class="small muted" style="margin:4px 0 0">背景が灰色の日は、学習日に設定していない曜日です。</p>' : ''}
      <details class="sub" style="margin-top:8px"><summary>表で見る</summary><div class="sub-body" style="padding-left:0">
        <table class="data"><thead><tr><th>日付</th><th class="num">解答数</th></tr></thead><tbody>
          ${days14.slice().reverse().map((x) => `<tr><td>${x.full}</td><td class="num">${x.v}</td></tr>`).join('')}
        </tbody></table>
      </div></details>
    </section>`;

    // カテゴリ別
    TRACKS.forEach((lv) => {
      const lvStats = coverage(QUESTIONS.filter((q) => q.level === lv));
      html += `<details class="fold"><summary>${levelBadge(lv)} カテゴリ別の状況 <span class="sum-note">${lvStats.n}問</span></summary><div class="fold-body">
        <div class="table-wrap"><table class="data">
          <thead><tr><th>カテゴリ</th><th class="num">問題</th><th class="num">未出題</th><th class="num">復習</th><th class="num">正答率</th><th class="num">模試</th></tr></thead><tbody>`;
      CATS[lv].groups.forEach((gr) => gr.cats.forEach((c) => {
        const cs = coverage(QUESTIONS.filter((q) => q.cat === c.id));
        html += `<tr>
          <td style="min-width:150px"><div class="small"><strong>${c.id}</strong> ${esc(c.name)}</div>${stackBar(cs)}</td>
          <td class="num">${cs.n}</td>
          <td class="num">${cs.n ? pct(cs.unseen, cs.n) + '%' : '—'}</td>
          <td class="num">${cs.n ? pct(cs.review, cs.n) + '%' : '—'}</td>
          <td class="num">${cs.a ? pct(cs.ok, cs.a) + '%' : '—'}</td>
          <td class="num">${c.weight ? `${c.weight}問` : '—'}</td>
        </tr>`;
      }));
      html += `</tbody></table></div>
        <p class="small muted" style="margin:6px 0 0">「模試」は出題範囲の重要度（模試での出題数）です。</p>
      </div></details>`;
    });

    // 模試の推移
    const mocks = d.history.filter((h) => h.mode === 'mock');
    html += `<details class="fold"><summary>⏱ 模試の成績 <span class="sum-note">${mocks.length}回</span></summary><div class="fold-body">`;
    if (!mocks.length) html += '<div class="empty" style="padding:8px">まだ模試の記録がありません。</div>';
    else {
      html += `<div class="table-wrap"><table class="data"><thead><tr><th>日時</th><th>レベル</th><th class="num">得点</th><th class="num">正答率</th></tr></thead><tbody>
        ${mocks.slice(0, 20).map((h) => `<tr><td><a href="#/result/${encodeURIComponent(h.id)}">${fmtDate(h.startedAt)}</a></td><td>${levelBadge(h.level)}</td><td class="num">${h.correct}/${h.total}</td><td class="num">${pct(h.correct, h.total)}%</td></tr>`).join('')}
      </tbody></table></div>`;
    }
    html += '</div></details>';

    $view.innerHTML = html;
    bindAnalysis(recs, days14, chartTarget);
  }

  function lastDays(n) {
    const out = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const wd = '日月火水木金土';
    for (let i = n - 1; i >= 0; i--) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - i);
      const k = Store.dayKey(dt);
      out.push({ key: k, dow: dt.getDay(), label: `${dt.getMonth() + 1}/${dt.getDate()}`, full: `${dt.getMonth() + 1}/${dt.getDate()}（${wd[dt.getDay()]}）`, v: D().daily[k] || 0 });
    }
    return out;
  }

  function niceCeil(v) {
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(1, v))));
    for (const m of [1, 2, 4, 6, 8, 10]) if (m * pow >= v) return m * pow;
    return 10 * pow;
  }

  const CHART = { W: 640, H: 190, pl: 34, pr: 10, pt: 16, pb: 26 };

  function activitySvg(days, target, studyDays) {
    const { W, H, pl, pr, pt, pb } = CHART;
    const iw = W - pl - pr;
    const ih = H - pt - pb;
    const max = niceCeil(Math.max(4, target || 0, ...days.map((x) => x.v)));
    const y = (v) => pt + ih - (v / max) * ih;
    const bw = iw / days.length;
    const barW = Math.min(26, bw * 0.62);
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="直近14日の解答数の棒グラフ">`;
    if (studyDays && studyDays.length < 7) {
      days.forEach((dd, i) => {
        if (!studyDays.includes(dd.dow)) svg += `<rect x="${pl + bw * i + 1}" y="${pt}" width="${bw - 2}" height="${ih}" rx="3" fill="var(--surface-2)"/>`;
      });
    }
    [0, max / 2, max].forEach((t) => {
      svg += `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" stroke="var(--border)" stroke-width="1"/>
        <text x="${pl - 6}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${Math.round(t)}</text>`;
    });
    days.forEach((dd, i) => {
      const x = pl + bw * i + (bw - barW) / 2;
      const h = (dd.v / max) * ih;
      if (h > 0) {
        const r = Math.min(4, h, barW / 2);
        const top = y(dd.v);
        const base = pt + ih;
        svg += `<path d="M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + barW - r}Q${x + barW},${top} ${x + barW},${top + r}V${base}Z" fill="var(--accent)"/>`;
      }
      if ((days.length - 1 - i) % 2 === 0) {
        svg += `<text x="${pl + bw * i + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--muted)">${i === days.length - 1 ? '今日' : dd.label}</text>`;
      }
    });
    if (target > 0) {
      svg += `<line x1="${pl}" x2="${W - pr}" y1="${y(target)}" y2="${y(target)}" stroke="var(--text)" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="5 4"/>
        <text x="${W - pr}" y="${y(target) - 5}" text-anchor="end" font-size="11" fill="var(--muted)">目標 ${target}問/学習日</text>`;
    }
    svg += `<rect x="${pl}" y="${pt}" width="${iw}" height="${ih}" fill="transparent" id="chartHit"/></svg>`;
    return svg;
  }

  function bindAnalysis(recs, days14, chartTarget) {
    const d = D();
    $view.querySelectorAll('[data-rec]').forEach((b) => b.addEventListener('click', () => {
      const r = recs[+b.dataset.rec];
      if (r.act === 'rec-review') startQuick('review', QUESTIONS.filter((q) => statusOf(q.id) === 'review'), '復習');
      else if (r.act === 'rec-unseen') startQuick('unseen', QUESTIONS.filter(inScope), '未出題優先');
      else if (r.act === 'rec-cat') startQuick('normal', QUESTIONS.filter((q) => q.cat === r.cat), r.cat);
      else if (r.act === 'rec-mock') { ST().mode = 'mock'; ST().mockLevel = r.level; Store.save(); go('#/home'); }
    }));

    const saveGoal = () => { Store.save(); rerender(renderAnalysis); };
    const setGoalDate = (v) => { d.goal.date = v; d.goal.snap = null; saveGoal(); };
    document.getElementById('goalDate').addEventListener('change', (e) => setGoalDate(e.target.value));
    $view.querySelector('[data-act="goalClear"]').addEventListener('click', () => setGoalDate(''));
    document.getElementById('goalLaps').addEventListener('change', (e) => { d.goal.laps = +e.target.value; saveGoal(); });
    $view.querySelectorAll('#goalScope button').forEach((b) => b.addEventListener('click', () => { d.goal.scope = b.dataset.v; saveGoal(); }));
    $view.querySelectorAll('#goalDays button').forEach((b) => b.addEventListener('click', () => {
      const dw = +b.dataset.d;
      const cur = goalWeekdays(d.goal).slice();
      const i = cur.indexOf(dw);
      if (i >= 0) {
        if (cur.length === 1) { toast('学習できる曜日を少なくとも1つ選択してください'); return; }
        cur.splice(i, 1);
      } else {
        cur.push(dw);
      }
      d.goal.days = cur.sort();
      saveGoal();
    }));
    $view.querySelectorAll('[data-dows]').forEach((b) => b.addEventListener('click', () => {
      d.goal.days = { all: ALL_DAYS.slice(), weekday: [1, 2, 3, 4, 5], weekend: [0, 6] }[b.dataset.dows];
      saveGoal();
    }));

    // チャートのツールチップ
    const wrap = document.getElementById('actChart');
    const svg = wrap.querySelector('svg');
    const tip = wrap.querySelector('.chart-tip');
    const { W, H, pl, pr, pt, pb } = CHART;
    const show = (ev) => {
      const rect = svg.getBoundingClientRect();
      const sx = ((ev.clientX - rect.left) / rect.width) * W;
      const bw = (W - pl - pr) / days14.length;
      const i = Math.floor((sx - pl) / bw);
      if (i < 0 || i >= days14.length) { tip.hidden = true; return; }
      const dd = days14[i];
      const max = niceCeil(Math.max(4, chartTarget, ...days14.map((x) => x.v)));
      const yTop = pt + (H - pt - pb) - (dd.v / max) * (H - pt - pb);
      tip.innerHTML = `<strong>${dd.full}</strong> ${dd.v}問`;
      tip.style.left = `${((pl + bw * i + bw / 2) / W) * rect.width}px`;
      tip.style.top = `${(yTop / H) * rect.height - 6}px`;
      tip.hidden = false;
    };
    svg.addEventListener('pointermove', show);
    svg.addEventListener('pointerdown', show);
    svg.addEventListener('pointerleave', () => { tip.hidden = true; });
  }

  /* =====================================================================
   * 起動
   * ===================================================================== */
  document.getElementById('themeSelect').addEventListener('change', (e) => {
    ST().theme = e.target.value;
    Store.save();
    applyTheme(ST().theme);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hasModal()) { closeModals(); return; }
    if (!document.body.classList.contains('in-quiz') || hasModal()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const ss = D().session;
    if (!ss) return;
    const key = e.key.toLowerCase();
    const pos = '12345'.indexOf(key) >= 0 ? '12345'.indexOf(key) : 'abcde'.indexOf(key);
    if (key.length === 1 && pos >= 0) {
      const btn = $view.querySelectorAll('[data-choice]')[pos];
      if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
    } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
      const b = $view.querySelector('[data-act="commit"],[data-act="next"],[data-act="submit"]');
      if (b && b.dataset.act === 'commit') { if (!b.disabled) { e.preventDefault(); b.click(); } return; }
      if (b && !(e.key === 'ArrowRight' && b.dataset.act === 'submit')) { e.preventDefault(); b.click(); }
    } else if (e.key === 'ArrowLeft') {
      const b = $view.querySelector('[data-act="prev"]');
      if (b && !b.disabled) { e.preventDefault(); b.click(); }
    }
  });

  // オフライン対応（http/https で開いた場合のみ。ファイルを直接開いた場合は登録しない）
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch((e) => console.warn('service worker', e)));
  }

  window.addEventListener('hashchange', route);
  applyTheme(ST().theme);
  route();
})();
