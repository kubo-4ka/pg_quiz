/*
 * Gold G4 障害対応（60問）
 * PostgreSQL 14 文書に基づくオリジナル問題。形式は DEVELOPMENT.md を参照。
 * tools/format.js で整形しています（node tools/format.js）。
 */
(window.PGQ_QUESTIONS = window.PGQ_QUESTIONS || []).push(

/* ---------------- G4.1 起こりうる障害のパターン（重要度 3 / 31問） ---------------- */
{
  id: 'G4.1-001', level: 'gold', cat: 'G4.1',
  q: 'Linux 上で稼働する PostgreSQL において、メモリ不足により OOM killer がバックエンドプロセスを強制終了させた場合の説明として、正しいものを1つ選びなさい。',
  choices: [
    '影響を受けるのは強制終了されたセッションだけで、他のセッションは処理を継続する',
    'postmaster は他のサーバプロセスも終了させ、共有メモリを再初期化してクラッシュリカバリを行う',
    'PostgreSQL のドキュメントでは、vm.overcommit_memory を 0 に設定することが推奨されている',
    'postgresql.conf に OOM killer を無効化するパラメータがあり、既定で有効になっている',
    'バックエンドプロセスが強制終了されると、そのデータベースのデータファイルは必ず破損する'
  ],
  answer: 1,
  exp: 'バックエンドプロセスが SIGKILL などで異常終了すると、共有メモリが破損している可能性があるため、postmaster は他のサーバプロセスをすべて終了させ、WAL を用いたクラッシュリカバリを行ってからサービスを再開します（restart_after_crash = on の場合）。WAL により、コミット済みのデータは保護されます。\nドキュメントでは、OOM killer による postmaster の強制終了を避けるために vm.overcommit_memory = 2 に設定してメモリのオーバーコミットを抑止することなどが推奨されています。\nOOM killer は OS の機能であり、postgresql.conf のパラメータで無効化するものではありません。',
  refs: [
    ['Linuxのメモリオーバーコミット', 'kernel-resources.html#LINUX-MEMORY-OVERCOMMIT'],
    ['restart_after_crash', 'runtime-config-error-handling.html']
  ]
},
{
  id: 'G4.1-002', level: 'gold', cat: 'G4.1',
  q: 'WAL ファイルを格納しているファイルシステムの空き容量がなくなった場合の説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL が自動的に古い WAL ファイルを削除して処理を継続するため、影響はない',
    '空き容量を確保するため、pg_wal ディレクトリ内の WAL ファイルを手動で削除することが推奨されている',
    'データベースサーバがパニックを起こして停止する可能性がある',
    '読み込み処理だけが停止し、書き込み処理は継続できる',
    'データベースは自動的に読み取り専用モードに切り替わり、パラメータ default_transaction_read_only が on になる'
  ],
  answer: 2,
  exp: 'ドキュメントのディスク満杯時の障害の説明にあるとおり、WAL を格納するファイルシステムが満杯になると、データベースサーバはパニックを起こして停止する可能性があります。\npg_wal 内の WAL ファイルを手動で削除すると、データベースが破損して復旧不能になるおそれがあるため、絶対に行ってはいけません。原因（アーカイブの失敗、不要なレプリケーションスロット、長時間のチェックポイント遅延など）を解消し、ファイルシステムの容量を拡張するなどして対処します。\n日頃から pg_wal の使用量やディスク使用量を監視しておくことが重要です。',
  refs: [
    ['ディスク容量不足による問題', 'disk-full.html#DISK-FULL'],
    ['WALの内部', 'wal-internals.html']
  ]
},
{
  id: 'G4.1-003', level: 'gold', cat: 'G4.1',
  q: 'サーバプロセスの状態管理に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_cancel_backend() は実行中の問い合わせを取り消し、pg_terminate_backend() はバックエンドプロセス（セッション）自体を終了させる',
    '応答しないセッションを終了させるには、OS の kill -9 でバックエンドプロセスを終了させるのが最も安全である',
    'idle in transaction の状態が長く続くセッションを自動的に切断するパラメータは存在しない',
    'pg_terminate_backend() を実行できるのはスーパーユーザだけである',
    'pg_cancel_backend() で問い合わせを取り消すと、そのトランザクションはそこまでの変更がコミットされる'
  ],
  answer: 0,
  exp: 'pg_cancel_backend(pid) は指定したバックエンドの現在の問い合わせを取り消し（SIGINT）、pg_terminate_backend(pid) はセッションを終了させます（SIGTERM）。取り消されたトランザクションはアボート（ロールバック）されます。\nこれらの関数はスーパーユーザのほか、対象と同じロールのユーザや pg_signal_backend ロールのメンバーも実行できます（スーパーユーザのバックエンドはスーパーユーザのみ）。\nkill -9（SIGKILL）でバックエンドを終了させると、postmaster が全プロセスを再起動してクラッシュリカバリを行うため、使うべきではありません。\nidle_in_transaction_session_timeout を設定すると、指定時間以上トランザクション内で待機しているセッションを終了できます。',
  refs: [
    ['サーバシグナル送信関数', 'functions-admin.html#FUNCTIONS-ADMIN-SIGNAL'],
    ['idle_in_transaction_session_timeout', 'runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT'],
    ['サーバのシャットダウン', 'server-shutdown.html']
  ]
},
{
  id: 'G4.1-004', level: 'gold', cat: 'G4.1',
  q: '同時接続数が上限に達した場合に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '上限を超えた接続要求は、空きができるまでサーバ側のキューで待機する',
    '新しい接続を受け付けるため、最も古いアイドル状態のセッションが自動的に切断される',
    'superuser_reserved_connections の既定値は 0 であり、スーパーユーザ用の予約枠はない',
    '接続数が上限に近づくと、superuser_reserved_connections の予約枠はスーパーユーザだけが使える',
    'max_connections は設定ファイルの再読み込みで増やすことができる'
  ],
  answer: 3,
  exp: 'max_connections（既定 100）は同時接続数の上限です。そのうち superuser_reserved_connections（既定 3）の枠はスーパーユーザ用に予約されているため、接続数が max_connections - superuser_reserved_connections に達すると、一般ユーザの新規接続は「sorry, too many clients already」などのエラーで拒否されます。管理作業のために、スーパーユーザは予約枠で接続できます。\nPostgreSQL 本体には接続を待機させるキューはなく、既存のセッションが自動的に切断されることもありません。多数のクライアントを扱う場合は、pgbouncer などのコネクションプーラの利用を検討します。\nmax_connections の変更にはサーバの再起動が必要です。',
  refs: [
    ['max_connections', 'runtime-config-connection.html#GUC-MAX-CONNECTIONS'],
    ['superuser_reserved_connections', 'runtime-config-connection.html#GUC-SUPERUSER-RESERVED-CONNECTIONS']
  ]
},
{
  id: 'G4.1-005', level: 'gold', cat: 'G4.1',
  q: 'VACUUM が長期間実行されず、トランザクション ID の周回が近づいた場合の説明として、正しいものを1つ選びなさい。',
  choices: [
    'トランザクション ID は自動的に 64 ビットに拡張されるため、影響はない',
    '古い行が自動的に削除されて、トランザクション ID が再利用される',
    '警告が出た後、さらに周回が迫ると新しい XID の割り当てが拒否されるため、VACUUM で凍結する',
    'initdb でデータベースクラスタを作り直す以外に回復する方法はない',
    'REINDEX DATABASE を実行すれば、トランザクション ID の周回は解消される'
  ],
  answer: 2,
  exp: '周回防止の VACUUM が行われないまま、データベースの最も古い未凍結の XID が周回に近づくと、「database "…" must be vacuumed within … transactions」という警告が出力されます。それでも対処されずに周回がさらに迫ると、データの消失を防ぐため、新しい XID の割り当て（更新を伴うトランザクション）が拒否されます。\n回復するには、対象データベースで VACUUM を実行して古い行を凍結します。長時間実行中のトランザクションや古いレプリケーションスロット、準備済みトランザクションが凍結を妨げていないかも確認します。\nデータが自動削除されることはなく、REINDEX では解消しません。',
  refs: [
    ['トランザクションIDの周回エラーの防止', 'routine-vacuuming.html#VACUUM-FOR-WRAPAROUND']
  ]
},
{
  id: 'G4.1-006', level: 'gold', cat: 'G4.1',
  q: '想定外に長時間実行される SQL 文による障害を防ぐため、指定した時間を超えて実行されている文を自動的に取り消したい。使用するパラメータを1つ選びなさい。',
  choices: [
    'statement_timeout',
    'idle_in_transaction_session_timeout',
    'lock_timeout',
    'deadlock_timeout',
    'tcp_keepalives_idle'
  ],
  answer: 0,
  exp: 'statement_timeout は、指定した時間（単位を省略するとミリ秒）を超えて実行されている文を取り消します。0（既定）で無効です。postgresql.conf で全体に設定すると保守作業などにも影響するため、ALTER ROLE ... SET や ALTER DATABASE ... SET、SET でロールやセッション単位に設定することが多いです。\nidle_in_transaction_session_timeout はトランザクション内でアイドル状態が続くセッションを終了し、lock_timeout はロック獲得の待ち時間の上限です。deadlock_timeout はデッドロック検査までの待ち時間、tcp_keepalives_idle は TCP キープアライブの送信間隔の設定です。',
  refs: [
    ['statement_timeout', 'runtime-config-client.html#GUC-STATEMENT-TIMEOUT'],
    ['lock_timeout', 'runtime-config-client.html#GUC-LOCK-TIMEOUT']
  ]
},
{
  id: 'G4.1-007', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: 'サーバの起動時に「could not bind IPv4 address ...: Address already in use」というエラーが出力された。原因として最も考えられるものを1つ選びなさい。',
  choices: [
    '共有メモリの確保に失敗した',
    'pg_hba.conf に記述の誤りがある',
    'データディレクトリのあるファイルシステムが満杯になっている',
    '同じポート番号で、別のサーバ（またはプロセス）が既に接続を待ち受けている',
    'クライアントの接続数が max_connections に達している'
  ],
  answer: 3,
  exp: '「Address already in use」は、サーバが指定されたアドレスとポートで待ち受けを開始しようとしたが、既に別のプロセスがそのポートを使用していることを示します。同じポート（既定 5432）で PostgreSQL の別のインスタンスが起動していないかを確認し、必要に応じて port パラメータを変更します。\n共有メモリの確保に失敗した場合は「could not create shared memory segment」などのメッセージになります。起動時の代表的なエラーとその原因は、ドキュメントの「サーバ起動時の失敗」で説明されています。',
  evidence: [
    ['ポートが使われている状態で起動した場合',
      '2026-09-17 06:45:14.046 UTC [6059] LOG:  database system is shut down\n2026-09-17 06:45:15.719 UTC [15497] LOG:  database system is shut down\n2026-09-17 06:45:21.704 UTC [15518] LOG:  database system is shut down\n2026-09-17 06:45:32.135 UTC [15567] LOG:  database system is shut down\n2026-09-17 06:45:13.925 UTC [15491] FATAL:  lock file "postmaster.pid" already exists\n2026-09-17 06:45:13.925 UTC [15491] HINT:  Is another postmaster (PID 6059) running in data directory "/var/lib/pgsql/14/primary"?']
  ],
  refs: [
    ['サーバ起動時の失敗', 'server-start.html#SERVER-START-FAILURES'],
    ['port', 'runtime-config-connection.html#GUC-PORT']
  ]
},
{
  id: 'G4.1-008', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: 'サーバの起動時に共有メモリセグメントの作成に失敗するエラーが出た場合の原因と対処として、最も適切なものを1つ選びなさい。',
  choices: [
    'pg_hba.conf で接続を許可していないため、該当するクライアントの行を追加する',
    'クライアントの接続数が多すぎるため、すべてのアプリケーションを停止してから再起動する',
    'shared_buffers などが OS のカーネル資源の上限を超えているため、カーネル設定か設定値を見直す',
    'ロケールの設定が不正なため、initdb をやり直す',
    'WAL ファイルが破損しているため、pg_resetwal を実行する'
  ],
  answer: 2,
  exp: '共有メモリの確保に失敗するエラーは、要求した共有メモリの大きさ（主に shared_buffers や max_connections などから決まる）が、カーネルの共有メモリの上限や、利用可能なメモリ量を超えている場合に発生します。huge_pages = on でヒュージページが確保できない場合も起動に失敗します。\n対処として、カーネルパラメータ（Linux の vm.nr_hugepages、System V 共有メモリの上限など）を見直すか、shared_buffers などの設定値を減らします。\nドキュメントの「サーバ起動時の失敗」と「共有メモリとセマフォ」で、原因と設定方法が説明されています。',
  evidence: [
    ['shared_buffers を大きくしすぎて起動できない場合',
      '$ pg_ctl restart・・hared_buffers = 100GB・・2026-09-21 04:32:20.085 UTC [42467] FATAL:  could not map anonymous shared memory: Cannot allocate memory\n2026-09-21 04:32:20.085 UTC [42467] HINT:  This error usually means that PostgreSQL\'s request for a shared memory segment exceeded available memory, swap space, or huge pages. To reduce the request size (currently 109611130880 bytes), reduce PostgreSQL\'s shared memory usage, perhaps by reducing shared_buffers or max_connections.\n2026-09-21 04:32:20.085 UTC [42467] LOG:  database system is shut down\n--- OS 蛛ｴ縺ｮ險ｭ螳・               total        used        free      shared  buff/cache   available\nMem:            1944         416         251          23        1457        1527\nvm.overcommit_memory = 0\nkernel.shmmax = 18446744073692774399\n shared_buffers\n----------------\n 128MB\n(1 row)']
  ],
  refs: [
    ['サーバ起動時の失敗', 'server-start.html#SERVER-START-FAILURES'],
    ['共有メモリとセマフォ', 'kernel-resources.html#SYSVIPC']
  ]
},
{
  id: 'G4.1-009', level: 'gold', cat: 'G4.1',
  q: '大きなソートなどで作成される一時ファイルによってディスクが満杯になることを防ぐため、セッションが使用できる一時ファイルの合計サイズに上限を設けたい。使用するパラメータを1つ選びなさい。',
  choices: [
    'temp_file_limit',
    'work_mem',
    'max_wal_size',
    'log_temp_files',
    'maintenance_work_mem'
  ],
  answer: 0,
  exp: 'temp_file_limit は、1つのプロセスが同時に使用できる一時ファイルの合計サイズの上限です（既定 -1 = 無制限）。上限を超えるような処理はエラーで中止されるため、誤った問い合わせによってディスクが満杯になり、サーバ全体に影響することを防げます。スーパーユーザが設定できます。\nwork_mem はソートやハッシュでメモリを使う上限で、超えた分は一時ファイルに書き出されます（一時ファイルの上限ではありません）。log_temp_files は一時ファイルをログに記録するだけのパラメータです。',
  refs: [
    ['temp_file_limit', 'runtime-config-resource.html#GUC-TEMP-FILE-LIMIT'],
    ['log_temp_files', 'runtime-config-logging.html#GUC-LOG-TEMP-FILES']
  ]
},
{
  id: 'G4.1-010', level: 'gold', cat: 'G4.1',
  q: '問題のあるセッションを停止させる関数に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_cancel_backend() は実行中の問い合わせだけを中止し、pg_terminate_backend() は接続そのものを切断する',
    'pg_cancel_backend() は接続を切断し、pg_terminate_backend() は問い合わせだけを中止する',
    'どちらもサーバ全体を再起動するため、他のセッションにも影響が及ぶ',
    'どちらもスーパーユーザしか実行できず、自分自身のセッションにも使えない',
    'OS の kill -9 でバックエンドプロセスを終了させるのが、最も安全で推奨される方法である'
  ],
  answer: 0,
  exp: 'pg_cancel_backend(pid) は指定したバックエンドで実行中の問い合わせをキャンセルしますが、接続は維持されます。pg_terminate_backend(pid) はバックエンドプロセス自体を終了させ、接続が切断されます。まず cancel を試し、効かなければ terminate を使うのが一般的です。\nスーパーユーザのほか、対象セッションと同じロールで接続している利用者や、pg_signal_backend ロールの権限を持つロールも実行できます。\nバックエンドを kill -9（SIGKILL）で終了させると、postmaster が共有メモリの破損の可能性を考えて全バックエンドを強制終了しリカバリを行うため、避けるべきです。',
  refs: [
    ['サーバシグナル送信関数', 'functions-admin.html#FUNCTIONS-ADMIN-SIGNAL'],
    ['サーバのシャットダウン', 'server-shutdown.html']
  ]
},
{
  id: 'G4.1-011', level: 'gold', cat: 'G4.1',
  q: 'デッドロックに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'deadlock_timeout の時間だけロックを待ってから検査が行われ、検出されると一方のトランザクションがエラーで中止される',
    'ロック待ちが発生した瞬間に検査が行われるため、deadlock_timeout の設定は検出の速さに影響しない',
    'デッドロックを検出すると、サーバは関係するすべてのトランザクションをコミットして解消する',
    'デッドロックはサーバが自動的に解消するため、アプリケーション側で再試行を用意する必要はない',
    'deadlock_timeout を小さくすると検出は速くなるが、サーバの負荷は下がる'
  ],
  answer: 0,
  exp: 'PostgreSQL はロック待ちが deadlock_timeout（既定 1s）を超えたときにデッドロックの検査を行い、循環待ちを検出すると一方のトランザクションを ERROR で中止して解消します。検査は負荷が高いため、待ち始めに即座には行われません。\ndeadlock_timeout を小さくすると検出は速くなりますが、通常のロック待ちでも無駄な検査が走り、負荷が上がります。\n中止された側のトランザクションはロールバックされるため、アプリケーションでは再試行できるようにしておく必要があります。\nlog_lock_waits を on にすると、deadlock_timeout を超えたロック待ちがログに記録され、調査に役立ちます。',
  refs: [
    ['デッドロック', 'explicit-locking.html#LOCKING-DEADLOCKS'],
    ['deadlock_timeout', 'runtime-config-locks.html#GUC-DEADLOCK-TIMEOUT']
  ]
},
{
  id: 'G4.1-012', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: 'アプリケーションの不具合でトランザクションを開いたまま放置するセッションが増え、VACUUM が不要タプルを回収できなくなっている。対処として最も適切なものを1つ選びなさい。',
  choices: [
    'idle_in_transaction_session_timeout を設定し、トランザクション内で待機したままのセッションを自動的に切断する',
    'statement_timeout を設定し、トランザクション内で待機したままのセッションを自動的に切断する',
    'autovacuum_naptime を短くして、自動バキュームの実行間隔を詰める',
    'max_connections を増やして、接続が枯渇しないようにする',
    'VACUUM FULL を定期的に実行して、不要タプルを強制的に回収する'
  ],
  answer: 0,
  exp: 'idle in transaction のセッションは古いスナップショットを保持し続けるため、VACUUM がそれ以降の不要タプルを回収できず、テーブルの肥大化や XID 周回のリスクにつながります。idle_in_transaction_session_timeout を設定すると、トランザクションを開いたまま指定時間を超えて待機しているセッションが切断されます。\nstatement_timeout は実行中の文が対象で、文を実行していない待機状態には効きません。\n自動バキュームの頻度を上げても、古いスナップショットが残っている限り回収はできません。\nVACUUM FULL も同じ制約を受け、さらに排他ロックを取るため常用には向きません。',
  evidence: [
    ['トランザクションを開いたままのセッションがあるときの VACUUM',
      '=# SELECT pid, state, now() - xact_start AS xact_age, backend_xmin, left(query, 32) AS query FROM pg_stat_activity WHERE datname = \'shop\' AND xact_start IS NOT NULL ORDER BY xact_start;\n  pid  | state  |    xact_age     | backend_xmin |              query\n-------+--------+-----------------+--------------+----------------------------------\n 52711 | active | 00:00:02.114769 |         1436 | BEGIN; SELECT count(*) FROM vt;\n 52718 | active | 00:00:00        |         1437 | SELECT pid, state, now() - xact_\n(2 rows)\n\n=# VACUUM (VERBOSE) vt;   ・亥商縺・ヨ繝ｩ繝ｳ繧ｶ繧ｯ繧ｷ繝ｧ繝ｳ縺梧ｮ九▲縺ｦ縺・ｋ髢難ｼ・INFO:  vacuuming "public.vt"\nDETAIL:  10000 dead row versions cannot be removed yet, oldest xmin: 1436\nINFO:  vacuuming "pg_toast.pg_toast_42113"\nDETAIL:  0 dead row versions cannot be removed yet, oldest xmin: 1436\n=# SELECT relname, n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = \'vt\';\n relname | n_live_tup | n_dead_tup\n---------+------------+------------\n vt      |      10000 |      10000\n(1 row)\n\n=# VACUUM (VERBOSE) vt;   ・医ヨ繝ｩ繝ｳ繧ｶ繧ｯ繧ｷ繝ｧ繝ｳ縺檎ｵゅｏ縺｣縺溘≠縺ｨ・・INFO:  vacuuming "public.vt"\nDETAIL:  0 dead row versions cannot be removed yet, oldest xmin: 1437\nINFO:  vacuuming "pg_toast.pg_toast_42113"\nDETAIL:  0 dead row versions cannot be removed yet, oldest xmin: 1437\n=# SELECT relname, n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = \'vt\';\n relname | n_live_tup | n_dead_tup\n---------+------------+------------\n vt      |      10000 |      10000\n(1 row)']
  ],
  refs: [
    ['文の動作（タイムアウト）', 'runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT'],
    ['定常的なバキューム作業', 'routine-vacuuming.html']
  ]
},
{
  id: 'G4.1-013', level: 'gold', cat: 'G4.1',
  q: 'バックエンドプロセスが異常終了した場合のサーバの動作に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '共有メモリが壊れている可能性があるため、postmaster は全バックエンドを強制終了してリカバリを行い、再初期化する',
    '異常終了したバックエンドの接続だけが切断され、他のセッションはそのまま処理を継続できる',
    'postmaster も同時に終了するため、管理者が手動で起動し直す必要がある',
    'クラッシュリカバリではアーカイブされた WAL が必要になるため、archive_mode が off だと起動できない',
    'restart_after_crash を off にすると、異常終了してもリカバリを行わずに処理を継続する'
  ],
  answer: 0,
  exp: 'バックエンドプロセスが異常終了すると、共有メモリの内容が中途半端な状態になっている可能性があるため、postmaster はすべてのバックエンドを強制終了し、共有メモリを初期化してからクラッシュリカバリを実行し、自動的に稼働を再開します。この間、他のセッションの接続も切断されます。\nクラッシュリカバリで使われるのは pg_wal にある WAL で、アーカイブは不要です。最後のチェックポイント以降の WAL を再適用します。\nrestart_after_crash（既定 on）を off にすると、自動で再開せずにサーバが停止したままになります。リカバリを省略するものではありません。',
  refs: [
    ['restart_after_crash', 'runtime-config-error-handling.html#GUC-RESTART-AFTER-CRASH'],
    ['WALの概要', 'wal-intro.html']
  ]
},
{
  id: 'G4.1-014', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: '多数のパーティションを一度に参照する問い合わせで「out of shared memory」というエラーが発生し、ヒントとして max_locks_per_transaction の増加が示された。説明として正しいものを1つ選びなさい。',
  choices: [
    '共有のロックテーブルの大きさが接続数との積で決まるためで、変更には再起動が必要になる',
    'ロックテーブルはトランザクションごとに動的に拡張されるため、パラメータを変更して再読み込みすればよい',
    '1トランザクションが取得できるロック数の厳密な上限を表すため、超えたトランザクションだけがエラーになる',
    'shared_buffers を増やせば解消するため、max_locks_per_transaction を変更する必要はない',
    'work_mem が不足していることを示すエラーなので、work_mem を増やして対処する'
  ],
  answer: 0,
  exp: 'このエラーは共有メモリ上のロックテーブルが枯渇したときに出ます。ロックテーブルの大きさは max_locks_per_transaction × (max_connections + max_prepared_transactions) の分だけ確保され、全体で共有されます。したがって max_locks_per_transaction は「1トランザクションあたりの厳密な上限」ではなく、平均値として枠を決めるパラメータです。\nこのパラメータは起動時にしか変更できないため、変更にはサーバの再起動が必要です。\nパーティションが多いテーブルへの問い合わせは、各パーティションとそのインデックスにロックを取るため、ロック数が一気に増えます。',
  evidence: [
    ['パーティションが多い問い合わせと max_locks_per_transaction',
      '=# SELECT count(*) AS partitions FROM pg_inherits WHERE inhparent = \'parts\'::regclass;\n partitions\n------------\n        200\n(1 row)\n\n=# SELECT current_setting(\'max_locks_per_transaction\') AS per_tx, current_setting(\'max_connections\') AS max_conn, current_setting(\'max_locks_per_transaction\')::int * (current_setting(\'max_connections\')::int + current_setting(\'max_prepared_transactions\')::int) AS lock_slots;\n per_tx | max_conn | lock_slots\n--------+----------+------------\n 64     | 100      |       6400\n(1 row)\n\n--- max_locks_per_transaction = 10縲［ax_connections = 10 縺ｫ縺励※蜀崎ｵｷ蜍包ｼ医Ο繝・け繧ｹ繝ｭ繝・ヨ縺ｯ 100・・=# SELECT current_setting(\'max_locks_per_transaction\')::int * (current_setting(\'max_connections\')::int + current_setting(\'max_prepared_transactions\')::int) AS lock_slots;\n lock_slots\n------------\n        100\n(1 row)\n\n=# SELECT count(*) FROM parts;   ・・00蛟九・繝代・繝・ぅ繧ｷ繝ｧ繝ｳ縺吶∋縺ｦ縺ｫ繝ｭ繝・け縺悟ｿ・ｦ・ｼ・ERROR:  out of shared memory\nHINT:  You might need to increase max_locks_per_transaction.\nCONTEXT:  parallel worker\n=# SELECT count(*) FROM parts;   ・郁ｨｭ螳壹ｒ謌ｻ縺励◆縺ゅ→・・ count\n-------\n     0\n(1 row)']
  ],
  refs: [
    ['max_locks_per_transaction', 'runtime-config-locks.html#GUC-MAX-LOCKS-PER-TRANSACTION'],
    ['ロック管理', 'runtime-config-locks.html']
  ]
},
{
  id: 'G4.1-015', level: 'gold', cat: 'G4.1',
  q: 'PostgreSQL のプロセスに送るシグナルの影響として、適切なものを3つ選びなさい。',
  choices: [
    'postmaster に SIGHUP を送ると、設定ファイルが再読み込みされる',
    'postmaster に SIGTERM を送ると、スマートシャットダウンが行われる',
    'pg_cancel_backend() は、バックエンドに SIGINT を送るのと同等の効果がある',
    'postmaster に SIGQUIT を送ると、正常終了（スマートシャットダウン）が行われる',
    'バックエンドを SIGKILL で終了させるのが、最も安全な停止方法である'
  ],
  answer: [0, 1, 2],
  exp: 'postmaster へのシグナルはシャットダウンモードに対応しています。SIGTERM がスマート（既存の接続の終了を待つ、pg_ctl stop -m smart）、SIGINT がファスト（実行中のトランザクションを中止して停止、-m fast）、SIGQUIT が即時（チェックポイントなしで強制終了、-m immediate）です。SIGQUIT での停止は次回起動時にクラッシュリカバリを伴います。\nSIGHUP は設定ファイルの再読み込みで、pg_ctl reload や pg_reload_conf() と同じです。\nバックエンドに対しては、SIGINT が問い合わせのキャンセル（pg_cancel_backend 相当）、SIGTERM がセッションの終了（pg_terminate_backend 相当）です。\nSIGKILL は共有メモリの破損につながるため使うべきではありません。',
  refs: [
    ['サーバのシャットダウン', 'server-shutdown.html'],
    ['サーバシグナル送信関数', 'functions-admin.html#FUNCTIONS-ADMIN-SIGNAL']
  ]
},
{
  id: 'G4.1-016', level: 'gold', cat: 'G4.1',
  q: '接続数が上限に達した、または枯渇しかけている状況の説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    '上限に達した接続要求は、空きができるまでサーバ側の待ち行列に入る',
    'idle のセッションも接続枠を消費している',
    'superuser_reserved_connections の分は、一般ユーザには使えない',
    '接続プーラを使うと、アプリケーション側の接続数に比べてサーバ側の接続数を減らせる',
    '接続数を増やすと、必要となる共有メモリやプロセス数も増える'
  ],
  answer: 0,
  exp: 'PostgreSQL には接続の待ち行列はありません。max_connections に達した状態で新しい接続を試みると、待たされるのではなく「sorry, too many clients already」というエラーで即座に拒否されます。この点が誤りです。\n問い合わせを実行していない idle のセッションも接続枠とプロセスを消費します。接続と切断が多いアプリケーションでは、接続プーラを挟んでサーバ側の接続数を抑えるのが定石です。\nsuperuser_reserved_connections（既定 3）はスーパーユーザ用の予備枠で、一般ユーザが使えるのは max_connections からこの数を引いた分です。',
  refs: [
    ['接続設定', 'runtime-config-connection.html#RUNTIME-CONFIG-CONNECTION-SETTINGS'],
    ['カーネルリソースの管理', 'kernel-resources.html']
  ]
},
{
  id: 'G4.1-017', level: 'gold', cat: 'G4.1',
  q: 'OS のリソース枯渇による障害に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'pg_wal のあるファイルシステムが満杯になると、サーバは PANIC で停止することがある',
    '大きなソートによる一時ファイルの増大は、temp_file_limit で1セッションあたりの上限を設けられる',
    'ディスクが満杯になっても、WAL は圧縮されるため停止することはない',
    '一時ファイルは work_mem の範囲でしか作られないため、ディスクを圧迫することはない',
    'OOM killer によるバックエンドの終了は、そのセッションだけに影響が留まる'
  ],
  answer: [0, 1],
  exp: 'pg_wal のあるファイルシステムが満杯になると WAL を書けなくなり、サーバは PANIC で停止します。アーカイブの失敗やレプリケーションスロットの滞留が主な原因なので、空き容量の監視が重要です。\nソートやハッシュが work_mem に収まらない場合、あふれた分はディスク上の一時ファイルに書き出されます。これが肥大化してディスクを圧迫することがあるため、temp_file_limit でセッションあたりの上限を設けられます。log_temp_files で記録することもできます。\nOOM killer にバックエンドが終了させられると、postmaster は共有メモリの破損の可能性を考えて全バックエンドを強制終了し、リカバリを行うため、他のセッションにも影響します。',
  refs: [
    ['ディスク容量の監視', 'diskusage.html'],
    ['temp_file_limit', 'runtime-config-resource.html#GUC-TEMP-FILE-LIMIT'],
    ['Linuxのメモリオーバーコミット', 'kernel-resources.html#LINUX-MEMORY-OVERCOMMIT']
  ]
},
{
  id: 'G4.1-018', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: 'サーバログに現れるメッセージと、その原因の組み合わせとして、適切なものを2つ選びなさい。',
  choices: [
    '「could not extend file ...: No space left on device」— ディスクの空き容量がない',
    '「sorry, too many clients already」— 同時接続数が max_connections に達している',
    '「canceling statement due to statement timeout」— デッドロックが検出された',
    '「database is not accepting commands to avoid wraparound data loss」— ディスクが故障している',
    '「terminating connection due to administrator command」— 認証に失敗した'
  ],
  answer: [0, 1],
  exp: 'ファイルを拡張できない旨のメッセージは、ディスクの空き容量不足を示します。\n「sorry, too many clients already」は接続数が上限に達したことを表します。\n「canceling statement due to statement timeout」は statement_timeout による中止で、デッドロックの場合は「deadlock detected」というメッセージになります。\n「database is not accepting commands to avoid wraparound data loss」はトランザクションID の周回が迫り、書き込みが拒否されている状態です。VACUUM が必要で、ディスクの故障とは関係ありません。\n「terminating connection due to administrator command」は pg_terminate_backend() などによる切断です。',
  evidence: [
    ['クラッシュリカバリと起動失敗のログ',
      'waiting for server to shut down.... done\nserver stopped\nDatabase cluster state:               in production\n2026-09-17 06:45:14.229 UTC [15499] LOG:  database system was interrupted; last known up at 2026-09-17 06:45:13 UTC\n2026-09-17 06:45:15.450 UTC [15499] LOG:  database system was not properly shut down; automatic recovery in progress\n2026-09-17 06:45:15.456 UTC [15499] LOG:  redo starts at 0/6D3CEEB0\n2026-09-17 06:45:15.494 UTC [15499] LOG:  redo done at 0/6ED5B9A8 system usage: CPU: user: 0.01 s, system: 0.01 s, elapsed: 0.03 s\n2026-09-17 06:45:15.595 UTC [15497] LOG:  database system is ready to accept connections\nDatabase cluster state:               in production'],
    ['ロック待ち・デッドロック・タイムアウトのログ',
      '2026-09-17 06:31:05.678 UTC [9012] postgres@shop LOG:  process 9012 still waiting for ShareLock on transaction 758 after 1002.805 ms\n2026-09-17 06:31:05.678 UTC [9012] postgres@shop DETAIL:  Process holding the lock: 9004. Wait queue: 9012.\n2026-09-17 06:31:05.678 UTC [9012] postgres@shop CONTEXT:  while updating tuple (0,1) in relation "accounts"\n2026-09-17 06:31:22.673 UTC [9012] postgres@shop LOG:  process 9012 acquired ShareLock on transaction 758 after 17997.652 ms\n2026-09-17 06:31:22.673 UTC [9012] postgres@shop CONTEXT:  while updating tuple (0,1) in relation "accounts"\n2026-09-17 06:31:31.774 UTC [9021] postgres@shop DETAIL:  Process holding the lock: 9023. Wait queue: .\n2026-09-17 06:31:31.774 UTC [9021] postgres@shop CONTEXT:  while updating tuple (0,2) in relation "accounts"\n2026-09-17 06:31:31.774 UTC [9021] postgres@shop STATEMENT:  UPDATE accounts SET balance = balance + 1 WHERE id = 2;\n2026-09-17 06:31:31.781 UTC [9021] postgres@shop ERROR:  deadlock detected\n2026-09-17 06:31:31.781 UTC [9021] postgres@shop DETAIL:  Process 9021 waits for ShareLock on transaction 762; blocked by process 9023.\n	Process 9021: UPDATE accounts SET balance = balance + 1 WHERE id = 2;\n	Process 9023: UPDATE accounts SET balance = balance + 1 WHERE id = 1;\n2026-09-17 06:31:31.781 UTC [9021] postgres@shop HINT:  See server log for query details.\n2026-09-17 06:31:31.781 UTC [9021] postgres@shop CONTEXT:  while updating tuple (0,2) in relation "accounts"\n2026-09-17 06:31:31.781 UTC [9021] postgres@shop STATEMENT:  UPDATE accounts SET balance = balance + 1 WHERE id = 2;\n2026-09-17 06:31:34.041 UTC [9036] postgres@shop LOG:  process 9036 still waiting for AccessShareLock on relation 16466 of database 16419 after 1124.460 ms at character 40\n2026-09-17 06:31:34.041 UTC [9036] postgres@shop DETAIL:  Process holding the lock: 9032. Wait queue: 9036.']
  ],
  refs: [
    ['トランザクションIDの周回エラーの防止', 'routine-vacuuming.html#VACUUM-FOR-WRAPAROUND'],
    ['エラー報告とログ取得', 'runtime-config-logging.html'],
    ['ディスク容量の監視', 'diskusage.html']
  ]
},
{
  id: 'G4.1-019', level: 'gold', cat: 'G4.1',
  q: 'ロック競合による性能問題の調査方法として、適切なものを2つ選びなさい。',
  choices: [
    'log_lock_waits を on にして、deadlock_timeout を超えたロック待ちをログに記録する',
    'pg_blocking_pids() を使って、待たされているセッションを止めている相手を特定する',
    'pg_locks の granted 列が true の行だけを見れば、待ちの状況が分かる',
    'lock_timeout を長くすると、ロック競合そのものが解消される',
    'ロック競合は pg_stat_statements で待ち時間として集計される'
  ],
  answer: [0, 1],
  exp: 'log_lock_waits（既定 off）を on にすると、deadlock_timeout（既定 1s）を超えて待たされたロックがサーバログに記録されます。事後の調査に有効です。\npg_blocking_pids(pid) は、指定したプロセスのロック獲得を妨げているプロセスの ID を配列で返します。pg_stat_activity と組み合わせて、原因のセッションと問い合わせを特定できます。\n待ちの状況を見るのは granted が false の行です。\nlock_timeout はあきらめるまでの時間を決めるだけで、競合自体は解消しません。\npg_stat_statements が集計するのは実行時間と計画時間で、待機の内訳は分かりません。',
  refs: [
    ['log_lock_waits', 'runtime-config-logging.html#GUC-LOG-LOCK-WAITS'],
    ['セッション情報関数', 'functions-info.html#FUNCTIONS-INFO-SESSION-TABLE']
  ]
},
{
  id: 'G4.1-020', level: 'gold', cat: 'G4.1',
  q: 'ディスクが逼迫したときに確認・対処すべき点として、適切なものを3つ選びなさい。',
  choices: [
    'アーカイブの失敗やレプリケーションスロットの滞留で pg_wal が増えていないか',
    'ログファイルや一時ファイルが蓄積していないか',
    'テーブルの肥大化が進んでいないかを pgstattuple などで確認する',
    'データディレクトリ内の pg_xact を削除して空きを作る',
    'pg_wal 内の古い WAL ファイルを手作業で削除して空きを作る'
  ],
  answer: [0, 1, 2],
  exp: 'ディスクの逼迫では、まず何が増えているのかを切り分けます。pg_wal の増加はアーカイブの失敗、レプリケーションスロットの滞留、max_wal_size の設定などが原因です。サーバログや一時ファイル（base/pgsql_tmp）の蓄積、テーブル・インデックスの肥大化も典型的な原因です。\npg_wal 内の WAL を手作業で削除すると、クラッシュリカバリやレプリケーションができなくなり、データベースが壊れます。不要になれば PostgreSQL が自動的に削除するため、原因（アーカイブの失敗やスロット）を取り除くのが正しい対処です。\npg_xact はトランザクションのコミット状態を保持する必須のデータで、削除してはいけません。',
  refs: [
    ['ディスク容量の監視', 'diskusage.html'],
    ['WALの設定', 'wal-configuration.html'],
    ['pgstattuple', 'pgstattuple.html']
  ]
},
{
  id: 'G4.1-021', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: '次の操作を行った。この状態の説明として、正しいものを1つ選びなさい。',
  code: '$ pg_ctl -D $PGDATA stop -m immediate\nwaiting for server to shut down.... done\nserver stopped\n\n$ pg_controldata -D $PGDATA | grep "cluster state"\nDatabase cluster state:               in production',
  choices: [
    '正常な停止処理が行われていないため、次回の起動時にクラッシュリカバリが実行される',
    'サーバはまだ稼働しており、pg_ctl の「server stopped」という表示は誤りである',
    '「in production」はスタンバイとして起動する設定になっていることを表す',
    '次回の起動には、アーカイブされた WAL を restore_command で取り出す必要がある',
    'このままでは起動できないため、pg_resetwal を実行してから起動する必要がある'
  ],
  answer: 0,
  exp: 'immediate モードの停止はチェックポイントを行わずに全プロセスを終了させるため、pg_control の状態は稼働中の「in production」のまま残ります。fast や smart で正常に停止した場合は「shut down」になり、同じ環境で fast 停止後に確認すると実際にそう表示されました。\n次に起動すると、サーバは異常終了とみなしてクラッシュリカバリを行います。実際のログは次のとおりです。\n`LOG:  database system was interrupted; last known up at ...`\n`LOG:  database system was not properly shut down; automatic recovery in progress`\n`LOG:  redo starts at 0/6D3CEEB0`\n`LOG:  redo done at 0/6ED5B9A8 ...`\n`LOG:  database system is ready to accept connections`\nクラッシュリカバリに使うのは pg_wal 内の WAL で、アーカイブは不要です。pg_resetwal は通常の起動では決して使いません。',
  evidence: [
    ['immediate で停止したあとの pg_controldata と、次の起動',
      'waiting for server to shut down.... done\nserver stopped\nDatabase cluster state:               in production\n2026-09-17 06:45:14.229 UTC [15499] LOG:  database system was interrupted; last known up at 2026-09-17 06:45:13 UTC\n2026-09-17 06:45:15.450 UTC [15499] LOG:  database system was not properly shut down; automatic recovery in progress\n2026-09-17 06:45:15.456 UTC [15499] LOG:  redo starts at 0/6D3CEEB0\n2026-09-17 06:45:15.494 UTC [15499] LOG:  redo done at 0/6ED5B9A8 system usage: CPU: user: 0.01 s, system: 0.01 s, elapsed: 0.03 s\n2026-09-17 06:45:15.595 UTC [15497] LOG:  database system is ready to accept connections\nDatabase cluster state:               in production\n\nwaiting for server to shut down.... done\nserver stopped\nDatabase cluster state:               shut down\nLatest checkpoint location:           0/6ED5BA98\n application_name | state\n------------------+-------\n(0 rows)']
  ],
  refs: [
    ['サーバのシャットダウン', 'server-shutdown.html'],
    ['pg_controldata', 'app-pgcontroldata.html'],
    ['WALの概要', 'wal-intro.html']
  ]
},
{
  id: 'G4.1-022', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: 'サーバの起動時に、次のログが出力された。読み取れることとして、適切なものを2つ選びなさい。',
  code: 'LOG:  database system was interrupted; last known up at 2026-09-17 06:45:13 UTC\nLOG:  database system was not properly shut down; automatic recovery in progress\nLOG:  redo starts at 0/6D3CEEB0\nLOG:  redo done at 0/6ED5B9A8 system usage: CPU: user: 0.01 s, system: 0.01 s, elapsed: 0.03 s\nLOG:  database system is ready to accept connections',
  choices: [
    '直前の停止が正常ではなかったため、WAL を再適用して整合性のある状態に戻している',
    'リカバリが完了し、クライアントからの接続を受け付けられる状態になっている',
    'restore_command でアーカイブから WAL を取り出して適用している',
    'コミット済みのトランザクションの一部が失われたことを示している',
    '管理者が recovery.signal を置いたため、アーカイブリカバリが行われている'
  ],
  answer: [0, 1],
  exp: 'このログは immediate モードで停止した後に、PostgreSQL 14 を起動して実際に出力されたものです。「not properly shut down; automatic recovery in progress」はクラッシュリカバリの開始を表し、最後のチェックポイント（REDO 位置）から pg_wal 内の WAL を再適用しています（redo starts / redo done）。完了すると「ready to accept connections」となり、接続を受け付けます。\nWAL に書き込まれてコミットしたトランザクションは再適用で復元されるため、コミット済みのデータは失われません（synchronous_commit = off の場合を除く）。\nクラッシュリカバリはアーカイブも recovery.signal も使いません。これらはアーカイブリカバリ（PITR）の場合です。',
  evidence: [
    ['クラッシュリカバリのログ（immediate 停止のあとの起動）',
      'waiting for server to shut down.... done\nserver stopped\nDatabase cluster state:               in production\n2026-09-17 06:45:14.229 UTC [15499] LOG:  database system was interrupted; last known up at 2026-09-17 06:45:13 UTC\n2026-09-17 06:45:15.450 UTC [15499] LOG:  database system was not properly shut down; automatic recovery in progress\n2026-09-17 06:45:15.456 UTC [15499] LOG:  redo starts at 0/6D3CEEB0\n2026-09-17 06:45:15.494 UTC [15499] LOG:  redo done at 0/6ED5B9A8 system usage: CPU: user: 0.01 s, system: 0.01 s, elapsed: 0.03 s\n2026-09-17 06:45:15.595 UTC [15497] LOG:  database system is ready to accept connections\nDatabase cluster state:               in production']
  ],
  refs: [
    ['WALの概要', 'wal-intro.html'],
    ['WALの設定', 'wal-configuration.html']
  ]
},
{
  id: 'G4.1-023', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: '2つのクライアント A・B が同時に accounts テーブルを更新したところ、A だけに次のエラーが返り、サーバログにも記録が残った。説明として適切なものを2つ選びなさい。',
  code: '-- クライアント A に返ったエラー\nERROR:  deadlock detected\nDETAIL:  Process 9021 waits for ShareLock on transaction 762; blocked by process 9023.\nProcess 9023 waits for ShareLock on transaction 761; blocked by process 9021.\nHINT:  See server log for query details.\nCONTEXT:  while updating tuple (0,2) in relation "accounts"\n\n-- サーバログ（抜粋）\nERROR:  deadlock detected\nDETAIL:  Process 9021 waits for ShareLock on transaction 762; blocked by process 9023.\n        Process 9023 waits for ShareLock on transaction 761; blocked by process 9021.\n        Process 9021: UPDATE accounts SET balance = balance + 1 WHERE id = 2;\n        Process 9023: UPDATE accounts SET balance = balance + 1 WHERE id = 1;',
  choices: [
    '2つのトランザクションが互いの更新した行を待ち合い、プロセス 9021 側のトランザクションが中止された',
    'サーバログには、デッドロックに関わった双方のプロセスが実行していた SQL が記録されている',
    'デッドロックのため両方のトランザクションがロールバックされ、どちらの更新も反映されない',
    'deadlock_timeout を大きくすれば、この種のデッドロックそのものが発生しなくなる',
    'エラーになった A のトランザクションは、次の文を実行すれば自動的に続きから再開される'
  ],
  answer: [0, 1],
  exp: 'A は id=1 → id=2、B は id=2 → id=1 の順に更新しており、互いが先に更新した行を待つ循環になっていました。PostgreSQL はこれを検出すると、どちらか一方（この例では 9021 = A）のトランザクションを中止して循環を解きます。残った B は処理を続けてコミットに成功しています。\nクライアントに返るエラーには相手の SQL が含まれません（HINT が示すとおり）。サーバログの DETAIL に、関係したプロセスそれぞれの SQL が記録されます。\ndeadlock_timeout は検出を始めるまでの待ち時間で、デッドロックの発生自体は防げません。対策は、更新する行の順序をアプリケーションで揃えること（例: id の小さい順）と、中止されたトランザクションを再実行できるようにしておくことです。\n中止されたトランザクションは ROLLBACK するまで以降の文を受け付けません。\nこれらの出力は PostgreSQL 14 で実際に再現したものです。',
  evidence: [
    ['デッドロックが起きたときのクライアントの表示とサーバログ',
      '2026-09-17 06:31:05.678 UTC [9012] postgres@shop LOG:  process 9012 still waiting for ShareLock on transaction 758 after 1002.805 ms\n2026-09-17 06:31:05.678 UTC [9012] postgres@shop DETAIL:  Process holding the lock: 9004. Wait queue: 9012.\n2026-09-17 06:31:05.678 UTC [9012] postgres@shop CONTEXT:  while updating tuple (0,1) in relation "accounts"\n2026-09-17 06:31:22.673 UTC [9012] postgres@shop LOG:  process 9012 acquired ShareLock on transaction 758 after 17997.652 ms\n2026-09-17 06:31:22.673 UTC [9012] postgres@shop CONTEXT:  while updating tuple (0,1) in relation "accounts"\n2026-09-17 06:31:31.774 UTC [9021] postgres@shop DETAIL:  Process holding the lock: 9023. Wait queue: .\n2026-09-17 06:31:31.774 UTC [9021] postgres@shop CONTEXT:  while updating tuple (0,2) in relation "accounts"\n2026-09-17 06:31:31.774 UTC [9021] postgres@shop STATEMENT:  UPDATE accounts SET balance = balance + 1 WHERE id = 2;\n2026-09-17 06:31:31.781 UTC [9021] postgres@shop ERROR:  deadlock detected\n2026-09-17 06:31:31.781 UTC [9021] postgres@shop DETAIL:  Process 9021 waits for ShareLock on transaction 762; blocked by process 9023.\n	Process 9021: UPDATE accounts SET balance = balance + 1 WHERE id = 2;\n	Process 9023: UPDATE accounts SET balance = balance + 1 WHERE id = 1;\n2026-09-17 06:31:31.781 UTC [9021] postgres@shop HINT:  See server log for query details.\n2026-09-17 06:31:31.781 UTC [9021] postgres@shop CONTEXT:  while updating tuple (0,2) in relation "accounts"\n2026-09-17 06:31:31.781 UTC [9021] postgres@shop STATEMENT:  UPDATE accounts SET balance = balance + 1 WHERE id = 2;\n2026-09-17 06:31:34.041 UTC [9036] postgres@shop LOG:  process 9036 still waiting for AccessShareLock on relation 16466 of database 16419 after 1124.460 ms at character 40\n2026-09-17 06:31:34.041 UTC [9036] postgres@shop DETAIL:  Process holding the lock: 9032. Wait queue: 9036.\n\n--- クライアント A ---\n pg_sleep\n----------\n\n(1 row)\n\nERROR:  deadlock detected\nDETAIL:  Process 9021 waits for ShareLock on transaction 762; blocked by process 9023.\nProcess 9023 waits for ShareLock on transaction 761; blocked by process 9021.\nHINT:  See server log for query details.\nCONTEXT:  while updating tuple (0,2) in relation "accounts"\n--- クライアント B ---\n pg_sleep\n----------\n\n(1 row)\n\n--- サーバログ ---\n datname | deadlocks | temp_files | temp_bytes | conflicts\n---------+-----------+------------+------------+-----------\n shop    |         1 |         12 | 33 MB      |         0\n(1 row)']
  ],
  refs: [
    ['デッドロック', 'explicit-locking.html#LOCKING-DEADLOCKS'],
    ['deadlock_timeout', 'runtime-config-locks.html#GUC-DEADLOCK-TIMEOUT']
  ]
},
{
  id: 'G4.1-024', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: '3種類のタイムアウトを試したところ、次の結果になった。説明として適切なものを2つ選びなさい。',
  code: '-- (1) 別セッションが accounts を ACCESS EXCLUSIVE でロック中\n=# SET lock_timeout = \'2s\';\n=# SELECT * FROM accounts;\nERROR:  canceling statement due to lock timeout\n\n-- (2)\n=# SET statement_timeout = \'1s\';\n=# SELECT pg_sleep(3);\nERROR:  canceling statement due to statement timeout\n\n-- (3)\n=# SET idle_in_transaction_session_timeout = \'2s\';\n=# BEGIN;\n=# SELECT 1;\n（4秒何もしない）\n=# SELECT 2;\nFATAL:  terminating connection due to idle-in-transaction timeout\nserver closed the connection unexpectedly',
  choices: [
    '(1) と (2) は ERROR なので、取り消されるのはその文だけで、接続は維持されている',
    '(3) はトランザクション内で待機し続けたため、接続そのものが切断された',
    '(3) の設定は、トランザクションの外で待機しているセッションも同じように切断する',
    '(1) の lock_timeout は、ロック待ちを含めた文全体の実行時間の上限である',
    '(2) で取り消された文を含むトランザクションは、自動的にコミットされる'
  ],
  answer: [0, 1],
  exp: 'メッセージの重大度に注目します。ERROR はその文（とトランザクション）を中止しますが接続は残ります。FATAL はセッションを終了させます。\n(1) lock_timeout はロックの獲得を待つ時間の上限で、超えると文が取り消されます。文全体の実行時間の上限は (2) の statement_timeout です。\n(3) idle_in_transaction_session_timeout は、トランザクションを開いたまま指定時間を超えて待機したセッションを切断します。古いスナップショットを持ち続けて VACUUM を妨げるのを防ぐ設定です。トランザクション外で待機しているセッションを切断するのは、PostgreSQL 14 で追加された idle_session_timeout です。\nエラーになったトランザクションは中断状態になり、ROLLBACK するまで以降の文を受け付けません。自動的にコミットされることはありません。\nいずれも PostgreSQL 14 で実際に出力されたメッセージです。',
  evidence: [
    ['3種類のタイムアウトを試した結果',
      'ERROR:  canceling statement due to lock timeout\nLINE 1: SET lock_timeout = \'2s\'; SELECT * FROM accounts;\n                                               ^\nERROR:  canceling statement due to statement timeout\nSET\nBEGIN\n ?column?\n----------\n        1\n(1 row)\n\nFATAL:  terminating connection due to idle-in-transaction timeout\nserver closed the connection unexpectedly\n	This probably means the server terminated abnormally\n	before or while processing the request.\nconnection to server was lost']
  ],
  refs: [
    ['文の動作', 'runtime-config-client.html#RUNTIME-CONFIG-CLIENT-STATEMENT'],
    ['重大度の階層', 'runtime-config-logging.html#RUNTIME-CONFIG-SEVERITY-LEVELS']
  ]
},
{
  id: 'G4.1-025', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: '`max_connections = 10`（superuser_reserved_connections は既定値）のサーバで、アプリケーション用ロール alice の接続が次のエラーになった。説明として正しいものを1つ選びなさい。',
  code: 'psql: error: connection to server at "127.0.0.1", port 5432 failed:\n  FATAL:  remaining connection slots are reserved for non-replication superuser connections\n\n-- スーパーユーザで確認\n=# SELECT count(*) AS connections, current_setting(\'max_connections\') AS max_connections,\n          current_setting(\'superuser_reserved_connections\') AS reserved\n     FROM pg_stat_activity WHERE backend_type = \'client backend\';\n connections | max_connections | reserved\n-------------+-----------------+----------\n           8 | 10              | 3',
  choices: [
    '一般ユーザが使える 7 接続がすべて埋まっており、残りはスーパーユーザ用に予約されている',
    'max_connections の 10 接続がすべて埋まっているため、スーパーユーザも接続できない',
    'alice のパスワードが誤っているため、接続が拒否された',
    '接続はサーバ側で待ち行列に入り、空きができれば自動的に接続される',
    'superuser_reserved_connections を 0 にすれば、再読み込みだけで alice も接続できるようになる'
  ],
  answer: 0,
  exp: '一般ユーザが使える接続数は max_connections − superuser_reserved_connections（既定 3）＝ 7 です。7 接続が埋まった状態で一般ユーザが接続しようとすると、このエラーで拒否されます。予約分が残っているため、スーパーユーザは接続でき、実際にこの状態で接続して確認できました（確認用の接続を含めて 8 接続）。\nPostgreSQL には接続の待ち行列はなく、上限に達した接続は即座に拒否されます。\nmax_connections も superuser_reserved_connections も、変更にはサーバの再起動が必要です。\n根本的な対策としては、アプリケーション側で接続プールを使う、不要な接続（idle のまま放置されたものなど）を見直す、といった方法を検討します。\nこのエラーは PostgreSQL 14 で実際に出力されたものです。',
  evidence: [
    ['接続数が上限に達したときのエラーと、そのときの接続数',
      'psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  remaining connection slots are reserved for non-replication superuser connections\n connections | max_connections | reserved\n-------------+-----------------+----------\n           8 | 10              | 3\n(1 row)\n\ndone']
  ],
  refs: [
    ['接続設定', 'runtime-config-connection.html#RUNTIME-CONFIG-CONNECTION-SETTINGS'],
    ['pg_stat_activity', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW']
  ]
},
{
  id: 'G4.1-026', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: '長時間実行中の `SELECT pg_sleep(30);` に対して、別のセッションから関数を実行した。実行したクライアント側には、(1) と (2) の出力が返った。説明として正しいものを1つ選びなさい。',
  code: '-- (1) の場合\nERROR:  canceling statement due to user request\n\n-- (2) の場合\nFATAL:  terminating connection due to administrator command\nserver closed the connection unexpectedly\n	This probably means the server terminated abnormally\n	before or while processing the request.\nconnection to server was lost',
  choices: [
    '(1) は pg_cancel_backend() で文だけが取り消され、(2) は pg_terminate_backend() で接続が切断された',
    '(1) は pg_terminate_backend() で接続が切断され、(2) は pg_cancel_backend() で文だけが取り消された',
    '(1) と (2) はどちらも、サーバ全体が異常終了したことを示している',
    '(2) の後、サーバはクラッシュリカバリを行うため、他のセッションもすべて切断される',
    '(1) の後、そのセッションは自動的に切断され、再接続が必要になる'
  ],
  answer: 0,
  exp: 'pg_cancel_backend(pid) は実行中の問い合わせだけを取り消し（ERROR: canceling statement due to user request）、接続は残ります。pg_terminate_backend(pid) はそのバックエンドプロセスを終了させるため、接続が切断されます（FATAL: terminating connection due to administrator command）。\n(2) の「server closed the connection unexpectedly」は psql 側の表示で、サーバ全体が異常終了したわけではありません。終了したのは対象のバックエンドだけで、他のセッションやサーバには影響しません。一方、OS の kill -9 でバックエンドを強制終了させると、共有メモリの破損を避けるため全セッションが切断されクラッシュリカバリが走るので、使うべきではありません。\nこれらの出力は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['pg_cancel_backend と pg_terminate_backend を実行した結果',
      'pg_cancel_backend\n-------------------\n t\n(1 row)\n\nERROR:  canceling statement due to user request\n pg_terminate_backend\n----------------------\n t\n(1 row)\n\nFATAL:  terminating connection due to administrator command\nserver closed the connection unexpectedly\n	This probably means the server terminated abnormally\n	before or while processing the request.\nconnection to server was lost\n\n（同じことを pg_ctl kill で行った場合）\n$ pg_ctl kill INT <pid>\nexit status: 0\nERROR:  canceling statement due to user request\n$ pg_ctl kill TERM <pid>\nexit status: 0\nFATAL:  terminating connection due to administrator command\nserver closed the connection unexpectedly\n	This probably means the server terminated abnormally\n	before or while processing the request.\nconnection to server was lost\n2026-09-18 13:20:59.125 UTC [5007] postgres@terms ERROR:  canceling statement due to user request\n2026-09-18 13:21:00.220 UTC [5014] postgres@terms FATAL:  terminating connection due to administrator command\n$ pg_ctl kill HUP 999999\npg_ctl: could not send signal 1 (PID: 999999): No such process\nexit status: 1']
  ],
  refs: [
    ['サーバシグナル送信関数', 'functions-admin.html#FUNCTIONS-ADMIN-SIGNAL'],
    ['サーバのシャットダウン', 'server-shutdown.html']
  ]
},
{
  id: 'G4.1-027', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: '稼働中のサーバに対して、同じデータディレクトリを指定して次のコマンドを実行した。サーバログには2行が出力された。説明として正しいものを1つ選びなさい。',
  code: '$ pg_ctl -D /var/lib/pgsql/14/primary -l logfile start\nwaiting for server to start.... stopped waiting\npg_ctl: could not start server\nExamine the log output.\n\n-- サーバログ\nFATAL:  lock file "postmaster.pid" already exists\nHINT:  Is another postmaster (PID 6059) running in data directory "/var/lib/pgsql/14/primary"?',
  choices: [
    'すでに別の postmaster がこのデータディレクトリで稼働しているため、二重起動が防がれた',
    'postmaster.pid が壊れているため、削除してから起動し直せばよい',
    'ポート番号が重複しているため、port を変更すれば同じデータディレクトリで2つ起動できる',
    'PID 6059 のプロセスは異常終了しているので、データディレクトリの復旧が必要である',
    'サーバは起動しており、「could not start server」は表示上の誤りである'
  ],
  answer: 0,
  exp: 'postmaster.pid は、データディレクトリを使用中の postmaster の PID などを記録したロックファイルです。起動時にこのファイルがあり、記録された PID のプロセスが実際に動いていると、同じデータディレクトリで2つ目のサーバが起動しないよう「lock file "postmaster.pid" already exists」で停止します。この例では PID 6059 のサーバが稼働中でした。\n1つのデータディレクトリを複数のサーバで同時に使うとデータが壊れるため、ポートを変えても起動できません。\nサーバが稼働中なのに postmaster.pid を削除して起動するのは非常に危険です。削除を検討してよいのは、ps などで該当プロセスが存在しないことを確認した場合に限られます（通常は PostgreSQL が古いロックファイルを自動的に判別します）。\nこの出力は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['稼働中のクラスタに対して、同じデータディレクトリで起動した場合',
      '2026-09-17 06:45:14.046 UTC [6059] LOG:  database system is shut down\n2026-09-17 06:45:15.719 UTC [15497] LOG:  database system is shut down\n2026-09-17 06:45:21.704 UTC [15518] LOG:  database system is shut down\n2026-09-17 06:45:32.135 UTC [15567] LOG:  database system is shut down\n2026-09-17 06:45:13.925 UTC [15491] FATAL:  lock file "postmaster.pid" already exists\n2026-09-17 06:45:13.925 UTC [15491] HINT:  Is another postmaster (PID 6059) running in data directory "/var/lib/pgsql/14/primary"?']
  ],
  refs: [
    ['データベースサーバの起動', 'server-start.html'],
    ['データベースファイルのレイアウト', 'storage-file-layout.html']
  ]
},
{
  id: 'G4.1-028', level: 'gold', cat: 'G4.1',
  q: 'ホットスタンバイで問い合わせのコンフリクト（衝突）を減らすために、プライマリで vacuum_defer_cleanup_age を設定する。このパラメータの説明として、正しいものを1つ選びなさい。',
  choices: [
    'VACUUM や HOT 更新による不要な行の削除を、指定したトランザクション数だけ遅らせる。代わりにスタンバイの hot_standby_feedback を使う方法もある',
    'スタンバイで設定するパラメータで、受信した WAL の適用を指定した秒数だけ遅らせることで、問い合わせとのコンフリクトを避ける',
    'VACUUM を実行する間隔を秒数で指定するパラメータで、自動バキュームの autovacuum_naptime と同じ意味を持つ',
    '設定すると、スタンバイの問い合わせと衝突する WAL はスタンバイで適用されずに破棄されるため、コンフリクトが起きなくなる',
    '既定値は 1000 で、0 を設定するとプライマリでは VACUUM による不要な行の削除がまったく行われなくなる'
  ],
  answer: 0,
  exp: 'スタンバイで実行中の問い合わせがまだ参照している行を、プライマリの VACUUM が削除し、その WAL がスタンバイで適用されると、問い合わせとのコンフリクトが起きます。\nvacuum_defer_cleanup_age は、VACUUM と HOT 更新による不要な行の削除を、指定したトランザクション数だけ遅らせるプライマリのパラメータです。既定値は 0（遅らせない）で、設定ファイルの再読み込みで変更できます。削除が遅れる分、プライマリではテーブルの肥大化が起きやすくなります。\nドキュメントでは、代わりの方法としてスタンバイの hot_standby_feedback を使うことも挙げられています。hot_standby_feedback はスタンバイで実行中の問い合わせの情報をプライマリへ伝え、その問い合わせが必要とする行を残させます。\nWAL の適用を時間で遅らせるのは recovery_min_apply_delay で、コンフリクトの時の待ち時間は max_standby_streaming_delay などで決まります。スタンバイが WAL を破棄することはありません。',
  refs: [
    ['vacuum_defer_cleanup_age', 'runtime-config-replication.html#GUC-VACUUM-DEFER-CLEANUP-AGE'],
    ['問い合わせのコンフリクトの処理', 'hot-standby.html#HOT-STANDBY-CONFLICT'],
    ['hot_standby_feedback', 'runtime-config-replication.html#GUC-HOT-STANDBY-FEEDBACK']
  ]
},
{
  id: 'G4.1-029', level: 'gold', cat: 'G4.1',
  q: 'スタンバイの max_standby_archive_delay と max_standby_streaming_delay に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'アーカイブから読んだ WAL を適用するときは max_standby_archive_delay、ストリーミングで受け取った WAL では max_standby_streaming_delay が、衝突する問い合わせを待つ時間の上限になる',
    'max_standby_archive_delay は、スタンバイで1つの問い合わせを実行できる最大の時間で、これを超えた問い合わせは WAL との衝突の有無にかかわらず取り消される',
    '-1 を設定すると、衝突する問い合わせを待たずに直ちに取り消して、WAL の適用を優先するようになる',
    'プライマリで設定するパラメータで、WAL アーカイブへファイルを書き出すまでの遅延時間を指定する',
    'どちらもサーバ起動時にしか設定できないため、値の変更を反映するにはスタンバイの再起動が必要である'
  ],
  answer: 0,
  exp: 'ホットスタンバイでは、適用しようとする WAL が実行中の問い合わせと衝突すると、スタンバイは WAL の適用を待たせるか、問い合わせを取り消すかを決める必要があります。待つ時間の上限は、WAL の入手元によって次のパラメータで決まります。\n・max_standby_archive_delay: WAL アーカイブから読み込んだ WAL を適用する場合（既定 30 秒）\n・max_standby_streaming_delay: ストリーミングレプリケーションで受信した WAL を適用する場合（既定 30 秒）\n上限を過ぎると、衝突している問い合わせが取り消されます。-1 は無期限に待つ、0 は待たずに取り消すという意味です。\nこの値は1つの問い合わせの実行時間の上限ではなく、WAL の適用を遅らせてよい合計の時間です。どちらも設定ファイルの再読み込みで変更できます（context は sighup）。',
  refs: [
    ['max_standby_archive_delay', 'runtime-config-replication.html#GUC-MAX-STANDBY-ARCHIVE-DELAY'],
    ['max_standby_streaming_delay', 'runtime-config-replication.html#GUC-MAX-STANDBY-STREAMING-DELAY'],
    ['問い合わせのコンフリクトの処理', 'hot-standby.html#HOT-STANDBY-CONFLICT']
  ]
},
{
  id: 'G4.1-030', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: '別のセッションで `SELECT pg_sleep(30);` を実行中に、そのバックエンドの PID を指定して pg_ctl kill を実行した。セッション側の表示と合わせて、説明として適切なものを2つ選びなさい。',
  code: '# 1回目\n$ pg_ctl kill INT <PID>\n（セッション側）\nERROR:  canceling statement due to user request\n\n# 2回目（別のセッションで同じ問い合わせを実行中）\n$ pg_ctl kill TERM <PID>\n（セッション側）\nFATAL:  terminating connection due to administrator command\nserver closed the connection unexpectedly\n	This probably means the server terminated abnormally\n	before or while processing the request.\nconnection to server was lost',
  choices: [
    'INT は問い合わせだけを取り消し、TERM はセッションを終了させた（pg_cancel_backend、pg_terminate_backend と同じ効果）',
    'pg_ctl kill は指定したプロセスにシグナルを送るモードで、kill コマンドを持たない Windows で特に役立つ',
    'INT を送られたセッションも切断されているため、再び問い合わせを実行するには接続し直す必要がある',
    'TERM を送ったため postmaster はクラッシュとみなし、他のすべてのセッションも切断してクラッシュリカバリを始めた',
    'pg_ctl kill は PID ではなくデータディレクトリを指定して、そのクラスタのすべてのサーバプロセスにシグナルを送る'
  ],
  answer: [0, 1],
  exp: 'pg_ctl kill シグナル名 PID は、指定したプロセスにシグナルを送ります。ドキュメントでは、組み込みの kill コマンドがない Microsoft Windows で特に役立つとされています。\nバックエンドに SIGINT を送ると、実行中の問い合わせだけが取り消され（canceling statement due to user request）、セッションはそのまま使えます。SIGTERM を送ると、セッションが終了します（terminating connection due to administrator command）。それぞれ SQL の pg_cancel_backend() と pg_terminate_backend() と同じ効果です。\nSIGTERM による終了は正常な終了処理なので、他のセッションには影響しません。一方、SIGKILL などでバックエンドが異常終了した場合は、共有メモリを守るために postmaster が他のサーバプロセスもすべて終了させ、クラッシュリカバリを行います。',
  evidence: [
    ['pg_ctl kill INT / TERM と、存在しない PID を指定した場合',
      '$ pg_ctl kill INT <pid>\nexit status: 0\nERROR:  canceling statement due to user request\n$ pg_ctl kill TERM <pid>\nexit status: 0\nFATAL:  terminating connection due to administrator command\nserver closed the connection unexpectedly\n	This probably means the server terminated abnormally\n	before or while processing the request.\nconnection to server was lost\n2026-09-18 13:20:59.125 UTC [5007] postgres@terms ERROR:  canceling statement due to user request\n2026-09-18 13:21:00.220 UTC [5014] postgres@terms FATAL:  terminating connection due to administrator command\n$ pg_ctl kill HUP 999999\npg_ctl: could not send signal 1 (PID: 999999): No such process\nexit status: 1']
  ],
  refs: [
    ['pg_ctl', 'app-pg-ctl.html'],
    ['サーバシグナル送信関数', 'functions-admin.html#FUNCTIONS-ADMIN-SIGNAL'],
    ['サーバのシャットダウン', 'server-shutdown.html']
  ]
},
{
  id: 'G4.1-031', level: 'gold', cat: 'G4.1', type: 'scenario',
  q: 'サーバログに次のメッセージが出力された（行頭の時刻とプロセスIDは省略）。このとき、別のセッション（トランザクション中で未コミットの INSERT を実行済み）には WARNING が表示されて接続が切れた。この状況の説明として、正しいものを1つ選びなさい。',
  code: 'LOG:  server process (PID 5027) was terminated by signal 11: Segmentation fault\nDETAIL:  Failed process was running: SELECT pg_sleep(30);\nLOG:  terminating any other active server processes\nLOG:  all server processes terminated; reinitializing\nLOG:  database system was interrupted; last known up at 2026-09-18 13:20:54 UTC\nLOG:  database system was not properly shut down; automatic recovery in progress\nLOG:  redo starts at 0/74006F70\nLOG:  redo done at 0/74A693F8 system usage: CPU: user: 0.03 s, system: 0.02 s, elapsed: 0.06 s\nLOG:  database system is ready to accept connections\n\n（別のセッションの表示）\nWARNING:  terminating connection because of crash of another server process\nDETAIL:  The postmaster has commanded this server process to roll back the current transaction and exit, because another server process exited abnormally and possibly corrupted shared memory.',
  choices: [
    '異常終了したバックエンドは1つだが、共有メモリが壊れた可能性があるため、他のサーバプロセスもすべて終了させてからクラッシュリカバリを行い、再開している',
    '異常終了したバックエンドのセッションだけが切断され、他のセッションは WARNING を受け取った後もそのまま処理を続けられる',
    'postmaster 自身が異常終了しているため、管理者が pg_ctl start で起動し直すまで、接続を受け付けない状態が続く',
    '別のセッションで実行していた未コミットの INSERT は、クラッシュリカバリによってコミット済みの状態で反映される',
    'このログは restart_after_crash = off の場合の動作で、on にすれば他のセッションは切断されずに済むようになる'
  ],
  answer: 0,
  exp: 'バックエンドがシグナル 11（セグメンテーションフォルト）などで異常終了すると、そのプロセスが共有メモリを壊した可能性があります。そのため postmaster は、他のサーバプロセスにもトランザクションをロールバックして終了するよう指示し（terminating any other active server processes）、共有メモリを初期化し直します。その後、WAL を使ったクラッシュリカバリ（redo）を行って、接続の受け付けを再開します。\npostmaster 自身は動き続けているため、手動で起動し直す必要はありません。リカバリ中は接続が拒否され、pg_isready は rejecting connections（終了ステータス 1）を返しました。\n切断されたセッションの未コミットのトランザクションは失われます。実機でも、INSERT した行は再接続後に残っていませんでした。\nこの動作は restart_after_crash = on（既定）の場合です。off にすると、postmaster は再初期化せずに終了します（クラスタ管理ソフトウェアに再起動を任せる場合に使います）。いずれの場合も、他のセッションは切断されます。',
  evidence: [
    ['バックエンドをシグナル11で落としたときのログとセッションの表示',
      '--- 落ちたセッション\nserver closed the connection unexpectedly\n	This probably means the server terminated abnormally\n	before or while processing the request.\nconnection to server was lost\n--- 別のセッション\nWARNING:  terminating connection because of crash of another server process\nDETAIL:  The postmaster has commanded this server process to roll back the current transaction and exit, because another server process exited abnormally and possibly corrupted shared memory.\nHINT:  In a moment you should be able to reconnect to the database and repeat your command.\nserver closed the connection unexpectedly\n	This probably means the server terminated abnormally\n	before or while processing the request.\nconnection to server was lost\n--- サーバログ\n2026-09-18 13:20:53.453 UTC [4857] LOG:  database system is ready to accept connections\n2026-09-18 13:21:04.298 UTC [4857] LOG:  server process (PID 5027) was terminated by signal 11: Segmentation fault\n2026-09-18 13:21:04.298 UTC [4857] DETAIL:  Failed process was running: SELECT pg_sleep(30);\n2026-09-18 13:21:04.298 UTC [4857] LOG:  terminating any other active server processes\n2026-09-18 13:21:04.301 UTC [4857] LOG:  all server processes terminated; reinitializing\n2026-09-18 13:21:04.334 UTC [5042] LOG:  database system was interrupted; last known up at 2026-09-18 13:20:54 UTC\nterms=# SELECT count(*) FROM emp WHERE name = \'x\';\npsql: error: connection to server on socket "/run/postgresql/.s.PGSQL.5432" failed: FATAL:  the database system is in recovery mode\n$ pg_isready -p 5432\n/run/postgresql:5432 - rejecting connections\nexit status: 1']
  ],
  refs: [
    ['restart_after_crash', 'runtime-config-error-handling.html#GUC-RESTART-AFTER-CRASH'],
    ['WALの信頼性', 'wal-reliability.html'],
    ['サーバのシャットダウン', 'server-shutdown.html']
  ]
},

/* ---------------- G4.2 破損クラスタ復旧（重要度 2 / 12問） ---------------- */
{
  id: 'G4.2-001', level: 'gold', cat: 'G4.2',
  q: 'データチェックサムに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 14 の initdb では、データチェックサムが既定で有効になる',
    '稼働中のサーバで ALTER SYSTEM を実行すれば、データチェックサムを有効化できる',
    'initdb の -k で有効化でき、既存クラスタも停止中に pg_checksums --enable で有効化できる',
    'データチェックサムを有効にして初めて、WAL レコードの破損も検知できるようになる',
    'チェックサムエラーを検知すると、PostgreSQL が自動的に正しいデータにページを修復する'
  ],
  answer: 2,
  exp: 'データページのチェックサムは既定では無効で、initdb の -k（--data-checksums）で有効化します。PostgreSQL 12 以降は、クリーンに停止したクラスタに対して pg_checksums --enable を実行して後から有効化することもできます（稼働中は不可）。\nチェックサムはページ読み込み時に検証され、不一致があればエラーとして報告されますが、自動修復はされません（ignore_checksum_failure で読み込みを続行させることはできますが、破損の拡大に注意が必要です）。\nWAL レコードは、データチェックサムの設定にかかわらず常に CRC で保護されています。',
  refs: [
    ['データチェックサム', 'checksums.html'],
    ['pg_checksums', 'app-pgchecksums.html'],
    ['initdb', 'app-initdb.html']
  ]
},
{
  id: 'G4.2-002', level: 'gold', cat: 'G4.2',
  q: '`pg_resetwal` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'データベースサーバの稼働中に実行する',
    '実行後もデータの一貫性が完全に保証されるため、そのまま運用を継続してよい',
    'WAL が破損していなくても、定期的に実行して WAL を初期化することが推奨されている',
    'WAL や pg_control ファイルを初期化してサーバを起動可能にする最後の手段であり、実行後はデータをダンプして新しいクラスタにリストアすることが推奨される',
    'パラメータ zero_damaged_pages を on にして実行すると、破損したページのデータが元の内容に修復される'
  ],
  answer: 3,
  exp: 'pg_resetwal は WAL を消去し、必要に応じて pg_control に格納された制御情報を初期化するコマンドで、これらが破損してサーバが起動できない場合の最後の手段です。サーバ停止中に実行します。\n実行後はコミット済みトランザクションの一部が失われたり、データの不整合が生じたりする可能性があるため、直ちに pg_dump でデータを取り出し、initdb した新しいクラスタにリストアし、不整合がないか確認することが推奨されています。\nzero_damaged_pages は破損したページをゼロで埋めて読み進めるためのパラメータで、そのページのデータは失われます。',
  refs: [
    ['pg_resetwal', 'app-pgresetwal.html'],
    ['zero_damaged_pages', 'runtime-config-developer.html#GUC-ZERO-DAMAGED-PAGES']
  ]
},
{
  id: 'G4.2-003', level: 'gold', cat: 'G4.2',
  q: 'インデックスやシステムテーブルの破損からの復旧に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'テーブルデータが正常であれば、破損したインデックスは REINDEX で再構築することで復旧できる',
    'VACUUM を実行すると、破損したインデックスは自動的に修復される',
    'システムカタログのインデックスが破損した場合は、REINDEX では復旧できず、initdb からやり直すしかない',
    'amcheck モジュールは、B-tree インデックスの破損を検知して自動的に修復する',
    'pg_dump でダンプを取得すると、破損したインデックスも同時に修復される'
  ],
  answer: 0,
  exp: 'インデックスはテーブルのデータから再作成できるため、ソフトウェアの不具合などでインデックスが破損した場合は REINDEX で再構築します。\nシステムカタログのインデックスが破損してサーバの通常利用が困難な場合でも、サーバを ignore_system_indexes を有効にして（例: -P オプション付きのシングルユーザモードで）起動し、REINDEX を実行することで復旧できる場合があります。\namcheck はインデックスの論理的な整合性を検証するモジュールで、修復は行いません。\nVACUUM や pg_dump はインデックスを修復しません。',
  refs: [
    ['REINDEX', 'sql-reindex.html'],
    ['amcheck', 'amcheck.html'],
    ['ignore_system_indexes', 'runtime-config-developer.html#GUC-IGNORE-SYSTEM-INDEXES']
  ]
},
{
  id: 'G4.2-004', level: 'gold', cat: 'G4.2',
  q: 'シングルユーザモードに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_ctl start --single で起動し、複数のクライアントが同時に接続できる',
    'postgres --single で起動し、1つのバックエンドとして周回防止の VACUUM などの緊急作業に使う',
    'シングルユーザモードでは、データベース名を指定せずにすべてのデータベースを同時に操作する',
    'シングルユーザモードでは VACUUM を実行できない',
    'シングルユーザモードは、稼働中のサーバと同じデータディレクトリに対して同時に起動できる'
  ],
  answer: 1,
  exp: 'postgres --single -D データディレクトリ データベース名 のように起動すると、postmaster やバックグラウンドプロセスを起動せず、1つのバックエンドとして標準入力から SQL を受け付けるシングルユーザモードになります。\nサーバが起動できない、または通常の接続が拒否される状況での緊急作業（トランザクション ID 周回が迫った場合の VACUUM、-P オプションで ignore_system_indexes を有効にしたシステムインデックスの REINDEX など）に使われます。\nデータディレクトリのロックを取得するため、サーバの稼働中には起動できません。',
  refs: [
    ['postgres（シングルユーザモード）', 'app-postgres.html'],
    ['REINDEX', 'sql-reindex.html']
  ]
},
{
  id: 'G4.2-005', level: 'gold', cat: 'G4.2',
  q: 'contrib モジュール `amcheck` に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'bt_index_check() は、破損が見つかった B-tree インデックスを自動的に修復する',
    'amcheck は GIN インデックスの検証だけに対応している',
    'bt_index_check() を実行している間は、対象テーブルへの書き込みが一切できない',
    'amcheck はデータページのチェックサムを再計算して書き換える',
    'bt_index_check() は構造を検証し、bt_index_parent_check() はより厳密だが書き込みを止める'
  ],
  answer: 4,
  exp: 'amcheck は、インデックスやテーブルの論理的な整合性を検証するモジュールで、修復は行いません。\n・bt_index_check(): B-tree インデックスの不変条件（キーの順序など）を検証する。ACCESS SHARE ロックのみを取得するため、通常の読み書きと並行して実行できる\n・bt_index_parent_check(): 親子ページ間の関係も含めてより厳密に検証するが、SHARE ロックを取得するため書き込みをブロックする\n・verify_heapam(): PostgreSQL 14 で追加された、テーブル（ヒープ）の破損を検出する関数\n破損が見つかった場合は、原因を調査したうえで REINDEX やバックアップからの復旧を検討します。',
  refs: [
    ['amcheck', 'amcheck.html']
  ]
},
{
  id: 'G4.2-006', level: 'gold', cat: 'G4.2',
  q: 'パラメータ `ignore_checksum_failure` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '既定値は on であり、チェックサムの不一致は通常は無視される',
    'on にすると、チェックサムが一致しないページも警告を出して読み込みを続けるため、破損データの退避に使えるが、破損が広がるおそれがある',
    'on にすると、チェックサムが一致しないページが自動的に正しい内容に修復される',
    'データチェックサムが無効なクラスタで、チェックサムの検証を有効にするためのパラメータである',
    '一般ユーザも SET で自由に変更できる'
  ],
  answer: 1,
  exp: 'データチェックサムが有効なクラスタでは、ページの読み込み時にチェックサムが一致しないとエラーになり、そのテーブルの読み込みが中止されます。ignore_checksum_failure を on にすると、エラーの代わりに警告を出して読み込みを続けるため、破損していない行を可能な範囲で取り出す（ダンプして退避する）といった障害対応に使えます。\nただし、破損したデータを読み込んで処理を続けるため、クラッシュしたり、破損が他へ広がったりするおそれがあります。既定値は off で、スーパーユーザのみ変更できる開発者向けオプションです。修復機能はありません。',
  refs: [
    ['ignore_checksum_failure', 'runtime-config-developer.html#GUC-IGNORE-CHECKSUM-FAILURE'],
    ['データチェックサム', 'checksums.html']
  ]
},
{
  id: 'G4.2-007', level: 'gold', cat: 'G4.2', type: 'scenario',
  q: 'ストレージの故障によってデータファイルが物理的に破損し、チェックサムエラーが多数発生している。対処の基本として、最も適切なものを1つ選びなさい。',
  choices: [
    'VACUUM FULL を実行すれば、破損したページは正しい内容に修復される',
    'REINDEX DATABASE を実行すれば、テーブルデータの破損も修復される',
    'pg_resetwal を実行して、データファイルの破損を修復する',
    'fsync を off にしてサーバを再起動すれば、チェックサムエラーは解消される',
    '故障したハードウェアを交換したうえで、ベースバックアップと WAL アーカイブからリカバリする'
  ],
  answer: 4,
  exp: 'ハードウェアの故障などによるデータファイルの物理的な破損は、PostgreSQL のコマンドで修復することはできません。原因となったハードウェアを交換・修理したうえで、正常なベースバックアップと WAL アーカイブからリカバリ（必要に応じて PITR）するのが基本的な対処です。そのため、定期的なバックアップの取得と、リストア手順の確認が重要です。\nREINDEX で直せるのはインデックスの破損だけで、pg_resetwal は WAL と制御情報を初期化するコマンドです。VACUUM FULL は破損したページを読み込めずに失敗します。fsync = off はクラッシュ時の破損の原因になります。',
  evidence: [
    ['チェックサムを有効にしたクラスタでデータファイルを壊した場合',
      'data_checksums\n----------------\n on\n(1 row)\n\n繝・・繧ｿ繝輔ぃ繧､繝ｫ: $PGDATA/base/13806/16384\n--- 繝輔ぃ繧､繝ｫ縺ｮ荳驛ｨ繧呈嶌縺肴鋤縺医※遐ｴ謳阪＆縺帙ｋ\n=# SELECT count(*) FROM t;\nWARNING:  page verification failed, calculated checksum 48581 but expected 19451\nERROR:  invalid page in block 1 of relation base/13806/16384\n--- ignore_checksum_failure = on 縺ｫ縺励◆蝣ｴ蜷茨ｼ郁ｭｦ蜻翫↓縺ｪ繧九′縲∝・螳ｹ縺ｯ螢翫ｌ縺溘∪縺ｾ・・WARNING:  page verification failed, calculated checksum 48581 but expected 19451\n count\n-------\n  5000\n(1 row)\n--- pg_checksums 縺ｧ繧ｯ繝ｩ繧ｹ繧ｿ蜈ｨ菴薙ｒ讀懈渊・医し繝ｼ繝仙●豁｢荳ｭ縺ｫ螳溯｡鯉ｼ・Checksum operation completed\nFiles scanned:  935\nBlocks scanned: 3320\nBad checksums:  0\nData checksum version: 1']
  ],
  refs: [
    ['継続的アーカイブとポイントインタイムリカバリ', 'continuous-archiving.html'],
    ['信頼性', 'wal-reliability.html']
  ]
},
{
  id: 'G4.2-008', level: 'gold', cat: 'G4.2',
  q: 'パラメータ `zero_damaged_pages` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '破損したページヘッダを検出した際にエラーとせず、そのページをゼロで埋めて読み飛ばす',
    '破損したページを検出すると、直前のバックアップから自動的にそのページを復元する',
    '破損したページを検出した時点でサーバを停止させ、被害の拡大を防ぐ',
    'ページのチェックサムを有効にするためのパラメータである',
    '破損したページを WAL から再構築するため、データが失われることはない'
  ],
  answer: 0,
  exp: 'zero_damaged_pages を on にすると、破損したページヘッダを検出したときにエラーを発生させる代わりに警告を出し、そのページをゼロで埋めて処理を続行します。当然そのページ内のデータは失われるため、通常は off（既定）にしておき、他に手段がない状況で、破損テーブルの残りの行を救い出す目的でのみ一時的に使います。\n使用前にはデータディレクトリ全体のバックアップを取ることが推奨されます。\nチェックサムの検証を無視するのは ignore_checksum_failure で、これも同様に開発者向けの危険なオプションです。',
  refs: [
    ['開発者向けオプション', 'runtime-config-developer.html#GUC-ZERO-DAMAGED-PAGES'],
    ['データチェックサム', 'app-initdb.html']
  ]
},
{
  id: 'G4.2-009', level: 'gold', cat: 'G4.2',
  q: '`pg_controldata` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'データディレクトリの pg_control の内容を表示し、最終チェックポイント位置やクラスタの状態を確認できる',
    'サーバが稼働している間しか実行できず、停止中のクラスタには使用できない',
    'pg_control が破損している場合、pg_controldata を実行すると自動的に修復される',
    'データディレクトリ内のすべてのファイルのチェックサムを検証するツールである',
    'postgresql.conf の設定値を一覧表示するためのツールである'
  ],
  answer: 0,
  exp: 'pg_controldata はデータディレクトリの global/pg_control を読み取り、クラスタの状態（in production、shut down など）、最終チェックポイントの位置と時刻、次の XID、WAL セグメントサイズ、データページのチェックサムの有無、initdb 時のブロックサイズなどを表示します。サーバの停止中でも実行でき、復旧作業やバージョン間の互換性確認に使います。\n修復機能はなく、pg_control が壊れている場合は pg_resetwal で推測値を書き込むことになりますが、データの一貫性が失われるおそれがあるため最後の手段です。',
  refs: [
    ['pg_controldata', 'app-pgcontroldata.html'],
    ['pg_resetwal', 'app-pgresetwal.html']
  ]
},
{
  id: 'G4.2-010', level: 'gold', cat: 'G4.2',
  q: 'データファイルの破損の有無を、日常的な運用の中で早めに検知する方法として、最も適切なものを1つ選びなさい。',
  choices: [
    'initdb 時にデータチェックサムを有効にしておき、定期的な pg_dump や pg_basebackup で全データを読み出す',
    'ignore_checksum_failure を on にして、破損しても処理が止まらないようにしておく',
    'zero_damaged_pages を on にしたまま運用し、破損ページを随時ゼロ埋めする',
    'pg_resetwal を定期的に実行し、WAL の整合性を保つ',
    'VACUUM FULL を毎日実行すれば、破損したページは自動的に修復される'
  ],
  answer: 0,
  exp: 'データチェックサム（initdb --data-checksums、または停止中に pg_checksums --enable）を有効にしておくと、ページを読み込む際に破損を検出できます。その上で pg_dump や pg_basebackup のように全データを読み出す処理を定期的に行うと、普段アクセスされない領域の破損にも早く気づけます。amcheck によるインデックスの検査も有効です。\nignore_checksum_failure や zero_damaged_pages は破損を無視・上書きするもので、恒常的に有効にすべきではありません。\nVACUUM FULL や pg_resetwal に破損を修復する機能はありません。',
  refs: [
    ['pg_checksums', 'app-pgchecksums.html'],
    ['開発者向けオプション', 'runtime-config-developer.html'],
    ['amcheck', 'amcheck.html']
  ]
},
{
  id: 'G4.2-011', level: 'gold', cat: 'G4.2',
  q: 'データチェックサムに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'チェックサムはページをディスクへ書き出すときに計算され、読み込むときに検証される',
    '有効・無効はデータベースクラスタ単位で、テーブル単位には指定できない',
    'チェックサムは一時ファイルも保護の対象に含まれる',
    'データベースクラスタの外に作成したテーブル空間は、チェックサムの対象外である',
    'チェックサムを無効にするには、クラスタを作り直すしかない'
  ],
  answer: [0, 1],
  exp: 'データチェックサムはページをディスクへ書き出す際に計算してページ内に格納し、読み込む際に再計算して比較します。不一致であればエラーになるため、破損が検出されるのは「読み込み」のタイミングです。\n有効・無効はデータベースクラスタ全体に対する設定で、データベース単位やテーブル単位では指定できません。\n対象になるのはクラスタ内のデータページで、どのテーブル空間に置いたかは関係ありません。一方、一時ファイルのような内部的なデータ構造は保護されません。\nPostgreSQL 12 以降は、クラスタの停止中に pg_checksums で有効化・無効化を切り替えられます。',
  refs: [
    ['pg_checksums', 'app-pgchecksums.html'],
    ['initdb', 'app-initdb.html']
  ]
},
{
  id: 'G4.2-012', level: 'gold', cat: 'G4.2',
  q: '破損したデータの調査・修復に使うモジュールの説明として、適切なものを2つ選びなさい。',
  choices: [
    'amcheck は B-tree インデックスの構造的な整合性を検査する',
    'pg_surgery は、破損した行の可視性情報を強制的に書き換える',
    'pageinspect はページを自動的に修復するモジュールである',
    'pgstattuple はインデックスの破損を検出して再構築する',
    'pg_checksums は稼働中のクラスタのページを修復する'
  ],
  answer: [0, 1],
  exp: 'amcheck は B-tree インデックスが構造的に正しいか、ヒープとの対応が取れているか（bt_index_parent_check）を検査するモジュールです。\npg_surgery（PostgreSQL 14 で追加）は heap_force_kill()、heap_force_freeze() を提供し、破損して読めなくなった行の可視性情報を強制的に書き換えます。データを失う可能性がある最後の手段で、通常はバックアップからの復旧を優先します。\npageinspect はページの内部構造を「調べる」もので、修復機能はありません。\npgstattuple はタプルレベルの統計を取得するもので、破損検知の機能はありません。\npg_checksums はクラスタの停止中に検証や有効化・無効化を行うツールです。',
  refs: [
    ['amcheck', 'amcheck.html'],
    ['pg_surgery', 'pgsurgery.html'],
    ['pageinspect', 'pageinspect.html']
  ]
},

/* ---------------- G4.3 レプリケーションの障害と復旧（重要度 1 / 17問） ---------------- */
{
  id: 'G4.3-001', level: 'gold', cat: 'G4.3',
  q: 'ストリーミングレプリケーションの障害に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'レプリケーションスロットを使用している場合、スタンバイが長時間停止していても、不要になった WAL はプライマリで自動的に削除される',
    'PostgreSQL 14 では、プライマリで保持する WAL の量は wal_keep_segments で指定する',
    '同期レプリケーションで唯一の同期スタンバイが停止しても、プライマリでのコミットが待たされることはない',
    'レプリケーションスロットを使用していてスタンバイが長時間停止すると、プライマリに WAL が蓄積し続けるため、max_slot_wal_keep_size で保持量に上限を設定できる',
    'スタンバイが停止すると、プライマリも自動的に停止する'
  ],
  answer: 3,
  exp: 'レプリケーションスロットは、スタンバイが必要とする WAL が削除されないように保持します。そのためスタンバイが長時間停止すると、プライマリの pg_wal に WAL が蓄積し続け、ディスク満杯を引き起こすおそれがあります。PostgreSQL 13 以降は max_slot_wal_keep_size で保持する WAL の上限を設定できます（超過したスロットは無効になり、スタンバイの再構築が必要になることがあります）。\nwal_keep_segments は PostgreSQL 13 で wal_keep_size に置き換えられました。\n同期レプリケーションでは、synchronous_standby_names の条件を満たすスタンバイが応答しないと、プライマリでのコミットは待機し続けます。',
  refs: [
    ['max_slot_wal_keep_size', 'runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE'],
    ['レプリケーションスロット', 'warm-standby.html#STREAMING-REPLICATION-SLOTS'],
    ['同期レプリケーション', 'warm-standby.html#SYNCHRONOUS-REPLICATION']
  ]
},
{
  id: 'G4.3-002', level: 'gold', cat: 'G4.3',
  q: 'フェイルオーバー後の旧プライマリの扱いに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'スタンバイを昇格（promote）させても、タイムライン ID は変わらない',
    'pg_ctl promote は、障害が発生した旧プライマリ側で実行する',
    '旧プライマリの再利用には pg_rewind を使え、wal_log_hints = on かデータチェックサムが必要である',
    '旧プライマリは設定を変更せずにそのまま起動すれば、新プライマリのスタンバイとして必ず複製を継続できる',
    'pg_rewind を実行するには、同期元となる新プライマリを停止しておく必要がある'
  ],
  answer: 2,
  exp: 'スタンバイで pg_ctl promote（または pg_promote()）を実行すると、スタンバイは新しいタイムライン ID で読み書き可能なプライマリになります。\n旧プライマリはフェイルオーバー時点より先の WAL を持っている可能性があり、そのままでは新プライマリに追従できないことがあります。pg_rewind を使うと、タイムラインが分岐した時点以降に変更されたブロックだけを新プライマリからコピーして同期できるため、ベースバックアップを取り直すより高速に再構築できます。\npg_rewind の対象（旧プライマリ）はクリーンに停止している必要があり、wal_log_hints = on かデータチェックサムが有効でなければなりません。同期元のサーバは稼働中のままで構いません。同期後は standby.signal を作成して primary_conninfo を設定し、スタンバイとして起動します。',
  refs: [
    ['pg_rewind', 'app-pgrewind.html'],
    ['フェイルオーバー', 'warm-standby-failover.html'],
    ['pg_ctl promote', 'app-pg-ctl.html']
  ]
},
{
  id: 'G4.3-003', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: 'PostgreSQL 14 の論理レプリケーションで、サブスクライバ側の既存データと一意制約違反が発生し、変更の適用が止まった。この状況に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'サブスクライバの既存の行はパブリッシャから届いた行で自動的に上書きされ、適用は継続される',
    '競合した変更は自動的に破棄されてサーバログに記録され、後続の変更の適用はそのまま継続される',
    'パブリッシャ側で、競合の原因となったトランザクションが自動的にロールバックされて取り消される',
    '適用は停止して再試行を繰り返すため、データの修正か pg_replication_origin_advance() での読み飛ばしが必要',
    'サブスクリプションを DROP して作り直す以外に、止まった適用を再開させる方法は用意されていない'
  ],
  answer: 3,
  exp: '論理レプリケーションの適用で制約違反などのエラーが発生すると、そのトランザクションの適用は失敗し、ワーカーは再試行を繰り返すため、以降の変更は反映されません。エラーの内容はサブスクライバのサーバログで確認できます。\n解決するには、サブスクライバ側の競合するデータを修正（削除など）するか、pg_replication_origin_advance() でレプリケーション起点の位置を進めて、該当トランザクションを読み飛ばします（読み飛ばした変更はサブスクライバに反映されない点に注意）。\nなお PostgreSQL 15 以降は ALTER SUBSCRIPTION ... SKIP でも読み飛ばしが可能です。',
  evidence: [
    ['サブスクライバ側で一意制約違反が起きたときの状態とログ',
      'NOTICE:  created replication slot "sub_items" on publisher\n--- パブリッシャ ---\n id | name\n----+------\n  1 | pen\n  2 | note\n  3 | ink\n(3 rows)\n\n--- サブスクライバ ---\n id |    name\n----+------------\n  1 | pen\n  2 | local-note\n(2 rows)\n\n  subname  | pid | received_lsn | latest_end_lsn | last_msg_receipt_time\n-----------+-----+--------------+----------------+-----------------------\n sub_items |     |              |                |\n(1 row)\n\n slot_name | slot_type | database | active | wal_status\n-----------+-----------+----------+--------+------------\n standby1  | physical  |          | t      | reserved\n sub_items | logical   | shop     | f      | reserved\n(2 rows)\n\n--- サブスクライバのログ ---\n2026-09-17 06:46:54.543 UTC [17384] DETAIL:  Key (id)=(2) already exists.\n2026-09-17 06:46:54.544 UTC [17324] LOG:  background worker "logical replication worker" (PID 17384) exited with exit code 1\n2026-09-17 06:46:59.677 UTC [17391] ERROR:  duplicate key value violates unique constraint "items_pkey"\n2026-09-17 06:46:59.677 UTC [17391] DETAIL:  Key (id)=(2) already exists.\n2026-09-17 06:46:59.678 UTC [17324] LOG:  background worker "logical replication worker" (PID 17391) exited with exit code 1\n--- 競合行を削除した後のサブスクライバ ---\n id | name\n----+------\n  1 | pen\n  2 | note\n  3 | ink\n(3 rows)\n\nNOTICE:  dropped replication slot "sub_items" on publisher']
  ],
  refs: [
    ['論理レプリケーションのコンフリクト', 'logical-replication-conflicts.html'],
    ['レプリケーション起点管理関数', 'functions-admin.html#FUNCTIONS-REPLICATION']
  ]
},
{
  id: 'G4.3-004', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: 'スタンバイのログに「requested WAL segment ... has already been removed」と出力され、レプリケーションが停止した。原因と対処として、最も適切なものを1つ選びなさい。',
  choices: [
    'スタンバイで pg_resetwal を実行すれば、そのままレプリケーションを再開できる',
    'スタンバイが必要とする WAL がプライマリで削除されたため、アーカイブから取得できるようにするか、スタンバイを再構築する',
    'プライマリを再起動すれば、削除された WAL が自動的に再生成される',
    'スタンバイの standby.signal を削除すれば、レプリケーションが再開される',
    'max_connections が不足しているため、プライマリの max_connections を増やす'
  ],
  answer: 1,
  exp: 'スタンバイが停止していたり遅延したりしている間に、スタンバイが次に必要とする WAL がプライマリで削除されると、ストリーミングレプリケーションで取得できずに停止します。\nWAL アーカイブがあれば、スタンバイの restore_command でアーカイブから取得して追いつかせることができます。アーカイブにもない場合は、pg_basebackup などでスタンバイを再構築します。\n再発防止には、レプリケーションスロットの使用（max_slot_wal_keep_size で上限を設定）、wal_keep_size による WAL の保持、WAL アーカイブと restore_command の併用などを検討します。standby.signal を削除するとスタンバイではなくなるため、対処にはなりません。',
  evidence: [
    ['スロットがない状態でスタンバイを長時間止めた場合',
      '=# SELECT slot_name, active, wal_status FROM pg_replication_slots;\n slot_name | active | wal_status\n-----------+--------+------------\n(0 rows)\n\n=# SHOW wal_keep_size;\n wal_keep_size\n---------------\n 0\n(1 row)\n\n=# SELECT pg_walfile_name(pg_current_wal_lsn()) AS wal_before;\n        wal_before\n--------------------------\n 0000000100000000000000C1\n(1 row)\n\n--- WAL 繧帝ｲ繧√※繝√ぉ繝・け繝昴う繝ｳ繝医☆繧具ｼ医せ繧ｿ繝ｳ繝舌う縺悟ｿ・ｦ√→縺吶ｋ蜿､縺・WAL 縺ｯ蜑企勁繝ｻ蜀榊茜逕ｨ縺輔ｌ繧具ｼ・=# SELECT pg_walfile_name(pg_current_wal_lsn()) AS wal_after;\n        wal_after\n--------------------------\n 0000000100000000000000C9\n(1 row)\n\n/var/lib/pgsql/14/standby/postgresql.auto.conf:3:primary_conninfo = \'application_name=standby1 user=postgres passfile=\'\'/var/lib/pgsql/.pgpass\'\' channel_binding=prefer host=127.0.0.1 port=5432 sslmode=prefer sslcompression=0 sslsni=1 ssl_min_protocol_version=TLSv1.2 gssencmode=prefer krbsrvname=postgres target_session_attrs=any\'\n/var/lib/pgsql/14/standby/postgresql.auto.conf:4:primary_slot_name = \'standby1\'\n/var/lib/pgsql/14/standby/postgresql.conf:322:#primary_conninfo = \'\'			# connection string to sending server\n/var/lib/pgsql/14/standby/postgresql.conf:323:#primary_slot_name = \'\'			# replication slot on sending server\n--- primary_slot_name 繧貞､悶＠縺ｦ繧ｹ繧ｿ繝ｳ繝舌う繧定ｵｷ蜍・2026-09-21 04:40:03.277 UTC [105768] LOG:  redo starts at 0/9A000028\n2026-09-21 04:40:03.278 UTC [105768] LOG:  consistent recovery state reached at 0/9A000770\n2026-09-21 04:40:03.278 UTC [105768] LOG:  invalid record length at 0/9A000770: wanted 24, got 0\n2026-09-21 04:40:03.279 UTC [105766] LOG:  database system is ready to accept read-only connections\n2026-09-21 04:40:03.290 UTC [105772] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:03.290 UTC [105772] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n2026-09-21 04:40:03.298 UTC [105774] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:03.298 UTC [105774] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n2026-09-21 04:40:08.342 UTC [105777] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:08.343 UTC [105777] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n2026-09-21 04:40:13.312 UTC [105780] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:13.313 UTC [105780] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n--- 繧ｹ繧ｿ繝ｳ繝舌う縺ｮ迥ｶ諷・ pg_is_in_recovery | pg_last_wal_receive_lsn | pg_last_wal_replay_lsn\n-------------------+-------------------------+------------------------\n t                 | 0/9A000000              | 0/9A000770\n(1 row)\n\n--- 繝励Λ繧､繝槭Μ縺ｮ WAL 菴咲ｽｮ\n       primary_wal        | replication_connections\n--------------------------+-------------------------\n 0000000100000000000000C9 |                       0\n(1 row)']
  ],
  refs: [
    ['ストリーミングレプリケーション', 'warm-standby.html#STREAMING-REPLICATION'],
    ['wal_keep_size', 'runtime-config-replication.html#GUC-WAL-KEEP-SIZE']
  ]
},
{
  id: 'G4.3-005', level: 'gold', cat: 'G4.3',
  q: 'ストリーミングレプリケーションのフェイルオーバーに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'プライマリが停止すると、PostgreSQL 本体の機能でスタンバイが自動的に昇格する',
    'スタンバイを昇格させると、旧プライマリは自動的に停止させられる',
    '昇格後に旧プライマリで行われた更新は、タイムラインの仕組みによって新プライマリに自動的に統合される',
    '同期レプリケーションを使っていれば、旧プライマリへの書き込みを止める仕組みは不要である',
    'PostgreSQL 本体には自動フェイルオーバー機能がなく、昇格後に旧プライマリへの書き込みを確実に止める仕組みを別途用意する必要がある'
  ],
  answer: 4,
  exp: 'PostgreSQL 本体には、プライマリの障害を検知してスタンバイを自動的に昇格させる機能はありません。昇格は pg_ctl promote や pg_promote() で行い、自動化する場合は Patroni や Pacemaker、Pgpool-II などのクラスタ管理ソフトウェアを使います。\n旧プライマリが実は稼働していて書き込みを受け付け続けると、両方のサーバで別々に更新が行われるスプリットブレインになり、データの不整合が生じます。昇格の前に旧プライマリを確実に停止・隔離する仕組み（フェンシング、STONITH）が必要です。\n分岐したタイムラインの変更が自動で統合されることはなく、旧プライマリは pg_rewind などで新プライマリに合わせて再構築します。',
  refs: [
    ['フェイルオーバー', 'warm-standby-failover.html'],
    ['pg_rewind', 'app-pgrewind.html']
  ]
},
{
  id: 'G4.3-006', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: 'スタンバイを長時間停止していたところ、プライマリの pg_wal が肥大化してディスクが逼迫した。原因と対処の説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'スロットが未受信の WAL を保持し続けるため、max_slot_wal_keep_size で上限を設けられる',
    'wal_keep_size を大きくすれば、スロットが保持する WAL の量を抑えられる',
    'レプリケーションスロットは WAL を保持しないため、肥大化の原因はスロット以外にあると考えられる',
    '不要なスロットであっても、DROP はできないためサーバの再起動で解放するしかない',
    'archive_mode を off にすると、スロットが保持している WAL も解放される'
  ],
  answer: 0,
  exp: 'レプリケーションスロットは、接続先がまだ受信していない WAL をサーバに保持させます。スタンバイが長期間停止していると WAL が削除されず、pg_wal が増え続けます。\nPostgreSQL 13 以降は max_slot_wal_keep_size を設定することで、スロットが保持できる WAL の上限を決められます。上限を超えるとスロットは無効化され（pg_replication_slots の wal_status が lost になり）、そのスタンバイは再構築が必要になりますが、プライマリのディスク枯渇は防げます。\n不要になったスロットは pg_drop_replication_slot() で削除できます。\nwal_keep_size はスロットを使わない場合に WAL を追加保持する設定です。',
  evidence: [
    ['スロットがある場合、スタンバイを止めている間 WAL が保持され続ける',
      'pg_reload_conf\n----------------\n t\n(1 row)\n\n slot_name | slot_type | active | restart_lsn | wal_status | safe_wal_size\n-----------+-----------+--------+-------------+------------+---------------\n standby1  | physical  | f      | 0/1A456D28  | reserved   | 76 MB\n(1 row)\n\n slot_name | slot_type | active | restart_lsn | wal_status | safe_wal_size\n-----------+-----------+--------+-------------+------------+---------------\n standby1  | physical  | f      |             | lost       |\n(1 row)\n\n--- プライマリのログ ---\n2026-09-17 06:44:20.556 UTC [6062] LOG:  checkpoints are occurring too frequently (2 seconds apart)\n2026-09-17 06:44:22.291 UTC [6062] LOG:  checkpoints are occurring too frequently (2 seconds apart)\n2026-09-17 06:44:23.816 UTC [6062] LOG:  checkpoints are occurring too frequently (1 second apart)\n2026-09-17 06:44:25.643 UTC [6062] LOG:  checkpoints are occurring too frequently (2 seconds apart)'],
    ['スロットがない場合は WAL が削除され、スタンバイが追いつけなくなる',
      '=# SELECT slot_name, active, wal_status FROM pg_replication_slots;\n slot_name | active | wal_status\n-----------+--------+------------\n(0 rows)\n\n=# SHOW wal_keep_size;\n wal_keep_size\n---------------\n 0\n(1 row)\n\n=# SELECT pg_walfile_name(pg_current_wal_lsn()) AS wal_before;\n        wal_before\n--------------------------\n 0000000100000000000000C1\n(1 row)\n\n--- WAL 繧帝ｲ繧√※繝√ぉ繝・け繝昴う繝ｳ繝医☆繧具ｼ医せ繧ｿ繝ｳ繝舌う縺悟ｿ・ｦ√→縺吶ｋ蜿､縺・WAL 縺ｯ蜑企勁繝ｻ蜀榊茜逕ｨ縺輔ｌ繧具ｼ・=# SELECT pg_walfile_name(pg_current_wal_lsn()) AS wal_after;\n        wal_after\n--------------------------\n 0000000100000000000000C9\n(1 row)\n\n/var/lib/pgsql/14/standby/postgresql.auto.conf:3:primary_conninfo = \'application_name=standby1 user=postgres passfile=\'\'/var/lib/pgsql/.pgpass\'\' channel_binding=prefer host=127.0.0.1 port=5432 sslmode=prefer sslcompression=0 sslsni=1 ssl_min_protocol_version=TLSv1.2 gssencmode=prefer krbsrvname=postgres target_session_attrs=any\'\n/var/lib/pgsql/14/standby/postgresql.auto.conf:4:primary_slot_name = \'standby1\'\n/var/lib/pgsql/14/standby/postgresql.conf:322:#primary_conninfo = \'\'			# connection string to sending server\n/var/lib/pgsql/14/standby/postgresql.conf:323:#primary_slot_name = \'\'			# replication slot on sending server\n--- primary_slot_name 繧貞､悶＠縺ｦ繧ｹ繧ｿ繝ｳ繝舌う繧定ｵｷ蜍・2026-09-21 04:40:03.277 UTC [105768] LOG:  redo starts at 0/9A000028\n2026-09-21 04:40:03.278 UTC [105768] LOG:  consistent recovery state reached at 0/9A000770\n2026-09-21 04:40:03.278 UTC [105768] LOG:  invalid record length at 0/9A000770: wanted 24, got 0\n2026-09-21 04:40:03.279 UTC [105766] LOG:  database system is ready to accept read-only connections\n2026-09-21 04:40:03.290 UTC [105772] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:03.290 UTC [105772] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n2026-09-21 04:40:03.298 UTC [105774] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:03.298 UTC [105774] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n2026-09-21 04:40:08.342 UTC [105777] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:08.343 UTC [105777] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n2026-09-21 04:40:13.312 UTC [105780] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:13.313 UTC [105780] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n--- 繧ｹ繧ｿ繝ｳ繝舌う縺ｮ迥ｶ諷・ pg_is_in_recovery | pg_last_wal_receive_lsn | pg_last_wal_replay_lsn\n-------------------+-------------------------+------------------------\n t                 | 0/9A000000              | 0/9A000770\n(1 row)\n\n--- 繝励Λ繧､繝槭Μ縺ｮ WAL 菴咲ｽｮ\n       primary_wal        | replication_connections\n--------------------------+-------------------------\n 0000000100000000000000C9 |                       0\n(1 row)']
  ],
  refs: [
    ['max_slot_wal_keep_size', 'runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE'],
    ['レプリケーションスロット', 'warm-standby.html#STREAMING-REPLICATION-SLOTS'],
    ['pg_replication_slots', 'view-pg-replication-slots.html']
  ]
},
{
  id: 'G4.3-007', level: 'gold', cat: 'G4.3',
  q: 'フェイルオーバー後に旧プライマリを新プライマリのスタンバイとして復帰させるため `pg_rewind` を使いたい。必要な条件として、正しいものを1つ選びなさい。',
  choices: [
    '対象クラスタでデータチェックサムが有効か、wal_log_hints が on になっている必要がある',
    '対象クラスタで wal_level が minimal に設定されている必要がある',
    '旧プライマリが稼働したままの状態で実行する必要がある',
    '旧プライマリと新プライマリで、データディレクトリのパスが同一である必要がある',
    '旧プライマリのデータをすべて削除してから実行する必要がある'
  ],
  answer: 0,
  exp: 'pg_rewind は、分岐点以降に変更されたブロックだけを新プライマリからコピーして巻き戻すツールで、ベースバックアップを取り直すより短時間で復帰できます。変更されたブロックを WAL から特定するために、データチェックサムが有効であるか wal_log_hints = on である必要があります。\n対象のクラスタ（旧プライマリ）はクリーンに停止している必要があり、停止が異常だった場合は一度単独で起動・停止してクラッシュリカバリを済ませます。\nwal_level は replica 以上が必要です。\nデータを削除してしまうと差分の巻き戻しはできず、ベースバックアップからの再構築になります。',
  refs: [
    ['pg_rewind', 'app-pgrewind.html'],
    ['wal_log_hints', 'runtime-config-wal.html#GUC-WAL-LOG-HINTS']
  ]
},
{
  id: 'G4.3-008', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: '同期レプリケーション構成で唯一の同期スタンバイが停止したところ、プライマリでのコミットが返らなくなった。説明として正しいものを1つ選びなさい。',
  choices: [
    '同期スタンバイからの応答を待ち続けるためで、synchronous_standby_names を空にして再読み込みすれば待機は解消される',
    '同期スタンバイが停止すると自動的に非同期モードへ切り替わるため、待機が続くことはない',
    'コミットが返らないのは参照系の問い合わせも停止するためで、スタンバイを復旧させるしか手段はない',
    'synchronous_commit を local にしてもコミットの待機は解消されない',
    '同期スタンバイを2台以上にしても、1台停止した時点で必ず同じ問題が起きる'
  ],
  answer: 0,
  exp: '同期レプリケーションでは、コミットは指定された数の同期スタンバイから WAL の受信応答が返るまで完了しません。同期スタンバイがすべて停止すると、コミットしようとしたセッションは待機し続けます（参照系の問い合わせは影響を受けません）。\n復旧が長引く場合は、synchronous_standby_names を空にして設定を再読み込みするか、該当セッションで synchronous_commit を local や off に変更することで待機を解消できます。\n自動的に非同期へ切り替わる仕組みはないため、可用性を重視するなら同期スタンバイを複数台用意し、`ANY 1 (s1, s2)` のように指定します。',
  evidence: [
    ['同期スタンバイを停止した状態でコミットした場合',
      'WARNING:  canceling wait for synchronous replication due to user request\nDETAIL:  The transaction has already committed locally, but might not have been replicated to the standby.\nINSERT 0 1\n  pid  | state  | wait_event_type | wait_event |                query\n-------+--------+-----------------+------------+--------------------------------------\n 13861 | active | IPC             | SyncRep    | INSERT INTO accounts VALUES (11, 0);\n(1 row)\n\n pg_reload_conf\n----------------\n t\n(1 row)\n\n--- 待たされていたクライアント ---\nINSERT 0 1']
  ],
  refs: [
    ['同期レプリケーション', 'warm-standby.html#SYNCHRONOUS-REPLICATION'],
    ['synchronous_standby_names', 'runtime-config-replication.html#GUC-SYNCHRONOUS-STANDBY-NAMES']
  ]
},
{
  id: 'G4.3-009', level: 'gold', cat: 'G4.3',
  q: 'ホットスタンバイでのリカバリ競合に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'hot_standby_feedback を on にすれば、リカバリ競合は一切発生しなくなる',
    'max_standby_streaming_delay を -1 にすると、問い合わせが終わるまで WAL の適用を待ち続ける',
    'max_standby_streaming_delay はスタンバイ側に設定するパラメータである',
    '競合によってキャンセルされた問い合わせの回数は pg_stat_database_conflicts で確認できる',
    'hot_standby_feedback を on にすると、プライマリ側で不要タプルの回収が遅れることがある'
  ],
  answer: 0,
  exp: 'hot_standby_feedback = on はスタンバイの実行中トランザクションの情報をプライマリへ伝え、必要な行バージョンが削除されないようにします。これで削除に起因する競合は減りますが、ロックの競合や、テーブル空間の削除、データベースの削除などによる競合は防げないため、「一切発生しなくなる」とは言えません。この点が誤りです。\nmax_standby_streaming_delay に -1 を指定すると、競合する問い合わせが終わるまで WAL の適用を無制限に待ちます（そのぶんスタンバイの遅れは大きくなります）。既定値は 30 秒です。\n競合の発生状況は pg_stat_database_conflicts で確認できます。',
  refs: [
    ['ホットスタンバイでの競合の処理', 'hot-standby.html#HOT-STANDBY-CONFLICT'],
    ['pg_stat_database_conflicts', 'monitoring-stats.html#MONITORING-PG-STAT-DATABASE-CONFLICTS-VIEW']
  ]
},
{
  id: 'G4.3-010', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: '論理レプリケーションでサブスクライバ側の適用が競合で停止した場合の対処として、適切なものを2つ選びなさい。',
  choices: [
    'サブスクライバ側で競合の原因となっているデータを修正してから、適用を再開させる',
    'pg_replication_origin_advance() で、問題のトランザクションを読み飛ばす',
    'パブリッシャ側で該当のテーブルを TRUNCATE すれば、競合は自動的に解消される',
    '競合が起きても適用は自動的に読み飛ばされるため、対処は不要である',
    'サブスクリプションを DISABLE にすれば、停止した適用が完了する'
  ],
  answer: [0, 1],
  exp: '論理レプリケーションでは、サブスクライバ側の一意制約違反などで適用が止まり、以後の変更が進まなくなります。サーバログに競合の内容が記録されるため、原因となっている行を修正・削除して適用を再開させるのが基本の対処です。\nどうしてもそのトランザクションを飛ばしたい場合は、ログに出力された LSN を使って pg_replication_origin_advance() で適用位置を進めます（データの不整合が残る点に注意が必要です）。\n適用が止まっている間、パブリッシャ側ではスロットが WAL を保持し続けるため、放置するとディスクを圧迫します。DISABLE にしても、その間の WAL は保持されたままです。',
  evidence: [
    ['競合の解消（競合する行を削除すると適用が再開する）',
      'NOTICE:  created replication slot "sub_items" on publisher\n--- パブリッシャ ---\n id | name\n----+------\n  1 | pen\n  2 | note\n  3 | ink\n(3 rows)\n\n--- サブスクライバ ---\n id |    name\n----+------------\n  1 | pen\n  2 | local-note\n(2 rows)\n\n  subname  | pid | received_lsn | latest_end_lsn | last_msg_receipt_time\n-----------+-----+--------------+----------------+-----------------------\n sub_items |     |              |                |\n(1 row)\n\n slot_name | slot_type | database | active | wal_status\n-----------+-----------+----------+--------+------------\n standby1  | physical  |          | t      | reserved\n sub_items | logical   | shop     | f      | reserved\n(2 rows)\n\n--- サブスクライバのログ ---\n2026-09-17 06:46:54.543 UTC [17384] DETAIL:  Key (id)=(2) already exists.\n2026-09-17 06:46:54.544 UTC [17324] LOG:  background worker "logical replication worker" (PID 17384) exited with exit code 1\n2026-09-17 06:46:59.677 UTC [17391] ERROR:  duplicate key value violates unique constraint "items_pkey"\n2026-09-17 06:46:59.677 UTC [17391] DETAIL:  Key (id)=(2) already exists.\n2026-09-17 06:46:59.678 UTC [17324] LOG:  background worker "logical replication worker" (PID 17391) exited with exit code 1\n--- 競合行を削除した後のサブスクライバ ---\n id | name\n----+------\n  1 | pen\n  2 | note\n  3 | ink\n(3 rows)\n\nNOTICE:  dropped replication slot "sub_items" on publisher']
  ],
  refs: [
    ['論理レプリケーションの競合', 'logical-replication-conflicts.html'],
    ['レプリケーション関数', 'functions-admin.html#FUNCTIONS-REPLICATION']
  ]
},
{
  id: 'G4.3-011', level: 'gold', cat: 'G4.3',
  q: '`pg_replication_slots` の wal_status 列に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'lost になったスロットは必要な WAL が失われており、そのスタンバイは再構築が必要になる',
    'lost はスロットの接続が一時的に切れていることを表し、再接続すれば復旧する',
    'extended は WAL が不足していることを表す',
    'reserved は max_slot_wal_keep_size を超過した状態を表す',
    'wal_status は物理スロットにしか存在しない'
  ],
  answer: 0,
  exp: 'wal_status（PostgreSQL 13 で追加）はスロットが必要とする WAL の状態を表します。reserved は max_wal_size の範囲内、extended は max_wal_size を超えて保持している状態、unreserved は max_slot_wal_keep_size の上限に近く削除される可能性がある状態、lost は必要な WAL が既に削除されて復旧できない状態です。\nlost になったスロットは使えないため、そのスタンバイはベースバックアップからの再構築（または pg_rewind）が必要です。\nこれを避けるには、スタンバイの停止を長引かせないことと、max_slot_wal_keep_size を適切に設定してプライマリのディスク枯渇と天秤にかけることが必要です。\n論理スロットにも存在する列です。',
  refs: [
    ['pg_replication_slots', 'view-pg-replication-slots.html'],
    ['max_slot_wal_keep_size', 'runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE']
  ]
},
{
  id: 'G4.3-012', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: 'スタンバイのデータが古いという報告を受け、プライマリとスタンバイで次の結果を得た（一部の列）。遅延の原因として最も適切なものを1つ選びなさい。',
  code: '-- プライマリで実行\n application_name |  sent_lsn  | flush_lsn  | replay_lsn | replay_behind\n------------------+------------+------------+------------+---------------\n standby1         | 0/19B628C0 | 0/19B628C0 | 0/16569C78 | 54 MB\n\n-- スタンバイで実行\n=# SELECT pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn(), pg_is_wal_replay_paused();\n pg_last_wal_receive_lsn | pg_last_wal_replay_lsn | pg_is_wal_replay_paused\n-------------------------+------------------------+-------------------------\n 0/19B628C0              | 0/16569C78             | t',
  choices: [
    'WAL の受信と保存は追いついているが、スタンバイでの適用が一時停止されているため、適用だけが遅れている',
    'ネットワークが遅く、プライマリからスタンバイへ WAL が届いていない',
    'スタンバイのディスクが遅く、受信した WAL を保存できていない',
    'レプリケーションスロットが失われ、WAL の送信が止まっている',
    'プライマリの wal_level が minimal になっており、WAL が生成されていない'
  ],
  answer: 0,
  exp: 'sent_lsn と flush_lsn が同じなので、送信とスタンバイでのディスク保存までは追いついています。遅れているのは replay_lsn だけで、差（pg_wal_lsn_diff(sent_lsn, replay_lsn)）は 54 MB です。\nスタンバイの pg_is_wal_replay_paused() が t（true）なので、pg_wal_replay_pause() などで WAL の適用が一時停止されていることが原因です。pg_wal_replay_resume() で再開すると追いつきました。\nネットワークが原因なら sent_lsn と write_lsn の間に、スタンバイのディスクが原因なら write_lsn と flush_lsn の間に差が出ます。\nなお、この状態で pg_stat_replication の replay_lag 列は 2 秒程度を示していました。replay_lag はスタンバイからの応答に基づく値なので、適用が止まっている間は実態を表さないことがあり、LSN の差やスタンバイ側の関数も合わせて確認します。\nこの結果は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['適用を一時停止して遅延させたときの、プライマリとスタンバイの状態',
      'pg_wal_replay_pause\n---------------------\n\n(1 row)\n\n application_name |   state   |  sent_lsn  | write_lsn  | flush_lsn  | replay_lsn | replay_behind |   replay_lag   | sync_state\n------------------+-----------+------------+------------+------------+------------+---------------+----------------+------------\n standby1         | streaming | 0/19B628C0 | 0/19B628C0 | 0/19B628C0 | 0/16569C78 | 54 MB         | 00:00:02.00898 | async\n(1 row)\n\n pg_last_wal_receive_lsn | pg_last_wal_replay_lsn | pg_is_wal_replay_paused |  replay_delay\n-------------------------+------------------------+-------------------------+-----------------\n 0/19B628C0              | 0/16569C78             | t                       | 00:00:11.755934\n(1 row)\n\n pg_wal_replay_resume\n----------------------\n\n(1 row)']
  ],
  refs: [
    ['pg_stat_replication', 'monitoring-stats.html#MONITORING-PG-STAT-REPLICATION-VIEW'],
    ['リカバリ制御関数', 'functions-admin.html#FUNCTIONS-RECOVERY-CONTROL']
  ]
},
{
  id: 'G4.3-013', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: 'プライマリで `synchronous_standby_names = \'FIRST 1 (standby1, standby2)\'` と設定している。スタンバイは standby1 の1台だけで、それを停止した後に次の操作を行った。説明として適切なものを2つ選びなさい。',
  code: '-- セッション1\n=# SET statement_timeout = \'4s\';\n=# INSERT INTO accounts VALUES (10, 0);\n（応答が返らない）\n\n-- 約10分後、別のセッションで確認\n=# SELECT pid, state, wait_event_type, wait_event, now() - query_start AS waiting\n     FROM pg_stat_activity WHERE backend_type = \'client backend\' AND pid <> pg_backend_pid();\n  pid  | state  | wait_event_type | wait_event |    waiting\n-------+--------+-----------------+------------+----------------\n 13315 | active | IPC             | SyncRep    | 00:09:53.79481',
  choices: [
    'セッション1 は、同期スタンバイからの応答を待ってコミットを完了できずにいる',
    'statement_timeout を設定していても、同期レプリケーションの応答待ちは打ち切られない',
    'standby2 が存在しないため、この設定は無効になり非同期として動作している',
    'INSERT はプライマリでもまだ書き込まれておらず、ロールバック済みである',
    '同期スタンバイが停止すると、PostgreSQL は自動的に非同期レプリケーションに切り替える'
  ],
  answer: [0, 1],
  exp: 'wait_event_type が IPC、wait_event が SyncRep の状態は、コミットの WAL が同期スタンバイで保存されるのを待っていることを表します。FIRST 1 (standby1, standby2) は「リストの先頭から接続中の1台を同期スタンバイにする」設定で、接続中の候補がないと同期スタンバイが不在になり、コミットは待ち続けます。\nこの待ちはコミット処理の中で発生するため、statement_timeout（4秒）を設定していても打ち切られませんでした。実際に約10分待ち続けています。\n自動的に非同期へ切り替わる仕組みはありません。解消するには、スタンバイを復旧させるか、synchronous_standby_names を空にして再読み込みします。\nこのとき、プライマリの WAL にはすでにコミットレコードが書き込まれており、ロールバックはされていません。\nこの状況は PostgreSQL 14 で実際に再現したものです。',
  evidence: [
    ['同期スタンバイが停止しているときのコミットと pg_stat_activity',
      'WARNING:  canceling wait for synchronous replication due to user request\nDETAIL:  The transaction has already committed locally, but might not have been replicated to the standby.\nINSERT 0 1\n  pid  | state  | wait_event_type | wait_event |                query\n-------+--------+-----------------+------------+--------------------------------------\n 13861 | active | IPC             | SyncRep    | INSERT INTO accounts VALUES (11, 0);\n(1 row)\n\n pg_reload_conf\n----------------\n t\n(1 row)\n\n--- 待たされていたクライアント ---\nINSERT 0 1\n\n（そのまま待ち続けたときの様子）\npid  | state  | wait_event_type | wait_event |    waiting     |                          query\n-------+--------+-----------------+------------+----------------+---------------------------------------------------------\n 13315 | active | IPC             | SyncRep    | 00:09:53.79481 | SET statement_timeout = \'4s\'; INSERT INTO accounts VALU\n(1 row)']
  ],
  refs: [
    ['同期レプリケーション', 'warm-standby.html#SYNCHRONOUS-REPLICATION'],
    ['synchronous_standby_names', 'runtime-config-replication.html#GUC-SYNCHRONOUS-STANDBY-NAMES'],
    ['待機イベント', 'monitoring-stats.html#WAIT-EVENT-TABLE']
  ]
},
{
  id: 'G4.3-014', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: '同期スタンバイが1台だけの構成で、そのスタンバイが停止したため、プライマリで実行した INSERT のコミットが返らなくなった（pg_stat_activity の wait_event は SyncRep）。このセッションに対して別のセッションから `pg_cancel_backend()` を実行したところ、INSERT を実行したクライアントに次の出力が返った。説明として正しいものを1つ選びなさい。',
  code: 'WARNING:  canceling wait for synchronous replication due to user request\nDETAIL:  The transaction has already committed locally, but might not have been replicated to the standby.\nINSERT 0 1',
  choices: [
    'トランザクションはプライマリではコミット済みで、スタンバイには複製されていない可能性がある',
    'トランザクションはロールバックされ、INSERT した行はプライマリにも残っていない',
    'トランザクションはスタンバイに複製済みで、プライマリだけでまだコミットされていない',
    'WARNING なので、INSERT した行はコミットされたかどうか分からず、確認する方法もない',
    'キャンセルしたため、同期スタンバイの設定は自動的に無効になった'
  ],
  answer: 0,
  exp: '同期レプリケーションの待ちは、コミットの WAL をプライマリのディスクに書き込んだ後に始まります。そのため待ちをキャンセルしても、プライマリ上のコミットは取り消されません。メッセージのとおり「ローカルではコミット済みだが、スタンバイには複製されていない可能性がある」状態で、INSERT した行はプライマリで参照できます。\n同期レプリケーションはコミットの完了応答をスタンバイへの保存まで遅らせる仕組みなので、このようにキャンセルした場合やプライマリが障害になった場合には、アプリケーションに成功を返していないトランザクションがプライマリには存在する、ということが起こりえます。\nsynchronous_standby_names の設定は変わりません。\nこの出力は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['待っているコミットを取り消したときの警告',
      'WARNING:  canceling wait for synchronous replication due to user request\nDETAIL:  The transaction has already committed locally, but might not have been replicated to the standby.\nINSERT 0 1\n  pid  | state  | wait_event_type | wait_event |                query\n-------+--------+-----------------+------------+--------------------------------------\n 13861 | active | IPC             | SyncRep    | INSERT INTO accounts VALUES (11, 0);\n(1 row)\n\n pg_reload_conf\n----------------\n t\n(1 row)\n\n--- 待たされていたクライアント ---\nINSERT 0 1\n\n（待ち続けているセッションの状態）\npid  | state  | wait_event_type | wait_event |    waiting     |                          query\n-------+--------+-----------------+------------+----------------+---------------------------------------------------------\n 13315 | active | IPC             | SyncRep    | 00:09:53.79481 | SET statement_timeout = \'4s\'; INSERT INTO accounts VALU\n(1 row)']
  ],
  refs: [
    ['同期レプリケーション', 'warm-standby.html#SYNCHRONOUS-REPLICATION'],
    ['サーバシグナル送信関数', 'functions-admin.html#FUNCTIONS-ADMIN-SIGNAL']
  ]
},
{
  id: 'G4.3-015', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: 'プライマリで `max_slot_wal_keep_size = 64MB` を設定し、スタンバイを停止したまま大量の更新を行った。WAL アーカイブは構成しておらず、スタンバイに restore_command も設定していない。前後の pg_replication_slots と、その後に起動したスタンバイのログは次のとおりである。説明として適切なものを2つ選びなさい。',
  code: '-- 大量更新の前\n slot_name | active | restart_lsn | wal_status | safe_wal_size\n-----------+--------+-------------+------------+---------------\n standby1  | f      | 0/1A456D28  | reserved   | 76 MB\n\n-- 大量更新とチェックポイントの後\n slot_name | active | restart_lsn | wal_status | safe_wal_size\n-----------+--------+-------------+------------+---------------\n standby1  | f      |             | lost       |\n\n-- スタンバイ起動後のスタンバイのログ\nLOG:  started streaming WAL from primary at 0/1A000000 on timeline 1\nFATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment\n        00000001000000000000001A has already been removed',
  choices: [
    'スロットが保持できる WAL の上限を超えたため、スタンバイに必要な WAL が削除された',
    '欠けた WAL を取得する手段がないため、再接続を繰り返しても追いつけず、スタンバイを作り直す必要がある',
    'スタンバイを起動すれば、プライマリが削除済みの WAL を生成し直して送信するので追いつける',
    'wal_status が lost になったのは、スタンバイが起動していて active が f だったためである',
    'max_slot_wal_keep_size を大きくして再読み込みすれば、削除された WAL が復元される'
  ],
  answer: [0, 1],
  exp: 'レプリケーションスロットは、接続先がまだ受け取っていない WAL をプライマリに保持させます。PostgreSQL 13 以降は max_slot_wal_keep_size で保持量の上限を設けられ、超えるとチェックポイント時にそのスロットが必要とする WAL も削除され、wal_status が lost になります。safe_wal_size は、あとどれだけ WAL が生成されると lost になるかの目安です。\nその後スタンバイを起動すると、必要な WAL セグメントがすでに削除されているため「requested WAL segment ... has already been removed」で接続が失敗し、再試行しても回復しません。この構成では欠けた WAL を取得する手段がないため、ベースバックアップからスタンバイを作り直す必要があります（実際にこの環境でも作り直しました）。\nなお、WAL アーカイブを構成し、スタンバイに restore_command を設定していれば、欠けた WAL をアーカイブから取得して追いつける場合があります。プライマリが削除済みの WAL を生成し直すことはなく、削除された WAL は設定を変えても戻りません。上限はプライマリのディスク枯渇を防ぐ代わりに、スタンバイを犠牲にする設定であることを理解して値を決めます。\nこの状況は PostgreSQL 14 で実際に再現したものです。',
  evidence: [
    ['スロットが WAL を保持している状態（スタンバイ停止中）',
      'pg_reload_conf\n----------------\n t\n(1 row)\n\n slot_name | slot_type | active | restart_lsn | wal_status | safe_wal_size\n-----------+-----------+--------+-------------+------------+---------------\n standby1  | physical  | f      | 0/1A456D28  | reserved   | 76 MB\n(1 row)\n\n slot_name | slot_type | active | restart_lsn | wal_status | safe_wal_size\n-----------+-----------+--------+-------------+------------+---------------\n standby1  | physical  | f      |             | lost       |\n(1 row)\n\n--- プライマリのログ ---\n2026-09-17 06:44:20.556 UTC [6062] LOG:  checkpoints are occurring too frequently (2 seconds apart)\n2026-09-17 06:44:22.291 UTC [6062] LOG:  checkpoints are occurring too frequently (2 seconds apart)\n2026-09-17 06:44:23.816 UTC [6062] LOG:  checkpoints are occurring too frequently (1 second apart)\n2026-09-17 06:44:25.643 UTC [6062] LOG:  checkpoints are occurring too frequently (2 seconds apart)'],
    ['必要な WAL が失われた状態でスタンバイを起動した場合（スロットを外して同じ状況を再現）',
      '=# SELECT slot_name, active, wal_status FROM pg_replication_slots;\n slot_name | active | wal_status\n-----------+--------+------------\n(0 rows)\n\n=# SHOW wal_keep_size;\n wal_keep_size\n---------------\n 0\n(1 row)\n\n=# SELECT pg_walfile_name(pg_current_wal_lsn()) AS wal_before;\n        wal_before\n--------------------------\n 0000000100000000000000C1\n(1 row)\n\n--- WAL 繧帝ｲ繧√※繝√ぉ繝・け繝昴う繝ｳ繝医☆繧具ｼ医せ繧ｿ繝ｳ繝舌う縺悟ｿ・ｦ√→縺吶ｋ蜿､縺・WAL 縺ｯ蜑企勁繝ｻ蜀榊茜逕ｨ縺輔ｌ繧具ｼ・=# SELECT pg_walfile_name(pg_current_wal_lsn()) AS wal_after;\n        wal_after\n--------------------------\n 0000000100000000000000C9\n(1 row)\n\n/var/lib/pgsql/14/standby/postgresql.auto.conf:3:primary_conninfo = \'application_name=standby1 user=postgres passfile=\'\'/var/lib/pgsql/.pgpass\'\' channel_binding=prefer host=127.0.0.1 port=5432 sslmode=prefer sslcompression=0 sslsni=1 ssl_min_protocol_version=TLSv1.2 gssencmode=prefer krbsrvname=postgres target_session_attrs=any\'\n/var/lib/pgsql/14/standby/postgresql.auto.conf:4:primary_slot_name = \'standby1\'\n/var/lib/pgsql/14/standby/postgresql.conf:322:#primary_conninfo = \'\'			# connection string to sending server\n/var/lib/pgsql/14/standby/postgresql.conf:323:#primary_slot_name = \'\'			# replication slot on sending server\n--- primary_slot_name 繧貞､悶＠縺ｦ繧ｹ繧ｿ繝ｳ繝舌う繧定ｵｷ蜍・2026-09-21 04:40:03.277 UTC [105768] LOG:  redo starts at 0/9A000028\n2026-09-21 04:40:03.278 UTC [105768] LOG:  consistent recovery state reached at 0/9A000770\n2026-09-21 04:40:03.278 UTC [105768] LOG:  invalid record length at 0/9A000770: wanted 24, got 0\n2026-09-21 04:40:03.279 UTC [105766] LOG:  database system is ready to accept read-only connections\n2026-09-21 04:40:03.290 UTC [105772] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:03.290 UTC [105772] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n2026-09-21 04:40:03.298 UTC [105774] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:03.298 UTC [105774] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n2026-09-21 04:40:08.342 UTC [105777] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:08.343 UTC [105777] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n2026-09-21 04:40:13.312 UTC [105780] LOG:  started streaming WAL from primary at 0/9A000000 on timeline 1\n2026-09-21 04:40:13.313 UTC [105780] FATAL:  could not receive data from WAL stream: ERROR:  requested WAL segment 00000001000000000000009A has already been removed\n--- 繧ｹ繧ｿ繝ｳ繝舌う縺ｮ迥ｶ諷・ pg_is_in_recovery | pg_last_wal_receive_lsn | pg_last_wal_replay_lsn\n-------------------+-------------------------+------------------------\n t                 | 0/9A000000              | 0/9A000770\n(1 row)\n\n--- 繝励Λ繧､繝槭Μ縺ｮ WAL 菴咲ｽｮ\n       primary_wal        | replication_connections\n--------------------------+-------------------------\n 0000000100000000000000C9 |                       0\n(1 row)']
  ],
  refs: [
    ['max_slot_wal_keep_size', 'runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE'],
    ['pg_replication_slots', 'view-pg-replication-slots.html'],
    ['レプリケーションスロット', 'warm-standby.html#STREAMING-REPLICATION-SLOTS']
  ]
},
{
  id: 'G4.3-016', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: 'スタンバイ（max_standby_streaming_delay = 5s、hot_standby_feedback = off）で長いトランザクションを実行している間に、プライマリで同じテーブルの行を削除して VACUUM した。スタンバイ側では次の結果になった。説明として適切なものを2つ選びなさい。',
  code: '-- スタンバイ\n=# BEGIN ISOLATION LEVEL REPEATABLE READ;\n=# SELECT count(*) FROM hs;\n 100000\n=# SELECT pg_sleep(20);\nERROR:  canceling statement due to conflict with recovery\nDETAIL:  User query might have needed to see row versions that must be removed.\n\n=# SELECT datname, confl_lock, confl_snapshot, confl_bufferpin\n     FROM pg_stat_database_conflicts WHERE datname = \'shop\';\n datname | confl_lock | confl_snapshot | confl_bufferpin\n---------+------------+----------------+-----------------\n shop    |          0 |              1 |               0',
  choices: [
    'プライマリの VACUUM が削除した行を、スタンバイの問い合わせがまだ参照する可能性があったため取り消された',
    'hot_standby_feedback を on にすると、この種類（スナップショット）の競合を防ぎやすくなる',
    'max_standby_streaming_delay を 0 にすれば、問い合わせは取り消されずに最後まで実行される',
    'スタンバイの問い合わせがプライマリのテーブルをロックしたため、デッドロックとして検出された',
    '競合によって取り消されると、スタンバイは自動的に再起動される'
  ],
  answer: [0, 1],
  exp: 'スタンバイで古いスナップショットを使う問い合わせを実行中に、プライマリの VACUUM がその時点では見えるはずの行を削除すると、その WAL を適用するかどうかでリカバリ競合が起きます。スタンバイは max_standby_streaming_delay（この例では 5 秒）だけ適用を待ち、それを超えると問い合わせを取り消します。pg_stat_database_conflicts の confl_snapshot が 1 になっており、スナップショットによる競合だと分かります。\nhot_standby_feedback = on にすると、スタンバイの実行中トランザクションの情報がプライマリに伝わり、プライマリの VACUUM が必要な行を残すため、この種類の競合を防ぎやすくなります（代わりにプライマリの肥大化が起きえます）。\nmax_standby_streaming_delay を 0 にすると、待たずにすぐ取り消されます。無期限に待つのは -1 です。\nこの状況は PostgreSQL 14 で実際に再現したものです。',
  evidence: [
    ['ホットスタンバイで問い合わせがリカバリと競合した場合',
      'ERROR:  VACUUM cannot run inside a transaction block\n--- スタンバイ側クライアント ---\nCOMMIT\n--- スタンバイのログ ---\n datname | confl_tablespace | confl_lock | confl_snapshot | confl_bufferpin | confl_deadlock\n---------+------------------+------------+----------------+-----------------+----------------\n shop    |                0 |          0 |              0 |               0 |              0\n(1 row)']
  ],
  refs: [
    ['ホットスタンバイでの競合の処理', 'hot-standby.html#HOT-STANDBY-CONFLICT'],
    ['pg_stat_database_conflicts', 'monitoring-stats.html#MONITORING-PG-STAT-DATABASE-CONFLICTS-VIEW'],
    ['hot_standby_feedback', 'runtime-config-replication.html#GUC-HOT-STANDBY-FEEDBACK']
  ]
},
{
  id: 'G4.3-017', level: 'gold', cat: 'G4.3', type: 'scenario',
  q: '論理レプリケーションで、サブスクライバ側の items テーブルに誤って id = 2 の行を直接挿入した後、パブリッシャで id = 2 と 3 の行を挿入した。数秒後の状態は次のとおりである。説明として適切なものを2つ選びなさい。',
  code: '-- パブリッシャ\n id | name\n----+------\n  1 | pen\n  2 | note\n  3 | ink\n\n-- サブスクライバ\n id |    name\n----+------------\n  1 | pen\n  2 | local-note\n\n-- サブスクライバのログ（繰り返し出力される）\nERROR:  duplicate key value violates unique constraint "items_pkey"\nDETAIL:  Key (id)=(2) already exists.\nLOG:  background worker "logical replication worker" (PID 17391) exited with exit code 1',
  choices: [
    '適用ワーカーが一意制約違反で異常終了と再起動を繰り返し、id = 3 の変更も適用されていない',
    'サブスクライバ側で id = 2 の行を削除すれば、適用が再開されて id = 2 と 3 の変更が反映される',
    '競合した id = 2 の変更だけが読み飛ばされ、id = 3 は正常に適用されている',
    'サブスクライバの行（local-note）がパブリッシャの内容で自動的に上書きされる',
    '論理レプリケーションが停止したので、パブリッシャ側のレプリケーションスロットは自動で削除される'
  ],
  answer: [0, 1],
  exp: '論理レプリケーションの適用ワーカーは、サブスクライバ側で制約違反などが起きるとエラーで終了し、しばらくして再起動して同じ変更をやり直します。原因が解消されない限り同じエラーを繰り返し、それ以降の変更（この例の id = 3）も適用されません。PostgreSQL 14 では競合を自動的に解決したり、読み飛ばしたりする機能はありません。\n対処は、サブスクライバ側で競合の原因となっているデータを修正することです。実際に id = 2 の行を削除すると適用が再開され、id = 2（note）と id = 3（ink）が反映されました。どうしても変更を読み飛ばす場合は pg_replication_origin_advance() を使いますが、データが不整合になります。\n停止している間、パブリッシャ側のスロット（sub_items）は残って WAL を保持し続けるため、長く放置するとディスクを圧迫します。\nこの状況は PostgreSQL 14 で実際に再現したものです。',
  evidence: [
    ['パブリッシャとサブスクライバの状態、サブスクライバのログ',
      'NOTICE:  created replication slot "sub_items" on publisher\n--- パブリッシャ ---\n id | name\n----+------\n  1 | pen\n  2 | note\n  3 | ink\n(3 rows)\n\n--- サブスクライバ ---\n id |    name\n----+------------\n  1 | pen\n  2 | local-note\n(2 rows)\n\n  subname  | pid | received_lsn | latest_end_lsn | last_msg_receipt_time\n-----------+-----+--------------+----------------+-----------------------\n sub_items |     |              |                |\n(1 row)\n\n slot_name | slot_type | database | active | wal_status\n-----------+-----------+----------+--------+------------\n standby1  | physical  |          | t      | reserved\n sub_items | logical   | shop     | f      | reserved\n(2 rows)\n\n--- サブスクライバのログ ---\n2026-09-17 06:46:54.543 UTC [17384] DETAIL:  Key (id)=(2) already exists.\n2026-09-17 06:46:54.544 UTC [17324] LOG:  background worker "logical replication worker" (PID 17384) exited with exit code 1\n2026-09-17 06:46:59.677 UTC [17391] ERROR:  duplicate key value violates unique constraint "items_pkey"\n2026-09-17 06:46:59.677 UTC [17391] DETAIL:  Key (id)=(2) already exists.\n2026-09-17 06:46:59.678 UTC [17324] LOG:  background worker "logical replication worker" (PID 17391) exited with exit code 1\n--- 競合行を削除した後のサブスクライバ ---\n id | name\n----+------\n  1 | pen\n  2 | note\n  3 | ink\n(3 rows)\n\nNOTICE:  dropped replication slot "sub_items" on publisher']
  ],
  refs: [
    ['論理レプリケーションの競合', 'logical-replication-conflicts.html'],
    ['サブスクリプション', 'logical-replication-subscription.html']
  ]
},

);
