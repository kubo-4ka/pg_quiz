/*
 * バージョン差分 V1 バージョン間の主な変更点（試験範囲外）（58問）
 * 試験範囲外。PostgreSQL 各バージョンのリリースノートや文書に基づくオリジナル問題。形式は DEVELOPMENT.md を参照。
 * tools/format.js で整形しています（node tools/format.js）。
 */
(window.PGQ_QUESTIONS = window.PGQ_QUESTIONS || []).push(

/* ---------------- V1.1 ディレクトリ・ファイル構成の変更（8問） ---------------- */
{
  id: 'V1.1-001', level: 'ver', cat: 'V1.1',
  q: '【バージョン差分】PostgreSQL 10 で名称が変更されたデータディレクトリ内のディレクトリの組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'pg_xlog → pg_wal、pg_clog → pg_xact',
    'pg_wal → pg_xlog、pg_xact → pg_clog',
    'pg_log → pg_wal、pg_clog → pg_commit',
    'base → data、global → shared',
    'pg_xlog → pg_redo、pg_clog → pg_status'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 10 で、WAL を格納する pg_xlog は pg_wal に、トランザクションのコミット状態を格納する pg_clog は pg_xact に名称変更されました。名前に「log」を含むため、不要なログファイルと誤解されて削除される事故を防ぐことが目的です。\nあわせて log_directory の既定値も pg_log から log に変わり、pg_resetxlog → pg_resetwal などのコマンドや、xlog を含む関数名も wal を含む名前に変更されています。\n9.6 以前の手順書やスクリプト、監視設定（ディスク容量の監視パスなど）を流用する際の注意点です。',
  refs: [
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/'],
    ['データベースファイルのレイアウト（PG14）', 'https://www.postgresql.jp/document/14/html/storage-file-layout.html']
  ]
},
{
  id: 'V1.1-002', level: 'ver', cat: 'V1.1',
  q: '【バージョン差分】PostgreSQL 12 でのリカバリ設定の変更に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'recovery.conf は postgresql.conf から include して読み込む方式に変わった',
    'recovery.conf は廃止されてリカバリ関連の設定は postgresql.conf などに記述するようになり、recovery.conf が存在するとサーバは起動しない',
    'スタンバイモードは、引き続き standby_mode = on で指定する',
    'recovery.conf と postgresql.conf の両方に設定がある場合は、recovery.conf の値が優先される',
    'recovery.signal と standby.signal は PostgreSQL 10 で導入され、12 で廃止された'
  ],
  answer: 1,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 12 で recovery.conf は廃止され、restore_command、recovery_target_*、primary_conninfo などのパラメータは通常の設定パラメータとして postgresql.conf（や postgresql.auto.conf）に記述するようになりました。データディレクトリに recovery.conf があるとサーバは起動しません。\nアーカイブリカバリは recovery.signal、スタンバイモードは standby.signal というファイルの有無で指定し、standby_mode パラメータは削除されました。trigger_file も promote_trigger_file に改名されています（16 で削除）。\nPostgreSQL 11 以前のレプリケーション構築手順を流用する際に、特に注意が必要な非互換です。',
  refs: [
    ['PostgreSQL 12 リリースノート（英語）', 'https://www.postgresql.org/docs/release/12.0/'],
    ['アーカイブリカバリの設定（PG14）', 'https://www.postgresql.jp/document/14/html/runtime-config-wal.html#RUNTIME-CONFIG-WAL-ARCHIVE-RECOVERY']
  ]
},
{
  id: 'V1.1-003', level: 'ver', cat: 'V1.1',
  q: '【バージョン差分】ALTER SYSTEM コマンドと、その設定値を書き込む postgresql.auto.conf が導入されたバージョンとして、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 9.0',
    'PostgreSQL 9.4',
    'PostgreSQL 10',
    'PostgreSQL 12',
    'PostgreSQL 14'
  ],
  answer: 1,
  shuffle: false,
  exp: '※試験範囲外（バージョン差分）\nALTER SYSTEM は PostgreSQL 9.4 で導入され、SQL からサーバのパラメータを変更して postgresql.auto.conf に書き込めるようになりました。postgresql.auto.conf は postgresql.conf の後に読み込まれるため、同じパラメータでは ALTER SYSTEM の値が優先されます。\n設定ファイルを直接編集したのに値が反映されない場合は、postgresql.auto.conf に同じパラメータが残っていないか（pg_settings の sourcefile 列など）を確認するのが実務上のポイントです。\nPostgreSQL 9.4 では、論理デコーディングや jsonb 型も導入されています。',
  refs: [
    ['PostgreSQL 9.4 リリースノート（英語）', 'https://www.postgresql.org/docs/release/9.4.0/'],
    ['ALTER SYSTEM（PG14）', 'https://www.postgresql.jp/document/14/html/sql-altersystem.html']
  ]
},
{
  id: 'V1.1-004', level: 'ver', cat: 'V1.1',
  q: '【バージョン差分】スタンバイの昇格方法の変遷に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 16 で pg_ctl promote が廃止され、トリガーファイルによる昇格だけになった',
    'pg_promote() 関数は PostgreSQL 16 で初めて追加された',
    'PostgreSQL 16 で promote_trigger_file が削除され、昇格には pg_ctl promote または pg_promote() 関数を使う',
    'PostgreSQL 12 以降は、standby.signal ファイルを削除するだけで稼働中のスタンバイが即座に昇格する',
    'trigger_file パラメータは、現在のバージョンでも recovery.conf に記述して利用できる'
  ],
  answer: 2,
  exp: '※試験範囲外（バージョン差分）\nかつてはトリガーファイル（recovery.conf の trigger_file、PostgreSQL 12 からは promote_trigger_file パラメータ）を作成してスタンバイを昇格させる方法がありましたが、PostgreSQL 16 で promote_trigger_file は削除されました。\n現在は pg_ctl promote コマンド、または PostgreSQL 12 で追加された SQL 関数 pg_promote() で昇格させます。\n古いバージョンのフェイルオーバースクリプトやクラスタ管理ツールの設定を移行する際の確認ポイントです。',
  refs: [
    ['PostgreSQL 16 リリースノート（英語）', 'https://www.postgresql.org/docs/release/16.0/'],
    ['PostgreSQL 12 リリースノート（英語）', 'https://www.postgresql.org/docs/release/12.0/']
  ]
},
{
  id: 'V1.1-005', level: 'ver', cat: 'V1.1',
  q: '【バージョン差分】PostgreSQL 10 で変更された、サーバログの既定の出力先ディレクトリに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'log_directory の既定値が pg_log から log に変更された',
    'log_directory の既定値が log から pg_log に変更された',
    'log_directory の既定値がデータディレクトリの外の /var/log/postgresql に変更された',
    'log_directory が廃止され、ログの出力先は log_destination だけで決まるようになった',
    'サーバログはデータディレクトリに出力できなくなり、syslog の使用が必須になった'
  ],
  answer: 0,
  exp: 'PostgreSQL 10 では、WAL ディレクトリが pg_xlog から pg_wal へ、コミットログが pg_clog から pg_xact へ改名されたのと同時に、ログ出力先の既定値も pg_log から log に変更されました。いずれも「pg_ で始まるディレクトリは消してはいけない内部データ」という誤解を避けるための整理です。\nこのため、9.6 以前を前提としたログ収集の設定やスクリプトは、パスの修正が必要になります。\nlog_directory 自体は残っており、任意のパスを指定できます（絶対パスも可）。',
  refs: [
    ['エラー報告とログ取得', 'runtime-config-logging.html#GUC-LOG-DIRECTORY'],
    ['データベースファイルのレイアウト', 'storage-file-layout.html']
  ]
},
{
  id: 'V1.1-006', level: 'ver', cat: 'V1.1',
  q: '【バージョン差分】稼働統計情報の一時ファイルと `stats_temp_directory` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 14 までは統計収集プロセスが一時ファイルを書いていたが、15 で共有メモリ方式になり不要になった',
    'PostgreSQL 15 で stats_temp_directory の既定値が、RAM ディスク上のパスに変更された',
    'stats_temp_directory は PostgreSQL 14 で追加された新しいパラメータである',
    '統計情報の一時ファイルはデータディレクトリの外に置くことができない',
    'stats_temp_directory を変更すると、収集済みの統計情報はすべて失われる'
  ],
  answer: 0,
  exp: 'PostgreSQL 14 までは、統計収集プロセス（stats collector）が稼働統計を stats_temp_directory（既定 pg_stat_tmp）に一時ファイルとして書き出し、停止時に pg_stat へ保存していました。更新が頻繁なため、このディレクトリを RAM ディスクに置くチューニングがよく行われました。\nPostgreSQL 15 で統計情報は共有メモリで管理されるようになり、統計収集プロセスと stats_temp_directory は廃止されました。\nこのため、15 以降へ移行する際は、RAM ディスクの設定や stats_temp_directory の記述を削除する必要があります。',
  refs: [
    ['累積統計システム', 'monitoring-stats.html'],
    ['実行時統計情報', 'runtime-config-statistics.html']
  ]
},
{
  id: 'V1.1-007', level: 'ver', cat: 'V1.1',
  q: '【バージョン差分】テーブル空間のディレクトリ構成に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 9.0 以降、テーブル空間の下に PG_バージョン_カタログ番号 というサブディレクトリが作られる',
    'テーブル空間の下には、データベースの OID のディレクトリが直接作られる',
    'テーブル空間の実体は pg_tblspc の中にあり、シンボリックリンクは使われない',
    'テーブル空間はバージョンごとにディレクトリが分かれないため、pg_upgrade では使用できない',
    'テーブル空間のディレクトリ名は、CREATE TABLESPACE で指定したテーブル空間名になる'
  ],
  answer: 0,
  exp: 'PostgreSQL 9.0 以降、テーブル空間のディレクトリの下には PG_14_202107181 のように「PG_メジャーバージョン_カタログバージョン番号」という名前のサブディレクトリが作られ、その下にデータベース OID のディレクトリが置かれます。\nこれにより、同じテーブル空間のディレクトリを異なるメジャーバージョンが同時に使えるようになり、pg_upgrade によるアップグレードが行えます。\nデータディレクトリの pg_tblspc には、このディレクトリを指すシンボリックリンクが、テーブル空間の OID を名前として作られます。',
  refs: [
    ['データベースファイルのレイアウト', 'storage-file-layout.html'],
    ['テーブル空間', 'manage-ag-tablespaces.html']
  ]
},
{
  id: 'V1.1-008', level: 'ver', cat: 'V1.1',
  q: '【バージョン差分】PostgreSQL 17 の増分バックアップで使われるディレクトリとパラメータの組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'pg_wal/summaries ディレクトリと summarize_wal パラメータ',
    'pg_incremental ディレクトリと incremental_backup パラメータ',
    'pg_wal/increments ディレクトリと wal_summary パラメータ',
    'pg_backup ディレクトリと archive_incremental パラメータ',
    '専用のディレクトリはなく、pg_wal に直接記録される'
  ],
  answer: 0,
  exp: 'PostgreSQL 17 で追加された増分バックアップでは、walsummarizer プロセスが WAL を読み取り、どのブロックが変更されたかの要約を pg_wal/summaries ディレクトリに出力します。この機能は summarize_wal パラメータ（既定 off）で有効にします。\nバックアップは pg_basebackup --incremental=前回のマニフェスト で取得し、復元時には pg_combinebackup でフルバックアップと結合します。\nPostgreSQL 16 以前には増分バックアップの機能がないため、差分取得には外部ツール（pgBackRest など）を使う必要がありました。',
  refs: [
    ['PostgreSQL 17 リリースノート（英語）', 'https://www.postgresql.org/docs/release/17.0/'],
    ['継続的アーカイブ', 'continuous-archiving.html']
  ]
},

/* ---------------- V1.2 コマンド・関数の名称変更（9問） ---------------- */
{
  id: 'V1.2-001', level: 'ver', cat: 'V1.2',
  q: '【バージョン差分】PostgreSQL 10 で名称変更されたサーバ・クライアントアプリケーションの組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'pg_resetxlog → pg_resetwal、pg_xlogdump → pg_waldump、pg_receivexlog → pg_receivewal',
    'pg_resetwal → pg_resetxlog、pg_waldump → pg_xlogdump、pg_receivewal → pg_receivexlog',
    'pg_dump → pg_export、pg_restore → pg_import、pg_dumpall → pg_exportall',
    'pg_ctl → pg_service、initdb → pg_initdb、postmaster → pg_server',
    'pg_basebackup → pg_backup、pg_rewind → pg_resync、pg_upgrade → pg_migrate'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 10 でディレクトリ pg_xlog が pg_wal に改名されたのに合わせて、名前に xlog を含むプログラムも wal を含む名前に変更されました。\n・pg_resetxlog → pg_resetwal\n・pg_xlogdump → pg_waldump\n・pg_receivexlog → pg_receivewal\nあわせて pg_basebackup の --xlog-method は --wal-method に、--xlogdir は --waldir（initdb も同様）に変更されています。',
  refs: [
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/'],
    ['pg_resetwal（PG14）', 'https://www.postgresql.jp/document/14/html/app-pgresetwal.html']
  ]
},
{
  id: 'V1.2-002', level: 'ver', cat: 'V1.2',
  q: '【バージョン差分】PostgreSQL 10 以降で、プライマリの現在の WAL 書き込み位置を取得する関数として、正しいものを1つ選びなさい。',
  choices: [
    'pg_current_xlog_location()',
    'pg_current_wal_lsn()',
    'pg_current_wal_location()',
    'pg_wal_position()',
    'pg_current_lsn()'
  ],
  answer: 1,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 10 で、名前に xlog を含む関数は wal に、WAL の位置を表す location は lsn（Log Sequence Number）に名称が統一されました。\n・pg_current_xlog_location() → pg_current_wal_lsn()\n・pg_last_xlog_replay_location() → pg_last_wal_replay_lsn()\n・pg_switch_xlog() → pg_switch_wal()\n・pg_xlogfile_name() → pg_walfile_name()\npg_stat_replication ビューの sent_location なども sent_lsn などに変わったため、9.6 以前向けの監視クエリはそのままでは動きません。',
  refs: [
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/'],
    ['バックアップ制御関数（PG14）', 'https://www.postgresql.jp/document/14/html/functions-admin.html#FUNCTIONS-ADMIN-BACKUP']
  ]
},
{
  id: 'V1.2-003', level: 'ver', cat: 'V1.2',
  q: '【バージョン差分】低レベル API によるオンラインバックアップの関数の変更に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 15 で非排他的バックアップモードが削除され、排他的バックアップモードだけが残った',
    'PostgreSQL 15 で排他モードが削除され、関数名が pg_backup_start() / pg_backup_stop() に変わった',
    '関数名は PostgreSQL 14 で変更され、15 で排他的バックアップモードが追加された',
    '低レベル API は PostgreSQL 15 で完全に廃止され、pg_basebackup しか使えなくなった',
    'PostgreSQL 15 以降も pg_start_backup() は別名として残っており、既存のスクリプトはそのまま動く'
  ],
  answer: 1,
  exp: '※試験範囲外（バージョン差分）\n排他的バックアップモードは、バックアップ中にサーバがクラッシュすると backup_label が残って再起動できなくなるおそれがあるなどの理由で 9.6 から非推奨とされ、PostgreSQL 15 で削除されました。\nあわせて関数名は pg_start_backup() → pg_backup_start()、pg_stop_backup() → pg_backup_stop() に変更され、旧名の関数は残っていません。非排他的モードと同様に、開始したセッションを終了まで維持し、pg_backup_stop() が返す backup_label の内容を保存します。\n古いバックアップスクリプトを 15 以降で使うと関数が存在せずエラーになるため、移行時の確認が必要です。',
  refs: [
    ['PostgreSQL 15 リリースノート（英語）', 'https://www.postgresql.org/docs/release/15.0/'],
    ['低レベルAPIを使用したベースバックアップ（PG14）', 'https://www.postgresql.jp/document/14/html/continuous-archiving.html#BACKUP-LOWLEVEL-BASE-BACKUP']
  ]
},
{
  id: 'V1.2-004', level: 'ver', cat: 'V1.2',
  q: '【バージョン差分】PostgreSQL 10 で削除されたクライアントアプリケーションとして、正しいものを1つ選びなさい。',
  choices: [
    'createlang / droplang',
    'createuser / dropuser',
    'createdb / dropdb',
    'pg_isready',
    'vacuumdb'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\ncreatelang / droplang は手続き言語をデータベースに登録・削除するコマンドでしたが、9.1 以降は手続き言語が拡張（CREATE EXTENSION）として管理されるようになり、PostgreSQL 10 で削除されました。\nPL/pgSQL は 9.0 以降、既定で各データベースにインストールされています。その他の手続き言語は CREATE EXTENSION plperl; のように登録します。',
  refs: [
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/'],
    ['CREATE EXTENSION（PG14）', 'https://www.postgresql.jp/document/14/html/sql-createextension.html']
  ]
},
{
  id: 'V1.2-005', level: 'ver', cat: 'V1.2',
  q: '【バージョン差分】PostgreSQL 10 における WAL 関連の関数名の変更として、正しいものを1つ選びなさい。',
  choices: [
    'pg_switch_xlog() が pg_switch_wal() に、pg_xlog_location_diff() が pg_wal_lsn_diff() に変更された',
    'pg_switch_wal() が pg_switch_xlog() に、pg_wal_lsn_diff() が pg_xlog_location_diff() に変更された',
    '関数名は変更されず、ディレクトリ名だけが pg_xlog から pg_wal に変更された',
    'WAL 関連の関数はすべて削除され、システムビューの参照に置き換えられた',
    '旧名の関数は別名として残されているため、9.6 以前のスクリプトもそのまま動作する'
  ],
  answer: 0,
  exp: 'PostgreSQL 10 では、ディレクトリ名の pg_xlog → pg_wal に合わせて、関数名に含まれる xlog が wal に、location が lsn に統一されました。pg_switch_xlog() → pg_switch_wal()、pg_xlog_location_diff() → pg_wal_lsn_diff()、pg_current_xlog_location() → pg_current_wal_lsn()、pg_last_xlog_replay_location() → pg_last_wal_replay_lsn() などが該当します。\n旧名は残されていないため、監視スクリプトや運用手順は書き換えが必要です。\n同時にコマンドも pg_receivexlog → pg_receivewal、pg_resetxlog → pg_resetwal、pg_xlogdump → pg_waldump と改名されました。',
  refs: [
    ['バックアップ制御関数', 'functions-admin.html#FUNCTIONS-ADMIN-BACKUP'],
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/']
  ]
},
{
  id: 'V1.2-006', level: 'ver', cat: 'V1.2',
  q: '【バージョン差分】PostgreSQL 10 における `pg_stat_replication` ビューの変更として、正しいものを1つ選びなさい。',
  choices: [
    'sent_location などの列名が sent_lsn のように lsn を使う名前に変更された',
    'sent_lsn などの列名が sent_location のように location を使う名前に変更された',
    'ビュー名が pg_stat_replication から pg_stat_wal_replication に変更された',
    'レプリケーションの遅延を秒で表す write_lag などの列は、PostgreSQL 14 で削除された',
    '列名は変更されておらず、9.6 以前と同じ監視クエリがそのまま使える'
  ],
  answer: 0,
  exp: 'PostgreSQL 10 では、WAL の位置を表す用語が location から lsn（Log Sequence Number）に統一されました。pg_stat_replication の列も sent_location → sent_lsn、write_location → write_lsn、flush_location → flush_lsn、replay_location → replay_lsn と変更されています。\nこのため、9.6 以前を対象にしたレプリケーション監視の SQL は、10 以降では列名エラーになります。\nなお PostgreSQL 10 では、遅延を時間で表す write_lag / flush_lag / replay_lag 列も追加されました（14 でも利用できます）。',
  refs: [
    ['pg_stat_replication', 'monitoring-stats.html#MONITORING-PG-STAT-REPLICATION-VIEW'],
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/']
  ]
},
{
  id: 'V1.2-007', level: 'ver', cat: 'V1.2',
  q: '【バージョン差分】`pg_stat_statements` の列名の変更に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 13 で total_time が total_exec_time に変わり、計画時間を表す total_plan_time が追加された',
    'PostgreSQL 13 で total_exec_time が total_time に統合され、計画時間と実行時間の区別がなくなった',
    'PostgreSQL 13 で calls 列が削除され、実行回数は別のビューで確認するようになった',
    'PostgreSQL 13 で列名は変わらず、単位がミリ秒から秒に変更された',
    'pg_stat_statements は PostgreSQL 13 で削除され、pg_stat_activity に統合された'
  ],
  answer: 0,
  exp: 'PostgreSQL 13 で pg_stat_statements に計画（プラン作成）の統計が追加され、従来の total_time は実行時間を表す total_exec_time に改名されました。あわせて min_time / max_time / mean_time / stddev_time も *_exec_time になり、計画側の total_plan_time などが追加されています。\nこのため、12 以前を対象に書いたスロークエリ抽出の SQL は 13 以降では列名エラーになります。逆に 13 以降向けの SQL は 12 以前で動きません。\n計画側の統計を取るには pg_stat_statements.track_planning を on にする必要があります（既定は off）。',
  refs: [
    ['pg_stat_statements', 'pgstatstatements.html']
  ]
},
{
  id: 'V1.2-008', level: 'ver', cat: 'V1.2',
  q: '【バージョン差分】データチェックサムを扱うコマンドに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 11 で pg_verify_checksums として追加され、12 で pg_checksums に改名されて有効化・無効化も行えるようになった',
    'PostgreSQL 11 で pg_checksums として追加され、12 で pg_verify_checksums に改名された',
    'チェックサムの有効化は initdb でしか行えず、後から変更する専用コマンドは存在しない',
    'pg_checksums はサーバが稼働している状態で実行する必要がある',
    'pg_checksums は WAL のチェックサムを検証するコマンドである'
  ],
  answer: 0,
  exp: 'データチェックサムを検証するコマンドは PostgreSQL 11 で pg_verify_checksums という名前で追加され、12 で pg_checksums に改名されました。12 以降は検証（--check）だけでなく、停止中のクラスタに対する有効化（--enable）と無効化（--disable）も行えます。\nそれ以前は、チェックサムを有効にするには initdb --data-checksums でクラスタを作り直すしかありませんでした。\npg_checksums はクラスタが停止している状態で実行します。対象はデータファイルのページのチェックサムです。',
  refs: [
    ['pg_checksums', 'app-pgchecksums.html'],
    ['initdb', 'app-initdb.html']
  ]
},
{
  id: 'V1.2-009', level: 'ver', cat: 'V1.2',
  q: '【バージョン差分】比較的新しいバージョンで削除されたものの説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 16 で postmaster という名前のシンボリックリンクが、17 で adminpack モジュールが削除された',
    'PostgreSQL 16 で postgres コマンドが削除され、postmaster に統一された',
    'PostgreSQL 17 で pg_ctl コマンドが削除され、systemd の利用が必須になった',
    'PostgreSQL 16 で psql が削除され、専用の GUI ツールに置き換えられた',
    'PostgreSQL 17 で pg_dump が削除され、pg_basebackup に統合された'
  ],
  answer: 0,
  exp: 'かつてサーバの実行ファイルは postmaster という名前で、後に postgres に統一された後も互換性のためのシンボリックリンクが残されていました。これは PostgreSQL 16 で削除されたため、起動スクリプトが postmaster を直接呼んでいる場合は修正が必要です。\nサーバログや ps の出力に現れる「postmaster プロセス」という呼び方自体は、今も親プロセスを指す用語として使われます。\nまた、サーバ上のファイル操作や設定ファイル編集の関数を提供していた contrib モジュールの adminpack は、PostgreSQL 17 で削除されました。\npg_ctl、psql、pg_dump は現在も標準のツールです。',
  refs: [
    ['PostgreSQL 16 リリースノート（英語）', 'https://www.postgresql.org/docs/release/16.0/'],
    ['PostgreSQL 17 リリースノート（英語）', 'https://www.postgresql.org/docs/release/17.0/']
  ]
},

/* ---------------- V1.3 設定パラメータの変更（12問） ---------------- */
{
  id: 'V1.3-001', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】PostgreSQL 9.5 で削除され、max_wal_size と min_wal_size に置き換えられたパラメータとして、正しいものを1つ選びなさい。',
  choices: [
    'checkpoint_segments',
    'checkpoint_timeout',
    'wal_buffers',
    'wal_keep_segments',
    'archive_timeout'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\n9.4 以前は、チェックポイント間の WAL の量を WAL セグメントの数で指定する checkpoint_segments（既定 3 = 約 48MB）でチェックポイントの頻度を制御していました。PostgreSQL 9.5 でこれは削除され、WAL のサイズで指定する max_wal_size（9.5 の既定値は 1GB）と、再利用のために保持する最小量を指定する min_wal_size に置き換えられました。\n古い設定ファイルに checkpoint_segments が残っていると、9.5 以降のサーバは不明なパラメータとしてエラーを出して起動しません。wal_keep_segments は PostgreSQL 13 で wal_keep_size に置き換えられています。',
  refs: [
    ['PostgreSQL 9.5 リリースノート（英語）', 'https://www.postgresql.org/docs/release/9.5.0/'],
    ['WALの設定（PG14）', 'https://www.postgresql.jp/document/14/html/wal-configuration.html']
  ]
},
{
  id: 'V1.3-002', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】レプリケーションのための WAL 保持に関するパラメータの変更として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 13 で wal_keep_segments は wal_keep_size に置き換えられ、保持量をセグメント数ではなくサイズで指定するようになった',
    'PostgreSQL 13 で max_slot_wal_keep_size が削除された',
    'wal_keep_size は PostgreSQL 16 で追加されたパラメータである',
    'PostgreSQL 14 以降でも、wal_keep_segments と wal_keep_size の両方を指定できる',
    'wal_keep_size に指定する値の単位は WAL セグメントの個数である'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 13 で、スタンバイのためにプライマリで保持する WAL の量を指定する wal_keep_segments（セグメント数）は削除され、wal_keep_size（サイズ、MB など）に置き換えられました。旧パラメータ名を設定ファイルに残すとエラーになります。\n同じく PostgreSQL 13 では、レプリケーションスロットが保持する WAL の上限を設定する max_slot_wal_keep_size が追加され、スロットによる WAL の無制限な蓄積を防げるようになりました。',
  refs: [
    ['PostgreSQL 13 リリースノート（英語）', 'https://www.postgresql.org/docs/release/13.0/'],
    ['wal_keep_size（PG14）', 'https://www.postgresql.jp/document/14/html/runtime-config-replication.html#GUC-WAL-KEEP-SIZE']
  ]
},
{
  id: 'V1.3-003', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】wal_level の変遷に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '9.6 で archive と hot_standby が replica に統合され、10 で既定値が replica になった',
    'PostgreSQL 10 で replica は廃止され、archive と hot_standby に分割された',
    'logical は PostgreSQL 14 で追加された値である',
    'PostgreSQL 10 以降、wal_level の既定値は logical である',
    'wal_level の値 minimal は PostgreSQL 12 で削除された'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\n9.5 以前の wal_level には minimal、archive（WAL アーカイブ用）、hot_standby（ホットスタンバイ用）、logical（9.4 で追加）がありました。PostgreSQL 9.6 で archive と hot_standby は replica に統合され、旧値を指定すると replica として扱われます。\nPostgreSQL 10 では wal_level の既定値が minimal から replica に変わり、max_wal_senders などの既定値も変更されたため、既定の設定のままでもレプリケーションや pg_basebackup を利用しやすくなりました。',
  refs: [
    ['PostgreSQL 9.6 リリースノート（英語）', 'https://www.postgresql.org/docs/release/9.6.0/'],
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/'],
    ['wal_level（PG14）', 'https://www.postgresql.jp/document/14/html/runtime-config-wal.html#GUC-WAL-LEVEL']
  ]
},
{
  id: 'V1.3-004', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】パスワード認証に関する変遷の説明として、正しいものを1つ選びなさい。',
  choices: [
    'SCRAM-SHA-256 認証は PostgreSQL 14 で初めて導入された',
    'PostgreSQL 14 で md5 認証方式は削除され、pg_hba.conf に md5 と書くとエラーになる',
    'password_encryption を scram-sha-256 に変更すると、既存の MD5 形式のパスワードも自動的に SCRAM 形式に変換される',
    'PostgreSQL 14 で password_encryption の既定値が scram-sha-256 になり、PostgreSQL 18 では MD5 パスワードの使用が非推奨となった',
    'PostgreSQL 16 で MD5 パスワードは完全に使用できなくなった'
  ],
  answer: 3,
  exp: '※試験範囲外（バージョン差分）\nSCRAM-SHA-256 認証は PostgreSQL 10 で導入され、PostgreSQL 14 で password_encryption の既定値が md5 から scram-sha-256 に変わりました。PostgreSQL 18 では MD5 パスワードが非推奨となり、MD5 形式のパスワードを設定すると警告が出るようになりました（将来のバージョンで削除予定）。\nパスワードのハッシュは設定時の形式で保存されるため、password_encryption を変更しても既存のパスワードは変換されません。SCRAM に移行するには、各ロールのパスワードを設定し直す必要があります。\nクライアントドライバが SCRAM に対応しているかも、移行時の確認ポイントです。',
  refs: [
    ['PostgreSQL 14 リリースノート（英語）', 'https://www.postgresql.org/docs/release/14.0/'],
    ['PostgreSQL 18 リリースノート（英語）', 'https://www.postgresql.org/docs/release/18.0/'],
    ['パスワード認証（PG14）', 'https://www.postgresql.jp/document/14/html/auth-password.html']
  ]
},
{
  id: 'V1.3-005', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】稼働統計情報の仕組みの変更に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 15 で track_counts パラメータが削除され、統計情報は常に収集されるようになった',
    'PostgreSQL 15 で pg_stat_activity ビューが廃止され、pg_stat_io に置き換えられた',
    'PostgreSQL 15 で stats collector が廃止されて統計は共有メモリに移り、stats_temp_directory も削除された',
    '統計情報コレクタは PostgreSQL 17 で新たに追加されたプロセスである',
    'PostgreSQL 15 以降、統計情報は稼働中も常に pg_stat_tmp ディレクトリのファイルに書き出されている'
  ],
  answer: 2,
  exp: '※試験範囲外（バージョン差分）\n14 以前は stats collector プロセスが UDP で統計情報を受け取り、stats_temp_directory（既定 pg_stat_tmp）のファイルに書き出していました。PostgreSQL 15 で統計情報は共有メモリで管理されるようになり、stats collector プロセスと stats_temp_directory パラメータは削除されました。統計情報はサーバの正常停止時に pg_stat ディレクトリに保存されます。\nPostgreSQL 16 では I/O の統計を表示する pg_stat_io ビューが追加されています。\n14 以前でよく行われた「stats_temp_directory を RAM ディスクに置く」チューニングは、15 以降は不要です。',
  refs: [
    ['PostgreSQL 15 リリースノート（英語）', 'https://www.postgresql.org/docs/release/15.0/'],
    ['PostgreSQL 16 リリースノート（英語）', 'https://www.postgresql.org/docs/release/16.0/']
  ]
},
{
  id: 'V1.3-006', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】PostgreSQL 15 でログ関連パラメータの既定値が変更された。その内容として、正しいものを1つ選びなさい。',
  choices: [
    'log_checkpoints の既定値が on になり、log_autovacuum_min_duration の既定値が 10min になった',
    'logging_collector の既定値が on になり、log_destination の既定値が csvlog になった',
    'log_statement の既定値が all になり、すべての SQL 文がログに出力されるようになった',
    'log_min_duration_statement の既定値が 1s になり、1秒以上の文が既定で記録されるようになった',
    'log_line_prefix が廃止され、ログの各行の先頭には何も出力されなくなった'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 15 で、log_checkpoints の既定値が off から on に、log_autovacuum_min_duration の既定値が -1（無効）から 10min に変更されました。これにより既定の設定でも、チェックポイントの実行状況と、10分以上かかった自動バキューム・自動 ANALYZE がログに記録されます。\n14 以前の環境では、これらを明示的に設定しておくと、性能問題の調査に役立ちます。アップグレード後はログの量が増える点に注意します。',
  refs: [
    ['PostgreSQL 15 リリースノート（英語）', 'https://www.postgresql.org/docs/release/15.0/'],
    ['log_checkpoints（PG14）', 'https://www.postgresql.jp/document/14/html/runtime-config-logging.html#GUC-LOG-CHECKPOINTS']
  ]
},
{
  id: 'V1.3-007', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】PostgreSQL 17 で削除されたパラメータとして、正しいものを1つ選びなさい。',
  choices: [
    'old_snapshot_threshold',
    'max_wal_size',
    'idle_session_timeout',
    'wal_keep_size',
    'huge_pages'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\nold_snapshot_threshold は、古いスナップショットを使い続けるトランザクションがあっても VACUUM で不要行を回収できるようにするためのパラメータ（9.6 で導入）でしたが、不具合や性能上の問題があり、PostgreSQL 17 で削除されました。\nそのほかの削除の例として、PostgreSQL 16 では vacuum_defer_cleanup_age と promote_trigger_file が削除されています。\nidle_session_timeout は PostgreSQL 14 で追加されたパラメータで、現在も利用できます。',
  refs: [
    ['PostgreSQL 17 リリースノート（英語）', 'https://www.postgresql.org/docs/release/17.0/'],
    ['PostgreSQL 16 リリースノート（英語）', 'https://www.postgresql.org/docs/release/16.0/']
  ]
},
{
  id: 'V1.3-008', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】PostgreSQL 14 における `checkpoint_completion_target` の変更として、正しいものを1つ選びなさい。',
  choices: [
    '既定値が 0.5 から 0.9 に変更され、チェックポイントの書き込みがより平準化されるようになった',
    '既定値が 0.9 から 0.5 に変更され、チェックポイントが短時間で終わるようになった',
    'このパラメータは PostgreSQL 14 で廃止され、自動調整されるようになった',
    '既定値は変わらないが、指定できる上限が 1.0 から 2.0 に拡張された',
    'PostgreSQL 14 で名称が checkpoint_flush_after に変更された'
  ],
  answer: 0,
  exp: 'PostgreSQL 13 まで checkpoint_completion_target の既定値は 0.5 で、チェックポイント間隔の前半で書き込みを終える設定でした。多くの環境では 0.9 前後に上げることが定石になっていたため、PostgreSQL 14 で既定値が 0.9 に変更されました。\nこれにより、既定のままでもチェックポイント時の I/O のスパイクが起きにくくなっています。\n14 以降へ移行する際、postgresql.conf に明示的に 0.5 を書いたままにしていると、この改善が効かない点に注意が必要です。',
  refs: [
    ['チェックポイント', 'runtime-config-wal.html#GUC-CHECKPOINT-COMPLETION-TARGET'],
    ['WALの設定', 'wal-configuration.html']
  ]
},
{
  id: 'V1.3-009', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】PostgreSQL 13 で追加された `autovacuum_vacuum_insert_threshold` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '挿入だけが行われるテーブルもバキュームの対象となり、凍結や可視性マップの更新が進むようになった',
    '挿入された行の数が一定に達すると、そのテーブルが自動的に削除されるようになった',
    '挿入が多いテーブルでは、自動バキュームを実行しないようにするためのパラメータである',
    'このパラメータは更新と削除の行数だけを数えるため、INSERT のみのテーブルには影響しない',
    'PostgreSQL 13 でこのパラメータが追加されたことにより、autovacuum_vacuum_threshold は廃止された'
  ],
  answer: 0,
  exp: 'PostgreSQL 12 までの自動バキュームは、更新・削除された行数だけをしきい値の判定に使っていました。このため、追記だけが行われるログのようなテーブルはバキュームされにくく、可視性マップが更新されずインデックスオンリースキャンが効かない、凍結が進まず XID 周回を防ぐための大規模なバキュームが突然発生する、といった問題がありました。\nPostgreSQL 13 で autovacuum_vacuum_insert_threshold（既定 1000）と autovacuum_vacuum_insert_scale_factor（既定 0.2）が追加され、挿入された行数でもバキュームが起動するようになりました。\n従来のしきい値のパラメータも引き続き有効です。',
  refs: [
    ['自動バキュームの設定', 'runtime-config-autovacuum.html#GUC-AUTOVACUUM-VACUUM-INSERT-THRESHOLD'],
    ['自動バキュームデーモン', 'routine-vacuuming.html#AUTOVACUUM']
  ]
},
{
  id: 'V1.3-010', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】PostgreSQL 14 で追加された `default_toast_compression` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'TOAST の圧縮方式を選べるようになり、既定の pglz のほかに lz4 を指定できる',
    'TOAST の圧縮を無効にするためのパラメータで、既定値は off である',
    'WAL の圧縮方式を指定するパラメータである',
    'pg_dump の出力の圧縮方式を指定するパラメータである',
    'PostgreSQL 14 で廃止されたパラメータである'
  ],
  answer: 0,
  exp: 'PostgreSQL 13 以前、TOAST の圧縮方式は pglz に固定されていました。PostgreSQL 14 で default_toast_compression が追加され、pglz（既定）に加えて lz4 を選べるようになりました。lz4 は圧縮率はやや劣るものの、圧縮・展開が高速です。\nlz4 を使うには、サーバが --with-lz4 を有効にしてビルドされている必要があります。\n列ごとに ALTER TABLE ... ALTER COLUMN ... SET COMPRESSION で指定することもできます。\nWAL の全ページイメージの圧縮は wal_compression で、こちらも PostgreSQL 15 で lz4 や zstd が選べるようになりました。',
  refs: [
    ['クライアント接続デフォルト', 'runtime-config-client.html#GUC-DEFAULT-TOAST-COMPRESSION'],
    ['TOAST', 'storage-toast.html']
  ]
},
{
  id: 'V1.3-011', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】JIT コンパイルの既定値の変遷に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 11 で導入されたときは既定で無効だったが、12 で既定が on になった',
    'PostgreSQL 11 で導入されたときから既定で有効だった',
    'PostgreSQL 12 で導入され、当初から既定で無効である',
    'PostgreSQL 14 で導入された機能である',
    'JIT は常に有効で、パラメータで無効にすることはできない'
  ],
  answer: 0,
  exp: 'JIT（実行時コンパイル）は PostgreSQL 11 で導入されましたが、そのときは jit パラメータの既定値が off でした。PostgreSQL 12 で既定が on に変更されています。\n有効な場合でも、問い合わせの推定コストが jit_above_cost（既定 100000）を超えたときにだけ適用されるため、短い問い合わせには使われません。\nただし、推定コストが大きくても実際には短時間で終わる問い合わせでは、コンパイルの時間が上回って遅くなることがあります。移行後に特定の問い合わせだけ遅くなった場合は、JIT が原因かどうかを疑う価値があります。',
  refs: [
    ['問い合わせ計画（JIT）', 'runtime-config-query.html#GUC-JIT'],
    ['JITコンパイル', 'jit.html']
  ]
},
{
  id: 'V1.3-012', level: 'ver', cat: 'V1.3',
  q: '【バージョン差分】PostgreSQL 12 での `recovery_target_timeline` の既定値の変更として、正しいものを1つ選びなさい。',
  choices: [
    'current から latest に変更され、既定で最新のタイムラインを追いかけるようになった',
    'latest から current に変更され、既定でバックアップ時点のタイムラインに留まるようになった',
    '既定値が削除され、必ず明示的に指定する必要がある',
    '数値での指定ができなくなり、latest のみになった',
    'このパラメータは PostgreSQL 12 で廃止された'
  ],
  answer: 0,
  exp: 'recovery_target_timeline は、リカバリでどのタイムラインを追うかを指定します。PostgreSQL 11 以前の既定値は current（バックアップ時点のタイムラインのまま）でしたが、12 で latest（アーカイブにある最新のタイムラインを追う）に変更されました。\nフェイルオーバー後に昇格した新プライマリへスタンバイを追随させる構成が一般的になったため、そちらに合わせた変更です。\n11 以前から移行する場合、明示的に current を指定していないと動作が変わる点に注意が必要です。特定の時点に復旧したい PITR では、意図せず別のタイムラインを追わないよう確認します。',
  refs: [
    ['リカバリターゲット', 'runtime-config-wal.html#GUC-RECOVERY-TARGET-TIMELINE'],
    ['タイムライン', 'continuous-archiving.html#BACKUP-TIMELINES']
  ]
},

/* ---------------- V1.4 SQL・動作の非互換（13問） ---------------- */
{
  id: 'V1.4-001', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】PostgreSQL 15 での public スキーマの権限の変更に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'public スキーマそのものが廃止され、新しいデータベースには作成されなくなった',
    '新しいデータベースでは PUBLIC から public スキーマの CREATE 権限が取り消された',
    'public スキーマの USAGE 権限も取り消され、一般ユーザは public のテーブルを参照できなくなった',
    'この変更は PostgreSQL 14 で行われた',
    'pg_upgrade でアップグレードした既存のデータベースも、自動的に新しい権限設定に変更される'
  ],
  answer: 1,
  exp: '※試験範囲外（バージョン差分）\nセキュリティ強化のため、PostgreSQL 15 で新規のデータベースクラスタや新しく作成したデータベースでは、public スキーマに対する CREATE 権限が PUBLIC から取り消され、public スキーマの所有者は pg_database_owner ロール（データベースの所有者）になりました。USAGE 権限は引き続き PUBLIC に付与されています。\npg_upgrade によるアップグレードやダンプのリストアでは、既存の public スキーマの権限が維持されます。\n14 以前の手順で「アプリ用ユーザで public にテーブルを作る」構成は、15 以降の新規環境では権限エラーになるため、専用スキーマの作成や GRANT CREATE ON SCHEMA public が必要です。',
  refs: [
    ['PostgreSQL 15 リリースノート（英語）', 'https://www.postgresql.org/docs/release/15.0/'],
    ['スキーマと権限（PG15）', 'https://www.postgresql.jp/document/15/html/ddl-schemas.html#DDL-SCHEMAS-PRIV']
  ]
},
{
  id: 'V1.4-002', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】PostgreSQL 12 で削除され、指定するとエラーになるテーブル作成時の指定として、正しいものを1つ選びなさい。',
  choices: [
    'CREATE TABLE ... WITH OIDS',
    'CREATE UNLOGGED TABLE ...',
    'GENERATED ALWAYS AS IDENTITY',
    'CREATE TABLE ... PARTITION BY RANGE',
    'CREATE TABLE ... TABLESPACE'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\n11 以前は WITH OIDS（または default_with_oids）を指定すると、ユーザテーブルの各行に隠し列 oid が付与されました。PostgreSQL 12 でこの機能は削除され、WITH OIDS を指定するとエラーになります。システムカタログの oid 列も通常の（表示される）列になりました。\nWITH OIDS を使用したテーブルを含むデータベースは、事前に ALTER TABLE ... SET WITHOUT OIDS で OID を削除しないと 12 以降へ pg_upgrade できません。行の識別子が必要な場合は、IDENTITY 列や serial 列を使います。',
  refs: [
    ['PostgreSQL 12 リリースノート（英語）', 'https://www.postgresql.org/docs/release/12.0/']
  ]
},
{
  id: 'V1.4-003', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】WITH 句（共通テーブル式、CTE）の動作の変更に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 12 で WITH 句は廃止され、サブクエリで書き直す必要がある',
    'PostgreSQL 12 以降も、WITH 句の問い合わせは常に一度だけ実行されて結果が保持される',
    '12 以降、副作用がなく1回だけ参照される非再帰の CTE は既定でインライン展開される',
    'NOT MATERIALIZED を指定する構文はない',
    'WITH RECURSIVE の問い合わせも、既定でインライン展開されるようになった'
  ],
  answer: 2,
  exp: '※試験範囲外（バージョン差分）\n11 以前は、WITH 句の問い合わせは常に独立して一度だけ評価され、外側の条件がその中に押し込まれない「最適化の壁」として働いていました。PostgreSQL 12 からは、副作用がなく（データ変更を伴わず）、再帰的でなく、1回だけ参照される CTE は、既定で外側の問い合わせに展開（インライン化）されて一緒に最適化されます。\n従来どおり先に評価させたい場合は WITH x AS MATERIALIZED (...)、複数回参照される CTE を展開させたい場合は AS NOT MATERIALIZED を指定します。\n11 以前で CTE を意図的に最適化の壁として使っていた問い合わせは、アップグレード後に実行計画が変わる可能性があります。',
  refs: [
    ['PostgreSQL 12 リリースノート（英語）', 'https://www.postgresql.org/docs/release/12.0/'],
    ['WITH問い合わせ（PG14）', 'https://www.postgresql.jp/document/14/html/queries-with.html']
  ]
},
{
  id: 'V1.4-004', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】PostgreSQL 14 で行われた演算子に関する非互換の変更として、正しいものを1つ選びなさい。',
  choices: [
    'LIKE 演算子が削除され、SIMILAR TO を使う必要がある',
    '文字列連結の || 演算子が削除され、concat() 関数を使う必要がある',
    '後置演算子のサポートが削除され、階乗の ! 演算子の代わりに factorial() を使う',
    'factorial() 関数が削除され、! 演算子だけが残った',
    '前置演算子（左単項演算子）がすべて削除され、- 5 のような記述がエラーになる'
  ],
  answer: 2,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 14 で、ユーザ定義を含む後置演算子（右単項演算子）のサポートが削除されました。これに伴い、組み込みの後置演算子である階乗の ! 演算子（例: 5 !）も削除されたため、factorial(5) を使います（前置の !! 演算子も削除されています）。\n後置演算子を定義しているデータベースは、そのままでは 14 以降へ pg_upgrade できません。前置演算子は引き続き利用できます。',
  refs: [
    ['PostgreSQL 14 リリースノート（英語）', 'https://www.postgresql.org/docs/release/14.0/'],
    ['数学関数と演算子（PG14）', 'https://www.postgresql.jp/document/14/html/functions-math.html']
  ]
},
{
  id: 'V1.4-005', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】バージョン番号の体系に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '9.6.24 のメジャーバージョンは 9.6、10.23 のメジャーバージョンは 10 である',
    '9.6.24 のメジャーバージョンは 9、10.23 のメジャーバージョンは 10.23 である',
    '9.6.24 のメジャーバージョンは 9.6.24、10.23 のメジャーバージョンは 10.2 である',
    'どちらも先頭の数字（9 と 10）だけがメジャーバージョンを表す',
    'どちらも先頭の2つの数字（9.6 と 10.23）がメジャーバージョンを表す'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\n9.6 以前は「9.6」のように先頭の2つの数字でメジャーバージョンを表し、3つ目の数字（9.6.24 の 24）がマイナーバージョンでした。そのため 9.5 から 9.6 への更新はメジャーバージョンアップにあたります。\nPostgreSQL 10 からは先頭の数字だけがメジャーバージョン、2つ目の数字がマイナーバージョンになりました（10.23 はメジャー 10 のマイナー 23）。\n「9 系」とひとまとめにせず、9.x ごとにサポート期限や互換性が異なる点に注意が必要です。server_version_num（例: 90624、100023）で数値として比較できます。',
  refs: [
    ['バージョン管理ポリシー（英語）', 'https://www.postgresql.org/support/versioning/'],
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/']
  ]
},
{
  id: 'V1.4-006', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】PostgreSQL 18 での initdb の既定値の変更に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'データチェックサム機能が削除され、pg_checksums コマンドも廃止された',
    'initdb がデータチェックサムを既定で有効にするようになり、無効にする場合は --no-data-checksums を指定する',
    'データチェックサムを有効にするには、引き続き -k（--data-checksums）の指定が必須である',
    'WAL レコードの CRC による保護が、PostgreSQL 18 で初めて導入された',
    'チェックサムの設定が異なるクラスタ間でも、pg_upgrade で自由にアップグレードできるようになった'
  ],
  answer: 1,
  exp: '※試験範囲外（バージョン差分）\n17 以前の initdb ではデータチェックサムは既定で無効で、-k（--data-checksums）で有効化していました。PostgreSQL 18 では既定で有効になり、無効にする場合は --no-data-checksums を指定します。\npg_upgrade は旧クラスタと新クラスタのチェックサム設定が一致している必要があるため、チェックサム無効の旧クラスタをアップグレードする場合は、新クラスタを --no-data-checksums で作成するか、事前に pg_checksums で旧クラスタのチェックサムを有効にします。\nWAL レコードは以前から CRC で保護されています。',
  refs: [
    ['PostgreSQL 18 リリースノート（英語）', 'https://www.postgresql.org/docs/release/18.0/'],
    ['pg_checksums（PG14）', 'https://www.postgresql.jp/document/14/html/app-pgchecksums.html']
  ]
},
{
  id: 'V1.4-007', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】pg_upgrade によるメジャーバージョンアップに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_upgrade は、データ量によらず常に pg_dump / pg_restore による移行より時間がかかる',
    '--link モードで新クラスタを起動した後も、旧クラスタは引き続き安全に起動できる',
    'pg_upgrade を使えば、CPU アーキテクチャが異なるサーバ間でもデータファイルを移行できる',
    '17 以前へのアップグレードでは統計情報が移行されないため、実行後に vacuumdb --all --analyze-in-stages などを行う',
    '14.5 から 14.9 へのマイナーバージョンアップにも、pg_upgrade の実行が必要である'
  ],
  answer: 3,
  exp: '※試験範囲外（バージョン差分）\npg_upgrade はシステムカタログだけを新しい形式で作り直し、データファイルはコピー（またはハードリンク）するため、大量データでもダンプ・リストアより高速に移行できます。\nアップグレード先が PostgreSQL 17 以前の場合、オプティマイザの統計情報は移行されないため、実行後に vacuumdb --all --analyze-in-stages などで統計を収集しないと、実行計画が悪化することがあります（PostgreSQL 18 では多くの統計が引き継がれるようになりました）。\n--link モードではファイルを旧クラスタと共有するため、新クラスタを起動した後は旧クラスタを安全に使えません。データファイルの形式はアーキテクチャに依存し、マイナーバージョンアップは実行ファイルの入れ替えだけで行います。',
  refs: [
    ['pg_upgrade（PG14）', 'https://www.postgresql.jp/document/14/html/pgupgrade.html'],
    ['PostgreSQL 18 リリースノート（英語）', 'https://www.postgresql.org/docs/release/18.0/']
  ]
},
{
  id: 'V1.4-008', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】PostgreSQL 18 での EXPLAIN の変更に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'EXPLAIN の BUFFERS オプションが廃止された',
    'EXPLAIN ANALYZE を指定すると、BUFFERS を指定しなくてもバッファの使用状況が出力されるようになった',
    'EXPLAIN は既定で文を実行するようになり、ANALYZE オプションは不要になった',
    'EXPLAIN の既定の出力形式が JSON に変更された',
    'EXPLAIN ではコスト（cost）が表示されなくなった'
  ],
  answer: 1,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 18 では、EXPLAIN ANALYZE を実行すると BUFFERS オプションが自動的に有効になり、共有バッファのヒット数や読み込みブロック数などが既定で出力されるようになりました（不要な場合は BUFFERS OFF を指定します）。\n17 以前では、バッファの情報を見るには EXPLAIN (ANALYZE, BUFFERS) と明示する必要があります。I/O が性能のボトルネックかどうかを判断する際に重要な情報です。\n出力形式の既定は引き続き TEXT で、ANALYZE を指定しない EXPLAIN は文を実行しません。',
  refs: [
    ['PostgreSQL 18 リリースノート（英語）', 'https://www.postgresql.org/docs/release/18.0/'],
    ['EXPLAIN（PG14）', 'https://www.postgresql.jp/document/14/html/sql-explain.html']
  ]
},
{
  id: 'V1.4-009', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】ハッシュインデックスに関する変更として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 10 で WAL に対応し、クラッシュ後の再構築が不要になってレプリケーションでも利用できるようになった',
    'PostgreSQL 10 でハッシュインデックスは削除され、B-tree に置き換えられた',
    'PostgreSQL 10 以降もハッシュインデックスは WAL に記録されないため、本番環境では推奨されない',
    'ハッシュインデックスは範囲検索に対応しているため、B-tree の代わりに使うことができる',
    'PostgreSQL 10 でハッシュインデックスに一意制約を付けられるようになった'
  ],
  answer: 0,
  exp: 'PostgreSQL 9.6 以前のハッシュインデックスは WAL に記録されなかったため、クラッシュ後に REINDEX が必要で、スタンバイでも使えず、実質的に利用が推奨されていませんでした。\nPostgreSQL 10 でハッシュインデックスが WAL 対応となり、性能も改善され、通常の運用で利用できるようになりました。\nただしハッシュインデックスが使えるのは等価比較（=）だけで、範囲検索や整列には対応しません。また一意制約を実装することもできません。',
  refs: [
    ['インデックスの種類', 'indexes-types.html#INDEXES-TYPES-HASH'],
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/']
  ]
},
{
  id: 'V1.4-010', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】`ALTER TABLE ... ADD COLUMN ... DEFAULT` の動作の変更として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 11 以降、既定値付きの列追加でもテーブル全体の書き換えが起きず、即座に完了するようになった',
    'PostgreSQL 11 以降、既定値のない列の追加でもテーブル全体の書き換えが必要になった',
    'PostgreSQL 11 以降、既定値付きの列は追加できなくなり、後から UPDATE する必要がある',
    'PostgreSQL 10 以前でも、既定値付きの列追加はテーブルを書き換えずに完了していた',
    'この変更により、追加した列の既定値は既存行には適用されなくなった'
  ],
  answer: 0,
  exp: 'PostgreSQL 10 以前は、既定値を指定して列を追加すると全行に値を書き込むためテーブル全体が書き換えられ、大きなテーブルでは長時間の排他ロックが発生しました。そのため「いったん NULL 許容で追加し、後から少しずつ UPDATE する」といった運用が必要でした。\nPostgreSQL 11 では、追加時の既定値をカタログに記録しておき、読み出し時に補う仕組みが導入されました。これにより、既存行を書き換えずに一瞬で列を追加できます。既存行から見える値は従来と同じく既定値です。\nただし volatile な式を既定値にした場合など、書き換えが必要になるケースは残ります。',
  refs: [
    ['ALTER TABLE', 'sql-altertable.html'],
    ['PostgreSQL 11 リリースノート（英語）', 'https://www.postgresql.org/docs/release/11.0/']
  ]
},
{
  id: 'V1.4-011', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】`standard_conforming_strings` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 9.1 で既定値が on になり、文字列中のバックスラッシュがそのままの文字として扱われるようになった',
    'PostgreSQL 9.1 で既定値が off になり、バックスラッシュがエスケープ文字として扱われるようになった',
    'このパラメータを on にすると、シングルクォートを2つ重ねる記法が使えなくなる',
    'PostgreSQL 14 で追加されたパラメータである',
    'on のとき、`E\'\\n\'` と書いても改行にはならない'
  ],
  answer: 0,
  exp: 'standard_conforming_strings は SQL 標準に従い、通常の文字列リテラル中のバックスラッシュを特別扱いしない設定です。PostgreSQL 9.1 で既定値が on になりました。\nそれ以前は `\'a\\nb\'` の `\\n` が改行として解釈されていたため、9.0 以前を前提にしたアプリケーションを移行すると、文字列の意味が変わることがあります。\non の場合でも、`E\'a\\nb\'` のように E 接頭辞を付けたエスケープ文字列では従来どおりバックスラッシュが機能します。\nシングルクォート自体は、標準どおり2つ重ねて表します。',
  refs: [
    ['文字列定数', 'sql-syntax-lexical.html#SQL-SYNTAX-STRINGS'],
    ['以前のPostgreSQLバージョン', 'runtime-config-compatible.html#GUC-STANDARD-CONFORMING-STRINGS']
  ]
},
{
  id: 'V1.4-012', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】`bytea_output` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 9.0 で既定値が hex になり、bytea 型の出力形式が変わった',
    'PostgreSQL 9.0 で既定値が escape になり、従来の形式に戻された',
    'bytea 型の入力形式を指定するパラメータで、出力には影響しない',
    'PostgreSQL 14 で廃止されたパラメータである',
    'hex を指定すると、bytea 型のデータがディスク上でも16進数で格納される'
  ],
  answer: 0,
  exp: 'bytea_output は bytea 型を文字列として出力する際の形式を指定します。PostgreSQL 9.0 で既定値が escape から hex に変更され、出力が `\\x48656c6c6f` のような16進表記になりました。\n古いクライアントライブラリやアプリケーションが escape 形式を前提にしている場合、移行後にデータが正しく読めなくなることがあります。その場合は bytea_output = \'escape\' を設定して従来の形式に戻せます。\nこれは出力（表示）の形式の話であり、ディスク上の格納形式が変わるわけではありません。入力側は両方の形式を受け付けます。',
  refs: [
    ['バイナリ列データ型', 'datatype-binary.html'],
    ['文の動作', 'runtime-config-client.html#GUC-BYTEA-OUTPUT']
  ]
},
{
  id: 'V1.4-013', level: 'ver', cat: 'V1.4',
  q: '【バージョン差分】PostgreSQL 14 で追加された jsonb の記法に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '`data[\'key\']` のような添字による参照と、UPDATE での添字を使った更新ができるようになった',
    'jsonb 型が廃止され、すべて json 型に統合されるようになった',
    '`->` 演算子が廃止され、添字でしか参照できなくなった',
    'jsonb への添字による参照はできるようになったが、更新はできない',
    'jsonb の添字は配列にのみ使え、キーによる参照はできない'
  ],
  answer: 0,
  exp: 'PostgreSQL 14 で jsonb に添字（subscripting）の記法が追加され、`SELECT data[\'name\'] FROM t;` のようにキーや配列の位置で参照できるようになりました。\nさらに `UPDATE t SET data[\'name\'] = \'"pg"\';` のように、添字を使った部分更新も行えます。それまでは jsonb_set() 関数を使う必要がありました。\n添字が返すのは jsonb なので、テキストとして取り出す場合は従来どおり `->>` を使うか、キャストします。\n従来の `->`、`->>`、`#>` といった演算子も引き続き使えます。',
  refs: [
    ['jsonbの添字', 'datatype-json.html#JSONB-SUBSCRIPTING'],
    ['JSON関数と演算子', 'functions-json.html']
  ]
},

/* ---------------- V1.5 主要機能の導入時期（16問） ---------------- */
{
  id: 'V1.5-001', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】CREATE PUBLICATION / CREATE SUBSCRIPTION による組み込みの論理レプリケーションが導入されたバージョンとして、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 9.0',
    'PostgreSQL 9.4',
    'PostgreSQL 10',
    'PostgreSQL 12',
    'PostgreSQL 15'
  ],
  answer: 2,
  shuffle: false,
  exp: '※試験範囲外（バージョン差分）\nパブリケーションとサブスクリプションによる組み込みの論理レプリケーションは PostgreSQL 10 で導入されました。その基盤となる論理デコーディングは 9.4 で導入されており、それ以前は pglogical などの拡張で実現されていました。\nストリーミングレプリケーション（物理レプリケーション）とホットスタンバイは 9.0 で導入されています。\n論理レプリケーションは、メジャーバージョンが異なるサーバ間でも利用できるため、ダウンタイムを抑えたメジャーバージョンアップにも使われます（10 以降同士）。',
  refs: [
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/'],
    ['論理レプリケーション（PG14）', 'https://www.postgresql.jp/document/14/html/logical-replication.html']
  ]
},
{
  id: 'V1.5-002', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】宣言的パーティショニングの機能追加の経緯に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '宣言的パーティショニングは PostgreSQL 9.6 で導入された',
    'ハッシュパーティションは PostgreSQL 12 で初めて利用できるようになった',
    '宣言的パーティショニングが導入された PostgreSQL 10 以降、テーブル継承によるパーティショニングは利用できなくなった',
    '10 で導入され、11 でハッシュパーティションやデフォルトパーティションなどが追加された',
    'パーティションテーブルへの主キーの定義は、PostgreSQL 14 から可能になった'
  ],
  answer: 3,
  exp: '※試験範囲外（バージョン差分）\n9.6 以前は、テーブル継承と CHECK 制約、トリガーを組み合わせてパーティショニングを実現していました。PostgreSQL 10 で CREATE TABLE ... PARTITION BY による宣言的パーティショニング（範囲・リスト）が導入されました。\nPostgreSQL 11 でハッシュパーティション、デフォルトパーティション、パーティション間で行を移動する UPDATE、パーティションテーブルへの主キー・一意制約（パーティションキーを含む場合）、実行時のパーティションプルーニングなどが追加され、実用性が大きく向上しました。\nテーブル継承自体は現在も利用できます。',
  refs: [
    ['PostgreSQL 10 リリースノート（英語）', 'https://www.postgresql.org/docs/release/10.0/'],
    ['PostgreSQL 11 リリースノート（英語）', 'https://www.postgresql.org/docs/release/11.0/'],
    ['テーブルのパーティショニング（PG14）', 'https://www.postgresql.jp/document/14/html/ddl-partitioning.html']
  ]
},
{
  id: 'V1.5-003', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】SQL 標準の MERGE 文が導入されたバージョンとして、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 9.5',
    'PostgreSQL 11',
    'PostgreSQL 13',
    'PostgreSQL 15',
    'PostgreSQL 17'
  ],
  answer: 3,
  shuffle: false,
  exp: '※試験範囲外（バージョン差分）\nMERGE 文は PostgreSQL 15 で導入され、条件に応じて INSERT / UPDATE / DELETE を1つの文で行えるようになりました。PostgreSQL 17 では MERGE に RETURNING 句や WHEN NOT MATCHED BY SOURCE などが追加されています。\nそれ以前から使える PostgreSQL 独自の UPSERT 構文 INSERT ... ON CONFLICT は PostgreSQL 9.5 で導入されました。一意制約違反を扱う用途では、同時実行時の動作が保証された ON CONFLICT が引き続き有用です。\n試験の対象である PostgreSQL 14 には MERGE はありません。',
  refs: [
    ['PostgreSQL 15 リリースノート（英語）', 'https://www.postgresql.org/docs/release/15.0/'],
    ['INSERT（ON CONFLICT、PG14）', 'https://www.postgresql.jp/document/14/html/sql-insert.html']
  ]
},
{
  id: 'V1.5-004', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】PostgreSQL 17 で導入された増分バックアップに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_basebackup --incremental で取得し、pg_combinebackup で合成して復元する（summarize_wal が必要）',
    '増分バックアップは PostgreSQL 12 で導入され、pg_basebackup の --incremental オプションで取得する',
    '増分バックアップはそのままデータディレクトリとして起動でき、pg_combinebackup などによる合成は不要である',
    'summarize_wal などのサーバ側の設定は不要で、どのような設定のサーバでも増分バックアップを取得できる',
    '増分バックアップは pg_dump --incremental で取得し、pg_restore で前回のダンプに重ねてリストアする'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 17 で、pg_basebackup による増分バックアップが導入されました。サーバで summarize_wal = on にして WAL サマリ（変更されたブロックの情報）を記録しておき、pg_basebackup --incremental=前回のバックアップの backup_manifest を指定すると、前回から変更されたブロックだけを取得します。\n復元時は、フルバックアップと増分バックアップの連なりを pg_combinebackup で合成して、通常のデータディレクトリを作成します。\nそれ以前のバージョンでは、差分・増分バックアップには pgBackRest などの外部ツールが使われていました。',
  refs: [
    ['PostgreSQL 17 リリースノート（英語）', 'https://www.postgresql.org/docs/release/17.0/'],
    ['pg_combinebackup（PG17）', 'https://www.postgresql.jp/document/17/html/app-pgcombinebackup.html']
  ]
},
{
  id: 'V1.5-005', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】JIT コンパイル（LLVM による式評価などのコンパイル）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'JIT は PostgreSQL 9.6 でパラレルクエリと同時に導入された',
    'PostgreSQL 11 で導入され、12 で jit の既定値が on になった',
    'PostgreSQL 12 で JIT は削除された',
    'jit = on の場合、コストにかかわらずすべての問い合わせで JIT コンパイルが行われる',
    'JIT を使うかどうかは、テーブルのストレージパラメータで指定する'
  ],
  answer: 1,
  exp: '※試験範囲外（バージョン差分）\nJIT コンパイルは PostgreSQL 11 で導入されました（--with-llvm でビルドされている必要があり、11 の既定値は jit = off）。PostgreSQL 12 で jit の既定値が on に変わりました。\njit = on でも、問い合わせの見積もりコストが jit_above_cost（既定 100000）を超える場合にだけ JIT が使われます。分析系の重い問い合わせには効果がありますが、短い OLTP の問い合わせではコンパイルのオーバーヘッドが上回ることがあり、12 へのアップグレード後に一部の問い合わせが遅くなる事例もありました。EXPLAIN ANALYZE の JIT の項目で確認できます。\nパラレルクエリは 9.6 で導入されています。',
  refs: [
    ['PostgreSQL 11 リリースノート（英語）', 'https://www.postgresql.org/docs/release/11.0/'],
    ['PostgreSQL 12 リリースノート（英語）', 'https://www.postgresql.org/docs/release/12.0/'],
    ['JIT（PG14）', 'https://www.postgresql.jp/document/14/html/jit.html']
  ]
},
{
  id: 'V1.5-006', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】PostgreSQL 18 で導入された非同期 I/O に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '非同期 I/O は PostgreSQL 16 で導入された',
    'io_method パラメータで方式（worker、io_uring、sync など）を選択でき、既定値は worker である',
    '非同期 I/O は WAL の書き込みにだけ使われる',
    '非同期 I/O は Windows でのみ利用できる',
    'io_method の既定値は io_uring であり、Linux 以外では PostgreSQL 18 を起動できない'
  ],
  answer: 1,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 18 で非同期 I/O のサブシステムが導入され、シーケンシャルスキャン、ビットマップヒープスキャン、VACUUM などでのデータファイルの読み込みを非同期に行えるようになりました。\n方式は io_method パラメータで指定し、worker（I/O ワーカープロセスを使う、既定値）、io_uring（Linux の io_uring を使う、対応するビルドが必要）、sync（従来と同様の同期 I/O）から選択します。io_workers で I/O ワーカーの数を設定できます。',
  refs: [
    ['PostgreSQL 18 リリースノート（英語）', 'https://www.postgresql.org/docs/release/18.0/'],
    ['io_method（PostgreSQL 18 英語文書）', 'https://www.postgresql.org/docs/18/runtime-config-resource.html#GUC-IO-METHOD']
  ]
},
{
  id: 'V1.5-007', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】PostgreSQL 9.5 で導入された機能の組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'INSERT ... ON CONFLICT、行単位セキュリティ（RLS）、pg_rewind',
    '論理レプリケーション、宣言的パーティショニング',
    'MERGE 文、統計情報の共有メモリ化',
    'JIT コンパイル、プロシージャ（CREATE PROCEDURE）',
    '増分バックアップ、JSON_TABLE'
  ],
  answer: 0,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 9.5 では、UPSERT を実現する INSERT ... ON CONFLICT、行ごとにアクセス制御を行う行単位セキュリティ（CREATE POLICY）、フェイルオーバー後の旧プライマリの再同期に使う pg_rewind、BRIN インデックスなどが導入されました。\nほかの選択肢の導入バージョンは次のとおりです。\n・論理レプリケーション、宣言的パーティショニング: 10\n・MERGE、統計情報の共有メモリ化: 15\n・JIT、プロシージャ: 11\n・増分バックアップ、JSON_TABLE: 17',
  refs: [
    ['PostgreSQL 9.5 リリースノート（英語）', 'https://www.postgresql.org/docs/release/9.5.0/'],
    ['行セキュリティポリシー（PG14）', 'https://www.postgresql.jp/document/14/html/ddl-rowsecurity.html']
  ]
},
{
  id: 'V1.5-008', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】パラレル処理の導入の経緯に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'パラレルクエリは PostgreSQL 12 で初めて導入された',
    'パラレルシーケンシャルスキャンは 9.6、B-tree の並列インデックス作成は 11、VACUUM のインデックス処理の並列化は 13 で導入された',
    'CREATE INDEX の並列化は 9.6 のパラレルクエリと同時に導入された',
    'VACUUM の PARALLEL オプションは、VACUUM FULL を並列化するために PostgreSQL 10 で導入された',
    '現在もパラレルクエリは SELECT の集約処理でしか使われない'
  ],
  answer: 1,
  exp: '※試験範囲外（バージョン差分）\nPostgreSQL 9.6 でパラレルシーケンシャルスキャン、パラレル集約、パラレル結合が導入され、10 でパラレルインデックススキャンやパラレルマージ結合、11 でパラレルハッシュ結合や B-tree インデックスの並列作成（CREATE INDEX）が追加されました。\nPostgreSQL 13 では VACUUM の PARALLEL オプションにより、インデックスのバキュームの並列化が可能になりました（VACUUM FULL には使えません）。\n9.6 で導入された当初、max_parallel_workers_per_gather の既定値は 0 でしたが、10 で 2 に変更されています。',
  refs: [
    ['PostgreSQL 9.6 リリースノート（英語）', 'https://www.postgresql.org/docs/release/9.6.0/'],
    ['PostgreSQL 11 リリースノート（英語）', 'https://www.postgresql.org/docs/release/11.0/'],
    ['PostgreSQL 13 リリースノート（英語）', 'https://www.postgresql.org/docs/release/13.0/']
  ]
},
{
  id: 'V1.5-009', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】JSON 関連機能の導入時期に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'jsonb 型と SQL/JSON パス言語はどちらも PostgreSQL 9.2 で導入された',
    'JSON_TABLE は PostgreSQL 12 で jsonb_path_query と同時に導入された',
    'jsonb 型は 9.4、jsonb_path_query などの SQL/JSON パス言語は 12、JSON_TABLE は 17 で導入された',
    'PostgreSQL 16 で json 型が廃止され、jsonb 型だけになった',
    'IS JSON 述語は PostgreSQL 9.4 で jsonb 型と同時に導入された'
  ],
  answer: 2,
  exp: '※試験範囲外（バージョン差分）\nJSON 関連機能の主な導入時期は次のとおりです。\n・9.2: json 型\n・9.4: jsonb 型（GIN インデックスによる検索に対応）\n・12: SQL/JSON パス言語（jsonb_path_query、@? / @@ 演算子など）\n・16: IS JSON 述語、JSON_ARRAY() / JSON_OBJECT() などの SQL/JSON コンストラクタ\n・17: JSON_TABLE、JSON_QUERY、JSON_VALUE、JSON_EXISTS\njson 型は現在も利用できます。試験の対象の PostgreSQL 14 では、SQL/JSON パス言語までが使えます。',
  refs: [
    ['PostgreSQL 17 リリースノート（英語）', 'https://www.postgresql.org/docs/release/17.0/'],
    ['PostgreSQL 16 リリースノート（英語）', 'https://www.postgresql.org/docs/release/16.0/'],
    ['JSON関数と演算子（PG14）', 'https://www.postgresql.jp/document/14/html/functions-json.html']
  ]
},
{
  id: 'V1.5-010', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】生成列（GENERATED ALWAYS AS）の変遷に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '生成列は PostgreSQL 10 で IDENTITY 列と同時に導入された',
    'PostgreSQL 12 の生成列は、参照時に毎回計算される VIRTUAL 生成列だけに対応していた',
    '生成列には、他のテーブルを参照するサブクエリを式として指定できる',
    'PostgreSQL 18 で生成列は廃止され、トリガーで代替する必要がある',
    '生成列は 12 で STORED として導入され、18 で VIRTUAL が追加されて既定になった'
  ],
  answer: 4,
  exp: '※試験範囲外（バージョン差分）\n他の列から計算される生成列は PostgreSQL 12 で導入され、当初は値を計算してテーブルに格納する STORED 生成列だけに対応していました。PostgreSQL 18 で、参照時に計算して格納しない VIRTUAL 生成列が追加され、STORED / VIRTUAL を省略した場合の既定になりました。\n生成式には同じ行の列を参照する IMMUTABLE な式だけを指定でき、サブクエリや他のテーブルは参照できません。\nIDENTITY 列（GENERATED ... AS IDENTITY）は、自動採番のための別の機能で PostgreSQL 10 で導入されています。',
  refs: [
    ['PostgreSQL 12 リリースノート（英語）', 'https://www.postgresql.org/docs/release/12.0/'],
    ['PostgreSQL 18 リリースノート（英語）', 'https://www.postgresql.org/docs/release/18.0/'],
    ['生成列（PG14）', 'https://www.postgresql.jp/document/14/html/ddl-generated-columns.html']
  ]
},
{
  id: 'V1.5-011', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】SQL のプロシージャ（CREATE PROCEDURE）の導入に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 11 で導入され、関数と違ってプロシージャ内でトランザクションのコミットができる',
    'PostgreSQL 11 で導入されたが、関数と同じくトランザクション制御はできない',
    'PostgreSQL 9.0 から利用でき、CALL ではなく SELECT で呼び出す',
    'PostgreSQL 11 で導入され、必ず値を1つ返す必要がある',
    'プロシージャは PostgreSQL 14 で廃止され、関数に統合された'
  ],
  answer: 0,
  exp: 'PostgreSQL 11 で CREATE PROCEDURE によるプロシージャが導入されました。CALL 文で呼び出し、関数と違って戻り値を返す必要がありません。\n最大の違いは、プロシージャの中で COMMIT や ROLLBACK を実行できる点です（呼び出し側がトランザクションブロックの中にいない場合）。これにより、大量データを一定件数ごとにコミットしながら処理するバッチが書きやすくなりました。\n関数はその呼び出し全体が1つのトランザクションの一部として実行されるため、内部でコミットすることはできません。',
  refs: [
    ['CREATE PROCEDURE', 'sql-createprocedure.html'],
    ['トランザクション管理', 'plpgsql-transactions.html']
  ]
},
{
  id: 'V1.5-012', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】PostgreSQL 14 で導入された主な機能の組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'Memoize ノードによる結合結果のキャッシュと、pg_stat_wal ビューによる WAL 統計',
    'MERGE 文の導入と、public スキーマの既定権限の変更',
    '宣言的パーティショニングの導入と、パラレルクエリの導入',
    '論理レプリケーションの導入と、ハッシュインデックスの WAL 対応',
    'JIT コンパイルの導入と、recovery.conf の廃止'
  ],
  answer: 0,
  exp: 'PostgreSQL 14 では、Nested Loop の内側の結果を結合キーごとにキャッシュする Memoize ノード、WAL の生成量などを表示する pg_stat_wal ビュー、ALTER TABLE ... DETACH PARTITION ... CONCURRENTLY、多数の接続がある環境でのスケーラビリティ改善などが導入されました。\n選択肢の他の組み合わせは、MERGE 文と public スキーマの権限変更が 15、宣言的パーティショニングと論理レプリケーションが 10、パラレルクエリが 9.6、ハッシュインデックスの WAL 対応が 10、JIT が 11、recovery.conf の廃止が 12 です。',
  refs: [
    ['リリース14', 'release-14.html'],
    ['pg_stat_wal', 'monitoring-stats.html#MONITORING-PG-STAT-WAL-VIEW']
  ]
},
{
  id: 'V1.5-013', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】PostgreSQL 16 で追加された `pg_stat_io` ビューに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'バックエンドの種類や対象ごとに、読み書き・書き出しなどの I/O を集計して表示する',
    'ディスク装置ごとの使用率を OS から取得して表示する',
    'PostgreSQL 14 から利用できるビューである',
    '実行中の問い合わせの I/O 待ち時間だけを表示する',
    'pg_stat_bgwriter を置き換えるために、PostgreSQL 14 で追加された'
  ],
  answer: 0,
  exp: 'pg_stat_io は PostgreSQL 16 で追加されたビューで、バックエンドの種類（client backend、autovacuum worker、checkpointer など）、I/O の対象（relation、temp relation）、コンテキスト（normal、vacuum、bulkread、bulkwrite）ごとに、読み込み・書き込み・書き出し・拡張などの回数をまとめて表示します。\nそれまで pg_stat_bgwriter などに分散していた I/O の情報を、どこで何が起きているかという観点で見られるようになりました。\nPostgreSQL 14 では利用できないため、14 では pg_statio_ 系のビューや pg_stat_bgwriter を使います。',
  refs: [
    ['PostgreSQL 16 リリースノート（英語）', 'https://www.postgresql.org/docs/release/16.0/'],
    ['統計情報の閲覧', 'monitoring-stats.html#MONITORING-STATS-VIEWS']
  ]
},
{
  id: 'V1.5-014', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】論理レプリケーションの機能拡充に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 16 でスタンバイからの論理デコーディングが可能になり、17 で pg_createsubscriber が追加された',
    'PostgreSQL 16 で論理レプリケーション自体が初めて導入された',
    'PostgreSQL 17 で論理レプリケーションが廃止され、物理レプリケーションに統合された',
    'PostgreSQL 16 以降もサブスクライバ側は必ずスーパーユーザで実行する必要がある',
    'PostgreSQL 15 以降、パブリケーションに WHERE 句や列リストは指定できなくなった'
  ],
  answer: 0,
  exp: '組み込みの論理レプリケーションは PostgreSQL 10 で導入され、その後も拡充が続いています。\nPostgreSQL 15 で、パブリケーションに行フィルタ（WHERE 句）と列リストを指定できるようになりました。\nPostgreSQL 16 では、スタンバイサーバから論理デコーディングができるようになり、プライマリの負荷を上げずに論理レプリケーションを構成できます。あわせて、スーパーユーザでなくても pg_create_subscription 権限があればサブスクリプションを作成できるようになりました。\nPostgreSQL 17 では、物理スタンバイを論理レプリケーションのサブスクライバに変換する pg_createsubscriber が追加されています。',
  refs: [
    ['PostgreSQL 16 リリースノート（英語）', 'https://www.postgresql.org/docs/release/16.0/'],
    ['PostgreSQL 17 リリースノート（英語）', 'https://www.postgresql.org/docs/release/17.0/']
  ]
},
{
  id: 'V1.5-015', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】SQL 標準の JSON 構文（SQL/JSON）の導入に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 16 で JSON_ARRAY などの構築関数と IS JSON 述語が、17 で JSON_TABLE などが追加された',
    'PostgreSQL 9.2 の時点で SQL/JSON の構文はすべて実装されていた',
    'PostgreSQL 17 で jsonb 型が廃止され、SQL/JSON の型に置き換えられた',
    'SQL/JSON の構文は PostgreSQL 14 で利用できる',
    'SQL/JSON は PostgreSQL 独自の拡張であり、SQL 標準にはない'
  ],
  answer: 0,
  exp: 'PostgreSQL の JSON 対応は、9.2 の json 型、9.4 の jsonb 型、12 の SQL/JSON パス式（jsonb_path_query など）と段階的に進みました。\nPostgreSQL 16 で SQL 標準の構築関数（JSON_ARRAY、JSON_OBJECT、JSON_ARRAYAGG など）と IS JSON 述語が追加され、17 で JSON_TABLE、JSON_EXISTS、JSON_QUERY、JSON_VALUE といった問い合わせ用の構文が加わりました。\nPostgreSQL 14 ではこれらの標準構文は使えないため、`->`、`->>`、jsonb_path_query() などの既存の演算子・関数を使います。',
  refs: [
    ['JSON関数と演算子', 'functions-json.html'],
    ['PostgreSQL 17 リリースノート（英語）', 'https://www.postgresql.org/docs/release/17.0/']
  ]
},
{
  id: 'V1.5-016', level: 'ver', cat: 'V1.5',
  q: '【バージョン差分】認証方式の変遷に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 10 で SCRAM-SHA-256 が、18 で OAuth 認証が追加された',
    'PostgreSQL 10 で md5 認証が導入された',
    'PostgreSQL 14 で md5 認証が削除され、以降は使用できなくなった',
    'SCRAM-SHA-256 は PostgreSQL 14 で導入された',
    'PostgreSQL 18 で SCRAM-SHA-256 が削除された'
  ],
  answer: 0,
  exp: 'PostgreSQL 10 で SCRAM-SHA-256 認証が導入され、14 で password_encryption の既定値が md5 から scram-sha-256 に変更されました。md5 は現在も使えますが非推奨です。\nPostgreSQL 18 では、外部の認可サーバを使う OAuth 認証（oauth）が追加されました。\n運用上の注意として、password_encryption を変更しても既存のパスワードは変換されないため、移行時には各ロールのパスワードを設定し直す必要があります。また、古いクライアントライブラリは SCRAM に対応していないことがあります。',
  refs: [
    ['パスワード認証', 'auth-password.html'],
    ['PostgreSQL 18 リリースノート（英語）', 'https://www.postgresql.org/docs/release/18.0/']
  ]
},

);
