/*
 * Gold G2 性能監視（87問）
 * PostgreSQL 14 文書に基づくオリジナル問題。形式は DEVELOPMENT.md を参照。
 * tools/format.js で整形しています（node tools/format.js）。
 */
(window.PGQ_QUESTIONS = window.PGQ_QUESTIONS || []).push(

/* ---------------- G2.1 アクセス統計情報（重要度 3 / 30問） ---------------- */
{
  id: 'G2.1-001', level: 'gold', cat: 'G2.1',
  q: '`pg_locks` ビューで、ロックの獲得を待っている（まだ獲得できていない）行を判別するための列と値の組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'mode = \'ExclusiveLock\'',
    'granted = false',
    'locktype = \'wait\'',
    'fastpath = true',
    'pid IS NULL'
  ],
  answer: 1,
  exp: 'pg_locks の granted 列は、ロックを保持している場合は true、ロック獲得を待っている場合は false になります。\nmode はロックモード、locktype はロック対象の種類（relation、tuple、transactionid など）、fastpath はファストパス経由で獲得されたかどうかを表します。pid は保持・待機しているサーバプロセスの ID で、準備済みトランザクションが保持している場合は NULL になります。\n待機しているセッションは、pg_stat_activity の wait_event_type が Lock であることや、pg_blocking_pids() 関数でも確認できます。',
  refs: [
    ['pg_locks', 'view-pg-locks.html'],
    ['pg_stat_activity', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW']
  ]
},
{
  id: 'G2.1-002', level: 'gold', cat: 'G2.1',
  q: 'データベース単位のバッファキャッシュヒット率を算出するために利用できる列の組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'pg_stat_database の blks_hit と blks_read',
    'pg_stat_database の tup_fetched と tup_returned',
    'pg_stat_database の xact_commit と xact_rollback',
    'pg_stat_user_tables の heap_blks_hit と heap_blks_read',
    'pg_stat_activity の wait_event と state'
  ],
  answer: 0,
  exp: 'pg_stat_database の blks_hit は共有バッファ内で見つかったブロック数、blks_read はディスクから読み込んだブロック数です。blks_hit / (blks_hit + blks_read) でデータベース単位のキャッシュヒット率の目安を求められます（OS のページキャッシュからの読み込みは blks_read に含まれます）。\nheap_blks_hit / heap_blks_read はテーブル単位の I/O 統計で、pg_stat_user_tables ではなく pg_statio_user_tables ビューにある列です。\ntup_fetched / tup_returned は行数、xact_commit / xact_rollback はトランザクション数の統計です。',
  refs: [
    ['pg_stat_database', 'monitoring-stats.html#MONITORING-PG-STAT-DATABASE-VIEW'],
    ['pg_statio_all_tables', 'monitoring-stats.html#MONITORING-PG-STATIO-ALL-TABLES-VIEW']
  ]
},
{
  id: 'G2.1-003', level: 'gold', cat: 'G2.1',
  q: 'テーブルに対して最後に自動バキュームが実行された日時を確認できるビューと列の組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'pg_stat_user_tables の last_autovacuum',
    'pg_class の relautovacuum',
    'pg_stat_database の last_autovacuum',
    'pg_stat_activity の last_vacuum',
    'pg_statio_user_tables の last_autovacuum'
  ],
  answer: 0,
  exp: 'pg_stat_all_tables（ユーザテーブルだけに絞った pg_stat_user_tables）には、テーブルごとの稼働統計として last_vacuum（手動 VACUUM）、last_autovacuum（自動バキューム）、last_analyze、last_autoanalyze の最終実行日時や、vacuum_count、autovacuum_count などの実行回数、n_live_tup / n_dead_tup（推定の有効行数・不要行数）が格納されています。\npg_statio_user_tables はブロック単位の I/O 統計、pg_stat_database はデータベース単位の統計です。',
  refs: [
    ['pg_stat_all_tables', 'monitoring-stats.html#MONITORING-PG-STAT-ALL-TABLES-VIEW']
  ]
},
{
  id: 'G2.1-004', level: 'gold', cat: 'G2.1',
  q: '`pg_stat_activity` の state 列が `idle in transaction` であるセッションの説明として、正しいものを1つ選びなさい。',
  choices: [
    '問い合わせを実行中である',
    'トランザクションの外で、クライアントからの新しいコマンドを待っている',
    'トランザクションの中にいて、クライアントからの次のコマンドを待っている',
    'ロックの獲得を待っている',
    'ファストパス関数を実行している'
  ],
  answer: 2,
  exp: 'pg_stat_activity の state 列の主な値は次のとおりです。\n・active: 問い合わせを実行中\n・idle: 新しいコマンドを待機中（トランザクション外）\n・idle in transaction: トランザクション内で、次のコマンドを待機中\n・idle in transaction (aborted): エラーでアボートしたトランザクション内で待機中\n・fastpath function call: ファストパス関数を実行中\n長時間の idle in transaction はロックを保持し続けたり、VACUUM による不要行の回収を妨げたりするため、idle_in_transaction_session_timeout での切断なども検討します。ロック待ちは state ではなく wait_event_type / wait_event で確認します。',
  refs: [
    ['pg_stat_activity', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW'],
    ['idle_in_transaction_session_timeout', 'runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT']
  ]
},
{
  id: 'G2.1-005', level: 'gold', cat: 'G2.1',
  q: '稼働統計情報の収集に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'track_io_timing は既定で on であり、すべてのブロック I/O の時間が計測されている',
    'track_activities を off にすると、pg_stat_activity にセッションの行自体が表示されなくなる',
    'pg_stat_reset() を実行すると、クラスタ内のすべてのデータベースの統計情報がリセットされる',
    'track_io_timing を on にすると、ブロック I/O の所要時間が blk_read_time などに記録される',
    'track_counts を off にしても、自動バキュームの動作には影響しない'
  ],
  answer: 3,
  exp: 'track_io_timing（既定 off）を on にすると、データブロックの I/O にかかった時間が pg_stat_database の blk_read_time / blk_write_time や、EXPLAIN (ANALYZE, BUFFERS) の出力などに記録されます。時刻の取得を繰り返すため、プラットフォームによってはオーバーヘッドが大きくなります（pg_test_timing で確認できます）。\ntrack_activities を off にしても pg_stat_activity の行は表示されますが、実行中のコマンドの情報は収集されません。\npg_stat_reset() は現在のデータベースの統計情報だけをリセットします。\ntrack_counts は自動バキュームが対象テーブルを判定するのに必要です。',
  refs: [
    ['実行時統計情報', 'runtime-config-statistics.html'],
    ['track_io_timing', 'runtime-config-statistics.html#GUC-TRACK-IO-TIMING'],
    ['統計情報関数', 'monitoring-stats.html#MONITORING-STATS-FUNCTIONS']
  ]
},
{
  id: 'G2.1-006', level: 'gold', cat: 'G2.1',
  q: 'プライマリサーバで、接続している各スタンバイへのレプリケーションの遅延を確認する方法として、正しいものを1つ選びなさい。',
  choices: [
    'pg_stat_replication ビューの write_lag、flush_lag、replay_lag などの列を確認する',
    'プライマリで pg_stat_wal_receiver ビューの replay_lag 列を確認する',
    'pg_replication_slots ビューの replay_lag 列を確認する',
    'pg_stat_activity で backend_type が walreceiver の行を確認する',
    'pg_stat_database_conflicts ビューの confl_lock 列を確認する'
  ],
  answer: 0,
  exp: 'pg_stat_replication はプライマリ（送信側）で WAL 送信プロセスごとに1行を表示するビューで、sent_lsn、write_lsn、flush_lsn、replay_lsn の各位置や、write_lag、flush_lag、replay_lag の遅延時間、sync_state（同期状態）などを確認できます。\npg_stat_wal_receiver はスタンバイ側で WAL 受信プロセスの状態を表示するビューです。pg_replication_slots はレプリケーションスロットの情報（active、restart_lsn、wal_status など）を表示し、replay_lag 列はありません。\nプライマリの WAL 送信プロセスの backend_type は walsender です。pg_stat_database_conflicts はスタンバイで問い合わせがキャンセルされた回数の統計です。',
  refs: [
    ['pg_stat_replication', 'monitoring-stats.html#MONITORING-PG-STAT-REPLICATION-VIEW'],
    ['pg_stat_wal_receiver', 'monitoring-stats.html#MONITORING-PG-STAT-WAL-RECEIVER-VIEW']
  ]
},
{
  id: 'G2.1-007', level: 'gold', cat: 'G2.1',
  q: '実行中の VACUUM（FULL なし）の進捗状況を確認できるビューを1つ選びなさい。',
  choices: [
    'pg_stat_progress_vacuum',
    'pg_stat_vacuum_progress',
    'pg_stat_user_tables',
    'pg_locks',
    'pg_stat_progress_autovacuum'
  ],
  answer: 0,
  exp: 'pg_stat_progress_vacuum は、手動の VACUUM と自動バキュームワーカーを含め、実行中の VACUUM ごとに処理フェーズ（heap のスキャン、インデックスのバキュームなど）や処理済みのブロック数を表示します。\nPostgreSQL 14 の進捗レポートビューには、ほかに pg_stat_progress_analyze、pg_stat_progress_create_index、pg_stat_progress_cluster（CLUSTER と VACUUM FULL）、pg_stat_progress_basebackup、pg_stat_progress_copy があります。\npg_stat_vacuum_progress や pg_stat_progress_autovacuum というビューはありません。',
  refs: [
    ['進捗状況のレポート', 'progress-reporting.html'],
    ['VACUUMの進捗レポート', 'progress-reporting.html#VACUUM-PROGRESS-REPORTING']
  ]
},
{
  id: 'G2.1-008', level: 'gold', cat: 'G2.1',
  q: '`pg_stat_activity` の待機イベントに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'wait_event_type が Lock の場合は、軽量ロック（LWLock）の獲得を待っている',
    'wait_event_type が LWLock の場合は、pg_locks ビューで保持者を特定できる',
    'wait_event_type が IO の場合は、ディスク障害が発生していることを示す',
    'wait_event_type が Client の場合は、クライアントからのデータの受信などを待っている',
    'wait_event が NULL の場合は、ロックの獲得を待っていることを示す'
  ],
  answer: 3,
  exp: 'wait_event_type は待機の種類を表します。主な値は次のとおりです。\n・Lock: 重量ロック（pg_locks に表示されるロック）の待機\n・LWLock: 軽量ロックの待機（pg_locks には表示されない）\n・IO: I/O の完了待ち（通常の処理でも発生する）\n・Client: クライアントとのソケット通信の待機（ClientRead など）\n・IPC、Timeout、Activity など\n待機していない場合、wait_event_type と wait_event は NULL になります。アイドル状態のセッションは、クライアントからのコマンドを待つ ClientRead と表示されることが多くあります。',
  refs: [
    ['待機イベント', 'monitoring-stats.html#WAIT-EVENT-TABLE'],
    ['pg_stat_activity', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW']
  ]
},
{
  id: 'G2.1-009', level: 'gold', cat: 'G2.1',
  q: '指定したプロセスのロック獲得を妨げている（ブロックしている）サーバプロセスの ID を配列で返す関数として、正しいものを1つ選びなさい。',
  choices: [
    'pg_blocking_pids()',
    'pg_locked_pids()',
    'pg_stat_get_blockers()',
    'pg_lock_owner()',
    'pg_waiting_for()'
  ],
  answer: 0,
  exp: 'pg_blocking_pids(pid) は、指定したプロセスが待機しているロックを保持している、または先に待機していて獲得を妨げているプロセスの ID を integer の配列で返します（PostgreSQL 9.6 以降）。例えば SELECT pid, pg_blocking_pids(pid), query FROM pg_stat_activity WHERE cardinality(pg_blocking_pids(pid)) > 0; で、ブロックされているセッションとその原因のセッションを一覧できます。\n原因のセッションは pg_cancel_backend() や pg_terminate_backend() で取り消し・終了できます。ほかの選択肢の関数は存在しません。',
  refs: [
    ['セッション情報関数', 'functions-info.html'],
    ['pg_locks', 'view-pg-locks.html']
  ]
},
{
  id: 'G2.1-010', level: 'gold', cat: 'G2.1',
  q: 'PostgreSQL 14 の `pg_stat_bgwriter` ビューに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'checkpoints_timed はチェックポイントの失敗回数を表す',
    'buffers_backend が大きいほど、バックグラウンドライタが効率よく動作していることを示す',
    'checkpoints_req の割合が高いと WAL 契機のチェックポイントが多く、max_wal_size の拡大を検討する',
    'このビューはデータベースごとに1行を表示する',
    'このビューの統計情報は、リセットすることができない'
  ],
  answer: 2,
  exp: 'pg_stat_bgwriter はクラスタ全体で1行の統計で、PostgreSQL 14 では次のような列があります。\n・checkpoints_timed: checkpoint_timeout の経過で実行されたチェックポイントの回数\n・checkpoints_req: WAL 量の超過や CHECKPOINT コマンドなどによる要求で実行された回数\n・buffers_checkpoint / buffers_clean / buffers_backend: チェックポイント、バックグラウンドライタ、バックエンド自身が書き出したバッファ数\ncheckpoints_req の割合が高い場合は max_wal_size が小さい可能性があり、buffers_backend が多い場合はバックグラウンドライタの設定を見直します。pg_stat_reset_shared(\'bgwriter\') でリセットできます（PostgreSQL 17 でチェックポイントの列は pg_stat_checkpointer に移動）。',
  refs: [
    ['pg_stat_bgwriter', 'monitoring-stats.html#MONITORING-PG-STAT-BGWRITER-VIEW'],
    ['統計情報関数', 'monitoring-stats.html#MONITORING-STATS-FUNCTIONS']
  ]
},
{
  id: 'G2.1-011', level: 'gold', cat: 'G2.1',
  q: '使われていないインデックスを探すために確認する情報として、最も適切なものを1つ選びなさい。',
  choices: [
    'pg_stat_user_indexes の idx_scan が長期間 0 のままのインデックス',
    'pg_stat_user_tables の idx_scan が 0 のテーブル（テーブルごと削除を検討する）',
    'pg_statio_user_indexes の idx_blks_read が 0 のインデックス（破損しているとみなす）',
    'pg_stat_user_tables の seq_scan が多いテーブルのすべてのインデックス',
    'pg_class の relpages が小さいインデックス'
  ],
  answer: 0,
  exp: 'pg_stat_user_indexes（pg_stat_all_indexes）の idx_scan は、そのインデックスを使ったスキャンの回数です。統計をリセットしてから十分な期間（月次処理なども含む）が経過しても idx_scan が 0 のインデックスは、使われていない可能性が高く、削除すれば更新時のオーバーヘッドやディスク使用量を減らせます。\nただし、主キーや一意制約を実現するためのインデックスはスキャンされなくても制約のために必要です。また、スタンバイで実行される問い合わせの利用状況はプライマリの統計には反映されない点に注意します。',
  refs: [
    ['pg_stat_all_indexes', 'monitoring-stats.html#MONITORING-PG-STAT-ALL-INDEXES-VIEW']
  ]
},
{
  id: 'G2.1-012', level: 'gold', cat: 'G2.1',
  q: 'テーブルごとのバッファ読み込みの状況を調べたい。参照すべきビューと列の組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'pg_statio_user_tables の heap_blks_hit と heap_blks_read',
    'pg_stat_user_tables の heap_blks_hit と heap_blks_read',
    'pg_stat_database の seq_scan と idx_scan',
    'pg_statio_user_tables の n_live_tup と n_dead_tup',
    'pg_stat_all_indexes の blks_hit と blks_read'
  ],
  answer: 0,
  exp: 'ブロック（バッファ）レベルの入出力統計は pg_statio_ で始まるビューにまとめられています。pg_statio_user_tables には、テーブル本体の heap_blks_read / heap_blks_hit、インデックスの idx_blks_read / idx_blks_hit、TOAST の toast_blks_* などがあります。_read は共有バッファで見つからずに要求したブロック数、_hit は共有バッファ内で見つかったブロック数です。\npg_stat_user_tables には seq_scan、idx_scan、n_live_tup、n_dead_tup などの行レベルのアクセス統計が入ります。\nデータベース単位のブロック統計は pg_stat_database の blks_read / blks_hit です。',
  refs: [
    ['pg_statio_all_tables', 'monitoring-stats.html#MONITORING-PG-STATIO-ALL-TABLES-VIEW'],
    ['統計情報ビュー', 'monitoring-stats.html#MONITORING-STATS-VIEWS']
  ]
},
{
  id: 'G2.1-013', level: 'gold', cat: 'G2.1',
  q: 'pg_stat_database ビューで確認できる情報として、正しいものを1つ選びなさい。',
  choices: [
    'そのデータベースで発生したデッドロックの累計回数や、一時ファイルの個数と総サイズ',
    'そのデータベースで現在実行中の SQL 文の本文と、実行開始からの経過時間',
    'そのデータベース内の各テーブルの不要タプル数（n_dead_tup）',
    'そのデータベースに対して最後に VACUUM が実行された日時',
    'そのデータベースで最も実行時間の長い SQL 文の上位10件'
  ],
  answer: 0,
  exp: 'pg_stat_database はデータベース単位の統計を持ち、numbackends（接続数）、xact_commit / xact_rollback、blks_read / blks_hit、tup_* のほか、deadlocks（デッドロック発生回数）、temp_files / temp_bytes（一時ファイルの個数と総量）、conflicts（スタンバイでのリカバリ競合によるキャンセル数）、checksum_failures などが含まれます。\n実行中の SQL 文は pg_stat_activity、テーブル単位の不要タプル数や最終 VACUUM 日時は pg_stat_user_tables で確認します。\nSQL 文ごとの実行統計は pg_stat_statements モジュールが必要です。',
  refs: [
    ['pg_stat_database', 'monitoring-stats.html#MONITORING-PG-STAT-DATABASE-VIEW']
  ]
},
{
  id: 'G2.1-014', level: 'gold', cat: 'G2.1',
  q: 'テーブルのアクセス傾向を pg_stat_user_tables で調べるときの説明として、正しいものを1つ選びなさい。',
  choices: [
    'seq_scan が多く idx_scan がほとんどないテーブルは、インデックスの追加を検討する候補になりうる',
    'seq_tup_read は、シーケンシャルスキャンで読み込んだブロック数を表す',
    'n_dead_tup は VACUUM を実行しても減らないため、肥大化の判断には使えない',
    'idx_scan の値はインデックス単位に分かれており、どのインデックスが使われたかまで分かる',
    'これらの値はサーバを再起動するたびに、必ず自動的にゼロへリセットされる'
  ],
  answer: 0,
  exp: 'pg_stat_user_tables の seq_scan（シーケンシャルスキャン回数）が多く、idx_scan がほとんど増えないテーブルは、適切なインデックスがない可能性があります。ただし小さなテーブルではシーケンシャルスキャンが最適なことも多く、値だけで判断はできません。\nseq_tup_read はシーケンシャルスキャンで読み取った「行数」です。ブロック数は pg_statio_ のビューで確認します。\nn_dead_tup は VACUUM によって回収されると減少します。\nインデックス単位の使用回数は pg_stat_user_indexes の idx_scan で確認します。\n統計は通常の停止・起動では保持され、クラッシュ後などにリセットされます。',
  refs: [
    ['pg_stat_all_tables', 'monitoring-stats.html#MONITORING-PG-STAT-ALL-TABLES-VIEW'],
    ['pg_stat_all_indexes', 'monitoring-stats.html#MONITORING-PG-STAT-ALL-INDEXES-VIEW']
  ]
},
{
  id: 'G2.1-015', level: 'gold', cat: 'G2.1',
  q: 'チューニングの効果を測るため、特定のテーブルの稼働統計だけをゼロに戻したい。適切な方法を1つ選びなさい。',
  choices: [
    'pg_stat_reset_single_table_counters(対象テーブルの OID) を実行する',
    'pg_stat_reset() を実行し、対象テーブル以外の値を手動で書き戻す',
    'TRUNCATE を実行すると、そのテーブルの統計だけがリセットされる',
    'ANALYZE を実行すると、そのテーブルの稼働統計がリセットされる',
    'pg_stat_user_tables に対して DELETE 文を実行する'
  ],
  answer: 0,
  exp: 'pg_stat_reset_single_table_counters(oid) は、指定した1つのテーブルまたはインデックスの稼働統計カウンタだけをリセットします。関数単位には pg_stat_reset_single_function_counters() があります。\npg_stat_reset() は現在のデータベースの稼働統計をすべてリセットします。共有のカウンタは pg_stat_reset_shared に bgwriter などを指定してリセットします。\nANALYZE が更新するのはプランナ用の統計情報（pg_statistic）であり、稼働統計とは別物です。\n統計ビューは実体のあるテーブルではないため、DELETE はできません。',
  refs: [
    ['統計情報関数', 'monitoring-stats.html#MONITORING-STATS-FUNCTIONS']
  ]
},
{
  id: 'G2.1-016', level: 'gold', cat: 'G2.1',
  q: '実行中の CREATE INDEX の進捗を確認したい。PostgreSQL 14 で参照すべきビューを1つ選びなさい。',
  choices: [
    'pg_stat_progress_vacuum',
    'pg_stat_progress_cluster',
    'pg_stat_progress_analyze',
    'pg_stat_progress_create_index',
    'pg_stat_progress_basebackup'
  ],
  answer: 3,
  shuffle: false,
  exp: 'PostgreSQL 12 以降、CREATE INDEX と REINDEX の進捗は pg_stat_progress_create_index ビューで確認できます。phase 列に現在の処理段階、blocks_done / blocks_total や tuples_done / tuples_total に進捗が表示されます。\nPostgreSQL 14 時点の進捗レポート用ビューには、ほかに pg_stat_progress_vacuum、pg_stat_progress_analyze、pg_stat_progress_cluster（CLUSTER と VACUUM FULL）、pg_stat_progress_basebackup、pg_stat_progress_copy があります。',
  refs: [
    ['CREATE INDEXの進捗レポート', 'progress-reporting.html#CREATE-INDEX-PROGRESS-REPORTING'],
    ['進捗レポート', 'progress-reporting.html']
  ]
},
{
  id: 'G2.1-017', level: 'gold', cat: 'G2.1',
  q: 'PostgreSQL 14 で追加された `pg_stat_wal` ビューに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'WAL の生成量や、WAL バッファ不足による書き出し回数（wal_buffers_full）などを確認できる',
    '各スタンバイへの WAL 送信状況を、接続ごとに1行で表示する',
    'WAL ファイルの一覧と、それぞれのファイルサイズを表示する',
    'アーカイブに成功・失敗した WAL ファイルの回数を表示する',
    '実行中のトランザクションが生成した WAL を、セッションごとに表示する'
  ],
  answer: 0,
  exp: 'pg_stat_wal は PostgreSQL 14 で追加された、クラスタ全体の WAL 活動に関する統計ビューです。wal_records、wal_bytes（生成された WAL の量）、wal_buffers_full（WAL バッファが満杯になって書き出した回数）、wal_write / wal_sync とその所要時間などが含まれます。wal_buffers_full が大きい場合は wal_buffers の増加を検討します。\nスタンバイごとの送信状況は pg_stat_replication、アーカイブの成功・失敗回数は pg_stat_archiver で確認します。\nWAL ファイルの一覧は pg_ls_waldir() で取得できます。',
  refs: [
    ['pg_stat_wal', 'monitoring-stats.html#MONITORING-PG-STAT-WAL-VIEW'],
    ['pg_stat_archiver', 'monitoring-stats.html#MONITORING-PG-STAT-ARCHIVER-VIEW']
  ]
},
{
  id: 'G2.1-018', level: 'gold', cat: 'G2.1',
  q: '`pg_stat_activity` の backend_type 列に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'client backend のほか、autovacuum worker や checkpointer などの補助プロセスも表示される',
    'クライアントからの接続だけが対象なので、値は常に client backend になる',
    'backend_type が walsender の行は、スタンバイ側で WAL を受信しているプロセスを表す',
    'backend_type は接続に使われたプロトコル（TCP かソケットか）を表す',
    'backend_type が background worker の行には、必ず実行中の SQL 文が表示される'
  ],
  answer: 0,
  exp: 'pg_stat_activity には通常のクライアント接続（client backend）だけでなく、autovacuum launcher / autovacuum worker、background writer、checkpointer、walwriter、archiver、logical replication launcher といった補助プロセスの行も含まれ、backend_type 列で区別できます。補助プロセスは query 列が空だったり、統計の一部の列が NULL だったりします。\nwalsender はプライマリ側で WAL を送信するプロセスで、スタンバイ側の受信プロセスは walreceiver です。\n接続元の情報は client_addr や client_hostname で確認します。',
  refs: [
    ['pg_stat_activity', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW'],
    ['統計情報の閲覧', 'monitoring-stats.html#MONITORING-STATS-VIEWS']
  ]
},
{
  id: 'G2.1-019', level: 'gold', cat: 'G2.1',
  q: '稼働統計情報の収集に関するパラメータの説明として、適切なものを2つ選びなさい。',
  choices: [
    'track_activities を無効にすると、pg_stat_activity で実行中の問い合わせが見えなくなる',
    'track_counts を無効にすると、自動バキュームが正しく動作しなくなる',
    'track_functions の既定値は all で、すべての関数の実行が記録される',
    'track_io_timing は既定で有効なので、EXPLAIN (ANALYZE, BUFFERS) で常に I/O 時間が表示される',
    'track_activities で収集した情報は、スーパーユーザだけが参照できる'
  ],
  answer: [0, 1],
  exp: 'track_activities（既定 on）は各セッションが現在実行中のコマンドの情報を収集します。無効にすると pg_stat_activity の query 列などが見えなくなります。\ntrack_counts（既定 on）はテーブルやインデックスへのアクセス数を収集します。自動バキュームはこの統計を見て実行対象を決めるため、無効にすると自動バキュームが適切に動作しません。\ntrack_functions の既定値は none で、pl（手続き言語の関数のみ）または all を指定して有効にします。\ntrack_io_timing の既定値は off です（計測のオーバーヘッドがあるため）。\n他のロールの問い合わせを見るには権限が必要ですが、自分自身のセッションの情報は誰でも参照できます。',
  refs: [
    ['実行時統計情報', 'runtime-config-statistics.html#RUNTIME-CONFIG-STATISTICS-COLLECTOR'],
    ['統計情報収集器', 'monitoring-stats.html']
  ]
},
{
  id: 'G2.1-020', level: 'gold', cat: 'G2.1',
  q: 'レプリケーションの監視に使うビューの説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'pg_stat_replication はスタンバイ側で参照して、プライマリからの受信状況を確認する',
    'pg_stat_wal_receiver はスタンバイ側で参照し、接続先や受信状況を確認できる',
    'pg_stat_replication の sync_state 列が sync であれば、そのスタンバイは同期スタンバイである',
    'pg_stat_replication の replay_lag 列で、適用の遅れを時間として確認できる',
    'pg_replication_slots でスロットの状態や保持している WAL の量を確認できる'
  ],
  answer: 0,
  exp: 'pg_stat_replication は、WAL を送信している側（プライマリ、またはカスケード構成の上流スタンバイ）で参照するビューで、接続してきたスタンバイごとに1行を表示します。スタンバイ側で参照しても行は現れません。この点が誤りです。\nスタンバイ側で受信状況を見るには pg_stat_wal_receiver を使います。\nsync_state 列は async、potential、sync、quorum のいずれかで、同期の役割を示します。\nwrite_lag / flush_lag / replay_lag は、PostgreSQL 10 で追加された遅延を時間で表す列です。',
  refs: [
    ['pg_stat_replication', 'monitoring-stats.html#MONITORING-PG-STAT-REPLICATION-VIEW'],
    ['pg_stat_wal_receiver', 'monitoring-stats.html#MONITORING-PG-STAT-WAL-RECEIVER-VIEW']
  ]
},
{
  id: 'G2.1-021', level: 'gold', cat: 'G2.1',
  q: '`pg_stat_activity` の state 列に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'active は問い合わせを実行中であることを表す',
    'idle in transaction はトランザクションを開いたまま、次のコマンドを待っている状態を表す',
    'idle はトランザクションを開いたまま待機している状態を表す',
    'idle in transaction (aborted) は、正常に終了したトランザクションを表す',
    'state が active のセッションは、ロック待ちのときには表示されない'
  ],
  answer: [0, 1],
  exp: 'state 列の主な値は、active（問い合わせを実行中）、idle（トランザクションの外で待機中）、idle in transaction（トランザクションを開いたまま次のコマンドを待っている）、idle in transaction (aborted)（エラーで中断したトランザクションを開いたまま待機中）、fastpath function call です。\nidle in transaction は古いスナップショットを保持し続けるため、VACUUM が不要タプルを回収できなくなる原因になります。idle_in_transaction_session_timeout で自動切断できます。\nロックを待っている問い合わせも実行中なので state は active のままで、wait_event_type が Lock になります。',
  refs: [
    ['pg_stat_activity', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW'],
    ['待機イベント', 'monitoring-stats.html#WAIT-EVENT-TABLE']
  ]
},
{
  id: 'G2.1-022', level: 'gold', cat: 'G2.1',
  q: 'PostgreSQL 14 で追加された `pg_stat_progress_copy` ビューに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '実行中の COPY の進捗を、処理済みバイト数や行数で確認できる',
    'COPY で発生したエラーの件数を集計して表示する',
    '過去に実行した COPY の履歴を一覧で表示する',
    'COPY の実行計画を表示する',
    'COPY の同時実行数を制限するためのビューである'
  ],
  answer: 0,
  exp: 'pg_stat_progress_copy は PostgreSQL 14 で追加された進捗レポート用のビューで、実行中の COPY について、処理済みのバイト数（bytes_processed）、入力の総バイト数（bytes_total、ファイルからの場合）、処理済みの行数（tuples_processed）、除外された行数（tuples_excluded）などを表示します。大量データの取り込みの進み具合を確認するのに使えます。\n進捗レポート用のビューはこのほかに pg_stat_progress_vacuum、analyze、cluster、create_index、basebackup があります。\nいずれも実行中の処理だけが対象で、履歴は残りません。',
  refs: [
    ['COPYの進捗レポート', 'progress-reporting.html#COPY-PROGRESS-REPORTING'],
    ['進捗レポート', 'progress-reporting.html']
  ]
},
{
  id: 'G2.1-023', level: 'gold', cat: 'G2.1',
  q: '`pg_locks` ビューに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'granted 列が false の行は、ロックの獲得を待っている状態を表す',
    'PostgreSQL 14 で追加された waitstart 列で、待ち始めた時刻が分かる',
    'ロックを待っているセッションだけが行として現れる',
    'pg_locks には、共有メモリ上の軽量ロック（LWLock）も表示される',
    'mode 列には、待機時間がミリ秒で表示される'
  ],
  answer: [0, 1],
  exp: 'pg_locks は、現在獲得されている、または獲得を待っているロックを1行ずつ表示します。granted 列が true なら獲得済み、false なら待機中です。獲得済みのロックも表示されるため、待機中の行だけが現れるわけではありません。\nPostgreSQL 14 で waitstart 列が追加され、そのロックを待ち始めた時刻が分かるようになりました。待ち時間の長いセッションを見つけやすくなっています。\nmode 列はロックの強さ（AccessShareLock、RowExclusiveLock、AccessExclusiveLock など）です。\n軽量ロックは pg_locks には現れず、pg_stat_activity の wait_event で確認します。',
  refs: [
    ['pg_locks', 'view-pg-locks.html'],
    ['明示的ロック', 'explicit-locking.html']
  ]
},
{
  id: 'G2.1-024', level: 'gold', cat: 'G2.1',
  q: 'PostgreSQL 14 で追加された `compute_query_id` と問い合わせ ID に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_stat_activity や EXPLAIN、ログに問い合わせ ID を表示できるようになる',
    '有効にすると、同じ問い合わせの実行が自動的にキャッシュされ再利用される',
    '問い合わせ ID は実行のたびに変わるため、集計には使えない',
    '既定値は on で、常に問い合わせ ID が計算される',
    'pg_stat_statements を導入すると、このパラメータは使えなくなる'
  ],
  answer: 0,
  exp: 'PostgreSQL 14 で問い合わせ ID の計算がコアに取り込まれ、compute_query_id パラメータ（既定 auto）で制御するようになりました。有効な場合、pg_stat_activity の query_id 列、EXPLAIN (VERBOSE)、log_line_prefix の %Q でその値を参照でき、pg_stat_statements の queryid と対応づけられます。\n既定の auto は、pg_stat_statements のような拡張が必要とする場合にのみ計算する、という意味です。\n問い合わせ ID は定数を正規化したうえで計算されるため、値の違う同じ形の文は同じ ID になります。\n実行結果のキャッシュ機能ではありません。',
  refs: [
    ['実行時統計情報', 'runtime-config-statistics.html#GUC-COMPUTE-QUERY-ID'],
    ['pg_stat_statements', 'pgstatstatements.html']
  ]
},
{
  id: 'G2.1-025', level: 'gold', cat: 'G2.1',
  q: 'PostgreSQL 14 で `pg_stat_database` に追加されたセッション統計に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'session_time や active_time で、接続時間の内訳が分かる',
    'sessions_abandoned や sessions_killed で、異常終了の数が分かる',
    'これらの列は、接続しているセッションごとに1行ずつ表示される',
    'これらの列は PostgreSQL 14 では利用できない',
    'session_time は現在接続中のセッションの経過時間だけを表す'
  ],
  answer: [0, 1],
  exp: 'PostgreSQL 14 で pg_stat_database にセッション関連の列が追加されました。sessions（接続の総数）、session_time（接続していた総時間）、active_time（問い合わせを実行していた時間）、idle_in_transaction_time（トランザクションを開いたまま待機していた時間）などで、接続時間の内訳をデータベース単位で把握できます。\nさらに sessions_abandoned（クライアントとの接続が失われた数）、sessions_fatal（致命的エラーで終了した数）、sessions_killed（管理者の操作で終了させられた数）で、異常終了の傾向も分かります。\npg_stat_database はデータベース単位の集計なので、接続ごとの情報は pg_stat_activity を見ます。',
  refs: [
    ['pg_stat_database', 'monitoring-stats.html#MONITORING-PG-STAT-DATABASE-VIEW']
  ]
},
{
  id: 'G2.1-026', level: 'gold', cat: 'G2.1', type: 'scenario',
  q: '次の pg_stat_activity の結果（一部の列）から読み取れることとして、適切なものを2つ選びなさい。blocked_by 列は `pg_blocking_pids(pid)` の結果である。',
  code: ' pid  | application_name |        state        | wait_event_type |  wait_event   | blocked_by\n------+------------------+---------------------+-----------------+---------------+------------\n 9004 | app_batch        | active              | Timeout         | PgSleep       | {}\n 9012 | app_report       | active              | Lock            | transactionid | {9004}\n 9008 | app_web          | idle in transaction | Client          | ClientRead    | {}',
  choices: [
    'pid 9012 のセッションは、pid 9004 のトランザクションが終わるのを待っている',
    'pid 9008 はトランザクションを開いたまま、クライアントからの次のコマンドを待っている',
    'pid 9004 はロック待ちなので、pid 9012 を pg_cancel_backend() で止めれば進む',
    'pid 9008 は何も実行していないので、ロックを保持していることはない',
    'pid 9012 の state が active なので、CPU を使って処理を進めている'
  ],
  answer: [0, 1],
  exp: 'wait_event_type が Lock、wait_event が transactionid の pid 9012 は、他のトランザクションが更新中の行を待っています。pg_blocking_pids() が {9004} を返しているので、待たせている相手は pid 9004 です。state は active でも、実際にはロック待ちで処理は進んでいません。\npid 9008 は state が idle in transaction で、Client / ClientRead（クライアントからの入力待ち）です。何も実行していなくても、トランザクション内で取得したロック（この例では SELECT ... FOR UPDATE の行ロック）は保持し続けます。\npid 9004 は Timeout / PgSleep で pg_sleep() の実行中です。9004 が 9012 を待たせているので、止めるなら 9004 の方です。\nこの結果は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['3つのセッションの状態（app_batch が更新中、app_report が待ち、app_web はトランザクションを開いたまま）',
      '=# SELECT pid, application_name, state, wait_event_type, wait_event, pg_blocking_pids(pid) AS blocked_by, left(query, 40) AS query FROM pg_stat_activity WHERE datname = \'evid3\' ORDER BY pid;\n  pid  | application_name | state  | wait_event_type |  wait_event   | blocked_by |                  query\n-------+------------------+--------+-----------------+---------------+------------+------------------------------------------\n 77131 | app_batch        | active | Timeout         | PgSleep       | {}         | BEGIN; UPDATE accounts SET balance = bal\n 77135 | app_web          | active | Timeout         | PgSleep       | {}         | BEGIN; SELECT * FROM accounts WHERE id =\n 77136 | app_report       | active | Lock            | transactionid | {77131}    | UPDATE accounts SET balance = balance +\n 77138 | psql             | active |                 |               | {}         | SELECT pid, application_name, state, wai\n(4 rows)'],
    ['待たせている側と待っている側（pg_blocking_pids）とサーバログ',
      '=# SELECT blocked.pid AS blocked_pid, blocking.pid AS blocking_pid, blocked.wait_event_type, blocked.wait_event FROM pg_stat_activity blocked JOIN LATERAL unnest(pg_blocking_pids(blocked.pid)) AS b(pid) ON true JOIN pg_stat_activity blocking ON blocking.pid = b.pid;\n blocked_pid | blocking_pid | wait_event_type |  wait_event\n-------------+--------------+-----------------+---------------\n       77136 |        77131 | Lock            | transactionid\n(1 row)\n\n pg_sleep\n----------\n\n(1 row)\n\n--- サーバログ（log_lock_waits = on、deadlock_timeout = 1s）\n2026-09-21 03:35:29.458 UTC [77136] postgres@evid3 LOG:  process 77136 still waiting for ShareLock on transaction 1100 after 1003.269 ms\n2026-09-21 03:35:51.442 UTC [77136] postgres@evid3 LOG:  process 77136 acquired ShareLock on transaction 1100 after 22988.009 ms']
  ],
  refs: [
    ['pg_stat_activity', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW'],
    ['待機イベント', 'monitoring-stats.html#WAIT-EVENT-TABLE'],
    ['セッション情報関数', 'functions-info.html#FUNCTIONS-INFO-SESSION-TABLE']
  ]
},
{
  id: 'G2.1-027', level: 'gold', cat: 'G2.1', type: 'scenario',
  q: 'テーブル accounts を複数のセッションが同時に参照・更新している状態で、pg_locks を確認した結果（一部の列）が次のとおりである。ロックの獲得を待っているものについての説明として、正しいものを1つ選びなさい。',
  code: ' pid  |   locktype    |   relation    | transactionid |       mode       | granted\n------+---------------+---------------+---------------+------------------+---------\n 9004 | relation      | accounts_pkey |               | RowExclusiveLock | t\n 9004 | relation      | accounts      |               | RowExclusiveLock | t\n 9004 | transactionid |               |           758 | ExclusiveLock    | t\n 9008 | relation      | accounts_pkey |               | RowShareLock     | t\n 9008 | relation      | accounts      |               | RowShareLock     | t\n 9008 | transactionid |               |           759 | ExclusiveLock    | t\n 9012 | relation      | accounts_pkey |               | RowExclusiveLock | t\n 9012 | relation      | accounts      |               | RowExclusiveLock | t\n 9012 | transactionid |               |           758 | ShareLock        | f\n 9012 | transactionid |               |           760 | ExclusiveLock    | t\n 9012 | tuple         | accounts      |               | ExclusiveLock    | t',
  choices: [
    'pid 9012 が、pid 9004 のトランザクション（ID 758）の終了を待つ ShareLock を獲得できずにいる',
    'pid 9004 が、pid 9012 の accounts テーブルに対する RowExclusiveLock の解放を待っている',
    'pid 9008 が RowShareLock を獲得できず、accounts テーブルへのアクセスを待っている',
    'pid 9012 は tuple ロックを獲得できずに待っている',
    'granted が t の行が含まれているので、ロックの待ちは発生していない'
  ],
  answer: 0,
  exp: '待ちを探すには granted が f（false）の行を見ます。この結果では pid 9012 の「transactionid 758 / ShareLock」だけが f です。\n各トランザクションは自分のトランザクション ID に対する ExclusiveLock を保持しており、pid 9004 が 758 を持っています。行を更新しようとして、その行が別のトランザクションに更新されている場合、PostgreSQL は相手のトランザクション ID に対する ShareLock を要求し、相手の終了（コミットかロールバック）を待ちます。\npid 9012 の tuple ロックは granted = t で、これは「その行を次に更新する順番」を確保していることを表します。\nテーブルに対する RowExclusiveLock や RowShareLock は互いに競合しないため、すべて獲得できています。',
  evidence: [
    ['同じ状況での pg_locks（granted = f が待っているロック）',
      '=# SELECT pid, locktype, relation::regclass AS relation, transactionid, mode, granted FROM pg_locks WHERE relation::regclass::text IN (\'accounts\',\'accounts_pkey\') OR locktype IN (\'transactionid\',\'tuple\') ORDER BY pid, locktype;\n  pid  |   locktype    |   relation    | transactionid |       mode       | granted\n-------+---------------+---------------+---------------+------------------+---------\n 77131 | relation      | accounts      |               | RowExclusiveLock | t\n 77131 | relation      | accounts_pkey |               | RowExclusiveLock | t\n 77131 | transactionid |               |          1100 | ExclusiveLock    | t\n 77135 | relation      | accounts_pkey |               | AccessShareLock  | t\n 77135 | relation      | accounts      |               | AccessShareLock  | t\n 77136 | relation      | accounts      |               | RowExclusiveLock | t\n 77136 | relation      | accounts_pkey |               | RowExclusiveLock | t\n 77136 | transactionid |               |          1100 | ShareLock        | f\n 77136 | transactionid |               |          1102 | ExclusiveLock    | t\n 77136 | tuple         | accounts      |               | ExclusiveLock    | t\n(10 rows)'],
    ['どのセッションが誰を待っているか（pg_blocking_pids）とサーバログ',
      '=# SELECT blocked.pid AS blocked_pid, blocking.pid AS blocking_pid, blocked.wait_event_type, blocked.wait_event FROM pg_stat_activity blocked JOIN LATERAL unnest(pg_blocking_pids(blocked.pid)) AS b(pid) ON true JOIN pg_stat_activity blocking ON blocking.pid = b.pid;\n blocked_pid | blocking_pid | wait_event_type |  wait_event\n-------------+--------------+-----------------+---------------\n       77136 |        77131 | Lock            | transactionid\n(1 row)\n\n pg_sleep\n----------\n\n(1 row)\n\n--- サーバログ（log_lock_waits = on、deadlock_timeout = 1s）\n2026-09-21 03:35:29.458 UTC [77136] postgres@evid3 LOG:  process 77136 still waiting for ShareLock on transaction 1100 after 1003.269 ms\n2026-09-21 03:35:51.442 UTC [77136] postgres@evid3 LOG:  process 77136 acquired ShareLock on transaction 1100 after 22988.009 ms']
  ],
  refs: [
    ['pg_locks', 'view-pg-locks.html'],
    ['明示的ロック', 'explicit-locking.html']
  ]
},
{
  id: 'G2.1-028', level: 'gold', cat: 'G2.1', type: 'scenario',
  q: 'サーバログに次の出力があった（log_line_prefix の部分は省略）。読み取れることとして、正しいものを1つ選びなさい。',
  code: 'LOG:  process 9012 still waiting for ShareLock on transaction 758 after 1002.805 ms\nDETAIL:  Process holding the lock: 9004. Wait queue: 9012.\nCONTEXT:  while updating tuple (0,1) in relation "accounts"\nLOG:  process 9012 acquired ShareLock on transaction 758 after 17997.652 ms\nCONTEXT:  while updating tuple (0,1) in relation "accounts"',
  choices: [
    'log_lock_waits が有効で、deadlock_timeout を超えた待ちが記録され、約18秒後にロックを獲得した',
    '1秒でデッドロックが検出され、プロセス 9012 のトランザクションが中止された',
    'lock_timeout により、1秒後にプロセス 9012 の UPDATE がエラーになった',
    'プロセス 9004 が、プロセス 9012 のトランザクションの完了を待っていた',
    'テーブル accounts 全体に対する排他ロックを待っていたことを示している'
  ],
  answer: 0,
  exp: 'log_lock_waits = on のとき、deadlock_timeout（この環境では 1s）を超えてロックを待ったプロセスが「still waiting for ...」として記録されます。デッドロック検査のタイミングで記録されるため、1秒を少し過ぎた時点になっています。DETAIL で、ロックを保持しているのがプロセス 9004 であること、待ち行列が 9012 であることが分かります。\nその後「acquired ... after 17997.652 ms」で、約18秒待ってロックを獲得したことが記録されています。エラーにはなっていません。\n待っている対象は「トランザクション 758 の終了」で、CONTEXT から accounts テーブルの行 (0,1) を更新しようとしていたことが分かります。テーブル全体のロックではありません。\nこのログは PostgreSQL 14 で実際に出力されたものです。',
  evidence: [
    ['ログが出たときのセッションの状態とロック',
      '=# SELECT pid, application_name, state, wait_event_type, wait_event, pg_blocking_pids(pid) AS blocked_by, left(query, 40) AS query FROM pg_stat_activity WHERE datname = \'evid3\' ORDER BY pid;\n  pid  | application_name | state  | wait_event_type |  wait_event   | blocked_by |                  query\n-------+------------------+--------+-----------------+---------------+------------+------------------------------------------\n 77131 | app_batch        | active | Timeout         | PgSleep       | {}         | BEGIN; UPDATE accounts SET balance = bal\n 77135 | app_web          | active | Timeout         | PgSleep       | {}         | BEGIN; SELECT * FROM accounts WHERE id =\n 77136 | app_report       | active | Lock            | transactionid | {77131}    | UPDATE accounts SET balance = balance +\n 77138 | psql             | active |                 |               | {}         | SELECT pid, application_name, state, wai\n(4 rows)\n\n=# SELECT pid, locktype, relation::regclass AS relation, transactionid, mode, granted FROM pg_locks WHERE relation::regclass::text IN (\'accounts\',\'accounts_pkey\') OR locktype IN (\'transactionid\',\'tuple\') ORDER BY pid, locktype;\n  pid  |   locktype    |   relation    | transactionid |       mode       | granted\n-------+---------------+---------------+---------------+------------------+---------\n 77131 | relation      | accounts      |               | RowExclusiveLock | t\n 77131 | relation      | accounts_pkey |               | RowExclusiveLock | t\n 77131 | transactionid |               |          1100 | ExclusiveLock    | t\n 77135 | relation      | accounts_pkey |               | AccessShareLock  | t\n 77135 | relation      | accounts      |               | AccessShareLock  | t\n 77136 | relation      | accounts      |               | RowExclusiveLock | t\n 77136 | relation      | accounts_pkey |               | RowExclusiveLock | t\n 77136 | transactionid |               |          1100 | ShareLock        | f\n 77136 | transactionid |               |          1102 | ExclusiveLock    | t\n 77136 | tuple         | accounts      |               | ExclusiveLock    | t\n(10 rows)'],
    ['サーバログ（log_lock_waits = on、deadlock_timeout = 1s）',
      '--- サーバログ（log_lock_waits = on、deadlock_timeout = 1s）\n2026-09-21 03:35:29.458 UTC [77136] postgres@evid3 LOG:  process 77136 still waiting for ShareLock on transaction 1100 after 1003.269 ms\n2026-09-21 03:35:51.442 UTC [77136] postgres@evid3 LOG:  process 77136 acquired ShareLock on transaction 1100 after 22988.009 ms']
  ],
  refs: [
    ['log_lock_waits', 'runtime-config-logging.html#GUC-LOG-LOCK-WAITS'],
    ['deadlock_timeout', 'runtime-config-locks.html#GUC-DEADLOCK-TIMEOUT']
  ]
},
{
  id: 'G2.1-029', level: 'gold', cat: 'G2.1', type: 'scenario',
  q: '次の結果から読み取れることとして、正しいものを1つ選びなさい。',
  code: '=# SELECT datname, deadlocks, temp_files,\n          pg_size_pretty(temp_bytes) AS temp_bytes, conflicts\n     FROM pg_stat_database WHERE datname = \'shop\';\n datname | deadlocks | temp_files | temp_bytes | conflicts\n---------+-----------+------------+------------+-----------\n shop    |         1 |         12 | 33 MB      |         0',
  choices: [
    '統計のリセット以降、shop ではデッドロックが1回発生し、一時ファイルが合計 33 MB 作られた',
    '一時ファイルが 12 個、現在もディスク上に残って 33 MB を占有している',
    'conflicts が 0 なので、デッドロックは実際には発生していない',
    'temp_bytes は、共有バッファに載りきらなかったテーブルのデータ量を表す',
    'これらの値はサーバを停止・起動するたびに、必ず 0 に戻る'
  ],
  answer: 0,
  exp: 'pg_stat_database の deadlocks、temp_files、temp_bytes は累積値で、統計がリセットされてからの合計です。一時ファイルは処理が終われば削除されるので、今ディスクに残っている量ではありません。\ntemp_files / temp_bytes は、ソートやハッシュが work_mem に収まらずに作られた一時ファイルの数と量です。値が大きい場合は、log_temp_files で原因の問い合わせを特定し、work_mem の調整を検討します。\nconflicts はスタンバイでリカバリ競合によって取り消された問い合わせの数で、デッドロックとは関係ありません（プライマリでは常に 0 です）。\n累積統計は、正常に停止・起動した場合は保持されます（クラッシュ時や pg_stat_reset() でリセットされます）。',
  evidence: [
    ['デッドロックを1件起こし、work_mem を小さくしてソートしたあとの pg_stat_database',
      'ERROR:  deadlock detected\nDETAIL:  Process 77158 waits for ShareLock on transaction 1103; blocked by process 77155.\nHINT:  See server log for query details.\n=# SELECT datname, deadlocks, temp_files, pg_size_pretty(temp_bytes) AS temp_bytes, conflicts FROM pg_stat_database WHERE datname = \'evid3\';\n datname | deadlocks | temp_files | temp_bytes | conflicts\n---------+-----------+------------+------------+-----------\n evid3   |         1 |          3 | 7704 kB    |         0\n(1 row)\n\n--- サーバログ（log_temp_files = 0 相当）\n2026-09-21 03:35:56.796 UTC [77169] postgres@evid3 LOG:  temporary file: path "base/pgsql_tmp/pgsql_tmp77169.0", size 2629632\n2026-09-21 03:35:56.918 UTC [77175] postgres@evid3 LOG:  temporary file: path "base/pgsql_tmp/pgsql_tmp77175.0", size 2629632']
  ],
  refs: [
    ['pg_stat_database', 'monitoring-stats.html#MONITORING-PG-STAT-DATABASE-VIEW'],
    ['log_temp_files', 'runtime-config-logging.html#GUC-LOG-TEMP-FILES']
  ]
},
{
  id: 'G2.1-030', level: 'gold', cat: 'G2.1', type: 'scenario',
  q: 'psql で接続して次の問い合わせを実行した。結果の説明として正しいものを1つ選びなさい。',
  code: '=# SELECT pid, backend_type, state, wait_event_type, wait_event\n     FROM pg_stat_activity ORDER BY backend_type;\n  pid  |         backend_type         | state  | wait_event_type |     wait_event\n-------+------------------------------+--------+-----------------+---------------------\n 17424 | autovacuum launcher          |        | Activity        | AutoVacuumMain\n 17422 | background writer            |        | Activity        | BgWriterMain\n 17421 | checkpointer                 |        | Activity        | CheckpointerMain\n 17428 | client backend               | active |                 |\n 17426 | logical replication launcher |        | Activity        | LogicalLauncherMain\n 17423 | walwriter                    |        | Activity        | WalWriterMain',
  choices: [
    'クライアント接続は自分自身の1つだけで、他の行はサーバの補助プロセスである',
    '6つのクライアントが接続しており、そのうち5つがロックを待っている',
    'wait_event_type が Activity のプロセスは、ロックの獲得を待っている',
    'walwriter が表示されているので、このサーバはスタンバイである',
    'archiver が表示されていないので、WAL アーカイブが失敗している'
  ],
  answer: 0,
  exp: 'pg_stat_activity にはクライアント接続（backend_type = client backend）だけでなく、checkpointer、background writer、walwriter、autovacuum launcher などの補助プロセスも表示されます。この結果のクライアント接続は、問い合わせを実行している自分自身だけです。\nwait_event_type の Activity は、補助プロセスが仕事を待ってメインループで待機していることを表し、ロック待ち（Lock）ではありません。\nwalwriter はプライマリで WAL を書き出すプロセスです（スタンバイでは startup や walreceiver が現れます）。\narchiver は archive_mode = on のときだけ起動するため、アーカイブを使っていなければ表示されないのが正常です。\nこの結果は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['pg_stat_activity に見えるプロセス',
      '=# SELECT pid, backend_type, state, wait_event_type, wait_event FROM pg_stat_activity ORDER BY backend_type;\n  pid  |         backend_type         | state  | wait_event_type |     wait_event\n-------+------------------------------+--------+-----------------+---------------------\n 43599 | autovacuum launcher          |        | Activity        | AutoVacuumMain\n 43597 | background writer            |        | Activity        | BgWriterHibernate\n 43596 | checkpointer                 |        | Activity        | CheckpointerMain\n 77183 | client backend               | active |                 |\n 43601 | logical replication launcher |        | Activity        | LogicalLauncherMain\n 43598 | walwriter                    |        | Activity        | WalWriterMain\n(6 rows)']
  ],
  refs: [
    ['pg_stat_activity', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW'],
    ['待機イベント', 'monitoring-stats.html#WAIT-EVENT-TABLE']
  ]
},

/* ---------------- G2.2 テーブル/カラム統計情報（重要度 2 / 17問） ---------------- */
{
  id: 'G2.2-001', level: 'gold', cat: 'G2.2',
  q: 'プランナが使用する統計情報に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_class の reltuples と relpages は、行が挿入・削除されるたびに即座に正確な値に更新される',
    'pg_class の reltuples と relpages は推定値であり、VACUUM、ANALYZE、CREATE INDEX などで更新される',
    'pg_stats ビューでは、一般ユーザもアクセス権限のないテーブルを含むすべての列の統計を参照できる',
    'pg_stats の n_distinct が負の値の場合、統計情報が破損していることを示す',
    'pg_stats の most_common_vals には、常に列の全ての値が格納される'
  ],
  answer: 1,
  exp: 'pg_class の reltuples（行数）と relpages（ページ数）はプランナ用の推定値で、VACUUM、ANALYZE、CREATE INDEX などの一部の DDL で更新されます。プランナはこれを実際のファイルサイズに合わせて補正して利用します。\npg_stats ビューは pg_statistic を見やすくしたもので、ユーザが読み取り権限を持つ列の統計だけが表示されます。\nn_distinct が正の値は推定した異なり値の数、負の値は「異なり値の数 ÷ 行数」に -1 を掛けた値で、行数に比例して異なり値が増えると推定される場合に使われます。\nmost_common_vals は最頻値のリストで、要素数は統計目標（default_statistics_target など）で制限されます。',
  refs: [
    ['プランナで使用される統計情報', 'planner-stats.html'],
    ['pg_class', 'catalog-pg-class.html'],
    ['pg_stats', 'view-pg-stats.html']
  ]
},
{
  id: 'G2.2-002', level: 'gold', cat: 'G2.2',
  q: '`CREATE STATISTICS` で作成する拡張統計に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '作成した時点で統計情報が即座に収集される',
    '指定できる統計の種類は ndistinct のみである',
    '作成した拡張統計の内容は pg_stats ビューで確認する',
    '拡張統計のデータは、次に ANALYZE が実行されたときに収集される',
    '拡張統計は単一の列の相関を扱うためのもので、複数列は指定できない'
  ],
  answer: 3,
  exp: 'CREATE STATISTICS は複数列間の関数従属性（dependencies）、複数列の組み合わせの異なり値の数（ndistinct）、複数列の最頻値リスト（mcv）といった拡張統計オブジェクトを定義します。PostgreSQL 14 では式に対する統計も作成できます。\n定義しただけではデータは収集されず、次回の ANALYZE（手動または自動バキューム経由）で収集されます。\n収集された内容は pg_stats_ext / pg_stats_ext_exprs ビューで確認できます。',
  refs: [
    ['CREATE STATISTICS', 'sql-createstatistics.html'],
    ['拡張統計', 'planner-stats.html#PLANNER-STATS-EXTENDED']
  ]
},
{
  id: 'G2.2-003', level: 'gold', cat: 'G2.2',
  q: 'TOAST に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'integer や timestamp などの固定長のデータ型も、TOAST の対象になる',
    'TOAST を使っても、1つのフィールドに格納できる値は最大 10MB までである',
    '大きなフィールド値は、圧縮や別の TOAST テーブルへの行外格納によって格納される。行がおよそ 2kB を超えるとこの処理が行われる',
    '列ごとの TOAST の格納戦略（PLAIN、EXTENDED など）は変更できない',
    'PostgreSQL 14 で選択できる TOAST の圧縮方式は pglz だけである'
  ],
  answer: 2,
  exp: 'PostgreSQL のページサイズは通常 8kB で、1つの行を複数ページにまたがって格納できないため、大きなフィールド値は TOAST（The Oversized-Attribute Storage Technique）によって圧縮されたり、TOAST テーブルに分割して行外格納されたりします。行の大きさが TOAST_TUPLE_THRESHOLD（通常 2kB）を超えると処理が行われます。\n対象は text、bytea、jsonb などの可変長（varlena）型だけで、1つの値は最大 1GB です。\n列ごとの格納戦略（PLAIN、EXTENDED、EXTERNAL、MAIN）は ALTER TABLE ... ALTER COLUMN ... SET STORAGE で変更できます。PostgreSQL 14 では、lz4 を有効にしてビルドされていれば、default_toast_compression や列の COMPRESSION で pglz と lz4 を選択できます。',
  refs: [
    ['TOAST', 'storage-toast.html'],
    ['default_toast_compression', 'runtime-config-client.html#GUC-DEFAULT-TOAST-COMPRESSION']
  ]
},
{
  id: 'G2.2-004', level: 'gold', cat: 'G2.2',
  q: 'テーブル orders の実データが格納されているファイルのパス（データディレクトリからの相対パス）を取得する関数として、正しいものを1つ選びなさい。',
  choices: [
    'pg_relation_filepath(\'orders\')',
    'pg_relation_filenode(\'orders\')',
    'pg_tablespace_location(\'orders\')',
    'pg_ls_dir(\'orders\')',
    'pg_table_size(\'orders\')'
  ],
  answer: 0,
  exp: 'pg_relation_filepath() は、リレーションのファイルのパスを、データディレクトリからの相対パス（例: base/16384/16390）で返します。\npg_relation_filenode() はファイルノード番号だけを返します（通常は pg_class.relfilenode と同じですが、一部のシステムカタログではマップされた値になります）。\npg_tablespace_location() はテーブルスペースの OID を受け取ってその場所を返す関数、pg_ls_dir() はディレクトリ内のファイル名の一覧を返す関数、pg_table_size() はテーブルのサイズを返す関数です。',
  refs: [
    ['データベースオブジェクトの格納場所関数', 'functions-admin.html#FUNCTIONS-ADMIN-DBLOCATION'],
    ['データベースファイルのレイアウト', 'storage-file-layout.html']
  ]
},
{
  id: 'G2.2-005', level: 'gold', cat: 'G2.2',
  q: '`ALTER TABLE orders ALTER COLUMN status SET STATISTICS 500;` を実行した場合の説明として、正しいものを1つ選びなさい。',
  choices: [
    '実行した時点で、その列の統計情報が即座に再収集される',
    'その列の統計目標が 500 になり、次回の ANALYZE から最頻値リストやヒストグラムの要素数の上限が変わる',
    '統計目標の上限は default_statistics_target の既定値と同じ 100 であり、500 は指定できない',
    '統計目標を大きくすると、実行計画の作成にかかる時間は短くなる',
    'SET STATISTICS -1 を指定すると、その列の統計情報は収集されなくなる'
  ],
  answer: 1,
  exp: 'ALTER TABLE ... ALTER COLUMN ... SET STATISTICS は、列ごとの統計目標（0〜10000）を設定します。統計目標は最頻値（most_common_vals）やヒストグラムの要素数の上限、ANALYZE でサンプリングする行数に影響し、次回の ANALYZE から反映されます。\n値の分布が偏った列で推定行数がずれる場合に大きくすると効果がありますが、ANALYZE の時間、pg_statistic の容量、計画作成時間は増えます。\n-1 を指定すると、システムの既定値 default_statistics_target（既定 100）を使う設定に戻ります。',
  refs: [
    ['ALTER TABLE（SET STATISTICS）', 'sql-altertable.html'],
    ['default_statistics_target', 'runtime-config-query.html#GUC-DEFAULT-STATISTICS-TARGET'],
    ['プランナで使用される統計情報', 'planner-stats.html']
  ]
},
{
  id: 'G2.2-006', level: 'gold', cat: 'G2.2',
  q: '`pg_stats` ビューの列に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'correlation が 1 または -1 に近いほど、行の物理的な並び順と列の値の順序の相関が強い',
    'correlation が -1 の場合は、物理的な並び順と値の順序にまったく相関がないことを示す',
    'null_frac は、列の値が重複している割合を表す',
    'avg_width は、テーブルの平均行数を表す',
    'histogram_bounds には、most_common_vals に含まれる値も含めて全体の分布が格納される'
  ],
  answer: 0,
  exp: 'correlation は、行の物理的な格納順序と列の値の論理的な順序の統計的な相関で、-1 から +1 の値をとります。+1 または -1 に近い場合（逆順に並んでいる場合を含む）はディスク上の並びと値の順序がそろっているため、インデックスによる範囲スキャンのランダムアクセスが少ないと見積もられます。0 に近いと相関がありません。\nnull_frac は NULL の割合、avg_width は列の値の平均バイト幅、n_distinct は異なり値の数です。histogram_bounds は、most_common_vals に含まれる値を除いた残りの値の分布を表します。',
  refs: [
    ['pg_stats', 'view-pg-stats.html'],
    ['プランナで使用される統計情報', 'planner-stats.html']
  ]
},
{
  id: 'G2.2-007', level: 'gold', cat: 'G2.2', type: 'scenario',
  q: '住所テーブルで `WHERE city = \'X\' AND zip = \'123\'` の推定行数が実際より大幅に少なく見積もられている。city と zip には強い関数従属がある。有効な対策として、最も適切なものを1つ選びなさい。',
  choices: [
    'random_page_cost を小さくして、インデックススキャンが選ばれやすくする',
    'VACUUM FULL を実行して、テーブルを書き直す',
    'city と zip の dependencies 拡張統計を CREATE STATISTICS で作成し、ANALYZE する',
    'enable_seqscan を off にして、プランナの推定行数を補正する',
    'city と zip のそれぞれに、別々の B-tree インデックスを作成して推定を改善する'
  ],
  answer: 2,
  exp: 'プランナは既定では各列の条件を独立とみなし、それぞれの選択率を掛け合わせて行数を推定します。city が決まれば zip もほぼ決まるような関数従属がある場合、この仮定により推定行数が過小になり、不適切な実行計画（Nested Loop の多用など）の原因になります。\nCREATE STATISTICS s1 (dependencies) ON city, zip FROM addr; で列間の関数従属性の拡張統計を作成し、ANALYZE を実行すると、推定に反映されます。\nコスト定数の変更やインデックスの作成、VACUUM FULL は、推定行数の誤りそのものは解消しません。',
  evidence: [
    ['拡張統計を作る前後の見積もり（pref と city は1対1に対応する）',
      '=# EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM customers WHERE pref = \'P10\' AND city = \'C10-1\';\n                                       QUERY PLAN\n----------------------------------------------------------------------------------------\n Seq Scan on customers  (cost=0.00..2041.00 rows=14 width=12) (actual rows=710 loops=1)\n   Filter: ((pref = \'P10\'::text) AND (city = \'C10-1\'::text))\n   Rows Removed by Filter: 99290\n(3 rows)\n\n=# CREATE STATISTICS customers_pref_city (dependencies) ON pref, city FROM customers;\nCREATE STATISTICS\n=# SELECT statistics_name, attnames, kinds, dependencies FROM pg_stats_ext WHERE statistics_name = \'customers_pref_city\';\n   statistics_name   |  attnames   | kinds |     dependencies\n---------------------+-------------+-------+----------------------\n customers_pref_city | {pref,city} | {f}   | {"3 => 2": 1.000000}\n(1 row)\n\n=# EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM customers WHERE pref = \'P10\' AND city = \'C10-1\';\n                                       QUERY PLAN\n-----------------------------------------------------------------------------------------\n Seq Scan on customers  (cost=0.00..2041.00 rows=705 width=12) (actual rows=710 loops=1)\n   Filter: ((pref = \'P10\'::text) AND (city = \'C10-1\'::text))\n   Rows Removed by Filter: 99290\n(3 rows)']
  ],
  refs: [
    ['拡張統計', 'planner-stats.html#PLANNER-STATS-EXTENDED'],
    ['CREATE STATISTICS', 'sql-createstatistics.html']
  ]
},
{
  id: 'G2.2-008', level: 'gold', cat: 'G2.2',
  q: 'pg_class の relpages 列と reltuples 列に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'VACUUM や ANALYZE、CREATE INDEX などの実行時に更新され、常に最新の値とは限らない',
    'INSERT や DELETE のたびに更新されるため、常に実際の値と一致している',
    'プランナはこれらの値をそのまま使い、現在のファイルサイズは参照しない',
    'relpages は行数、reltuples はページ数を表す',
    'これらの値はビューやシーケンスに対しても、テーブルと同じように維持される'
  ],
  answer: 0,
  exp: 'pg_class.relpages（ディスクページ数）と reltuples（推定行数）は、VACUUM、ANALYZE、CREATE INDEX などの実行時に更新されます。通常の DML では更新されないため、実際の値とずれることがあります。\nプランナはこの2つの比率を「1ページあたりの行密度」として使い、実際の現在のファイルサイズと掛け合わせて行数を推定します。このため、サイズが変化してもある程度は追随します。\nreltuples が -1 の場合は「まだ一度も解析されていない」ことを意味します（PostgreSQL 14 での変更点）。\nビューやシーケンスには実データがないため、意味のある値は入りません。',
  refs: [
    ['プランナで使用される統計情報', 'planner-stats.html'],
    ['pg_class', 'catalog-pg-class.html']
  ]
},
{
  id: 'G2.2-009', level: 'gold', cat: 'G2.2',
  q: '列の格納方式（storage）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'EXTENDED は圧縮と行外（TOAST）への退避の両方を許可し、可変長型の多くで既定値になっている',
    'EXTERNAL は圧縮のみを許可し、行外への退避は行わない設定である',
    'MAIN は必ず行外へ退避する設定であり、TOAST テーブルが必須になる',
    'PLAIN は圧縮のみを禁止する設定で、行外への退避は行われる',
    '格納方式は列ごとに設定できず、テーブル単位でのみ変更できる'
  ],
  answer: 0,
  exp: '格納方式は ALTER TABLE ... ALTER COLUMN ... SET STORAGE で列ごとに設定でき、4種類あります。\nPLAIN は圧縮も行外退避も行わず、固定長型で使われます。\nEXTENDED は圧縮と行外退避の両方を許可し、TOAST 可能な型の既定値です。\nEXTERNAL は行外退避は行うが圧縮しない設定で、部分参照（substring など）が速くなります。\nMAIN は圧縮を行い、行外退避は他に手段がない場合の最後の手段とします。\n選択肢の EXTERNAL と MAIN の説明は、それぞれ入れ替わっています。',
  refs: [
    ['TOAST', 'storage-toast.html'],
    ['ALTER TABLE', 'sql-altertable.html']
  ]
},
{
  id: 'G2.2-010', level: 'gold', cat: 'G2.2', type: 'scenario',
  q: 'pg_stats ビューの n_distinct 列が -0.5 となっていた。この値の意味として、正しいものを1つ選びなさい。',
  choices: [
    '個別値の数がテーブルの行数の 0.5 倍と推定されている（行数に比例する）',
    '個別値の数が 0.5 個と推定されている',
    '個別値の数が全体の 50 パーセンタイルに位置している',
    '個別値の推定に失敗し、統計が取得できていないことを示す',
    'その列の 50% が NULL であることを示す'
  ],
  answer: 0,
  exp: 'pg_stats.n_distinct は、正の値ならその列の個別値の数そのものを、負の値なら行数に対する比率（の符号を反転したもの）を表します。-0.5 は「個別値の数が行数の 0.5 倍」、-1 は「すべての行が異なる値（一意）」という意味です。テーブルが大きくなるにつれて個別値も増える列では、負の形式が適しています。\nn_distinct は ALTER TABLE ... ALTER COLUMN ... SET (n_distinct = ...) で手動指定することもできます。\nNULL の割合は null_frac 列で表されます。',
  evidence: [
    ['行数の半分の種類の値を入れた列の n_distinct',
      '=# SELECT attname, n_distinct FROM pg_stats WHERE tablename = \'half\';\n attname | n_distinct\n---------+------------\n id      |   -0.49883\n(1 row)\n\n=# SELECT count(*) AS rows, count(DISTINCT id) AS distinct_values FROM half;\n  rows  | distinct_values\n--------+-----------------\n 100000 |           50001\n(1 row)']
  ],
  refs: [
    ['pg_stats', 'view-pg-stats.html'],
    ['プランナで使用される統計情報', 'planner-stats.html']
  ]
},
{
  id: 'G2.2-011', level: 'gold', cat: 'G2.2',
  q: '`ANALYZE` が行う統計情報の収集方法に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'テーブル全体ではなく無作為に抽出した行を標本として使うため、大きなテーブルでも短時間で終わる',
    'テーブルの全行を読み取って統計を作るため、大きなテーブルでは VACUUM FULL と同程度の時間がかかる',
    'ANALYZE はテーブルに対して排他ロックを取得するため、実行中は参照もできない',
    'ANALYZE で収集された統計は pg_class にのみ格納され、pg_statistic は使われない',
    'ANALYZE は式インデックスの統計を収集しないため、式インデックスは常に非効率になる'
  ],
  answer: 0,
  exp: 'ANALYZE は無作為抽出した標本行から統計を作ります。標本の大きさは統計目標（既定 100）に比例し、おおよそ「統計目標 × 300 行」が読み込まれます。このため巨大なテーブルでも実行時間はさほど増えません。\n標本に基づく推定なので、値の分布が偏っている場合は誤差が出ることがあり、そのときは統計目標を上げます。\nANALYZE が取得するのは読み書きを妨げない弱いロックです。\n収集結果は pg_statistic（参照用のビューは pg_stats）に格納され、行数とページ数は pg_class にも反映されます。式インデックスの統計も収集されます。',
  refs: [
    ['ANALYZE', 'sql-analyze.html'],
    ['プランナで使用される統計情報', 'planner-stats.html']
  ]
},
{
  id: 'G2.2-012', level: 'gold', cat: 'G2.2',
  q: 'contrib モジュール `pgstattuple` に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'テーブルを実際に走査して、不要タプルの数や空き領域の割合を返す',
    '既定では実行にスーパーユーザまたは相応の権限が必要である',
    'pg_class の統計値を読むだけなので、大きなテーブルでも即座に結果が返る',
    'テーブルに対して ACCESS EXCLUSIVE ロックを獲得する',
    '不要領域を検出すると同時に回収も行う'
  ],
  answer: [0, 1],
  exp: 'pgstattuple はテーブルやインデックスを実際に全走査して、タプル数、有効・無効タプルの長さ、空き領域（free_space）、無効タプルの割合（dead_tuple_percent）などを返します。肥大化の度合いを正確に把握するのに使いますが、走査するため大きなテーブルでは時間がかかります。概算でよければ pgstattuple_approx が使えます。\n実行にはスーパーユーザ、または pg_stat_scan_tables ロールなどの権限が必要です。\n取得するのは読み取りを妨げない弱いロックで、領域の回収は行いません。回収するには VACUUM や VACUUM FULL を実行します。',
  refs: [
    ['pgstattuple', 'pgstattuple.html'],
    ['定常的なバキューム作業', 'routine-vacuuming.html']
  ]
},
{
  id: 'G2.2-013', level: 'gold', cat: 'G2.2',
  q: '`CREATE STATISTICS` で作成できる拡張統計の種類として、適切なものを3つ選びなさい。',
  choices: [
    'ndistinct（複数列の組み合わせの個別値数）',
    'dependencies（列間の関数従属性）',
    'mcv（複数列の最頻値のリスト）',
    'histogram（複数列のヒストグラム）',
    'correlation（複数列の物理的な相関）'
  ],
  answer: [0, 1, 2],
  exp: 'PostgreSQL 14 の拡張統計には、ndistinct（複数列をまとめたときの個別値の数）、dependencies（ある列の値から別の列の値が決まるという関数従属性）、mcv（複数列の組み合わせの最頻値リスト）の3種類があります。種類を省略すると3つすべてが作成されます。\nこれらは「都道府県と市区町村」のように相関のある列を条件にしたとき、プランナが行数を過小に見積もる問題を緩和します。\n作成後は ANALYZE が必要で、結果は pg_stats_ext ビューで確認できます。\n単一列のヒストグラムや物理的な相関（correlation）は通常の統計として pg_stats に格納されるもので、拡張統計の種類ではありません。',
  refs: [
    ['拡張統計情報', 'planner-stats.html#PLANNER-STATS-EXTENDED'],
    ['CREATE STATISTICS', 'sql-createstatistics.html']
  ]
},
{
  id: 'G2.2-014', level: 'gold', cat: 'G2.2',
  q: '`pg_statistic` と `pg_stats` に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'pg_statistic は誰でも参照できるように公開されている',
    'pg_stats は pg_statistic をわかりやすく整形したビューである',
    'pg_stats は、参照している利用者が読める行だけを表示する',
    '統計は ANALYZE（自動 ANALYZE を含む）によって更新される',
    'pg_stats の null_frac 列は、その列が NULL である行の割合を表す'
  ],
  answer: 0,
  exp: 'pg_statistic はテーブルの実際の値（最頻値など）を含むため、内容から元データを推測できてしまいます。そのため一般の利用者は参照できず、スーパーユーザに限定されています。この点が誤りです。\npg_stats はこれを人間が読みやすい形に整え、かつ「その利用者が読めるテーブルの行だけ」を表示するビューなので、一般の利用者も安全に参照できます。\nnull_frac（NULL の割合）、n_distinct（個別値の数）、most_common_vals（最頻値）、histogram_bounds（ヒストグラム）、correlation（物理的な並びとの相関）などの列があります。',
  refs: [
    ['プランナで使用される統計情報', 'planner-stats.html'],
    ['pg_stats', 'view-pg-stats.html']
  ]
},
{
  id: 'G2.2-015', level: 'gold', cat: 'G2.2', type: 'scenario',
  q: 'orders テーブルの pg_stats を確認した結果（一部の列）が次のとおりである。読み取れることとして、適切なものを2つ選びなさい。',
  code: '   attname   | null_frac | n_distinct |  correlation\n-------------+-----------+------------+---------------\n id          |         0 |         -1 |             1\n customer_id |         0 |   -0.25865 | -0.0068555996\n status      |         0 |          2 |     0.9796822\n created_at  |         0 |         -1 |             1\n note        |         1 |          0 |',
  choices: [
    'id と created_at はすべての行で値が異なり、物理的な並び順と値の順序がほぼ一致している',
    'note 列はすべての行が NULL である',
    'customer_id の個別値は、およそ 0.26 個と推定されている',
    'status は 2 種類の値しかなく、物理的な並び順との相関はほとんどない',
    'customer_id の correlation が 0 に近いので、この列のインデックスはまったく使われない'
  ],
  answer: [0, 1],
  exp: 'n_distinct が -1 は「すべての行で値が異なる（行数と同じだけ個別値がある）」、負の値は行数に対する割合を表します。customer_id の -0.25865 は、個別値が行数の約 26% と推定されていることを意味します。\ncorrelation は、物理的な格納順と列の値の順序の相関で、1 に近いほど揃っています。連番で挿入した id と created_at は 1 です。status も 0.98 と高い値です。correlation が 1 に近い列は、範囲検索でインデックススキャンのランダムアクセスが少なくて済むため、プランナがインデックスを選びやすくなります。0 に近くても、選択率が低ければインデックスは使われます。\nnull_frac の 1 は、すべての行が NULL であることを表します。\nこの結果は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['pg_stats と、実際のテーブルの内容',
      '=# SELECT attname, null_frac, n_distinct, correlation FROM pg_stats WHERE tablename = \'orders\' ORDER BY attname;\n   attname   | null_frac | n_distinct | correlation\n-------------+-----------+------------+--------------\n amount      |         0 |        500 | 0.0069992375\n created_at  |         0 |         -1 |            1\n customer_id |         0 |       1000 |  0.013974413\n id          |         0 |         -1 |            1\n note        |         1 |          0 |\n status      |         0 |          2 |    0.9820641\n(6 rows)\n\n=# SELECT count(*) AS rows, count(DISTINCT customer_id) AS distinct_customer, count(DISTINCT status) AS distinct_status, count(note) AS note_not_null FROM orders;\n  rows  | distinct_customer | distinct_status | note_not_null\n--------+-------------------+-----------------+---------------\n 100000 |              1000 |               2 |             0\n(1 row)']
  ],
  refs: [
    ['pg_stats', 'view-pg-stats.html'],
    ['プランナで使用される統計情報', 'planner-stats.html']
  ]
},
{
  id: 'G2.2-016', level: 'gold', cat: 'G2.2', type: 'scenario',
  q: '10万行のテーブル tickets を ANALYZE した後、統計情報と実行計画を確認した。`EXPLAIN SELECT * FROM tickets WHERE status IN (\'open\', \'spam\');` で表示される見積もり行数（rows）として、最も近いものを1つ選びなさい。',
  code: '=# SELECT null_frac, n_distinct, most_common_vals, most_common_freqs\n   FROM pg_stats WHERE tablename = \'tickets\' AND attname = \'status\';\n null_frac | n_distinct |    most_common_vals     |             most_common_freqs\n-----------+------------+-------------------------+-------------------------------------------\n         0 |          4 | {closed,open,hold,spam} | {0.7035667,0.19636667,0.0801,0.019966668}\n(1 row)\n\n=# SELECT reltuples FROM pg_class WHERE relname = \'tickets\';\n reltuples\n-----------\n    100000\n(1 row)\n\n=# EXPLAIN SELECT * FROM tickets WHERE status = \'hold\';\n                          QUERY PLAN\n--------------------------------------------------------------\n Seq Scan on tickets  (cost=0.00..1791.00 rows=8010 width=14)\n   Filter: (status = \'hold\'::text)',
  choices: [
    'rows=1997',
    'rows=8010',
    'rows=10000',
    'rows=19637',
    'rows=21633'
  ],
  answer: 4,
  shuffle: false,
  exp: 'most_common_vals（最頻値）と most_common_freqs（その出現頻度）は、pg_stats の同じ位置どうしが対応しています。status = \'hold\' の見積もりは、hold の頻度 0.0801 × 行数 100000 ≒ 8010 行で、表示された rows=8010 と一致します。\nIN (\'open\', \'spam\') は、どちらかに一致する行なので、頻度を足して (0.19636667 + 0.019966668) × 100000 ≒ 21633 行と見積もられます。実機でも rows=21633 でした。\n19637 は open だけ、1997 は spam だけの見積もりです。最頻値のリストにない値（例: \'unknown\'）は、残りの頻度と個数から推定され、この例ではほぼ 0 のため rows=1 と表示されました。\n統計は ANALYZE のサンプリング（既定では 30000 行）に基づくため、頻度は実際の割合（open 20%、spam 2% など）と少しずれます。',
  evidence: [
    ['tickets の統計情報と実行計画（10万行）',
      'terms=# SELECT attname, null_frac, n_distinct, most_common_vals, most_common_freqs FROM pg_stats WHERE tablename = \'tickets\' AND attname IN (\'status\', \'pri\') ORDER BY attname;\n attname | null_frac | n_distinct |    most_common_vals     |                  most_common_freqs\n---------+-----------+------------+-------------------------+------------------------------------------------------\n pri     |         0 |          5 | {0,4,3,2,1}             | {0.20233333,0.20196667,0.19963333,0.19836667,0.1977}\n status  |         0 |          4 | {closed,open,hold,spam} | {0.7035667,0.19636667,0.0801,0.019966668}\n(2 rows)\n\nterms=# SELECT reltuples FROM pg_class WHERE relname = \'tickets\';\n reltuples\n-----------\n    100000\n(1 row)\n\nterms=# EXPLAIN SELECT * FROM tickets WHERE status = \'hold\';\n                          QUERY PLAN\n--------------------------------------------------------------\n Seq Scan on tickets  (cost=0.00..1791.00 rows=8010 width=14)\n   Filter: (status = \'hold\'::text)\n(2 rows)\n\nterms=# EXPLAIN SELECT * FROM tickets WHERE status = \'unknown\';\n                        QUERY PLAN\n-----------------------------------------------------------\n Seq Scan on tickets  (cost=0.00..1791.00 rows=1 width=14)\n   Filter: (status = \'unknown\'::text)\n(2 rows)\n\nterms=# EXPLAIN SELECT * FROM tickets WHERE status IN (\'open\', \'spam\');\n                          QUERY PLAN\n---------------------------------------------------------------\n Seq Scan on tickets  (cost=0.00..1791.00 rows=21633 width=14)\n   Filter: (status = ANY (\'{open,spam}\'::text[]))\n(2 rows)']
  ],
  refs: [
    ['pg_stats', 'view-pg-stats.html'],
    ['行数推定の例', 'row-estimation-examples.html'],
    ['プランナで使用される統計情報', 'planner-stats.html']
  ]
},
{
  id: 'G2.2-017', level: 'gold', cat: 'G2.2', type: 'scenario',
  q: 'city と zip の値が常に1対1に対応するテーブル addr（5万行）で、次の操作を行った（実行計画の Filter 行や一部の表示は省略）。結果から読み取れる説明として、正しいものを1つ選びなさい。',
  code: '=# EXPLAIN SELECT * FROM addr WHERE city = \'c1\' AND zip = \'z1\';\n Seq Scan on addr  (cost=0.00..972.00 rows=6 width=6)\n\n=# CREATE STATISTICS addr_dep (dependencies) ON city, zip FROM addr;\n=# SELECT stxname, stxkeys, stxkind FROM pg_statistic_ext WHERE stxname = \'addr_dep\';\n stxname  | stxkeys | stxkind\n----------+---------+---------\n addr_dep | 1 2     | {f}\n\n=# SELECT d.stxddependencies FROM pg_statistic_ext s\n     JOIN pg_statistic_ext_data d ON d.stxoid = s.oid WHERE s.stxname = \'addr_dep\';\n stxddependencies\n------------------\n\n\n=# ANALYZE addr;\n=# SELECT d.stxddependencies FROM pg_statistic_ext s\n     JOIN pg_statistic_ext_data d ON d.stxoid = s.oid WHERE s.stxname = \'addr_dep\';\n             stxddependencies\n------------------------------------------\n {"1 => 2": 1.000000, "2 => 1": 1.000000}\n\n=# EXPLAIN SELECT * FROM addr WHERE city = \'c1\' AND zip = \'z1\';\n Seq Scan on addr  (cost=0.00..972.00 rows=512 width=6)\n\n（実際に条件に一致する行は 500 行）',
  choices: [
    'CREATE STATISTICS は定義を pg_statistic_ext に登録するだけで、統計値は ANALYZE で集められてから見積もりに使われる',
    'CREATE STATISTICS を実行した時点で統計値が集められるため、その直後から見積もりの行数が改善されている',
    '関数従属性の統計によって、2つの列を独立とみなした見積もり rows=6 が、さらに小さい値に補正されている',
    '拡張統計の値は pg_stats ビューの most_common_vals 列に格納され、1列ずつの統計と区別なく使われている',
    '拡張統計は1つの列ごとに作成するもので、ON に複数の列を指定したため2つの統計がそれぞれ作成されている'
  ],
  answer: 0,
  exp: 'プランナは通常、条件どうしを独立とみなし、選択率を掛け合わせて見積もります。city = \'c1\'（約1%）と zip = \'z1\'（約1%）で 50000 × 0.01 × 0.01 ≒ 5 となり、実際の 500 行を大きく下回る rows=6 になりました。\nCREATE STATISTICS は、複数の列にまたがる拡張統計の定義を作成するコマンドで、定義は pg_statistic_ext に登録されます（stxkind の f は関数従属性 dependencies）。統計値そのものは次の ANALYZE で集められ、pg_statistic_ext_data に格納されます。作成直後の stxddependencies が空で、ANALYZE 後に値が入っていることからも分かります。\n関数従属性の値 1.000000 は、一方の列の値でもう一方が完全に決まることを表し、これにより見積もりは rows=512 と実際に近い値に補正されました。拡張統計の内容は pg_stats_ext ビューでも確認できます。',
  evidence: [
    ['拡張統計の作成から ANALYZE までの全体',
      'terms=# CREATE TABLE addr (city text, zip text); INSERT INTO addr SELECT \'c\' || (g % 100), \'z\' || (g % 100) FROM generate_series(1, 50000) g; ANALYZE addr;\nANALYZE\nterms=# EXPLAIN SELECT * FROM addr WHERE city = \'c1\' AND zip = \'z1\';\n                       QUERY PLAN\n--------------------------------------------------------\n Seq Scan on addr  (cost=0.00..972.00 rows=6 width=6)\n   Filter: ((city = \'c1\'::text) AND (zip = \'z1\'::text))\n(2 rows)\n\nterms=# CREATE STATISTICS addr_dep (dependencies) ON city, zip FROM addr;\nCREATE STATISTICS\nterms=# SELECT stxname, stxkeys, stxkind FROM pg_statistic_ext WHERE stxname = \'addr_dep\';\n stxname  | stxkeys | stxkind\n----------+---------+---------\n addr_dep | 1 2     | {f}\n(1 row)\n\nterms=# SELECT d.stxddependencies FROM pg_statistic_ext s JOIN pg_statistic_ext_data d ON d.stxoid = s.oid WHERE s.stxname = \'addr_dep\';\n stxddependencies\n------------------\n\n(1 row)\n\nterms=# ANALYZE addr;\nANALYZE\nterms=# SELECT d.stxddependencies FROM pg_statistic_ext s JOIN pg_statistic_ext_data d ON d.stxoid = s.oid WHERE s.stxname = \'addr_dep\';\n             stxddependencies\n------------------------------------------\n {"1 => 2": 1.000000, "2 => 1": 1.000000}\n(1 row)\n\nterms=# EXPLAIN SELECT * FROM addr WHERE city = \'c1\' AND zip = \'z1\';\n                       QUERY PLAN\n--------------------------------------------------------\n Seq Scan on addr  (cost=0.00..972.00 rows=512 width=6)\n   Filter: ((city = \'c1\'::text) AND (zip = \'z1\'::text))\n(2 rows)\n\nterms=# SELECT statistics_name, attnames, kinds, dependencies FROM pg_stats_ext WHERE statistics_name = \'addr_dep\';\n statistics_name |  attnames  | kinds |               dependencies\n-----------------+------------+-------+------------------------------------------\n addr_dep        | {city,zip} | {f}   | {"1 => 2": 1.000000, "2 => 1": 1.000000}\n(1 row)']
  ],
  refs: [
    ['拡張統計', 'planner-stats.html#PLANNER-STATS-EXTENDED'],
    ['CREATE STATISTICS', 'sql-createstatistics.html'],
    ['pg_statistic_ext', 'catalog-pg-statistic-ext.html'],
    ['pg_stats_ext', 'view-pg-stats-ext.html']
  ]
},

/* ---------------- G2.3 クエリ実行計画（重要度 3 / 30問） ---------------- */
{
  id: 'G2.3-001', level: 'gold', cat: 'G2.3',
  q: '`EXPLAIN` の出力に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'cost に表示される値の単位はミリ秒である',
    'EXPLAIN ANALYZE を指定しても文は実行されないため、UPDATE 文にも安心して使用できる',
    'EXPLAIN（ANALYZE なし）で表示される rows は、実際に返された行数である',
    'loops が 2 以上のノードの actual time は、全ループの合計時間である',
    'EXPLAIN ANALYZE は文を実際に実行するため、更新系の文は BEGIN と ROLLBACK で囲むとよい'
  ],
  answer: 4,
  exp: 'EXPLAIN ANALYZE は文を実際に実行して、推定値に加え実際の行数や所要時間を表示します。データ変更文の場合は実際にデータが変更されるため、BEGIN; EXPLAIN ANALYZE ...; ROLLBACK; のようにして結果を破棄します。\ncost の単位は任意の単位で、慣習的に seq_page_cost（シーケンシャルなページ読み込み1回）を 1.0 とした相対値です。\nANALYZE なしの rows はプランナによる推定行数です。\nloops が複数の場合、actual time と rows は1ループあたりの平均値で表示されるため、合計は loops を掛けて求めます。',
  refs: [
    ['EXPLAINの利用', 'using-explain.html'],
    ['EXPLAIN ANALYZE', 'using-explain.html#USING-EXPLAIN-ANALYZE'],
    ['EXPLAIN', 'sql-explain.html']
  ]
},
{
  id: 'G2.3-002', level: 'gold', cat: 'G2.3', type: 'scenario',
  q: '次の実行計画に関する説明として、正しいものを1つ選びなさい。',
  code: 'Hash Join  (cost=38.58..74.43 rows=1000 width=72)\n  Hash Cond: (o.customer_id = c.id)\n  ->  Seq Scan on orders o  (cost=0.00..33.00 rows=1000 width=40)\n  ->  Hash  (cost=26.70..26.70 rows=950 width=36)\n        ->  Seq Scan on customers c  (cost=0.00..26.70 rows=950 width=36)',
  choices: [
    'orders テーブルの行からハッシュテーブルが作成され、customers の各行でそれを探索する',
    'customers テーブルの行からハッシュテーブルが作成され、orders の各行でそれを探索する',
    '結合の前に、両方のテーブルが結合キーでソートされる',
    '結合キーの探索に customers テーブルのインデックスが使用されている',
    'Hash Cond は結合後の行に対して適用されるフィルタ条件で、結合方式とは関係がない'
  ],
  answer: 1,
  exp: 'Hash Join では、Hash ノードの下にある子（内側、この例では customers の Seq Scan）の行からメモリ上にハッシュテーブルを作成し、もう一方の子（外側、orders の Seq Scan）の各行について Hash Cond の結合キーでハッシュテーブルを探索します。\n結合前に両方の入力をソートするのは Merge Join です。この計画ではどちらのテーブルも Seq Scan で、インデックスは使われていません。\nHash Cond はハッシュ結合の結合条件そのものです（結合後のフィルタは Join Filter や Filter と表示されます）。',
  evidence: [
    ['同じ問い合わせをハッシュ結合で実行させた場合の実行計画',
      '=# SET enable_memoize = off; SET enable_nestloop = off; EXPLAIN SELECT o.id, c.pref FROM orders o JOIN customers c ON o.customer_id = c.id;\n                                  QUERY PLAN\n-------------------------------------------------------------------------------\n Hash Join  (cost=3182.00..9278.51 rows=100000 width=7)\n   Hash Cond: (o.customer_id = c.id)\n   ->  Seq Scan on orders o  (cost=0.00..4661.00 rows=100000 width=8)\n   ->  Hash  (cost=1541.00..1541.00 rows=100000 width=7)\n         ->  Seq Scan on customers c  (cost=0.00..1541.00 rows=100000 width=7)\n(5 rows)'],
    ['（既定ではこの条件では Nested Loop + Memoize が選ばれた）',
      '=# EXPLAIN SELECT o.id, c.pref FROM orders o JOIN customers c ON o.customer_id = c.id;\n                                          QUERY PLAN\n----------------------------------------------------------------------------------------------\n Nested Loop  (cost=0.30..4579.00 rows=100000 width=7)\n   ->  Seq Scan on orders o  (cost=0.00..1736.00 rows=100000 width=8)\n   ->  Memoize  (cost=0.30..0.35 rows=1 width=7)\n         Cache Key: o.customer_id\n         Cache Mode: logical\n         ->  Index Scan using customers_pkey on customers c  (cost=0.29..0.34 rows=1 width=7)\n               Index Cond: (id = o.customer_id)\n(7 rows)']
  ],
  refs: [
    ['EXPLAINの基本', 'using-explain.html#USING-EXPLAIN-BASICS'],
    ['プランナ/オプティマイザ（結合方式）', 'planner-optimizer.html']
  ]
},
{
  id: 'G2.3-003', level: 'gold', cat: 'G2.3',
  q: 'パラレルクエリに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'max_parallel_workers_per_gather の既定値は 0 であり、明示的に設定しない限りパラレルクエリは使われない',
    'パラレルワーカーの結果は、実行計画上の Gather または Gather Merge ノードで集約される',
    'INSERT / UPDATE / DELETE 文は、常にパラレルに実行される',
    'DECLARE CURSOR で定義したカーソルの問い合わせは、常にパラレルクエリで実行される',
    '同時に起動できるパラレルワーカーの数は max_connections によって決まる'
  ],
  answer: 1,
  exp: 'パラレルクエリでは、Gather または Gather Merge ノードの下の部分計画が複数のワーカーで並列に実行され、その結果がリーダープロセスに集約されます。\nmax_parallel_workers_per_gather の既定値は 2 で、既定の設定でもパラレルクエリが使われることがあります。\nデータを書き込む問い合わせやロックを行う問い合わせ（CREATE TABLE AS、SELECT INTO、CREATE MATERIALIZED VIEW などの例外を除く）や、DECLARE CURSOR によるカーソルではパラレルプランは使われません。\nパラレルワーカーはバックグラウンドワーカーとして max_worker_processes の枠から起動され、全体の上限は max_parallel_workers で制限されます。',
  refs: [
    ['パラレルクエリはどのように動くのか', 'how-parallel-query-works.html'],
    ['どのような時にパラレルクエリは使われるのか？', 'when-can-parallel-query-be-used.html'],
    ['max_parallel_workers_per_gather', 'runtime-config-resource.html#GUC-MAX-PARALLEL-WORKERS-PER-GATHER']
  ]
},
{
  id: 'G2.3-004', level: 'gold', cat: 'G2.3',
  q: '実行計画に Index Only Scan が現れた場合の説明として、正しいものを1つ選びなさい。',
  choices: [
    'インデックスで条件に合う行を見つけた後、必ずすべての行についてテーブル（ヒープ）を読みに行く',
    '必要な列がすべてインデックスにあり、可視性マップで全可視と分かるページはヒープを読まない',
    'テーブル全体を先頭から順に読み、各行が条件を満たすかを判定する',
    'インデックスから行の位置をビットマップに集め、テーブルのページ順にまとめて読み込む',
    'EXPLAIN ANALYZE の Heap Fetches は、常に 0 になる'
  ],
  answer: 1,
  exp: 'Index Only Scan は、問い合わせが参照する列がすべてインデックスに含まれているときに使われるスキャン方式です。行の可視性はヒープにしか記録されていませんが、可視性マップでそのページの全タプルが可視と分かっていればヒープへのアクセスを省略できます。そうでないページについてはヒープを参照し、その回数が EXPLAIN ANALYZE の Heap Fetches に表示されます。VACUUM で可視性マップが更新されると、ヒープへのアクセスが減ります。\nテーブルを順に読むのは Seq Scan、ビットマップを使うのは Bitmap Index Scan と Bitmap Heap Scan の組み合わせです。',
  refs: [
    ['インデックスオンリースキャンとカバリングインデックス', 'indexes-index-only-scans.html'],
    ['可視性マップ', 'storage-vm.html']
  ]
},
{
  id: 'G2.3-005', level: 'gold', cat: 'G2.3',
  q: 'パーティションプルーニングに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'パーティションプルーニングは、問い合わせの計画時にしか行われない',
    'プルーニングで除外されたパーティションも、実行計画には Seq Scan のノードとして必ず表示される',
    'constraint_exclusion の既定値は on であり、パーティションプルーニングの有効・無効はこのパラメータで制御する',
    'enable_partition_pruning が on（既定）の場合、WHERE 句の条件に基づいて、条件に一致しえないパーティションが計画時や実行時に除外される',
    'パーティションキーに対する条件を指定しなくても、統計情報をもとに不要なパーティションが除外される'
  ],
  answer: 3,
  exp: 'パーティションプルーニングは、パーティション境界と WHERE 句の条件を比べて、スキャンする必要のないパーティションを除外する最適化で、enable_partition_pruning（既定 on）で制御します。\n計画時に値が分かる条件は計画時に除外され、計画時には値が分からない条件（プリペアド文のパラメータや、結合の相手の値など）は実行時に除外されます。計画時に除外されたパーティションは実行計画に現れず、実行時に除外された場合は「Subplans Removed」などと表示されます。\nパーティションキーに対する条件がなければプルーニングは行えません。constraint_exclusion（既定 partition）は、CHECK 制約を使った継承テーブルなどの除外に関するパラメータです。',
  refs: [
    ['パーティションプルーニング', 'ddl-partitioning.html#DDL-PARTITION-PRUNING'],
    ['enable_partition_pruning', 'runtime-config-query.html#GUC-ENABLE-PARTITION-PRUNING']
  ]
},
{
  id: 'G2.3-006', level: 'gold', cat: 'G2.3',
  q: '結合方式の Nested Loop に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '内側のテーブルの行からハッシュテーブルを作成し、外側の各行で探索する',
    '結合の前に両方の入力を結合キーでソートし、並行して読み進める',
    '外側の各行について内側を探索する方式で、外側の行数が少なく内側にインデックスがある場合に有利になる',
    '等価条件（=）の結合にしか使用できない',
    'enable_nestloop を off にすると、どのような問い合わせでも Nested Loop は一切選択されなくなる'
  ],
  answer: 2,
  exp: 'Nested Loop は外側（左）の入力の各行について、内側（右）の入力を探索する結合方式です。内側にインデックスがあればインデックススキャンで効率よく探索でき、外側の行数が少ない場合に有利です。結合条件の種類を問わず使えるため、不等号などの結合にも使われます。\nハッシュテーブルを作るのは Hash Join、両方をソートして突き合わせるのは Merge Join で、どちらも等価条件で結合する場合に使われます。\nenable_nestloop = off はコストを非常に大きく見積もらせるだけで、他に選べる方式がない場合は Nested Loop が使われます。',
  refs: [
    ['プランナ/オプティマイザ', 'planner-optimizer.html'],
    ['プランナメソッド設定', 'runtime-config-query.html#RUNTIME-CONFIG-QUERY-ENABLE']
  ]
},
{
  id: 'G2.3-007', level: 'gold', cat: 'G2.3', type: 'scenario',
  q: '次の EXPLAIN ANALYZE の出力に関する説明として、最も適切なものを1つ選びなさい。',
  code: 'Seq Scan on orders  (cost=0.00..1934.00 rows=5 width=64) (actual time=0.015..12.850 rows=48210 loops=1)\n  Filter: (status = \'shipped\'::text)\n  Rows Removed by Filter: 51790',
  choices: [
    'Filter の条件はインデックスを使って評価されている',
    'Rows Removed by Filter の 51790 は、この問い合わせによってテーブルから削除された行数である',
    'actual time の 12.850 は、1行あたりの処理時間（ミリ秒）である',
    'cost の 1934.00 は、この処理に約 1.9 秒かかると見積もられたことを表す',
    '推定行数 5 に対して実際は 48210 行と大きくずれており、統計情報が古い可能性があるため ANALYZE の実行を検討する'
  ],
  answer: 4,
  exp: 'rows=5 はプランナの推定行数、actual の rows=48210 は実際に返された行数です。推定が大きくずれていると、結合方式やスキャン方式の選択を誤る原因になります。統計情報が古い、統計目標が小さい、列間の相関がある、などが考えられるため、まず ANALYZE の実行や統計情報の見直しを検討します。\nSeq Scan の Filter は各行を読みながら条件を評価したことを表し、Rows Removed by Filter は条件を満たさずに除外された行数です（データは削除されません）。\nactual time は「最初の行を返すまで..すべての行を返すまで」の時間（ミリ秒、1ループあたり）で、cost は時間ではない任意の単位の見積もりです。',
  evidence: [
    ['統計が最新の場合と、更新後に ANALYZE していない場合の見積もり',
      '=# EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders WHERE status = \'shipped\';\n                                        QUERY PLAN\n------------------------------------------------------------------------------------------\n Seq Scan on orders  (cost=0.00..1986.00 rows=98973 width=60) (actual rows=99000 loops=1)\n   Filter: (status = \'shipped\'::text)\n   Rows Removed by Filter: 1000\n(3 rows)\n\n(ANALYZE せずに検索した場合: 統計は更新前のまま)\n=# EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders WHERE status = \'pending\';\n                                     QUERY PLAN\n-------------------------------------------------------------------------------------\n Seq Scan on orders  (cost=0.00..2004.89 rows=1036 width=60) (actual rows=0 loops=1)\n   Filter: (status = \'pending\'::text)\n   Rows Removed by Filter: 100000\n(3 rows)']
  ],
  refs: [
    ['EXPLAIN ANALYZE', 'using-explain.html#USING-EXPLAIN-ANALYZE'],
    ['プランナで使用される統計情報', 'planner-stats.html']
  ]
},
{
  id: 'G2.3-008', level: 'gold', cat: 'G2.3',
  q: '実行計画の Bitmap Heap Scan に表示される `Recheck Cond` の説明として、正しいものを1つ選びなさい。',
  choices: [
    'インデックスを作成したときに指定した WHERE 句（部分インデックスの条件）を表す',
    'ビットマップが非可逆（行単位ではなくページ単位）になった場合などに、ヒープから取り出したタプルに対して再度評価する条件である',
    '結合の相手のテーブルに対して評価される結合条件を表す',
    'Recheck Cond が表示されている場合、実行時に条件が評価されることはない',
    'Index Only Scan と組み合わせて使われる場合にだけ表示される'
  ],
  answer: 1,
  exp: 'ビットマップスキャンでは、Bitmap Index Scan でインデックスから条件に合う行の位置をビットマップに集め、Bitmap Heap Scan でテーブルのページ順に行を読み込みます。\nビットマップが work_mem に収まらない場合は、行単位ではなくページ単位の非可逆な（lossy な）ビットマップになり、そのページの全タプルを読むことになるため、各タプルが条件を満たすかを再確認する必要があります。その条件が Recheck Cond で、EXPLAIN ANALYZE では「Rows Removed by Index Recheck」や「Heap Blocks: exact=… lossy=…」でその状況を確認できます。',
  refs: [
    ['EXPLAINの基本', 'using-explain.html#USING-EXPLAIN-BASICS'],
    ['EXPLAIN ANALYZE', 'using-explain.html#USING-EXPLAIN-ANALYZE']
  ]
},
{
  id: 'G2.3-009', level: 'gold', cat: 'G2.3', type: 'scenario',
  q: '次の EXPLAIN ANALYZE の出力に関する説明として、最も適切なものを1つ選びなさい。',
  code: 'Sort  (cost=71932.24..73182.24 rows=500000 width=40) (actual time=210.3..245.8 rows=500000 loops=1)\n  Sort Key: created_at\n  Sort Method: external merge  Disk: 25640kB\n  ->  Seq Scan on orders  (cost=0.00..9217.00 rows=500000 width=40) (actual time=0.01..40.2 rows=500000 loops=1)',
  choices: [
    'ソートはすべてメモリ上のクイックソートで行われている',
    'Disk: 25640kB は、このソートによって書き出された WAL の量である',
    'メモリに収まらず一時ファイルを使っているので、work_mem 拡大やインデックスを検討する',
    '上位の行だけを取り出す top-N heapsort が使われている',
    'ソートは共有バッファ（shared_buffers）の中で行われている'
  ],
  answer: 2,
  exp: 'Sort Method: external merge  Disk: 25640kB は、ソートするデータが work_mem に収まらず、一時ファイル（約 25MB）を使った外部マージソートが行われたことを表します。メモリ内で完了した場合は quicksort  Memory: …kB、LIMIT と組み合わせて上位だけを保持した場合は top-N heapsort と表示されます。\nディスクを使うソートは遅くなるため、セッション単位で work_mem を増やす、ORDER BY の列にインデックスを作成してソート済みの順序で読み出す、取得する行数や列を減らす、などを検討します。\nソートのメモリは各バックエンドのプライベートメモリで、共有バッファではありません。一時ファイルは WAL ではありません。',
  evidence: [
    ['work_mem を変えて同じソートを実行した結果',
      '=# SET work_mem = \'64kB\'; EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders ORDER BY created_at;\n                                            QUERY PLAN\n--------------------------------------------------------------------------------------------------\n Sort  (cost=21335.32..21585.32 rows=100000 width=60) (actual rows=100000 loops=1)\n   Sort Key: created_at\n   Sort Method: external merge  Disk: 4136kB\n   ->  Seq Scan on orders  (cost=0.00..1743.00 rows=100000 width=60) (actual rows=100000 loops=1)\n(4 rows)\n\n=# SET work_mem = \'32MB\'; EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders ORDER BY created_at;\n                                            QUERY PLAN\n--------------------------------------------------------------------------------------------------\n Sort  (cost=10047.82..10297.82 rows=100000 width=60) (actual rows=100000 loops=1)\n   Sort Key: created_at\n   Sort Method: quicksort  Memory: 10885kB\n   ->  Seq Scan on orders  (cost=0.00..1743.00 rows=100000 width=60) (actual rows=100000 loops=1)\n(4 rows)']
  ],
  refs: [
    ['EXPLAIN ANALYZE', 'using-explain.html#USING-EXPLAIN-ANALYZE'],
    ['work_mem', 'runtime-config-resource.html#GUC-WORK-MEM']
  ]
},
{
  id: 'G2.3-010', level: 'gold', cat: 'G2.3', type: 'scenario',
  q: '`EXPLAIN (ANALYZE, BUFFERS)` の出力の `Buffers: shared hit=120 read=880` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'hit はディスクから読み込んだブロック数、read は共有バッファ上で見つかったブロック数である',
    'read はこのノードがディスクに書き込んだブロック数である',
    'hit は共有バッファ上で見つかったブロック数、read は共有バッファになくディスク（OS キャッシュを含む）から読み込んだブロック数である',
    'hit と read は、それぞれ成功した問い合わせと失敗した問い合わせの回数である',
    'shared はセッション固有の一時テーブルのバッファを表す'
  ],
  answer: 2,
  exp: 'BUFFERS オプションは、各ノードのバッファの使用状況を表示します。\n・shared hit: 共有バッファ上に既に存在していたブロック数\n・shared read: 共有バッファになく、ファイルから読み込んだブロック数（OS のページキャッシュから読まれた場合も含む）\n・shared dirtied / written: 変更したブロック数 / 書き出したブロック数\n・local: 一時テーブルのバッファ、temp: 一時ファイルのブロック\nread が多いノードは I/O の影響を受けやすく、同じ問い合わせを繰り返すと hit の割合が増えることが多いため、性能測定の際はキャッシュの状態も考慮します。',
  evidence: [
    ['共有バッファが空の状態（サーバ再起動直後）と、2回目の実行',
      '=# EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT count(*) FROM orders WHERE amount > 4000;\n                                          QUERY PLAN\n-----------------------------------------------------------------------------------------------\n Aggregate  (cost=4961.47..4961.48 rows=1 width=8) (actual rows=1 loops=1)\n   Buffers: shared read=3661\n   ->  Seq Scan on orders  (cost=0.00..4911.00 rows=20188 width=0) (actual rows=20000 loops=1)\n         Filter: (amount > 4000)\n         Rows Removed by Filter: 80000\n         Buffers: shared read=3661\n Planning:\n   Buffers: shared hit=84 read=24\n(8 rows)\n\n（同じ問い合わせをもう一度: 共有バッファに載っているので read が減る）\n=# EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT count(*) FROM orders WHERE amount > 4000;\n                                          QUERY PLAN\n-----------------------------------------------------------------------------------------------\n Aggregate  (cost=4961.47..4961.48 rows=1 width=8) (actual rows=1 loops=1)\n   Buffers: shared hit=3661\n   ->  Seq Scan on orders  (cost=0.00..4911.00 rows=20188 width=0) (actual rows=20000 loops=1)\n         Filter: (amount > 4000)\n         Rows Removed by Filter: 80000\n         Buffers: shared hit=3661\n Planning:\n   Buffers: shared hit=113\n(8 rows)']
  ],
  refs: [
    ['EXPLAIN', 'sql-explain.html'],
    ['EXPLAIN ANALYZE', 'using-explain.html#USING-EXPLAIN-ANALYZE']
  ]
},
{
  id: 'G2.3-011', level: 'gold', cat: 'G2.3',
  q: 'GROUP BY を含む問い合わせの実行計画に現れる HashAggregate と GroupAggregate に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'HashAggregate はハッシュ表でグループ化するため入力のソートは不要で、GroupAggregate はグループ化キーでソートされた入力を順に集約する',
    'GroupAggregate はハッシュ表でグループ化し、HashAggregate はソートされた入力を必要とする',
    'PostgreSQL 14 の HashAggregate は、ハッシュ表が work_mem を超えるとエラーになる',
    'HashAggregate は、DISTINCT による重複除去には使われない',
    'GroupAggregate は、どのような場合でも HashAggregate より高速である'
  ],
  answer: 0,
  exp: 'HashAggregate は入力の各行をグループ化キーのハッシュ表に集計する方式で、入力の順序を問いませんが、グループ数が多いとメモリを多く使います。GroupAggregate はグループ化キーでソート済みの入力（Sort ノードやインデックスの順序）を先頭から順に集約する方式で、メモリ使用量が少なく、結果もその順序で出力されます。\nPostgreSQL 13 以降の HashAggregate は、ハッシュ表が work_mem × hash_mem_multiplier を超えるとディスクに書き出して処理を続けます。DISTINCT や UNION の重複除去にも HashAggregate が使われることがあります。どちらを選ぶかはコストの見積もりで決まり、enable_hashagg で抑制できます。',
  refs: [
    ['enable_hashagg', 'runtime-config-query.html#GUC-ENABLE-HASHAGG'],
    ['hash_mem_multiplier', 'runtime-config-resource.html#GUC-HASH-MEM-MULTIPLIER']
  ]
},
{
  id: 'G2.3-012', level: 'gold', cat: 'G2.3',
  q: 'ウィンドウ関数を含む問い合わせ `SELECT dept, salary, rank() OVER (PARTITION BY dept ORDER BY salary DESC) FROM emp;` の実行計画に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ウィンドウ関数は集約関数と同じく、HashAggregate ノードで処理される',
    'WindowAgg ノードで処理され、その下に並べ替えの Sort ノードが置かれることが多い',
    'ウィンドウ関数を使うと、行数は PARTITION BY のグループ数に集約される',
    'PARTITION BY を指定すると、テーブルがパーティション分割されて処理される',
    'ウィンドウ関数の計算は、WHERE 句の評価より前に行われる'
  ],
  answer: 1,
  exp: 'ウィンドウ関数は実行計画の WindowAgg ノードで計算されます。WindowAgg は PARTITION BY と ORDER BY の順に並んだ入力を必要とするため、インデックスでその順序が得られない場合は、その下に Sort（Sort Key: dept, salary DESC）が置かれます。\nウィンドウ関数は集約関数と異なり、行をまとめず、入力の各行に対して結果を付け加えます。PARTITION BY は計算の区切りを表すもので、テーブルのパーティショニングとは無関係です。\nウィンドウ関数は WHERE、GROUP BY、HAVING の処理の後に評価されるため、ウィンドウ関数の結果で絞り込むにはサブクエリを使います。',
  refs: [
    ['ウィンドウ関数（チュートリアル）', 'tutorial-window.html'],
    ['ウィンドウ関数の処理', 'queries-table-expressions.html#QUERIES-WINDOW']
  ]
},
{
  id: 'G2.3-013', level: 'gold', cat: 'G2.3',
  q: '結合方式の Hash Join と Merge Join に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'Hash Join は片方のテーブルからハッシュ表を作るため、等価結合でのみ使用できる',
    'Hash Join はハッシュ表が work_mem に収まらない場合、結合自体が失敗してエラーになる',
    'Merge Join は両側が同じキーで並んでいる必要がなく、順序に関係なく適用できる',
    'Merge Join は不等号（<、>）を含む結合条件でのみ使用される',
    'Hash Join は常に Merge Join より高速なため、プランナは可能なら必ず Hash Join を選ぶ'
  ],
  answer: 0,
  exp: 'Hash Join は一方（通常は小さい側）の行からハッシュ表を作り、もう一方の行をハッシュ値で突き合わせます。ハッシュ値の一致で判定するため、等価結合にのみ使えます。ハッシュ表が大きすぎる場合は複数のバッチに分割され、一時ファイルを使って処理されます（エラーにはなりません）。\nMerge Join は両方の入力が結合キーで整列されている必要があり、必要なら Sort が挿入されます。こちらも等価結合が基本です。\n不等号を含む結合は Nested Loop で処理されます。\nどの方式が有利かは行数や整列済みかどうかで変わるため、プランナがコストで選択します。',
  refs: [
    ['EXPLAINの使用', 'using-explain.html#USING-EXPLAIN-BASICS'],
    ['プランナメソッド設定', 'runtime-config-query.html#RUNTIME-CONFIG-QUERY-ENABLE']
  ]
},
{
  id: 'G2.3-014', level: 'gold', cat: 'G2.3', type: 'scenario',
  q: 'EXPLAIN ANALYZE の出力にある `(actual time=0.020..0.850 rows=12 loops=340)` の読み方として、正しいものを1つ選びなさい。',
  choices: [
    'そのノードは 340 回実行され、1回あたり平均 12 行を返し、表示されている時間も1回あたりの平均である',
    'そのノードは 340 回実行され、合計 12 行を返し、0.850 ミリ秒は 340 回の合計時間である',
    'loops はそのノードが読み込んだブロック数を表す',
    'rows は推定行数であり、実際に返された行数は表示されない',
    'actual time の2つの数値は、最小実行時間と最大実行時間を表す'
  ],
  answer: 0,
  exp: 'EXPLAIN ANALYZE の actual の rows と time は、loops 回の実行の「平均値」です。合計を知りたい場合は rows × loops、time × loops を計算します。この例では合計およそ 4080 行、0.850 × 340 ≒ 289 ミリ秒です。\nloops が大きくなるのは、Nested Loop の内側のように外側の行ごとに繰り返し実行されるノードです。\nactual time の2つの数値は、最初の行が返るまでの時間（起動時間）と、すべての行が返るまでの時間です。\n推定側は cost=... rows=... として別に表示され、推定と実測の乖離が大きいノードがチューニングの手がかりになります。',
  evidence: [
    ['内側が 50回繰り返される Nested Loop の実行計画',
      '=# SET enable_hashjoin = off; SET enable_mergejoin = off; SET enable_memoize = off; EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT c.id, o.id FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.id BETWEEN 1 AND 50;\n                                                       QUERY PLAN\n------------------------------------------------------------------------------------------------------------------------\n Nested Loop  (cost=4.86..11960.32 rows=56 width=8) (actual rows=5000 loops=1)\n   ->  Index Only Scan using customers_pkey on customers c  (cost=0.29..5.41 rows=56 width=4) (actual rows=50 loops=1)\n         Index Cond: ((id >= 1) AND (id <= 50))\n         Heap Fetches: 0\n   ->  Bitmap Heap Scan on orders o  (cost=4.57..212.48 rows=100 width=8) (actual rows=100 loops=50)\n         Recheck Cond: (customer_id = c.id)\n         Heap Blocks: exact=5000\n         ->  Bitmap Index Scan on orders_customer_id_idx  (cost=0.00..4.54 rows=100 width=0) (actual rows=100 loops=50)\n               Index Cond: (customer_id = c.id)\n(9 rows)']
  ],
  refs: [
    ['EXPLAIN ANALYZE', 'using-explain.html#USING-EXPLAIN-ANALYZE'],
    ['EXPLAIN', 'sql-explain.html']
  ]
},
{
  id: 'G2.3-015', level: 'gold', cat: 'G2.3',
  q: 'PostgreSQL 14 における WITH 句（共通テーブル式、CTE）の実行計画上の扱いとして、正しいものを1つ選びなさい。',
  choices: [
    '副問い合わせの参照が1回だけで再帰でも副作用もない CTE は、既定で本体に展開（インライン化）される',
    'CTE は常に独立して実行され、結果が一時的に実体化されるため、外側の条件は決して押し下げられない',
    'MATERIALIZED を明示すると、CTE は必ずインライン化される',
    'NOT MATERIALIZED を明示すると、CTE は必ず実体化される',
    'CTE をインライン化するかどうかは、enable_cte パラメータで制御する'
  ],
  answer: 0,
  exp: 'PostgreSQL 12 以降、CTE は「参照が1回だけ」「再帰的でない」「副作用を持つ関数を含まない」という条件を満たす場合、既定で本体にインライン化され、外側の条件の押し下げなどの最適化が効くようになりました。\n従来どおり実体化させたい場合は WITH ... AS MATERIALIZED (...)、逆に必ずインライン化したい場合は AS NOT MATERIALIZED を指定します。選択肢の説明は入れ替わっています。\nPostgreSQL 11 以前は CTE が常に最適化の壁（オプティマイズフェンス）として働いていました。\nenable_cte というパラメータは存在しません。',
  refs: [
    ['WITH問い合わせ', 'queries-with.html'],
    ['WITH句のSELECT', 'queries-with.html#QUERIES-WITH-SELECT']
  ]
},
{
  id: 'G2.3-016', level: 'gold', cat: 'G2.3',
  q: 'パーティションテーブルに対する問い合わせの実行計画に現れるノードに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'Append は各パーティションの結果を単純に連結し、Merge Append は整列順を保ったまま併合する',
    'Append は整列順を保ったまま併合し、Merge Append は結果を単純に連結する',
    'パーティションテーブルへの問い合わせでは、常に Merge Append が使われる',
    'Append ノードが現れた時点で、パーティションプルーニングは働いていない',
    'Append の下にはパーティションが1つしか現れないため、除外の有無は判断できない'
  ],
  answer: 0,
  exp: 'Append は複数の子プランの結果を順番に連結するノードで、パーティションテーブルや継承テーブルのスキャンで現れます。\nMerge Append は、各子プランが同じキーで整列されている場合に、整列順を保ったまま併合するノードです。ORDER BY や LIMIT を伴う問い合わせで、全体のソートを避けられます。\nパーティションプルーニングが効くと、Append の下に現れる子プランが必要なパーティションだけに絞られます。実行時プルーニングの場合は「Subplans Removed: N」と表示されます。\nすべてのパーティションが除外され子が1つだけになると、Append 自体が省かれることもあります。',
  refs: [
    ['パーティションプルーニング', 'ddl-partitioning.html#DDL-PARTITION-PRUNING'],
    ['EXPLAINの使用', 'using-explain.html']
  ]
},
{
  id: 'G2.3-017', level: 'gold', cat: 'G2.3',
  q: '実行計画で Seq Scan が選ばれ、インデックスが使われない原因として考えられないものを1つ選びなさい。',
  choices: [
    'ANALYZE が実行され、統計情報が実際のデータ分布を正しく反映している',
    '取得する行数がテーブル全体に対して多く、シーケンシャルスキャンの方が低コストと推定されている',
    'WHERE 句が列に関数を適用した形になっており、その式に対応するインデックスがない',
    '検索条件の値の型とインデックス列の型が異なり、暗黙のキャストでインデックスが使えない',
    'テーブルが非常に小さく、インデックス経由よりも全件読み取りの方が安いと推定されている'
  ],
  answer: 0,
  exp: '統計情報が最新で正確であることは、むしろ適切な計画が選ばれる条件です。逆に統計が古いとインデックスが使われないことがあります。\nインデックスが使われない典型的な原因には、選択率が低い（多くの行が該当する）、テーブルが小さい、WHERE 句が lower(col) = ... のように列を加工していて式インデックスがない、型の不一致でインデックスの演算子クラスに合致しない、といったものがあります。\nまた random_page_cost が実際のストレージ性能に比べて高すぎる場合も、インデックススキャンが割高に見積もられます。',
  refs: [
    ['EXPLAINの使用', 'using-explain.html'],
    ['インデックスと ORDER BY', 'indexes-ordering.html'],
    ['式によるインデックス', 'indexes-expressional.html']
  ]
},
{
  id: 'G2.3-018', level: 'gold', cat: 'G2.3',
  q: '実行計画に現れる Index Scan と Bitmap Index Scan の違いとして、正しいものを1つ選びなさい。',
  choices: [
    'Bitmap Index Scan は該当ブロックをいったんビットマップに集めてから、ブロック順にテーブルを読む',
    'Bitmap Index Scan はインデックスだけを読み、テーブルにはアクセスしない',
    'Index Scan は複数のインデックスを組み合わせて使えるが、Bitmap Index Scan は1つしか使えない',
    'Bitmap Index Scan は必ず Index Scan より高速なので、プランナは可能なら常にこちらを選ぶ',
    'Bitmap Index Scan では結果が必ずインデックスの順序で返る'
  ],
  answer: 0,
  exp: 'Index Scan はインデックスを1件たどるごとに対応するテーブル行を読むため、ランダムアクセスが増えますが、インデックスの順序で結果が返ります。\nBitmap Index Scan は、まず条件に合うブロックの位置をビットマップとして集め、その後 Bitmap Heap Scan がブロック番号順にまとめてテーブルを読みます。ランダムアクセスが減る一方、結果の順序は保たれません。\n複数のインデックスの結果を AND / OR で組み合わせられるのはビットマップ方式の方です（BitmapAnd / BitmapOr）。\nどちらが有利かは該当行数によって変わり、プランナがコストで選択します。',
  refs: [
    ['複数のインデックスの組み合わせ', 'indexes-bitmap-scans.html'],
    ['EXPLAINの使用', 'using-explain.html']
  ]
},
{
  id: 'G2.3-019', level: 'gold', cat: 'G2.3',
  q: '`EXPLAIN` のオプションに関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'BUFFERS はバッファの使用状況を、WAL は生成された WAL 量を表示し、いずれも ANALYZE と併用する',
    'VERBOSE を指定すると問い合わせが実際に実行され、実測値が表示される',
    'FORMAT JSON を指定すると、実行計画ではなく問い合わせ結果が JSON で返る',
    'SETTINGS オプションは PostgreSQL 14 には存在しない',
    'COSTS を off にすると、EXPLAIN ANALYZE の実測時間も表示されなくなる'
  ],
  answer: 0,
  exp: 'BUFFERS は共有・ローカル・一時バッファのヒットや読み書きの状況、WAL（PostgreSQL 13 以降）は生成された WAL のレコード数とバイト数を表示します。どちらも実際に実行しないと分からないため、ANALYZE と併用します。\nVERBOSE は出力列や関数のスキーマ名など、計画の詳細を追加で表示するもので、問い合わせは実行されません。\nFORMAT では TEXT / XML / JSON / YAML を選べますが、出力されるのは実行計画です。\nSETTINGS（PostgreSQL 12 以降）は、既定値と異なるプランナ関連パラメータを表示します。\nCOSTS off は推定コストの表示を抑えるもので、実測値は表示されます。',
  refs: [
    ['EXPLAIN', 'sql-explain.html'],
    ['EXPLAINの使用', 'using-explain.html#USING-EXPLAIN-ANALYZE']
  ]
},
{
  id: 'G2.3-020', level: 'gold', cat: 'G2.3',
  q: '実行計画に現れる Materialize と、PostgreSQL 14 で追加された Memoize に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'どちらも下位ノードの結果を保持して再利用するもので、Memoize は結合キーごとの結果をキャッシュする',
    'Materialize は結果をディスク上の一時テーブルに書き出し、問い合わせ終了後も残す',
    'Memoize はマテリアライズドビューを更新するためのノードである',
    'Materialize はパラレルクエリでのみ現れるノードである',
    'Memoize は enable_memoize では制御できず、常に使用される'
  ],
  answer: 0,
  exp: 'Materialize は下位ノードの結果をいったんメモリ（あふれれば一時ファイル）に蓄え、繰り返し読み直せるようにするノードです。Nested Loop の内側や Merge Join で使われます。\nMemoize は PostgreSQL 14 で追加されたノードで、Nested Loop の内側の結果を結合キーの値ごとにキャッシュし、同じ値が再び来たときに下位ノードの実行を省きます。外側に同じ値が多く現れる場合に効果があります。\nどちらも問い合わせの実行中だけ存在し、終了後には残りません。\nMemoize は enable_memoize パラメータで無効にできます。',
  refs: [
    ['EXPLAINの使用', 'using-explain.html'],
    ['enable_memoize', 'runtime-config-query.html#GUC-ENABLE-MEMOIZE']
  ]
},
{
  id: 'G2.3-021', level: 'gold', cat: 'G2.3',
  q: '`EXPLAIN` の出力の読み方に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'コストの単位はミリ秒であり、実行時間の見積もりを表す',
    '上位ノードのコストには、下位ノードのコストが含まれている',
    '2つ表示されるコストは、最初の行が返るまでと、すべての行が返るまでの見積もりである',
    '推定行数と実測行数が大きく食い違うノードは、チューニングの手がかりになる',
    'EXPLAIN だけでは問い合わせは実行されず、推定値のみが表示される'
  ],
  answer: 0,
  exp: 'コストは時間ではなく、プランナが内部で使う相対的な単位です。既定では seq_page_cost（1ページの順次読み取り）を 1.0 とした相対値で、ミリ秒とは対応しません。この点が誤りです。\n「cost=0.29..8.31」のように2つ表示され、それぞれ最初の行が返るまでの起動コストと、すべての行が返るまでの総コストを表します。\nコストは下位ノードの分を含んだ累積値です。\nEXPLAIN だけでは問い合わせは実行されません。実測値を得るには ANALYZE オプションを付けます。',
  refs: [
    ['EXPLAINの基本', 'using-explain.html#USING-EXPLAIN-BASICS'],
    ['プランナコスト定数', 'runtime-config-query.html#RUNTIME-CONFIG-QUERY-CONSTANTS']
  ]
},
{
  id: 'G2.3-022', level: 'gold', cat: 'G2.3',
  q: 'パラレルクエリの実行計画に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'Gather ノードが、各ワーカーの結果を集約して親ノードへ渡す',
    'Parallel Seq Scan では、各ワーカーがテーブルのブロックを分担して読む',
    'Workers Planned の数だけ、必ずワーカープロセスが起動する',
    'パラレルクエリが使われると、Gather ノードは実行計画の最下位に現れる',
    'テーブルが小さいほど、プランナはパラレルクエリを選びやすい'
  ],
  answer: [0, 1],
  exp: 'パラレルクエリでは、Gather（順序を問わない）または Gather Merge（整列を保つ）ノードが、複数のワーカーの結果を受け取ってまとめます。Gather は並列処理を行う部分の上位に現れます。\nParallel Seq Scan では、各ワーカーがテーブルのブロックを分担して読み取ります。\nWorkers Planned は計画時の予定数で、実行時に max_parallel_workers などの空きが足りなければ Workers Launched はそれより少なくなります。\n並列化には起動コストがかかるため、テーブルが min_parallel_table_scan_size（既定 8MB）より小さいと選ばれにくくなります。',
  refs: [
    ['パラレルプラン', 'parallel-plans.html'],
    ['パラレル問い合わせの動作', 'how-parallel-query-works.html']
  ]
},
{
  id: 'G2.3-023', level: 'gold', cat: 'G2.3',
  q: 'SQL の構文と実行計画のノードの対応に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'ORDER BY はインデックスの順序を利用できる場合、Sort ノードを省略できる',
    'LIMIT を付けると、起動コストの小さい計画が選ばれやすくなる',
    'GROUP BY には必ず HashAggregate が使われる',
    'ORDER BY を書くと、必ず Sort ノードが現れる',
    'DISTINCT は必ず Sort ノードを伴う'
  ],
  answer: [0, 1],
  exp: '整列キーと一致するインデックスがあり、そのインデックスを使うスキャンが選ばれれば、結果はすでに整列済みなので Sort ノードは不要になります。\nLIMIT がある問い合わせでは総コストより起動コストが重視されるため、先頭の数行を早く返せる計画（インデックススキャンなど）が選ばれやすくなります。\nGROUP BY の集約には HashAggregate（ハッシュ表を作る）と GroupAggregate（整列してからまとめる）があり、プランナがコストで選びます。\nDISTINCT も同様に、HashAggregate と Sort + Unique のどちらかが選ばれます。',
  refs: [
    ['EXPLAINの使用', 'using-explain.html'],
    ['インデックスと ORDER BY', 'indexes-ordering.html']
  ]
},
{
  id: 'G2.3-024', level: 'gold', cat: 'G2.3',
  q: '実行計画の `Index Cond` と `Filter` に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'Index Cond はインデックスで絞り込む条件、Filter は取り出した行に対して後から適用する条件である',
    'Rows Removed by Filter が大きい場合、条件に合うインデックスの追加を検討する余地がある',
    'Filter で除かれた行は、そもそも読み込まれていない',
    'Index Cond と Filter はどちらもインデックスだけで評価されるため、性能に差はない',
    'Filter は Seq Scan にしか現れない'
  ],
  answer: [0, 1],
  exp: 'Index Cond はインデックスを走査する際の絞り込み条件で、この条件に合う分だけを読みます。Filter は読み取った行に対して後から適用する条件で、EXPLAIN ANALYZE では「Rows Removed by Filter」として捨てられた行数が表示されます。\nこの値が大きいということは、多くの行を読んでから捨てているということなので、その条件を含むインデックス（複合インデックスや部分インデックス）を検討する価値があります。\nFilter は Seq Scan だけでなく Index Scan にも現れます（インデックスで絞れない条件が残っている場合）。\nインデックス列でない条件を含む場合は、必然的に Filter 側になります。',
  refs: [
    ['EXPLAINの使用', 'using-explain.html#USING-EXPLAIN-BASICS'],
    ['複数列インデックス', 'indexes-multicolumn.html']
  ]
},
{
  id: 'G2.3-025', level: 'gold', cat: 'G2.3',
  q: '実行計画に現れる Incremental Sort に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '入力が整列キーの先頭部分ですでに並んでいる場合に、残りだけをグループごとに整列する',
    '整列の結果を少しずつディスクに書き出すことで、メモリ使用量を抑える方式である',
    'PostgreSQL 14 で廃止されたノードである',
    '整列済みのデータをさらに逆順にするためのノードである',
    'パラレルクエリでのみ使用される'
  ],
  answer: 0,
  exp: 'Incremental Sort は PostgreSQL 13 で導入されたノードで、入力が整列キーの先頭部分（プレフィックス）ですでに並んでいる場合に使えます。たとえば `ORDER BY a, b` に対して列 a のインデックスがあるとき、a の値が同じグループごとに b だけを並べ替えればよいため、全体を整列するより少ないメモリで済み、LIMIT との組み合わせでは早く先頭行を返せます。\n有効・無効は enable_incremental_sort パラメータ（既定 on）で切り替えられます。\nパラレルクエリ専用ではありません。',
  refs: [
    ['プランナメソッド設定', 'runtime-config-query.html#GUC-ENABLE-INCREMENTAL-SORT'],
    ['EXPLAINの使用', 'using-explain.html']
  ]
},
{
  id: 'G2.3-026', level: 'gold', cat: 'G2.3',
  q: 'パーティションワイズ結合・集約に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'enable_partitionwise_join を on にすると、対応するパーティションどうしを結合する計画が使えるようになる',
    '既定では off で、計画作成にかかる時間やメモリが増えるため必要に応じて有効にする',
    'パーティション構成が異なるテーブルどうしでも、常に適用できる',
    'enable_partitionwise_aggregate は PostgreSQL 14 では既定で on である',
    'パーティションワイズ結合は、パーティションが1つしかない場合に効果が大きい'
  ],
  answer: [0, 1],
  exp: 'パーティションワイズ結合は、同じ境界で分割された2つのパーティションテーブルを結合するとき、対応するパーティションどうしを個別に結合してから連結する方式です。1回あたりの結合対象が小さくなり、並列化もしやすくなります。\n適用には、両方のテーブルのパーティションの境界が一致し、結合条件にパーティションキーが含まれている必要があります。\nenable_partitionwise_join と enable_partitionwise_aggregate は、いずれも既定で off です。計画作成の時間とメモリが増えるため、効果が見込める場合に有効にします。',
  refs: [
    ['プランナメソッド設定', 'runtime-config-query.html#GUC-ENABLE-PARTITIONWISE-JOIN'],
    ['パーティショニングの実装方法', 'ddl-partitioning.html#DDL-PARTITIONING-DECLARATIVE']
  ]
},
{
  id: 'G2.3-027', level: 'gold', cat: 'G2.3',
  q: '結合の実行計画に現れる表示に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'Hash Cond はハッシュ結合で突き合わせる条件を表す',
    'Rows Removed by Join Filter が大きい場合、結合してから条件で捨てている行が多いことを示す',
    'Join Filter は結合キーそのものを表すため、必ず Hash Cond と同じ内容になる',
    'Merge Cond が現れるのは、ハッシュ結合が選ばれたときである',
    'Nested Loop には結合条件が表示されることはない'
  ],
  answer: [0, 1],
  exp: 'Hash Join では突き合わせに使う等価条件が Hash Cond として、Merge Join では Merge Cond として表示されます。\nJoin Filter はこれらで絞り込めなかった残りの条件で、結合した結果に対して後から適用されます。EXPLAIN ANALYZE では「Rows Removed by Join Filter」として捨てられた行数が出るため、この値が大きければ、結合してから多くを捨てている＝より絞り込める条件やインデックスを検討する手がかりになります。\nNested Loop でも、内側のスキャンの Index Cond や、ノード自身の Join Filter として条件が表示されます。',
  refs: [
    ['EXPLAINの使用', 'using-explain.html#USING-EXPLAIN-BASICS'],
    ['明示的なJOIN句でプランナを制御する', 'explicit-joins.html']
  ]
},
{
  id: 'G2.3-029', level: 'gold', cat: 'G2.3', type: 'scenario',
  q: 'customers テーブルでは、pref（都道府県）が決まると city（市区町村）もほぼ決まる。ANALYZE 済みの状態で (1) を実行し、拡張統計を作成して (2) を実行した。説明として正しいものを1つ選びなさい。',
  code: '-- (1)\nSeq Scan on customers  (cost=0.00..2041.00 rows=15 width=12) (actual rows=710 loops=1)\n  Filter: ((pref = \'P10\'::text) AND (city = \'C10-1\'::text))\n  Rows Removed by Filter: 99290\n\n=# CREATE STATISTICS customers_pref_city (dependencies)\n     ON pref, city FROM customers;\n=# ANALYZE customers;\n\n-- (2)\nSeq Scan on customers  (cost=0.00..2041.00 rows=707 width=12) (actual rows=710 loops=1)\n  Filter: ((pref = \'P10\'::text) AND (city = \'C10-1\'::text))\n  Rows Removed by Filter: 99290',
  choices: [
    '列ごとの選択率を掛け合わせた推定が過小だったのを、関数従属の拡張統計が補正した',
    '拡張統計によって自動的にインデックスが作られ、Seq Scan が高速になった',
    'rows=15 は実際に返った行数で、actual rows=710 はプランナの推定値である',
    'Rows Removed by Filter が減ったことで、推定行数が改善した',
    '(1) の時点では統計情報がまったく収集されていなかったことが原因である'
  ],
  answer: 0,
  exp: 'プランナは既定では列どうしを独立とみなし、pref = \'P10\' の選択率と city = \'C10-1\' の選択率を掛け合わせて行数を推定します。実際には city が決まれば pref も決まる（関数従属がある）ため、掛け合わせると大幅な過小評価になります。(1) の推定 15 行に対して実際は 710 行でした。\nCREATE STATISTICS ... (dependencies) で列間の関数従属の統計を作り、ANALYZE で収集すると、推定が 707 行とほぼ正確になりました。推定が正しくなると、結合方式や集約方式の選択が適切になります。\n拡張統計はインデックスを作るものではなく、この例でも Seq Scan のままです。\ncost=... rows= が推定、actual rows= が実測です。Rows Removed by Filter は (1) (2) とも同じです。\nこの計画は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['同じ操作を実機で行った結果（拡張統計の作成と ANALYZE の前後）',
      '=# EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM customers WHERE pref = \'P10\' AND city = \'C10-1\';\n                                       QUERY PLAN\n----------------------------------------------------------------------------------------\n Seq Scan on customers  (cost=0.00..2041.00 rows=14 width=12) (actual rows=710 loops=1)\n   Filter: ((pref = \'P10\'::text) AND (city = \'C10-1\'::text))\n   Rows Removed by Filter: 99290\n(3 rows)\n\n=# CREATE STATISTICS customers_pref_city (dependencies) ON pref, city FROM customers;\nCREATE STATISTICS\n=# SELECT statistics_name, attnames, kinds, dependencies FROM pg_stats_ext WHERE statistics_name = \'customers_pref_city\';\n   statistics_name   |  attnames   | kinds |     dependencies\n---------------------+-------------+-------+----------------------\n customers_pref_city | {pref,city} | {f}   | {"3 => 2": 1.000000}\n(1 row)\n\n=# EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM customers WHERE pref = \'P10\' AND city = \'C10-1\';\n                                       QUERY PLAN\n-----------------------------------------------------------------------------------------\n Seq Scan on customers  (cost=0.00..2041.00 rows=705 width=12) (actual rows=710 loops=1)\n   Filter: ((pref = \'P10\'::text) AND (city = \'C10-1\'::text))\n   Rows Removed by Filter: 99290\n(3 rows)']
  ],
  refs: [
    ['拡張統計情報', 'planner-stats.html#PLANNER-STATS-EXTENDED'],
    ['CREATE STATISTICS', 'sql-createstatistics.html'],
    ['EXPLAIN ANALYZE', 'using-explain.html#USING-EXPLAIN-ANALYZE']
  ]
},
{
  id: 'G2.3-030', level: 'gold', cat: 'G2.3', type: 'scenario',
  q: 'work_mem を変えて同じ問い合わせ `SELECT * FROM orders ORDER BY amount;` の EXPLAIN ANALYZE を取得した（一部省略）。読み取れることとして、適切なものを2つ選びなさい。',
  code: '-- SET work_mem = \'1MB\';\nGather Merge  (actual rows=270000 loops=1)\n  Workers Planned: 1\n  Workers Launched: 1\n  ->  Sort  (actual rows=135000 loops=2)\n        Sort Key: amount\n        Sort Method: external merge  Disk: 7248kB\n        Worker 0:  Sort Method: external merge  Disk: 3912kB\n        ->  Parallel Seq Scan on orders  (actual rows=135000 loops=2)\nExecution Time: 127.533 ms\n\n-- SET work_mem = \'64MB\';\nSort  (actual rows=270000 loops=1)\n  Sort Key: amount\n  Sort Method: quicksort  Memory: 33382kB\n  ->  Seq Scan on orders  (actual rows=270000 loops=1)\nExecution Time: 155.491 ms',
  choices: [
    'work_mem = 1MB では、ソートがメモリに収まらずディスク上の一時ファイルを使った',
    'work_mem = 64MB では、ソートがすべてメモリ内で行われた',
    'work_mem = 1MB の計画では、並列ワーカーは計画されたが起動しなかった',
    'メモリ内でソートした 64MB の計画のほうが、実行時間も必ず短くなる',
    'Disk: 7248kB は、orders テーブル全体のファイルサイズを表している'
  ],
  answer: [0, 1],
  exp: 'Sort Method が external merge で Disk: ... と表示されていれば、ソートが work_mem に収まらず一時ファイルを使ったことを示します。quicksort で Memory: ... ならメモリ内で完結しています。パラレルクエリでは、リーダーと各ワーカーがそれぞれ work_mem まで使えるため、ワーカーの分も「Worker 0: Sort Method ...」として表示されます。\nWorkers Launched: 1 なので、ワーカーは実際に起動しています（リーダーと合わせて2プロセスで処理、loops=2）。\nこの例では、work_mem を増やしたことでプランナが並列でない計画を選び、メモリ内でソートしたにもかかわらず実行時間はむしろ長くなりました。work_mem を増やせば必ず速くなるわけではなく、計画の変化も含めて確認する必要があります。\nこの計画は PostgreSQL 14 で実際に採取したものです（cost の表示は省略）。',
  evidence: [
    ['work_mem を変えて同じソートを実行した結果',
      '=# SET work_mem = \'64kB\'; EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders ORDER BY created_at;\n                                            QUERY PLAN\n--------------------------------------------------------------------------------------------------\n Sort  (cost=21335.32..21585.32 rows=100000 width=60) (actual rows=100000 loops=1)\n   Sort Key: created_at\n   Sort Method: external merge  Disk: 4136kB\n   ->  Seq Scan on orders  (cost=0.00..1743.00 rows=100000 width=60) (actual rows=100000 loops=1)\n(4 rows)\n\n=# SET work_mem = \'32MB\'; EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders ORDER BY created_at;\n                                            QUERY PLAN\n--------------------------------------------------------------------------------------------------\n Sort  (cost=10047.82..10297.82 rows=100000 width=60) (actual rows=100000 loops=1)\n   Sort Key: created_at\n   Sort Method: quicksort  Memory: 10885kB\n   ->  Seq Scan on orders  (cost=0.00..1743.00 rows=100000 width=60) (actual rows=100000 loops=1)\n(4 rows)']
  ],
  refs: [
    ['EXPLAIN ANALYZE', 'using-explain.html#USING-EXPLAIN-ANALYZE'],
    ['work_mem', 'runtime-config-resource.html#GUC-WORK-MEM'],
    ['パラレルプラン', 'parallel-plans.html']
  ]
},
{
  id: 'G2.3-031', level: 'gold', cat: 'G2.3', type: 'scenario',
  q: '次の EXPLAIN ANALYZE の出力（cost の表示と一部の行を省略）から読み取れることとして、適切なものを2つ選びなさい。',
  code: 'Finalize GroupAggregate  (actual rows=47 loops=1)\n  Group Key: c.pref\n  ->  Gather Merge  (actual rows=81 loops=1)\n        Workers Planned: 1\n        Workers Launched: 1\n        ->  Partial GroupAggregate  (actual rows=40 loops=2)\n              ->  Sort  (actual rows=270 loops=2)\n                    ->  Nested Loop  (actual rows=270 loops=2)\n                          ->  Parallel Seq Scan on orders o  (actual rows=270 loops=2)\n                                Filter: (created_at < \'2026-01-01 00:10:00+00\'::timestamptz)\n                                Rows Removed by Filter: 134730\n                          ->  Index Scan using customers_pkey on customers c\n                                  (actual rows=1 loops=540)\n                                Index Cond: (id = o.customer_id)',
  choices: [
    'customers は orders の該当行ごとに主キーのインデックスで引かれ、Index Scan は合計 540 回実行された',
    'orders の Parallel Seq Scan では、2つのプロセスがそれぞれ約 13 万行を条件に合わないとして読み捨てている',
    '結合方式は Hash Join で、customers 全体からハッシュ表を作っている',
    'orders の created_at の条件には、インデックスが使われている',
    'Workers Launched: 1 は、リーダーを含めて1プロセスだけで処理したことを表す'
  ],
  answer: [0, 1],
  exp: 'EXPLAIN ANALYZE の actual rows と Rows Removed by Filter は1回（1ループ）あたりの平均です。Parallel Seq Scan は loops=2（リーダーとワーカー1つ）なので、各プロセスが平均 270 行を返し、約 13 万 5 千行を読み捨てています。条件に合う行がごく一部なのに全件を読んでいるため、created_at にインデックスを作る余地があります。\nNested Loop の内側の Index Scan は loops=540（270 行 × 2 プロセス）で、外側の行ごとに customers_pkey を使って1行ずつ引いています。\nWorkers Launched: 1 はワーカーが1つ起動したことを表し、リーダー自身も処理に参加するため、合わせて2プロセスで実行しています。\nこの計画は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['パラレルクエリの実行計画（ワーカー2つ）',
      '=# SET max_parallel_workers_per_gather = 2; SET parallel_setup_cost = 0; SET parallel_tuple_cost = 0; SET min_parallel_table_scan_size = 0; EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF, COSTS OFF) SELECT c.pref, count(*) FROM orders o JOIN customers c ON o.customer_id = c.id GROUP BY c.pref;\n                                                         QUERY PLAN\n-----------------------------------------------------------------------------------------------------------------------------\n Finalize GroupAggregate (actual rows=47 loops=1)\n   Group Key: c.pref\n   ->  Gather Merge (actual rows=141 loops=1)\n         Workers Planned: 2\n         Workers Launched: 2\n         ->  Sort (actual rows=47 loops=3)\n               Sort Key: c.pref\n               Sort Method: quicksort  Memory: 27kB\n               Worker 0:  Sort Method: quicksort  Memory: 27kB\n               Worker 1:  Sort Method: quicksort  Memory: 27kB\n               ->  Partial HashAggregate (actual rows=47 loops=3)\n                     Group Key: c.pref\n                     Batches: 1  Memory Usage: 24kB\n                     Worker 0:  Batches: 1  Memory Usage: 24kB\n                     Worker 1:  Batches: 1  Memory Usage: 24kB\n                     ->  Merge Join (actual rows=33333 loops=3)\n                           Merge Cond: (o.customer_id = c.id)\n                           ->  Parallel Index Only Scan using orders_customer_id_idx on orders o (actual rows=33333 loops=3)\n                                 Heap Fetches: 0\n                           ->  Index Scan using customers_pkey on customers c (actual rows=931 loops=3)\n(20 rows)']
  ],
  refs: [
    ['EXPLAIN ANALYZE', 'using-explain.html#USING-EXPLAIN-ANALYZE'],
    ['パラレルプラン', 'parallel-plans.html'],
    ['パラレル問い合わせの動作', 'how-parallel-query-works.html']
  ]
},

/* ---------------- G2.4 その他の性能監視（重要度 1 / 10問） ---------------- */
{
  id: 'G2.4-001', level: 'gold', cat: 'G2.4',
  q: '`pg_stat_statements` を使って SQL 文ごとの実行統計を収集したい。必要な設定として、正しいものを1つ選びなさい。',
  choices: [
    '対象データベースで CREATE EXTENSION pg_stat_statements を実行するだけでよい',
    'session_preload_libraries に pg_stat_statements を追加し、設定ファイルを再読み込みする',
    'log_statement を all に設定する',
    'shared_preload_libraries に追加してサーバを再起動し、CREATE EXTENSION を実行する',
    'track_activities を off に設定する'
  ],
  answer: 3,
  exp: 'pg_stat_statements は追加の共有メモリを必要とするため、postgresql.conf の shared_preload_libraries に pg_stat_statements を追加してサーバを再起動し、モジュールをロードする必要があります。\nそのうえで、統計を参照するデータベースで CREATE EXTENSION pg_stat_statements を実行すると、pg_stat_statements ビューで SQL ごとの実行回数・合計実行時間などを確認できます。\nlog_statement はログ出力の設定であり、pg_stat_statements の有効化とは無関係です。',
  refs: [
    ['pg_stat_statements', 'pgstatstatements.html'],
    ['shared_preload_libraries', 'runtime-config-client.html#GUC-SHARED-PRELOAD-LIBRARIES']
  ]
},
{
  id: 'G2.4-002', level: 'gold', cat: 'G2.4',
  q: '実行に3秒以上かかった SQL 文を、その実行時間とともにサーバログに出力したい。postgresql.conf の設定として、正しいものを1つ選びなさい。',
  choices: [
    'log_statement = \'3s\'',
    'log_duration = 3000',
    'log_min_duration_statement = 3000',
    'log_min_messages = 3000',
    'deadlock_timeout = \'3s\''
  ],
  answer: 2,
  exp: 'log_min_duration_statement は、実行に指定時間以上かかった文をその所要時間とともにログに出力します。単位を指定しない場合はミリ秒として扱われるため、3000 または \'3s\' と指定します。0 にするとすべての文の所要時間を出力し、-1（既定値）で無効になります。\nlog_duration は完了したすべての文の所要時間を出力するかどうかを指定する論理値、log_statement は none / ddl / mod / all で出力する文の種類を指定するパラメータです。\nlog_min_messages はログに出力するメッセージの重要度の閾値、deadlock_timeout はデッドロック検査までの待ち時間です。\nより詳しく実行計画も記録したい場合は auto_explain モジュールも利用できます。',
  refs: [
    ['log_min_duration_statement', 'runtime-config-logging.html#GUC-LOG-MIN-DURATION-STATEMENT'],
    ['auto_explain', 'auto-explain.html']
  ]
},
{
  id: 'G2.4-003', level: 'gold', cat: 'G2.4',
  q: 'contrib モジュール `auto_explain` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'auto_explain は、遅い問い合わせの実行計画を自動的に改善して実行する',
    'PostgreSQL をインストールすると、既定で有効になっている',
    '実行計画は、問い合わせの結果と一緒にクライアントへ返される',
    'auto_explain.log_min_duration を設定すると、指定時間以上かかった文の実行計画を自動的にサーバログに出力できる',
    'auto_explain を利用するには、pg_stat_statements も必ずロードしておく必要がある'
  ],
  answer: 3,
  exp: 'auto_explain は、実行に時間がかかった文の実行計画を自動的にサーバログに記録するモジュールです。LOAD \'auto_explain\'、session_preload_libraries、shared_preload_libraries のいずれかでロードし、auto_explain.log_min_duration（ミリ秒、-1 で無効）を設定します。\nauto_explain.log_analyze を on にすると EXPLAIN ANALYZE 相当の実測値も出力されますが、すべての文で計測を行うためオーバーヘッドが大きくなる点に注意が必要です。log_buffers、log_nested_statements（関数内の文も対象にする）などのパラメータもあります。\n実行計画を変更したり、クライアントに返したりはしません。',
  refs: [
    ['auto_explain', 'auto-explain.html']
  ]
},
{
  id: 'G2.4-004', level: 'gold', cat: 'G2.4',
  q: 'PostgreSQL 14 で pg_stat_statements を使い、合計実行時間の長い SQL を上位10件確認する問い合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'SELECT query, calls, total_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;',
    'SELECT query, calls, total_exec_time FROM pg_stat_activity ORDER BY total_exec_time DESC LIMIT 10;',
    'SELECT query, calls, total_exec_time FROM pg_stat_statements ORDER BY calls ASC LIMIT 10;',
    'SELECT relname, total_exec_time FROM pg_stat_user_tables ORDER BY total_exec_time DESC LIMIT 10;',
    'SHOW pg_stat_statements LIMIT 10;'
  ],
  answer: 0,
  exp: 'pg_stat_statements ビューには、正規化（定数を $1 などに置換）された SQL 文ごとに、実行回数（calls）、合計実行時間（total_exec_time、ミリ秒）、平均実行時間（mean_exec_time）、処理行数（rows）、共有バッファのヒット・読み込み数などが記録されます。total_exec_time の降順で並べると、システム全体の負荷への寄与が大きい SQL を把握できます。\nPostgreSQL 13 で total_time は total_exec_time に名称変更され、計画時間（total_plan_time）と区別されるようになりました。\n統計は pg_stat_statements_reset() でリセットできます。pg_stat_activity は現在実行中のセッションの情報です。',
  refs: [
    ['pg_stat_statements', 'pgstatstatements.html']
  ]
},
{
  id: 'G2.4-005', level: 'gold', cat: 'G2.4',
  q: '付属のベンチマークツール `pgbench` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pgbench は、本番環境で実行された SQL を記録して再生するツールである',
    '-c オプションは、実行するトランザクションの総数を指定する',
    '初期化を行わなくても、既存の任意のテーブルに対して標準のベンチマークを実行できる',
    '結果は1問い合わせあたりの平均時間（ミリ秒）だけが出力され、tps は表示されない',
    '-i で標準のテスト用テーブルを初期化し、-c でクライアント数、-T で実行時間を指定してベンチマークを行う'
  ],
  answer: 4,
  exp: 'pgbench は TPC-B に似たトランザクションを繰り返し実行して性能を測定するツールです。まず pgbench -i（-s でスケール係数を指定）で pgbench_accounts などのテスト用テーブルを作成・データ投入し、pgbench -c 10 -j 2 -T 60 のように、クライアント数（-c）、スレッド数（-j）、実行時間（-T、または -t でクライアントあたりのトランザクション数）を指定して実行します。\n結果として、1秒あたりのトランザクション数（tps）やレイテンシが出力されます。-f で独自のスクリプトを指定することもでき、パラメータ変更の効果の確認などに使われます。',
  refs: [
    ['pgbench', 'pgbench.html']
  ]
},
{
  id: 'G2.4-006', level: 'gold', cat: 'G2.4',
  q: '性能劣化の要因に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '長時間実行中のトランザクションがあっても、VACUUM は不要になった行をすべて回収できる',
    '長時間実行中のトランザクションがあると、その開始以降に不要になった行を VACUUM で回収できず、テーブルやインデックスが肥大化する',
    '自動バキュームが頻繁に実行されるほど、テーブルは肥大化しやすくなる',
    'テーブルの fillfactor を 100 にすると、更新による肥大化を防ぐことができる',
    '統計情報が古くても、実行計画の選択には影響しない'
  ],
  answer: 1,
  exp: 'VACUUM は、実行中のどのトランザクションからも参照される可能性がなくなった行だけを回収できます。長時間実行中のトランザクション（idle in transaction の放置を含む）や、古いレプリケーションスロット、hot_standby_feedback を有効にしたスタンバイの長時間の問い合わせがあると、その時点以降に削除・更新された行を回収できず、テーブルやインデックスが肥大化して性能が低下します。pg_stat_activity の backend_xmin や xact_start で原因のセッションを確認できます。\n自動バキュームは肥大化を防ぐ仕組みです。fillfactor を下げると HOT 更新が起こりやすくなります。統計情報が古いと、推定行数の誤りから不適切な実行計画が選ばれることがあります。',
  refs: [
    ['ディスク容量の回復', 'routine-vacuuming.html#VACUUM-FOR-SPACE-RECOVERY'],
    ['pg_stat_activity', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW']
  ]
},
{
  id: 'G2.4-007', level: 'gold', cat: 'G2.4',
  q: 'pg_stat_statements における問い合わせの集計単位に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '定数はパラメータ記号に置き換えて正規化されるため、値だけが異なる文は1行にまとめて集計される',
    '文字列としてまったく同一の SQL 文だけが同じ行に集計され、定数が異なれば別の行になる',
    '集計はテーブル単位で行われ、どの SQL 文が重いかは分からない',
    '同じ SQL 文であっても、実行したユーザやデータベースが違えば必ず同じ行にまとめられる',
    '実行計画が異なる場合は、同じ SQL 文でも別の行として集計される'
  ],
  answer: 0,
  exp: 'pg_stat_statements は SQL 文中の定数を $1、$2 のようなパラメータ記号に置き換えて正規化し、同じ形の文をまとめて集計します。これにより、値だけが違う大量の文を1つのエントリとして扱えます。\n集計の単位は queryid とユーザ（userid）、データベース（dbid）の組み合わせなので、同じ文でもユーザやデータベースが違えば別の行になります。\n記録できるエントリ数は pg_stat_statements.max（既定 5000）で制限され、超えると実行頻度の低いものから捨てられます。\npg_stat_statements_reset() でカウンタをリセットできます。',
  refs: [
    ['pg_stat_statements', 'pgstatstatements.html']
  ]
},
{
  id: 'G2.4-008', level: 'gold', cat: 'G2.4',
  q: '自動バキュームが想定どおり動いているかをログで確認したい。設定として正しいものを1つ選びなさい。',
  choices: [
    'log_autovacuum_min_duration を 0 以上に設定し、その時間を超えた自動バキュームの実行内容を記録する',
    'log_statement = \'all\' を設定すると、自動バキュームの実行内容もサーバログに記録される',
    'log_min_duration_statement を設定すると、自動バキュームの所要時間も記録される',
    'autovacuum = on にすると、実行のたびに必ずサーバログへ詳細が出力される',
    '自動バキュームの実行内容はログに出力できないため、pg_stat_activity を定期的に取得するしかない'
  ],
  answer: 0,
  exp: 'log_autovacuum_min_duration は、自動バキューム（および自動 ANALYZE）が指定した時間以上かかった場合に、対象テーブル、走査したページ数、削除したタプル数、所要時間などをサーバログに記録します。0 を指定するとすべての実行が記録され、-1（既定）では記録されません。\nlog_statement や log_min_duration_statement はクライアントから実行された SQL 文が対象で、自動バキュームは含まれません。\n実行中の自動バキュームは pg_stat_activity や pg_stat_progress_vacuum でも確認できますが、事後の確認にはログが適しています。',
  refs: [
    ['log_autovacuum_min_duration', 'runtime-config-logging.html#GUC-LOG-AUTOVACUUM-MIN-DURATION'],
    ['定常的なバキューム作業', 'routine-vacuuming.html']
  ]
},
{
  id: 'G2.4-009', level: 'gold', cat: 'G2.4',
  q: '`pg_stat_statements` の設定に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'track_planning を on にすると、計画作成にかかった時間も記録される',
    'track_utility を off にすると、VACUUM や SET などのユーティリティコマンドは集計されなくなる',
    'pg_stat_statements.max を超えると、新しい問い合わせは記録されずエラーになる',
    'track に top を指定すると、関数の内部で実行された文まで記録される',
    'pg_stat_statements_reset() を実行すると、モジュール自体が無効になる'
  ],
  answer: [0, 1],
  exp: 'track_planning（既定 off）を on にすると、実行時間に加えて計画作成の回数と時間（plans、total_plan_time）が記録されます。オーバーヘッドがあるため既定は off です。\ntrack_utility（既定 on）は、SELECT などの問い合わせ以外のコマンドを集計するかどうかの指定です。\npg_stat_statements.max（既定 5000）を超えると、実行頻度の低いエントリから捨てられます。エラーにはなりません。\ntrack の既定 top は「クライアントから直接実行された文」、all は「関数などの内部で実行された文も含む」、none は記録しない、です。\npg_stat_statements_reset() は統計を消すだけで、収集自体は続きます。',
  refs: [
    ['pg_stat_statements', 'pgstatstatements.html']
  ]
},
{
  id: 'G2.4-010', level: 'gold', cat: 'G2.4', type: 'scenario',
  q: 'pg_stat_statements で合計実行時間の長い文を確認したところ、次の結果になった（一部の列）。説明として最も適切なものを1つ選びなさい。',
  code: ' calls | total_ms | mean_ms |                          query\n-------+----------+---------+---------------------------------------------------------\n     4 |  30255.5 | 7563.89 | SELECT pg_sleep($1)\n     2 |  18530.1 | 9265.06 | UPDATE accounts SET balance = balance + $1 WHERE id = $\n     1 |   4520.5 | 4520.49 | INSERT INTO orders (customer_id, status, amount, create\n     2 |   3303.5 | 1651.75 | UPDATE orders SET amount = amount + $1 WHERE id % $2 =',
  choices: [
    'UPDATE accounts は1回平均約9秒かかっているが、単純な主キー更新なので、ロック待ちの時間を含んでいないか確認する',
    'total_ms は1回あたりの実行時間なので、SELECT pg_sleep($1) が最も遅い1回の実行である',
    'query 列の $1 や $2 は、実行時にエラーになったパラメータの位置を表す',
    'calls が少ない文は影響が小さいので、平均実行時間を確認する必要はない',
    'mean_ms は total_ms を行数で割った、1行あたりの処理時間である'
  ],
  answer: 0,
  exp: 'pg_stat_statements の実行時間（exec_time）は、文の実行にかかった経過時間で、実行中に発生したロック待ちの時間も含まれます。この例の UPDATE accounts は主キーで1行を更新するだけですが、別のトランザクションが同じ行を更新したまま待たせていたため、平均約9秒かかっていました。CPU やインデックスの問題ではないため、pg_stat_activity や log_lock_waits でロックの状況を確認します。\ntotal_ms（total_exec_time）は合計、mean_ms（mean_exec_time）は1回あたりの平均です。\n$1 などは、定数を正規化して同じ形の文をまとめたことを表します。\ncalls が少なくても、1回が長い文は利用者への影響が大きいことがあります。\nこの結果は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['pg_stat_statements の出力',
      'shared_preload_libraries\n--------------------------\n pg_stat_statements\n(1 row)\n\n=# SELECT calls, round(total_exec_time::numeric, 1) AS total_ms, round(mean_exec_time::numeric, 2) AS mean_ms, left(query, 50) AS query FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 5;\n calls | total_ms | mean_ms  |                       query\n-------+----------+----------+----------------------------------------------------\n     4 |  51077.2 | 12769.30 | SELECT pg_sleep($1)\n     4 |  25027.6 |  6256.90 | UPDATE accounts SET balance = balance + $1 WHERE i\n     4 |  12768.6 |  3192.16 | UPDATE orders SET amount = amount + $1\n     2 |   1054.7 |   527.36 | CREATE DATABASE evid\n     1 |    786.4 |   786.44 | CREATE DATABASE shop2\n(5 rows)']
  ],
  refs: [
    ['pg_stat_statements', 'pgstatstatements.html'],
    ['明示的ロック', 'explicit-locking.html']
  ]
},

);
