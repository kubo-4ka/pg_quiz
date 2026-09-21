/*
 * localStorage を使ったデータ保存
 *
 * 解答はすべて log に記録し、問題ごとの成績（qstats）と日別の解答数（daily）は log から集計する。
 * これにより、別の端末のデータを重複なく統合できる。
 */
(function () {
  'use strict';

  const KEY = 'pg_quiz';
  const BACKUP_KEY = 'pg_quiz_backup';
  const SCHEMA = 2; // 保存データの形式。形式を変えたら上げ、MIGRATIONS に旧形式からの変換を追加する
  const HISTORY_MAX = 300;

  /**
   * 旧形式からの変換。キーは変換元の形式で、1つ新しい形式のデータを返す。
   * 例: 2: (d) => ({ ...d, schema: 3, newField: [] })
   */
  const MIGRATIONS = {};

  function defaults() {
    return {
      schema: SCHEMA,
      settings: {
        theme: 'light',
        mode: 'normal',        // normal | unseen | review | mock
        level: 'silver',       // silver | gold | all（試験範囲 S+G）| ver
        mockLevel: 'silver',   // silver | gold
        qtype: 'all',          // all | knowledge（知識確認）| scenario（状況判断）
        excludedCats: [],
        count: 10,
        shuffle: true,
        sheetCollapsed: false,
        expWide: false        // 解説を広く見るために問題文をたたむ
      },
      log: [],      // 解答の記録 [時刻(ms), 問題ID, 正解なら1・不正解なら0]（古い順）
      qstats: {},   // log から集計 { [qid]: { a: 挑戦数, c: 正解数, w: 不正解数, s: 連続正解, r: 復習対象, last: 1|0, t: 最終日時 } }
      daily: {},    // log から集計 { 'YYYY-MM-DD': 解答数 }
      history: [],  // 挑戦の履歴（新しい順）
      goal: { date: '', laps: 2, scope: 'all', days: [0, 1, 2, 3, 4, 5, 6], snap: null },
      session: null
    };
  }

  function dayKey(date) {
    const d = date || new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  /** 1件の解答を集計に反映する（復習ルール: 間違えたら復習対象、連続2回正解で解除） */
  function apply(data, [t, qid, ok]) {
    const s = data.qstats[qid] || (data.qstats[qid] = { a: 0, c: 0, w: 0, s: 0, r: false });
    s.a++;
    if (ok) {
      s.c++;
      s.s++;
      if (s.r && s.s >= 2) s.r = false;
    } else {
      s.w++;
      s.s = 0;
      s.r = true;
    }
    s.last = ok ? 1 : 0;
    s.t = t;
    const k = dayKey(new Date(t));
    data.daily[k] = (data.daily[k] || 0) + 1;
  }

  /** log から qstats と daily を作り直す */
  function rebuild(data) {
    data.log.sort((x, y) => x[0] - y[0]);
    data.qstats = {};
    data.daily = {};
    data.log.forEach((e) => apply(data, e));
  }

  const logKey = (e) => `${e[0]}|${e[1]}`;

  /** 旧形式のデータを現在の形式に変換する。変換できなければ null */
  function migrate(d) {
    let cur = d;
    while (cur && cur.schema < SCHEMA) {
      const step = MIGRATIONS[cur.schema];
      if (!step) return null;
      cur = step(cur);
    }
    return cur && cur.schema === SCHEMA ? cur : null;
  }

  function normalize(src) {
    const def = defaults();
    const d = src && typeof src === 'object' ? migrate(src) : null;
    if (!d) return def;
    const data = {
      ...def,
      ...d,
      settings: { ...def.settings, ...(d.settings || {}) },
      goal: { ...def.goal, ...(d.goal || {}) },
      log: Array.isArray(d.log) ? d.log : [],
      history: Array.isArray(d.history) ? d.history : []
    };
    rebuild(data);
    return data;
  }

  // ---- インポートするファイルの検証 ----
  // ファイルは外部から持ち込まれるデータとして扱い、想定外の値が1つでもあればファイル全体を読み込まない
  const LEVELS = ['silver', 'gold', 'all', 'ver'];
  const QTYPES = ['all', 'knowledge', 'scenario'];
  const MODES = ['normal', 'unseen', 'review', 'mock'];
  const HISTORY_MODES = [...MODES, 'retry', 'single'];
  const QID = /^[A-Z]\d+\.\d+-\d{3}$/;
  const CAT_ID = /^[A-Z]\d+\.\d+$/;
  const DATE = /^\d{4}-\d{2}-\d{2}$/;
  const MAX_TIME = Date.UTC(2100, 0, 1);

  const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
  const isTime = (v) => isInt(v, 0, MAX_TIME);
  const isChoice = (v) => isInt(v, 0, 4);
  const oneOf = (v, list) => list.includes(v);
  const optional = (v, test) => v === undefined || test(v);
  const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj && obj[k] !== undefined).map((k) => [k, obj[k]]));

  function check(ok, where) {
    if (!ok) throw new Error(`ファイルの内容に想定外の値があるため、読み込みませんでした（${where}）`);
  }

  function checkHistoryItem(it, where) {
    check(isObj(it) && typeof it.id === 'string' && QID.test(it.id), `${where}の問題ID`);
    check(typeof it.ok === 'boolean', `${where}の正誤`);
    const ch = it.ch;
    check(ch === undefined || ch === null || ch === -1 || isChoice(ch)
      || (Array.isArray(ch) && ch.length <= 5 && ch.every(isChoice) && new Set(ch).size === ch.length), `${where}の解答`);
    check(optional(it.pm, (pm) => Array.isArray(pm) && pm.length === 5 && pm.every(isChoice) && new Set(pm).size === 5), `${where}の選択肢の順序`);
  }

  function checkHistory(h, i) {
    const where = `挑戦履歴 ${i + 1}件目`;
    check(isObj(h), where);
    check(typeof h.id === 'string' && /^[\w-]{1,40}$/.test(h.id), `${where}のID`);
    check(oneOf(h.mode, HISTORY_MODES), `${where}のモード`);
    check(oneOf(h.level, LEVELS), `${where}のレベル`);
    check(optional(h.qtype, (v) => oneOf(v, QTYPES)), `${where}の出題タイプ`);
    check(optional(h.label, (v) => typeof v === 'string' && v.length <= 200), `${where}の名前`);
    check(isTime(h.startedAt) && optional(h.endedAt, isTime), `${where}の日時`);
    check(isInt(h.duration, -86400, 1e7), `${where}の所要時間`);
    check(Array.isArray(h.items) && h.items.length <= 10000, `${where}の問題`);
    h.items.forEach((it, j) => checkHistoryItem(it, `${where}の${j + 1}問目`));
    check(h.total === h.items.length && h.correct === h.items.filter((it) => it.ok).length, `${where}の正解数`);
    check(optional(h.planned, (v) => isInt(v, 0, 10000)), `${where}の出題数`);
    check(optional(h.timeUp, (v) => typeof v === 'boolean'), `${where}の時間切れ`);
  }

  function checkSettings(st) {
    check(isObj(st), '設定');
    check(optional(st.theme, (v) => oneOf(v, ['light', 'middle', 'dark'])), '設定のテーマ');
    check(optional(st.mode, (v) => oneOf(v, MODES)), '設定のモード');
    check(optional(st.level, (v) => oneOf(v, LEVELS)), '設定のレベル');
    check(optional(st.mockLevel, (v) => oneOf(v, ['silver', 'gold'])), '設定の模試レベル');
    check(optional(st.qtype, (v) => oneOf(v, QTYPES)), '設定の出題タイプ');
    check(optional(st.excludedCats, (v) => Array.isArray(v) && v.every((c) => typeof c === 'string' && CAT_ID.test(c))), '設定のカテゴリ');
    check(optional(st.count, (v) => isInt(v, 0, 100000)), '設定の問題数');
    check(optional(st.shuffle, (v) => typeof v === 'boolean') && optional(st.sheetCollapsed, (v) => typeof v === 'boolean') && optional(st.expWide, (v) => typeof v === 'boolean'), '設定');
  }

  function checkGoal(g) {
    check(isObj(g), '目標');
    check(optional(g.date, (v) => v === '' || (typeof v === 'string' && DATE.test(v))), '目標日');
    check(optional(g.laps, (v) => isInt(v, 1, 100)), '目標周回数');
    check(optional(g.scope, (v) => oneOf(v, LEVELS)), '目標の範囲');
    check(optional(g.days, (v) => Array.isArray(v) && v.length <= 7 && v.every((x) => isInt(x, 0, 6))), '学習する曜日');
  }

  /** 検証済みの値だけで、読み込むデータを組み立てる（中断中のクイズは端末ごとのものなので含めない） */
  function sanitize(d) {
    check(Array.isArray(d.log) && d.log.length <= 1000000, '解答の記録');
    d.log.forEach((e, i) => check(Array.isArray(e) && e.length === 3 && isTime(e[0]) && typeof e[1] === 'string' && QID.test(e[1]) && (e[2] === 0 || e[2] === 1), `解答の記録 ${i + 1}件目`));
    const history = d.history === undefined ? [] : d.history;
    check(Array.isArray(history), '挑戦履歴');
    history.forEach(checkHistory);
    if (d.settings !== undefined) checkSettings(d.settings);
    if (d.goal !== undefined) checkGoal(d.goal);
    return {
      schema: d.schema,
      settings: pick(d.settings, Object.keys(defaults().settings)),
      goal: { ...pick(d.goal, ['date', 'laps', 'scope', 'days']), snap: null },
      log: d.log,
      history,
      session: null
    };
  }

  /** インポートするファイルを読み、形式を確認してデータ部分を返す */
  function parseExport(text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { throw new Error('JSON として読み込めませんでした'); }
    const d = obj && obj.app === 'pg_quiz' ? obj.data : null;
    if (!d || typeof d !== 'object' || !Array.isArray(d.log)) throw new Error('pg_quiz で書き出したデータではありません');
    if (d.schema > SCHEMA) throw new Error('新しいバージョンのアプリで書き出したデータです。ページを再読み込みしてから、もう一度お試しください');
    const data = migrate(d);
    if (!data) throw new Error('このバージョンのアプリでは読み込めない形式です');
    return { data: sanitize(data), exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : '' };
  }

  // 古いアプリ（キャッシュされたものなど）が新しい形式のデータを読んだときは、上書きしないように保存を止める
  let newer = false;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const d = JSON.parse(raw);
      if (d && d.schema > SCHEMA) newer = true;
      return normalize(d);
    } catch (e) {
      console.warn('load failed', e);
      return defaults();
    }
  }

  const Store = {
    data: load(),
    available: true,
    newer,
    onBeforeRecord: null,

    save() {
      if (this.newer) return;
      try {
        localStorage.setItem(KEY, JSON.stringify(this.data));
      } catch (e) {
        this.available = false;
        console.warn('save failed', e);
      }
    },

    stat(qid) {
      return this.data.qstats[qid] || null;
    },

    /** 1問の解答結果を記録 */
    record(qid, ok) {
      if (this.onBeforeRecord) this.onBeforeRecord();
      const e = [Date.now(), qid, ok ? 1 : 0];
      // 同じ問題を同じミリ秒に2回記録しないようにずらす（統合時の重複判定のキーになるため）
      const last = this.data.log[this.data.log.length - 1];
      if (last && last[1] === qid && last[0] >= e[0]) e[0] = last[0] + 1;
      this.data.log.push(e);
      apply(this.data, e);
    },

    addHistory(entry) {
      this.data.history.unshift(entry);
      if (this.data.history.length > HISTORY_MAX) this.data.history.length = HISTORY_MAX;
    },

    exportJson() {
      const { qstats, daily, session, ...rest } = this.data; // 集計値は log から作り直せ、中断中のクイズは端末ごとのものなので書き出さない
      return JSON.stringify({ app: 'pg_quiz', exportedAt: new Date().toISOString(), data: rest });
    },

    /** インポートの前に、ファイルの内容と、この端末にない記録の件数を調べる */
    inspectImport(text) {
      const { data, exportedAt } = parseExport(text);
      const mine = new Set(this.data.log.map(logKey));
      const myHist = new Set(this.data.history.map((h) => h.id));
      return {
        exportedAt,
        answers: data.log.length,
        history: (data.history || []).length,
        newAnswers: data.log.filter((e) => !mine.has(logKey(e))).length,
        newHistory: (data.history || []).filter((h) => !myHist.has(h.id)).length
      };
    },

    /** この端末のデータにファイルの記録を追加する（設定・目標・中断中のクイズはこの端末のまま） */
    mergeImport(text) {
      const { data } = parseExport(text);
      this.backup();
      const seen = new Set(this.data.log.map(logKey));
      data.log.forEach((e) => { if (!seen.has(logKey(e))) { seen.add(logKey(e)); this.data.log.push(e); } });
      const ids = new Set(this.data.history.map((h) => h.id));
      (data.history || []).forEach((h) => { if (!ids.has(h.id)) { ids.add(h.id); this.data.history.push(h); } });
      this.data.history.sort((x, y) => (y.startedAt || 0) - (x.startedAt || 0));
      if (this.data.history.length > HISTORY_MAX) this.data.history.length = HISTORY_MAX;
      rebuild(this.data);
      this.data.goal.snap = null; // 今日の進捗の基準を取り直す
      this.save();
    },

    /** この端末のデータを、ファイルの内容で置き換える */
    replaceImport(text) {
      const { data } = parseExport(text);
      this.backup();
      this.data = normalize({ ...data, session: this.data.session }); // 中断中のクイズはこの端末のものを残す
      this.save();
    },

    /** 直前の状態を1世代だけ保存する（インポート・リセットの前） */
    backup() {
      if (this.newer) throw new Error('新しいバージョンのアプリで保存されたデータがあります。ページを再読み込みしてください');
      try {
        localStorage.setItem(BACKUP_KEY, JSON.stringify({ savedAt: Date.now(), data: this.data }));
      } catch (e) {
        console.warn('backup failed', e);
      }
    },

    backupInfo() {
      try {
        const raw = localStorage.getItem(BACKUP_KEY);
        if (!raw) return null;
        const b = JSON.parse(raw);
        return b && b.data && migrate(b.data) ? { savedAt: b.savedAt, answers: (b.data.log || []).length } : null;
      } catch (e) {
        return null;
      }
    },

    restoreBackup() {
      if (this.newer) throw new Error('新しいバージョンのアプリで保存されたデータがあります。ページを再読み込みしてください');
      const raw = localStorage.getItem(BACKUP_KEY);
      if (!raw) throw new Error('元に戻せるデータがありません');
      const b = JSON.parse(raw);
      this.data = normalize(b.data);
      this.save();
      localStorage.removeItem(BACKUP_KEY);
    },

    reset(keepSettings) {
      this.backup();
      const settings = this.data.settings;
      this.data = defaults();
      if (keepSettings) this.data.settings = settings;
      this.save();
    },

    dayKey
  };

  window.Store = Store;
})();
