#!/usr/bin/env node
'use strict';
/*
 * 公式の出題範囲に「重要な用語、コマンド、パラメータなど」として載っている用語が、
 * そのレベルの問題に登場しているかを調べる: node tools/terms.js [--all]
 *
 * 用語の一覧は https://oss-db.jp/outline/silver 、 https://oss-db.jp/outline/gold の出題範囲から転記したもの。
 * 1つの用語は「表記の候補」（大文字小文字を区別しない部分一致、/.../ は正規表現）のいずれかで判定する。
 * 問題文・選択肢・コード・解説のいずれかに含まれていれば、その問題に登場したとみなす。
 *
 * 出力: 用語ごとに「同じカテゴリの問題数 / 同じレベルの問題数」。レベル内で 0 のものを「未出題」として表示する。
 * --all を付けると、登場している用語も含めてすべて表示する。
 */
const { loadData } = require('./lib');

// [カテゴリ, 用語（表示名）, ...表記の候補（省略時は用語そのもの）]
const TERMS = [
  // ---- Silver ----
  ['S2.1', 'initdb'], ['S2.1', 'PGDATA'], ['S2.1', 'template0'], ['S2.1', 'template1'],
  ['S2.2', 'pg_ctl'], ['S2.2', 'createuser'], ['S2.2', 'dropuser'], ['S2.2', 'createdb'], ['S2.2', 'dropdb'],
  ['S2.2', 'psql'], ['S2.2', 'pg_config'], ['S2.2', 'pg_controldata'], ['S2.2', 'pg_isready'], ['S2.2', 'pg_resetwal'],
  ['S2.2', 'メタコマンド', 'メタコマンド', /\\[a-z]+\b/],
  ['S2.3', 'postgresql.conf'], ['S2.3', 'pg_hba.conf'], ['S2.3', 'pg_ctl reload/restart', 'pg_ctl reload', 'pg_ctl restart', 'pg_ctl -D'], ['S2.3', 'pg_settings'],
  ['S2.3', 'SET/SHOW', /\bSHOW\b/],
  ['S2.4', 'pg_dump'], ['S2.4', 'pg_dumpall'], ['S2.4', 'pg_restore'], ['S2.4', 'pg_basebackup'],
  ['S2.4', 'pg_start_backup()', 'pg_start_backup'], ['S2.4', 'pg_stop_backup()', 'pg_stop_backup'],
  ['S2.4', 'backup_label'], ['S2.4', 'tablespace_map'], ['S2.4', 'PITR', 'PITR', 'ポイントインタイムリカバリ'],
  ['S2.4', 'recovery.signal'], ['S2.4', 'COPY', /\bCOPY\b/], ['S2.4', '\\copy', '\\copy'],
  ['S2.5', 'pg_ctl start/stop', 'pg_ctl start', 'pg_ctl stop', 'pg_ctl -D'],
  ['S2.5', 'CREATE/ALTER/DROP ROLE/USER', /(CREATE|ALTER|DROP) (ROLE|USER)\b/],
  ['S2.5', 'VACUUM', /\bVACUUM\b/], ['S2.5', 'ANALYZE', /\bANALYZE\b/], ['S2.5', 'vacuumdb'], ['S2.5', 'autovacuum'],
  ['S2.5', 'current_user'], ['S2.5', 'version', /\bversion\(\)/], ['S2.5', 'information_schema'],
  ['S2.5', 'GRANT', /\bGRANT\b/], ['S2.5', 'REVOKE', /\bREVOKE\b/],
  ...['FROM', 'JOIN', 'WHERE', 'INTO', 'VALUES', 'SET', 'LIMIT', 'OFFSET', 'ORDER BY', 'DISTINCT', 'GROUP BY', 'HAVING', 'EXISTS', 'IN', 'NOT',
    'INTEGER', 'SMALLINT', 'BIGINT', 'NUMERIC', 'DECIMAL', 'REAL', 'DOUBLE PRECISION', 'CHAR', 'CHARACTER', 'VARCHAR', 'CHARACTER VARYING', 'TEXT',
    'BOOLEAN', 'DATE', 'TIME', 'TIMESTAMP', 'INTERVAL', 'SERIAL', 'BIGSERIAL', 'BYTEA', 'JSON', 'JSONB', 'NULL',
    'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'UNIQUE', 'NOT NULL', 'CHECK', 'DEFAULT', 'CALL']
    .map((w) => ['S3.1', w, new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`, 'i')]),
  ['S3.1', 'GENERATED (AS IDENTITY)', 'GENERATED', 'IDENTITY'],
  ['S3.1', 'CREATE/ALTER/DROP TABLE', /(CREATE|ALTER|DROP) TABLE/],
  ['S3.1', 'CREATE PUBLICATION', 'CREATE PUBLICATION'], ['S3.1', 'CREATE SUBSCRIPTION', 'CREATE SUBSCRIPTION'],
  ['S3.1', 'JSON PATH', 'jsonpath', 'JSON PATH', 'jsonb_path', '@?', '@@'],
  ...['INDEX', 'VIEW', 'MATERIALIZED VIEW', 'TRIGGER', 'SCHEMA', 'SEQUENCE', 'TABLESPACE', 'FUNCTION', 'PROCEDURE']
    .map((w) => ['S3.1', `CREATE/ALTER/DROP ${w}`, new RegExp(`(CREATE|ALTER|DROP)( OR REPLACE)?( UNIQUE)? ${w}\\b`, 'i')]),
  ['S3.1', 'CREATE TABLE PARTITION BY/OF', 'PARTITION BY', 'PARTITION OF'],
  ['S3.1', 'ALTER TABLE ATTACH/DETACH PARTITION', 'ATTACH PARTITION', 'DETACH PARTITION'],
  ...['count', 'sum', 'avg', 'max', 'min', 'lower', 'upper', 'substring', 'replace', 'trim', 'age', 'now', 'extract', 'to_char']
    .map((w) => ['S3.2', w, new RegExp(`\\b${w}\\s*\\(`, 'i')]),
  ['S3.2', 'char(character)_length', /\bchar(acter)?_length\b/i],
  ['S3.2', '||', '||'], ['S3.2', '~', /[^!~]~\*?\s/], ['S3.2', 'LIKE', /\bI?LIKE\b/], ['S3.2', 'SIMILAR TO'],
  ['S3.2', 'current_date'], ['S3.2', 'current_timestamp'], ['S3.2', 'statement_timestamp'], ['S3.2', 'clock_timestamp'], ['S3.2', 'current_time', /\bcurrent_time\b/i],
  ['S3.3', 'BEGIN', /\bBEGIN\b/], ['S3.3', 'COMMIT', /\bCOMMIT\b/], ['S3.3', 'ROLLBACK', /\bROLLBACK\b/], ['S3.3', 'SAVEPOINT', /\bSAVEPOINT\b/],
  ['S3.3', 'SET TRANSACTION'], ['S3.3', 'LOCK TABLE', /\bLOCK( TABLE)? \w/], ['S3.3', 'SELECT FOR UPDATE/SHARE', /FOR (UPDATE|SHARE)/],

  // ---- Gold ----
  ['G1.1', 'チェックサム', 'チェックサム', 'checksum'], ['G1.1', 'pg_stat_tmp'], ['G1.1', 'pg_tblspc'], ['G1.1', 'pg_wal', /\bpg_wal\b/],
  ['G1.1', 'ssl', /\bssl\b/i], ['G1.1', 'pg_stat_ssl'], ['G1.1', 'pgcrypto'], ['G1.1', 'SCRAM-SHA-256'],
  ['G1.1', 'ALTER ROLE'], ['G1.1', 'ALTER DATABASE'], ['G1.1', 'initdb --data-checksums (-k)', '--data-checksums', 'initdb -k'],
  ['G1.1', 'log_statement', /\blog_statement\b/], ['G1.1', 'track_functions'], ['G1.1', 'track_activities'],
  ['G1.2', 'ALTER SYSTEM'], ['G1.2', 'ANALYZE', /\bANALYZE\b/], ['G1.2', 'CLUSTER', /\bCLUSTER\b/], ['G1.2', 'REINDEX'],
  ['G1.2', 'VACUUM', /\bVACUUM\b/], ['G1.2', 'CHECKPOINT', /\bCHECKPOINT\b/], ['G1.2', 'PITR', 'PITR', 'ポイントインタイムリカバリ'],
  ['G1.2', 'WAL', /\bWAL\b/], ['G1.2', 'pg_dump', /\bpg_dump\b/], ['G1.2', 'pg_dumpall'], ['G1.2', 'pg_basebackup'],
  ['G1.2', 'pg_start_backup()', 'pg_start_backup'], ['G1.2', 'pg_stop_backup()', 'pg_stop_backup'],
  ['G1.2', 'postgresql.conf'], ['G1.2', 'vacuumdb'], ['G1.2', 'pgstattuple'],
  ['G1.2', 'pg_cancel_backend()', 'pg_cancel_backend'], ['G1.2', 'pg_terminate_backend()', 'pg_terminate_backend'],
  ['G1.2', 'pg_isready'], ['G1.2', 'log_connections'], ['G1.2', 'log_disconnections'], ['G1.2', 'log_duration', /\blog_duration\b/],
  ['G1.2', 'postgresql.auto.conf'], ['G1.2', 'pg_reload_conf()', 'pg_reload_conf'],
  ['G1.2', 'max_parallel_workers', /\bmax_parallel_workers\b/], ['G1.2', 'max_parallel_maintenance_workers'], ['G1.2', 'pg_monitor'],
  ['G1.3', 'autovacuum'], ['G1.3', 'TOAST'], ['G1.3', 'FILLFACTOR'], ['G1.3', 'アーカイブログ', 'アーカイブ'],
  ['G1.3', 'postmasterプロセス', 'postmaster'], ['G1.3', 'バックエンドプロセス', 'バックエンドプロセス', 'バックエンド'],
  ['G1.3', 'バックグラウンドプロセス', 'バックグラウンドプロセス', 'バックグラウンドワーカ', 'バックグラウンドライタ'],
  ['G1.3', 'SQL実行のキャンセル', 'キャンセル'], ['G1.3', 'シグナル(TERM/INT/HUP)', 'SIGTERM', 'SIGINT', 'SIGHUP'],
  ['G1.3', 'postgres_fdw'], ['G1.3', 'file_fdw'],
  ['G1.3', 'CREATE SERVER'], ['G1.3', 'CREATE USER MAPPING'], ['G1.3', 'CREATE FOREIGN TABLE'],
  ['G1.4', 'wal_level'], ['G1.4', 'max_wal_senders'], ['G1.4', 'synchronous_standby_names'], ['G1.4', 'synchronous_commit'],
  ['G1.4', 'max_logical_replication_workers'],
  ['G1.4', 'CREATE/ALTER/DROP PUBLICATION', /(CREATE|ALTER|DROP) PUBLICATION/], ['G1.4', 'CREATE/ALTER/DROP SUBSCRIPTION', /(CREATE|ALTER|DROP) SUBSCRIPTION/],
  ['G1.4', 'pg_stat_replication'], ['G1.4', 'pg_stat_wal_receiver'], ['G1.4', 'recovery_min_apply_delay'], ['G1.4', 'recovery.signal'],
  ['G1.4', 'スタンバイでの問い合わせのコンフリクト', 'コンフリクト', '競合', 'conflict'],
  ['G1.4', 'hot_standby_feedback'], ['G1.4', 'max_standby_streaming_delay'],
  ['G1.4', 'pg_wal_replay_pause()', 'pg_wal_replay_pause'], ['G1.4', 'pg_wal_replay_resume()', 'pg_wal_replay_resume'],
  ['G1.4', 'walsenderプロセス', 'walsender', 'wal sender'], ['G1.4', 'walreceiverプロセス', 'walreceiver', 'wal receiver'],
  ['G1.4', 'pg_receivewal'], ['G1.4', 'hot_standby', /\bhot_standby\b/],
  ['G2.1', 'pg_locks'], ['G2.1', 'pg_stat_activity'], ['G2.1', 'pg_stat_database', /\bpg_stat_database\b/],
  ['G2.1', 'pg_stat_all_tables 等', 'pg_stat_all_tables', 'pg_stat_user_tables'],
  ['G2.1', 'pg_statio_all_tables 等', 'pg_statio_all_tables', 'pg_statio_user_tables'],
  ['G2.1', 'pg_stat_archiver'], ['G2.1', 'pg_stat_bgwriter'], ['G2.1', 'wait_event_type'], ['G2.1', 'wait_event', /\bwait_event\b/],
  ['G2.2', 'pg_class'], ['G2.2', 'pg_stats', /\bpg_stats\b/], ['G2.2', 'pg_statistic', /\bpg_statistic\b/],
  ['G2.2', 'null_frac'], ['G2.2', 'n_distinct'], ['G2.2', 'most_common_freqs'], ['G2.2', 'histogram_bounds'], ['G2.2', 'correlation'],
  ['G2.2', 'default_statistics_target'], ['G2.2', 'effective_cache_size'], ['G2.2', 'CREATE STATISTICS'], ['G2.2', 'pg_statistic_ext'],
  ['G2.3', 'EXPLAIN'], ['G2.3', 'EXPLAIN ANALYZE', /EXPLAIN\s*\((ANALYZE|[^)]*ANALYZE)|EXPLAIN ANALYZE/],
  ['G2.3', 'Nested Loop'], ['G2.3', 'Hash Join'], ['G2.3', 'Merge Join'],
  ['G2.3', 'max_worker_processes'], ['G2.3', 'max_parallel_workers_per_gather'],
  ['G2.3', 'ウィンドウ関数', 'ウィンドウ関数', 'WindowAgg', 'row_number', 'rank()'],
  ['G2.4', 'shared_preload_libraries'], ['G2.4', 'auto_explain'], ['G2.4', 'auto_explain.* パラメータ', /auto_explain\.\w+/],
  ['G2.4', 'log_min_duration_statement'], ['G2.4', 'pg_stat_statements'], ['G2.4', 'log_autovacuum_min_duration'],
  ['G2.4', 'log_lock_waits'], ['G2.4', 'log_checkpoints'], ['G2.4', 'log_temp_files'],
  ...['shared_buffers', 'huge_pages', 'effective_cache_size', 'work_mem', 'maintenance_work_mem', 'autovacuum_work_mem', 'wal_level',
    'full_page_writes', 'wal_compression', 'fsync', 'synchronous_commit', 'checkpoint_timeout', 'checkpoint_completion_target',
    'deadlock_timeout', 'max_wal_size', 'min_wal_size', 'wal_keep_size'].map((w) => ['G3.1', w, new RegExp(`\\b${w}\\b`)]),
  ['G3.1', '軽量ロックと重量ロック', '軽量ロック', 'LWLock'],
  ['G3.2', 'Index Only Scan'], ['G3.2', '関数インデックス/式インデックス', '式インデックス', '式に対するインデックス', '関数インデックス'],
  ['G3.2', '部分インデックス'], ['G3.2', 'パーティショニング', 'パーティション'], ['G3.2', 'enable_* パラメータ', /\benable_\w+/],
  ['G3.2', 'work_mem', /\bwork_mem\b/], ['G3.2', 'hash_mem_multiplier'], ['G3.2', 'Visibility Map', '可視性マップ', 'visibility map'],
  ['G4.1', 'statement_timeout'], ['G4.1', 'lock_timeout'], ['G4.1', 'idle_in_transaction_session_timeout'],
  ['G4.1', 'hot_standby_feedback'], ['G4.1', 'vacuum_defer_cleanup_age'], ['G4.1', 'max_standby_archive_delay'], ['G4.1', 'max_standby_streaming_delay'],
  ['G4.1', 'fsync', /\bfsync\b/], ['G4.1', 'synchronous_commit'], ['G4.1', 'restart_after_crash'],
  ['G4.1', 'pg_cancel_backend()', 'pg_cancel_backend'], ['G4.1', 'pg_terminate_backend()', 'pg_terminate_backend'], ['G4.1', 'pg_ctl kill'],
  ['G4.1', 'max_locks_per_transaction'], ['G4.1', 'max_files_per_process'],
  ['G4.1', 'idle in transaction', 'idle in transaction'], ['G4.1', 'セグメンテーションフォルト', 'セグメンテーション', 'segmentation fault', 'signal 11'],
  ['G4.2', 'PITR', 'PITR', 'ポイントインタイムリカバリ'], ['G4.2', 'pg_resetwal'], ['G4.2', 'ignore_system_indexes'], ['G4.2', 'ignore_checksum_failure'],
  ['G4.2', 'コミットログ(pg_xact)', 'pg_xact'], ['G4.2', 'シングルユーザモード', 'シングルユーザ', '--single'], ['G4.2', 'VACUUM FREEZE', /VACUUM\s*(\(FREEZE|FREEZE)/],
  ['G4.2', 'relfilenode'], ['G4.2', '周回', '周回', 'wraparound'],
  ['G4.3', 'pg_ctl promote', 'pg_ctl promote', 'pg_promote'], ['G4.3', 'pg_receivewal'], ['G4.3', 'pg_rewind'],

  // ---- 「主要な知識範囲」のうち、用語として判定できるもの ----
  ['S1.1', '(範囲) ライセンス', 'ライセンス'], ['S1.1', '(範囲) コミュニティ', 'コミュニティ'],
  ['S1.1', '(範囲) メジャー/マイナーバージョン', 'メジャーバージョン', 'マイナーバージョン'],
  ['S1.1', '(範囲) リリースサイクル', 'リリースサイクル', '毎年', '年に1回', '1年に1回'], ['S1.1', '(範囲) サポートポリシー', 'サポート期間', 'サポートポリシー', '5年'],
  ['S1.1', '(範囲) バグ報告', 'バグ報告', 'バグレポート', 'pgsql-bugs'],
  ['S1.2', '(範囲) DDL/DML/DCL', 'DDL', 'DML', 'DCL'], ['S1.2', '(範囲) 正規化', '正規化', '正規形'],
  ['S2.1', '(範囲) テンプレートデータベース', 'テンプレート'],
  ['S2.3', '(範囲) クライアント接続デフォルト', 'search_path', 'client_encoding', 'default_transaction_isolation', 'statement_timeout', 'DateStyle', 'TimeZone'],
  ['S2.3', '(範囲) エラー報告とログ取得', 'log_destination', 'logging_collector', 'log_line_prefix', 'log_min_messages'],
  ['S2.4', '(範囲) 非排他的低レベルバックアップ', '非排他'], ['S2.4', '(範囲) WALアーカイブ', 'archive_command', 'archive_mode'],
  ['S2.4', '(範囲) Archive Recovery のパラメータ', 'restore_command', 'recovery_target'],
  ['S2.5', '(範囲) システム情報関数', 'current_database', 'pg_backend_pid', 'current_setting', 'pg_postmaster_start_time', 'session_user'],
  ['S2.5', '(範囲) システムカタログ', 'pg_catalog', 'pg_class', 'pg_database', 'pg_roles', 'pg_tables'],
  ['S3.1', '(範囲) マテリアライズドビュー', 'マテリアライズドビュー', 'MATERIALIZED VIEW'], ['S3.1', '(範囲) トリガー', 'トリガ'],
  ['S3.1', '(範囲) PL/pgSQL', 'PL/pgSQL', 'plpgsql'], ['S3.1', '(範囲) ストリーミングレプリケーション', 'ストリーミングレプリケーション'],
  ['S3.1', '(範囲) ロジカルレプリケーション', 'ロジカルレプリケーション', '論理レプリケーション'],
  ['S3.1', '(範囲) テーブルスペース', 'テーブルスペース', 'テーブル空間', 'TABLESPACE'], ['S3.1', '(範囲) スキーマ', 'スキーマ'],
  ['S3.3', '(範囲) 分離レベル', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'], ['S3.3', '(範囲) デッドロック', 'デッドロック'],
  ['S3.3', '(範囲) 行ロック', '行ロック', '行レベルロック', 'FOR UPDATE'],
  ['G1.1', '(範囲) 監査ログ', '監査', 'pgaudit'], ['G1.1', '(範囲) データ暗号化', '暗号化'], ['G1.1', '(範囲) クライアント認証', 'pg_hba.conf'],
  ['G1.1', '(範囲) ユーザ・データベース単位のパラメータ', /ALTER (ROLE|USER|DATABASE) \S+ (IN DATABASE \S+ )?SET/i],
  ['G1.2', '(範囲) 排他/非排他バックアップ', '排他'], ['G1.2', '(範囲) サーバログ管理', 'log_rotation', 'logging_collector', 'log_filename'],
  ['G1.2', '(範囲) ディスク容量監視', 'pg_database_size', 'pg_relation_size', 'pg_total_relation_size', 'ディスク容量', 'ディスクの空き'],
  ['G1.2', '(範囲) デフォルトロール', 'デフォルトロール', '定義済みロール', 'pg_read_all', 'pg_signal_backend'],
  ['G2.2', '(範囲) 拡張統計', '拡張統計', 'CREATE STATISTICS'], ['G2.3', '(範囲) パラレルクエリ', 'Gather', 'パラレル'],
  ['G2.3', '(範囲) パーティションの実行計画', 'パーティション'], ['G2.4', '(範囲) ロック競合', 'ロック待ち', 'ロック競合'],
  ['G3.1', '(範囲) 軽量ロック/重量ロック', '軽量ロック', 'LWLock'], ['G3.2', '(範囲) ディスクI/Oの分散', 'テーブルスペース', 'テーブル空間'],
  ['G4.1', '(範囲) OSリソース枯渇', 'too many', 'out of memory', 'OOM', 'No space left', '共有メモリ'], ['G4.1', '(範囲) OSのパラメータ', 'vm.overcommit', 'shmmax', 'ulimit', 'カーネルパラメータ', 'sysctl'],
  ['G4.2', '(範囲) 開発者向けオプション', 'zero_damaged_pages', 'ignore_system_indexes', '開発者向け'],
  ['G4.2', '(範囲) システムテーブルのインデックス復旧', 'REINDEX SYSTEM', 'ignore_system_indexes'],
  ['G4.3', '(範囲) サブスクライバでのコンフリクト', 'サブスクライバ']
];

const qs = loadData().win.PGQ_QUESTIONS;
const text = (q) => [q.q, q.code || '', ...q.choices, q.exp].join('\n');
const match = (t, pats) => pats.some((p) => (p instanceof RegExp ? p.test(t) : t.toLowerCase().includes(p.toLowerCase())));

const showAll = process.argv.includes('--all');
const missing = [];
const thin = [];
let lastCat = '';
for (const [cat, name, ...alts] of TERMS) {
  const pats = alts.length ? alts : [name];
  const level = cat[0] === 'S' ? 'silver' : 'gold';
  const inLevel = qs.filter((q) => q.level === level && match(text(q), pats));
  const inCat = inLevel.filter((q) => q.cat === cat);
  const row = `  ${cat}  ${String(inCat.length).padStart(3)} / ${String(inLevel.length).padStart(3)}  ${name}`;
  if (!inLevel.length) missing.push(row);
  else if (!inCat.length) thin.push(row);
  if (showAll) {
    if (cat !== lastCat) console.log('');
    console.log(row + (inLevel.length ? '' : '   ← 未出題'));
    lastCat = cat;
  }
}
console.log(`\n公式の用語 ${TERMS.length}件（件数は「同じカテゴリの問題 / 同じレベルの問題」）`);
console.log(`\nレベル内で未出題: ${missing.length}件`);
missing.forEach((r) => console.log(r));
console.log(`\n別カテゴリにだけ登場: ${thin.length}件`);
thin.forEach((r) => console.log(r));
