/*
 * 収録計画（概算）
 *
 * PostgreSQL 14 文書と OSS-DB 出題範囲の主要トピックごとに、
 * 「このくらいあれば一通り押さえられる」という問題数の目安（est）を置いたものです。
 * kw は問題文・コード・選択肢に含まれるかでトピックを判定する簡易キーワード（大文字小文字を区別）です。
 * 目安はあくまで概算で、収録を進めながら見直します。
 */
window.PGQ_PLAN = {
  cats: {
    /* ======================== Silver ======================== */
    'S1.1': { topics: [
      { name: '機能概要・特徴', est: 4, kw: ['MVCC', '機能', '拡張', '特徴'] },
      { name: 'ライセンス', est: 2, kw: ['ライセンス', 'License'] },
      { name: 'コミュニティ・開発体制', est: 3, kw: ['コミュニティ', 'メーリングリスト', '開発'] },
      { name: 'バージョン体系・リリース・サポート', est: 4, kw: ['バージョン', 'リリース', 'サポート'] },
      { name: 'バグ報告', est: 2, kw: ['バグ', '不具合'] }
    ] },
    'S1.2': { topics: [
      { name: 'リレーショナルモデル・関係演算', est: 4, kw: ['射影', '関係代数', 'リレーション'] },
      { name: 'DBMS の役割・ACID', est: 3, kw: ['ACID', 'DBMS', '永続性'] },
      { name: 'SQL の分類（DDL/DML/DCL）', est: 3, kw: ['DDL', 'DML', 'DCL'] },
      { name: '正規化・データベース設計', est: 4, kw: ['正規形', '正規化', '設計'] },
      { name: 'キー・制約', est: 3, kw: ['主キー', '外部キー', '候補キー'] }
    ] },
    'S2.1': { topics: [
      { name: 'initdb', est: 4, kw: ['initdb'] },
      { name: 'データベースクラスタ・PGDATA', est: 3, kw: ['PGDATA', 'データディレクトリ', 'クラスタ'] },
      { name: 'テンプレートデータベース', est: 3, kw: ['template'] },
      { name: 'インストール方法', est: 4, kw: ['インストール', 'configure'] }
    ] },
    'S2.2': { topics: [
      { name: 'pg_ctl', est: 4, kw: ['pg_ctl'] },
      { name: 'psql・メタコマンド', est: 7, kw: ['psql', '\\'] },
      { name: 'createuser / createdb / dropdb など', est: 4, kw: ['createuser', 'dropuser', 'createdb', 'dropdb'] },
      { name: 'pg_config / pg_controldata', est: 2, kw: ['pg_config', 'pg_controldata'] },
      { name: 'pg_isready', est: 2, kw: ['pg_isready'] },
      { name: 'pg_resetwal', est: 2, kw: ['pg_resetwal'] }
    ] },
    'S2.3': { topics: [
      { name: 'postgresql.conf の記述・反映', est: 5, kw: ['postgresql.conf', 'include'] },
      { name: '接続と認証のパラメータ', est: 3, kw: ['listen_addresses', 'max_connections', 'port'] },
      { name: 'クライアント接続デフォルト', est: 3, kw: ['search_path', 'client_encoding', 'DateStyle', 'TimeZone', 'statement_timeout'] },
      { name: 'エラー報告とログ', est: 4, kw: ['log_', 'ログ'] },
      { name: 'pg_hba.conf', est: 5, kw: ['pg_hba', 'peer', 'trust', 'scram'] },
      { name: 'SET / SHOW / pg_settings / ALTER SYSTEM', est: 6, kw: ['SET', 'SHOW', 'pg_settings', 'ALTER SYSTEM'] }
    ] },
    'S2.4': { topics: [
      { name: 'pg_dump / pg_restore', est: 7, kw: ['pg_dump', 'pg_restore'] },
      { name: 'pg_dumpall', est: 3, kw: ['pg_dumpall'] },
      { name: 'COPY / \\copy', est: 3, kw: ['COPY', 'copy'] },
      { name: 'ファイルシステムレベルのバックアップ', est: 2, kw: ['ファイルシステムレベル'] },
      { name: 'pg_basebackup', est: 3, kw: ['pg_basebackup'] },
      { name: 'WAL アーカイブ・PITR', est: 6, kw: ['アーカイブ', 'PITR', 'recovery', 'ポイントインタイム'] },
      { name: '低レベル API・backup_label', est: 3, kw: ['pg_start_backup', 'pg_stop_backup', 'backup_label', 'tablespace_map'] }
    ] },
    'S2.5': { topics: [
      { name: '起動・停止', est: 3, kw: ['起動', '停止', 'シャットダウン'] },
      { name: 'ロール・ユーザ管理', est: 6, kw: ['ROLE', 'USER', 'ロール'] },
      { name: '権限（GRANT / REVOKE）', est: 4, kw: ['GRANT', 'REVOKE', '権限', '所有者'] },
      { name: 'VACUUM / ANALYZE', est: 6, kw: ['VACUUM', 'ANALYZE', 'vacuumdb'] },
      { name: '自動バキューム', est: 3, kw: ['自動バキューム', 'autovacuum'] },
      { name: 'システムカタログ・情報関数', est: 4, kw: ['information_schema', 'pg_catalog', 'pg_tables', 'current_user', 'version()', 'カタログ'] }
    ] },
    'S3.1': { topics: [
      { name: 'SELECT の基本（WHERE / ORDER BY / LIMIT）', est: 7, kw: ['LIMIT', 'ORDER BY', 'DISTINCT', 'WHERE'] },
      { name: '結合・サブクエリ・集合演算', est: 6, kw: ['JOIN', 'EXISTS', 'UNION', 'サブクエリ'] },
      { name: 'GROUP BY / HAVING・ウィンドウ関数', est: 8, kw: ['GROUP BY', 'HAVING', 'OVER', 'ウィンドウ'] },
      { name: 'INSERT / UPDATE / DELETE・UPSERT', est: 5, kw: ['INSERT', 'UPDATE', 'DELETE', 'ON CONFLICT', 'RETURNING'] },
      { name: 'データ型', est: 12, kw: ['型'] },
      { name: 'テーブル定義・制約', est: 6, kw: ['CREATE TABLE', 'ALTER TABLE', '制約', 'CHECK', 'DEFAULT'] },
      { name: 'NULL の扱い', est: 3, kw: ['NULL'] },
      { name: 'インデックス', est: 4, kw: ['INDEX', 'インデックス'] },
      { name: 'ビュー・マテリアライズドビュー', est: 3, kw: ['VIEW', 'ビュー'] },
      { name: 'シーケンス・serial・IDENTITY', est: 3, kw: ['serial', 'シーケンス', 'IDENTITY', 'nextval'] },
      { name: 'スキーマ・テーブルスペース', est: 3, kw: ['スキーマ', 'TABLESPACE', 'テーブルスペース', 'search_path'] },
      { name: 'パーティション', est: 3, kw: ['パーティション', 'PARTITION'] },
      { name: '関数・プロシージャ・PL/pgSQL', est: 5, kw: ['FUNCTION', 'PROCEDURE', 'PL/pgSQL', 'CALL', 'プロシージャ'] },
      { name: 'トリガー', est: 2, kw: ['トリガー', 'TRIGGER'] },
      { name: 'JSON / JSONB・JSON パス', est: 3, kw: ['json'] },
      { name: 'PUBLICATION / SUBSCRIPTION', est: 2, kw: ['PUBLICATION', 'SUBSCRIPTION'] }
    ] },
    'S3.2': { topics: [
      { name: '集約関数', est: 3, kw: ['count', 'sum(', 'avg', 'max(', 'min(', '集約'] },
      { name: '文字列関数・パターンマッチ', est: 6, kw: ['substring', 'char_length', 'LIKE', 'SIMILAR', '||', 'lower', 'upper', 'trim', 'replace'] },
      { name: '日付時刻関数', est: 5, kw: ['now()', 'current_date', 'current_timestamp', 'age(', 'extract', 'to_char'] },
      { name: '算術関数・型変換', est: 5, kw: ['round', 'trunc', 'CAST', '::', 'mod('] }
    ] },
    'S3.3': { topics: [
      { name: 'トランザクション制御・SAVEPOINT', est: 3, kw: ['BEGIN', 'COMMIT', 'SAVEPOINT'] },
      { name: '分離レベル', est: 3, kw: ['分離レベル', 'READ COMMITTED', 'SERIALIZABLE', 'REPEATABLE'] },
      { name: 'ロック・デッドロック', est: 5, kw: ['LOCK', 'ロック', 'FOR UPDATE', 'デッドロック'] }
    ] },

    /* ======================== Gold ======================== */
    'G1.1': { topics: [
      { name: 'クライアント認証', est: 6, kw: ['pg_hba', '認証', 'scram', 'password'] },
      { name: '通信経路の暗号化（SSL）', est: 4, kw: ['SSL', 'ssl'] },
      { name: 'データ暗号化（pgcrypto）', est: 2, kw: ['pgcrypto', 'crypt', '暗号化'] },
      { name: '監査ログ・ログ設定', est: 3, kw: ['監査', 'log_statement', 'log_connections'] },
      { name: 'ユーザ / DB 単位のパラメータ', est: 5, kw: ['ALTER ROLE', 'ALTER DATABASE', 'IN DATABASE'] },
      { name: '接続設定・OS 設定', est: 2, kw: ['listen_addresses', 'カーネル', 'overcommit', 'huge_pages'] }
    ] },
    'G1.2': { topics: [
      { name: 'バックアップ（排他 / 非排他・pg_basebackup）', est: 6, kw: ['pg_basebackup', 'pg_start_backup', '排他'] },
      { name: 'PITR・リカバリ', est: 5, kw: ['PITR', 'recovery', 'リカバリ'] },
      { name: 'VACUUM / ANALYZE / 自動バキューム・周回防止', est: 9, kw: ['VACUUM', 'ANALYZE', 'autovacuum', '自動バキューム', '周回', 'FREEZE'] },
      { name: 'REINDEX / CLUSTER', est: 5, kw: ['REINDEX', 'CLUSTER'] },
      { name: 'チェックポイント', est: 3, kw: ['チェックポイント', 'CHECKPOINT', 'checkpoint'] },
      { name: 'サーバログ管理', est: 4, kw: ['log_', 'ログ'] },
      { name: 'ディスク容量監視', est: 3, kw: ['size', 'ディスク', 'pg_wal'] }
    ] },
    'G1.3': { topics: [
      { name: 'ディレクトリ構造', est: 4, kw: ['ディレクトリ', 'pg_xact', 'global', 'pg_tblspc'] },
      { name: 'プロセス構造', est: 4, kw: ['プロセス', 'checkpointer', 'walwriter'] },
      { name: 'データの格納（ページ・FSM / VM）', est: 5, kw: ['ページ', '_fsm', '_vm', 'relfilenode', 'セグメント'] },
      { name: '外部テーブル（FDW）', est: 5, kw: ['fdw', 'FOREIGN', '外部'] },
      { name: 'システムカタログ・OID', est: 4, kw: ['OID', 'pg_class', 'カタログ'] }
    ] },
    'G1.4': { topics: [
      { name: 'ストリーミングレプリケーションの構築', est: 5, kw: ['primary_conninfo', 'standby.signal', 'max_wal_senders', 'ストリーミング'] },
      { name: '同期 / 非同期', est: 3, kw: ['synchronous', '同期'] },
      { name: 'ホットスタンバイ', est: 3, kw: ['ホットスタンバイ', 'hot_standby'] },
      { name: 'ロジカルレプリケーション', est: 5, kw: ['PUBLICATION', 'SUBSCRIPTION', '論理レプリケーション'] }
    ] },
    'G2.1': { topics: [
      { name: 'pg_stat_activity・待機イベント', est: 5, kw: ['pg_stat_activity', 'wait_event', '待機'] },
      { name: 'pg_locks', est: 4, kw: ['pg_locks'] },
      { name: 'DB / テーブル単位の稼働統計', est: 6, kw: ['pg_stat_database', 'pg_stat_user', 'pg_stat_all', 'last_autovacuum'] },
      { name: 'ブロックレベル統計（pg_statio）', est: 2, kw: ['pg_statio', 'blks_hit', 'heap_blks'] },
      { name: '統計収集の設定・進捗レポート', est: 5, kw: ['track_', 'pg_stat_reset', 'pg_stat_progress'] },
      { name: 'レプリケーションの監視', est: 3, kw: ['pg_stat_replication', 'pg_stat_wal_receiver', 'replay_lag'] }
    ] },
    'G2.2': { topics: [
      { name: 'pg_class / pg_stats', est: 6, kw: ['pg_class', 'pg_stats', 'reltuples', 'n_distinct', 'most_common'] },
      { name: 'テーブル・インデックスの実ファイル', est: 3, kw: ['ファイル', 'pg_relation_filepath', 'relfilenode'] },
      { name: '拡張統計・統計目標', est: 3, kw: ['CREATE STATISTICS', '拡張統計', 'SET STATISTICS'] },
      { name: 'TOAST', est: 2, kw: ['TOAST'] }
    ] },
    'G2.3': { topics: [
      { name: 'EXPLAIN / EXPLAIN ANALYZE の読み方', est: 7, kw: ['EXPLAIN', 'cost', 'actual'] },
      { name: 'スキャン方式', est: 4, kw: ['Scan', 'スキャン'] },
      { name: '結合方式', est: 4, kw: ['Join', 'Nested Loop', '結合'] },
      { name: 'パーティション', est: 3, kw: ['パーティション', 'partition'] },
      { name: 'パラレルクエリ', est: 4, kw: ['パラレル', 'Gather', 'parallel'] },
      { name: '集約・ソート・ウィンドウ関数', est: 5, kw: ['Sort', 'HashAggregate', 'WindowAgg', 'GroupAggregate'] }
    ] },
    'G2.4': { topics: [
      { name: 'スロークエリの検出', est: 3, kw: ['log_min_duration_statement', 'auto_explain'] },
      { name: 'pg_stat_statements', est: 3, kw: ['pg_stat_statements'] },
      { name: '性能劣化の要因', est: 3, kw: ['肥大化', '劣化', '古い統計'] }
    ] },
    'G3.1': { topics: [
      { name: 'メモリ関連', est: 8, kw: ['shared_buffers', 'work_mem', 'maintenance_work_mem', 'effective_cache_size', 'wal_buffers'] },
      { name: 'WAL・チェックポイント', est: 5, kw: ['wal_level', 'max_wal_size', 'checkpoint', 'synchronous_commit', 'full_page_writes'] },
      { name: 'プランナ設定', est: 4, kw: ['random_page_cost', 'seq_page_cost', 'enable_', 'default_statistics_target'] },
      { name: 'ロック管理', est: 5, kw: ['deadlock_timeout', 'lock_timeout', 'max_locks', 'log_lock_waits'] },
      { name: '一時ファイル・バックグラウンドライタ', est: 5, kw: ['temp_file', 'log_temp_files', 'bgwriter'] },
      { name: '並列度・ワーカー', est: 3, kw: ['max_worker_processes', 'max_parallel'] }
    ] },
    'G3.2': { topics: [
      { name: 'インデックスの活用', est: 6, kw: ['インデックス', 'INDEX'] },
      { name: 'SQL の書き換え・プリペアド文', est: 3, kw: ['SELECT', 'PREPARE', 'プリペアド'] },
      { name: 'テーブル構成（fillfactor・パーティション）', est: 4, kw: ['fillfactor', 'HOT', 'パーティション', 'UNLOGGED'] },
      { name: 'ディスク I/O の分散', est: 2, kw: ['テーブルスペース', 'I/O'] },
      { name: 'パラメータ・実行計画のチューニング', est: 3, kw: ['チューニング', 'plan_cache_mode'] }
    ] },
    'G4.1': { topics: [
      { name: 'サーバダウン・クラッシュリカバリ', est: 4, kw: ['クラッシュ', 'OOM', 'postmaster'] },
      { name: 'OS リソースの枯渇', est: 7, kw: ['ディスク', 'メモリ', 'max_connections', '容量'] },
      { name: '動作不良（長時間実行・ロック待ち）', est: 4, kw: ['statement_timeout', 'idle in transaction', 'ロック'] },
      { name: 'プロセスの管理', est: 3, kw: ['pg_cancel_backend', 'pg_terminate_backend', 'kill'] },
      { name: 'トランザクション ID の周回', est: 2, kw: ['周回', 'XID'] }
    ] },
    'G4.2': { topics: [
      { name: 'WAL・制御ファイルの破損', est: 3, kw: ['pg_resetwal', 'pg_control'] },
      { name: 'システムカタログの破損・シングルユーザモード', est: 2, kw: ['システムカタログ', 'ignore_system_indexes', 'シングルユーザ'] },
      { name: 'インデックス破損', est: 3, kw: ['REINDEX', 'amcheck'] },
      { name: 'チェックサム・破損検知', est: 4, kw: ['チェックサム', 'checksum', 'zero_damaged_pages'] }
    ] },
    'G4.3': { topics: [
      { name: 'スタンバイ停止・WAL 保持・スロット', est: 5, kw: ['スロット', 'wal_keep', '遅延'] },
      { name: 'フェイルオーバー・pg_rewind', est: 3, kw: ['promote', 'pg_rewind', 'フェイルオーバー'] },
      { name: 'ロジカルレプリケーションの障害', est: 3, kw: ['サブスクライバ', '論理レプリケーション', '競合'] }
    ] },

    /* ======================== バージョン差分（試験範囲外） ======================== */
    'V1.1': { topics: [
      { name: 'WAL / CLOG ディレクトリの改名', est: 2, kw: ['pg_xlog', 'pg_clog'] },
      { name: 'recovery.conf の廃止・signal ファイル', est: 2, kw: ['recovery.conf', 'signal'] },
      { name: 'postgresql.auto.conf', est: 1, kw: ['auto.conf', 'ALTER SYSTEM'] },
      { name: '昇格トリガ・その他', est: 3, kw: ['trigger', 'promote'] }
    ] },
    'V1.2': { topics: [
      { name: 'xlog 系コマンドの改名', est: 2, kw: ['pg_resetxlog', 'pg_xlogdump', 'pg_receivexlog'] },
      { name: 'xlog / location 系関数の改名', est: 2, kw: ['xlog_location', '_lsn'] },
      { name: 'バックアップ関数の変更', est: 2, kw: ['pg_backup_start', 'pg_start_backup'] },
      { name: '削除されたツール', est: 3, kw: ['createlang', 'droplang'] }
    ] },
    'V1.3': { topics: [
      { name: 'WAL・チェックポイント系パラメータ', est: 3, kw: ['checkpoint_segments', 'wal_keep', 'wal_level'] },
      { name: '認証・セキュリティの既定値', est: 2, kw: ['password_encryption', 'md5', 'scram'] },
      { name: '統計情報・監視', est: 2, kw: ['stats_temp_directory', 'stats collector', 'pg_stat_io'] },
      { name: '削除・改名されたパラメータ', est: 5, kw: ['廃止', '削除'] }
    ] },
    'V1.4': { topics: [
      { name: '権限・スキーマの既定値', est: 2, kw: ['public'] },
      { name: 'SQL 構文・演算子の削除', est: 6, kw: ['OIDS', '演算子'] },
      { name: '問い合わせの動作変更', est: 2, kw: ['WITH', 'MATERIALIZED'] },
      { name: 'バージョン番号体系', est: 1, kw: ['9.6.'] },
      { name: 'initdb・EXPLAIN などの既定値変更', est: 2, kw: ['チェックサム', 'checksums', 'BUFFERS'] }
    ] },
    'V1.5': { topics: [
      { name: 'レプリケーション', est: 6, kw: ['レプリケーション'] },
      { name: 'パーティショニング', est: 2, kw: ['パーティション'] },
      { name: 'SQL 機能（MERGE・JSON など）', est: 3, kw: ['MERGE', 'JSON', 'プロシージャ', '生成列'] },
      { name: 'バックアップ・運用', est: 2, kw: ['増分', 'pg_combinebackup', 'pg_checksums'] },
      { name: '性能（JIT・パラレル・非同期 I/O）', est: 3, kw: ['JIT', 'パラレル', '非同期'] }
    ] }
  }
};
