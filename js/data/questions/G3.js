/*
 * Gold G3 パフォーマンスチューニング（53問）
 * PostgreSQL 14 文書に基づくオリジナル問題。形式は DEVELOPMENT.md を参照。
 * tools/format.js で整形しています（node tools/format.js）。
 */
(window.PGQ_QUESTIONS = window.PGQ_QUESTIONS || []).push(

/* ---------------- G3.1 性能に関係するパラメータ（重要度 4 / 33問） ---------------- */
{
  id: 'G3.1-001', level: 'gold', cat: 'G3.1',
  q: 'メモリ関連のパラメータに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'work_mem は1つの問い合わせ全体で使用できるメモリの上限であり、ソートやハッシュが複数あっても合計でこの値を超えない',
    'work_mem はソートやハッシュ操作ごとの上限であり、1つの問い合わせで work_mem の数倍のメモリが使われることがある',
    'effective_cache_size を大きくすると、その分の共有メモリが起動時に確保される',
    'maintenance_work_mem は、通常の SELECT 文の ORDER BY によるソートで使用される',
    'wal_buffers の既定値 -1 は、WAL バッファを使用しないことを意味する'
  ],
  answer: 1,
  exp: 'work_mem はソート操作やハッシュテーブル1つあたりに使用できるメモリ量で、超えると一時ファイルが使われます。複雑な問い合わせでは複数のソート・ハッシュ操作が並行して行われ、さらに多数のセッションが同時に実行しうるため、全体のメモリ使用量は work_mem の何倍にもなりえます（ハッシュ操作は work_mem × hash_mem_multiplier まで使用可能）。\neffective_cache_size はプランナが想定するディスクキャッシュの大きさで、メモリは確保されません。\nmaintenance_work_mem は VACUUM、CREATE INDEX、ALTER TABLE ADD FOREIGN KEY などの保守操作で使用されます。\nwal_buffers の -1 は shared_buffers の 1/32（下限 64kB、上限は WAL セグメント1つ分）を自動設定することを意味します。',
  refs: [
    ['資源の消費（メモリ）', 'runtime-config-resource.html#RUNTIME-CONFIG-RESOURCE-MEMORY'],
    ['wal_buffers', 'runtime-config-wal.html#GUC-WAL-BUFFERS'],
    ['effective_cache_size', 'runtime-config-query.html#GUC-EFFECTIVE-CACHE-SIZE']
  ]
},
{
  id: 'G3.1-002', level: 'gold', cat: 'G3.1',
  q: 'チェックポイントおよび WAL に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'チェックポイントは、前回から checkpoint_timeout が経過したとき、または WAL の量が max_wal_size を超えそうになったときに発生する',
    'checkpoint_completion_target を大きくするほど、チェックポイントの書き込みは短時間に集中して行われる',
    'max_wal_size は pg_wal ディレクトリの絶対的な上限で、WAL の量がこれを超えることはない',
    'full_page_writes を off にしても、クラッシュ時のデータ保護の安全性は変わらない',
    'synchronous_commit を off にすると、クラッシュ時にデータベースの一貫性が失われる可能性がある'
  ],
  answer: 0,
  exp: 'チェックポイントは checkpoint_timeout（既定 5min）が経過するか、WAL が max_wal_size（既定 1GB）を超えそうになった時点で開始されます。\ncheckpoint_completion_target（PostgreSQL 14 での既定値 0.9）は、書き込みをチェックポイント間隔のどの程度の割合に分散させるかを表し、大きいほど I/O が平準化されます。\nmax_wal_size はソフトリミットであり、高負荷時やアーカイブの失敗時などには超過することがあります。\nfull_page_writes を off にすると、書き込み途中のクラッシュで生じた部分書き込みページを復旧できなくなるおそれがあります。\nsynchronous_commit = off では直近にコミットしたトランザクションが失われる可能性はありますが、データベースの一貫性が損なわれることはありません。',
  refs: [
    ['WALの設定', 'wal-configuration.html'],
    ['チェックポイント関連パラメータ', 'runtime-config-wal.html#RUNTIME-CONFIG-WAL-CHECKPOINTS'],
    ['非同期コミット', 'wal-async-commit.html']
  ]
},
{
  id: 'G3.1-003', level: 'gold', cat: 'G3.1',
  q: 'プランナのコスト定数などのパラメータに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'seq_page_cost の既定値は 4.0、random_page_cost の既定値は 1.0 である',
    'enable_seqscan を off にすると、シーケンシャルスキャンは一切使われなくなる',
    'ランダムアクセスが高速な SSD を使用する環境では、random_page_cost を下げることでインデックススキャンが選択されやすくなる',
    'default_statistics_target を大きくすると、ANALYZE の実行時間が短くなる',
    'cpu_tuple_cost は、1行の処理に実際にかかった時間（ミリ秒）を自動的に計測して設定される'
  ],
  answer: 2,
  exp: 'seq_page_cost の既定値は 1.0、random_page_cost の既定値は 4.0 です。SSD などランダム読み込みがシーケンシャル読み込みと比べて遅くない環境では random_page_cost を小さくすると、インデックススキャンのコストが相対的に低く見積もられ、選ばれやすくなります。\nenable_seqscan = off はシーケンシャルスキャンのコストを非常に大きく見積もらせるだけで、他に方法がない場合は使われます。\ndefault_statistics_target を大きくすると統計の精度は上がりますが、ANALYZE の時間と計画作成時間は増えます。\nコスト定数は人が設定する相対値で、自動的に計測されるものではありません。',
  refs: [
    ['プランナコスト定数', 'runtime-config-query.html#RUNTIME-CONFIG-QUERY-CONSTANTS'],
    ['プランナメソッド設定', 'runtime-config-query.html#RUNTIME-CONFIG-QUERY-ENABLE']
  ]
},
{
  id: 'G3.1-004', level: 'gold', cat: 'G3.1',
  q: 'ロック管理に関するパラメータの説明として、正しいものを1つ選びなさい。',
  choices: [
    'lock_timeout の既定値は 1s であり、1秒以上のロック待ちはエラーになる',
    'deadlock_timeout の時間が経過すると、ロックを待っている側のトランザクションは必ずエラーになる',
    'log_lock_waits を on にすると、deadlock_timeout より長くロックを待ったセッションの情報がログに出力される',
    'max_locks_per_transaction は、1つのトランザクションが獲得できるロック数の厳密な上限である',
    '軽量ロック（LWLock）の保持状況は pg_locks ビューで確認できる'
  ],
  answer: 2,
  exp: 'deadlock_timeout（既定 1s）はロック待ちがこの時間を超えたときにデッドロックの検査を行うまでの時間です。検査でデッドロックが見つからなければそのまま待ち続けます。\nlog_lock_waits を on にすると、deadlock_timeout より長くロックを待った場合にログメッセージが出力されるため、ロック待ちによる性能問題の調査に役立ちます。\nlock_timeout の既定値は 0（無効）です。\nmax_locks_per_transaction は共有ロックテーブルの大きさを決める平均値であり、個々のトランザクションの厳密な上限ではありません。\npg_locks に表示されるのは重量ロック（通常のロック）で、軽量ロックの待機は pg_stat_activity の wait_event_type = LWLock などで確認します。',
  refs: [
    ['ロック管理', 'runtime-config-locks.html'],
    ['log_lock_waits', 'runtime-config-logging.html#GUC-LOG-LOCK-WAITS'],
    ['待機事象', 'monitoring-stats.html#WAIT-EVENT-TABLE']
  ]
},
{
  id: 'G3.1-005', level: 'gold', cat: 'G3.1',
  q: '`wal_level` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 14 での既定値は minimal である',
    'minimal では、WAL アーカイブやストリーミングレプリケーションに必要な情報が記録されないため、それらを利用するには replica 以上にする必要がある',
    'logical は replica よりも WAL に記録する情報が少ない',
    'wal_level の変更は、設定ファイルの再読み込みで反映される',
    'wal_level = minimal でも、max_wal_senders に 1 以上を設定してストリーミングレプリケーションを利用できる'
  ],
  answer: 1,
  exp: 'wal_level は WAL に書き込む情報量を決めるパラメータで、既定値は replica です。\n・minimal: クラッシュリカバリに必要な最小限の情報のみ。一部の一括処理（同じトランザクション内で作成したテーブルへの COPY など）で WAL を省略でき高速になる\n・replica: WAL アーカイブ、ストリーミングレプリケーション、ホットスタンバイに必要な情報を記録\n・logical: replica の情報に加え、論理デコーディング（論理レプリケーション）に必要な情報を記録\nminimal にする場合は max_wal_senders = 0 にする必要があります。wal_level の変更にはサーバの再起動が必要です。',
  refs: [
    ['wal_level', 'runtime-config-wal.html#GUC-WAL-LEVEL'],
    ['max_wal_senders', 'runtime-config-replication.html#GUC-MAX-WAL-SENDERS']
  ]
},
{
  id: 'G3.1-006', level: 'gold', cat: 'G3.1',
  q: '1GB 以上のメモリを持つデータベース専用サーバにおける `shared_buffers` の設定について、ドキュメントの説明に合致するものを1つ選びなさい。',
  choices: [
    '物理メモリの 80% 以上を割り当てることが推奨されている',
    'PostgreSQL は OS のファイルキャッシュを使わないため、shared_buffers は大きいほど性能が良くなる',
    '設定ファイルの再読み込みで変更を反映できる',
    'shared_buffers を大きくする場合は、WAL の量を抑えるために max_wal_size も小さくするべきである',
    '物理メモリの 25% 程度が妥当な出発点であり、40% を超えて割り当てても効果が上がる可能性は低い'
  ],
  answer: 4,
  exp: 'ドキュメントでは、1GB 以上のメモリを持つ専用サーバでは shared_buffers をメモリの 25% 程度から始めるのが妥当であり、PostgreSQL は OS のキャッシュにも依存しているため、40% を超える割り当てで性能が向上する可能性は低いと説明されています。\nshared_buffers の変更にはサーバの再起動が必要です。\nまた、shared_buffers を大きくする場合は、大量の変更データの書き出しを長い時間に分散させるため、通常は max_wal_size も大きくする必要があります。',
  refs: [
    ['shared_buffers', 'runtime-config-resource.html#GUC-SHARED-BUFFERS'],
    ['WALの設定', 'wal-configuration.html']
  ]
},
{
  id: 'G3.1-007', level: 'gold', cat: 'G3.1', type: 'scenario',
  q: 'max_parallel_workers_per_gather = 4 を設定したが、EXPLAIN ANALYZE で Workers Planned: 4 に対して Workers Launched が 1 になることがあった。原因として考えられるものを1つ選びなさい。',
  choices: [
    'work_mem が小さすぎるため、ワーカーの起動が抑制された',
    'wal_level が replica であるため、パラレルワーカーの数が制限された',
    'max_worker_processes や max_parallel_workers の枠が不足し、ワーカーを確保できなかった',
    'shared_buffers が既定値の 128MB であるため、ワーカーが 1 つに制限された',
    '自動バキュームが有効であるため、パラレルクエリのワーカーが常に 1 つに制限された'
  ],
  answer: 2,
  exp: 'パラレルワーカーはバックグラウンドワーカーとして起動されるため、実行時に max_worker_processes（既定 8）の空きと、パラレルクエリ全体の上限 max_parallel_workers（既定 8）の範囲内でしか起動できません。他のセッションのパラレルクエリやパラレルなインデックス作成などで枠が使われていると、計画上のワーカー数（Workers Planned）より実際に起動された数（Workers Launched）が少なくなります。\nワーカーが起動できなかった分はリーダープロセスが処理するため結果は正しく返りますが、期待した性能が出ないことがあります。',
  refs: [
    ['パラレルクエリはどのように動くのか', 'how-parallel-query-works.html'],
    ['max_parallel_workers', 'runtime-config-resource.html#GUC-MAX-PARALLEL-WORKERS'],
    ['max_worker_processes', 'runtime-config-resource.html#GUC-MAX-WORKER-PROCESSES']
  ]
},
{
  id: 'G3.1-008', level: 'gold', cat: 'G3.1',
  q: 'ソートやハッシュで一時ファイルが使われていないかを調べるための設定として、正しいものを1つ選びなさい。',
  choices: [
    'temp_file_limit の既定値は 0 であり、既定では一時ファイルの作成が禁止されている',
    'log_temp_files に指定する値の単位はファイルの個数である',
    'log_temp_files を 0 にすると、作成されたすべての一時ファイルの名前とサイズが、削除時にログへ出力される',
    '一時ファイルは pg_wal ディレクトリに作成される',
    'temp_buffers を大きくすると、ソートで一時ファイルが使われにくくなる'
  ],
  answer: 2,
  exp: 'log_temp_files は、指定したサイズ（kB）以上の一時ファイルが削除されるときに、そのファイル名とサイズをログに出力します。0 ですべての一時ファイルを出力し、-1（既定）で無効です。work_mem が不足してソートやハッシュでディスクが使われている問い合わせを見つけるのに役立ちます。EXPLAIN ANALYZE の「Sort Method: external merge  Disk: …」でも確認できます。\ntemp_file_limit はセッションが使える一時ファイルの合計サイズの上限で、既定値 -1 は無制限です。\n一時ファイルは base/pgsql_tmp（または temp_tablespaces で指定したテーブルスペース）に作成されます。temp_buffers は一時テーブル用のバッファで、ソートのメモリは work_mem です。',
  refs: [
    ['log_temp_files', 'runtime-config-logging.html#GUC-LOG-TEMP-FILES'],
    ['temp_file_limit', 'runtime-config-resource.html#GUC-TEMP-FILE-LIMIT']
  ]
},
{
  id: 'G3.1-009', level: 'gold', cat: 'G3.1',
  q: 'バックグラウンドライタに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ダーティページを事前に書き出してバックエンドの書き出しを減らし、bgwriter_lru_maxpages = 0 で無効になる',
    'バックグラウンドライタは、チェックポイントを実行するプロセスである',
    'bgwriter_delay を大きくするほど、バックグラウンドライタの処理は頻繁に行われる',
    'バックグラウンドライタは、WAL バッファの内容を WAL ファイルに書き出すプロセスである',
    'バックグラウンドライタを無効にすると、チェックポイントも実行されなくなる'
  ],
  answer: 0,
  exp: 'バックグラウンドライタは、近いうちに再利用されそうな共有バッファ上のダーティページ（変更されたページ）を、bgwriter_delay（既定 200ms）ごとに少しずつ書き出します。これにより、問い合わせを処理するバックエンドが空きバッファを得るために自らページを書き出す頻度が減ります。1回に書き出す最大ページ数は bgwriter_lru_maxpages（既定 100）で、0 にするとこの書き出しは無効になります。\nチェックポイントは checkpointer プロセス、WAL の書き出しは walwriter プロセスが担当するため、バックグラウンドライタを無効にしてもチェックポイントは実行されます。',
  refs: [
    ['バックグラウンドライタ', 'runtime-config-resource.html#RUNTIME-CONFIG-RESOURCE-BACKGROUND-WRITER']
  ]
},
{
  id: 'G3.1-010', level: 'gold', cat: 'G3.1',
  q: '非同期コミット（synchronous_commit = off）の利用に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'synchronous_commit はサーバ起動時にのみ設定でき、トランザクションごとに変更することはできない',
    'synchronous_commit = off にすると、クラッシュ時にデータベースの整合性が失われる可能性がある',
    'SET LOCAL synchronous_commit = off とすれば、重要度の低いトランザクションだけを非同期コミットにできる',
    'synchronous_commit = off は、fsync = off と同じ効果を持つ',
    'synchronous_commit = off でも、コミット時には WAL がディスクに書き込まれるまで待機する'
  ],
  answer: 2,
  exp: '非同期コミットでは、コミット時に WAL がディスクにフラッシュされるのを待たずにクライアントへ完了を返すため、コミットの応答時間を短縮できます。クラッシュした場合、直前にコミットしたトランザクション（最大で wal_writer_delay の約3倍の期間）が失われる可能性がありますが、データベースの整合性は保たれます。\nsynchronous_commit はセッションやトランザクション単位で変更できるため、ログのように多少失われても問題ないデータの処理だけを SET LOCAL synchronous_commit = off で非同期にする使い方ができます。\nfsync = off はクラッシュ時にデータベースが破損するおそれがあり、非同期コミットとは異なります。',
  refs: [
    ['非同期コミット', 'wal-async-commit.html'],
    ['synchronous_commit', 'runtime-config-wal.html#GUC-SYNCHRONOUS-COMMIT']
  ]
},
{
  id: 'G3.1-011', level: 'gold', cat: 'G3.1',
  q: 'パラメータ `huge_pages` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '既定値は on であり、ヒュージページを確保できないとサーバは起動しない',
    '既定値の try では、ヒュージページを確保できれば共有メモリに使い、確保できなければ通常のページで起動する',
    'huge_pages は work_mem などのバックエンドのプライベートメモリにだけ適用される',
    'huge_pages の変更は、設定ファイルの再読み込みで反映される',
    'ヒュージページを使うと、shared_buffers の設定値は無視される'
  ],
  answer: 1,
  exp: 'huge_pages は共有メモリ（主に shared_buffers）にヒュージページ（Linux の HugePages など）を使うかどうかを指定します。既定値の try では、使用できればヒュージページを使い、失敗した場合は通常のページで起動します。on にすると、確保できない場合はサーバが起動しません。off で使用しません。\nヒュージページを使うと、大きな共有メモリのページテーブルが小さくなり、CPU のオーバーヘッドを減らせます。Linux ではカーネルパラメータ vm.nr_hugepages で十分な数のヒュージページを確保しておく必要があります。変更にはサーバの再起動が必要です。',
  refs: [
    ['huge_pages', 'runtime-config-resource.html#GUC-HUGE-PAGES'],
    ['Linuxのヒュージページ', 'kernel-resources.html#LINUX-HUGE-PAGES']
  ]
},
{
  id: 'G3.1-012', level: 'gold', cat: 'G3.1',
  q: 'パラメータ `effective_io_concurrency` の説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'WAL を書き出す walwriter プロセスの数を指定する',
    '1つの問い合わせで起動するパラレルワーカーの最大数を指定する',
    '同時に接続できるクライアントの最大数を指定する',
    '0 にすると、すべてのディスク I/O が無効になる',
    'ビットマップヒープスキャンなどの同時 I/O 要求数の目安で、SSD などでは大きくする'
  ],
  answer: 4,
  exp: 'effective_io_concurrency は、1つのセッションが同時に発行できる I/O 要求数の目安で、PostgreSQL 14 ではビットマップヒープスキャンで次に読むブロックを先読み（プリフェッチ）する数に影響します。既定値は 1（対応するプラットフォームの場合）で、0 にすると先読みを行いません。\nSSD や、多数のディスクを束ねた RAID、ネットワークストレージなど並列に I/O を処理できる環境では、値を大きくすると性能が向上することがあります。テーブルスペースごとにも設定できます。\n保守操作用には maintenance_io_concurrency（PostgreSQL 13 以降）があります。',
  refs: [
    ['effective_io_concurrency', 'runtime-config-resource.html#GUC-EFFECTIVE-IO-CONCURRENCY']
  ]
},
{
  id: 'G3.1-013', level: 'gold', cat: 'G3.1',
  q: 'PostgreSQL 14 の JIT コンパイルに関するパラメータの説明として、正しいものを1つ選びなさい。',
  choices: [
    'jit = on の場合、すべての問い合わせで JIT コンパイルが行われる',
    'jit_above_cost の既定値は 0 であり、コストにかかわらず JIT が使われる',
    '見積もりコストが jit_above_cost を超えると使われ、逆に遅い場合は jit を off にできる',
    'JIT は、LLVM 対応でビルドされていない PostgreSQL でも利用できる',
    'jit パラメータはサーバ起動時にのみ設定でき、セッション単位では変更できない'
  ],
  answer: 2,
  exp: 'JIT コンパイルは、式の評価やタプルの展開などを実行時にネイティブコードへコンパイルして高速化する機能で、PostgreSQL が LLVM 対応（--with-llvm）でビルドされている必要があります。PostgreSQL 14 では jit の既定値は on です。\nJIT が使われるのは、問い合わせの見積もりコストが jit_above_cost（既定 100000）を超えた場合です。さらに jit_inline_above_cost、jit_optimize_above_cost を超えると、インライン化や最適化も行われます。\nコンパイル自体に時間がかかるため、見積もりが大きいのに実際は短時間で終わる問い合わせでは逆に遅くなることがあります。jit はセッション単位で変更でき、EXPLAIN ANALYZE の JIT の項目で所要時間を確認できます。',
  refs: [
    ['JITを使用する時期', 'jit-decision.html'],
    ['jit_above_cost', 'runtime-config-query.html#GUC-JIT-ABOVE-COST']
  ]
},
{
  id: 'G3.1-014', level: 'gold', cat: 'G3.1',
  q: 'パラメータ `default_statistics_target` に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    '既定値は 100 で、大きくすると ANALYZE が収集する統計は詳細になるが、収集と計画作成のコストは増える',
    '既定値は 10 で、値を大きくしても ANALYZE の所要時間は変わらない',
    'この値は列ごとに変更できず、データベース全体で同じ値を使う必要がある',
    '大きくするほどプランナの実行計画の選択は速くなる',
    'この値は VACUUM が一度に処理するページ数を表す'
  ],
  answer: 0,
  exp: 'default_statistics_target は ANALYZE が収集する統計の詳細度（最頻値リストとヒストグラムの要素数の目安）を指定し、既定値は 100 です。値を大きくすると推定精度は上がりますが、ANALYZE の所要時間、pg_statistic の容量、プランナが計画を作る時間が増えます。\n特定の列だけ詳細にしたい場合は ALTER TABLE ... ALTER COLUMN ... SET STATISTICS で列単位に上書きできます。\n変更後は ANALYZE を実行して統計を取り直す必要があります。',
  refs: [
    ['default_statistics_target', 'runtime-config-query.html#GUC-DEFAULT-STATISTICS-TARGET'],
    ['プランナで使用される統計情報', 'planner-stats.html']
  ]
},
{
  id: 'G3.1-015', level: 'gold', cat: 'G3.1',
  q: '`max_connections` と接続の管理に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'superuser_reserved_connections の分は一般ユーザには使えず、max_connections から差し引かれて割り当てられる',
    'max_connections は再起動なしに ALTER SYSTEM と設定の再読み込みだけで変更できる',
    'max_connections を大きくしても、必要となる共有メモリの量は変わらない',
    '接続数が上限に達した場合、新しい接続は空きができるまでサーバ側で待たされる',
    'スタンバイでは max_connections をプライマリより小さくしても問題は起こらない'
  ],
  answer: 0,
  exp: 'superuser_reserved_connections（既定 3）はスーパーユーザ用に予約される接続枠で、一般ユーザが使えるのは max_connections からこの数を引いた分です。\nmax_connections は postmaster の起動時にしか変更できない（context が postmaster の）パラメータで、変更には再起動が必要です。\n接続数に比例してロックテーブルなどの共有メモリが必要になります。\n上限に達すると新しい接続は待たされずにエラーで拒否されるため、接続数が多い環境では接続プーラの利用が推奨されます。\nスタンバイの max_connections がプライマリより小さいと、スタンバイがリカバリを進められず停止することがあります。',
  refs: [
    ['接続設定', 'runtime-config-connection.html#RUNTIME-CONFIG-CONNECTION-SETTINGS'],
    ['ホットスタンバイの管理者用概要', 'hot-standby.html#HOT-STANDBY-ADMIN']
  ]
},
{
  id: 'G3.1-016', level: 'gold', cat: 'G3.1',
  q: 'パラメータ `temp_buffers` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'セッションごとに確保される一時テーブル用のバッファで、セッション内で最初に一時テーブルを使う前なら変更できる',
    '共有バッファの一部として起動時に確保され、すべてのセッションで共有される',
    'ソートやハッシュで使われる作業メモリの上限を指定する',
    '一時ファイルの合計サイズの上限をバイト単位で指定する',
    'この値を超えた一時テーブルのデータは、エラーとなって保存できない'
  ],
  answer: 0,
  exp: 'temp_buffers（既定 8MB）は、各セッションが一時テーブルのアクセスに使うローカルバッファの最大量です。共有バッファとは別に、セッションごとに必要に応じて確保されます。\nセッション内で一時テーブルに最初にアクセスするまでの間であれば、SET で変更できます。\nソートやハッシュの作業メモリは work_mem、一時ファイルの上限は temp_file_limit です。\nバッファに収まらない一時テーブルのデータは、ディスク上の一時ファイルに書き出されます。',
  refs: [
    ['temp_buffers', 'runtime-config-resource.html#GUC-TEMP-BUFFERS'],
    ['資源の消費', 'runtime-config-resource.html']
  ]
},
{
  id: 'G3.1-017', level: 'gold', cat: 'G3.1',
  q: 'PostgreSQL 14 のパラメータ `hash_mem_multiplier` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ハッシュを使う処理が利用できるメモリを work_mem の倍数で指定するもので、ソートには影響しない',
    'work_mem そのものを何倍にするかを指定するもので、ソートにも同じ倍率が適用される',
    '共有バッファの大きさをハッシュ処理用に何倍に拡張するかを指定する',
    'ハッシュインデックスのバケット数の倍率を指定するパラメータである',
    'この値を 1 未満にすることはできず、ハッシュ処理は常に work_mem より多くのメモリを使う'
  ],
  answer: 0,
  exp: 'hash_mem_multiplier は PostgreSQL 13 で追加されたパラメータで、ハッシュテーブルを使う処理（Hash Join や HashAggregate）が使用できるメモリを work_mem × hash_mem_multiplier として決めます。PostgreSQL 14 の既定値は 1.0 です。\nハッシュ処理はメモリ不足時にディスクへあふれると性能が大きく落ちるため、ソート用のメモリとは切り離して増やせるように用意されました。ソートには work_mem がそのまま適用されます。\n1.0 未満の値も設定でき、その場合はハッシュ処理が work_mem より少ないメモリしか使えません。',
  refs: [
    ['hash_mem_multiplier', 'runtime-config-resource.html#GUC-HASH-MEM-MULTIPLIER'],
    ['資源の消費（メモリ）', 'runtime-config-resource.html#RUNTIME-CONFIG-RESOURCE-MEMORY']
  ]
},
{
  id: 'G3.1-018', level: 'gold', cat: 'G3.1',
  q: 'プランナメソッド設定（enable_seqscan などの enable_ で始まるパラメータ）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'off にしてもその方式が完全に禁止されるわけではなく、非常に大きなコストが設定されるだけである',
    'off にするとその方式は一切使われなくなるため、実行できない問い合わせはエラーになる',
    'postgresql.conf でのみ設定でき、セッション単位で変更することはできない',
    '本番環境で恒久的に off にすることが、チューニングの基本として推奨されている',
    'enable_seqscan を off にすると、インデックスのないテーブルは検索できなくなる'
  ],
  answer: 0,
  exp: 'enable_seqscan、enable_indexscan、enable_hashjoin などのプランナメソッド設定は、対応する計画方式に非常に大きなコストを与えることで選ばれにくくするものです。他に手段がなければその方式は使われるため、完全な禁止ではありません。\nこれらは SET によりセッションや単一の問い合わせ単位で変更でき、「なぜこの計画が選ばれたのか」を調べるデバッグ用途に向いています。\n恒久的に off にするのではなく、統計情報の更新やコスト定数の調整といった根本的な対処が推奨されます。',
  refs: [
    ['プランナメソッド設定', 'runtime-config-query.html#RUNTIME-CONFIG-QUERY-ENABLE'],
    ['プランナの動作の制御', 'explicit-joins.html']
  ]
},
{
  id: 'G3.1-019', level: 'gold', cat: 'G3.1',
  q: 'パラメータ `autovacuum_work_mem` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '既定値 -1 は maintenance_work_mem を使うことを意味し、ワーカー数を掛けた量のメモリが必要になりうる',
    'maintenance_work_mem とは無関係で、既定値は work_mem と同じ値になる',
    '自動バキュームワーカー全体で共有される上限なので、ワーカー数を増やしても総使用量は変わらない',
    '値を小さくするほど、1回のバキュームでのインデックススキャン回数は減る',
    'この値は自動バキュームだけでなく、手動の VACUUM にも適用される'
  ],
  answer: 0,
  exp: 'autovacuum_work_mem は自動バキュームワーカー1つが使用できるメモリの最大量で、既定値 -1 は maintenance_work_mem を使うことを意味します。ワーカーごとに確保されるため、autovacuum_max_workers（既定 3）を掛けた量がメモリ消費の目安になります。maintenance_work_mem を大きくする際は、この点に注意が必要です。\nVACUUM は削除対象のタプル識別子をこのメモリに貯め、いっぱいになるたびにインデックスを走査します。したがって値が小さいほどインデックスのスキャン回数は増えます。\n手動の VACUUM には maintenance_work_mem が適用されます。',
  refs: [
    ['autovacuum_work_mem', 'runtime-config-resource.html#GUC-AUTOVACUUM-WORK-MEM'],
    ['自動バキュームの設定', 'runtime-config-autovacuum.html']
  ]
},
{
  id: 'G3.1-020', level: 'gold', cat: 'G3.1',
  q: 'パラメータ `wal_compression` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'チェックポイント後に WAL へ書き出される全ページイメージを圧縮し、WAL の量を減らせる',
    'WAL ファイルそのものを gzip 形式で圧縮して保存するため、pg_waldump では読めなくなる',
    'アーカイブされた WAL だけを圧縮する設定で、pg_wal 内の WAL には影響しない',
    '圧縮によって CPU 負荷は増えないため、常に有効にすることが推奨されている',
    'この設定を有効にすると、full_page_writes は自動的に off になる'
  ],
  answer: 0,
  exp: 'wal_compression を on にすると、full_page_writes によって WAL に書き込まれる全ページイメージが圧縮されます。チェックポイント直後は WAL の量が増えるため、その量とディスク I/O を減らす効果があります。\nその代わり圧縮・復元に CPU を使うため、CPU に余裕がない環境では逆効果になることがあります。既定値は off です。\n圧縮されるのは WAL レコード内の全ページイメージであって、WAL ファイル全体をアーカイブのように圧縮するわけではありません。アーカイブ時の圧縮は archive_command 側で行います。',
  refs: [
    ['wal_compression', 'runtime-config-wal.html#GUC-WAL-COMPRESSION'],
    ['WALの設定', 'wal-configuration.html']
  ]
},
{
  id: 'G3.1-021', level: 'gold', cat: 'G3.1',
  q: '起動時に共有メモリとして確保されるものはどれか、適切なものを2つ選びなさい。',
  choices: [
    'shared_buffers',
    'wal_buffers',
    'work_mem',
    'maintenance_work_mem',
    'effective_cache_size'
  ],
  answer: [0, 1],
  shuffle: false,
  exp: '共有メモリは起動時にまとめて確保され、すべてのプロセスから参照されます。代表的なものが共有バッファ（shared_buffers）と WAL バッファ（wal_buffers）で、ほかにロックテーブルや稼働統計用の領域なども含まれます。\nwork_mem と maintenance_work_mem は、ソートやハッシュ、保守作業のたびにプロセスごとに確保されるプロセスローカルなメモリです。したがって同時実行数に比例して総使用量が増えます。\neffective_cache_size はプランナが想定する OS 込みのキャッシュサイズを伝えるだけの値で、メモリは一切確保されません。',
  refs: [
    ['資源の消費（メモリ）', 'runtime-config-resource.html#RUNTIME-CONFIG-RESOURCE-MEMORY'],
    ['カーネルリソースの管理', 'kernel-resources.html']
  ]
},
{
  id: 'G3.1-022', level: 'gold', cat: 'G3.1',
  q: 'セッションごとに確保されるメモリに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'work_mem はソートやハッシュ1つあたりの上限なので、同時実行数を掛けた量が必要になりうる',
    'temp_buffers は一時テーブルへのアクセスのためにセッションごとに確保される',
    'maintenance_work_mem は共有メモリから割り当てられるため、同時実行数の影響を受けない',
    'work_mem を大きくすると、確保された分は起動時に共有メモリから予約される',
    'temp_buffers はすべてのセッションで共有されるバッファである'
  ],
  answer: [0, 1],
  exp: 'work_mem はソートやハッシュの操作1つあたりに使えるメモリの上限です。1つの問い合わせに複数の操作が含まれることも、多数のセッションが同時に実行することもあるため、全体では work_mem の何倍ものメモリが使われる可能性があります。\ntemp_buffers（既定 8MB）は一時テーブルへのアクセス用に、セッションごとに必要に応じて確保されるローカルバッファです。\nmaintenance_work_mem も VACUUM や CREATE INDEX を実行するプロセスごとに確保されます。自動バキュームでは autovacuum_work_mem × ワーカー数が目安になります。\nいずれも起動時に予約されるものではありません。',
  refs: [
    ['資源の消費（メモリ）', 'runtime-config-resource.html#RUNTIME-CONFIG-RESOURCE-MEMORY'],
    ['temp_buffers', 'runtime-config-resource.html#GUC-TEMP-BUFFERS']
  ]
},
{
  id: 'G3.1-023', level: 'gold', cat: 'G3.1',
  q: 'パラメータ `fsync` と `synchronous_commit` に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    '無停電電源装置があるサーバでは、どちらも無効にすることが推奨されている',
    'fsync を off にすると、クラッシュ時にデータベースが復旧不能なほど壊れる可能性がある',
    'synchronous_commit を off にすると、クラッシュ時に直近のコミットが失われる可能性がある',
    'synchronous_commit を off にしても、データベースの一貫性は保たれる',
    'どちらも書き込み性能を大きく向上させる可能性がある'
  ],
  answer: 0,
  exp: '無停電電源装置があっても、OS のクラッシュやストレージの障害でデータが失われる可能性は残るため、fsync を無効にすることが推奨されるわけではありません。この点が誤りです。文書でも fsync を off にしてよいのは、データが失われても簡単に再作成できる場合だけだと述べられています。\nfsync を off にすると WAL の同期書き込みが行われなくなるため、クラッシュ時にデータベース全体が復旧できないほど壊れる危険があります。\n一方 synchronous_commit を off にした場合に失われるのは直近のコミット（最大で wal_writer_delay の3倍程度）だけで、データベースの一貫性は保たれます。危険度が大きく異なる点が重要です。',
  refs: [
    ['fsync', 'runtime-config-wal.html#GUC-FSYNC'],
    ['非同期コミット', 'wal-async-commit.html']
  ]
},
{
  id: 'G3.1-024', level: 'gold', cat: 'G3.1',
  q: '並列処理に関するパラメータの説明として、適切なものを3つ選びなさい。',
  choices: [
    'max_worker_processes は、システム全体で起動できるバックグラウンドワーカーの上限である',
    'max_parallel_workers_per_gather は、1つの Gather ノードが使えるワーカー数の上限である',
    'max_parallel_maintenance_workers は、CREATE INDEX などの保守作業で使えるワーカー数の上限である',
    'max_parallel_workers_per_gather を0にしても、パラレルクエリは引き続き使われる',
    'max_parallel_workers は、1セッションが使えるワーカー数の上限である'
  ],
  answer: [0, 1, 2],
  exp: 'max_worker_processes（既定 8）はシステム全体で起動できるバックグラウンドワーカーの総数で、論理レプリケーションのワーカーなども含みます。\nmax_parallel_workers（既定 8）はそのうちパラレル処理に使える総数で、セッション単位ではなくシステム全体の上限です。\nmax_parallel_workers_per_gather（既定 2）は、1つの Gather ノードが使えるワーカー数の上限です。0 にするとパラレルクエリは行われなくなります。\nmax_parallel_maintenance_workers（既定 2）は CREATE INDEX や VACUUM の並列処理で使える上限です。\n実際に起動できる数はこれらすべての制約と、そのときの空き状況で決まります。',
  refs: [
    ['非同期動作', 'runtime-config-resource.html#RUNTIME-CONFIG-RESOURCE-ASYNC-BEHAVIOR'],
    ['パラレル問い合わせの動作', 'how-parallel-query-works.html']
  ]
},
{
  id: 'G3.1-025', level: 'gold', cat: 'G3.1',
  q: '軽量ロック（LWLock）と通常のロック（重量ロック）の違いとして、正しいものを1つ選びなさい。',
  choices: [
    '軽量ロックは共有メモリの内部構造を保護するもので、pg_locks には現れない',
    '軽量ロックはテーブルや行を保護するもので、pg_locks で確認できる',
    '軽量ロックはデッドロック検出の対象となるため、循環待ちが起きると自動的に解消される',
    '軽量ロックは LOCK TABLE コマンドで明示的に獲得できる',
    '軽量ロックはトランザクションの終了まで保持される'
  ],
  answer: 0,
  exp: '軽量ロック（LWLock）は共有バッファやWAL挿入位置といった、共有メモリ上のデータ構造を短時間だけ保護する内部的なロックです。獲得と解放が非常に短いためロック情報を残さず、pg_locks ビューには現れません。競合の状況は pg_stat_activity の wait_event_type が LWLock になることで確認します。\n一方、テーブルや行に対する通常のロック（重量ロック）は pg_locks に現れ、トランザクションの終了まで保持され、デッドロック検出の対象になります。LOCK TABLE や SELECT ... FOR UPDATE で明示的に獲得できるのもこちらです。',
  refs: [
    ['待機イベント', 'monitoring-stats.html#WAIT-EVENT-TABLE'],
    ['明示的ロック', 'explicit-locking.html'],
    ['pg_locks', 'view-pg-locks.html']
  ]
},
{
  id: 'G3.1-026', level: 'gold', cat: 'G3.1',
  q: 'PostgreSQL 14 で追加された `idle_session_timeout` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'トランザクションを開いていない待機中のセッションを、指定時間で自動的に切断する',
    'トランザクションを開いたまま待機しているセッションを、指定時間で自動的に切断する',
    '実行中の問い合わせを、指定時間で自動的に中止する',
    'ロックの獲得待ちを、指定時間であきらめる',
    '接続の試行を、指定時間であきらめる'
  ],
  answer: 0,
  exp: 'idle_session_timeout（PostgreSQL 14 で追加、既定 0 = 無効）は、トランザクションの外で待機している（state が idle の）セッションを指定時間後に切断します。接続を張りっぱなしにするアプリケーションによる接続枠の占有を防ぐ目的です。接続プーラを挟んでいる場合は、プーラ側の再接続と競合しないよう注意します。\nトランザクションを開いたまま待機している状態（idle in transaction）を切断するのは idle_in_transaction_session_timeout です。こちらは VACUUM が進まなくなる問題への対処として重要度が高い設定です。\n実行中の文を中止するのは statement_timeout、ロック待ちの上限は lock_timeout です。',
  refs: [
    ['文の動作', 'runtime-config-client.html#GUC-IDLE-SESSION-TIMEOUT'],
    ['idle_in_transaction_session_timeout', 'runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT']
  ]
},
{
  id: 'G3.1-027', level: 'gold', cat: 'G3.1',
  q: 'タイムアウト系のパラメータに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'statement_timeout は、1つの文の実行時間がこの値を超えると、その文を中止する',
    'lock_timeout は、ロックの獲得待ちがこの値を超えると、その文をエラーにする',
    'statement_timeout の待ち時間には、ロックの獲得待ちは含まれない',
    'lock_timeout を statement_timeout より大きくすると、ロック待ちを先に検出できる',
    'これらはスーパーユーザしか設定できない'
  ],
  answer: [0, 1],
  exp: 'statement_timeout は文の実行時間の上限で、これを超えるとその文が中止されます。ロックの獲得待ちも実行時間に含まれます。\nlock_timeout はロックの獲得を待つ時間の上限で、超えるとその文がエラーになります。\nロック待ちだけを先に検出したい場合は、lock_timeout を statement_timeout より「小さく」設定します（説明が逆です）。\nどちらも context が user のパラメータなので、一般のロールが SET でセッション単位に設定できます。長いバッチ処理の前に一時的に緩める、といった使い方ができます。',
  refs: [
    ['文の動作', 'runtime-config-client.html#RUNTIME-CONFIG-CLIENT-STATEMENT'],
    ['明示的ロック', 'explicit-locking.html']
  ]
},
{
  id: 'G3.1-028', level: 'gold', cat: 'G3.1',
  q: 'PostgreSQL 14 で追加された `client_connection_check_interval` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '長い問い合わせの実行中にクライアントが切断していないかを定期的に確認し、切れていれば中止する',
    'クライアントからの接続要求を、この間隔でしか受け付けなくする',
    'スタンバイへの接続が生きているかを確認する間隔である',
    '接続プールの接続を再利用する間隔である',
    'この間隔ごとに、すべてのクライアント接続を強制的に切断する'
  ],
  answer: 0,
  exp: 'client_connection_check_interval（PostgreSQL 14 で追加、既定 0 = 無効）は、問い合わせの実行中にクライアントとの接続が切れていないかを定期的に確認するパラメータです。切断が検出されると、その問い合わせは中止されます。\nクライアントが途中で去ったのにサーバ側が重い問い合わせを続けてしまう、という資源の無駄を防げます。\n対応している OS（Linux など）でのみ機能します。\nスタンバイ側の接続維持には、別途 wal_receiver_timeout や tcp_keepalives_* の設定があります。',
  refs: [
    ['接続設定', 'runtime-config-connection.html#GUC-CLIENT-CONNECTION-CHECK-INTERVAL'],
    ['TCPキープアライブ', 'runtime-config-connection.html#GUC-TCP-KEEPALIVES-IDLE']
  ]
},
{
  id: 'G3.1-029', level: 'gold', cat: 'G3.1',
  q: 'ログ出力のレベルに関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'log_min_messages を warning にすると、warning より軽いメッセージも記録される',
    'log_min_error_statement は、指定したレベル以上のエラーを起こした SQL 文そのものを記録する',
    'client_min_messages はクライアントへ送るメッセージのレベルを決める',
    'PANIC はサーバ全体を強制終了させる、最も重大なレベルである',
    'FATAL はそのセッションを終了させるが、他のセッションには影響しない'
  ],
  answer: 0,
  exp: 'log_min_messages はサーバログに記録する「最低レベル」を指定するもので、warning にすると warning 以上（warning、error、log、fatal、panic）が記録され、それより軽い notice や info、debug は記録されません。この点が誤りです。既定値は warning です。\nlog_min_error_statement（既定 error）は、そのレベル以上のエラーになった SQL 文の本文をログに残します。\n重大度は、下から DEBUG5〜1、INFO、NOTICE、WARNING、ERROR（その文を中止）、LOG、FATAL（そのセッションを終了）、PANIC（全プロセスを強制終了しリカバリ）と並びます。',
  refs: [
    ['ログをいつ出力するか', 'runtime-config-logging.html#RUNTIME-CONFIG-SEVERITY-LEVELS'],
    ['エラー報告とログ取得', 'runtime-config-logging.html']
  ]
},
{
  id: 'G3.1-030', level: 'gold', cat: 'G3.1',
  q: 'I/O の同時実行に関するパラメータの説明として、適切なものを2つ選びなさい。',
  choices: [
    'effective_io_concurrency は、ビットマップヒープスキャンなどでの先読みの多重度を指定する',
    'maintenance_io_concurrency は、VACUUM などの保守作業に適用される同時実行数である',
    'effective_io_concurrency を大きくすると、共有バッファもその分だけ拡張される',
    'これらはハードディスクよりも SSD で小さい値が推奨される',
    'maintenance_io_concurrency は PostgreSQL 14 では利用できない'
  ],
  answer: [0, 1],
  exp: 'effective_io_concurrency は、PostgreSQL が同時に処理できると期待する I/O 操作の数で、ビットマップヒープスキャンでの先読みなどに使われます。PostgreSQL 13 以降の既定値は 1 です。\nmaintenance_io_concurrency（PostgreSQL 13 で追加、既定 10）は、VACUUM などの保守作業に適用される同じ意味のパラメータです。\nランダムアクセスを並行して処理できる SSD やストライプ構成のストレージでは、値を大きくするほうが効果的です。単体のハードディスクでは 1 程度が適切です。\nいずれもメモリの確保量とは関係ありません。',
  refs: [
    ['非同期動作', 'runtime-config-resource.html#GUC-EFFECTIVE-IO-CONCURRENCY'],
    ['maintenance_io_concurrency', 'runtime-config-resource.html#GUC-MAINTENANCE-IO-CONCURRENCY']
  ]
},
{
  id: 'G3.1-031', level: 'gold', cat: 'G3.1', type: 'scenario',
  q: 'サーバログと pg_stat_bgwriter に次の出力があった（ログのタイムスタンプ等は省略）。原因と対処として、最も適切なものを1つ選びなさい。',
  code: 'LOG:  checkpoint starting: wal\nLOG:  checkpoint complete: wrote 1111 buffers (6.8%); ...; distance=18448 kB, estimate=29879 kB\nLOG:  checkpoints are occurring too frequently (1 second apart)\nHINT:  Consider increasing the configuration parameter "max_wal_size".\n\n=# SELECT checkpoints_timed, checkpoints_req FROM pg_stat_bgwriter;\n checkpoints_timed | checkpoints_req\n-------------------+-----------------\n                 0 |              66',
  choices: [
    'WAL の生成量が max_wal_size に達するたびにチェックポイントが起きており、max_wal_size の引き上げを検討する',
    'checkpoint_timeout が短すぎるためチェックポイントが頻発しており、checkpoint_timeout を延ばす',
    '共有バッファが不足しているためチェックポイントが頻発しており、shared_buffers を増やす',
    'checkpoint_completion_target を 0 にして、チェックポイントを短時間で終わらせる',
    'この警告は WAL アーカイブの失敗を示しているので、archive_command を確認する'
  ],
  answer: 0,
  exp: '「checkpoint starting: wal」は、WAL の量が max_wal_size に近づいたことによるチェックポイントであることを示します（時間経過によるものは「time」）。pg_stat_bgwriter でも、時間によるチェックポイント（checkpoints_timed）が 0、要求によるもの（checkpoints_req）が 66 回です。\nチェックポイントの間隔が checkpoint_warning（既定 30 秒）より短いと、この警告が出ます。チェックポイントが頻発すると、書き出しの I/O と、チェックポイント後の最初の更新で書かれる全ページイメージによって WAL の量も増えるため、HINT のとおり max_wal_size の引き上げを検討します。\nこの環境では max_wal_size を 32MB と小さくして大量の UPDATE を行い、PostgreSQL 14 で実際に再現しました。',
  refs: [
    ['WALの設定', 'wal-configuration.html'],
    ['チェックポイント', 'runtime-config-wal.html#RUNTIME-CONFIG-WAL-CHECKPOINTS'],
    ['pg_stat_bgwriter', 'monitoring-stats.html#MONITORING-PG-STAT-BGWRITER-VIEW']
  ]
},
{
  id: 'G3.1-032', level: 'gold', cat: 'G3.1', type: 'scenario',
  q: '`log_temp_files = 0` を設定しているサーバで、サーバログに次の出力があった。説明として適切なものを2つ選びなさい。',
  code: 'LOG:  temporary file: path "base/pgsql_tmp/pgsql_tmp15472.0", size 6299648\nLOG:  temporary file: path "base/pgsql_tmp/pgsql_tmp15470.0", size 5292032',
  choices: [
    'log_temp_files = 0 なので、大きさに関係なくすべての一時ファイルが記録されている',
    'ソートやハッシュが work_mem に収まらなかった可能性が高く、work_mem の見直しを検討する',
    '一時ファイルは共有バッファの一部として、共有メモリ上に作られている',
    '一時ファイルの内容は WAL に書き込まれ、スタンバイにも複製される',
    '一時ファイルは処理後も残り続けるため、定期的に手動で削除する必要がある'
  ],
  answer: [0, 1],
  exp: 'log_temp_files は、指定したサイズ（kB）以上の一時ファイルを削除時にログへ記録するパラメータです。0 ならすべてを記録し、-1（既定）なら記録しません。\n一時ファイルは、ソートやハッシュ結合・集約が work_mem（ハッシュは hash_mem_multiplier も考慮）に収まらないときに、データベースのディレクトリ内の pgsql_tmp に作られます。ファイル名の数字は作成したプロセスの PID で、この例ではパラレルクエリのリーダーとワーカーがそれぞれ作っています。\n一時ファイルは処理が終わると自動的に削除され、WAL には記録されません。\n該当の問い合わせを特定するには、log_line_prefix やこのログの前後に出る STATEMENT を確認します。\nこのログは PostgreSQL 14 で work_mem = 1MB にして実際に出力させたものです。',
  refs: [
    ['log_temp_files', 'runtime-config-logging.html#GUC-LOG-TEMP-FILES'],
    ['work_mem', 'runtime-config-resource.html#GUC-WORK-MEM'],
    ['データベースファイルのレイアウト', 'storage-file-layout.html']
  ]
},
{
  id: 'G3.1-033', level: 'gold', cat: 'G3.1',
  q: 'min_wal_size と max_wal_size に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'WAL のディスク使用量が min_wal_size を下回っている間は、チェックポイントで不要になった WAL ファイルを削除せず、再利用のために残す',
    'min_wal_size は WAL ファイル1つあたりの最小サイズで、これより小さい WAL ファイルはチェックポイントで作成されなくなる',
    'max_wal_size は厳密な上限で、WAL の量がこの値に達すると、チェックポイントが終わるまで更新処理がすべてエラーになる',
    'min_wal_size を大きくすると、自動チェックポイントの間隔が短くなるため、チェックポイントが頻繁に発生するようになる',
    'min_wal_size と max_wal_size はサーバ起動時にしか設定できないため、値の変更を反映するにはサーバの再起動が必要である'
  ],
  answer: 0,
  exp: 'min_wal_size は、チェックポイントで不要になった古い WAL ファイルの扱いを決めます。WAL のディスク使用量がこの値を下回っている間は、ファイルを削除せずに、将来使うために名前を変えて再利用します。一時的に WAL が大量に出る処理（バッチなど）に備えて、WAL ファイルを新しく作る負荷を減らせます。既定値は 80MB です。\nmax_wal_size は、自動チェックポイントの間に WAL を増やしてよい量の目安で、これを超えそうになるとチェックポイントが実行されます。ソフトリミットのため、負荷が高いときや、wal_keep_size、レプリケーションスロット、アーカイブの失敗などで WAL を残す必要があるときは超えることがあります。既定値は 1GB です。\nWAL ファイル（セグメント）1つの大きさは initdb の --wal-segsize で決まり（既定 16MB）、これらのパラメータとは関係ありません。どちらも設定ファイルの再読み込みで変更できます（context は sighup）。',
  refs: [
    ['min_wal_size', 'runtime-config-wal.html#GUC-MIN-WAL-SIZE'],
    ['max_wal_size', 'runtime-config-wal.html#GUC-MAX-WAL-SIZE'],
    ['WALの設定', 'wal-configuration.html']
  ]
},

/* ---------------- G3.2 チューニングの実施（重要度 2 / 20問） ---------------- */
{
  id: 'G3.2-001', level: 'gold', cat: 'G3.2',
  q: 'インデックスを活用したチューニングに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'B-tree インデックスは、LIKE \'%abc\' のような後方一致検索を高速化するのに適している',
    '複合インデックス (a, b) は、WHERE b = 1 のように2番目の列だけを条件にした検索で最も効率よく使われる',
    'WHERE lower(email) = ... の検索には、lower(email) に対する式インデックスが有効である',
    'インデックスを多く作成するほど、INSERT や UPDATE も高速になる',
    'PostgreSQL には、テーブルの一部の行だけを対象とする部分インデックスの機能はない'
  ],
  answer: 2,
  exp: '式インデックスは列そのものではなく関数や式の結果に対して作成するインデックスで、問い合わせの WHERE 句に同じ式が使われていれば利用されます。\nB-tree は等価・範囲検索や前方一致（LIKE \'abc%\'、ロケールによっては text_pattern_ops が必要）に使えますが、先頭がワイルドカードの検索には使えません（pg_trgm の GIN/GiST インデックスなどを検討します）。\n複数列の B-tree インデックスは先頭列に条件がある場合に最も効率的です。\nインデックスは更新時のオーバーヘッドになるため、増やしすぎると書き込み性能が低下します。\nWHERE 句付きの CREATE INDEX で部分インデックスを作成できます。',
  refs: [
    ['式に対するインデックス', 'indexes-expressional.html'],
    ['複数列インデックス', 'indexes-multicolumn.html'],
    ['部分インデックス', 'indexes-partial.html']
  ]
},
{
  id: 'G3.2-002', level: 'gold', cat: 'G3.2',
  q: 'テーブル構成のチューニングに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'テーブルの fillfactor の既定値は 70 である',
    'fillfactor を 100 未満に設定すると各ページに空き領域が残るため、更新後の行を同じページに格納しやすくなり、HOT 更新が行われやすくなる',
    'CLUSTER を一度実行すると、その後の INSERT や UPDATE でもインデックスの順序が自動的に維持される',
    'テーブルとインデックスを異なるディスク上のテーブルスペースに配置しても、I/O 分散の効果はない',
    'UNLOGGED テーブルは WAL を出力しないが、クラッシュ後もデータはすべて保持される'
  ],
  answer: 1,
  exp: 'テーブルの fillfactor の既定値は 100（ページを完全に詰める）です。100 未満にすると INSERT 時にページ内に空きが残され、UPDATE で新しい行バージョンを同じページに置けるため、インデックス列を更新しない場合は HOT（Heap-Only Tuple）更新となりインデックスの更新を省略できます。\nCLUSTER は一度だけの並べ替えで、以降の変更で順序は維持されません。\nテーブルスペースを使って負荷の高いテーブルやインデックスを別のディスクに配置することで I/O を分散できます。\nUNLOGGED テーブルはクラッシュや異常停止の後に自動的に空（TRUNCATE）にされます。',
  refs: [
    ['CREATE TABLE（ストレージパラメータ fillfactor）', 'sql-createtable.html#SQL-CREATETABLE-STORAGE-PARAMETERS'],
    ['CLUSTER', 'sql-cluster.html'],
    ['テーブル空間', 'manage-ag-tablespaces.html']
  ]
},
{
  id: 'G3.2-003', level: 'gold', cat: 'G3.2', type: 'scenario',
  q: 'orders テーブルの created_at 列（timestamp 型）に B-tree インデックスがある。2026年1月1日に作成された行を検索する SQL のうち、このインデックスを最も利用しやすい書き方を1つ選びなさい。',
  choices: [
    'SELECT * FROM orders WHERE date_trunc(\'day\', created_at) = \'2026-01-01\';',
    'SELECT * FROM orders WHERE created_at::date = \'2026-01-01\';',
    'SELECT * FROM orders WHERE to_char(created_at, \'YYYY-MM-DD\') = \'2026-01-01\';',
    'SELECT * FROM orders WHERE created_at >= \'2026-01-01\' AND created_at < \'2026-01-02\';',
    'SELECT * FROM orders WHERE created_at::text LIKE \'2026-01-01%\';'
  ],
  answer: 3,
  exp: 'created_at 列そのものに作成した B-tree インデックスは、created_at と定数を比較する条件（=、<、<=、>=、> など）で利用できます。そのため、範囲条件 created_at >= \'2026-01-01\' AND created_at < \'2026-01-02\' に書き換えるとインデックススキャンが可能になります。\n列に関数やキャストを適用した条件（date_trunc()、::date、to_char()、::text など）では、列のインデックスは使われません。どうしてもその形で検索する必要がある場合は、同じ式に対する式インデックスを作成します（式に使う関数は IMMUTABLE である必要があります）。',
  refs: [
    ['B-treeインデックス', 'indexes-types.html#INDEXES-TYPES-BTREE'],
    ['式に対するインデックス', 'indexes-expressional.html']
  ]
},
{
  id: 'G3.2-004', level: 'gold', cat: 'G3.2',
  q: '毎月、1年以上前のログデータを大量に削除している。削除処理の負荷を下げるための方法として、最も適切なものを1つ選びなさい。',
  choices: [
    'DELETE 文は WAL の出力量が少ないため、DELETE をより頻繁に実行する',
    '月単位の範囲パーティションにしておき、古いパーティションを DETACH PARTITION して DROP TABLE する',
    'パーティションテーブルは TRUNCATE できないため、テーブルを1つにまとめて DELETE する',
    'パーティション数を増やすほど、あらゆる問い合わせが常に高速になるため、日単位でパーティションを作成する',
    'パーティションを削除すると親テーブルの全インデックスの再作成が必要になるため、削除後に REINDEX を実行する'
  ],
  answer: 1,
  exp: '大量の DELETE は削除する行ごとに WAL を出力し、削除後も VACUUM による不要行の回収が必要です。期間ごとにパーティション分割しておけば、古いパーティションを ALTER TABLE ... DETACH PARTITION で切り離して DROP TABLE（または TRUNCATE）するだけで、ほとんど負荷なくまとめて削除できます。これはドキュメントでもパーティショニングの主な利点として挙げられています。\nパーティション数が多すぎると計画作成時間やメモリ使用量が増えるため、適切な粒度を選ぶ必要があります。パーティションを削除しても、他のパーティションのインデックスを作り直す必要はありません。',
  refs: [
    ['パーティションのメンテナンス', 'ddl-partitioning.html#DDL-PARTITIONING-DECLARATIVE-MAINTENANCE'],
    ['宣言的パーティショニングのベストプラクティス', 'ddl-partitioning.html#DDL-PARTITIONING-DECLARATIVE-BEST-PRACTICES']
  ]
},
{
  id: 'G3.2-005', level: 'gold', cat: 'G3.2',
  q: 'プリペアド文の実行計画に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'プリペアド文は常に汎用計画を使い、パラメータの値に応じた計画は作成されない',
    'PREPARE で作成したプリペアド文は、同じデータベースに接続している他のセッションからも実行できる',
    'プリペアド文を実行する計画の種類を強制するパラメータはない',
    '使用しているテーブルの統計情報が更新されても、プリペアド文の計画が作り直されることはない',
    '既定では最初の5回はパラメータ値に応じたカスタム計画を作成し、以降は汎用計画の見積もりコストが大きく劣らなければ汎用計画を使う'
  ],
  answer: 4,
  exp: 'プリペアド文を実行すると、既定（plan_cache_mode = auto）では最初の5回はパラメータの値に基づくカスタム計画を作成し、その後は汎用計画の見積もりコストがカスタム計画の平均と比べて大きく劣らなければ、計画作成を省略できる汎用計画を使います。\nplan_cache_mode（PostgreSQL 12 以降）を force_custom_plan または force_generic_plan にすると、計画の種類を強制できます。データの偏りによって汎用計画が不適切になる場合に有効です。\nプリペアド文はセッション内でのみ有効です。使用しているオブジェクトの定義変更や統計情報の更新があれば、再解析・再計画が行われます。',
  refs: [
    ['PREPARE', 'sql-prepare.html'],
    ['plan_cache_mode', 'runtime-config-query.html#GUC-PLAN-CACHE_MODE']
  ]
},
{
  id: 'G3.2-006', level: 'gold', cat: 'G3.2',
  q: '`CREATE INDEX ON orders (customer_id) INCLUDE (amount);` で作成したインデックスに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'amount はインデックスの検索キーとして使われ、WHERE amount = 100 の検索に利用できる',
    'amount は検索キーではないが格納されるため、Index Only Scan を使いやすくなる',
    'INCLUDE 句は GIN インデックス専用であり、B-tree インデックスには使えない',
    'INCLUDE に指定した列も含めて、インデックスの並び順が決まる',
    '一意インデックスに INCLUDE 列を加えると、INCLUDE 列も含めた組み合わせで一意性が判定される'
  ],
  answer: 1,
  exp: 'INCLUDE 句（PostgreSQL 11 以降、B-tree・GiST などで利用可能）で指定した列は、検索キーとしては使われない「付加列」としてインデックスに格納されます。このようなインデックスをカバリングインデックスと呼び、SELECT amount FROM orders WHERE customer_id = 1 のように検索キーと付加列だけを参照する問い合わせで、テーブルを読まずに済む Index Only Scan を使いやすくなります。\nINCLUDE 列は並び順や一意性の判定には関係しないため、CREATE UNIQUE INDEX ... (customer_id) INCLUDE (amount) では customer_id だけで一意性が判定されます。付加列を増やすとインデックスが大きくなる点に注意します。',
  refs: [
    ['インデックスオンリースキャンとカバリングインデックス', 'indexes-index-only-scans.html'],
    ['CREATE INDEX', 'sql-createindex.html']
  ]
},
{
  id: 'G3.2-007', level: 'gold', cat: 'G3.2',
  q: '大部分の行が status = \'done\' で、ごく一部の status = \'pending\' の行だけを頻繁に検索するテーブルがある。インデックスの設計として、最も適切なものを1つ選びなさい。',
  choices: [
    'CREATE INDEX ON jobs (id) WHERE status = \'pending\'; のような部分インデックスを作成し、インデックスを小さく保つ',
    'status 列に通常の B-tree インデックスを作成すれば、どのような条件でも部分インデックスより必ず効率がよい',
    '部分インデックスは、問い合わせの WHERE 句に条件を書かなくても自動的に使われる',
    'status の値の種類が少ないため、ハッシュインデックスを作成すると更新が不要になる',
    '部分インデックスの条件には status = \'pending\' のような定数条件を指定できない'
  ],
  answer: 0,
  exp: '部分インデックスは、WHERE 句で指定した条件を満たす行だけを対象とするインデックスです。検索対象がごく一部の行に限られる場合、インデックスが小さくなり、検索が速く、更新時のオーバーヘッドも小さくなります（status が done に更新された行はインデックスから外れていきます）。\n部分インデックスが使われるのは、問い合わせの WHERE 句の条件がインデックスの条件を含意するとプランナが判断できる場合で、例えば WHERE status = \'pending\' AND id > 100 のような問い合わせです。条件にはパラメータではなく定数を使う必要があります。\nどのインデックスも、テーブルの更新に伴って更新されます。',
  refs: [
    ['部分インデックス', 'indexes-partial.html']
  ]
},
{
  id: 'G3.2-008', level: 'gold', cat: 'G3.2',
  q: '`WHERE name LIKE \'%tokyo%\'` のような中間一致検索を高速化する方法として、最も適切なものを1つ選びなさい。',
  choices: [
    'name 列に text_pattern_ops を指定した B-tree インデックスを作成する',
    'name 列にハッシュインデックスを作成する',
    'name 列に BRIN インデックスを作成する',
    'pg_trgm 拡張を導入し、name 列に gin_trgm_ops を指定した GIN インデックスを作成する',
    'lower(name) の式インデックスを作成する'
  ],
  answer: 3,
  exp: 'B-tree インデックスは前方一致（LIKE \'tokyo%\'、C ロケール以外では text_pattern_ops などが必要）には使えますが、先頭がワイルドカードの中間一致・後方一致には使えません。\ncontrib の pg_trgm は文字列を3文字ずつの組（トライグラム）に分解して類似度を扱うモジュールで、CREATE INDEX ON t USING gin (name gin_trgm_ops); のようなトライグラムの GIN（または GiST）インデックスを作成すると、LIKE / ILIKE の中間一致や正規表現検索を高速化できます。\nハッシュインデックスは等価比較にのみ、BRIN は物理順序と相関のある範囲検索向けです。式インデックスは同じ式を使う検索にのみ効果があります。',
  refs: [
    ['pg_trgm', 'pgtrgm.html'],
    ['インデックス種類', 'indexes-types.html']
  ]
},
{
  id: 'G3.2-009', level: 'gold', cat: 'G3.2',
  q: 'BRIN インデックスが特に有効なケースとして、最も適切なものを1つ選びなさい。',
  choices: [
    '時刻の順に追記される大きなログテーブルで、記録日時の範囲を指定して検索する場合',
    'ランダムな値の UUID 列に対して、1件ずつ等価検索する場合',
    '列の値に一意制約を設定したい場合',
    '全文検索のために、文書中の単語を検索する場合',
    '小さなテーブルで、主キーによる検索を高速化したい場合'
  ],
  answer: 0,
  exp: 'BRIN（Block Range Index）は、テーブルの連続したブロックの範囲ごとに、列の最小値と最大値などの要約情報だけを保持するインデックスです。非常に小さいサイズで作成できる一方、値がテーブルの物理的な格納順序と強く相関している場合に効果を発揮します。時刻の順に追記されるログや計測データの日時列に対する範囲検索が典型的な用途です。\n値がランダムに分布している列の等価検索には B-tree（またはハッシュ）、全文検索には GIN、一意制約には B-tree の一意インデックスを使います。',
  refs: [
    ['BRINインデックスの概要', 'brin-intro.html'],
    ['インデックス種類（BRIN）', 'indexes-types.html#INDEXES-TYPES-BRIN']
  ]
},
{
  id: 'G3.2-010', level: 'gold', cat: 'G3.2',
  q: 'HOT（Heap Only Tuple）更新と fillfactor に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '更新後の行が同じページに収まり、インデックス列が変化していなければ、インデックスの更新を省略できる',
    '更新が HOT になるのは、テーブルにインデックスが1つも存在しない場合に限られる',
    'fillfactor を 100 に近づけるほど、HOT 更新が発生しやすくなる',
    'HOT 更新では行の古いバージョンが作られないため、VACUUM が不要になる',
    'fillfactor はインデックスには設定できず、テーブルにのみ指定できる'
  ],
  answer: 0,
  exp: 'HOT 更新は、更新された行が元の行と同じページに格納でき、かつインデックスが張られた列の値が変化していない場合に成立します。このとき新しい行バージョンへの参照はページ内のポインタ連鎖で解決されるため、インデックスの更新が不要になり、更新が軽くなります。\n同じページに空きがあることが条件なので、fillfactor（テーブルの既定は 100）を 80〜90 程度に下げて更新用の余地を残すと HOT 更新が起きやすくなります。\nHOT でも古い行バージョンは残るため VACUUM は必要ですが、ページ内で回収できる分、負荷は小さくなります。\nfillfactor は B-tree インデックスにも設定できます（既定 90）。',
  refs: [
    ['pg_stat_all_tables（n_tup_hot_upd）', 'monitoring-stats.html#MONITORING-PG-STAT-ALL-TABLES-VIEW'],
    ['格納パラメータ', 'sql-createtable.html#SQL-CREATETABLE-STORAGE-PARAMETERS']
  ]
},
{
  id: 'G3.2-011', level: 'gold', cat: 'G3.2',
  q: 'UNLOGGED テーブルに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '書き込みが WAL に記録されないため高速だが、クラッシュ後の再起動時に内容が切り捨てられる',
    'WAL に記録されないだけで、クラッシュ後も内容は保証される',
    'セッションが終了すると自動的に削除される点で、一時テーブルと同じである',
    'ストリーミングレプリケーションのスタンバイでも、内容を参照することができる',
    'UNLOGGED テーブルにはインデックスを作成することができない'
  ],
  answer: 0,
  exp: 'UNLOGGED テーブルは変更が WAL に書かれないため書き込みが速くなりますが、クラッシュや異常停止の後の再起動時にテーブルの内容は切り捨てられます（テーブル定義は残ります）。再作成可能な中間データやキャッシュ的な用途に向きます。\n一時テーブルと違い、セッションをまたいで存在し、他のセッションからも参照できます。\nWAL に記録されないためスタンバイには複製されず、スタンバイ上では参照できません。\nインデックスは作成でき、そのインデックスも UNLOGGED になります。ALTER TABLE ... SET LOGGED で通常のテーブルに変換できます。',
  refs: [
    ['CREATE TABLE（UNLOGGED）', 'sql-createtable.html'],
    ['信頼性', 'wal-reliability.html']
  ]
},
{
  id: 'G3.2-012', level: 'gold', cat: 'G3.2',
  q: '複数列にまたがる B-tree インデックス `CREATE INDEX ON t (a, b, c);` の利用に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '先頭列 a に対する条件があるときに効率よく使え、b や c だけを条件にした検索では効率が落ちる',
    '3つの列すべてに条件が指定されている場合にのみ使用できる',
    '列の指定順序は検索効率に影響しないため、どの順序で作成しても同じである',
    '`WHERE b = 1` のような検索でも、先頭列を条件にした場合と同じ効率で使用できる',
    '複数列インデックスは ORDER BY の高速化には使えない'
  ],
  answer: 0,
  exp: 'B-tree の複数列インデックスは先頭の列から順に並んでいるため、先頭列 a に対する等価条件（または範囲条件）があるときに最も効率よく使えます。a の条件があれば b、c の条件も絞り込みに使われます。\n先頭列の条件がない場合でも、インデックス全体を走査する形で使われることはありますが、効率は大きく落ちます。\nこのため列の順序は重要で、等価条件で使われる列や選択率の高い列を先に置くのが基本です。\n`ORDER BY a, b, c` のようにインデックスの順序と一致する整列であれば、ソートを省略できます。',
  refs: [
    ['複数列インデックス', 'indexes-multicolumn.html'],
    ['インデックスと ORDER BY', 'indexes-ordering.html']
  ]
},
{
  id: 'G3.2-013', level: 'gold', cat: 'G3.2',
  q: 'ディスク I/O を分散させるチューニングに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '別のディスク上に作ったテーブル空間へ、アクセスの多いテーブルやインデックスを移動させる',
    'テーブル空間を作成すると、その中のオブジェクトへの I/O が自動的に複数ディスクへ分散される',
    'pg_wal を別のディスクへ移すには、ディレクトリをコピーするだけでよく、シンボリックリンクは不要である',
    'テーブル空間を分けると、そのテーブルは自動的にパラレルクエリの対象になる',
    'インデックスは必ずテーブルと同じテーブル空間に置く必要がある'
  ],
  answer: 0,
  exp: 'テーブル空間を使うと、特定のテーブルやインデックスを別のディスクに配置でき、I/O を分散できます。ALTER TABLE ... SET TABLESPACE や CREATE INDEX ... TABLESPACE で移動・指定します。インデックスをテーブルと別のテーブル空間に置くこともできます。\nテーブル空間自体にストライピングの機能はなく、分散の効果はどのオブジェクトをどこに置くかによります。\nWAL の書き込みは連続的で負荷が高いため、pg_wal を別ディスクに置くのは有効ですが、その場合はシンボリックリンクにする（または initdb -X で指定する）必要があります。\nパラレルクエリの可否はテーブル空間とは無関係です。',
  refs: [
    ['テーブル空間', 'manage-ag-tablespaces.html'],
    ['WALの内部', 'wal-internals.html']
  ]
},
{
  id: 'G3.2-014', level: 'gold', cat: 'G3.2',
  q: 'インデックスの整理に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '使われていないインデックスは更新のたびに維持コストがかかるため、削除すると更新性能が改善することがある',
    'インデックスは多いほど検索も更新も速くなるため、思いつく限り作成しておくのがよい',
    '同じ列に対する重複したインデックスがあっても、ディスク使用量以外に不利益はない',
    'インデックスを削除すると、そのテーブルの統計情報もすべて失われる',
    'B-tree インデックスは PostgreSQL 13 以降、同じ値が多い列では作成できなくなった'
  ],
  answer: 0,
  exp: 'インデックスは検索を速くする一方で、INSERT / UPDATE / DELETE のたびに更新され、ディスクとバッファも消費します。pg_stat_user_indexes の idx_scan がほとんど増えないインデックスや、先頭列が重複する冗長なインデックスは削除の候補です（一意制約を支えるインデックスは除きます）。\n削除の前に、その列を使う夜間バッチなどがないかを確認します。\nテーブルの統計情報はインデックスとは独立に保持されます。\nPostgreSQL 13 では B-tree の重複排除（deduplication）が導入され、同じ値が多い列でのインデックスサイズが小さくなりました。',
  refs: [
    ['pg_stat_all_indexes', 'monitoring-stats.html#MONITORING-PG-STAT-ALL-INDEXES-VIEW'],
    ['B-treeの重複排除', 'btree-implementation.html#BTREE-DEDUPLICATION']
  ]
},
{
  id: 'G3.2-015', level: 'gold', cat: 'G3.2',
  q: 'インデックスが使われるように SQL を書き換える方法として、適切なものを2つ選びなさい。',
  choices: [
    '`WHERE date_trunc(\'day\', ts) = \'2026-01-01\'` を、ts の範囲条件に書き換える',
    '`WHERE lower(name) = \'pg\'` に対して、lower(name) の式インデックスを作成する',
    '`WHERE amount * 2 > 100` のように、列を加工した条件にそろえる',
    '`WHERE id::text = \'123\'` のように、列をキャストして型をそろえる',
    '`WHERE name LIKE \'%pg%\'` に対して、通常の B-tree インデックスを作成する'
  ],
  answer: [0, 1],
  exp: 'WHERE 句で列に関数や演算を適用すると、その列の通常のインデックスは使えません。date_trunc を使った条件は `ts >= \'2026-01-01\' AND ts < \'2026-01-02\'` のような範囲条件に書き換えると、ts のインデックスが使えます。\n列の加工をやめられない場合は、その式に対する式インデックス（CREATE INDEX ... ON t (lower(name))）を作ります。\n列の側をキャストしたり演算したりするのは逆効果で、比較する値の側を列の型に合わせます。\n中間一致の LIKE には B-tree は効かず、pg_trgm による GIN / GiST インデックスや全文検索を検討します。',
  refs: [
    ['式によるインデックス', 'indexes-expressional.html'],
    ['インデックスの種類', 'indexes-types.html'],
    ['pg_trgm', 'pgtrgm.html']
  ]
},
{
  id: 'G3.2-016', level: 'gold', cat: 'G3.2',
  q: 'パラメータを変更したときの反映方法に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'pg_settings の context が postmaster のパラメータは、pg_reload_conf() で反映できる',
    'context が sighup のパラメータは、設定の再読み込みで反映される',
    'context が user のパラメータは、SET でセッション単位に変更できる',
    'context が superuser のパラメータは、一般ユーザが SET で変更できない',
    'context が internal のパラメータは、initdb やビルド時に決まり変更できない'
  ],
  answer: 0,
  exp: 'pg_settings の context 列は、そのパラメータをいつ・誰が変更できるかを表します。postmaster はサーバの起動時にしか変更できないもので、設定を再読み込みしても反映されず、再起動が必要です（shared_buffers、max_connections、wal_level など）。この点が誤りです。\nsighup は設定の再読み込み（pg_ctl reload や pg_reload_conf()）で反映されます。\nsuperuser はスーパーユーザなどの権限を持つロールだけが、user は誰でもセッション単位で変更できます。\ninternal は initdb やビルド時に決まり、変更できません（ブロックサイズなど）。',
  refs: [
    ['pg_settings', 'view-pg-settings.html'],
    ['パラメータの設定', 'config-setting.html']
  ]
},
{
  id: 'G3.2-017', level: 'gold', cat: 'G3.2',
  q: 'パーティションテーブルのインデックスに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    '親テーブルに CREATE INDEX すると、各パーティションに対応するインデックスが自動的に作成される',
    '一意インデックスを作るには、パーティションキーをインデックスの列に含める必要がある',
    '親テーブルに作成したインデックスは、親テーブル自体のデータを保持している',
    'パーティションごとに別々のインデックスを作ることはできない',
    'CREATE INDEX CONCURRENTLY は、親テーブルに対しても指定できる'
  ],
  answer: [0, 1],
  exp: 'パーティションテーブルの親に CREATE INDEX を実行すると、各パーティションに同じ定義のインデックスが作られ、親のインデックスがそれらをまとめる形になります。親テーブル自体はデータを持ちません。\nパーティションをまたいだ一意性は保証できないため、一意インデックスや主キーにはパーティションキーをすべて含める必要があります。\nパーティションごとに固有のインデックスを追加することもできます（ALTER INDEX ... ATTACH PARTITION で親に紐づけることも可能です）。\nパーティションテーブルの親に対する CREATE INDEX CONCURRENTLY はサポートされていないため、パーティションごとに個別に実行し、後から ATTACH する手順を取ります。',
  refs: [
    ['パーティショニング', 'ddl-partitioning.html#DDL-PARTITIONING-DECLARATIVE'],
    ['CREATE INDEX', 'sql-createindex.html']
  ]
},
{
  id: 'G3.2-018', level: 'gold', cat: 'G3.2',
  q: '集計処理の高速化にマテリアライズドビューを使う場合の説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    '元テーブルが更新されると、マテリアライズドビューの内容も自動的に更新される',
    'REFRESH MATERIALIZED VIEW で内容を更新する',
    'CONCURRENTLY を付けて更新すると、更新中も参照できるが一意インデックスが必要である',
    'マテリアライズドビューにはインデックスを作成できる',
    '作成直後に WITH NO DATA を指定した場合、REFRESH するまで参照できない'
  ],
  answer: 0,
  exp: 'マテリアライズドビューは問い合わせの結果を実体として保持するもので、元のテーブルが更新されても自動的には追随しません。明示的に REFRESH MATERIALIZED VIEW を実行する必要があります。この点が誤りです。夜間バッチなどで定期的に更新する運用が一般的です。\nREFRESH は既定では排他ロックを取りますが、CONCURRENTLY を付けると更新中も参照できます。ただし、あらかじめ一意インデックスが必要です。\n実体があるためインデックスを作成でき、検索を高速化できます。\nWITH NO DATA で作成した場合は「読み取り不可」の状態になり、REFRESH するまで参照できません。',
  refs: [
    ['マテリアライズドビュー', 'rules-materializedviews.html'],
    ['REFRESH MATERIALIZED VIEW', 'sql-refreshmaterializedview.html']
  ]
},
{
  id: 'G3.2-019', level: 'gold', cat: 'G3.2', type: 'scenario',
  q: '全体の約 1% しかない status = \'pending\' の行を頻繁に検索している。インデックスを追加する前 (1) と後 (2) の実行計画（一部省略）が次のとおりである。説明として正しいものを1つ選びなさい。',
  code: '=# EXPLAIN (ANALYZE) SELECT id, amount FROM orders\n     WHERE customer_id = 500 AND status = \'pending\';\n\n-- (1)\nBitmap Heap Scan on orders  (actual rows=0 loops=1)\n  Recheck Cond: (customer_id = 500)\n  Filter: (status = \'pending\'::text)\n  Rows Removed by Filter: 2\n  ->  Bitmap Index Scan on orders_customer_id_idx  (actual rows=2 loops=1)\n        Index Cond: (customer_id = 500)\n\n=# CREATE INDEX orders_pending_idx ON orders (customer_id)\n     WHERE status = \'pending\';\n\n-- (2)\nIndex Scan using orders_pending_idx on orders  (actual rows=0 loops=1)\n  Index Cond: (customer_id = 500)',
  choices: [
    'pending の行だけを含む部分インデックスが使われ、status の条件で行を読み捨てる処理がなくなった',
    '部分インデックスは全行を含むため、(1) で使ったインデックスより大きなインデックスが使われている',
    'status 列のインデックスが使われ、customer_id の条件は Filter で評価されている',
    '作成した部分インデックスは、WHERE 句に status の条件がない問い合わせでも同じように使われる',
    'Bitmap Heap Scan は必ず Index Scan より遅いため、計画が改善した'
  ],
  answer: 0,
  exp: 'CREATE INDEX ... WHERE status = \'pending\' は、条件を満たす行だけを対象にした部分インデックスです。全体の 1% しか含まないため小さく、更新時の維持コストも抑えられます。\n(1) では customer_id のインデックスで候補を集めてから、テーブルを読んで status の条件で読み捨てていました（Filter / Rows Removed by Filter）。(2) では部分インデックス自体が status = \'pending\' の行しか持たないため、Index Cond だけで済み、Filter がなくなっています。\n部分インデックスは、問い合わせの WHERE 句がインデックスの条件を含意すると判断できる場合にしか使われません。status の条件がない問い合わせでは使えません。\nBitmap Heap Scan と Index Scan の優劣は、該当行数などによって変わります。\nこの計画は PostgreSQL 14 で実際に採取したものです。',
  refs: [
    ['部分インデックス', 'indexes-partial.html'],
    ['EXPLAIN の使用', 'using-explain.html']
  ]
},
{
  id: 'G3.2-020', level: 'gold', cat: 'G3.2', type: 'scenario',
  q: '次の操作を行い、pg_settings を確認した。説明として適切なものを2つ選びなさい。',
  code: '=# ALTER SYSTEM SET shared_buffers = \'256MB\';\n=# ALTER SYSTEM SET work_mem = \'8MB\';\n=# SELECT pg_reload_conf();\n\n=# SELECT name, setting, unit, context, pending_restart FROM pg_settings\n     WHERE name IN (\'shared_buffers\', \'work_mem\', \'max_connections\', \'log_lock_waits\');\n      name       | setting | unit |  context   | pending_restart\n-----------------+---------+------+------------+-----------------\n log_lock_waits  | on      |      | superuser  | f\n max_connections | 100     |      | postmaster | f\n shared_buffers  | 16384   | 8kB  | postmaster | t\n work_mem        | 8192    | kB   | user       | f',
  choices: [
    'shared_buffers は再読み込みでは反映されず、サーバの再起動を待っている状態である',
    'work_mem は再読み込みで 8MB（8192 kB）に反映されている',
    'shared_buffers の現在値は、すでに 256MB になっている',
    'max_connections は、SET コマンドでセッション単位に変更できる',
    'log_lock_waits は、一般ユーザが自分のセッションで SET により変更できる'
  ],
  answer: [0, 1],
  exp: 'pg_settings の setting は unit を単位とした現在値です。shared_buffers は 16384 × 8kB = 128MB のままで、context が postmaster（起動時にしか変更できない）のため、再読み込みしても反映されず pending_restart が t になっています。\nwork_mem は context が user なので再読み込みで反映され、8192 kB = 8MB になっています。\nmax_connections も postmaster なので、SET では変更できず、再起動が必要です。\nlog_lock_waits の context は superuser で、一般ユーザは SET で変更できません。\nこの結果は PostgreSQL 14 で実際に採取したものです。',
  refs: [
    ['pg_settings', 'view-pg-settings.html'],
    ['ALTER SYSTEM', 'sql-altersystem.html']
  ]
},

);
