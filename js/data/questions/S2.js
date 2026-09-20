/*
 * Silver S2 運用管理（124問）
 * PostgreSQL 14 文書に基づくオリジナル問題。形式は DEVELOPMENT.md を参照。
 * tools/format.js で整形しています（node tools/format.js）。
 */
(window.PGQ_QUESTIONS = window.PGQ_QUESTIONS || []).push(

/* ---------------- S2.1 インストール方法（重要度 2 / 13問） ---------------- */
{
  id: 'S2.1-001', level: 'silver', cat: 'S2.1',
  q: '`initdb` で作成した直後のデータベースクラスタに存在するデータベースの組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'postgres、template0、template1',
    'postgres、template1',
    'template0、template1',
    'postgres のみ',
    'postgres、template0、template1、public'
  ],
  answer: 0,
  exp: 'initdb はデータベースクラスタを初期化し、template1（CREATE DATABASE の既定のテンプレート）、template0（初期状態を保持する変更しないテンプレート）、postgres（ユーザやアプリケーションのための既定の接続先）の3つのデータベースを作成します。\npublic はデータベースではなく、各データベース内に作成される既定のスキーマです。',
  refs: [
    ['データベースクラスタの作成', 'creating-cluster.html'],
    ['テンプレートデータベース', 'manage-ag-templatedbs.html']
  ]
},
{
  id: 'S2.1-002', level: 'silver', cat: 'S2.1',
  q: 'テンプレートデータベースに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'CREATE DATABASE で TEMPLATE を省略すると、template0 の複製として作成される',
    'template1 に作成したテーブルは、以降に CREATE DATABASE で作成したデータベースにはコピーされない',
    'template1 と異なる符号化方式やロケールのデータベースを作成する場合は、TEMPLATE template0 を指定する',
    'template0 には通常接続して、全データベース共通のオブジェクトを追加しておく',
    'postgres データベースを削除すると、サーバが起動できなくなる'
  ],
  answer: 2,
  exp: 'CREATE DATABASE は既定で template1 を複製します。そのため template1 に追加したオブジェクトは以後作成するデータベースにもコピーされます。\ntemplate0 は initdb 直後の状態を保つためのもので変更すべきではなく、既定では接続もできません。template1 はサイト固有の設定やオブジェクトを含む可能性があり、符号化方式やロケールを変えて複製すると不整合が生じうるため、異なる符号化方式・ロケールを指定する場合は template0 を使います。\npostgres データベースはサーバの動作には必須ではありません。',
  refs: [
    ['テンプレートデータベース', 'manage-ag-templatedbs.html'],
    ['CREATE DATABASE', 'sql-createdatabase.html']
  ]
},
{
  id: 'S2.1-003', level: 'silver', cat: 'S2.1',
  q: '`initdb` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '-D オプションを省略すると、環境変数 PGDATA も参照されずにエラーとなる',
    'セキュリティ上、root ユーザ（OS の管理者）で実行することが推奨されている',
    '-E（--encoding）オプションで、テンプレートデータベースの符号化方式を指定できる',
    '--locale オプションを指定すると、OS 全体のロケール設定が変更される',
    '-U オプションで指定した名前の OS ユーザが新たに作成される'
  ],
  answer: 2,
  exp: 'initdb の -E（--encoding）はテンプレートデータベースの符号化方式を指定し、これが以後作成するデータベースの既定の符号化方式になります。--locale はデータベースクラスタのロケールを指定するもので、OS の設定は変わりません。\nデータディレクトリは -D で指定し、省略した場合は環境変数 PGDATA が使われます。\ninitdb は root では実行できず、サーバを実行する OS ユーザ（例: postgres）で実行します。-U はデータベースのスーパーユーザ名を指定するオプションで、OS ユーザは作成されません。',
  refs: [
    ['initdb', 'app-initdb.html'],
    ['データベースクラスタの作成', 'creating-cluster.html']
  ]
},
{
  id: 'S2.1-004', level: 'silver', cat: 'S2.1',
  q: '`initdb` で作成されるデータディレクトリに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'すべてのユーザが読み書きできるように、パーミッション 0777 で作成される',
    'サーバはデータディレクトリのパーミッションを確認しないため、任意の権限でよい',
    '既にファイルが存在する空でないディレクトリを指定しても、上書きして初期化される',
    '既定では所有者だけがアクセスできる権限で作成され、--allow-group-access でグループの読み取りも許可できる',
    'データディレクトリは、PostgreSQL の OS ユーザではなく root が所有する必要がある'
  ],
  answer: 3,
  exp: 'initdb はデータディレクトリを、サーバを実行する OS ユーザ（initdb を実行したユーザ）が所有し、所有者だけがアクセスできる権限（0700）で作成します。PostgreSQL 11 以降は --allow-group-access を指定すると、グループにも読み取りを許可（0750）でき、バックアップ用のユーザなどから読み取れるようになります。\nサーバは起動時にデータディレクトリの所有者と権限を確認し、不適切な場合は起動しません。\ninitdb は、指定したディレクトリが存在して空でない場合は処理を中止します。',
  refs: [
    ['データベースクラスタの作成', 'creating-cluster.html'],
    ['initdb', 'app-initdb.html']
  ]
},
{
  id: 'S2.1-005', level: 'silver', cat: 'S2.1',
  q: 'ソースコードから PostgreSQL をインストールして起動するまでの基本的な手順として、正しい順序のものを1つ選びなさい。',
  choices: [
    'configure → make → make install → initdb → pg_ctl start',
    'make → configure → initdb → make install → pg_ctl start',
    'initdb → configure → make → make install → pg_ctl start',
    'configure → initdb → make → pg_ctl start → make install',
    'make install → configure → make → pg_ctl start → initdb'
  ],
  answer: 0,
  exp: 'ソースコードからのインストールの基本的な流れは次のとおりです。\n1. ./configure でビルド環境を確認し、インストール先やオプションを設定する\n2. make でビルドする\n3. make install でインストールする\n4. サーバを実行する OS ユーザを作成し、initdb でデータベースクラスタを初期化する\n5. pg_ctl start（または postgres）でサーバを起動する\ninitdb はインストールされたプログラムの一部なので、make install より前には実行できません。',
  refs: [
    ['簡易版（インストール手順）', 'install-short.html'],
    ['インストール手順', 'install-procedure.html']
  ]
},
{
  id: 'S2.1-006', level: 'silver', cat: 'S2.1',
  q: '環境変数とその意味の組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'PGDATA: データベースクラスタのデータディレクトリ',
    'PGDATABASE: データベースクラスタのデータディレクトリ',
    'PGHOST: サーバのログファイルの出力先',
    'PGPORT: initdb で作成するスーパーユーザの名前',
    'PGUSER: 作成する OS ユーザの名前'
  ],
  answer: 0,
  exp: 'PGDATA はデータディレクトリの場所を表す環境変数で、initdb、pg_ctl、postgres で -D オプションを省略した場合に使われます。\nPGHOST（接続先のホスト）、PGPORT（ポート番号）、PGDATABASE（接続先データベース名）、PGUSER（接続するデータベースユーザ名）、PGPASSWORD などは、psql や pg_dump などの libpq を使うクライアントが接続先を決めるための環境変数です。\nこれらを設定しておくと、コマンドのオプションを毎回指定する手間を省けます。',
  refs: [
    ['環境変数（libpq）', 'libpq-envars.html'],
    ['initdb', 'app-initdb.html']
  ]
},
{
  id: 'S2.1-007', level: 'silver', cat: 'S2.1',
  q: 'データベースのロケール設定に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'LC_COLLATE（照合順序）は、ALTER DATABASE でいつでも変更できる',
    'LC_COLLATE の設定は、ORDER BY による文字列の並び順には影響しない',
    'ロケールを C にすると、日本語の文字列は格納できなくなる',
    'LC_COLLATE と LC_CTYPE はデータベースの作成時に決まり、作成後に変更することはできない',
    'lc_messages（メッセージの言語）も、データベースの作成後には変更できない'
  ],
  answer: 3,
  exp: 'initdb の --locale（または --lc-collate、--lc-ctype）や CREATE DATABASE の LC_COLLATE / LC_CTYPE で指定した照合順序と文字分類は、データベースの作成時に決まり、後から変更できません。変更したい場合は、新しいデータベースを作成してデータを移す必要があります。\nLC_COLLATE は ORDER BY での文字列の並び順や、LIKE でのインデックスの利用可否に影響します。C ロケールはバイト順で比較するため高速ですが、文字の格納可否は符号化方式（UTF8 など）で決まるため、日本語も格納できます。\nlc_messages、lc_monetary などはパラメータとして後から変更できます。',
  refs: [
    ['ロケールサポート', 'locale.html'],
    ['CREATE DATABASE', 'sql-createdatabase.html']
  ]
},
{
  id: 'S2.1-008', level: 'silver', cat: 'S2.1',
  q: '`CREATE DATABASE newdb TEMPLATE mydb;` で既存のデータベース mydb を複製する場合の説明として、正しいものを1つ選びなさい。',
  choices: [
    'mydb に他のセッションが接続していると、複製は失敗する',
    'TEMPLATE に指定できるのは template0 と template1 だけである',
    '複製元のデータベースに接続したまま実行するのが一般的である',
    'テーブルの定義だけが複製され、データは複製されない',
    '複製が完了すると、複製元の mydb は自動的に削除される'
  ],
  answer: 0,
  exp: 'CREATE DATABASE の TEMPLATE には、template0 や template1 だけでなく任意のデータベースを指定でき、テーブル定義もデータも含めたデータベース全体の複製を作成できます。テスト用に本番のコピーを作る場合などに便利です。\nただし、複製中に内容が変わらないように、複製元のデータベースに他のセッション（自分自身を含む）が接続していると「source database is being accessed by other users」というエラーで失敗します。そのため、postgres など別のデータベースに接続して実行します。',
  refs: [
    ['テンプレートデータベース', 'manage-ag-templatedbs.html'],
    ['CREATE DATABASE', 'sql-createdatabase.html']
  ]
},
{
  id: 'S2.1-009', level: 'silver', cat: 'S2.1',
  q: 'データベースの符号化方式とクライアントの符号化方式に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'サーバとクライアントの符号化方式が異なると、接続時にエラーになる',
    'サーバの符号化方式が SQL_ASCII の場合も、クライアントの符号化方式との自動変換が行われる',
    'データベースの符号化方式は、ALTER DATABASE でいつでも変更できる',
    'client_encoding はサーバ全体でしか設定できず、セッションごとに変えることはできない',
    'サーバの符号化方式と client_encoding が異なる場合、サーバとクライアントの間で文字コードが自動的に変換される'
  ],
  answer: 4,
  exp: 'データベースの符号化方式（UTF8、EUC_JP など）はデータベースの作成時に決まり、後から変更できません。一方、クライアントが使う符号化方式は client_encoding パラメータ（psql の \\encoding、環境変数 PGCLIENTENCODING など）でセッションごとに指定でき、サーバと異なる場合は PostgreSQL が自動的に文字コードを変換します。例えば UTF8 のデータベースに SJIS のクライアントから接続できます。\nSQL_ASCII は符号化方式を解釈しない特殊な設定で、変換も検証も行われないため、非 ASCII 文字を扱う場合は推奨されません。',
  refs: [
    ['文字セットサポート', 'multibyte.html'],
    ['client_encoding', 'runtime-config-client.html#GUC-CLIENT-ENCODING']
  ]
},
{
  id: 'S2.1-010', level: 'silver', cat: 'S2.1',
  q: 'PostgreSQL サーバの実行ユーザに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'セキュリティ上の理由から root では起動できず、postgres などの専用ユーザで実行する',
    'root で起動する必要があり、一般ユーザでは起動できない',
    'データディレクトリの所有者と異なるユーザでも、読み取り権限があれば起動できる',
    '実行ユーザは initdb 実行時に --user オプションで自由に指定できる',
    'Windows 版では root 相当の Administrator で起動することが推奨されている'
  ],
  answer: 0,
  exp: 'PostgreSQL のサーバプロセスは root（スーパーユーザ）では起動できません。脆弱性があった場合にシステム全体が危険にさらされるためで、起動しようとするとエラーになります。一般には postgres という専用の OS ユーザを作って実行します。\nデータディレクトリは実行ユーザが所有し、他のユーザから読み書きできない権限（0700 または 0750）である必要があります。異なるユーザでは起動できません。\ninitdb を実行した OS ユーザが、そのままデータディレクトリの所有者になります。',
  refs: [
    ['データベースクラスタの作成', 'creating-cluster.html'],
    ['データベースサーバの起動', 'server-start.html']
  ]
},
{
  id: 'S2.1-011', level: 'silver', cat: 'S2.1',
  q: 'initdb の `--data-checksums` オプションに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'データページのチェックサムを有効にし、ディスク上のデータ破損を検出できるようにする',
    'WAL のチェックサムを有効にするオプションで、指定しないと WAL の破損を検出できない',
    'バックアップファイルのチェックサムを作成するためのオプションである',
    'PostgreSQL 14 では既定で有効なため、指定しても意味はない',
    'このオプションを指定すると、データベースの読み書き性能が向上する'
  ],
  answer: 0,
  exp: 'initdb --data-checksums を指定すると、データページごとにチェックサムが付与され、ページを読み込むときに検証されます。ストレージの故障などによる静かなデータ破損を早期に検出できます。\nPostgreSQL 14 の既定は無効で、有効にすると検証の分だけわずかにオーバーヘッドが増えます。\nWAL レコードには、この設定と無関係にもともとチェックサム（CRC）が含まれています。\n有効かどうかは pg_controldata や SHOW data_checksums で確認でき、後から変更するには pg_checksums をクラスタ停止中に実行します。',
  refs: [
    ['initdb', 'app-initdb.html'],
    ['pg_checksums', 'app-pgchecksums.html']
  ]
},
{
  id: 'S2.1-012', level: 'silver', cat: 'S2.1',
  q: 'ソースコードからインストールした PostgreSQL を使う際の環境設定として、正しいものを1つ選びなさい。',
  choices: [
    'PATH にインストール先の bin を、必要に応じて LD_LIBRARY_PATH に lib を追加する',
    'PATH にインストール先の lib を、LD_LIBRARY_PATH に bin を追加する',
    'configure の --prefix で指定した場所に関わらず、コマンドは必ず /usr/bin に置かれる',
    '環境変数 PGDATA を設定すると、そのディレクトリが自動的に initdb される',
    '環境変数の設定は不要で、インストール後は再起動するだけで利用できる'
  ],
  answer: 0,
  exp: 'configure の --prefix で指定した場所（既定は /usr/local/pgsql）の下に bin、lib、share などが作られます。psql や pg_ctl を使うには PATH に <prefix>/bin を追加し、共有ライブラリを見つけられるよう必要に応じて LD_LIBRARY_PATH に <prefix>/lib を追加します。\nPGDATA はデータディレクトリの既定値を与える環境変数で、initdb や pg_ctl で -D の指定を省略できるようになります。設定しただけでクラスタが作成されるわけではありません。\nこのほか PGPORT、PGUSER、PGDATABASE などを設定しておくと、クライアントの接続時の指定を省けます。',
  refs: [
    ['インストール手順', 'install-procedure.html'],
    ['環境変数', 'libpq-envars.html']
  ]
},
{
  id: 'S2.1-013', level: 'silver', cat: 'S2.1',
  q: '`pg_ctl` のオプションに関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    '`-w` を指定すると、起動や停止の完了を待たずに制御が戻る',
    '`-t` は、完了を待つ秒数の上限を指定する',
    '`-D` はデータディレクトリを指定し、環境変数 PGDATA で代用できる',
    '`-l` は、サーバの標準出力と標準エラー出力を追記するファイルを指定する',
    '`-o` は、postgres コマンドに渡すオプションを指定する'
  ],
  answer: 0,
  exp: '`-w`（--wait）は起動や停止の完了を「待つ」オプションです。待たないのは `-W`（--no-wait）の方で、説明が逆です。PostgreSQL 10 以降、start / stop / restart では待つのが既定の動作になっています。\n`-t`（--timeout）は待ち時間の上限（既定 60 秒）です。\n`-D` はデータディレクトリの指定で、環境変数 PGDATA を設定していれば省略できます。\n`-l` は出力の記録先ファイル、`-o` は postgres に渡す追加オプション（例: `-o "-p 5433"`）です。',
  refs: [
    ['pg_ctl', 'app-pg-ctl.html'],
    ['データベースサーバの起動', 'server-start.html']
  ]
},

/* ---------------- S2.2 標準付属ツールの使い方（重要度 5 / 24問） ---------------- */
{
  id: 'S2.2-001', level: 'silver', cat: 'S2.2',
  q: '`pg_ctl stop` で `-m` オプションを省略した場合に使用される停止モードを1つ選びなさい。',
  choices: [
    'smart',
    'fast',
    'immediate',
    'normal',
    'abort'
  ],
  answer: 1,
  exp: 'pg_ctl stop のシャットダウンモードは smart / fast / immediate の3種類で、既定は fast です（PostgreSQL 9.5 で smart から変更）。\n・smart: 新規接続を拒否し、既存のクライアントがすべて切断するのを待つ\n・fast: クライアントの切断を待たず、実行中のトランザクションをロールバックして正常に停止する\n・immediate: すべてのサーバプロセスを即座に終了する（次回起動時にクラッシュリカバリが行われる）\nnormal や abort というモードはありません。',
  refs: [
    ['pg_ctl', 'app-pg-ctl.html'],
    ['サーバのシャットダウン', 'server-shutdown.html']
  ]
},
{
  id: 'S2.2-002', level: 'silver', cat: 'S2.2',
  q: 'psql で、データベースクラスタ内のデータベース一覧を表示するメタコマンドを1つ選びなさい。',
  choices: [
    '\\d',
    '\\dn',
    '\\l',
    '\\du',
    '\\dt'
  ],
  answer: 2,
  exp: '\\l（\\list）はデータベースの一覧を、名前・所有者・符号化方式・アクセス権限などとともに表示します。\n\\d はテーブルなどのリレーション一覧（名前を指定すると定義）、\\dn はスキーマ一覧、\\du はロール一覧、\\dt はテーブル一覧を表示します。',
  refs: [
    ['psql（メタコマンド）', 'app-psql.html']
  ]
},
{
  id: 'S2.2-003', level: 'silver', cat: 'S2.2',
  q: '最新のチェックポイントの位置やデータベースクラスタの状態（稼働中・停止済みなど）といった、pg_control に格納された制御情報を表示するコマンドを1つ選びなさい。',
  choices: [
    'pg_config',
    'pg_controldata',
    'pg_isready',
    'pg_resetwal',
    'pg_ctl status'
  ],
  answer: 1,
  exp: 'pg_controldata はデータディレクトリの global/pg_control に格納された制御情報（カタログバージョン、クラスタの状態、最新チェックポイントの位置や時刻、WAL の情報など）を表示します。サーバの停止中でも実行できます。\npg_config はインストールされた PostgreSQL の構成情報（ディレクトリの場所やコンパイルオプション）、pg_isready は接続受付状態の確認、pg_resetwal は WAL と制御情報の初期化、pg_ctl status はサーバが稼働中かどうかの確認に使います。',
  refs: [
    ['pg_controldata', 'app-pgcontroldata.html'],
    ['pg_config', 'app-pgconfig.html']
  ]
},
{
  id: 'S2.2-004', level: 'silver', cat: 'S2.2',
  q: '`pg_isready` の終了ステータスが 2 であった場合の意味として、正しいものを1つ選びなさい。',
  choices: [
    'サーバは接続を受け付けている',
    'サーバは稼働しているが、起動処理中などのため接続を拒否している',
    'サーバから応答がなかった',
    '不正なパラメータが指定されたため、接続を試行しなかった',
    '接続は受け付けられたが、パスワード認証に失敗した'
  ],
  answer: 2,
  shuffle: false,
  exp: 'pg_isready はサーバの接続受付状態を確認するコマンドで、終了ステータスは次のとおりです。\n・0: 接続を受け付けている\n・1: 接続を拒否している（起動処理中など）\n・2: 接続の試行に対して応答がなかった\n・3: 接続を試行しなかった（不正なパラメータなど）\npg_isready は実際にログインするわけではないため、有効なユーザ名やパスワードは必要なく、認証の成否は判定しません。',
  refs: [
    ['pg_isready', 'app-pg-isready.html']
  ]
},
{
  id: 'S2.2-005', level: 'silver', cat: 'S2.2',
  q: '`createdb` および `dropdb` コマンドに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'createdb は、サーバが停止していてもデータディレクトリに直接データベースを作成できる',
    'createdb でデータベース名を省略すると、template1 という名前のデータベースが作成される',
    'createdb は SQL の CREATE DATABASE を実行するラッパーであり、サーバに接続して処理を行う',
    'dropdb は、対象データベースに接続中のセッションがあっても、オプションなしで常に削除できる',
    'createdb で作成したデータベースは、CREATE DATABASE で作成したものとは内部形式が異なる'
  ],
  answer: 2,
  exp: 'createdb は CREATE DATABASE を、dropdb は DROP DATABASE を実行するラッパーコマンドで、どちらも稼働中のサーバに接続して実行します。そのため、作成されるデータベースは SQL で作成した場合と同じです。\ncreatedb でデータベース名を省略すると、接続に使用するユーザ名と同じ名前のデータベースを作成します。\n他のセッションが接続しているデータベースは削除できません。PostgreSQL 13 以降は dropdb --force（DROP DATABASE ... WITH (FORCE)）で接続を終了させて削除できます。',
  refs: [
    ['createdb', 'app-createdb.html'],
    ['dropdb', 'app-dropdb.html']
  ]
},
{
  id: 'S2.2-006', level: 'silver', cat: 'S2.2',
  q: 'psql のメタコマンドに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '\\x は、テーブル定義を XML 形式で表示する',
    '\\q は、現在の問い合わせバッファの内容を消去する',
    '\\c は接続情報を表示するだけで、接続先のデータベースは変更できない',
    '\\timing は、SQL 文の実行にかかった時間を表示するかどうかを切り替える',
    '\\i は、インデックスの一覧を表示する'
  ],
  answer: 3,
  exp: '\\timing は各 SQL 文の所要時間の表示を切り替えます。\n\\x は拡張表示モード（1列1行の縦長表示）の切り替え、\\q は psql の終了です（問い合わせバッファの消去は \\r）。\n\\c（\\connect）は新しいデータベースやユーザで接続し直すコマンドで、現在の接続情報の表示は \\conninfo です。\n\\i はファイルからコマンドを読み込んで実行するメタコマンドで、インデックスの一覧は \\di で表示します。',
  refs: [
    ['psql（メタコマンド）', 'app-psql.html']
  ]
},
{
  id: 'S2.2-007', level: 'silver', cat: 'S2.2',
  q: '`pg_ctl reload` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'サーバを停止してから再び起動する',
    '接続中のすべてのセッションを切断してから設定を読み込む',
    'pg_ctl restart と同じ動作をする',
    'postgresql.conf は再読み込みされるが、pg_hba.conf は再読み込みされない',
    'postmaster に SIGHUP を送り、サーバを止めずに設定ファイルを再読み込みさせる'
  ],
  answer: 4,
  exp: 'pg_ctl reload は postmaster に SIGHUP シグナルを送り、postgresql.conf、pg_hba.conf、pg_ident.conf などの設定ファイルを再読み込みさせます。サーバは停止せず、既存のセッションも切断されません。SQL では pg_reload_conf() 関数で同じことができます。\nただし shared_buffers のようにサーバ起動時にしか設定できない（postmaster コンテキストの）パラメータは、再読み込みでは反映されず、pg_ctl restart による再起動が必要です。',
  refs: [
    ['pg_ctl', 'app-pg-ctl.html'],
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html']
  ]
},
{
  id: 'S2.2-008', level: 'silver', cat: 'S2.2',
  q: 'psql で SQL ファイル setup.sql を実行し、途中でエラーが発生したらその時点で処理を中止させたい。正しいコマンドを1つ選びなさい。',
  choices: [
    'psql -f setup.sql -v ON_ERROR_STOP=1',
    'psql -c setup.sql --stop-on-error',
    'psql -i setup.sql -e',
    'psql -F setup.sql -x',
    'psql -s setup.sql -v STOP=error'
  ],
  answer: 0,
  exp: 'psql の -f（--file）はファイルからコマンドを読み込んで実行するオプションです。既定ではエラーが発生しても次のコマンドの実行を続けますが、psql 変数 ON_ERROR_STOP を設定する（-v ON_ERROR_STOP=1、または \\set ON_ERROR_STOP on）と、エラーの時点で処理を中止し、終了ステータス 3 で終了します。\n-1（--single-transaction）を併用すると、ファイル全体を1つのトランザクションとして実行できます。\n-c は1つのコマンド文字列を実行、-e は送信した問い合わせを表示、-F はフィールド区切り文字の指定、-x は拡張表示、-s はシングルステップモードです。',
  refs: [
    ['psql（オプション・変数）', 'app-psql.html']
  ]
},
{
  id: 'S2.2-009', level: 'silver', cat: 'S2.2',
  q: 'パスワードを対話的に入力して設定し、データベース作成権限（CREATEDB）を持つロール alice を作成するコマンドとして、正しいものを1つ選びなさい。',
  choices: [
    'createuser -d -P alice',
    'createuser -s -W alice',
    'createuser -D -p alice',
    'createuser -r -e alice',
    'createuser -c alice'
  ],
  answer: 0,
  exp: 'createuser は CREATE ROLE を実行するラッパーコマンドです。主なオプションは次のとおりです。\n・-d（--createdb）: データベース作成権限を付与する（-D は付与しない）\n・-P（--pwprompt）: 新しいロールのパスワードを対話的に入力する\n・-s（--superuser）: スーパーユーザにする\n・-r（--createrole）: ロール作成権限を付与する\n・-c（--connection-limit）: 接続数の上限を指定する\n・-W: 接続時にパスワードの入力を求める（作成するロールのパスワードではない）\n・-p: 接続先のポート番号、-e: 実行する SQL を表示',
  refs: [
    ['createuser', 'app-createuser.html']
  ]
},
{
  id: 'S2.2-010', level: 'silver', cat: 'S2.2',
  q: '`pg_ctl status` の説明として、正しいものを1つ選びなさい。',
  choices: [
    '接続中のクライアントの一覧を表示する',
    'データベースクラスタ内のデータベースの一覧を表示する',
    'サーバが停止している場合は、自動的にサーバを起動する',
    'サーバが稼働しているかどうかを確認し、稼働中なら PID と起動時のコマンドラインを表示する',
    'postgresql.conf の記述に誤りがないかを検査する'
  ],
  answer: 3,
  exp: 'pg_ctl status は、-D（または PGDATA）で指定したデータディレクトリのサーバが稼働しているかを確認します。稼働中の場合は postmaster のプロセス ID と、起動時に使われたコマンドラインを表示し、停止している場合は「no server running」と表示します。終了ステータスは稼働中なら 0、停止中なら 3 です。\n接続中のクライアントは pg_stat_activity、データベースの一覧は psql の \\l で確認します。サーバが接続を受け付けているかを確認するには pg_isready も使えます。',
  refs: [
    ['pg_ctl', 'app-pg-ctl.html'],
    ['pg_isready', 'app-pg-isready.html']
  ]
},
{
  id: 'S2.2-011', level: 'silver', cat: 'S2.2',
  q: 'psql で、関数の一覧を表示するメタコマンドとして正しいものを1つ選びなさい。',
  choices: [
    '\\df',
    '\\dv',
    '\\di',
    '\\dn',
    '\\dT'
  ],
  answer: 0,
  exp: 'psql の \\d で始まるメタコマンドは、オブジェクトの種類ごとに一覧を表示します。\n・\\df: 関数（プロシージャを含む）\n・\\dv: ビュー\n・\\di: インデックス\n・\\dn: スキーマ\n・\\dT: データ型\n・\\dt: テーブル、\\ds: シーケンス、\\du: ロール\n末尾に + を付ける（\\df+ など）と、より詳細な情報が表示されます。関数の定義を表示するには \\sf 関数名 を使います。',
  refs: [
    ['psql（メタコマンド）', 'app-psql.html']
  ]
},
{
  id: 'S2.2-012', level: 'silver', cat: 'S2.2',
  q: 'psql のメタコマンド `\\o result.txt` の説明として、正しいものを1つ選びなさい。',
  choices: [
    'result.txt に書かれた SQL を読み込んで実行する',
    '以降に実行した問い合わせの結果を、画面ではなく result.txt に出力する',
    '直前の問い合わせの結果だけを result.txt に出力し、以降は画面に戻る',
    'result.txt をエディタで開いて編集する',
    'データベースの内容をダンプして result.txt に保存する'
  ],
  answer: 1,
  exp: '\\o ファイル名 を実行すると、以降の問い合わせの結果が指定したファイルに出力されます。引数を付けずに \\o を実行すると、出力先が標準出力（画面）に戻ります。| で始めるとコマンドにパイプすることもできます。\n1回の問い合わせだけをファイルに出力したい場合は、問い合わせを入力した後に \\g ファイル名 を使います。\nファイルの SQL を実行するのは \\i、エディタで問い合わせバッファを編集するのは \\e です。',
  refs: [
    ['psql（メタコマンド）', 'app-psql.html']
  ]
},
{
  id: 'S2.2-013', level: 'silver', cat: 'S2.2',
  q: 'psql の起動時の設定ファイルに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'psql は起動時にサーバの postgresql.conf を読み込んで、表示の設定を決める',
    'psql の -X オプションは、拡張表示モードで起動するためのオプションである',
    '~/.psqlrc はサーバ側のデータディレクトリに置く設定ファイルである',
    'psql は起動時にホームディレクトリの ~/.psqlrc を読み込み、-X（--no-psqlrc）を指定すると読み込まない',
    '~/.psqlrc には、SQL 文やメタコマンドを記述することはできない'
  ],
  answer: 3,
  exp: 'psql は起動時に、システム全体の psqlrc と、ユーザのホームディレクトリの ~/.psqlrc（Windows では %APPDATA%\\postgresql\\psqlrc.conf）を読み込んで実行します。ここに \\set や \\pset、\\timing on などのメタコマンドや SQL を書いておくと、毎回の設定を省けます。\n-X（--no-psqlrc）を指定すると、これらのファイルを読み込まずに起動します。スクリプトから psql を実行する場合に、個人の設定の影響を避けるために使われます。拡張表示で起動するオプションは -x です。',
  refs: [
    ['psql（ファイル）', 'app-psql.html']
  ]
},
{
  id: 'S2.2-014', level: 'silver', cat: 'S2.2',
  q: 'パスワードファイル `.pgpass` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'サーバのデータディレクトリに置き、ユーザごとのパスワードを定義する',
    '~/.pgpass に「ホスト:ポート:DB:ユーザ:パスワード」を書き、権限を 0600 にする',
    'グループや他のユーザが読める権限（0644 など）でも、問題なく使用される',
    'パスワードの指定には、.pgpass よりも環境変数 PGPASSWORD の使用が推奨されている',
    '.pgpass は psql 専用で、pg_dump などの他のクライアントからは使われない'
  ],
  answer: 1,
  exp: '.pgpass は libpq を使うクライアント（psql、pg_dump、pg_basebackup など）が、パスワードの入力を省略するためのファイルです。Unix ではホームディレクトリの ~/.pgpass に、hostname:port:database:username:password の形式で1行ずつ記述します（* はワイルドカード）。\nUnix では、グループや他者がアクセスできる権限の場合は無視されるため、chmod 0600 ~/.pgpass とします。\n環境変数 PGPASSWORD は、他のユーザからプロセスの環境変数が見える OS があるため、使用は推奨されていません。',
  refs: [
    ['パスワードファイル', 'libpq-pgpass.html'],
    ['環境変数（libpq）', 'libpq-envars.html']
  ]
},
{
  id: 'S2.2-015', level: 'silver', cat: 'S2.2',
  q: '`pg_config` コマンドに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '稼働中のサーバのパラメータを変更するコマンドである',
    'postgresql.conf の内容を一覧表示するコマンドである',
    'インストール時の構成情報を表示し、サーバが停止していても実行できる',
    '実行するには、稼働中のデータベースサーバに接続できる必要がある',
    'データベースクラスタのデータディレクトリの場所を表示する'
  ],
  answer: 2,
  exp: 'pg_config は、インストールされている PostgreSQL の構成情報を表示するコマンドです。--bindir（実行ファイルの場所）、--libdir、--includedir、--configure（configure 時のオプション）、--version などのオプションで個別の値を取得でき、拡張モジュールをビルドする際などに使われます。\nインストール時の情報を表示するだけなので、サーバに接続する必要はなく、サーバの稼働状態にも関係しません。データディレクトリの場所はインストールではなく initdb で決まるため、pg_config では表示されません。',
  refs: [
    ['pg_config', 'app-pgconfig.html']
  ]
},
{
  id: 'S2.2-016', level: 'silver', cat: 'S2.2',
  q: 'psql の表示に関するメタコマンドの説明として、正しいものを1つ選びなさい。',
  choices: [
    '`\\x` は拡張表示の切り替えで、列数が多い結果を1行ずつ縦に並べて表示できる',
    '`\\x` は問い合わせ結果を XML 形式で出力するメタコマンドである',
    '`\\timing` は問い合わせの実行計画を表示する',
    '`\\pset` で変更した表示形式は、psql を終了しても次回の起動時まで保存される',
    '`\\x auto` は指定できず、on か off のいずれかしか設定できない'
  ],
  answer: 0,
  exp: '\\x は拡張表示（expanded display）の切り替えで、1行を「列名 | 値」の形で縦に並べて表示します。列数の多いテーブルや pg_stat_activity のようなビューを見るときに便利です。\\x auto を指定すると、端末の幅に収まらないときだけ自動的に拡張表示になります。\n\\timing は各問い合わせの実行時間をミリ秒で表示する切り替えです。実行計画は EXPLAIN で確認します。\n表示形式は \\pset で細かく指定できますが、設定はセッション限りです。毎回適用したい場合は ~/.psqlrc に書いておきます。',
  refs: [
    ['psql', 'app-psql.html']
  ]
},
{
  id: 'S2.2-017', level: 'silver', cat: 'S2.2',
  q: 'psql のメタコマンド `\\d` と `\\d+` の違いとして、正しいものを1つ選びなさい。',
  choices: [
    '`\\d+` はテーブルのサイズや説明、格納方式など、より詳しい情報も表示する',
    '`\\d+` はシステムカタログのテーブルだけを表示する',
    '`\\d+` は複数のデータベースにまたがるオブジェクトを表示する',
    '`\\d` はテーブル名を指定できず、一覧表示しかできない',
    '`\\d テーブル名` を実行すると、そのテーブルの全行が表示される'
  ],
  answer: 0,
  exp: '\\d にオブジェクト名を指定すると、そのテーブルの列、型、NULL 可否、既定値、インデックス、制約などが表示されます。名前を省略するとテーブル・ビュー・シーケンスの一覧になります。\n末尾に + を付けた \\d+ は、それに加えてテーブルのサイズ、列の格納方式（storage）、統計目標、コメント（説明）などを表示します。\\dt+ や \\di+ のように、他のメタコマンドでも同様です。\nシステムカタログを含めて表示したい場合は、\\dS のように S を付けます。',
  refs: [
    ['psql', 'app-psql.html'],
    ['システムカタログ', 'catalogs.html']
  ]
},
{
  id: 'S2.2-018', level: 'silver', cat: 'S2.2',
  q: 'データベースに接続せずにコマンドラインからインデックスの再構築を行うツールとして、正しいものを1つ選びなさい。',
  choices: [
    'clusterdb',
    'vacuumdb',
    'createdb',
    'pg_config',
    'reindexdb'
  ],
  answer: 4,
  shuffle: false,
  exp: 'reindexdb は REINDEX コマンドをコマンドラインから実行するためのラッパーで、-a（全データベース）、-s（システムカタログ）、-t（テーブル指定）、-j（並列）などのオプションがあります。\nclusterdb は CLUSTER、vacuumdb は VACUUM や ANALYZE を実行するラッパーです。\ncreatedb は CREATE DATABASE、dropdb は DROP DATABASE に対応します。\npg_config はインストール時の構成情報（インストール先やコンパイルオプション）を表示するツールです。\nこれらはいずれも内部で psql と同じようにサーバへ接続して SQL を実行します。',
  refs: [
    ['reindexdb', 'app-reindexdb.html'],
    ['clusterdb', 'app-clusterdb.html']
  ]
},
{
  id: 'S2.2-019', level: 'silver', cat: 'S2.2',
  q: 'psql の接続に関するオプションの説明として、正しいものを1つ選びなさい。',
  choices: [
    '`-h` は接続先ホスト、`-p` はポート番号、`-U` はロール名、`-d` はデータベース名を指定する',
    '`-h` はヘルプの表示、`-p` はパスワード、`-U` は UTF-8 指定、`-d` はデバッグモードを意味する',
    '`-U` を省略した場合、必ず postgres というロールで接続される',
    '`-d` を省略するとデータベースに接続されず、メタコマンドだけが使用できる',
    '接続先を指定する方法は個別のオプションだけで、接続文字列を渡すことはできない'
  ],
  answer: 0,
  exp: 'psql の主な接続オプションは、-h（ホストまたはソケットディレクトリ）、-p（ポート番号）、-U（接続するロール名）、-d（データベース名）です。それぞれ環境変数 PGHOST、PGPORT、PGUSER、PGDATABASE で既定値を与えることもできます。\n-U を省略すると、OS のログインユーザ名が既定のロール名として使われます。-d を省略した場合はロール名と同じ名前のデータベースに接続しようとします。\n`psql "postgresql://user@host:5432/dbname"` のような接続文字列（URI 形式）を渡すこともできます。',
  refs: [
    ['psql', 'app-psql.html'],
    ['接続文字列', 'libpq-connect.html#LIBPQ-CONNSTRING']
  ]
},
{
  id: 'S2.2-020', level: 'silver', cat: 'S2.2',
  q: 'psql のメタコマンドに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '`\\c dbname` で接続先データベースを切り替えられ、`\\conninfo` で現在の接続情報を確認できる',
    '`\\c dbname` は psql をいったん終了するため、切り替えには再起動が必要である',
    '`\\i file.sql` はファイルの内容を表示するだけで、実行はしない',
    '`\\q` は直前の問い合わせを取り消すメタコマンドである',
    '`\\?` は SQL コマンドの構文を表示するメタコマンドである'
  ],
  answer: 0,
  exp: '\\c（\\connect）は psql を終了せずに接続先のデータベースやロールを切り替えるメタコマンドです。\\conninfo を実行すると、現在つないでいるデータベース名、ロール、ホスト、ポートが表示されます。\n\\i はファイルに書かれた SQL を読み込んで実行します（\\ir は実行中のスクリプトからの相対パスで解釈します）。\n\\q は psql を終了します。\nメタコマンドの一覧は \\?、SQL コマンドの構文は \\h（\\help）で確認できます。',
  refs: [
    ['psql', 'app-psql.html']
  ]
},
{
  id: 'S2.2-021', level: 'silver', cat: 'S2.2',
  q: 'psql のメタコマンドに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    '`\\copy` はクライアント側のファイルを読み書きするため、サーバのファイル権限を必要としない',
    '`\\watch 5` は、直前に実行した問い合わせを5秒ごとに繰り返し実行する',
    '`\\copy` はサーバ上のファイルを読み書きするため、スーパーユーザ権限が必要である',
    '`\\watch` は問い合わせの実行計画を繰り返し表示するメタコマンドである',
    '`\\copy` で読み込めるのは CSV 形式だけである'
  ],
  answer: [0, 1],
  exp: 'SQL の COPY はサーバのファイルシステムを読み書きするため、スーパーユーザまたは pg_read_server_files などの権限が必要です。psql の \\copy はクライアント側でファイルを読み書きして中身をやり取りするため、こうした権限は不要です。\n\\watch 秒数 は直前の問い合わせを指定間隔で繰り返し実行するメタコマンドで、pg_stat_activity を定期的に眺めるといった監視に便利です（Ctrl+C で停止）。\n\\copy も COPY と同じく、text（既定）、CSV、binary の形式を扱えます。',
  refs: [
    ['psql', 'app-psql.html'],
    ['COPY', 'sql-copy.html']
  ]
},
{
  id: 'S2.2-022', level: 'silver', cat: 'S2.2', type: 'scenario',
  q: 'psql で `\\d+ orders` を実行した結果の一部が次のとおりだった（一部の列を省略）。読み取れることとして、適切なものを2つ選びなさい。',
  code: '                 Table "public.orders"\n   Column    |           Type           | Nullable | Storage\n-------------+--------------------------+----------+----------\n id          | bigint                   | not null | plain\n customer_id | integer                  | not null | plain\n status      | text                     | not null | extended\n note        | text                     |          | extended\nIndexes:\n    "orders_pkey" PRIMARY KEY, btree (id)\n    "orders_customer_id_idx" btree (customer_id)\nForeign-key constraints:\n    "orders_customer_id_fkey" FOREIGN KEY (customer_id)\n        REFERENCES customers(id)\nAccess method: heap\nOptions: autovacuum_enabled=off',
  choices: [
    'orders テーブルは、テーブル単位の設定で自動バキュームの対象から外されている',
    'customer_id 列には、customers テーブルを参照する外部キー制約がある',
    'status 列は plain で格納されるため、TOAST に退避されることはない',
    'orders_customer_id_idx は一意インデックスなので、customer_id は重複できない',
    'note 列には NOT NULL 制約があるため、NULL を格納できない'
  ],
  answer: [0, 1],
  exp: '\\d+ はテーブルの列・インデックス・制約に加えて、格納方式（Storage）や格納パラメータ（Options）を表示します。\n「Options: autovacuum_enabled=off」は ALTER TABLE ... SET (autovacuum_enabled = off) で自動バキュームを無効にしていることを示します。この状態で更新を続けると不要タプルがたまり続けるため、手動の VACUUM が必要です。\nForeign-key constraints に customers(id) を参照する制約が表示されています。\nstatus と note の Storage は extended（圧縮と TOAST への退避を許可）です。\norders_customer_id_idx は UNIQUE と表示されていないので、一意インデックスではありません（一意なら「UNIQUE, btree」と表示されます）。\nnote の Nullable 欄は空なので NULL を格納できます。',
  refs: [
    ['psql', 'app-psql.html'],
    ['格納パラメータ', 'sql-createtable.html#SQL-CREATETABLE-STORAGE-PARAMETERS'],
    ['TOAST', 'storage-toast.html']
  ]
},
{
  id: 'S2.2-023', level: 'silver', cat: 'S2.2', type: 'scenario',
  q: 'サーバの状態を確認するコマンドを実行し、次の結果を得た。説明として適切なものを2つ選びなさい。',
  code: '$ pg_isready -p 5432; echo "exit=$?"\n/run/postgresql:5432 - accepting connections\nexit=0\n\n$ pg_isready -p 5999; echo "exit=$?"\n/run/postgresql:5999 - no response\nexit=2\n\n$ pg_ctl -D /var/lib/pgsql/14/primary status\npg_ctl: server is running (PID: 6059)\n/usr/pgsql-14/bin/postgres "-D" "/var/lib/pgsql/14/primary"',
  choices: [
    'ポート 5432 のサーバは接続を受け付けており、5999 では応答するサーバが見つからなかった',
    'pg_ctl status で、稼働中の postmaster の PID と起動時のコマンドラインが分かる',
    'pg_isready の終了ステータス 2 は、パスワード認証に失敗したことを表す',
    'pg_isready は実際にデータベースへログインして SQL を実行し、応答を確認している',
    'pg_ctl status はデータディレクトリを指定しなくても、すべてのサーバの状態を表示する'
  ],
  answer: [0, 1],
  exp: 'pg_isready は接続の受け付け状況だけを確認するツールで、終了ステータスは 0 が「接続を受け付けている」、1 が「起動処理中などで拒否している」、2 が「応答がない」、3 が「パラメータの誤りなどで試行していない」です。認証までは行わないため、ユーザ名やパスワードが正しくなくても 0 を返します。\npg_ctl status は、-D（または PGDATA）で指定したデータディレクトリの postmaster.pid を調べ、稼働中なら PID と起動時のコマンドラインを表示します。対象はそのデータディレクトリのサーバだけです。\nこれらの出力は PostgreSQL 14 で実際に採取したものです。',
  refs: [
    ['pg_isready', 'app-pg-isready.html'],
    ['pg_ctl', 'app-pg-ctl.html']
  ]
},
{
  id: 'S2.2-024', level: 'silver', cat: 'S2.2', type: 'scenario',
  q: 'ロール bob が存在する状態で、次のコマンドを順に実行した。出力から読み取れる dropuser の説明として、適切なものを2つ選びなさい。',
  code: '$ dropuser -e bob\nSELECT pg_catalog.set_config(\'search_path\', \'\', false);\nDROP ROLE bob;\n$ dropuser -e bob\nSELECT pg_catalog.set_config(\'search_path\', \'\', false);\nDROP ROLE bob;\ndropuser: error: removal of role "bob" failed: ERROR:  role "bob" does not exist\n$ echo $?\n1\n$ dropuser -e --if-exists bob\nNOTICE:  role "bob" does not exist, skipping\nSELECT pg_catalog.set_config(\'search_path\', \'\', false);\nDROP ROLE IF EXISTS bob;\n$ echo $?\n0',
  choices: [
    'dropuser は SQL の DROP ROLE を実行するコマンドで、-e を付けると実行する SQL が表示される',
    '--if-exists を付けると、ロールが存在しない場合もエラーにならず、終了ステータスは 0 になる',
    '存在しないロールを指定した場合、dropuser は何もせずに終了し、終了ステータスは 0 になる',
    'dropuser はロールを削除するときに、同じ名前の OS のユーザアカウントも削除する',
    'dropuser はロールを削除する前に、そのロールが所有するテーブルなども自動的に削除する'
  ],
  answer: [0, 1],
  exp: 'dropuser は DROP ROLE を実行するラッパーです。-e（--echo）を付けると、サーバに送る SQL が表示されます。出力の DROP ROLE bob; がそれです。\n2回目はロールがすでに存在しないため、DROP ROLE がエラーになり、終了ステータスは 1 です。--if-exists を付けると DROP ROLE IF EXISTS が実行され、NOTICE が出るだけで終了ステータスは 0 になります。\n削除するのはデータベースのロールだけで、OS のユーザには関係しません。また、DROP ROLE はロールが所有するオブジェクトを削除しないため、オブジェクトを所有しているロールは、REASSIGN OWNED や DROP OWNED で処理してからでないと削除できません。\n対になるコマンドとして、ロールを作成する createuser があります。',
  refs: [
    ['dropuser', 'app-dropuser.html'],
    ['createuser', 'app-createuser.html'],
    ['DROP ROLE', 'sql-droprole.html']
  ]
},

/* ---------------- S2.3 設定ファイル（重要度 5 / 30問） ---------------- */
{
  id: 'S2.3-001', level: 'silver', cat: 'S2.3',
  q: '`pg_hba.conf` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '記述された行のうち、条件が最も具体的な行が優先して適用される',
    'ファイルの変更を反映するには、必ずサーバの再起動が必要である',
    '接続タイプ・データベース・ユーザ・アドレスが一致する最初の行の認証方式が使用され、以降の行は評価されない',
    '一致する行がない場合は trust とみなされ、接続が許可される',
    '認証方式に trust を指定した場合でも、パスワードの入力が求められる'
  ],
  answer: 2,
  exp: 'pg_hba.conf は先頭から順に評価され、接続タイプ・データベース名・ユーザ名・クライアントアドレスが一致した最初の行が使われます。その行で認証に失敗しても後続の行は評価されません。一致する行がなければ接続は拒否されます。\nファイルは起動時と、サーバが SIGHUP を受け取ったとき（pg_ctl reload や pg_reload_conf() の実行時）に読み込まれるため、再起動は必須ではありません。\ntrust は無条件に接続を許可する方式で、パスワードは要求されません。',
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html'],
    ['trust認証', 'auth-trust.html']
  ]
},
{
  id: 'S2.3-002', level: 'silver', cat: 'S2.3',
  q: '`postgresql.conf` で変更した値を反映するために、サーバの再起動が必要なパラメータを1つ選びなさい。',
  choices: [
    'work_mem',
    'log_min_duration_statement',
    'shared_buffers',
    'autovacuum_naptime',
    'search_path'
  ],
  answer: 2,
  exp: 'パラメータの変更がいつ反映できるかは pg_settings ビューの context 列で確認できます。\n・shared_buffers: postmaster（サーバ起動時のみ設定可能 → 再起動が必要）\n・autovacuum_naptime: sighup（リロードで反映）\n・log_min_duration_statement: superuser（スーパーユーザが SET でも変更可能）\n・work_mem / search_path: user（一般ユーザも SET で変更可能）',
  refs: [
    ['pg_settings', 'view-pg-settings.html'],
    ['shared_buffers', 'runtime-config-resource.html#GUC-SHARED-BUFFERS']
  ]
},
{
  id: 'S2.3-003', level: 'silver', cat: 'S2.3',
  q: '`postgresql.conf` の記述方法に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'コメントは # のほか、// でも記述できる',
    '同じパラメータが複数回記述されている場合、最後の記述が有効になる',
    'メモリや時間のパラメータに \'128MB\' や \'5min\' のような単位を付けることはできない',
    'パラメータ名は大文字と小文字が区別される',
    '他の設定ファイルを読み込む include のような指示子は用意されていない'
  ],
  answer: 1,
  exp: 'postgresql.conf は1行に1つ「パラメータ名 = 値」の形式で記述し、# から行末まではコメントになります。同じパラメータが複数回記述されている場合は、最後の記述以外は無視されます。\nパラメータ名は大文字と小文字を区別しません。メモリや時間を表すパラメータには kB、MB、GB、ms、s、min、h、d などの単位を付けられます。\ninclude、include_if_exists、include_dir 指示子で、他のファイルの設定を読み込むことができます。',
  refs: [
    ['設定ファイルによるパラメータ操作', 'config-setting.html#CONFIG-SETTING-CONFIGURATION-FILE'],
    ['パラメータ名と値', 'config-setting.html#CONFIG-SETTING-NAMES-VALUES'],
    ['設定ファイルの内容の管理', 'config-setting.html#CONFIG-INCLUDES']
  ]
},
{
  id: 'S2.3-004', level: 'silver', cat: 'S2.3',
  q: '`ALTER SYSTEM` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ALTER SYSTEM は postgresql.conf ファイルの該当行を直接書き換える',
    'ALTER SYSTEM で変更した値は postgresql.auto.conf に書き込まれ、postgresql.conf の設定より優先される',
    'ALTER SYSTEM を実行すると、どのパラメータもその場ですべてのセッションに反映される',
    'PostgreSQL 14 では、一般ユーザも自分のセッション用に ALTER SYSTEM を実行できる',
    'ALTER SYSTEM で設定した値を取り消す構文は用意されていない'
  ],
  answer: 1,
  exp: 'ALTER SYSTEM は、データディレクトリの postgresql.auto.conf にパラメータの値を書き込みます。このファイルは postgresql.conf の後に読み込まれるため、同じパラメータでは postgresql.auto.conf の値が優先されます。\n書き込むだけなので、反映には設定の再読み込み（pg_reload_conf() など）が必要で、postmaster コンテキストのパラメータはサーバの再起動が必要です。\nPostgreSQL 14 ではスーパーユーザだけが実行できます。ALTER SYSTEM RESET パラメータ名（または RESET ALL）で設定を取り消せます。トランザクションブロック内では実行できません。',
  refs: [
    ['ALTER SYSTEM', 'sql-altersystem.html'],
    ['SQLを通じたパラメータ操作', 'config-setting.html#CONFIG-SETTING-SQL-COMMAND-INTERACTION']
  ]
},
{
  id: 'S2.3-005', level: 'silver', cat: 'S2.3',
  q: '`pg_hba.conf` で指定する認証方式 `peer` の説明として、正しいものを1つ選びなさい。',
  choices: [
    'OS から取得したクライアントの OS ユーザ名が、データベースユーザ名と一致すれば許可する',
    'クライアントにパスワードを要求し、暗号化されていない平文のまま送信させて照合する',
    'pg_hba.conf の該当行に一致した接続を、認証を行わずに無条件で拒否する',
    '接続元の IP アドレスが一致すれば、パスワードを要求せずに無条件で接続を許可する',
    'クライアントの SSL 証明書を検証し、証明書の CN をデータベースユーザ名として認証する'
  ],
  answer: 0,
  exp: 'peer 認証は、クライアントの OS ユーザ名をカーネルから取得し、それが要求されたデータベースユーザ名と一致するかを確認する方式で、Unix ドメインソケットによるローカル接続（local）でのみ使用できます。ユーザ名の対応付けを変える場合は pg_ident.conf のマップを使います。\nパスワードを平文で送るのは password、無条件に拒否するのは reject、条件に一致すれば無条件に許可するのは trust、クライアント証明書を使うのは cert です。',
  refs: [
    ['peer認証', 'auth-peer.html'],
    ['認証方式', 'auth-methods.html'],
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html']
  ]
},
{
  id: 'S2.3-006', level: 'silver', cat: 'S2.3',
  q: '`SET` コマンドによるパラメータ変更に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'SET で変更した値は postgresql.conf にも書き込まれ、サーバ再起動後も有効である',
    'SET はすべてのパラメータに対して使用でき、shared_buffers もセッション単位で変更できる',
    'SET の効果は現在のセッションに限られ、SET LOCAL を使うと現在のトランザクションの終了までに限られる',
    'トランザクション内で SET を実行した後にそのトランザクションをロールバックしても、SET の効果は残る',
    '現在のすべてのパラメータの値を表示する SHOW ALL という構文はない'
  ],
  answer: 2,
  exp: 'SET はセッション内の実行時パラメータを変更し、その効果は現在のセッションに限られます。SET LOCAL を使うと、効果は現在のトランザクションの終了までとなります。\nSET を実行したトランザクションがアボート（ロールバック）されると、SET の効果も取り消されます。\nshared_buffers のようにサーバ起動時にしか設定できないパラメータは SET では変更できません。\nSHOW パラメータ名 で現在の値を、SHOW ALL ですべてのパラメータの値を表示できます。pg_settings ビューでも確認・変更できます。',
  refs: [
    ['SET', 'sql-set.html'],
    ['SHOW', 'sql-show.html'],
    ['pg_settings', 'view-pg-settings.html']
  ]
},
{
  id: 'S2.3-007', level: 'silver', cat: 'S2.3',
  q: '`pg_settings` ビューの context 列が `sighup` であるパラメータの説明として、正しいものを1つ選びなさい。',
  choices: [
    'サーバの起動時にのみ設定でき、変更にはサーバの再起動が必要である',
    '設定ファイルを変更して再読み込みすれば反映され、セッション内の SET では変更できない',
    '一般ユーザがセッション内の SET でいつでも変更できる',
    'スーパーユーザだけがセッション内の SET で変更できる',
    'サーバの内部で固定されており、変更することはできない'
  ],
  answer: 1,
  exp: 'pg_settings の context 列は、パラメータをいつ・誰が変更できるかを表します。\n・internal: 変更不可（コンパイル時や initdb 時に決まる）\n・postmaster: サーバ起動時のみ（再起動が必要）\n・sighup: 設定ファイルの変更と再読み込み（SIGHUP）で反映。SET では変更不可\n・superuser-backend / backend: 接続開始時に決まる\n・superuser: スーパーユーザが SET で変更可能\n・user: 一般ユーザも SET で変更可能\npending_restart 列が true のパラメータは、設定ファイルを変更したが再起動しないと反映されない状態です。',
  refs: [
    ['pg_settings', 'view-pg-settings.html']
  ]
},
{
  id: 'S2.3-008', level: 'silver', cat: 'S2.3',
  q: 'パラメータ `log_line_prefix` の説明として、正しいものを1つ選びなさい。',
  choices: [
    'ログファイルの名前を strftime の書式で指定する',
    'ログの出力先（stderr、csvlog、syslog など）を指定する',
    'ログの各行の先頭に付ける情報を、%t（時刻）や %p（プロセス ID）などのエスケープで指定する',
    'ログに出力するメッセージの重要度の下限を指定する',
    'ログファイルを保存しておく日数を指定する'
  ],
  answer: 2,
  exp: 'log_line_prefix は、ログの各行の先頭に出力する文字列を printf 風の書式で指定します。%t（タイムスタンプ）、%m（ミリ秒付きタイムスタンプ）、%p（プロセス ID）、%u（ユーザ名）、%d（データベース名）、%a（アプリケーション名）、%h（クライアントのホスト）などが使え、PostgreSQL 14 の既定値は \'%m [%p] \' です。障害調査のため、ユーザ名やデータベース名も含めておくと便利です。\nログファイル名は log_filename、出力先は log_destination、重要度の下限は log_min_messages で指定します。ログファイルの保存日数を指定するパラメータはありません。',
  refs: [
    ['log_line_prefix', 'runtime-config-logging.html#GUC-LOG-LINE-PREFIX'],
    ['ログの出力先', 'runtime-config-logging.html#RUNTIME-CONFIG-LOGGING-WHERE']
  ]
},
{
  id: 'S2.3-009', level: 'silver', cat: 'S2.3',
  q: '新しく開始するトランザクションの既定の分離レベルを設定するパラメータとして、正しいものを1つ選びなさい。',
  choices: [
    'default_transaction_isolation',
    'default_isolation_level',
    'isolation_mode',
    'tx_isolation',
    'serializable_mode'
  ],
  answer: 0,
  exp: 'default_transaction_isolation は、各トランザクションの既定の分離レベル（read uncommitted、read committed、repeatable read、serializable）を指定するパラメータで、既定値は read committed です。postgresql.conf、ALTER ROLE / ALTER DATABASE ... SET、SET などで設定できます。\n個々のトランザクションでは BEGIN TRANSACTION ISOLATION LEVEL ... や SET TRANSACTION で指定します。\nこのほか「クライアント接続デフォルト」には search_path、client_encoding、DateStyle、TimeZone、statement_timeout などのパラメータがあります。tx_isolation は MySQL の変数名です。',
  refs: [
    ['default_transaction_isolation', 'runtime-config-client.html#GUC-DEFAULT-TRANSACTION-ISOLATION'],
    ['トランザクションの分離', 'transaction-iso.html']
  ]
},
{
  id: 'S2.3-010', level: 'silver', cat: 'S2.3', type: 'scenario',
  q: '次の pg_hba.conf の設定で、IP アドレス 192.168.1.10 のホストからユーザ bob がデータベース sales に TCP/IP で接続した場合の動作として、正しいものを1つ選びなさい。',
  code: '# TYPE  DATABASE  USER  ADDRESS          METHOD\nlocal   all       all                    peer\nhost    sales     all   192.168.1.0/24   scram-sha-256\nhost    all       all   0.0.0.0/0        reject',
  choices: [
    'パスワードなしで接続が許可される',
    'peer 認証が行われる',
    'SCRAM-SHA-256 によるパスワード認証が行われる',
    '3行目に一致するため、接続は拒否される',
    'OS のユーザ名が bob であれば、パスワードなしで接続できる'
  ],
  answer: 2,
  exp: 'pg_hba.conf は上から順に評価され、条件が一致した最初の行が使われます。\n・1行目: local は Unix ドメインソケット接続なので、TCP/IP 接続には一致しません。\n・2行目: host（TCP/IP）、データベース sales、全ユーザ、192.168.1.0/24 の範囲に 192.168.1.10 が含まれるため一致し、scram-sha-256 のパスワード認証が行われます。\n最初に一致した行で判定されるため、3行目の reject は評価されません。192.168.1.0/24 以外のアドレスや、sales 以外のデータベースへの TCP/IP 接続は3行目で拒否されます。',
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html'],
    ['パスワード認証', 'auth-password.html']
  ]
},
{
  id: 'S2.3-011', level: 'silver', cat: 'S2.3',
  q: '`listen_addresses` と `port` の変更を反映する方法として、正しいものを1つ選びなさい。',
  choices: [
    'postgresql.conf を変更して、サーバを再起動する',
    'postgresql.conf を変更して、pg_ctl reload を実行する',
    '各セッションで SET listen_addresses = \'*\' を実行する',
    'pg_hba.conf に待ち受けるアドレスとポートを記述する',
    '設定は不要で、サーバが利用可能なアドレスとポートを自動的に検出する'
  ],
  answer: 0,
  exp: 'listen_addresses（待ち受ける IP アドレス、既定 localhost）と port（ポート番号、既定 5432）は、サーバの起動時にしか設定できない postmaster コンテキストのパラメータです。postgresql.conf（または ALTER SYSTEM）で変更した後、サーバの再起動が必要です。\nmax_connections や shared_buffers も同様に再起動が必要です。pg_settings の context 列や pending_restart 列で確認できます。\npg_hba.conf はクライアント認証の設定で、待ち受けるアドレスは指定しません。',
  refs: [
    ['接続設定', 'runtime-config-connection.html#RUNTIME-CONFIG-CONNECTION-SETTINGS'],
    ['pg_settings', 'view-pg-settings.html']
  ]
},
{
  id: 'S2.3-012', level: 'silver', cat: 'S2.3',
  q: 'パラメータ `log_destination` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'syslog は Windows でのみ指定できる',
    'eventlog は Linux でのみ指定できる',
    'csvlog を指定する場合は、logging_collector を on にする必要がある',
    'stderr は指定できず、既定値は csvlog である',
    'csvlog は logging_collector が off の場合にだけ使用できる'
  ],
  answer: 2,
  exp: 'log_destination はサーバログの出力先を指定するパラメータで、stderr（既定）、csvlog、syslog、eventlog をカンマ区切りで複数指定できます。\ncsvlog はログを CSV 形式で出力するもので、データベースのテーブルに取り込んで分析しやすい形式です。csvlog を使うには logging_collector = on にしておく必要があります。\nsyslog は Unix 系の OS で syslog に出力し、eventlog は Windows のイベントログに出力します。',
  refs: [
    ['log_destination', 'runtime-config-logging.html#GUC-LOG-DESTINATION'],
    ['CSV形式のログ出力の利用', 'runtime-config-logging.html#RUNTIME-CONFIG-LOGGING-CSVLOG']
  ]
},
{
  id: 'S2.3-013', level: 'silver', cat: 'S2.3',
  q: '`log_min_messages` と `client_min_messages` の違いとして、正しいものを1つ選びなさい。',
  choices: [
    'log_min_messages はクライアントに送るメッセージ、client_min_messages はサーバログに書くメッセージの重要度の下限を指定する',
    'log_min_messages はサーバログに書くメッセージ、client_min_messages はクライアントに送るメッセージの重要度の下限を指定する',
    'どちらもサーバログに書くメッセージの重要度を指定し、一方は古いバージョンとの互換のために残されている',
    'client_min_messages を ERROR にすると、クライアントには ERROR も送られなくなる',
    'log_min_messages はセッションごとに一般ユーザが SET で変更できる'
  ],
  answer: 1,
  exp: 'log_min_messages はサーバログに書き込むメッセージの重要度の下限（既定 WARNING）、client_min_messages はクライアントに送信するメッセージの重要度の下限（既定 NOTICE）を指定します。重要度は DEBUG5〜DEBUG1、INFO、NOTICE、WARNING、ERROR、LOG、FATAL、PANIC などで、指定したレベル以上のメッセージが出力されます。\nエラー（ERROR）は client_min_messages の設定にかかわらずクライアントに送られます。\nlog_min_messages はスーパーユーザだけが変更でき、client_min_messages は一般ユーザもセッションで変更できます。',
  refs: [
    ['log_min_messages', 'runtime-config-logging.html#GUC-LOG-MIN-MESSAGES'],
    ['client_min_messages', 'runtime-config-client.html#GUC-CLIENT-MIN-MESSAGES']
  ]
},
{
  id: 'S2.3-014', level: 'silver', cat: 'S2.3',
  q: 'pg_hba.conf の `host  all  all  127.0.0.1/32  trust` という行の意味として、正しいものを1つ選びなさい。',
  choices: [
    'Unix ドメインソケットによるローカル接続を、パスワードなしで許可する',
    '127.0.0.0 から 127.255.255.255 までのすべてのアドレスからの接続を拒否する',
    'IPv4 と IPv6 の両方のローカルホスト（127.0.0.1 と ::1）からの接続を許可する',
    'ローカルホストからの接続を許可するが、パスワードの入力が必要である',
    '127.0.0.1 からの IPv4 の TCP/IP 接続を、すべてのデータベース・ユーザについてパスワードなしで許可する'
  ],
  answer: 4,
  exp: 'host は TCP/IP 接続（SSL の有無を問わない）に一致する接続タイプです。127.0.0.1/32 は CIDR 表記で、/32 は32ビットすべてが一致する、つまり 127.0.0.1 の1つのアドレスだけを表します。IPv6 のローカルホスト（::1/128）は別の行で指定する必要があります。\ntrust は無条件に接続を許可する認証方式で、パスワードは要求されません。ローカルホストからの接続であっても、同じホストの任意の OS ユーザが任意のデータベースユーザで接続できてしまうため、運用環境では scram-sha-256 などを使うのが安全です。\nUnix ドメインソケット接続は local で指定します。',
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html'],
    ['trust認証', 'auth-trust.html']
  ]
},
{
  id: 'S2.3-015', level: 'silver', cat: 'S2.3',
  q: 'SQL 関数でパラメータを参照・変更する方法の説明として、正しいものを1つ選びなさい。',
  choices: [
    'current_setting(\'work_mem\') は、postgresql.conf に記述された値を常に返す',
    'set_config(\'work_mem\', \'64MB\', true) は、サーバ全体の設定を変更して postgresql.auto.conf に書き込む',
    'current_setting(\'work_mem\') は現在のセッションの値を返し、set_config(\'work_mem\', \'64MB\', true) はその値を現在のトランザクション内だけで変更する',
    'パラメータの値は SHOW でしか参照できず、関数では参照できない',
    'set_config() では、shared_buffers のようなサーバ起動時にしか設定できないパラメータも変更できる'
  ],
  answer: 2,
  exp: 'current_setting(パラメータ名) は、現在のセッションで有効なパラメータの値を文字列で返す関数で、SHOW と同じ値が得られます。SQL の式の中で使えるため、他の値と組み合わせて利用できます。\nset_config(パラメータ名, 値, is_local) は SET と同じくパラメータを変更する関数で、第3引数が true なら SET LOCAL と同様に現在のトランザクション内だけ、false ならセッション全体で有効になります。設定ファイルには書き込まれません。\nSET と同様に、postmaster コンテキストのパラメータは変更できません。',
  refs: [
    ['設定関数', 'functions-admin.html#FUNCTIONS-ADMIN-SET'],
    ['SET', 'sql-set.html']
  ]
},
{
  id: 'S2.3-016', level: 'silver', cat: 'S2.3',
  q: '設定ファイル `pg_ident.conf` の役割として、正しいものを1つ選びなさい。',
  choices: [
    '外部のユーザ名とデータベースユーザ名の対応を定義し、pg_hba.conf から参照する',
    '接続を許可するクライアントの IP アドレスの一覧を、ホストごとに定義する',
    'データベースユーザのパスワードを平文で定義する',
    'サーバの起動時に自動的に作成するロールを定義する',
    'SSL 接続で使用するサーバ証明書の場所を定義する'
  ],
  answer: 0,
  exp: 'pg_ident.conf は、peer、ident、cert、gss などの外部の認証システムから得られたユーザ名と、データベースのユーザ名との対応（ユーザ名マップ）を定義するファイルです。「マップ名  システムユーザ名  データベースユーザ名」の形式で記述し、pg_hba.conf の該当行で map=マップ名 と指定して使います。\n例えば、OS ユーザ taro がデータベースユーザ app_user として peer 認証で接続できるようにする、といった用途に使います。変更は設定の再読み込みで反映されます。',
  refs: [
    ['ユーザ名マップ', 'auth-username-maps.html'],
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html']
  ]
},
{
  id: 'S2.3-017', level: 'silver', cat: 'S2.3',
  q: 'postgresql.conf の `include` 系ディレクティブに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'include_if_exists は指定したファイルが存在しない場合でもエラーにせず、処理を続行する',
    'include_if_exists は指定したファイルが存在しない場合にエラーとなり、サーバが起動しない',
    'include で読み込んだファイルの設定は、postgresql.conf 本体の設定より必ず優先される',
    'include_dir は指定したディレクトリ内のファイルを、ファイル名の逆順に読み込む',
    'include ディレクティブは pg_hba.conf でのみ使用できる'
  ],
  answer: 0,
  exp: 'postgresql.conf では include で別のファイルを読み込めます。include_if_exists は同じ動作ですが、ファイルが存在しない場合に警告を出して処理を続けます（include では存在しないとエラーになります）。\ninclude_dir はディレクトリを指定し、その中の .conf で終わるファイルをファイル名順に読み込みます。\n同じパラメータが複数回現れた場合は、最後に読み込まれた値が有効になります。読み込み順は記述位置で決まるため、include の位置に注意が必要です。\nなお ALTER SYSTEM が書き込む postgresql.auto.conf は常に最後に読み込まれるため、設定ファイルの中では最も優先されます（サーバ起動時のコマンドライン指定や、ALTER DATABASE / ALTER ROLE / SET による設定はさらに優先されます）。',
  refs: [
    ['設定ファイルによる設定', 'config-setting.html#CONFIG-SETTING-CONFIGURATION-FILE'],
    ['パラメータの設定', 'config-setting.html']
  ]
},
{
  id: 'S2.3-018', level: 'silver', cat: 'S2.3',
  q: 'postgresql.conf でのパラメータの単位の指定に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'メモリ量は kB、MB、GB など、時間は ms、s、min、h、d の単位を付けて指定できる',
    '単位を付けることはできず、すべてバイト数やミリ秒の数値で指定する必要がある',
    '単位を省略した場合は、必ずバイトまたはミリ秒として解釈される',
    'shared_buffers の値は必ずページ数で指定しなければならない',
    '単位付きで指定した値は、pg_settings ビューでは参照できない'
  ],
  answer: 0,
  exp: 'メモリ量を表すパラメータには B、kB、MB、GB、TB を、時間を表すパラメータには us、ms、s、min、h、d を付けて指定できます（例: shared_buffers = 256MB、checkpoint_timeout = 10min）。\n単位を省略した場合は、そのパラメータごとに決められた既定の単位で解釈されます。たとえば shared_buffers はブロック（8kB）単位、checkpoint_timeout は秒単位です。誤解を避けるため、単位は明示するのが安全です。\n各パラメータの既定の単位は、pg_settings ビューの unit 列で確認できます。',
  refs: [
    ['パラメータの設定', 'config-setting.html'],
    ['pg_settings', 'view-pg-settings.html']
  ]
},
{
  id: 'S2.3-019', level: 'silver', cat: 'S2.3',
  q: 'パラメータの変更が保留されている状態に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '再起動が必要なパラメータを変更して再読み込みすると、pg_settings の pending_restart が true になる',
    '再起動が必要なパラメータを変更すると、再読み込みだけで即座に反映される',
    'pending_restart が true のパラメータは、次回の設定再読み込みで自動的に反映される',
    'ALTER SYSTEM で設定した値を取り消す方法はなく、postgresql.auto.conf を直接編集するしかない',
    'pg_settings の source 列は、常に default という値になる'
  ],
  answer: 0,
  exp: 'postgresql.conf や ALTER SYSTEM で、再起動が必要なパラメータ（pg_settings の context が postmaster のもの）を変更して設定を再読み込みすると、その行の pending_restart 列が true になります。実際に値が変わるのはサーバを再起動したときです。\nALTER SYSTEM で設定した値は ALTER SYSTEM ... RESET で取り消せ、ALTER SYSTEM RESET ALL ですべて消せます。postgresql.auto.conf を手で編集することは推奨されません。\npg_settings の source 列には、値がどこで設定されたか（default、configuration file、override など）が表示されます。',
  refs: [
    ['pg_settings', 'view-pg-settings.html'],
    ['ALTER SYSTEM', 'sql-altersystem.html']
  ]
},
{
  id: 'S2.3-020', level: 'silver', cat: 'S2.3',
  q: 'pg_hba.conf のアドレス欄の指定に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '`samenet` はサーバが属するサブネットのいずれかのアドレスに、`samehost` はサーバ自身のアドレスに一致する',
    '`samehost` はサーバが属するサブネット全体に、`samenet` はサーバ自身のアドレスに一致する',
    'アドレスは CIDR 表記でしか書けず、ホスト名を指定することはできない',
    '`0.0.0.0/0` と書くと、どのアドレスからの接続も拒否される',
    'アドレス欄は `local` の行にも必ず記述しなければならない'
  ],
  answer: 0,
  exp: 'アドレス欄には 192.168.1.0/24 のような CIDR 表記のほか、`all`（すべてのアドレス）、`samehost`（サーバ自身のいずれかの IP アドレス）、`samenet`（サーバが属するいずれかのサブネット）といったキーワードを指定できます。\nホスト名や、先頭にドットを付けたドメイン名（.example.com）も指定でき、この場合は逆引きと正引きによる照合が行われます。\n`0.0.0.0/0` はすべての IPv4 アドレスに一致するという意味で、拒否するかどうかは認証方式の欄（trust、reject など）で決まります。\nUnix ドメインソケット接続を表す local の行には、アドレス欄を書きません。',
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html']
  ]
},
{
  id: 'S2.3-021', level: 'silver', cat: 'S2.3',
  q: 'サーバログのローテーションに関するパラメータの説明として、正しいものを1つ選びなさい。',
  choices: [
    'log_rotation_age は経過時間で、log_rotation_size は出力量でログファイルを切り替える',
    'log_rotation_age は出力量で、log_rotation_size は経過時間でログファイルを切り替える',
    'ローテーションを行うには log_destination を syslog にする必要がある',
    'log_filename に時刻の書式を含めることはできない',
    'log_truncate_on_rotation を on にすると、古いログファイルがすべて削除される'
  ],
  answer: 0,
  exp: 'log_rotation_age は指定した時間が経過したとき、log_rotation_size は指定した量を出力したときに、新しいログファイルへ切り替えます（いずれも 0 で無効）。\nこれらが働くのは logging_collector が on のときです。log_destination が stderr や csvlog でも、収集プロセスが有効であればローテーションされます。\nlog_filename には postgresql-%Y-%m-%d_%H%M%S.log のように strftime の書式を使え、%a（曜日）などを使って一定期間で使い回す設定もできます。\nlog_truncate_on_rotation を on にすると、同じ名前の既存ファイルに追記せず切り詰めて上書きします。ファイルの削除は行いません。',
  refs: [
    ['どこにログを出力するか', 'runtime-config-logging.html#RUNTIME-CONFIG-LOGGING-WHERE'],
    ['ログファイル保守', 'logfile-maintenance.html']
  ]
},
{
  id: 'S2.3-022', level: 'silver', cat: 'S2.3',
  q: 'パラメータ `log_statement` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'none、ddl、mod、all のいずれかを指定し、記録する SQL 文の種類を選べる',
    'on と off のいずれかを指定し、すべての SQL 文を記録するかどうかを切り替える',
    '`mod` を指定すると、SELECT 文を含むすべての問い合わせが記録される',
    '実行時間が指定したミリ秒を超えた SQL 文だけを記録するパラメータである',
    'この設定は一般ユーザが自分のセッションで自由に変更できる'
  ],
  answer: 0,
  exp: 'log_statement は記録する SQL 文の種類を none（記録しない、既定）、ddl（CREATE / ALTER / DROP などのデータ定義文）、mod（ddl に加えて INSERT / UPDATE / DELETE / TRUNCATE などのデータ変更文）、all（すべての文）から選びます。\nSELECT 文は all のときだけ記録されます。\n実行時間で絞り込むのは log_min_duration_statement で、指定したミリ秒以上かかった文を記録します。\nlog_statement はスーパーユーザ（または適切な権限を与えられたロール）だけが変更できます。',
  refs: [
    ['何をログに出力するか', 'runtime-config-logging.html#RUNTIME-CONFIG-LOGGING-WHAT'],
    ['log_statement', 'runtime-config-logging.html#GUC-LOG-STATEMENT']
  ]
},
{
  id: 'S2.3-023', level: 'silver', cat: 'S2.3',
  q: 'パラメータ `shared_preload_libraries` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'サーバ起動時に共有ライブラリを読み込む設定で、変更を反映するには再起動が必要である',
    'SET コマンドでセッション単位に変更でき、変更は即座に反映される',
    '設定を再読み込みすれば反映されるため、サーバの再起動は不要である',
    'このパラメータで指定した拡張は、CREATE EXTENSION を実行しなくても必ず使えるようになる',
    '指定できるライブラリは1つだけで、複数を同時に読み込むことはできない'
  ],
  answer: 0,
  exp: 'shared_preload_libraries は、サーバの起動時にあらかじめ読み込む共有ライブラリを指定します。共有メモリの確保やフックの登録が起動時にしか行えないモジュールのためのもので、pg_stat_statements や auto_explain（セッション単位でも読み込み可）などが該当します。\nこのパラメータは起動時にしか変更できないため、postgresql.conf を編集して再起動する必要があります。設定の再読み込みでは反映されません。\n複数のライブラリはコンマ区切りで指定します。\nライブラリを読み込んだうえで、拡張が提供するビューや関数を使うには CREATE EXTENSION が必要です。',
  refs: [
    ['共有ライブラリのプリロード', 'runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD'],
    ['pg_stat_statements', 'pgstatstatements.html']
  ]
},
{
  id: 'S2.3-024', level: 'silver', cat: 'S2.3',
  q: '`SET` と `SET LOCAL` に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'SET LOCAL で変更した値は、そのトランザクションが終わると元に戻る',
    'SET で変更した値は、そのセッションが終わるまで有効である',
    'SET LOCAL で変更した値は、コミットするとセッション全体に引き継がれる',
    'SET で変更した値は、postgresql.conf に書き込まれる',
    'RESET ALL を実行すると、postgresql.conf の設定も初期値に戻る'
  ],
  answer: [0, 1],
  exp: 'SET はそのセッションの間だけパラメータを変更し、切断すると失われます。SET LOCAL は現在のトランザクションの間だけ有効で、COMMIT でも ROLLBACK でも元の値に戻ります。\nどちらもファイルには書き込まれません。設定ファイルに永続化するのは ALTER SYSTEM（postgresql.auto.conf）や、postgresql.conf の直接編集です。\nRESET（RESET ALL）はセッションで変更した値を、そのセッションの既定値（postgresql.conf などで決まる値）に戻すコマンドで、設定ファイルには影響しません。\n現在の値は SHOW や current_setting() で確認できます。',
  refs: [
    ['SET', 'sql-set.html'],
    ['パラメータの設定', 'config-setting.html#CONFIG-SETTING-SQL-COMMAND-INTERACTION']
  ]
},
{
  id: 'S2.3-025', level: 'silver', cat: 'S2.3',
  q: '`postgresql.conf` と `postgresql.auto.conf` に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'postgresql.auto.conf は、利用者がエディタで直接編集することが推奨されている',
    'postgresql.auto.conf は ALTER SYSTEM が書き込むファイルである',
    'postgresql.auto.conf は postgresql.conf の後に読み込まれ、値が優先される',
    'どちらもデータディレクトリに置かれるのが既定である',
    'ALTER SYSTEM ... RESET で、postgresql.auto.conf の設定を取り消せる'
  ],
  answer: 0,
  exp: 'postgresql.auto.conf は ALTER SYSTEM が自動的に書き換えるファイルで、利用者が直接編集することは想定されていません。設定を消したい場合は ALTER SYSTEM ... RESET や ALTER SYSTEM RESET ALL を使います。この点が誤りです。\npostgresql.auto.conf は postgresql.conf を読み込んだ後に処理されるため、同じパラメータがあれば auto.conf の値が優先されます。\nどちらも既定ではデータディレクトリに置かれますが、postgresql.conf は config_file で別の場所を指定することもできます。',
  refs: [
    ['ALTER SYSTEM', 'sql-altersystem.html'],
    ['設定ファイルによる設定', 'config-setting.html#CONFIG-SETTING-CONFIGURATION-FILE']
  ]
},
{
  id: 'S2.3-026', level: 'silver', cat: 'S2.3',
  q: 'パラメータの現在値を確認する方法として、適切なものを2つ選びなさい。',
  choices: [
    '`SHOW work_mem;` で、そのセッションでの現在値を確認できる',
    'pg_settings ビューの source 列で、その値がどこで設定されたか分かる',
    '`SHOW ALL;` を実行すると、postgresql.conf の記述内容がそのまま表示される',
    'pg_settings の boot_val 列には、postgresql.conf に書かれた値が入る',
    'パラメータの現在値は psql の \\dp で確認する'
  ],
  answer: [0, 1],
  exp: 'SHOW パラメータ名; でそのセッションから見た現在値が、SHOW ALL; ですべてのパラメータの一覧が表示されます。表示されるのは「現在有効な値」であって、設定ファイルの記述そのものではありません。\npg_settings ビューは、現在値（setting）のほか、単位（unit）、変更できるタイミング（context）、値の出どころ（source: default、configuration file、command line、database、session など）、設定ファイル上の位置（sourcefile、sourceline）を持ちます。\nboot_val は組み込みの初期値、reset_val は RESET したときに戻る値です。\n\\dp はテーブルの権限を表示するメタコマンドです。',
  refs: [
    ['pg_settings', 'view-pg-settings.html'],
    ['SHOW', 'sql-show.html']
  ]
},
{
  id: 'S2.3-027', level: 'silver', cat: 'S2.3', type: 'scenario',
  q: 'pg_hba.conf が次の内容になっている。ロール bob が、正しいパスワードを使って 127.0.0.1 からデータベース sales に接続しようとしたときの結果として、正しいものを1つ選びなさい。',
  code: '# TYPE  DATABASE     USER      ADDRESS          METHOD\nlocal   all          postgres                   peer\nlocal   all          all                        scram-sha-256\nhost    sales        bob       127.0.0.1/32     reject\nhost    all          all       127.0.0.1/32     scram-sha-256\nhost    replication  postgres  127.0.0.1/32     trust',
  choices: [
    'reject の行に一致するため、パスワードを確認されることなく接続が拒否される',
    'reject の行は読み飛ばされ、その下の scram-sha-256 の行でパスワード認証が行われて接続できる',
    '一致する行のうち最も下にある行が使われるため、trust で接続できる',
    'local の行に一致するため、パスワード認証が行われて接続できる',
    'どの行にも一致しないため、既定の認証方式（trust）で接続できる'
  ],
  answer: 0,
  exp: 'pg_hba.conf は上から順に評価され、接続種別（host）・データベース（sales）・ユーザ（bob）・接続元アドレス（127.0.0.1）がすべて一致した最初の行だけが使われます。この例では3行目の reject が最初に一致するため、パスワードの確認もなく拒否されます。後続の行が試されることはありません。\n実際に PostgreSQL 14 で試すと、次のエラーになります。\n`FATAL:  pg_hba.conf rejects connection for host "127.0.0.1", user "bob", database "sales", no encryption`\nlocal の行は Unix ドメインソケット接続にだけ一致し、TCP/IP 接続（-h 127.0.0.1）には一致しません。\nどの行にも一致しない場合も接続は拒否されます（既定で許可されることはありません）。',
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html']
  ]
},
{
  id: 'S2.3-028', level: 'silver', cat: 'S2.3', type: 'scenario',
  q: 'クライアントから接続したところ、次の3種類のエラーが出た。それぞれの原因の説明として、正しいものを1つ選びなさい。',
  code: '(1) FATAL:  pg_hba.conf rejects connection for host "127.0.0.1",\n            user "bob", database "sales", no encryption\n(2) FATAL:  password authentication failed for user "alice"\n(3) FATAL:  no pg_hba.conf entry for host "10.0.2.15",\n            user "alice", database "sales", no encryption',
  choices: [
    '(1) は reject の行に一致、(2) は一致した行の認証で失敗、(3) は一致する行がない',
    '(1) は一致する行がない、(2) は reject の行に一致、(3) は一致した行の認証で失敗',
    '(1) はパスワードの誤り、(2) は一致する行がない、(3) は reject の行に一致',
    '(1) と (3) はどちらもパスワードの誤りで、(2) は reject の行に一致',
    '(1)〜(3) はいずれもサーバが停止していることを示している'
  ],
  answer: 0,
  exp: 'いずれも PostgreSQL 14 で実際に出力されたメッセージです。\n(1)「pg_hba.conf rejects connection」は、一致した行の認証方式が reject だったことを表します。\n(2)「password authentication failed」は、一致した行の方式（scram-sha-256 など）でパスワードの照合に失敗したことを表します。この場合、後続の行は試されません。\n(3)「no pg_hba.conf entry」は、接続種別・データベース・ユーザ・アドレスがすべて一致する行が1つもないことを表します。\n末尾の「no encryption」は SSL を使っていない接続であることを示しています。hostssl の行しか用意していない場合なども、このメッセージになります。',
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html'],
    ['認証の問題', 'client-authentication-problems.html']
  ]
},
{
  id: 'S2.3-029', level: 'silver', cat: 'S2.3', type: 'scenario',
  q: 'pg_hba.conf に `local all all scram-sha-256` の行がある。サーバ上で OS ユーザとして次のコマンドを実行したところ、エラーになった。原因として最も適切なものを1つ選びなさい。',
  code: '$ psql -U carol -d sales -w\npsql: error: connection to server on socket "/run/postgresql/.s.PGSQL.5432" failed:\n  fe_sendauth: no password supplied',
  choices: [
    'サーバがパスワード認証を要求したが、クライアントがパスワードを送らなかった',
    'ロール carol にパスワードが設定されておらず、サーバが接続を拒否した',
    'Unix ドメインソケット経由の接続は許可されていないため、拒否された',
    'サーバが停止しており、ソケットファイルが存在しない',
    'データベース sales が存在しないため、認証の前に接続が拒否された'
  ],
  answer: 0,
  exp: '「fe_sendauth: no password supplied」は、サーバがパスワードを要求したのに、クライアント（フロントエンド）側がパスワードを送れなかったことを表すクライアント側のメッセージです。この例では -w（パスワードの入力を求めない）を付けたうえ、.pgpass や環境変数 PGPASSWORD にもパスワードがなかったため発生しました。同じ条件でパスワードを渡すと接続できることを確認しています。\nソケット経由の接続自体は local の行で許可されています。\nサーバが停止している場合は「No such file or directory」や「Is the server running locally...」といったメッセージになります。\nデータベースが存在しない場合は、認証の後に「database "sales" does not exist」となります。',
  refs: [
    ['パスワード認証', 'auth-password.html'],
    ['パスワードファイル', 'libpq-pgpass.html'],
    ['psql', 'app-psql.html']
  ]
},
{
  id: 'S2.3-030', level: 'silver', cat: 'S2.3', type: 'scenario',
  q: 'ロールとデータベースの組み合わせに `work_mem = 64MB` が設定されている状態で接続し、次の SQL を順に実行した。(1)〜(4) の SHOW の結果として正しいものを1つ選びなさい。',
  code: '=# SET work_mem = \'128MB\';\n=# SHOW work_mem;          -- (1)\n=# BEGIN;\n=# SET LOCAL work_mem = \'256MB\';\n=# SHOW work_mem;          -- (2)\n=# COMMIT;\n=# SHOW work_mem;          -- (3)\n=# RESET work_mem;\n=# SHOW work_mem;          -- (4)',
  choices: [
    '(1) 128MB　(2) 256MB　(3) 128MB　(4) 64MB',
    '(1) 128MB　(2) 256MB　(3) 256MB　(4) 64MB',
    '(1) 128MB　(2) 256MB　(3) 128MB　(4) 4MB',
    '(1) 64MB　(2) 256MB　(3) 64MB　(4) 64MB',
    '(1) 128MB　(2) 128MB　(3) 128MB　(4) 8MB'
  ],
  answer: 0,
  exp: 'SET はセッションの間有効で、(1) は 128MB です。\nSET LOCAL はトランザクションの間だけ有効で、(2) は 256MB になり、COMMIT（ROLLBACK でも同じ）でトランザクションが終わると SET で設定していた 128MB に戻ります（3）。\nRESET は、そのセッションの「既定値」に戻します。既定値は組み込みの値や postgresql.conf ではなく、接続時に適用された設定（この例ではロールとデータベースの組み合わせの 64MB）です（4）。\nこの結果は PostgreSQL 14 で実際に確認したものです。',
  refs: [
    ['SET', 'sql-set.html'],
    ['RESET', 'sql-reset.html']
  ]
},

/* ---------------- S2.4 バックアップ方法（重要度 7 / 30問） ---------------- */
{
  id: 'S2.4-001', level: 'silver', cat: 'S2.4',
  q: '`pg_dump` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ロールやテーブルスペースも含め、データベースクラスタ全体を1つのファイルにダンプする',
    'ダンプ取得中は一貫性を保つため、対象データベースのテーブルに対する更新がブロックされる',
    'プレーンテキスト形式（-Fp）で出力したダンプは、pg_restore を使ってリストアする',
    'カスタム形式（-Fc）のダンプは pg_restore でリストアし、対象オブジェクトを選択できる',
    'ディレクトリ形式（-Fd）は、-j オプションによる並列ダンプには対応していない'
  ],
  answer: 3,
  exp: 'pg_dump は1つのデータベースを対象とし、ロールやテーブルスペースなどクラスタ共通のオブジェクトはダンプしません（それらは pg_dumpall で取得します）。\nダンプは一貫性のあるスナップショットから取得されるため、他のユーザの読み書きはブロックされません（ALTER TABLE など排他ロックを要する操作は待たされます）。\nプレーンテキスト形式は psql で実行してリストアし、カスタム形式・ディレクトリ形式・tar 形式は pg_restore でリストアします。pg_restore ではリストア対象の選択や並べ替えが可能です。\n並列ダンプ（-j）はディレクトリ形式でのみ利用できます。',
  refs: [
    ['pg_dump', 'app-pgdump.html'],
    ['pg_restore', 'app-pgrestore.html']
  ]
},
{
  id: 'S2.4-002', level: 'silver', cat: 'S2.4',
  q: 'PostgreSQL 14 でベースバックアップと WAL アーカイブを用いてポイントインタイムリカバリ（PITR）を行う場合、アーカイブリカバリを開始させるためにデータディレクトリに作成するファイルを1つ選びなさい。',
  choices: [
    'recovery.conf',
    'recovery.signal',
    'backup_label',
    'postmaster.pid',
    'pg_control'
  ],
  answer: 1,
  exp: 'PostgreSQL 12 以降では recovery.conf は廃止され、リカバリ関連の設定（restore_command や recovery_target_time など）は postgresql.conf に記述します。\nデータディレクトリに recovery.signal を作成してサーバを起動するとアーカイブリカバリ（PITR）が行われます（スタンバイとして起動する場合は standby.signal）。\nbackup_label はベースバックアップ取得時に作られるファイル、postmaster.pid はサーバ稼働中のロックファイル、pg_control は global ディレクトリにある制御ファイルです。',
  refs: [
    ['継続的アーカイブを使用したリカバリ', 'continuous-archiving.html#BACKUP-PITR-RECOVERY'],
    ['アーカイブリカバリの設定', 'runtime-config-wal.html#RUNTIME-CONFIG-WAL-ARCHIVE-RECOVERY']
  ]
},
{
  id: 'S2.4-003', level: 'silver', cat: 'S2.4',
  q: '`pg_dumpall` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'カスタム形式で出力でき、pg_restore でデータベースを選択してリストアできる',
    'ロールやテーブルスペースなどのクラスタ共通のオブジェクトを含めてダンプし、出力はプレーンテキストの SQL スクリプトである',
    '-g（--globals-only）を指定すると、全データベースのテーブルデータだけがダンプされる',
    '-j オプションで、複数のデータベースを並列にダンプできる',
    'ダンプしたファイルを psql でリストアする際は、各データベースを事前に作成しておく必要がある'
  ],
  answer: 1,
  exp: 'pg_dumpall はデータベースクラスタ内のすべてのデータベースをダンプし、pg_dump では取得できないロールやテーブルスペースなどのグローバルオブジェクトも出力します。出力はプレーンテキストの SQL スクリプトのみで、psql で実行してリストアします。\nスクリプトにはデータベースを作成する文も含まれるため、リストア時は postgres などの既存データベースに接続して実行します。\n-g（--globals-only）はロールとテーブルスペースなどのグローバルオブジェクトだけをダンプするオプションです。並列ダンプ（-j）は pg_dump のディレクトリ形式でのみ使えます。',
  refs: [
    ['pg_dumpall', 'app-pg-dumpall.html'],
    ['pg_dumpallの使用', 'backup-dump.html#BACKUP-DUMP-ALL']
  ]
},
{
  id: 'S2.4-004', level: 'silver', cat: 'S2.4',
  q: 'SQL の `COPY` と psql の `\\copy` の違いに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'COPY ... TO \'ファイル名\' は、どのユーザでも権限なしにサーバ上のファイルへ書き出せる',
    '\\copy は CSV 形式を扱えないため、CSV の入出力には COPY を使う',
    'COPY でファイルを指定すると、psql を実行しているクライアント側のファイルが読み書きされる',
    'COPY はサーバ上のファイルを、\\copy は psql を実行しているクライアント上のファイルを読み書きする',
    'COPY FROM はテーブルの内容をファイルに書き出すための構文である'
  ],
  answer: 3,
  exp: 'COPY でファイル名を指定した場合は、データベースサーバのプロセスがサーバ上のファイルを直接読み書きします。そのためスーパーユーザ、または pg_read_server_files / pg_write_server_files ロールのメンバーである必要があります。\npsql の \\copy は内部で COPY ... FROM STDIN / TO STDOUT を実行し、psql を実行しているクライアント側のファイルを読み書きするため、特別な権限は不要です。\nどちらも FORMAT csv などで CSV 形式を扱えます。COPY FROM はファイルからテーブルへ読み込み、COPY TO はテーブルからファイルへ書き出します。',
  refs: [
    ['COPY', 'sql-copy.html'],
    ['psql（\\copy）', 'app-psql.html']
  ]
},
{
  id: 'S2.4-005', level: 'silver', cat: 'S2.4',
  q: 'WAL アーカイブを有効にするための postgresql.conf の設定として、正しい組み合わせを1つ選びなさい。',
  choices: [
    'wal_level = replica、archive_mode = on とし、archive_command にコピーコマンドを指定する',
    'wal_level = minimal、archive_mode = on とし、archive_command にコピーコマンドを指定する',
    'wal_level = replica、archive_mode = on とするだけで、既定の場所に自動的にアーカイブされる',
    'wal_level = replica とし、restore_command に WAL ファイルをコピーするコマンドを指定する',
    'full_page_writes = off、archive_timeout = 60 とし、archive_command にコピーコマンドを指定する'
  ],
  answer: 0,
  exp: 'WAL アーカイブを行うには、wal_level を replica 以上（既定値は replica）にし、archive_mode = on としたうえで、archive_command に WAL セグメントファイルをアーカイブ先へコピーするコマンド（%p はファイルのパス、%f はファイル名に置換）を指定します。archive_mode の変更にはサーバの再起動が必要です。\nwal_level = minimal ではアーカイブに必要な情報が WAL に記録されないため、archive_mode を有効にできません。\nrestore_command はリカバリ時にアーカイブから WAL を取り出すためのコマンドです。archive_timeout は WAL セグメントの切り替えを強制する間隔の設定です。',
  refs: [
    ['WALアーカイブの設定', 'continuous-archiving.html#BACKUP-ARCHIVING-WAL'],
    ['archive_command', 'runtime-config-wal.html#GUC-ARCHIVE-COMMAND']
  ]
},
{
  id: 'S2.4-006', level: 'silver', cat: 'S2.4',
  q: 'ポイントインタイムリカバリで、指定した日時の時点までリカバリするために設定するパラメータを1つ選びなさい。',
  choices: [
    'recovery_target_time',
    'restore_command',
    'archive_cleanup_command',
    'recovery_end_command',
    'primary_conninfo'
  ],
  answer: 0,
  exp: 'recovery_target_time に日時を指定すると、その時点までの WAL を適用してリカバリを終了します。ほかに recovery_target_xid（トランザクション ID）、recovery_target_lsn（WAL の位置）、recovery_target_name（pg_create_restore_point() で作成した名前）などのリカバリ目標も指定できます。\nrestore_command はアーカイブから WAL ファイルを取り出すコマンド、archive_cleanup_command はスタンバイで不要になったアーカイブを削除するコマンド、recovery_end_command はリカバリ終了時に一度だけ実行するコマンド、primary_conninfo はスタンバイがプライマリに接続するための接続文字列です。',
  refs: [
    ['リカバリ目標', 'runtime-config-wal.html#RUNTIME-CONFIG-WAL-RECOVERY-TARGET'],
    ['継続的アーカイブを使用したリカバリ', 'continuous-archiving.html#BACKUP-PITR-RECOVERY']
  ]
},
{
  id: 'S2.4-007', level: 'silver', cat: 'S2.4',
  q: '`pg_restore` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'プレーンテキスト形式のダンプファイルもリストアできる',
    '-C オプションは、既存のオブジェクトを削除（DROP）してから再作成するためのオプションである',
    '-d オプションでデータベースを指定しない場合は、リストア用の SQL スクリプトが標準出力（または -f で指定したファイル）に出力される',
    '--data-only を指定すると、テーブル定義などのスキーマだけがリストアされる',
    '-j オプションによる並列リストアは、どの形式のダンプファイルでも利用できる'
  ],
  answer: 2,
  exp: 'pg_restore は pg_dump のカスタム形式・ディレクトリ形式・tar 形式のアーカイブからリストアするコマンドです。-d でデータベースを指定するとそのデータベースに接続して直接リストアし、指定しない場合はリストアを行う SQL スクリプトを出力します。\nプレーンテキスト形式は psql でリストアします。\n-c（--clean）はリストア前にオブジェクトを削除するオプション、-C（--create）はデータベース自体を作成してからリストアするオプションです。\n--data-only はデータだけ、--schema-only はスキーマだけをリストアします。並列リストア（-j）はカスタム形式とディレクトリ形式で利用できます。',
  refs: [
    ['pg_restore', 'app-pgrestore.html']
  ]
},
{
  id: 'S2.4-008', level: 'silver', cat: 'S2.4',
  q: 'データディレクトリをファイルとしてコピーする「ファイルシステムレベルのバックアップ」に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'サーバの稼働中に cp や tar でコピーしても、常に整合性のあるバックアップになる',
    '特定のテーブルに対応するファイルだけをコピーしておけば、そのテーブルだけをリストアできる',
    '取得したバックアップは、異なるメジャーバージョンの PostgreSQL でもそのまま利用できる',
    '整合性のあるバックアップを取得するには、原則としてデータベースサーバを停止してからコピーする必要がある',
    '通常、pg_dump で取得した SQL ダンプよりもサイズが小さくなる'
  ],
  answer: 3,
  exp: 'ファイルシステムレベルのバックアップで使用可能なバックアップを取得するには、原則としてサーバを停止する必要があります（ファイルシステムの一貫性のあるスナップショット機能を使う方法などを除く）。\nテーブルのデータファイルだけでは、コミット状態を記録したファイル（pg_xact）などの情報がないため、テーブル単位のバックアップ・リストアはできません。データベースクラスタ全体のバックアップ・リストアのみが可能です。\nデータファイルの形式はメジャーバージョンごとに異なりえます。インデックスなども含むため、通常は SQL ダンプよりサイズが大きくなります。',
  refs: [
    ['ファイルシステムレベルのバックアップ', 'backup-file.html']
  ]
},
{
  id: 'S2.4-009', level: 'silver', cat: 'S2.4',
  q: 'データベース mydb のテーブル orders について、テーブル定義を含めずにデータだけをダンプするコマンドとして、正しいものを1つ選びなさい。',
  choices: [
    'pg_dump -a -t orders mydb',
    'pg_dump -s -t orders mydb',
    'pg_dump -c -t orders mydb',
    'pg_dump -n orders mydb',
    'pg_dumpall -t orders mydb'
  ],
  answer: 0,
  exp: 'pg_dump の主なオプションは次のとおりです。\n・-a（--data-only）: データだけをダンプする\n・-s（--schema-only）: テーブル定義などのスキーマだけをダンプする\n・-t（--table）: 指定したテーブルだけをダンプする（複数指定やパターン指定も可能）\n・-n（--schema）: 指定したスキーマだけをダンプする\n・-c（--clean）: リストア時にオブジェクトを削除する DROP 文を出力する\npg_dumpall にはテーブルを指定する -t オプションはありません。',
  refs: [
    ['pg_dump', 'app-pgdump.html']
  ]
},
{
  id: 'S2.4-010', level: 'silver', cat: 'S2.4',
  q: 'pg_dump で -C を付けずにプレーンテキスト形式で出力したダンプファイルを、別のサーバにリストアする方法として、正しいものを1つ選びなさい。',
  choices: [
    'pg_restore -d newdb dump.sql を実行する',
    'リストア時にデータベース newdb が自動的に作成されるため、psql -f dump.sql を実行するだけでよい',
    'リストア先のデータベースを事前に作成してから、psql -d newdb -f dump.sql を実行する',
    'ダンプにはロールの定義も含まれるため、ロールを事前に作成する必要はない',
    'ダンプ元と同じ名前のデータベースでなければリストアできない'
  ],
  answer: 2,
  exp: 'プレーンテキスト形式のダンプは SQL スクリプトなので、psql で実行してリストアします。-C（--create）を付けずに取得したダンプにはデータベースを作成する文が含まれないため、リストア先のデータベースを事前に（通常は template0 から）作成しておきます。データベース名は元と異なっていても構いません。\npg_dump はロールをダンプしないため、所有者や権限の対象となるロールはリストア先に事前に作成しておく必要があります（pg_dumpall -g でロールだけを取得できます）。\npg_restore はカスタム形式などのアーカイブ用で、プレーンテキスト形式には使えません。',
  refs: [
    ['ダンプのリストア', 'backup-dump.html#BACKUP-DUMP-RESTORE'],
    ['pg_dump', 'app-pgdump.html']
  ]
},
{
  id: 'S2.4-011', level: 'silver', cat: 'S2.4',
  q: 'オンラインバックアップで作成される `tablespace_map` ファイルの役割として、正しいものを1つ選びなさい。',
  choices: [
    'バックアップ開始時の WAL の位置とチェックポイントの情報を記録する',
    'バックアップ時点のパラメータ設定を記録し、リストア時に自動で適用する',
    'データベースごとのテーブルの一覧と、それぞれのサイズを記録する',
    'pg_tblspc のシンボリックリンク情報を記録し、リストア時にリンクを再作成する',
    'バックアップに含まれるロールとパスワードの情報を記録する'
  ],
  answer: 3,
  exp: 'テーブルスペースはデータディレクトリの pg_tblspc 内のシンボリックリンクで参照されますが、tar 形式のバックアップなどではシンボリックリンクを正しく保存できない場合があります。そのため非排他的バックアップ（pg_basebackup を含む）では、テーブルスペースの OID とリンク先のパスを tablespace_map ファイルに記録し、リカバリ開始時にこの情報からシンボリックリンクを再作成します。\nバックアップ開始時の WAL の位置やチェックポイントなどの情報を記録するのは backup_label ファイルです。',
  refs: [
    ['低レベルAPIを使用したベースバックアップの作成', 'continuous-archiving.html#BACKUP-LOWLEVEL-BASE-BACKUP'],
    ['pg_basebackup', 'app-pgbasebackup.html']
  ]
},
{
  id: 'S2.4-012', level: 'silver', cat: 'S2.4',
  q: 'ベースバックアップと WAL アーカイブを使ったポイントインタイムリカバリの手順に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ベースバックアップのファイルを pg_restore でデータベースにリストアしてから、サーバを起動する',
    'ベースバックアップを配置し、restore_command を設定して recovery.signal を作成してから、サーバを起動する',
    'restore_command は不要で、recovery.signal を作成すればアーカイブの場所が自動的に検出される',
    'recovery.signal は、リカバリが完了した後に手動で作成する',
    'リカバリ中は、archive_command に指定したコマンドを使ってアーカイブから WAL を取り出す'
  ],
  answer: 1,
  exp: 'PITR の基本的な手順は次のとおりです。\n1. サーバを停止し、必要なら現在のデータディレクトリ（特に pg_wal 内の未アーカイブの WAL）を退避する\n2. データディレクトリをベースバックアップの内容で置き換える\n3. postgresql.conf に restore_command（アーカイブから WAL を取り出すコマンド）と、必要なら recovery_target_time などを設定する\n4. データディレクトリに recovery.signal を作成する\n5. サーバを起動すると WAL が適用され、完了すると recovery.signal は削除される\nベースバックアップはファイルのコピーなので、pg_restore は使いません。',
  refs: [
    ['継続的アーカイブを使用したリカバリ', 'continuous-archiving.html#BACKUP-PITR-RECOVERY'],
    ['restore_command', 'runtime-config-wal.html#GUC-RESTORE-COMMAND']
  ]
},
{
  id: 'S2.4-013', level: 'silver', cat: 'S2.4',
  q: 'pg_dump の出力形式と圧縮に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'プレーンテキスト形式の出力は、既定で gzip 圧縮される',
    'tar 形式（-Ft）の出力は、既定で gzip 圧縮される',
    'カスタム形式（-Fc）の出力は既定で圧縮され、-Z オプションで圧縮レベルを指定できる',
    'カスタム形式のダンプファイルは、テキストエディタで直接編集してからリストアするのが一般的である',
    '圧縮したダンプファイルからは、pg_restore でリストアするオブジェクトを選択できなくなる'
  ],
  answer: 2,
  exp: 'pg_dump のカスタム形式（-Fc）とディレクトリ形式（-Fd）は、既定で圧縮されて出力され、-Z（--compress）で 0〜9 の圧縮レベルを指定できます（0 は無圧縮）。圧縮されていても、pg_restore でリストアするオブジェクトの選択や並べ替えができます。\nプレーンテキスト形式は既定では圧縮されず（-Z を指定すると gzip 圧縮）、tar 形式は圧縮に対応していません。\nカスタム形式はバイナリ形式のため、内容を確認・編集する場合は pg_restore でプレーンテキストの SQL に変換します。',
  refs: [
    ['pg_dump', 'app-pgdump.html'],
    ['大規模データベースの扱い', 'backup-dump.html#BACKUP-DUMP-LARGE']
  ]
},
{
  id: 'S2.4-014', level: 'silver', cat: 'S2.4',
  q: 'カスタム形式のダンプから、一部のオブジェクトだけを選んでリストアする方法として、正しいものを1つ選びなさい。',
  choices: [
    'pg_restore -l で内容の一覧を出力し、不要な行をコメントアウトしたファイルを -L で指定してリストアする',
    'psql -f でダンプファイルを実行し、エラーになったオブジェクトを無視する',
    'pg_dumpall でダンプし直してから、pg_restore で個別に選ぶ',
    'カスタム形式では、一部のオブジェクトだけをリストアすることはできない',
    'pg_restore -C を指定すると、リストアするオブジェクトを対話的に選択できる'
  ],
  answer: 0,
  exp: 'pg_restore -l dump.custom > list.txt で、アーカイブに含まれるオブジェクトの一覧（TOC、目次）を出力できます。このファイルの不要な行を ; でコメントアウトしたり、行を並べ替えたりしてから、pg_restore -L list.txt -d mydb dump.custom と指定すると、残した項目だけをその順序でリストアできます。\nテーブル単位なら -t、スキーマ単位なら -n、定義だけなら -s、データだけなら -a でも絞り込めます。\nプレーンテキスト形式は psql で実行するため、このような選択はできません。',
  refs: [
    ['pg_restore', 'app-pgrestore.html']
  ]
},
{
  id: 'S2.4-015', level: 'silver', cat: 'S2.4', type: 'scenario',
  q: '次の SQL を実行した場合の説明として、正しいものを1つ選びなさい。',
  code: 'COPY orders TO \'/tmp/orders.csv\' WITH (FORMAT csv, HEADER true);',
  choices: [
    'psql を実行しているクライアントの /tmp/orders.csv に、ヘッダ行なしの CSV で書き出す',
    'サーバの /tmp/orders.csv から、先頭行を読み飛ばして orders に読み込む',
    'サーバの /tmp/orders.csv に、列名のヘッダ行付きの CSV で orders の内容を書き出す',
    'タブ区切りの形式で、既存の /tmp/orders.csv の末尾に追記する',
    'WITH 句の指定に誤りがあるため、エラーになる'
  ],
  answer: 2,
  exp: 'COPY テーブル TO \'ファイル名\' は、テーブルの内容をデータベースサーバ上のファイルに書き出します（既存のファイルは上書きされます）。FORMAT csv で CSV 形式、HEADER true で先頭に列名のヘッダ行を出力します。DELIMITER、NULL、QUOTE などのオプションもあります。\nサーバ上のファイルに書き出すには、スーパーユーザか pg_write_server_files ロールのメンバーである必要があります。クライアント側に書き出す場合は psql の \\copy orders TO \'orders.csv\' WITH (FORMAT csv, HEADER true) を使います。\nCOPY FROM で HEADER true を指定すると、読み込み時に先頭行が読み飛ばされます。',
  refs: [
    ['COPY', 'sql-copy.html']
  ]
},
{
  id: 'S2.4-016', level: 'silver', cat: 'S2.4', type: 'scenario',
  q: '次の archive_command の設定に関する説明として、正しいものを1つ選びなさい。',
  code: 'archive_command = \'test ! -f /archive/%f && cp %p /archive/%f\'',
  choices: [
    '%p はサーバのポート番号、%f はファイルシステムの名前に置き換えられる',
    'コマンドが成功した場合に 0 以外を返すと、アーカイブが完了したとみなされる',
    '同名のファイルがあっても上書きしてコピーするための設定である',
    '%p は WAL ファイルのパス、%f はファイル名に置換され、既存ファイルを上書きしない',
    '%f はアーカイブ先のディレクトリを含む完全なパスに置き換えられる'
  ],
  answer: 3,
  exp: 'archive_command では、%p がアーカイブする WAL ファイルのパス（データディレクトリからの相対パス）、%f がファイル名だけに置き換えられます。この例はドキュメントにも載っている典型的な設定で、test ! -f でアーカイブ先に同名のファイルがないことを確認してからコピーするため、既存のアーカイブを誤って上書きしません。\nコマンドは成功した場合にだけ終了ステータス 0 を返す必要があり、0 以外の場合は失敗とみなされて、後で再試行されます。',
  refs: [
    ['WALアーカイブの設定', 'continuous-archiving.html#BACKUP-ARCHIVING-WAL'],
    ['archive_command', 'runtime-config-wal.html#GUC-ARCHIVE-COMMAND']
  ]
},
{
  id: 'S2.4-017', level: 'silver', cat: 'S2.4',
  q: '`pg_basebackup -D /backup -Ft -z -P` の説明として、正しいものを1つ選びなさい。',
  choices: [
    'データベースごとに SQL のダンプを /backup に出力する',
    'tar 形式で gzip 圧縮したベースバックアップを、進捗を表示しながら /backup に取得する',
    '-P はバックアップ先のポート番号、-z はタイムゾーンを指定するオプションである',
    'バックアップ中はデータベースへの書き込みを禁止したうえで取得する',
    '/backup にあるバックアップから、データディレクトリへリストアする'
  ],
  answer: 1,
  exp: 'pg_basebackup の主なオプションは次のとおりです。\n・-D（--pgdata）: 出力先のディレクトリ\n・-F（--format）: p（plain、ファイルをそのまま出力、既定）または t（tar 形式）\n・-z（--gzip）: tar 形式の出力を gzip で圧縮する\n・-P（--progress）: 進捗を表示する\n・-X（--wal-method）: WAL の取得方法（既定 stream）\n・-R: スタンバイ用の設定を書き出す\npg_basebackup は稼働中のサーバからデータベースクラスタ全体の物理的なコピーを取得し、取得中も他のセッションは通常どおり読み書きできます。',
  refs: [
    ['pg_basebackup', 'app-pgbasebackup.html']
  ]
},
{
  id: 'S2.4-018', level: 'silver', cat: 'S2.4',
  q: '低レベル API（pg_start_backup / pg_stop_backup）による非排他的なオンラインバックアップ中のデータベースに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'バックアップ中は、すべてのテーブルへの更新が禁止される',
    'バックアップの取得中に行われた更新は、バックアップから必ず除外される',
    'コピー中も更新でき、コピーの不整合は取得中の WAL を適用して解消される',
    'コピーしたファイルだけで整合性が保たれるため、WAL は不要である',
    'backup_label ファイルの内容は、リストア時には使われない'
  ],
  answer: 2,
  exp: 'オンラインバックアップでは、pg_start_backup() でチェックポイントを実行してから、稼働中のままデータディレクトリをコピーします。コピー中もデータベースは通常どおり更新されるため、コピーしたファイルは時点がそろっていない（不整合な）状態になります。\nリストア時は、backup_label に記録された開始位置から、バックアップ中に生成された WAL を適用することで、整合性のとれた状態に回復します。そのため、WAL アーカイブ（または pg_basebackup の -X で取得した WAL）が必要です。\npg_stop_backup() の戻り値の backup_label の内容は、バックアップと一緒に保存しておく必要があります。',
  refs: [
    ['低レベルAPIを使用したベースバックアップの作成', 'continuous-archiving.html#BACKUP-LOWLEVEL-BASE-BACKUP']
  ]
},
{
  id: 'S2.4-019', level: 'silver', cat: 'S2.4',
  q: '論理バックアップと物理バックアップの違いに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_dump による論理バックアップは異なるメジャーバージョンへの移行に使えるが、リストアには時間がかかる',
    'pg_dump による論理バックアップは、同じメジャーバージョンにしかリストアできない',
    '物理バックアップはファイル単位のコピーなので、異なるアーキテクチャのサーバにもそのまま復元できる',
    '論理バックアップでは、特定のテーブルだけを取り出して復元することはできない',
    '物理バックアップはデータベース単位でしか取得できない'
  ],
  answer: 0,
  exp: 'pg_dump や pg_dumpall による論理バックアップは、SQL 文やそれに相当する形式でデータを取り出します。バージョンやプラットフォームの違いを越えて復元でき、特定のテーブルやスキーマだけを選ぶこともできますが、復元時は SQL を実行し直すため時間がかかります。\n物理バックアップ（ファイルシステムレベルのコピーや pg_basebackup）はデータディレクトリをそのまま複製する方式で、大規模なデータでも高速ですが、同じメジャーバージョン・同じアーキテクチャでしか復元できず、クラスタ全体が対象になります。\nポイントインタイムリカバリは物理バックアップと WAL アーカイブの組み合わせで実現します。',
  refs: [
    ['バックアップとリストア', 'backup.html'],
    ['SQLによるダンプ', 'backup-dump.html']
  ]
},
{
  id: 'S2.4-020', level: 'silver', cat: 'S2.4',
  q: 'pg_dump の `--schema-only` と `--data-only` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '--schema-only はオブジェクト定義だけ、--data-only はデータだけを出力する',
    '--schema-only は指定したスキーマ（名前空間）のオブジェクトだけを出力する',
    '--data-only を指定すると、テーブル定義も含めてデータが出力される',
    '--schema-only と --data-only は同時に指定でき、通常のダンプと同じ結果になる',
    '--data-only で出力したファイルは、空のデータベースにそのままリストアできる'
  ],
  answer: 0,
  exp: '--schema-only はテーブルやインデックスなどの定義だけを、--data-only はデータ（COPY 文や INSERT 文）だけを出力します。両方を同時に指定することはできません。\n特定のスキーマだけを対象にするのは -n（--schema）オプションです。名前が紛らわしいので注意が必要です。\n--data-only のダンプはテーブル定義を含まないため、あらかじめ定義を作ってからでないとリストアできません。定義と分けておくと、既存のデータベースへデータだけを流し込むといった使い方ができます。',
  refs: [
    ['pg_dump', 'app-pgdump.html'],
    ['SQLによるダンプ', 'backup-dump.html']
  ]
},
{
  id: 'S2.4-021', level: 'silver', cat: 'S2.4',
  q: 'PostgreSQL 14 で `pg_basebackup -R` を指定した場合の説明として、正しいものを1つ選びなさい。',
  choices: [
    'standby.signal と、primary_conninfo を書いた postgresql.auto.conf が作成される',
    'recovery.conf が出力先に作成され、そのまま起動すればスタンバイとして動作する',
    'バックアップの取得後に、プライマリサーバが自動的に再起動される',
    '取得したバックアップから、自動的にスタンバイサーバが起動される',
    '取得済みのバックアップを上書き（置き換え）するためのオプションである'
  ],
  answer: 0,
  exp: 'pg_basebackup の -R（--write-recovery-conf）を指定すると、スタンバイとして起動するために必要な設定が出力先に書き込まれます。PostgreSQL 12 以降では standby.signal という空ファイルと、接続情報 primary_conninfo を追記した postgresql.auto.conf が作られます。\nPostgreSQL 11 以前では recovery.conf が作られていました。\nバックアップを取得するだけで、サーバの起動や再起動は行われません。取得後にスタンバイ側のサーバを起動すると、レプリケーションが始まります。',
  refs: [
    ['pg_basebackup', 'app-pgbasebackup.html'],
    ['スタンバイサーバの設定', 'warm-standby.html#STANDBY-SERVER-SETUP']
  ]
},
{
  id: 'S2.4-022', level: 'silver', cat: 'S2.4', type: 'scenario',
  q: 'pg_dump で取得したダンプをリストアしたところ、ロールが存在しないというエラーが出た。原因と対処として、正しいものを1つ選びなさい。',
  choices: [
    'ロールはクラスタ全体の情報で pg_dump には含まれないため、pg_dumpall --globals-only で別に取得して先に流す',
    'pg_dump にはロールが含まれているため、--no-owner を付ければエラーは起きない',
    'ロールは自動的に作成されるはずなので、リストア先のサーバを再起動すれば解消する',
    'ロールは各データベースに属する情報なので、対象データベースを指定して pg_dump を取り直せばよい',
    'pg_restore を使えばロールも復元されるため、プレーンテキスト形式をやめればよい'
  ],
  answer: 0,
  exp: 'ロール（ユーザ）やテーブル空間は特定のデータベースではなくクラスタ全体に属する情報で、pg_dump の出力には含まれません。pg_dumpall --globals-only（-g）でこれらだけを取得し、リストア先で先に実行してからデータベースのダンプを流します。\npg_dumpall をオプションなしで実行すると、グローバルな情報と全データベースをまとめて出力します。\n--no-owner は所有者の設定を省く指定で、所有者を元どおりにしたい場合の解決にはなりません。\n出力形式を変えてもロールは含まれません。',
  refs: [
    ['pg_dumpall', 'app-pg-dumpall.html'],
    ['データベース全体のダンプ', 'backup-dump.html#BACKUP-DUMP-ALL']
  ]
},
{
  id: 'S2.4-023', level: 'silver', cat: 'S2.4',
  q: 'pg_dump の実行中のデータの一貫性に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '開始時点のスナップショットに基づいてダンプされるため、実行中に行われた更新は含まれない',
    'ダンプ中はテーブルへの更新がブロックされるため、アプリケーションを停止する必要がある',
    'テーブルごとに別々の時点が読み取られるため、テーブル間で整合しないことがある',
    '一貫性を保つには、pg_dump の実行前に必ず CHECKPOINT を実行する必要がある',
    'pg_dump は WAL を読み取るため、実行時点の一貫性は保証されない'
  ],
  answer: 0,
  exp: 'pg_dump は開始時にスナップショットを取得し、その時点のデータベースの状態を一貫した形で出力します。実行中に他のセッションが行った更新はダンプに含まれません。テーブル間の整合性も保たれます。\nMVCC により、ダンプ中も他のセッションは通常どおり参照と更新を続けられます。ただし ACCESS SHARE ロックを取得するため、ALTER TABLE や DROP TABLE のような排他ロックを必要とする操作とは競合します。\n長時間のダンプは、その間の不要タプルを VACUUM が回収できない要因にもなります。',
  refs: [
    ['SQLによるダンプ', 'backup-dump.html'],
    ['pg_dump', 'app-pgdump.html']
  ]
},
{
  id: 'S2.4-024', level: 'silver', cat: 'S2.4',
  q: 'WAL アーカイブの運用で、archive_command が失敗し続けた場合の説明として、正しいものを1つ選びなさい。',
  choices: [
    'サーバは成功するまで再試行し、その間 WAL が pg_wal に蓄積されてディスクを圧迫する',
    '一定回数の再試行の後にその WAL は破棄され、サーバは通常どおり処理を続ける',
    'アーカイブに失敗するとサーバは直ちに停止する',
    '失敗した WAL は次回のチェックポイントで自動的に再作成されるため、影響はない',
    'archive_command の終了ステータスは無視されるため、失敗しても検知できない'
  ],
  answer: 0,
  exp: 'archive_command は終了ステータス 0 を返したときだけ成功とみなされ、失敗した場合はサーバが成功するまで再試行を続けます。その間、該当する WAL セグメントは削除されずに pg_wal に残るため、放置するとディスクが満杯になり、最終的にサーバが停止します。\nアーカイブの状況は pg_stat_archiver ビュー（last_failed_wal、failed_count など）やサーバログで監視します。\nまた archive_command は、同名のファイルが既に存在する場合に上書きせず失敗するように書くのが原則です（cp ではなく test ! -f と組み合わせるなど）。',
  refs: [
    ['WALアーカイブの設定', 'continuous-archiving.html#BACKUP-ARCHIVING-WAL'],
    ['pg_stat_archiver', 'monitoring-stats.html#MONITORING-PG-STAT-ARCHIVER-VIEW']
  ]
},
{
  id: 'S2.4-025', level: 'silver', cat: 'S2.4',
  q: 'ダンプのリストア方法に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'プレーンテキスト形式は psql で、カスタム形式やディレクトリ形式は pg_restore で復元する',
    'プレーンテキスト形式は pg_restore で、カスタム形式は psql で復元する',
    'どの形式のダンプも psql で復元できる',
    'pg_restore は既存のオブジェクトがあると必ずエラーで停止し、回避する方法はない',
    'pg_restore で復元する前に、対象データベースを必ず pg_restore が作成するため createdb は不要である'
  ],
  answer: 0,
  exp: 'pg_dump -Fp（既定）のプレーンテキスト形式は SQL 文の並びなので、psql -f dump.sql dbname のように流し込みます。-Fc（カスタム）、-Fd（ディレクトリ）、-Ft（tar）形式は pg_restore -d dbname で復元します。\npg_restore では --clean（復元前に既存オブジェクトを削除）と --if-exists を組み合わせると、存在しない場合のエラーを避けられます。\n復元先のデータベースは事前に createdb で作るか、pg_restore に -C を指定して作成させます。\n途中でエラーが起きても止めたくない場合を除き、psql では -v ON_ERROR_STOP=1 を付けるのが安全です。',
  refs: [
    ['ダンプのリストア', 'backup-dump.html#BACKUP-DUMP-RESTORE'],
    ['pg_restore', 'app-pgrestore.html']
  ]
},
{
  id: 'S2.4-026', level: 'silver', cat: 'S2.4',
  q: 'バックアップコマンドの対応に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'pg_dumpall の出力はプレーンテキストなので、psql で復元する',
    'pg_dumpall の -g オプションは、ロールなどのグローバルオブジェクトだけを出力する',
    'pg_dumpall の出力は pg_restore で復元する',
    'pg_dump はデータベースクラスタ全体を対象にできる',
    'pg_dump は物理バックアップを取得するコマンドである'
  ],
  answer: [0, 1],
  exp: 'pg_dumpall はクラスタ全体を対象とし、出力形式はプレーンテキストだけです。したがって復元は psql で行い、pg_restore は使えません。\n-g（--globals-only）を付けると、ロールやテーブル空間といったクラスタ共通のオブジェクトだけを出力します。データベースごとのダンプを pg_dump で取る運用では、これと組み合わせるのが定石です。\npg_dump が対象にできるのは1つのデータベースで、クラスタ全体は扱えません。\nどちらも SQL レベルで取り出す論理バックアップで、物理バックアップは pg_basebackup やファイルシステムレベルのコピーで取得します。',
  refs: [
    ['pg_dumpall', 'app-pg-dumpall.html'],
    ['SQLによるダンプ', 'backup-dump.html']
  ]
},
{
  id: 'S2.4-027', level: 'silver', cat: 'S2.4',
  q: 'pg_dump で対象を絞り込むオプションに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    '`-t` は対象テーブル、`-n` は対象スキーマを指定する',
    '`-T` と `-N` は、それぞれテーブルとスキーマを除外する',
    '`-t` はワイルドカードを使えないため、テーブルを1つずつ指定する必要がある',
    '`-t` でテーブルを指定すると、そのテーブルが参照する外部キー先のテーブルも自動的に含まれる',
    '`-n` でスキーマを指定すると、そのスキーマのテーブルだけが対象となり、インデックスは含まれない'
  ],
  answer: [0, 1],
  exp: 'pg_dump では `-t`（--table）で対象テーブル、`-n`（--schema）で対象スキーマを指定でき、`-T`（--exclude-table）と `-N`（--exclude-schema）でそれぞれ除外できます。複数回の指定も可能です。\nパターンには psql の \\d と同じワイルドカード（`-t "app.*"` など）が使えます。\n指定したテーブルが依存している他のテーブルは自動では含まれないため、外部キーのある構成では復元時にエラーになることがあります。必要なテーブルは明示的に指定します。\nスキーマを指定した場合、そのスキーマのインデックスや制約は当然含まれます。',
  refs: [
    ['pg_dump', 'app-pgdump.html'],
    ['SQLによるダンプ', 'backup-dump.html']
  ]
},
{
  id: 'S2.4-028', level: 'silver', cat: 'S2.4', type: 'scenario',
  q: 'カスタム形式のダンプに対して `pg_restore -l` を実行したところ、次の出力が得られた（コメント行は省略）。説明として正しいものを1つ選びなさい。',
  code: '$ pg_dump -Fc -f shop2.dump shop2\n$ pg_restore -l shop2.dump\n209; 1259 24592 TABLE public products app_owner\n3364; 0 0 ACL public TABLE products app_owner\n3357; 0 24592 TABLE DATA public products app_owner\n3217; 2606 24598 CONSTRAINT public products products_pkey app_owner\n3215; 1259 24599 INDEX public products_name_idx app_owner',
  choices: [
    'ダンプに含まれる項目の一覧で、不要な行を削除したファイルを -L に渡すと一部だけリストアできる',
    'この一覧はリストアを実行した結果で、すでに5つのオブジェクトがデータベースに作成されている',
    'TABLE DATA の行がないので、このダンプにはデータが含まれていない',
    '一覧の順番どおりに実行されるため、インデックスを先に作りたい場合は -L を使えない',
    '最後の列はオブジェクトを作成したクライアントの OS ユーザ名を表す'
  ],
  answer: 0,
  exp: 'pg_restore -l は、カスタム形式やディレクトリ形式のダンプに含まれる項目（TOC: 目次）を一覧表示するだけで、データベースには何もしません。表示された行を編集（不要な行を削除したり、行頭に ; を付けてコメントにしたり）したファイルを pg_restore -L に渡すと、その項目だけを、そのファイルの順序でリストアできます。\nこの例では、テーブル定義（TABLE）、権限（ACL）、データ（TABLE DATA）、主キー制約（CONSTRAINT）、インデックス（INDEX）が含まれています。末尾の app_owner はオブジェクトの所有者（ロール）です。\nこの出力は PostgreSQL 14 で実際に採取したものです。',
  refs: [
    ['pg_restore', 'app-pgrestore.html'],
    ['pg_dump', 'app-pgdump.html']
  ]
},
{
  id: 'S2.4-029', level: 'silver', cat: 'S2.4', type: 'scenario',
  q: '別のサーバで作ったダンプを、新しいサーバにリストアしたところ次の出力になった。リストア後の状態の説明として、適切なものを2つ選びなさい。',
  code: '$ pg_restore -d shop2 shop2.dump\npg_restore: while PROCESSING TOC:\npg_restore: from TOC entry 209; 1259 24592 TABLE products app_owner\npg_restore: error: could not execute query: ERROR:  role "app_owner" does not exist\nCommand was: ALTER TABLE public.products OWNER TO app_owner;\n\npg_restore: warning: errors ignored on restore: 1\n$ echo $?\n1',
  choices: [
    'エラーになった所有者の変更以外は実行され、products テーブルとデータはリストアされている',
    'products テーブルの所有者は、app_owner ではなくリストアを実行したロールになっている',
    'エラーが1件あったため、リストア全体がロールバックされて何も作成されていない',
    '終了ステータスは 1 だが、警告だけなので処理結果に問題はない',
    'pg_restore が自動的にロール app_owner を作成したうえで、所有者を設定している'
  ],
  answer: [0, 1],
  exp: 'pg_restore は既定では、エラーが起きても次の項目の処理を続けます（「errors ignored on restore」）。この例では所有者を app_owner に変更する ALTER TABLE だけが失敗し、テーブル、データ、制約、インデックスは作成されました。実際に確認すると products には 1000 行が入っており、所有者はリストアを実行した postgres でした。\nただし終了ステータスは 1 なので、スクリプトから実行する場合は失敗として扱われます。\nロールはクラスタ全体のオブジェクトで pg_dump には含まれないため、事前に pg_dumpall --globals-only などで作っておくか、所有者を気にしない場合は --no-owner を指定します。途中で止めて全体を取り消したい場合は --exit-on-error や --single-transaction を使います。\nこの出力は PostgreSQL 14 で実際に採取したものです。',
  refs: [
    ['pg_restore', 'app-pgrestore.html'],
    ['pg_dumpall', 'app-pg-dumpall.html']
  ]
},
{
  id: 'S2.4-030', level: 'silver', cat: 'S2.4', type: 'scenario',
  q: '次のコマンドを実行したところ、エラーになった。対処として正しいものを1つ選びなさい。',
  code: '$ pg_dump -f shop2.sql shop2\n$ pg_restore -d shop2 shop2.sql\npg_restore: error: input file appears to be a text format dump. Please use psql.',
  choices: [
    'プレーンテキスト形式のダンプなので、psql -d shop2 -f shop2.sql で流し込む',
    'pg_restore に -Fc を付けて、カスタム形式として読み込ませる',
    'ダンプファイルが壊れているので、pg_dump をやり直す',
    'データベース shop2 を削除してから、同じ pg_restore を実行し直す',
    'pg_restore に -j 4 を付けて、並列で読み込ませる'
  ],
  answer: 0,
  exp: 'pg_dump で -F を指定しない場合の出力はプレーンテキスト形式（SQL 文の並び）です。この形式は pg_restore では扱えず、psql で実行します。メッセージもそのように案内しています。\npg_restore が読めるのは、カスタム形式（-Fc）、ディレクトリ形式（-Fd）、tar 形式（-Ft）のダンプです。pg_restore -F は入力形式の指定ですが、ファイルの実体がテキスト形式なので読み込めません。\n一部だけのリストアや並列リストア（-j）を使いたい場合は、最初からカスタム形式かディレクトリ形式でダンプしておきます。\nこのエラーは PostgreSQL 14 で実際に出力されたものです。',
  refs: [
    ['SQLダンプからのリストア', 'backup-dump.html#BACKUP-DUMP-RESTORE'],
    ['pg_restore', 'app-pgrestore.html']
  ]
},

/* ---------------- S2.5 基本的な運用管理作業（重要度 7 / 27問） ---------------- */
{
  id: 'S2.5-001', level: 'silver', cat: 'S2.5',
  q: '`VACUUM`（FULL オプションなし）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '実行中は対象テーブルに排他ロックがかかり、SELECT もブロックされる',
    'テーブルを新しいファイルに書き直し、ファイルサイズを最小化する',
    '不要になった行の領域を再利用可能にするが、原則として OS には返却しない',
    'オプションを指定しなくても、プランナ用の統計情報が必ず更新される',
    'トランザクションブロック（BEGIN ～ COMMIT）の中で実行できる'
  ],
  answer: 2,
  exp: '通常の VACUUM は不要タプルの領域を回収して同じテーブル内で再利用可能にします。テーブル末尾の完全に空いたページを除き、領域は OS に返却されません。SHARE UPDATE EXCLUSIVE ロックで動作するため、実行中も通常の読み書きが可能です。\nテーブルを書き直して OS に領域を返すのは VACUUM FULL で、ACCESS EXCLUSIVE ロックを必要とします。\n統計情報を更新するには ANALYZE（または VACUUM ANALYZE）を使います。VACUUM はトランザクションブロック内では実行できません。',
  refs: [
    ['定常的なバキューム作業', 'routine-vacuuming.html'],
    ['VACUUM', 'sql-vacuum.html']
  ]
},
{
  id: 'S2.5-002', level: 'silver', cat: 'S2.5',
  q: '`CREATE USER` と `CREATE ROLE` の違いとして、正しいものを1つ選びなさい。',
  choices: [
    'CREATE USER で作成したものだけがログインでき、CREATE ROLE ではログイン可能なロールを作成できない',
    'CREATE USER は既定で LOGIN 属性が付与される点を除き、CREATE ROLE と同じである',
    'CREATE USER で作成したユーザは、他のロールのメンバーになることができない',
    'CREATE USER はスーパーユーザを作成するためのコマンドである',
    'CREATE ROLE は OS ユーザも同時に作成する'
  ],
  answer: 1,
  exp: 'PostgreSQL ではユーザとグループは「ロール」に統合されています。CREATE USER は CREATE ROLE の別名で、既定で LOGIN 属性が付く点だけが異なります（CREATE ROLE の既定は NOLOGIN）。\nCREATE ROLE name LOGIN とすればログイン可能なロールを作成できます。どちらで作成したロールも他のロールのメンバーになれます。OS ユーザとは無関係です。',
  refs: [
    ['CREATE USER', 'sql-createuser.html'],
    ['CREATE ROLE', 'sql-createrole.html'],
    ['データベースロール', 'database-roles.html']
  ]
},
{
  id: 'S2.5-003', level: 'silver', cat: 'S2.5',
  q: '`ANALYZE` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '削除や更新によって不要になった行の領域を回収する',
    'テーブルの統計情報を収集して pg_statistic に格納し、プランナが利用する',
    '実行中は対象テーブルに排他ロックがかかり、SELECT もブロックされる',
    '大きなテーブルでも、常に全行を読み込んで統計情報を作成する',
    '一度実行すると、以後その問い合わせの実行計画が固定される'
  ],
  answer: 1,
  exp: 'ANALYZE はテーブルの列の値の分布などの統計情報を収集し、pg_statistic に格納します。プランナはこの統計情報を使って行数を見積もり、実行計画を選択します。\n大きなテーブルではランダムサンプリング（統計目標 × 300 行）を行うため、全行は読み込みません。\nANALYZE は SHARE UPDATE EXCLUSIVE ロックを取得するため、通常の読み書きと並行して実行できます。\n不要行の領域を回収するのは VACUUM です。',
  refs: [
    ['ANALYZE', 'sql-analyze.html'],
    ['プランナ用統計情報の更新', 'routine-vacuuming.html#VACUUM-FOR-STATISTICS']
  ]
},
{
  id: 'S2.5-004', level: 'silver', cat: 'S2.5',
  q: 'ロール alice に、テーブル orders の参照（SELECT）だけを許可する SQL として、正しいものを1つ選びなさい。',
  choices: [
    'GRANT SELECT ON orders TO alice;',
    'GRANT READ ON orders TO alice;',
    'GRANT orders SELECT TO alice;',
    'ALTER TABLE orders GRANT SELECT TO alice;',
    'REVOKE ALL ON orders FROM alice EXCEPT SELECT;'
  ],
  answer: 0,
  exp: 'オブジェクトに対する権限は GRANT 権限 ON オブジェクト TO ロール で付与し、REVOKE 権限 ON オブジェクト FROM ロール で取り消します。テーブルに対して付与できる権限には SELECT、INSERT、UPDATE、DELETE、TRUNCATE、REFERENCES、TRIGGER などがあり、ALL PRIVILEGES ですべての権限を指定できます。\nREAD という権限はなく、ALTER TABLE に GRANT 句はありません。',
  refs: [
    ['GRANT', 'sql-grant.html'],
    ['REVOKE', 'sql-revoke.html'],
    ['権限', 'ddl-priv.html']
  ]
},
{
  id: 'S2.5-005', level: 'silver', cat: 'S2.5',
  q: 'テーブルの所有者と権限に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'テーブルを作成すると、既定で PUBLIC にすべての権限が付与される',
    'テーブルの所有者であっても、自分で SELECT 権限を GRANT しなければ参照できない',
    'テーブルの所有者は、作成後に変更することはできない',
    'テーブルの削除（DROP TABLE）は、そのテーブルに SELECT 権限を持つロールなら誰でも実行できる',
    'テーブルを作成したロールは所有者となり、そのテーブルに対するすべての権限を持ち、他のロールに権限を付与できる'
  ],
  answer: 4,
  exp: 'オブジェクトを作成したロールがその所有者となり、所有者はすべての権限を持ちます。所有者は GRANT で他のロールに権限を付与できます。\nテーブルの場合、作成時点では所有者（とスーパーユーザ）以外は権限を持たず、PUBLIC には何も付与されません（データベースや関数など、オブジェクトの種類によっては PUBLIC に既定の権限があります）。\nDROP や ALTER などの操作は所有者（またはスーパーユーザ）に限られ、権限として付与することはできません。所有者は ALTER TABLE ... OWNER TO で変更できます。',
  refs: [
    ['権限', 'ddl-priv.html'],
    ['ALTER TABLE', 'sql-altertable.html']
  ]
},
{
  id: 'S2.5-006', level: 'silver', cat: 'S2.5',
  q: '現在のセッションで有効なユーザ（ロール）名を取得する SQL として、正しいものを1つ選びなさい。',
  choices: [
    'SELECT current_user;',
    'SELECT version();',
    'SELECT current_database();',
    'SELECT current_schema;',
    'SELECT inet_server_addr();'
  ],
  answer: 0,
  exp: 'current_user は現在の実行コンテキストのユーザ名を返します（user も同じ意味です。SET ROLE などで変更される前のセッションユーザは session_user で取得できます）。\nversion() は PostgreSQL のバージョン情報の文字列、current_database() は接続中のデータベース名、current_schema は search_path の先頭で有効なスキーマ名、inet_server_addr() はサーバの IP アドレスを返します。\nなお、current_user などは SQL 標準の特別な構文のため、括弧を付けずに記述します。',
  refs: [
    ['セッション情報関数', 'functions-info.html']
  ]
},
{
  id: 'S2.5-007', level: 'silver', cat: 'S2.5',
  q: '`vacuumdb` コマンドに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'サーバを停止した状態で、データファイルに対して直接バキュームを行う',
    '-f オプションは、処理を簡略化して高速に実行するためのオプションである',
    'VACUUM のみを行うコマンドであり、統計情報の収集（ANALYZE）は実行できない',
    'VACUUM を実行するラッパーで、-z を付けると ANALYZE も行う',
    '自動バキュームが有効（autovacuum = on）な場合は、実行できない'
  ],
  answer: 3,
  exp: 'vacuumdb はサーバに接続して SQL の VACUUM を実行するラッパーコマンドです。主なオプションは次のとおりです。\n・-a（--all）: すべてのデータベースを対象にする\n・-z（--analyze）: VACUUM とあわせて統計情報も更新する\n・-Z（--analyze-only）: ANALYZE だけを行う\n・-f（--full）: VACUUM FULL を行う\n・-t（--table）: 対象テーブルを指定する\n・-j（--jobs）: 並列に実行する\n自動バキュームが有効でも、手動で実行できます。',
  refs: [
    ['vacuumdb', 'app-vacuumdb.html'],
    ['VACUUM', 'sql-vacuum.html']
  ]
},
{
  id: 'S2.5-008', level: 'silver', cat: 'S2.5',
  q: '自動バキュームに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'PostgreSQL 14 では、自動バキュームは既定で無効（autovacuum = off）である',
    '定期的に VACUUM FULL を実行し、テーブルの領域を OS に返却する',
    'autovacuum launcher が起動するワーカーが、閾値を超えたテーブルに VACUUM と ANALYZE を行う',
    'テーブルごとに自動バキュームの閾値を変更することはできない',
    'track_counts を off にしても、自動バキュームは対象テーブルを正しく判定できる'
  ],
  answer: 2,
  exp: '自動バキュームは既定で有効（autovacuum = on）で、autovacuum launcher が autovacuum_naptime ごとに各データベースを確認し、ワーカープロセスを起動して、閾値を超えたテーブルに VACUUM と ANALYZE を実行します。対象の判定には行の挿入・更新・削除の統計を使うため、track_counts が on である必要があります。\n自動バキュームが行うのは通常の VACUUM で、VACUUM FULL は行いません。\nテーブルのストレージパラメータ（ALTER TABLE ... SET (autovacuum_vacuum_scale_factor = ...) など）で、テーブルごとに閾値を変更したり無効にしたりできます。',
  refs: [
    ['自動バキュームデーモン', 'routine-vacuuming.html#AUTOVACUUM'],
    ['自動Vacuum作業のパラメータ', 'runtime-config-autovacuum.html']
  ]
},
{
  id: 'S2.5-009', level: 'silver', cat: 'S2.5',
  q: '`pg_ctl start -D /var/lib/pgsql/data -l logfile` の説明として、正しいものを1つ選びなさい。',
  choices: [
    '-l はサーバのロケールを指定するオプションである',
    '-D を省略した場合は、ホームディレクトリの data が使われる',
    '-l で指定したファイルに、サーバの出力（ログ）が追記される',
    '-l を指定すると、サーバの起動完了を待たずにすぐ戻る',
    '-D で指定したディレクトリが存在しない場合は、自動的に initdb が実行される'
  ],
  answer: 2,
  exp: 'pg_ctl start はデータベースサーバを起動します。-D でデータディレクトリを指定し、省略した場合は環境変数 PGDATA が使われます。-l（--log）で指定したファイルには、サーバの標準出力と標準エラー出力が追記されます。\n起動完了を待つかどうかは -w（待つ、start の既定）と -W（待たない）で指定します。postgres コマンドにオプションを渡す場合は -o を使います。\nデータディレクトリが存在しなくても initdb は自動実行されません（pg_ctl init で initdb を実行することはできます）。',
  refs: [
    ['pg_ctl', 'app-pg-ctl.html'],
    ['データベースサーバの起動', 'server-start.html']
  ]
},
{
  id: 'S2.5-010', level: 'silver', cat: 'S2.5',
  q: 'ロール alice のパスワードの有効期限を 2026年12月31日までに設定する SQL として、正しいものを1つ選びなさい。',
  choices: [
    'ALTER ROLE alice VALID UNTIL \'2026-12-31\';',
    'ALTER ROLE alice PASSWORD EXPIRE \'2026-12-31\';',
    'ALTER ROLE alice EXPIRES AT \'2026-12-31\';',
    'ALTER ROLE alice SET password_expiry = \'2026-12-31\';',
    'ALTER ROLE alice LOGIN UNTIL \'2026-12-31\';'
  ],
  answer: 0,
  exp: 'CREATE ROLE / ALTER ROLE の VALID UNTIL 句は、ロールのパスワードが有効な期限を日時で指定します。期限を過ぎるとパスワード認証でログインできなくなります（パスワードを使わない認証方式には影響しません）。\nほかに、ALTER ROLE では LOGIN / NOLOGIN、CREATEDB、CREATEROLE、SUPERUSER、CONNECTION LIMIT、PASSWORD などの属性を変更できます。\nPASSWORD EXPIRE や EXPIRES AT という構文はありません。',
  refs: [
    ['ALTER ROLE', 'sql-alterrole.html'],
    ['CREATE ROLE', 'sql-createrole.html']
  ]
},
{
  id: 'S2.5-011', level: 'silver', cat: 'S2.5',
  q: 'ロールのメンバーシップに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'GRANT はテーブルなどの権限の付与にしか使えず、ロールを他のロールのメンバーにすることはできない',
    'NOINHERIT 属性を持つロールも、メンバーになったロールの権限を自動的に使用できる',
    'GRANT staff TO alice; の後、INHERIT 属性の alice は staff の権限を自動的に使える',
    'メンバーになったロールには、親ロールの LOGIN や SUPERUSER などの属性も継承される',
    '他のロールの権限で動作するための SET ROLE コマンドは用意されていない'
  ],
  answer: 2,
  exp: 'GRANT ロール名 TO ロール名 で、ロールを別のロール（グループロール）のメンバーにできます。INHERIT 属性（既定）を持つロールは、所属するロールに付与されたオブジェクトの権限を自動的に使えます。NOINHERIT の場合は SET ROLE でそのロールに切り替えて使います。\nLOGIN、SUPERUSER、CREATEDB、CREATEROLE などのロール属性はメンバーシップによって継承されません。\nグループロールに権限をまとめて付与し、ユーザをメンバーにする方法は、権限管理を簡単にする一般的な方法です。',
  refs: [
    ['ロールのメンバーシップ', 'role-membership.html'],
    ['GRANT', 'sql-grant.html']
  ]
},
{
  id: 'S2.5-012', level: 'silver', cat: 'S2.5',
  q: 'テーブルの一覧を取得するビューに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'information_schema.tables は SQL 標準、pg_tables は PostgreSQL 固有のビューである',
    'information_schema は PostgreSQL 独自の仕組みで、他のデータベース製品には存在しない',
    'pg_tables には、ビューやシーケンスも含めたすべてのリレーションが表示される',
    'information_schema のビューは、アクセス権限のないテーブルも含めてすべて表示する',
    'システムビューを参照するには、psql のメタコマンドを使う必要があり、SELECT 文では参照できない'
  ],
  answer: 0,
  exp: 'information_schema は SQL 標準で定義されたスキーマで、tables、columns、views などのビューからデータベースの定義情報を取得できます。標準に準拠しているため、他のデータベース製品と共通の問い合わせを書きやすい一方、PostgreSQL 固有の情報は含まれません。\npg_catalog の pg_tables、pg_class などは PostgreSQL 固有のシステムカタログ・システムビューで、より詳しい情報を得られます。pg_tables はテーブルだけを表示します（ビューは pg_views）。\ninformation_schema のビューは、現在のユーザがアクセスできるオブジェクトだけを表示します。いずれも SELECT 文で参照でき、psql の \\dt なども内部でシステムカタログを問い合わせています。',
  refs: [
    ['情報スキーマ', 'information-schema.html'],
    ['pg_tables', 'view-pg-tables.html']
  ]
},
{
  id: 'S2.5-013', level: 'silver', cat: 'S2.5',
  q: 'テーブルなどのオブジェクトを所有しているロール bob を削除する方法として、正しいものを1つ選びなさい。',
  choices: [
    'DROP ROLE bob; を実行すれば、所有するオブジェクトも自動的に削除される',
    'DROP ROLE bob CASCADE; を実行する',
    'REASSIGN OWNED と DROP OWNED で所有物と権限を処理してから DROP ROLE する',
    'bob のパスワードを削除すれば、DROP ROLE bob; を実行しなくてもロールは削除される',
    'オブジェクトを所有しているロールは、どのような方法でも削除できない'
  ],
  answer: 2,
  exp: 'オブジェクトを所有していたり、オブジェクトに対する権限を付与されていたりするロールは、DROP ROLE で削除しようとするとエラーになります（DROP ROLE に CASCADE オプションはありません）。\n削除する前に、REASSIGN OWNED BY bob TO alice; で bob が所有するオブジェクトの所有者を別のロールに変更し、DROP OWNED BY bob; で bob に付与された権限（や残っている所有オブジェクト）を削除します。これらはデータベースごとの処理なので、bob がオブジェクトを持つ各データベースで実行してから、DROP ROLE bob; を実行します。',
  refs: [
    ['ロールの削除', 'role-removal.html'],
    ['REASSIGN OWNED', 'sql-reassign-owned.html']
  ]
},
{
  id: 'S2.5-014', level: 'silver', cat: 'S2.5',
  q: '`ALTER DEFAULT PRIVILEGES` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'すでに存在するすべてのテーブルに対して、一括で権限を付与する',
    'ロールの既定の属性（LOGIN など）を変更する',
    '今後作成されるテーブルなどのオブジェクトに、自動的に付与する権限を設定する',
    'PUBLIC に付与されている既定の権限を、すべて取り消す',
    'スーパーユーザの権限を一般ユーザに付与する'
  ],
  answer: 2,
  exp: 'ALTER DEFAULT PRIVILEGES は、これから作成されるオブジェクトに適用される既定の権限を設定するコマンドです。例えば ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT ON TABLES TO readonly; を実行すると、以後（実行したロールが）スキーマ app に作成するテーブルに対して、readonly ロールへの SELECT 権限が自動的に付与されます。\n既に存在するオブジェクトには影響しないため、既存のテーブルには GRANT SELECT ON ALL TABLES IN SCHEMA app TO readonly; で別途付与します。',
  refs: [
    ['ALTER DEFAULT PRIVILEGES', 'sql-alterdefaultprivileges.html'],
    ['GRANT', 'sql-grant.html']
  ]
},
{
  id: 'S2.5-015', level: 'silver', cat: 'S2.5',
  q: '`GRANT SELECT ON orders TO alice WITH GRANT OPTION;` の説明として、正しいものを1つ選びなさい。',
  choices: [
    'alice に SELECT 権限を付与し、alice はその権限をさらに他のロールへ付与することもできる',
    'alice に orders に対するすべての権限を付与する',
    'alice をスーパーユーザにする',
    'alice に SELECT 権限を一時的に付与し、セッション終了時に自動的に取り消す',
    'alice に GRANT コマンドを実行する権限だけを付与し、SELECT 権限は付与しない'
  ],
  answer: 0,
  exp: 'WITH GRANT OPTION を付けて権限を付与すると、付与されたロールは、その権限を他のロールにさらに付与（GRANT）できるようになります。\nこの付与を取り消す場合、REVOKE SELECT ON orders FROM alice; は、alice が他のロールに再付与した権限が残っているとエラーになるため、CASCADE を付けて依存する権限も取り消します。付与の権利だけを取り消すには REVOKE GRANT OPTION FOR SELECT ON orders FROM alice; を使います。',
  refs: [
    ['GRANT', 'sql-grant.html'],
    ['REVOKE', 'sql-revoke.html']
  ]
},
{
  id: 'S2.5-016', level: 'silver', cat: 'S2.5',
  q: '特定のロールだけがデータベース sales に接続できるようにしたい。PostgreSQL の権限として、まず行う必要がある操作を1つ選びなさい。',
  choices: [
    'REVOKE SELECT ON DATABASE sales FROM PUBLIC; を実行する',
    'REVOKE CONNECT ON DATABASE sales FROM PUBLIC; を実行し、必要なロールに CONNECT 権限を付与する',
    'データベースに対する権限は既定で誰にも付与されていないため、何もしなくてよい',
    'ALTER DATABASE sales NOLOGIN; を実行する',
    'DROP PUBLIC ON DATABASE sales; を実行する'
  ],
  answer: 1,
  exp: 'データベースの CONNECT 権限（と TEMPORARY 権限）は、既定で PUBLIC（すべてのロール）に付与されています。そのため、pg_hba.conf で接続が許可されていれば、どのロールでもデータベースに接続できます。\n接続できるロールを限定するには、REVOKE CONNECT ON DATABASE sales FROM PUBLIC; で PUBLIC の権限を取り消し、GRANT CONNECT ON DATABASE sales TO sales_users; のように必要なロールに付与します。pg_hba.conf のデータベース欄で制限する方法と組み合わせることもできます。\n同様に、関数の EXECUTE 権限なども既定で PUBLIC に付与されています。',
  refs: [
    ['権限', 'ddl-priv.html'],
    ['GRANT', 'sql-grant.html']
  ]
},
{
  id: 'S2.5-017', level: 'silver', cat: 'S2.5',
  q: 'テーブル orders の列 customer_id についてだけ、統計情報を更新する SQL として正しいものを1つ選びなさい。',
  choices: [
    'ANALYZE orders (customer_id);',
    'ANALYZE COLUMN orders.customer_id;',
    'VACUUM orders.customer_id;',
    'UPDATE STATISTICS orders (customer_id);',
    'ANALYZE orders WHERE customer_id IS NOT NULL;'
  ],
  answer: 0,
  exp: 'ANALYZE テーブル名 (列名, ...) のように列のリストを指定すると、指定した列だけの統計情報を収集します。大きなテーブルで、特定の列の分布が変わった場合などに使えます。テーブル名を省略すると、現在のデータベースのすべてのテーブルが対象になります。\nVACUUM ANALYZE orders (customer_id); のように VACUUM と組み合わせることもできます。VERBOSE を付けると処理の詳細が表示されます。\nUPDATE STATISTICS は他のデータベース製品のコマンドで、PostgreSQL にはありません。',
  refs: [
    ['ANALYZE', 'sql-analyze.html']
  ]
},
{
  id: 'S2.5-018', level: 'silver', cat: 'S2.5',
  q: 'データベースサーバが起動した日時を取得する関数として、正しいものを1つ選びなさい。',
  choices: [
    'now()',
    'current_timestamp',
    'pg_conf_load_time()',
    'pg_postmaster_start_time()',
    'clock_timestamp()'
  ],
  answer: 3,
  shuffle: false,
  exp: 'pg_postmaster_start_time() は、サーバ（postmaster）が起動した日時を返します。SELECT now() - pg_postmaster_start_time(); で稼働時間を求めることもできます。\npg_conf_load_time() は、設定ファイルが最後に読み込まれた日時（起動時または再読み込み時）を返すため、reload が行われたかの確認に使えます。\nnow() と current_timestamp は現在のトランザクションの開始時刻、clock_timestamp() は実際の現在時刻を返します。',
  refs: [
    ['セッション情報関数', 'functions-info.html']
  ]
},
{
  id: 'S2.5-019', level: 'silver', cat: 'S2.5',
  q: '現在サーバに接続しているセッションを確認する方法として、正しいものを1つ選びなさい。',
  choices: [
    'pg_stat_activity ビューを参照し、usename や state などの列を確認する',
    'pg_settings ビューを参照し、接続中のセッションの一覧とその状態を確認する',
    'pg_database ビューを参照すると、接続中のセッションが1行ずつ表示される',
    'psql の \\l を実行すると、接続中のセッションの一覧が表示される',
    '接続中のセッションを SQL で確認する方法はなく、サーバログを見るしかない'
  ],
  answer: 0,
  exp: 'pg_stat_activity は現在のセッションを1行ずつ表示するビューで、pid（プロセス ID）、datname（接続先データベース）、usename（ロール）、client_addr（接続元）、state（active、idle、idle in transaction など）、query（直近の問い合わせ）、backend_start や state_change といった時刻の列があります。\n他のロールのセッションの query 列を見るには、スーパーユーザか pg_read_all_stats などの権限が必要です。\n問題のあるセッションは pg_cancel_backend(pid) や pg_terminate_backend(pid) で停止できます。\n\\l はデータベースの一覧を表示するメタコマンドです。',
  refs: [
    ['pg_stat_activity', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW'],
    ['サーバシグナル送信関数', 'functions-admin.html#FUNCTIONS-ADMIN-SIGNAL']
  ]
},
{
  id: 'S2.5-020', level: 'silver', cat: 'S2.5',
  q: 'ロールの属性に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'NOLOGIN 属性のロールはそれ自体では接続できないが、他のロールに権限をまとめて与えるグループとして使える',
    'NOLOGIN 属性のロールは、パスワードを設定すれば接続できるようになる',
    'SUPERUSER 属性を持つロールでも、テーブルの権限検査は通常どおり適用される',
    'CREATEDB 属性を持つロールは、他のロールを作成することもできる',
    'ロールの属性は作成時にしか指定できず、後から変更することはできない'
  ],
  answer: 0,
  exp: 'LOGIN 属性を持たない（NOLOGIN の）ロールはクライアントから直接接続できません。権限をまとめた「グループ」として使い、GRANT グループ名 TO ユーザ名; でメンバーにする使い方が一般的です。CREATE USER は LOGIN 付き、CREATE ROLE は LOGIN なしでロールを作成します。\nSUPERUSER 属性を持つロールは、すべての権限検査を迂回します。\n他のロールを作成できるのは CREATEROLE 属性（またはスーパーユーザ）で、CREATEDB はデータベース作成の権限です。\n属性は ALTER ROLE で後から変更できます。',
  refs: [
    ['ロールの属性', 'role-attributes.html'],
    ['ロールのメンバ資格', 'role-membership.html']
  ]
},
{
  id: 'S2.5-021', level: 'silver', cat: 'S2.5',
  q: 'ロール alice がスキーマ app 内のテーブルを参照できるようにしたい。必要な権限の説明として、正しいものを1つ選びなさい。',
  choices: [
    'テーブルへの SELECT 権限に加えて、スキーマ app への USAGE 権限が必要である',
    'テーブルへの SELECT 権限だけでよく、スキーマの権限は関係しない',
    'スキーマ app への CREATE 権限が必要である',
    'スキーマへの USAGE 権限があれば、テーブルへの SELECT 権限は不要である',
    'データベースへの CONNECT 権限があれば、スキーマとテーブルの権限は不要である'
  ],
  answer: 0,
  exp: 'スキーマ内のオブジェクトにアクセスするには、スキーマに対する USAGE 権限と、オブジェクト自体への権限（この場合はテーブルの SELECT）の両方が必要です。どちらか一方だけでは参照できません。\nスキーマの CREATE 権限は、そのスキーマ内に新しいオブジェクトを作成するための権限です。\nPostgreSQL 14 では public スキーマに対して、すべてのロールへ USAGE と CREATE が既定で与えられています（PostgreSQL 15 で CREATE は取り消されました）。\n権限は GRANT USAGE ON SCHEMA app TO alice; のように与えます。',
  refs: [
    ['権限', 'ddl-priv.html'],
    ['スキーマ', 'ddl-schemas.html#DDL-SCHEMAS-PRIV']
  ]
},
{
  id: 'S2.5-022', level: 'silver', cat: 'S2.5',
  q: 'データベースやテーブルの使用量を調べる関数の説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_database_size() はデータベース全体の、pg_total_relation_size() はインデックスや TOAST を含むテーブルのサイズを返す',
    'pg_database_size() はテーブル1つ分の、pg_total_relation_size() はデータベース全体のサイズを返す',
    'pg_relation_size() はインデックスと TOAST を含めたサイズを返す',
    'これらの関数はバイト数ではなく、常に「123 MB」のような読みやすい文字列を返す',
    'サイズを調べるには、事前に VACUUM FULL を実行する必要がある'
  ],
  answer: 0,
  exp: 'pg_database_size() は指定したデータベースが使用しているディスク容量を、pg_total_relation_size() はテーブル本体に加えてインデックスと TOAST を含めた容量をバイト単位で返します。本体だけを知りたい場合は pg_relation_size()、インデックスの合計は pg_indexes_size() を使います。\n戻り値は数値なので、読みやすく表示するには pg_size_pretty() で整形します。\n例えば `SELECT pg_size_pretty(pg_total_relation_size(\'orders\'));` のように使います。\nテーブル空間の使用量は pg_tablespace_size() で確認できます。',
  refs: [
    ['データベースオブジェクト管理関数', 'functions-admin.html#FUNCTIONS-ADMIN-DBSIZE'],
    ['ディスク使用量の決定', 'disk-usage.html']
  ]
},
{
  id: 'S2.5-023', level: 'silver', cat: 'S2.5',
  q: 'サーバの停止モードに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'immediate は接続を直ちに強制終了するため、次回の起動時にクラッシュリカバリが行われる',
    'immediate は実行中のトランザクションの完了を待ってから停止する',
    'smart は実行中のトランザクションを中断し、直ちに停止する',
    'fast は既存の接続がすべて切断されるのを待ってから停止する',
    'どのモードで停止しても、次回の起動時にクラッシュリカバリが必要になる'
  ],
  answer: 0,
  exp: 'pg_ctl stop の停止モードは3種類あります。\nsmart はすべてのクライアントが自分で切断するのを待ってから停止します。\nfast（PostgreSQL 9.5 以降の既定）は実行中のトランザクションをロールバックしてクライアントを切断し、チェックポイントを行って正常に停止します。\nimmediate はチェックポイントを行わずにすべてのプロセスを直ちに終了させるため、次回の起動時にクラッシュリカバリ（WAL の再適用）が行われます。データが壊れるわけではありませんが、起動に時間がかかります。\nsmart と fast は正常なシャットダウンなので、クラッシュリカバリは発生しません。',
  refs: [
    ['サーバのシャットダウン', 'server-shutdown.html'],
    ['pg_ctl', 'app-pg-ctl.html']
  ]
},
{
  id: 'S2.5-024', level: 'silver', cat: 'S2.5',
  q: 'ロールのパスワードの管理に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'パスワードは password_encryption に従ってハッシュ化され、pg_authid に格納される',
    'パスワードは平文で pg_authid に格納されるため、一般ユーザから参照できる',
    'パスワードは pg_shadow にのみ格納され、pg_authid には含まれない',
    'ALTER ROLE ... PASSWORD で設定したパスワードは、必ず psql の履歴に残らない',
    'パスワードの設定は CREATE ROLE 時にしか行えず、後から変更することはできない'
  ],
  answer: 0,
  exp: 'パスワードは password_encryption（PostgreSQL 14 の既定は scram-sha-256）に従って変換され、システムカタログ pg_authid の rolpassword 列に格納されます。pg_authid はスーパーユーザ以外は参照できません（pg_shadow はその内容を見せるビューで、同様に制限されています）。\nパスワードは ALTER ROLE ... PASSWORD で後から変更できますが、SQL 文に平文で書くと psql の履歴ファイルやサーバログに残る可能性があります。psql の \\password メタコマンドを使うと、クライアント側でハッシュ化してから送るため安全です。\n有効期限は VALID UNTIL で設定します。',
  refs: [
    ['ロールの属性', 'role-attributes.html'],
    ['パスワード認証', 'auth-password.html'],
    ['pg_authid', 'catalog-pg-authid.html']
  ]
},
{
  id: 'S2.5-025', level: 'silver', cat: 'S2.5',
  q: '`VACUUM` と `ANALYZE` に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'VACUUM（FULL なし）を実行すると、テーブルのファイルサイズは必ず小さくなる',
    'ANALYZE はプランナが使う統計情報を更新する',
    'VACUUM は不要になった行の領域を、同じテーブル内で再利用できるようにする',
    'VACUUM ANALYZE と書くと、両方の処理をまとめて実行できる',
    '自動バキュームは VACUUM と ANALYZE の両方を必要に応じて実行する'
  ],
  answer: 0,
  exp: 'オプションなしの VACUUM は不要になった行の領域を回収してテーブル内で再利用できるようにしますが、ファイル自体は基本的に縮みません（末尾に大きな空きができた場合に切り詰められることはあります）。ファイルサイズを確実に小さくするには VACUUM FULL が必要ですが、こちらは ACCESS EXCLUSIVE ロックを獲得します。この点が誤りです。\nANALYZE はプランナが使う統計情報を更新するコマンドで、VACUUM とは目的が異なります。VACUUM ANALYZE で両方をまとめて実行できます。\n自動バキュームは、更新量に応じて VACUUM と ANALYZE を自動的に実行します。',
  refs: [
    ['VACUUM', 'sql-vacuum.html'],
    ['定常的なバキューム作業', 'routine-vacuuming.html']
  ]
},
{
  id: 'S2.5-026', level: 'silver', cat: 'S2.5',
  q: 'グループロールによる権限管理に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'GRANT グループ名 TO ユーザ名; で、そのユーザをグループのメンバーにする',
    'グループロールに与えた権限は、メンバーのロールからも行使できる',
    'グループロールには必ず LOGIN 属性が必要である',
    'メンバーから外すには DROP ROLE を実行する',
    'グループロールのメンバーは、1つのロールにつき1つまでである'
  ],
  answer: [0, 1],
  exp: 'PostgreSQL では「ユーザ」と「グループ」の区別はなく、どちらもロールです。GRANT グループ名 TO ユーザ名; でメンバーにし、REVOKE グループ名 FROM ユーザ名; で外します（DROP ROLE はロール自体の削除です）。\nグループロールにテーブルの権限を与えておけば、メンバーはその権限を行使できます（INHERIT 属性がある場合は自動的に、NOINHERIT なら SET ROLE の後に）。\n権限をロールごとに与えるのではなくグループにまとめると、人の入れ替わりに強い設計になります。\n1つのロールが複数のグループに所属することもできます。\nグループとして使うロールには、通常 LOGIN 属性は付けません（CREATE ROLE の既定は NOLOGIN です）。',
  refs: [
    ['ロールのメンバ資格', 'role-membership.html'],
    ['GRANT', 'sql-grant.html']
  ]
},
{
  id: 'S2.5-027', level: 'silver', cat: 'S2.5', type: 'scenario',
  q: '次の SQL の実行結果から読み取れることとして、正しいものを1つ選びなさい。',
  code: '=# SELECT pg_size_pretty(pg_relation_size(\'orders\'))       AS heap,\n          pg_size_pretty(pg_indexes_size(\'orders\'))        AS indexes,\n          pg_size_pretty(pg_table_size(\'orders\'))          AS table_size,\n          pg_size_pretty(pg_total_relation_size(\'orders\')) AS total;\n heap  | indexes | table_size | total\n-------+---------+------------+-------\n 17 MB | 11 MB   | 17 MB      | 28 MB',
  choices: [
    'インデックスを含めた orders の合計は 28 MB で、そのうち 11 MB がインデックスである',
    'orders のテーブル本体は 28 MB で、インデックスは含まれていない',
    'pg_table_size() はインデックスを含むため、table_size と total は常に同じ値になる',
    'orders のインデックスは 17 MB で、テーブル本体より大きい',
    'この結果から、orders に TOAST テーブルが存在しないことが分かる'
  ],
  answer: 0,
  exp: 'pg_relation_size() はテーブル本体（main フォーク）、pg_indexes_size() はそのテーブルのインデックスの合計、pg_table_size() はインデックスを除いたテーブルの大きさ（本体に加えて FSM・VM・TOAST を含む）、pg_total_relation_size() はインデックスも含めた合計です。\nこの結果では total 28 MB ＝ table_size 17 MB ＋ indexes 11 MB となっています。\ntable_size と heap が同じ 17 MB に見えるのは、FSM や TOAST が小さく pg_size_pretty() の丸めに隠れているためで、TOAST テーブルがないとは言えません（このテーブルには text 列があるため、TOAST テーブルは存在します）。',
  refs: [
    ['データベースオブジェクト管理関数', 'functions-admin.html#FUNCTIONS-ADMIN-DBSIZE'],
    ['ディスク使用量の決定', 'disk-usage.html']
  ]
},

);
