/*
 * Gold G1 運用管理（113問）
 * PostgreSQL 14 文書に基づくオリジナル問題。形式は DEVELOPMENT.md を参照。
 * tools/format.js で整形しています（node tools/format.js）。
 */
(window.PGQ_QUESTIONS = window.PGQ_QUESTIONS || []).push(

/* ---------------- G1.1 データベースサーバ構築（重要度 2 / 28問） ---------------- */
{
  id: 'G1.1-001', level: 'gold', cat: 'G1.1',
  q: 'PostgreSQL 14 において、パラメータ `password_encryption` の既定値として正しいものを1つ選びなさい。',
  choices: [
    'md5',
    'scram-sha-256',
    'on',
    'crypt',
    'password'
  ],
  answer: 1,
  exp: 'password_encryption は CREATE ROLE / ALTER ROLE でパスワードを設定する際の暗号化（ハッシュ）方式を決めるパラメータで、PostgreSQL 14 から既定値が md5 から scram-sha-256 に変更されました。\nscram-sha-256 は md5 より安全な SCRAM-SHA-256 認証に対応します。なお、pg_hba.conf で md5 を指定した場合でも、パスワードが SCRAM で格納されていれば自動的に SCRAM 認証が使われます。\non / off は古いバージョンで使われていた値（on は md5 の別名）で、crypt や password は password_encryption の値としては使えません。',
  refs: [
    ['password_encryption', 'runtime-config-connection.html#GUC-PASSWORD-ENCRYPTION'],
    ['パスワード認証', 'auth-password.html']
  ]
},
{
  id: 'G1.1-002', level: 'gold', cat: 'G1.1',
  q: '通信経路の暗号化に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_hba.conf で hostssl を指定した行は、SSL で暗号化された TCP/IP 接続にのみ一致する',
    'pg_hba.conf で hostssl を指定した行は、Unix ドメインソケット接続にも一致する',
    'PostgreSQL 14 では ssl パラメータの変更を反映するためにサーバの再起動が必要である',
    'libpq の sslmode の既定値は disable であり、明示しない限り SSL は使われない',
    'PostgreSQL 14 は、テーブルのデータファイルを透過的に暗号化する機能を標準で備えている'
  ],
  answer: 0,
  exp: 'pg_hba.conf の接続タイプ hostssl は SSL で暗号化された TCP/IP 接続に、hostnossl は非 SSL の TCP/IP 接続に、host はその両方に一致します。Unix ドメインソケット接続は local です。\nPostgreSQL 10 以降、ssl を含む SSL 関連パラメータは設定ファイルの再読み込み（reload）で反映できます。\nlibpq の sslmode の既定値は prefer で、サーバが対応していれば SSL を使用します。\nPostgreSQL 14 本体にデータファイルの透過的暗号化（TDE）機能はありません。列単位の暗号化には pgcrypto などを利用します。',
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html'],
    ['SSLによる安全なTCP/IP接続', 'ssl-tcp.html'],
    ['libpq SSLサポート', 'libpq-ssl.html']
  ]
},
{
  id: 'G1.1-003', level: 'gold', cat: 'G1.1', type: 'scenario',
  q: '次の設定が行われている状態で、ロール alice がデータベース db1 に新たに接続した直後の `work_mem` の値として、正しいものを1つ選びなさい。',
  code: '-- postgresql.conf\nwork_mem = 4MB\n\n-- SQL\nALTER DATABASE db1 SET work_mem = \'32MB\';\nALTER ROLE alice SET work_mem = \'16MB\';',
  choices: [
    '4MB',
    '8MB',
    '16MB',
    '32MB',
    '設定が競合するため接続時にエラーとなる'
  ],
  answer: 2,
  exp: 'ALTER DATABASE ... SET や ALTER ROLE ... SET で設定した値は、新しいセッションの開始時に適用され、設定ファイルやサーバのコマンドラインの値を上書きします。\n両方が設定されている場合は、ロール単位の設定がデータベース単位の設定より優先されます。さらに ALTER ROLE ... IN DATABASE ... SET によるロールとデータベースの組み合わせの設定は、それらよりも優先されます。\nしたがって alice が db1 に接続した場合は 16MB になります（セッション内で SET を実行すれば、さらにその値で上書きされます）。',
  evidence: [
    ['設定の組み合わせと、接続直後の work_mem（実機で確認）',
      'database |    role    |    setconfig\n----------+------------+-----------------\n (全DB)   | webuser    | {work_mem=32MB}\n app      | (全ロール) | {work_mem=16MB}\n app      | webuser    | {work_mem=64MB}\n(3 rows)\n\nwork_mem = \'8MB\'\n\npostgres  → postgres  : 8MB\npostgres  → app       : 16MB\nwebuser   → postgres  : 32MB\nwebuser   → app       : 64MB']
  ],
  refs: [
    ['SQLを通じたパラメータ操作', 'config-setting.html#CONFIG-SETTING-SQL-COMMAND-INTERACTION'],
    ['ALTER ROLE', 'sql-alterrole.html'],
    ['ALTER DATABASE', 'sql-alterdatabase.html']
  ]
},
{
  id: 'G1.1-004', level: 'gold', cat: 'G1.1',
  q: 'pgcrypto モジュールを使って、ユーザのパスワードをハッシュ化して格納・照合する方法として、適切なものを1つ選びなさい。',
  choices: [
    '格納時は crypt(入力値, gen_salt(\'bf\')) の結果を保存し、照合時は crypt(入力値, 格納値) = 格納値 で比較する',
    '格納時は pgp_sym_encrypt() で暗号化して保存し、照合時は pgp_sym_decrypt() で復号して入力値と比較する',
    'digest() はソルトを自動的に付加するため、同じ入力でも毎回異なるハッシュ値になる',
    'gen_salt() で生成したソルトは、すべてのユーザで共通の値を使い回す必要がある',
    'crypt() で得た値は可逆であり、decrypt() 関数で元のパスワードに戻せる'
  ],
  answer: 0,
  exp: 'pgcrypto の crypt() はパスワードハッシュ用の関数で、gen_salt() で生成したソルト（bf、md5、xdes、des のアルゴリズムを指定）とともに使います。crypt() の結果にはアルゴリズムとソルトが含まれるため、照合時は crypt(入力値, 格納値) を計算して格納値と一致するかを比べます。\ncrypt() は一方向のハッシュで元に戻せません。ソルトはユーザごとにランダムに生成されるため、同じパスワードでも格納値は異なります。\ndigest() は MD5 や SHA-256 などの単純なハッシュでソルトを含まず、同じ入力なら常に同じ値になります。pgp_sym_encrypt() / pgp_sym_decrypt() は可逆な共通鍵暗号で、パスワードの保存には適しません。',
  refs: [
    ['pgcrypto', 'pgcrypto.html']
  ]
},
{
  id: 'G1.1-005', level: 'gold', cat: 'G1.1',
  q: '監査目的で、クライアントの接続と切断、および DDL 文だけ（データ変更文は含めない）をサーバログに記録したい。postgresql.conf の設定の組み合わせとして、正しいものを1つ選びなさい。',
  choices: [
    'log_connections = on、log_disconnections = on、log_statement = \'ddl\'',
    'log_connections = on、log_disconnections = on、log_statement = \'mod\'',
    'log_connections = on、log_disconnections = on、log_duration = on',
    'log_connections = \'ddl\'、log_disconnections = \'ddl\'、log_statement = on',
    'log_connections = on、log_disconnections = on、log_min_messages = \'ddl\''
  ],
  answer: 0,
  exp: 'log_connections / log_disconnections を on にすると、接続（認証の成功を含む）と切断（セッション時間を含む）がログに記録されます。\nlog_statement はログに出力する文の種類を指定し、none（既定）、ddl（CREATE、ALTER、DROP などのデータ定義文）、mod（ddl に加えて INSERT、UPDATE、DELETE、TRUNCATE などのデータ変更文）、all（すべての文）から選びます。DDL だけを記録するなら ddl です。\nlog_duration は完了した文の所要時間を出力する設定、log_min_messages はログに出力するメッセージの重要度の閾値です。\nより詳細な監査が必要な場合は、pgAudit などの拡張の利用も検討します。',
  refs: [
    ['log_statement', 'runtime-config-logging.html#GUC-LOG-STATEMENT'],
    ['log_connections', 'runtime-config-logging.html#GUC-LOG-CONNECTIONS']
  ]
},
{
  id: 'G1.1-006', level: 'gold', cat: 'G1.1', type: 'scenario',
  q: 'PostgreSQL 14 を postgresql.conf の既定値のまま起動したところ、他のホストから TCP/IP で接続できなかった。postgresql.conf の既定値に関する原因として、最も適切なものを1つ選びなさい。',
  choices: [
    'listen_addresses の既定値が localhost であり、ローカルホストのインタフェースでしか接続を待ち受けていない',
    'port の既定値が 5433 であり、クライアントの既定の接続先ポートと一致していない',
    'max_connections の既定値が 0 であり、明示的に設定しないと TCP/IP 接続を受け付けない',
    'ssl の既定値が off であり、SSL が無効な場合は TCP/IP 接続そのものが受け付けられない',
    'unix_socket_directories が設定されていると、TCP/IP 接続は自動的に無効になる'
  ],
  answer: 0,
  exp: 'listen_addresses はサーバがクライアントからの接続を待ち受ける IP アドレスを指定するパラメータで、既定値は localhost です。他のホストから接続させるには、\'*\'（すべてのインタフェース）や特定のアドレスを指定してサーバを再起動し、さらに pg_hba.conf で接続元のアドレスを許可する必要があります。\nport の既定値は 5432、max_connections の既定値は 100 です。SSL を使わない TCP/IP 接続も可能で、Unix ドメインソケットの設定は TCP/IP の待ち受けとは独立しています。',
  evidence: [
    ['listen_addresses の既定値と、設定を変えたときの接続',
      'name       | setting | boot_val  |  context\n------------------+---------+-----------+------------\n listen_addresses | *       | localhost | postmaster\n port             | 5432    | 5432      | postmaster\n(2 rows)\n\n--- postgresql.conf の該当行（既定のまま = コメントアウト）\n60:#listen_addresses = \'localhost\'		# what IP address(es) to listen on;\n799:listen_addresses = \'*\'\n--- listen_addresses = localhost にして再起動した場合\n$ psql -h 10.0.2.15 -U postgres -d shop -c "SELECT 1;"\npsql: error: connection to server at "10.0.2.15", port 5432 failed: Connection refused\n	Is the server running on that host and accepting TCP/IP connections?\n$ psql -h 127.0.0.1 -U postgres -d shop -c "SELECT 1;"\n ?column?\n----------\n        1\n--- listen_addresses = * に戻して再起動\n$ psql -h 10.0.2.15 -U postgres -d shop -c "SELECT 1;"\npsql: error: connection to server at "10.0.2.15", port 5432 failed: FATAL:  no pg_hba.conf entry for host "10.0.2.15", user "postgres", database "shop", no encryption']
  ],
  refs: [
    ['listen_addresses', 'runtime-config-connection.html#GUC-LISTEN-ADDRESSES'],
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html']
  ]
},
{
  id: 'G1.1-007', level: 'gold', cat: 'G1.1',
  q: 'pg_hba.conf のユーザ欄・データベース欄の指定に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ユーザ欄の all は、スーパーユーザを除くすべてのユーザに一致する',
    'ユーザ欄に +admins と書くと、ロール admins を除くすべてのユーザに一致する',
    'ユーザ欄に +admins と書くと、ロール admins に直接または間接的に所属するロールに一致する',
    'データベース欄の replication は、すべてのデータベースへの通常の接続に一致する',
    'データベース欄やユーザ欄に複数の名前を並べることはできない'
  ],
  answer: 2,
  exp: 'pg_hba.conf のユーザ欄では、+ を前に付けたロール名はそのロールのメンバー（直接・間接を問わない）に一致するため、グループロール単位で認証方式を指定できます。all はすべてのユーザに一致します。@ファイル名 と書くと、ファイルに列挙した名前を読み込めます。\nデータベース欄の特別な値には、all、sameuser（ユーザ名と同名のデータベース）、samerole、replication（物理レプリケーション接続にのみ一致）があります。\n複数の名前はカンマで区切って指定できます。',
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html']
  ]
},
{
  id: 'G1.1-008', level: 'gold', cat: 'G1.1',
  q: 'サーバ側で SSL を有効にする際の説明として、正しいものを1つ選びなさい。',
  choices: [
    'サーバ証明書と秘密鍵のファイルの場所は、pg_hba.conf の各行に記述する',
    '既定ではデータディレクトリの server.crt と server.key を使い、秘密鍵は他者が読めない権限にする',
    'ssl_ca_file を設定しないと、サーバは SSL 接続を受け付けない',
    '自己署名証明書は、PostgreSQL のサーバ証明書として使用できない',
    'サーバの秘密鍵には必ずパスフレーズを設定しなければならない'
  ],
  answer: 1,
  exp: 'SSL を有効にするには postgresql.conf で ssl = on とし、サーバ証明書と秘密鍵を用意します。ファイルの場所は ssl_cert_file（既定 server.crt）と ssl_key_file（既定 server.key）で、相対パスはデータディレクトリからの位置です。秘密鍵ファイルは、サーバの OS ユーザが所有してグループや他者がアクセスできない権限（0600 など）にしないとサーバが読み込みを拒否します。\n自己署名証明書も使えます。ssl_ca_file はクライアント証明書を検証する場合に設定するもので、必須ではありません。パスフレーズ付きの鍵も使えますが必須ではありません。',
  refs: [
    ['SSLによる安全なTCP/IP接続', 'ssl-tcp.html'],
    ['ssl_cert_file', 'runtime-config-connection.html#GUC-SSL-CERT-FILE']
  ]
},
{
  id: 'G1.1-009', level: 'gold', cat: 'G1.1',
  q: 'pg_hba.conf の認証方式 `cert` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'host 行（SSL を使わない TCP/IP 接続）でも使用できる',
    '証明書の検証に加えて、必ずパスワードの入力も求められる',
    '証明書の内容はユーザ名の判定には使われず、証明書が信頼できれば任意のユーザで接続できる',
    'クライアント証明書を検証し、証明書の CN（コモンネーム）が接続するデータベースユーザ名と一致するかを確認する',
    'クライアント証明書を検証するために ssl_ca_file を設定する必要はない'
  ],
  answer: 3,
  exp: 'cert 認証は、SSL 接続でクライアントが提示した証明書を検証し、証明書の CN（Common Name）属性が要求されたデータベースユーザ名と一致するかで認証する方式です。pg_ident.conf のユーザ名マップ（map オプション）を使えば、CN とユーザ名の対応を変えられます。パスワードは要求されません。\nSSL 接続でのみ利用できるため hostssl 行に指定し、サーバ側では信頼する認証局の証明書を ssl_ca_file に設定しておく必要があります。\nなお、他の認証方式の行でも clientcert=verify-ca / verify-full を指定すると、クライアント証明書の検証を追加で要求できます。',
  refs: [
    ['証明書認証', 'auth-cert.html'],
    ['クライアント証明書の使用', 'ssl-tcp.html#SSL-CLIENT-CERTIFICATES']
  ]
},
{
  id: 'G1.1-010', level: 'gold', cat: 'G1.1',
  q: 'ALTER ROLE ... SET や ALTER DATABASE ... SET で設定したパラメータの値が格納されているシステムカタログを1つ選びなさい。',
  choices: [
    'pg_db_role_setting',
    'pg_hba_file_rules',
    'pg_file_settings',
    'pg_stat_activity',
    'pg_settings'
  ],
  answer: 0,
  exp: 'ALTER ROLE ... SET、ALTER DATABASE ... SET、ALTER ROLE ... IN DATABASE ... SET で設定した値は、システムカタログ pg_db_role_setting に格納されます（psql では \\drds で一覧表示できます）。ロールごとの設定は pg_roles ビューの rolconfig 列でも確認できます。\npg_settings は現在のセッションで有効な値、pg_file_settings は設定ファイルに記述されている内容、pg_hba_file_rules は pg_hba.conf の内容を表示するビューです。',
  refs: [
    ['pg_db_role_setting', 'catalog-pg-db-role-setting.html'],
    ['pg_file_settings', 'view-pg-file-settings.html']
  ]
},
{
  id: 'G1.1-011', level: 'gold', cat: 'G1.1',
  q: 'pg_hba.conf を編集した後、設定を再読み込みする前に、ファイルの内容と記述エラーの有無を SQL で確認できるビューとして、正しいものを1つ選びなさい。',
  choices: [
    'pg_hba_file_rules',
    'pg_file_settings',
    'pg_settings',
    'pg_authid',
    'pg_stat_ssl'
  ],
  answer: 0,
  exp: 'pg_hba_file_rules ビュー（PostgreSQL 10 以降）は、現在の pg_hba.conf ファイルの各行の内容（接続タイプ、データベース、ユーザ、アドレス、認証方式など）を表示し、解釈できない行は error 列にエラー内容が表示されます。表示されるのはファイルの現在の内容で、サーバが実際に使用している設定とは限らないため、再読み込み前の確認に使えます。\npg_file_settings は postgresql.conf などの設定ファイルについて同様の確認ができるビューです。pg_stat_ssl は各接続の SSL 使用状況を表示します。',
  refs: [
    ['pg_hba_file_rules', 'view-pg-hba-file-rules.html'],
    ['pg_file_settings', 'view-pg-file-settings.html']
  ]
},
{
  id: 'G1.1-012', level: 'gold', cat: 'G1.1',
  q: 'pg_hba.conf のレコードの評価に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '記述されたレコードのうち条件に一致するものすべてで認証が試みられ、1つでも成功すれば接続できる',
    '接続種別・データベース・ユーザ・接続元アドレスが最初に一致したレコードだけが使われ、認証に失敗すると接続は拒否される',
    '条件に一致するレコードが複数ある場合は、最も限定的な条件を持つレコードが自動的に選択される',
    'ファイルの末尾に近いレコードほど優先度が高く、後から書いたものが先に評価される',
    '条件に一致するレコードが1つもない場合は、既定の認証方式である trust が適用される'
  ],
  answer: 1,
  exp: 'pg_hba.conf のレコードは上から順に評価され、接続種別・データベース・ユーザ・接続元アドレスがすべて一致した最初のレコードだけが認証に使われます。そのレコードの認証に失敗しても、後続のレコードにフォールバックすることはなく、接続は拒否されます。このため、限定的なレコードほど前に書く必要があります。\n一致するレコードが1つもない場合も接続は拒否されます。',
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html']
  ]
},
{
  id: 'G1.1-013', level: 'gold', cat: 'G1.1',
  q: '行単位セキュリティ（行レベルセキュリティ）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'CREATE POLICY でポリシーを作成すれば、その時点からテーブルに自動的に適用される',
    'ALTER TABLE ... ENABLE ROW LEVEL SECURITY を実行してポリシーを1つも作らないと、行が返らなくなる',
    '行単位セキュリティが有効なテーブルでも、スーパーユーザには常にすべての行が見える',
    'ポリシーは SELECT にのみ適用でき、UPDATE や DELETE の対象行を制限することはできない',
    '行単位セキュリティは、ビューを使った権限制御と違ってインデックスが使われなくなる'
  ],
  answer: 1,
  exp: 'ALTER TABLE ... ENABLE ROW LEVEL SECURITY で機能を有効にし、CREATE POLICY でポリシーを定義します。有効にしただけでポリシーがない場合は「すべての行を拒否する」既定のポリシーが働き、行が返らなくなります。ポリシーの作成だけでは適用されません。\nテーブル所有者は既定でポリシーを迂回しますが、ALTER TABLE ... FORCE ROW LEVEL SECURITY を指定すると所有者にも適用されます。スーパーユーザと BYPASSRLS 属性を持つロールは常に迂回します。\nポリシーは SELECT / INSERT / UPDATE / DELETE それぞれに対して定義できます。',
  refs: [
    ['行セキュリティポリシー', 'ddl-rowsecurity.html'],
    ['CREATE POLICY', 'sql-createpolicy.html']
  ]
},
{
  id: 'G1.1-014', level: 'gold', cat: 'G1.1',
  q: 'Linux 上で PostgreSQL を運用する際の OS カーネル設定について、ドキュメントの推奨に合致するものを1つ選びなさい。',
  choices: [
    'vm.overcommit_memory を 2 に設定し、メモリのオーバーコミットを抑制することが推奨されている',
    'vm.overcommit_memory は既定の 0 のままにし、メモリ不足時の処理は OOM killer に任せることが推奨されている',
    'PostgreSQL 14 は System V 共有メモリを大量に使うため、kernel.shmmax を非常に大きな値にする必要がある',
    'postmaster プロセスの OOM スコアは、カーネルが自動的に最小値へ調整してくれる',
    'ulimit によるプロセスあたりのファイル数の上限は、PostgreSQL の動作には影響しない'
  ],
  answer: 0,
  exp: 'Linux ではメモリのオーバーコミットにより、実際には空きがない状態でも割り当てが成功し、後から OOM killer にプロセスが強制終了されることがあります。文書では vm.overcommit_memory = 2 とし、vm.overcommit_ratio を適切に設定してオーバーコミットを無効にすることが推奨されています。\nPostgreSQL 9.3 以降は共有メモリの大半を mmap による POSIX 共有メモリで確保するため、kernel.shmmax を大きくする必要はほとんどありません。\npostmaster の OOM スコアは、必要なら起動スクリプトで oom_score_adj を手動で調整します。\nmax_files_per_process や OS のファイルディスクリプタ上限は PostgreSQL の動作に影響します。',
  refs: [
    ['カーネルリソースの管理', 'kernel-resources.html'],
    ['Linuxのメモリオーバーコミット', 'kernel-resources.html#LINUX-MEMORY-OVERCOMMIT']
  ]
},
{
  id: 'G1.1-015', level: 'gold', cat: 'G1.1',
  q: 'pg_hba.conf の接続種別と `reject` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'hostssl は SSL 接続のみに一致し、hostnossl は SSL を使わない接続のみに一致する',
    'host は SSL を使わない接続にのみ一致するため、SSL 接続には hostssl の行が必須である',
    'reject の行に一致した接続は、後続の行で許可されていれば接続できる',
    'reject は接続を拒否する代わりに、パスワード認証へ切り替える指定である',
    'local は TCP/IP のループバック接続（127.0.0.1）に一致する'
  ],
  answer: 0,
  exp: '接続種別のうち local は Unix ドメインソケット接続、host は TCP/IP 接続（SSL の有無を問わない）に一致します。hostssl は SSL で暗号化された接続のみ、hostnossl は暗号化されていない接続のみに一致します。\n127.0.0.1 からのループバック接続は TCP/IP なので host（または hostssl / hostnossl）で扱います。\nreject は接続を無条件に拒否する方式です。pg_hba.conf は最初に一致した行だけが使われるため、拒否したい接続元を先に reject で書いておくと、後続の許可行より優先されます。',
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html'],
    ['認証方式', 'auth-methods.html']
  ]
},
{
  id: 'G1.1-016', level: 'gold', cat: 'G1.1',
  q: '定義済みロール（ロールの既定の集合）に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'pg_monitor を付与すると、スーパーユーザ権限を与えずに監視用の情報を広く参照させられる',
    'pg_monitor を付与したロールは、スーパーユーザと同等の権限を持つようになる',
    '定義済みロールは CREATE ROLE で新たに作成してから使用する必要がある',
    'pg_signal_backend を持つロールは、スーパーユーザのセッションも終了させることができる',
    '定義済みロールはデータベースごとに作成されるため、他のデータベースには影響しない'
  ],
  answer: 0,
  exp: '定義済みロールは、スーパーユーザ権限を渡さずに特定の操作だけを許可するために用意された、あらかじめ存在するロールです。GRANT pg_monitor TO alice; のように付与して使います。\npg_monitor は pg_read_all_settings、pg_read_all_stats、pg_stat_scan_tables をまとめたもので、監視用途の情報を広く参照できます。ほかに pg_signal_backend（他のセッションのキャンセルや終了）、pg_read_server_files などがあります。\npg_signal_backend ではスーパーユーザのセッションには作用しません。\n定義済みロールはクラスタ全体で共通です。',
  refs: [
    ['定義済みロール', 'predefined-roles.html'],
    ['ロールの属性', 'role-attributes.html']
  ]
},
{
  id: 'G1.1-017', level: 'gold', cat: 'G1.1',
  q: 'contrib モジュール pgcrypto による列データの暗号化に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pgp_sym_encrypt() で暗号化した列は、復号鍵を渡さなければ内容を読めないが、そのままでは検索に使いにくい',
    'pgp_sym_encrypt() で暗号化した列でも、B-tree インデックスによる範囲検索が通常どおり行える',
    '暗号化に使った鍵は自動的にデータベース内に保存されるため、利用者が管理する必要はない',
    'pgcrypto による暗号化は、ディスク上のファイルだけでなく WAL への記録も自動的に暗号化する',
    'crypt() と gen_salt() は可逆的な暗号化のための関数で、元の値を復元できる'
  ],
  answer: 0,
  exp: 'pgcrypto の pgp_sym_encrypt() / pgp_sym_decrypt() は共通鍵による可逆的な暗号化を行います。暗号化された値は鍵がなければ読めませんが、同じ平文でも暗号文が毎回変わるため等価比較やインデックス検索には向かず、復号してから比較することになります。\n鍵はデータベースに保存されず、アプリケーション側で管理します（SQL 文に鍵を書くとサーバログに残る点にも注意が必要です）。\npgcrypto は列の値を暗号化するだけなので、WAL には暗号化された値が記録されます。\ncrypt() と gen_salt() はパスワードのハッシュ化（不可逆）に使います。',
  refs: [
    ['pgcrypto', 'pgcrypto.html']
  ]
},
{
  id: 'G1.1-018', level: 'gold', cat: 'G1.1',
  q: '`pg_stat_ssl` ビューに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'バックエンドプロセスと WAL 送信プロセスごとに1行を保持する',
    'pid 列で pg_stat_activity や pg_stat_replication と結合できる',
    'cipher 列には、使用している TLS のバージョンが表示される',
    'SSL を使っていない接続は、このビューには現れない',
    'サーバ全体で SSL が有効かどうかを1行で表す集計ビューである'
  ],
  answer: [0, 1],
  exp: 'pg_stat_ssl はバックエンドプロセスおよび WAL 送信プロセスごとに1行を持ち、その接続で SSL が使われているか（ssl 列）、TLS のバージョン（version 列）、暗号化方式（cipher 列）、鍵長（bits 列）、クライアント証明書の識別名（client_dn 列）などを表示します。\npid 列で pg_stat_activity や pg_stat_replication と結合すれば、どの接続が暗号化されているかを調べられます。\nSSL を使っていない接続も行としては現れ、ssl 列が false になります。',
  refs: [
    ['pg_stat_ssl', 'monitoring-stats.html#MONITORING-PG-STAT-SSL-VIEW'],
    ['SSLによる安全なTCP/IP接続', 'ssl-tcp.html']
  ]
},
{
  id: 'G1.1-019', level: 'gold', cat: 'G1.1',
  q: 'パスワード認証に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'password_encryption を変更すると、既存のロールのパスワードもその方式で保存し直される',
    'pg_hba.conf の password は平文のパスワードを送るため、SSL と併用しない限り推奨されない',
    'パスワードが SCRAM 形式で保存されている場合、pg_hba.conf で md5 を指定しても SCRAM で認証される',
    'password_encryption を変更した後は、ロールのパスワードを設定し直す必要がある',
    'パスワードが設定されていないロールは、パスワード認証では接続できない'
  ],
  answer: 0,
  exp: 'password_encryption（PostgreSQL 14 の既定値は scram-sha-256）は、これから設定されるパスワードをどの方式で保存するかを決めるパラメータです。変更しても既存のパスワードは保存し直されないため、ALTER ROLE ... PASSWORD などで設定し直す必要があります。この点が誤りです。\npg_hba.conf の認証方式 password は平文のパスワードを送るため、暗号化された接続以外では使うべきではありません。\n認証方式に md5 を指定しても、そのロールのパスワードが SCRAM で保存されていれば SCRAM で認証されます。\nパスワードが設定されていない（NULL の）ロールは、パスワードによる認証では接続できません。',
  refs: [
    ['パスワード認証', 'auth-password.html'],
    ['password_encryption', 'runtime-config-connection.html#GUC-PASSWORD-ENCRYPTION']
  ]
},
{
  id: 'G1.1-020', level: 'gold', cat: 'G1.1',
  q: 'パラメータ設定の優先順位に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'ALTER ROLE で設定した値は、ALTER DATABASE で設定した値より優先される',
    'postgresql.auto.conf の値は、postgresql.conf の値より優先される',
    'ALTER DATABASE で設定した値は、ALTER ROLE で設定した値より優先される',
    'postgresql.conf の値は、postgresql.auto.conf の値より優先される',
    'セッションで SET した値は、次に同じセッションが接続するまで保持される'
  ],
  answer: [0, 1],
  exp: 'パラメータは、影響範囲の狭い設定ほど優先されます。優先度の高い順に、SET LOCAL（トランザクション）、SET（セッション）、ALTER ROLE ... IN DATABASE（ロールとデータベースの組み合わせ）、ALTER ROLE（ロール）、ALTER DATABASE（データベース）、サーバ起動時のコマンドライン指定（postgres -c など）、postgresql.auto.conf（ALTER SYSTEM）、postgresql.conf、組み込みの既定値、という順になります。\nしたがって ALTER ROLE は ALTER DATABASE より優先され、postgresql.auto.conf は postgresql.conf より優先されます。\nSET で変更した値はそのセッションの間だけ有効で、切断すると失われます。',
  refs: [
    ['パラメータの設定', 'config-setting.html'],
    ['ALTER ROLE', 'sql-alterrole.html']
  ]
},
{
  id: 'G1.1-021', level: 'gold', cat: 'G1.1',
  q: 'クライアント証明書を使った認証に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    '`clientcert=verify-full` は、証明書の CN がデータベースユーザ名と一致することも要求する',
    '認証方式 cert は、クライアント証明書だけで認証を行い、パスワードを要求しない',
    'clientcert オプションは、認証方式が cert のときにだけ指定できる',
    'クライアント証明書を使う場合、サーバ側で ssl を off にする必要がある',
    'clientcert=verify-ca を指定すると、証明書の CN とユーザ名の一致まで検証される'
  ],
  answer: [0, 1],
  exp: 'clientcert オプションは、hostssl の行で認証方式によらず指定でき、verify-ca は「信頼された CA が発行した証明書であること」、verify-full はそれに加えて「証明書の CN がデータベースユーザ名と一致すること」を要求します。\n認証方式 cert は hostssl 専用で、クライアント証明書だけで認証します（内部的に clientcert=verify-full と同じ検証を行い、パスワードは要求しません）。\nクライアント証明書は SSL 接続の仕組みなので、サーバ側で ssl を on にしておく必要があります。',
  refs: [
    ['証明書認証', 'auth-cert.html'],
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html']
  ]
},
{
  id: 'G1.1-022', level: 'gold', cat: 'G1.1',
  q: 'ロールの継承に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'INHERIT 属性を持つロールは、所属するグループロールの権限を自動的に行使できる',
    'NOINHERIT のロールでも、SET ROLE で切り替えれば所属先の権限を使える',
    'INHERIT 属性があれば、グループロールの LOGIN や SUPERUSER といった属性も継承される',
    'CREATE ROLE の既定は NOINHERIT である',
    'SET ROLE で切り替えた状態は、セッションが終わるまで元に戻せない'
  ],
  answer: [0, 1],
  exp: 'ロールに INHERIT 属性（CREATE ROLE の既定）があると、GRANT で所属したグループロールが持つ権限を、特別な操作なしに行使できます。\nNOINHERIT のロールは自動では権限を得られませんが、SET ROLE グループ名; で明示的に切り替えれば、その権限を使えます。\n継承されるのはテーブルなどに対する権限（GRANT で与えられるもの）だけで、LOGIN、SUPERUSER、CREATEDB、CREATEROLE といったロール属性は継承されません。これらは SET ROLE でも得られません。\nSET ROLE NONE または RESET ROLE で元のロールに戻せます。',
  refs: [
    ['ロールのメンバ資格', 'role-membership.html'],
    ['SET ROLE', 'sql-set-role.html']
  ]
},
{
  id: 'G1.1-023', level: 'gold', cat: 'G1.1', type: 'scenario',
  q: 'pg_hba.conf が次の内容になっているサーバ（自身の IP アドレスは 10.0.2.15）に対して、各ロールがパスワードを設定済みの状態で接続を試みた。接続に**成功する**ものを2つ選びなさい。',
  code: '# TYPE  DATABASE     USER      ADDRESS          METHOD\nlocal   all          postgres                   peer\nlocal   all          all                        scram-sha-256\nhost    sales        bob       127.0.0.1/32     reject\nhost    all          all       127.0.0.1/32     scram-sha-256\nhost    replication  postgres  127.0.0.1/32     trust',
  choices: [
    'bob が 127.0.0.1 から、正しいパスワードでデータベース shop に接続する',
    'carol が Unix ドメインソケットから、正しいパスワードでデータベース sales に接続する',
    'alice が 10.0.2.15 から、正しいパスワードでデータベース sales に接続する',
    'alice が 127.0.0.1 から誤ったパスワードで sales に接続し、次の行の認証で再試行される',
    'carol が Unix ドメインソケットから、パスワードを入力せずにデータベース sales に接続する'
  ],
  answer: [0, 1],
  exp: 'PostgreSQL 14 で実際に試した結果は次のとおりです。\n・bob → shop（127.0.0.1）: 3行目は database が sales なので一致せず、4行目の scram-sha-256 に一致して接続できます。\n・carol → sales（ソケット）: 2行目の local / scram-sha-256 に一致し、正しいパスワードで接続できます。\n・alice → sales（10.0.2.15）: host の行はすべて 127.0.0.1/32 限定なので一致せず、`FATAL:  no pg_hba.conf entry for host "10.0.2.15", user "alice", database "sales", no encryption` で拒否されます。サーバ自身の IP アドレスからの接続でも、127.0.0.1 とは別のアドレスとして扱われます。\n・alice の誤ったパスワード: 4行目で認証に失敗した時点で `FATAL:  password authentication failed for user "alice"` となり、後続の行は試されません。\n・carol のパスワードなし: パスワードが要求され、psql に -w（入力を求めない）を付けていると `fe_sendauth: no password supplied` で失敗します。',
  evidence: [
    ['問題と同じ pg_hba.conf での接続結果',
      'local   all             postgres                                peer\nlocal   all             all                                     scram-sha-256\nhost    sales           bob             127.0.0.1/32            reject\nhost    all             all             127.0.0.1/32            scram-sha-256\nhost    replication     postgres        127.0.0.1/32            trust\n--- bob が 127.0.0.1 から sales へ（パスワード正しい）\n$ psql -h 127.0.0.1 -U bob -d sales\npsql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  pg_hba.conf rejects connection for host "127.0.0.1", user "bob", database "sales", no encryption\n\n--- bob が 127.0.0.1 から shop へ（パスワード正しい）\n$ psql -h 127.0.0.1 -U bob -d shop\nconnected as bob\n\n--- alice が 127.0.0.1 から sales へ（パスワード誤り）\n$ psql -h 127.0.0.1 -U alice -d sales\npsql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  password authentication failed for user "alice"\n\n--- alice が 10.0.2.15 から sales へ\n$ psql -h 10.0.2.15 -U alice -d sales\npsql: error: connection to server at "10.0.2.15", port 5432 failed: FATAL:  no pg_hba.conf entry for host "10.0.2.15", user "alice", database "sales", no encryption\n\n--- carol がローカル（Unix ソケット）から sales へ（パスワードなし）\n$ psql  -U carol -d sales\npsql: error: connection to server on socket "/run/postgresql/.s.PGSQL.5432" failed: fe_sendauth: no password supplied\n\n--- carol がローカル（Unix ソケット）から sales へ（パスワード正しい）\n$ psql  -U carol -d sales\nconnected as carol']
  ],
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html'],
    ['パスワード認証', 'auth-password.html']
  ]
},
{
  id: 'G1.1-024', level: 'gold', cat: 'G1.1', type: 'scenario',
  q: 'bob からの sales への接続を拒否するつもりで、pg_hba.conf を次のように設定した。bob が 127.0.0.1 から、**誤ったパスワード**でデータベース sales に接続しようとしたときの結果として、正しいものを1つ選びなさい。',
  code: '# TYPE  DATABASE     USER      ADDRESS          METHOD\nlocal   all          postgres                   peer\nhost    all          all       127.0.0.1/32     trust\nhost    sales        bob       127.0.0.1/32     reject\nhost    replication  postgres  127.0.0.1/32     trust',
  choices: [
    'パスワードに関係なく接続できる。先に trust の行に一致するため、reject の行は評価されない',
    'reject の行のほうが条件が限定的なので優先され、接続は拒否される',
    'trust の行に一致するが、パスワードが誤っているため接続は拒否される',
    '一致する行が複数あるため設定エラーとなり、接続は拒否される',
    'reject は trust より強い指定なので、行の順序に関係なく接続は拒否される'
  ],
  answer: 0,
  exp: 'pg_hba.conf は上から順に評価され、最初に一致した行だけが使われます。条件の限定度や認証方式の強さによる優先順位はありません。この例では2行目の「host all all 127.0.0.1/32 trust」に先に一致するため、3行目の reject は評価されません。\ntrust はパスワードを確認せずに接続を許可する方式なので、誤ったパスワードでも接続できます。実際に試すと、bob として接続に成功しました。\n特定の接続だけを拒否・制限したい場合は、その行を広く許可する行より上に書く必要があります。',
  evidence: [
    ['trust の行を先に書いた場合の接続結果',
      'local   all             postgres                                peer\nhost    all             all             127.0.0.1/32            trust\nhost    sales           bob             127.0.0.1/32            reject\nhost    replication     postgres        127.0.0.1/32            trust\n--- bob が 127.0.0.1 から sales へ（パスワード誤り）\n$ psql -h 127.0.0.1 -U bob -d sales\nconnected as bob']
  ],
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html'],
    ['trust認証', 'auth-trust.html']
  ]
},
{
  id: 'G1.1-025', level: 'gold', cat: 'G1.1', type: 'scenario',
  q: 'ロール carol はグループロール sales_team のメンバーで、alice はメンバーではない。データベース alice と sales は存在するが、データベース carol は存在しない。pg_hba.conf が次の内容のとき、127.0.0.1 から正しいパスワードで接続して**成功する**ものを2つ選びなさい。',
  code: '# TYPE  DATABASE     USER         ADDRESS        METHOD\nlocal   all          postgres                    peer\nhost    sameuser     all          127.0.0.1/32   scram-sha-256\nhost    sales        +sales_team  127.0.0.1/32   scram-sha-256',
  choices: [
    'alice がデータベース alice に接続する',
    'carol がデータベース sales に接続する',
    'alice がデータベース sales に接続する',
    'carol がデータベース sales_team に接続する',
    'postgres が 127.0.0.1 からデータベース sales に接続する'
  ],
  answer: [0, 1],
  exp: 'データベース欄の sameuser は「接続先のデータベース名がロール名と同じ場合」に一致します。alice → alice は2行目に一致して接続できます。\nユーザ欄の「+ロール名」は、そのロールのメンバー（直接・間接）に一致します。carol は sales_team のメンバーなので、3行目に一致して sales に接続できます。\n実際に試した結果は次のとおりです。\n・alice → sales: sameuser に一致せず、+sales_team のメンバーでもないため `no pg_hba.conf entry for host "127.0.0.1", user "alice", database "sales"` で拒否されました。\n・carol → carol: pg_hba.conf の2行目には一致しますが、`FATAL:  database "carol" does not exist` になりました。\n・carol → sales_team や postgres → sales（TCP/IP）には一致する行がありません。',
  evidence: [
    ['sameuser と +グループを使った場合の接続結果',
      'local   all             postgres                                peer\nhost    sameuser        all             127.0.0.1/32            scram-sha-256\nhost    sales           +sales_team     127.0.0.1/32            scram-sha-256\nhost    replication     postgres        127.0.0.1/32            trust\n--- alice が 127.0.0.1 から alice へ\n$ psql -h 127.0.0.1 -U alice -d alice\nconnected as alice\n\n--- alice が 127.0.0.1 から sales へ\n$ psql -h 127.0.0.1 -U alice -d sales\npsql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  no pg_hba.conf entry for host "127.0.0.1", user "alice", database "sales", no encryption\n\n--- carol が 127.0.0.1 から sales へ\n$ psql -h 127.0.0.1 -U carol -d sales\nconnected as carol\n\n--- carol が 127.0.0.1 から carol へ\n$ psql -h 127.0.0.1 -U carol -d carol\npsql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  database "carol" does not exist']
  ],
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html'],
    ['ロールのメンバ資格', 'role-membership.html']
  ]
},
{
  id: 'G1.1-026', level: 'gold', cat: 'G1.1', type: 'scenario',
  q: '稼働中のサーバで pg_hba.conf の4行目を誤って編集し、`pg_reload_conf()` を実行した。そのときの pg_hba_file_rules ビューとサーバログは次のとおりだった。説明として適切なものを2つ選びなさい。',
  code: '=# SELECT line_number, database, address, auth_method, error\n     FROM pg_hba_file_rules;\n line_number |   database    |  address  |  auth_method  |                error\n-------------+---------------+-----------+---------------+--------------------------------------\n           2 | {all}         |           | peer          |\n           3 | {all}         | 127.0.0.1 | scram-sha-256 |\n           4 |               |           |               | invalid authentication method "md55"\n           5 | {replication} | 127.0.0.1 | trust         |\n\nLOG:  received SIGHUP, reloading configuration files\nLOG:  invalid authentication method "md55"\nLOG:  pg_hba.conf was not reloaded',
  choices: [
    'pg_hba.conf の再読み込みは行われず、編集前の設定が引き続き有効になっている',
    'pg_hba_file_rules の error 列を見れば、再読み込みの前に誤りのある行を確認できる',
    '誤りのある4行目だけが無視され、それ以外の行は編集後の内容で有効になっている',
    '設定の誤りを検出したため、サーバは接続の受け付けを停止している',
    '誤りを修正しても再読み込みでは反映されず、サーバの再起動が必要になる'
  ],
  answer: [0, 1],
  exp: 'pg_hba.conf に1行でも誤りがあると、再読み込みの際にファイル全体の適用が見送られ、「pg_hba.conf was not reloaded」と記録されます。このとき有効なのは直前に読み込まれた設定のままです。実際に試すと、編集後のファイルには 127.0.0.1 の全ロールを対象とする行（3行目）があるにもかかわらず、編集前の設定に基づいて `no pg_hba.conf entry` で拒否されました。\npg_hba_file_rules はファイルの現在の内容を解析して表示するビューで、error 列に構文エラーが表示されます。再読み込み前の確認に使えます。\nサーバは停止せず、誤りを直して再読み込みすれば反映されます（pg_hba.conf の変更に再起動は不要です）。',
  evidence: [
    ['記述ミスのある pg_hba.conf を再読み込みした場合',
      'local   all             postgres                                peer\nhost    all             all             127.0.0.1/32            scram-sha-256\nhost    sales           bob             192.168.10.0/24         md55\nhost    replication     postgres        127.0.0.1/32            trust\n--- サーバログ ---\n2026-09-17 06:33:00.465 UTC [6059] LOG:  received SIGHUP, reloading configuration files\n2026-09-17 06:33:01.649 UTC [6059] LOG:  received SIGHUP, reloading configuration files\n2026-09-17 06:33:01.650 UTC [6059] LOG:  invalid authentication method "md55"\n2026-09-17 06:33:01.650 UTC [6059] LOG:  pg_hba.conf was not reloaded\n--- 再読み込み前の設定のまま? trust の行がない構成で bob が 127.0.0.1 から shop にパスワード誤りで接続 ---\n--- bob が 127.0.0.1 から shop へ（パスワード誤り）\n$ psql -h 127.0.0.1 -U bob -d shop\npsql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  no pg_hba.conf entry for host "127.0.0.1", user "bob", database "shop", no encryption\n\nrestored']
  ],
  refs: [
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html'],
    ['pg_hba_file_rules', 'view-pg-hba-file-rules.html']
  ]
},
{
  id: 'G1.1-027', level: 'gold', cat: 'G1.1', type: 'scenario',
  q: 'work_mem を次のように設定した。ロール webuser がデータベース app に接続した直後の `SHOW work_mem` の結果として、正しいものを1つ選びなさい。',
  code: '=# ALTER SYSTEM SET work_mem = \'8MB\';\n=# SELECT pg_reload_conf();\n=# ALTER DATABASE app SET work_mem = \'16MB\';\n=# ALTER ROLE webuser SET work_mem = \'32MB\';\n=# ALTER ROLE webuser IN DATABASE app SET work_mem = \'64MB\';',
  choices: [
    '8MB',
    '16MB',
    '32MB',
    '64MB',
    '4MB（組み込みの既定値）'
  ],
  answer: 3,
  shuffle: false,
  exp: 'ロールとデータベースの両方に関係する設定は、影響範囲が狭いほど優先されます。優先度の高い順に、ALTER ROLE ... IN DATABASE（ロールとデータベースの組み合わせ）、ALTER ROLE（ロール単位）、ALTER DATABASE（データベース単位）、その後に postgresql.auto.conf、postgresql.conf の順です。\n実際に PostgreSQL 14 で接続を変えて確認した結果は次のとおりです。\n・postgres → postgres: 8MB（ALTER SYSTEM の値）\n・postgres → app: 16MB（ALTER DATABASE の値）\n・webuser → postgres: 32MB（ALTER ROLE の値）\n・webuser → app: 64MB（ALTER ROLE ... IN DATABASE の値）\nこれらの設定は接続の開始時に適用されるため、変更後に新しく接続したセッションから有効になります。設定内容は pg_db_role_setting カタログ（psql の \\drds）で確認できます。',
  evidence: [
    ['設定の組み合わせと、接続直後の work_mem（実機で確認）',
      'database |    role    |    setconfig\n----------+------------+-----------------\n (全DB)   | webuser    | {work_mem=32MB}\n app      | (全ロール) | {work_mem=16MB}\n app      | webuser    | {work_mem=64MB}\n(3 rows)\n\nwork_mem = \'8MB\'\n\npostgres  → postgres  : 8MB\npostgres  → app       : 16MB\nwebuser   → postgres  : 32MB\nwebuser   → app       : 64MB']
  ],
  refs: [
    ['パラメータの設定', 'config-setting.html'],
    ['ALTER ROLE', 'sql-alterrole.html'],
    ['pg_db_role_setting', 'catalog-pg-db-role-setting.html']
  ]
},
{
  id: 'G1.1-028', level: 'gold', cat: 'G1.1', type: 'scenario',
  q: '次の設定が行われている。接続するロールとデータベースの組み合わせと、接続直後の `SHOW work_mem` の結果の組み合わせとして、正しいものを2つ選びなさい。',
  code: '$ grep work_mem $PGDATA/postgresql.auto.conf\nwork_mem = \'8MB\'\n\n=# SELECT coalesce(d.datname, \'(全DB)\') AS database,\n          coalesce(r.rolname, \'(全ロール)\') AS role, s.setconfig\n     FROM pg_db_role_setting s\n     LEFT JOIN pg_database d ON d.oid = s.setdatabase\n     LEFT JOIN pg_roles r ON r.oid = s.setrole;\n database |    role    |    setconfig\n----------+------------+-----------------\n (全DB)   | webuser    | {work_mem=32MB}\n app      | (全ロール) | {work_mem=16MB}\n app      | webuser    | {work_mem=64MB}',
  choices: [
    'postgres がデータベース app に接続すると 16MB',
    'webuser がデータベース postgres に接続すると 32MB',
    'postgres がデータベース postgres に接続すると 16MB',
    'webuser がデータベース app に接続すると 32MB',
    'webuser が `PGOPTIONS="-c work_mem=1MB"` を付けて app に接続すると 64MB'
  ],
  answer: [0, 1],
  exp: 'pg_db_role_setting には ALTER DATABASE / ALTER ROLE で設定した値が入っています。setdatabase が 0（全DB）ならロール単位、setrole が 0（全ロール）ならデータベース単位、両方あれば組み合わせの設定です。\n実際に接続して確認した結果は、postgres → postgres が 8MB（どれにも当てはまらず postgresql.auto.conf の値）、postgres → app が 16MB、webuser → postgres が 32MB、webuser → app が 64MB でした。\nPGOPTIONS や接続文字列の options で接続時に指定した値は、ALTER ROLE / ALTER DATABASE の設定より優先されます。実際に `PGOPTIONS="-c work_mem=1MB"` で webuser → app に接続すると 1MB になりました。',
  evidence: [
    ['設定の一覧と、ロール・データベースの組み合わせごとの値',
      'database |    role    |    setconfig\n----------+------------+-----------------\n (全DB)   | webuser    | {work_mem=32MB}\n app      | (全ロール) | {work_mem=16MB}\n app      | webuser    | {work_mem=64MB}\n(3 rows)\n\nwork_mem = \'8MB\'\n\npostgres  → postgres  : 8MB\npostgres  → app       : 16MB\nwebuser   → postgres  : 32MB\nwebuser   → app       : 64MB']
  ],
  refs: [
    ['パラメータの設定', 'config-setting.html'],
    ['pg_db_role_setting', 'catalog-pg-db-role-setting.html'],
    ['環境変数（PGOPTIONS）', 'libpq-envars.html']
  ]
},

/* ---------------- G1.2 運用管理用コマンド全般（重要度 4 / 43問） ---------------- */
{
  id: 'G1.2-001', level: 'gold', cat: 'G1.2',
  q: '`pg_basebackup` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '既定ではバックアップに WAL を含まないため、リストアには必ず WAL アーカイブが必要である',
    'バックアップ取得中は、対象のデータベースクラスタへの書き込みができない',
    'データベース単位でバックアップを取得できる',
    'REPLICATION 属性を持つロールで接続し、pg_hba.conf で replication 接続を許可する必要がある',
    '出力は SQL 文形式であり、psql でリストアする'
  ],
  answer: 3,
  exp: 'pg_basebackup はレプリケーションプロトコルで接続して稼働中のデータベースクラスタ全体のベースバックアップを取得します。そのため REPLICATION 権限を持つロールかスーパーユーザで接続し、pg_hba.conf のデータベース欄に replication を指定した行で接続を許可する必要があります。\n既定の WAL 取得方式は -X stream で、バックアップ中に生成された WAL もストリーミングで取得されるため、そのまま起動可能なバックアップになります。\n取得中も他のクライアントは通常どおり読み書きできます。取得単位はクラスタ全体で、個別のデータベースは選べません。出力は SQL ではなく、データディレクトリのファイルのコピー（plain または tar 形式）です。',
  refs: [
    ['pg_basebackup', 'app-pgbasebackup.html'],
    ['ベースバックアップの作成', 'continuous-archiving.html#BACKUP-BASE-BACKUP']
  ]
},
{
  id: 'G1.2-002', level: 'gold', cat: 'G1.2',
  q: 'PostgreSQL 14 で `pg_start_backup()` / `pg_stop_backup()` を使った低レベル API による非排他的バックアップに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_start_backup() を実行すると、データディレクトリに backup_label ファイルが作成される',
    'データベースクラスタで同時に1つしか実行できない',
    'pg_start_backup() を実行したセッションを、pg_stop_backup() の実行まで維持する必要がある',
    'バックアップ中にサーバがクラッシュすると、backup_label が残るためサーバが再起動できなくなる可能性がある',
    'バックアップ中はチェックポイントが実行されない'
  ],
  answer: 2,
  exp: '非排他的バックアップでは、pg_start_backup(label, fast, false) を実行した接続を pg_stop_backup(false) の実行まで維持する必要があります。途中でセッションが切断されるとバックアップは中止されます。\n非排他的モードでは backup_label はデータディレクトリに作られず、pg_stop_backup() の戻り値として内容が返されるので、それをバックアップ先に保存します。そのため複数のバックアップを同時に実行でき、クラッシュ時に再起動できなくなる問題もありません。\n「同時に1つのみ」「backup_label がデータディレクトリに作成される」「クラッシュ後に再起動できない可能性がある」は、PostgreSQL 14 では非推奨の排他的バックアップの特徴です（排他的バックアップは PostgreSQL 15 で廃止されました）。',
  refs: [
    ['低レベルAPIを使用したベースバックアップの作成', 'continuous-archiving.html#BACKUP-LOWLEVEL-BASE-BACKUP'],
    ['バックアップ制御関数', 'functions-admin.html#FUNCTIONS-ADMIN-BACKUP']
  ]
},
{
  id: 'G1.2-003', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: '自動バキュームの関連パラメータがすべて既定値のとき、推定行数（reltuples）が 10000 行のテーブルに対して、更新・削除によって不要タプル数がいくつを超えると VACUUM の対象となるか。正しいものを1つ選びなさい。',
  choices: [
    '50',
    '1000',
    '2000',
    '2050',
    '2500'
  ],
  answer: 3,
  shuffle: false,
  exp: 'VACUUM の閾値は次の式で求められます。\nバキューム閾値 = autovacuum_vacuum_threshold + autovacuum_vacuum_scale_factor × タプル数\n既定値は autovacuum_vacuum_threshold = 50、autovacuum_vacuum_scale_factor = 0.2 なので、50 + 0.2 × 10000 = 2050 となり、不要タプル数が 2050 を超えるとバキュームの対象となります。\nなお PostgreSQL 13 以降は、INSERT 数に基づく閾値（autovacuum_vacuum_insert_threshold = 1000、autovacuum_vacuum_insert_scale_factor = 0.2）でもバキュームが実行されます。ANALYZE の閾値は autovacuum_analyze_threshold（50）+ autovacuum_analyze_scale_factor（0.1）× タプル数です。',
  evidence: [
    ['自動バキュームの関連パラメータ（既定値）としきい値の計算',
      'name                  | setting\n---------------------------------------+---------\n autovacuum                            | on\n autovacuum_naptime                    | 60\n autovacuum_vacuum_insert_scale_factor | 0.2\n autovacuum_vacuum_insert_threshold    | 1000\n autovacuum_vacuum_scale_factor        | 0.2\n autovacuum_vacuum_threshold           | 50\n(6 rows)\n\n=# SELECT reltuples FROM pg_class WHERE relname = \'av\';\n reltuples\n-----------\n     10000\n(1 row)\n\n（しきい値 = 50 + 0.2 × 10000 = 2050 行）\n=# SELECT 50 + 0.2 * reltuples AS threshold FROM pg_class WHERE relname = \'av\';\n threshold\n-----------\n      2050\n(1 row)'],
    ['実際に更新を重ねたときの n_dead_tup と自動バキュームのログ',
      '=# SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, autovacuum_count FROM pg_stat_user_tables WHERE relname = \'av2\';\n relname | n_live_tup | n_dead_tup | last_autovacuum | autovacuum_count\n---------+------------+------------+-----------------+------------------\n av2     |      20000 |          0 |                 |                0\n(1 row)\n\n（しきい値 = autovacuum_vacuum_threshold 50 + autovacuum_vacuum_scale_factor 0.2 × 10000 行 = 2050）\n\n--- 2000 行更新（しきい値 2050 未満）\n=# SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, autovacuum_count FROM pg_stat_user_tables WHERE relname = \'av2\';\n relname | n_live_tup | n_dead_tup |        last_autovacuum        | autovacuum_count\n---------+------------+------------+-------------------------------+------------------\n av2     |      10000 |          0 | 2026-09-21 03:51:59.790731+00 |                1\n(1 row)\n\n--- さらに 500 行更新（合計 2500 行でしきい値を超える）\n=# SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, autovacuum_count FROM pg_stat_user_tables WHERE relname = \'av2\';\n relname | n_live_tup | n_dead_tup |        last_autovacuum        | autovacuum_count\n---------+------------+------------+-------------------------------+------------------\n av2     |      10000 |        500 | 2026-09-21 03:51:59.790731+00 |                1\n(1 row)\n\n--- サーバログ（log_autovacuum_min_duration = 0）\n	pages: 0 removed, 54 remain, 0 skipped due to pins, 0 skipped frozen\n	tuples: 2000 removed, 9868 remain, 0 are dead but not yet removable, oldest xmin: 1192\n	index scan needed: 9 pages from table (16.67% of total) had 2000 dead item identifiers removed\n--\n2026-09-21 03:54:01.466 UTC [131958] LOG:  automatic vacuum of table "shop.public.av2": index scans: 1\n	pages: 0 removed, 91 remain, 0 skipped due to pins, 0 skipped frozen\n	tuples: 10034 removed, 10000 remain, 0 are dead but not yet removable, oldest xmin: 1195\n	index scan needed: 47 pages from table (51.65% of total) had 10405 dead item identifiers removed']
  ],
  refs: [
    ['自動バキュームデーモン', 'routine-vacuuming.html#AUTOVACUUM'],
    ['自動Vacuum作業のパラメータ', 'runtime-config-autovacuum.html']
  ]
},
{
  id: 'G1.2-004', level: 'gold', cat: 'G1.2',
  q: '`REINDEX` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'REINDEX DATABASE は、クラスタ内のすべてのデータベースのインデックスを再構築する',
    'REINDEX CONCURRENTLY は、システムカタログのインデックスにも使用できる',
    'REINDEX CONCURRENTLY は、トランザクションブロックの中で実行できない',
    'REINDEX CONCURRENTLY が途中で失敗すると、元のインデックスは削除される',
    'VACUUM FULL を実行しても、インデックスは再構築されない'
  ],
  answer: 2,
  exp: 'REINDEX CONCURRENTLY（PostgreSQL 12 以降）は、書き込みを長時間ブロックせずにインデックスを再構築します。複数のトランザクションに分けて処理するため、トランザクションブロック内では実行できず、システムカタログにも使えません。\n途中で失敗した場合、元のインデックスはそのまま残り、「_ccnew」などの接尾辞が付いた無効（INVALID）なインデックスが残ることがあるので、DROP INDEX で削除してから再実行します。\nREINDEX DATABASE / SYSTEM は現在接続しているデータベースのみが対象です。VACUUM FULL はテーブルを書き直すため、インデックスも再構築されます。',
  refs: [
    ['REINDEX', 'sql-reindex.html'],
    ['VACUUM', 'sql-vacuum.html']
  ]
},
{
  id: 'G1.2-005', level: 'gold', cat: 'G1.2',
  q: 'サーバログの出力とローテーションに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'logging_collector の変更は、設定ファイルの再読み込みだけで反映される',
    'log_rotation_size の既定値は 0 であり、既定ではサイズによるローテーションは行われない',
    'log_filename には strftime の書式を使えないため、日付ごとのファイル名にはできない',
    'log_rotation_age を 0 にすると、1分ごとにローテーションが行われる',
    'log_truncate_on_rotation を on にすると、時間ベースのローテーションで同じ名前の既存ログファイルに追記せず、切り詰めて上書きする'
  ],
  answer: 4,
  exp: 'logging_collector = on にすると、標準エラーに出力されたログをバックグラウンドプロセスが収集してファイルに書き込みます。logging_collector の変更にはサーバの再起動が必要です。\nlog_filename には strftime の書式（%Y-%m-%d など）を使え、log_rotation_age（既定 1d）や log_rotation_size（既定 10MB）でローテーションの契機を指定します。いずれも 0 にするとその契機によるローテーションは無効になります。\nlog_truncate_on_rotation = on の場合、時間ベースのローテーションで同名のファイルが存在すれば切り詰めて上書きします（例: log_filename = \'postgresql-%a.log\' で曜日ごとに7世代を循環）。サーバ起動時やサイズベースのローテーションでは切り詰めは行われません。',
  refs: [
    ['ログの出力先', 'runtime-config-logging.html#RUNTIME-CONFIG-LOGGING-WHERE'],
    ['log_truncate_on_rotation', 'runtime-config-logging.html#GUC-LOG-TRUNCATE-ON-ROTATION'],
    ['ログファイルの保守', 'logfile-maintenance.html']
  ]
},
{
  id: 'G1.2-006', level: 'gold', cat: 'G1.2',
  q: '`CLUSTER` コマンドに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '指定したインデックスの順序に従ってテーブルを物理的に並べ替えて書き直す。実行中は ACCESS EXCLUSIVE ロックを取得する',
    '一度 CLUSTER を実行すると、以後の INSERT や UPDATE でもインデックスの順序が自動的に維持される',
    '実行中も、対象テーブルに対する読み取りと書き込みを並行して行える',
    '一度もクラスタ化していないテーブルに対して、インデックス名を省略して CLUSTER テーブル名 を実行できる',
    'テーブルをその場で並べ替えるため、一時的な追加のディスク領域は必要ない'
  ],
  answer: 0,
  exp: 'CLUSTER はテーブルをインデックスの順序に従って並べ替えた新しいファイルに書き直します。範囲検索などで関連する行が近いページにまとまるため、I/O が減る場合があります。\n実行中はテーブルに ACCESS EXCLUSIVE ロックがかかり、読み取りも書き込みもブロックされます。また、新しいテーブルとインデックスを作成するため、少なくともテーブルとインデックスの合計サイズ程度の空き領域が必要です。\n並べ替えは一度だけ行われ、以後の更新では順序は維持されません。インデックス名を省略した CLUSTER テーブル名 は、以前に CLUSTER で使用したインデックスで再クラスタ化します。',
  refs: [
    ['CLUSTER', 'sql-cluster.html']
  ]
},
{
  id: 'G1.2-007', level: 'gold', cat: 'G1.2',
  q: 'テーブル本体に加え、そのテーブルのすべてのインデックスと TOAST データを含めたディスク使用量を取得する関数を1つ選びなさい。',
  choices: [
    'pg_relation_size',
    'pg_total_relation_size',
    'pg_table_size',
    'pg_indexes_size',
    'pg_database_size'
  ],
  answer: 1,
  exp: 'ディスク使用量を調べる関数には次のものがあります。\n・pg_total_relation_size: テーブル本体、TOAST、すべてのインデックスの合計\n・pg_table_size: インデックスを除いたテーブルのサイズ（TOAST、空き領域マップ、可視性マップを含む）\n・pg_indexes_size: テーブルに付属するインデックスの合計\n・pg_relation_size: 指定したリレーションの指定フォーク（既定は main）のサイズ\n・pg_database_size: データベース全体のサイズ\npg_size_pretty() と組み合わせると、kB や MB などの読みやすい単位で表示できます。',
  refs: [
    ['データベースオブジェクトサイズ関数', 'functions-admin.html#FUNCTIONS-ADMIN-DBSIZE'],
    ['ディスク使用量の決定', 'disk-usage.html']
  ]
},
{
  id: 'G1.2-008', level: 'gold', cat: 'G1.2',
  q: 'トランザクション ID（XID）の周回防止に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'XID は 64 ビットで管理されているため、実運用で周回を意識する必要はない',
    'autovacuum_freeze_max_age を超えたテーブルには、autovacuum = off でも周回防止の自動バキュームが実行される',
    'VACUUM FREEZE は VACUUM FULL と同様に、テーブルを排他ロックして新しいファイルに書き直す',
    'テーブルの凍結状況（age(relfrozenxid)）は、pg_stat_activity で確認する',
    'vacuum_freeze_min_age を 0 にすると、タプルは凍結されなくなる'
  ],
  answer: 1,
  exp: 'XID は 32 ビットのため約 40 億で周回します。周回によって過去のトランザクションが「未来」に見えてしまうのを防ぐため、VACUUM は十分に古い行を凍結（FREEZE）します。\nテーブルの pg_class.relfrozenxid の経過（age(relfrozenxid)）が autovacuum_freeze_max_age（既定 2 億）を超えると、自動バキュームが無効でも周回防止のための自動バキュームが強制的に起動されます。\nVACUUM FREEZE は vacuum_freeze_min_age = 0 などとして積極的に凍結を行う通常の VACUUM で、テーブルの書き直しは行いません。vacuum_freeze_min_age を小さくするほど、より新しい行まで凍結されます。\n周回が迫っても VACUUM されない場合は警告が出力され、最終的に新しい XID の割り当てが拒否されます。',
  refs: [
    ['トランザクションIDの周回エラーの防止', 'routine-vacuuming.html#VACUUM-FOR-WRAPAROUND'],
    ['autovacuum_freeze_max_age', 'runtime-config-autovacuum.html#GUC-AUTOVACUUM-FREEZE-MAX-AGE']
  ]
},
{
  id: 'G1.2-009', level: 'gold', cat: 'G1.2',
  q: 'PostgreSQL 14 の `VACUUM` のオプションに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'SKIP_LOCKED を指定すると、ロックをすぐに取得できないテーブルがあった場合にエラーで終了する',
    'INDEX_CLEANUP false を指定すると、インデックスを削除して再構築する',
    'TRUNCATE false を指定すると、処理後にテーブルの全行が削除される',
    'PARALLEL オプションはインデックスの処理を並列に行うためのもので、FULL オプションとは同時に使用できない',
    'DISABLE_PAGE_SKIPPING を指定すると、可視性マップを使ってより多くのページを読み飛ばす'
  ],
  answer: 3,
  exp: 'VACUUM の PARALLEL オプション（PostgreSQL 13 以降）は、インデックスのバキュームとクリーンアップの段階を複数のワーカーで並列に実行します。FULL オプションとは併用できません。\nSKIP_LOCKED はロックをすぐに取得できないリレーションをスキップします。INDEX_CLEANUP false はインデックスのバキュームを省略します（周回防止を急ぐ場合などに使います）。TRUNCATE false はテーブル末尾の空きページを切り詰めて OS に返す処理を行わないようにします。DISABLE_PAGE_SKIPPING は可視性マップに基づくページの読み飛ばしを無効にします。',
  refs: [
    ['VACUUM', 'sql-vacuum.html']
  ]
},
{
  id: 'G1.2-010', level: 'gold', cat: 'G1.2',
  q: '`CHECKPOINT` コマンドとチェックポイントのログに関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'CHECKPOINT を実行すると、未コミットのトランザクションも含めてすべてコミットされる',
    'CHECKPOINT は一般ユーザも実行でき、定期的に手動で実行することが推奨されている',
    'CHECKPOINT は即座にチェックポイントを実行するコマンドで、スーパーユーザのみが実行でき、通常の運用で使うことは想定されていない',
    'log_checkpoints の既定値は on であり、チェックポイントごとに統計がログに出力される',
    'チェックポイントが完了すると、pg_wal 内のすべての WAL ファイルが削除される'
  ],
  answer: 2,
  exp: 'CHECKPOINT コマンドは、設定されたチェックポイントの間隔を待たずに即座にチェックポイントを実行します。PostgreSQL 14 ではスーパーユーザのみが実行でき（15 以降は pg_checkpoint ロールでも可）、通常の運用で使うことは想定されていません（オンラインバックアップの前やシャットダウン前の時間短縮などで使われます）。\nチェックポイントはトランザクションの状態を変えません。完了後は、それより前の不要な WAL セグメントが削除またはリサイクルされますが、アーカイブ待ちや保持設定の対象の WAL は残ります。\nlog_checkpoints の既定値は PostgreSQL 14 では off です（15 で on に変更）。',
  refs: [
    ['CHECKPOINT', 'sql-checkpoint.html'],
    ['log_checkpoints', 'runtime-config-logging.html#GUC-LOG-CHECKPOINTS'],
    ['WALの設定', 'wal-configuration.html']
  ]
},
{
  id: 'G1.2-011', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: 'pg_wal ディレクトリの使用量が増え続けている。その原因として考えられるものを1つ選びなさい。',
  choices: [
    'max_wal_size を小さくしているため、WAL が保持されなくなっている',
    'archive_command が失敗し続けているため、アーカイブされていない WAL ファイルが削除されずに蓄積している',
    'ソートやハッシュで作成される一時ファイルが、pg_wal ディレクトリに作られている',
    'チェックポイントが頻繁に発生しているため、WAL が再利用されずに増え続けている',
    'WAL ファイルは自動では削除されない仕様のため、定期的に手動で削除する必要がある'
  ],
  answer: 1,
  exp: 'WAL アーカイブが有効な場合、archive_command が成功するまでその WAL ファイルは削除・再利用されません。コマンドが失敗し続けると pg_wal に WAL が蓄積し、最終的にディスク満杯を引き起こします。サーバログや pg_stat_archiver ビューの failed_count などで確認します。\nほかに、使われていないレプリケーションスロットや wal_keep_size の設定も WAL の保持量を増やす原因になります。\n通常、チェックポイント後に不要になった WAL は自動的に削除またはリサイクルされるため、手動で削除してはいけません。一時ファイルは base/pgsql_tmp（または temp_tablespaces）に作成されます。',
  evidence: [
    ['スタンバイを止めた状態でレプリケーションスロットが WAL を保持し続ける様子',
      'pg_reload_conf\n----------------\n t\n(1 row)\n\n slot_name | slot_type | active | restart_lsn | wal_status | safe_wal_size\n-----------+-----------+--------+-------------+------------+---------------\n standby1  | physical  | f      | 0/1A456D28  | reserved   | 76 MB\n(1 row)\n\n slot_name | slot_type | active | restart_lsn | wal_status | safe_wal_size\n-----------+-----------+--------+-------------+------------+---------------\n standby1  | physical  | f      |             | lost       |\n(1 row)\n\n--- プライマリのログ ---\n2026-09-17 06:44:20.556 UTC [6062] LOG:  checkpoints are occurring too frequently (2 seconds apart)\n2026-09-17 06:44:22.291 UTC [6062] LOG:  checkpoints are occurring too frequently (2 seconds apart)\n2026-09-17 06:44:23.816 UTC [6062] LOG:  checkpoints are occurring too frequently (1 second apart)\n2026-09-17 06:44:25.643 UTC [6062] LOG:  checkpoints are occurring too frequently (2 seconds apart)']
  ],
  refs: [
    ['WALの設定', 'wal-configuration.html'],
    ['WALアーカイブの設定', 'continuous-archiving.html#BACKUP-ARCHIVING-WAL'],
    ['pg_stat_archiver', 'monitoring-stats.html#MONITORING-PG-STAT-ARCHIVER-VIEW']
  ]
},
{
  id: 'G1.2-012', level: 'gold', cat: 'G1.2',
  q: '`pg_basebackup` の WAL 取得方式 `-X fetch` と `-X stream` の違いとして、正しいものを1つ選びなさい。',
  choices: [
    'fetch はバックアップの最後に必要な WAL をまとめて取得し、stream はバックアップ中に別の接続で WAL を受信する',
    'fetch が既定の方式であり、stream は明示的に指定しなければ使われない',
    'stream を指定すると、バックアップに WAL が含まれなくなる',
    'fetch では、バックアップ中にプライマリで WAL が削除されても取得に失敗することはない',
    '-X none を指定しても、起動に必要な WAL はバックアップに自動的に含まれる'
  ],
  answer: 0,
  exp: 'pg_basebackup の -X（--wal-method）は、バックアップ中に生成された WAL の取得方法を指定します。\n・stream（既定）: バックアップ中に2本目のレプリケーション接続を開き、WAL を並行して受信する\n・fetch: バックアップの最後に、必要な WAL をまとめて取得する。取得までに WAL が削除されないよう、wal_keep_size などで保持しておく必要がある\n・none: WAL を含めない（WAL アーカイブと組み合わせて使う）\nstream と fetch はどちらも、単体で起動可能なバックアップになります。',
  refs: [
    ['pg_basebackup', 'app-pgbasebackup.html']
  ]
},
{
  id: 'G1.2-013', level: 'gold', cat: 'G1.2',
  q: 'PostgreSQL 14 における宣言的パーティショニングと自動バキュームに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '自動バキュームは、パーティションテーブル（親）の統計情報も自動的に収集する',
    '個々のパーティション（子テーブル）は、自動バキュームの対象外である',
    '一時テーブルも、他のテーブルと同様に自動バキュームの対象になる',
    'パーティションテーブル（親）に対して VACUUM を実行することはできない',
    '自動バキュームは親の統計情報を収集しないため、必要に応じて親に手動で ANALYZE を実行する'
  ],
  answer: 4,
  exp: 'データを格納する個々のパーティションは通常のテーブルと同様に自動バキューム・自動 ANALYZE の対象ですが、PostgreSQL 14 の自動バキュームは、データを持たないパーティションテーブル（親）自体を処理しません。そのため、パーティションテーブル全体の統計情報（結合の見積もりなどに使われる）を得るには、親テーブルに対して定期的に手動で ANALYZE を実行する必要があります。\n親テーブルに VACUUM や ANALYZE を実行すると、すべてのパーティションも処理されます。\n一時テーブルは自動バキュームで処理できないため、必要に応じて手動で VACUUM / ANALYZE を行います。',
  refs: [
    ['ANALYZE（注意事項）', 'sql-analyze.html'],
    ['自動バキュームデーモン', 'routine-vacuuming.html#AUTOVACUUM']
  ]
},
{
  id: 'G1.2-014', level: 'gold', cat: 'G1.2',
  q: '`vacuumdb --all --analyze-in-stages` の説明として、正しいものを1つ選びなさい。',
  choices: [
    'VACUUM FULL を段階的に実行し、テーブルを少しずつ書き直す',
    '統計目標を段階的に上げながら ANALYZE を3回行い、統計情報のない状態から早く最低限の統計を用意する',
    'すべてのテーブルを並列にロックし、統計情報を一度に収集する',
    'ANALYZE の統計目標を段階的に下げて、ANALYZE の実行時間を短くする',
    '同じ設定の ANALYZE を3回繰り返し、統計情報の精度を上げる'
  ],
  answer: 1,
  exp: '--analyze-in-stages は、統計目標を 1、10、既定値（default_statistics_target）と段階的に変えて ANALYZE を3回実行するオプションで、VACUUM は行いません。最初の段階で粗い統計を短時間で作成するため、統計情報がまったくない状態からでも早くある程度妥当な実行計画が使えるようになります。\npg_upgrade によるアップグレードの直後や、pg_dump からリストアした直後など、統計情報が存在しない場合に使われます。-j オプションで並列に実行することもできます。',
  refs: [
    ['vacuumdb', 'app-vacuumdb.html'],
    ['pg_upgrade', 'pgupgrade.html']
  ]
},
{
  id: 'G1.2-015', level: 'gold', cat: 'G1.2',
  q: '更新や削除を繰り返して肥大化したテーブルの領域を OS に返却したい。`VACUUM FULL` を使う場合の注意点として、正しいものを1つ選びなさい。',
  choices: [
    '通常の VACUUM と同様に、実行中も対象テーブルの読み書きができる',
    'テーブルをその場で詰めるため、作業用の追加のディスク領域は不要である',
    '通常の VACUUM でも、テーブル内の空き領域はすべて OS に返却される',
    'ファイルを書き直すため、実行中は参照もブロックされ、追加のディスク領域も必要になる',
    'VACUUM FULL を実行すると、インデックスは削除されるため後から作り直す必要がある'
  ],
  answer: 3,
  exp: 'VACUUM FULL はテーブルの有効な行を新しいファイルに書き直し、古いファイルを削除することで、不要な領域を OS に返却します。インデックスも再構築されます。\n処理中はテーブルに ACCESS EXCLUSIVE ロックがかかるため参照もブロックされ、また新旧のファイルが一時的に両方存在するため、テーブルとインデックスの合計サイズ程度の追加の空き領域が必要です。\n通常の VACUUM は領域を再利用可能にするだけで、原則として OS には返しません（末尾の空きページを除く）。VACUUM FULL が必要な状態を避けるため、自動バキュームを適切に動作させることが推奨されています。',
  refs: [
    ['ディスク容量の回復', 'routine-vacuuming.html#VACUUM-FOR-SPACE-RECOVERY'],
    ['VACUUM', 'sql-vacuum.html']
  ]
},
{
  id: 'G1.2-016', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: 'サーバログに「checkpoints are occurring too frequently」という警告が出力された。この警告と対処に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'チェックポイントの処理が失敗したことを示しており、データファイルの破損を確認する',
    'checkpoint_warning の既定値は 0 であり、この警告は明示的に設定した場合にしか出力されない',
    'WAL の量を契機としたチェックポイントが checkpoint_warning より短い間隔で発生しており、max_wal_size の拡大を検討する',
    'この警告はサーバログではなく、実行中のすべてのクライアントに送信される',
    'チェックポイントの頻度を下げるには、max_wal_size を小さくする'
  ],
  answer: 2,
  exp: 'checkpoint_warning（既定 30s）は、WAL の量（max_wal_size）を契機とするチェックポイントが、この時間より短い間隔で連続して発生した場合に、サーバログへ警告を出力するパラメータです。0 にすると警告は無効になります。\nこの警告が頻繁に出る場合は、大量の更新によって WAL が多く生成され、チェックポイントが過剰に発生しています。チェックポイントは大量の書き込みを伴うため、max_wal_size を大きくしてチェックポイントの間隔を空けることを検討します。pg_stat_bgwriter の checkpoints_req（要求によるチェックポイント回数）でも確認できます。',
  evidence: [
    ['チェックポイントが頻発する状態のログと pg_stat_bgwriter',
      'pg_reload_conf\n----------------\n t\n(1 row)\n\n2026-09-17 06:45:11.339 UTC [6062] LOG:  checkpoint complete: wrote 1111 buffers (6.8%); 0 WAL file(s) added, 1 removed, 0 recycled; write=0.618 s, sync=0.018 s, total=0.649 s; sync files=3, longest=0.011 s, average=0.006 s; distance=18448 kB, estimate=29879 kB\n2026-09-17 06:45:11.339 UTC [6062] LOG:  checkpoints are occurring too frequently (1 second apart)\n2026-09-17 06:45:11.339 UTC [6062] HINT:  Consider increasing the configuration parameter "max_wal_size".\n2026-09-17 06:45:11.339 UTC [6062] LOG:  checkpoint starting: wal\n checkpoints_timed | checkpoints_req | buffers_checkpoint | buffers_backend | maxwritten_clean\n-------------------+-----------------+--------------------+-----------------+------------------\n                 0 |              66 |             128074 |           42736 |               12\n(1 row)\n\n pg_reload_conf\n----------------\n t\n(1 row)']
  ],
  refs: [
    ['checkpoint_warning', 'runtime-config-wal.html#GUC-CHECKPOINT-WARNING'],
    ['WALの設定', 'wal-configuration.html']
  ]
},
{
  id: 'G1.2-017', level: 'gold', cat: 'G1.2',
  q: 'PostgreSQL 14 でベースバックアップと WAL アーカイブから PITR（ポイントインタイムリカバリ）を行う手順として、正しいものを1つ選びなさい。',
  choices: [
    'データディレクトリにベースバックアップを展開し、recovery.conf に restore_command と復旧目標時刻を記述して起動する',
    'ベースバックアップを展開し、postgresql.conf に restore_command などを設定し、recovery.signal を作成して起動する',
    'データディレクトリにベースバックアップを展開し、standby.signal を作成してから pg_ctl promote を実行する',
    '稼働中のサーバに対して、pg_restore コマンドで復旧対象の時刻を指定して実行する',
    'pg_resetwal で WAL をリセットしてから、アーカイブ済みの WAL を pg_wal ディレクトリにコピーして起動する'
  ],
  answer: 1,
  exp: 'PostgreSQL 12 以降、recovery.conf は廃止され、リカバリ用の設定は postgresql.conf（や postgresql.auto.conf）に記述します。アーカイブリカバリを行うことをサーバに指示するのは recovery.signal ファイルの存在です。\n手順は、サーバ停止 → 現データディレクトリの退避 → ベースバックアップの展開 → 未アーカイブの WAL があれば pg_wal へコピー → restore_command や recovery_target_time などの設定 → recovery.signal の作成 → サーバ起動、となります。\nstandby.signal を置くとスタンバイ（継続的なリカバリ）として起動します。\nリカバリ完了後の動作は recovery_target_action（既定 pause）で制御し、pg_wal_replay_resume() などで昇格させます。',
  refs: [
    ['ポイントインタイムリカバリ', 'continuous-archiving.html#BACKUP-PITR-RECOVERY'],
    ['リカバリターゲット', 'runtime-config-wal.html#RUNTIME-CONFIG-WAL-RECOVERY-TARGET'],
    ['アーカイブリカバリの設定', 'runtime-config-wal.html#RUNTIME-CONFIG-WAL-ARCHIVE-RECOVERY']
  ]
},
{
  id: 'G1.2-018', level: 'gold', cat: 'G1.2',
  q: '`pg_dump` の出力形式と並列実行に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '`-Fd`（ディレクトリ形式）で出力する場合に限り、`-j` による並列ダンプが利用できる',
    '`-Fp`（プレーンテキスト形式）であっても、`-j` を指定すれば並列にダンプできる',
    '`-Fc`（カスタム形式）の出力は、psql にそのまま流し込んで復元することができる',
    '`-Fd` で出力したディレクトリは、pg_restore では読み込むことができない',
    '`-j` を指定した並列ダンプでは、ダンプ全体の一貫性が保証されない'
  ],
  answer: 0,
  exp: 'pg_dump の `-j`（--jobs）による並列ダンプは、ディレクトリ形式（-Fd）でのみ指定できます。テーブルごとに別ファイルへ出力する形式だからです。\nカスタム形式（-Fc）やディレクトリ形式（-Fd）、tar 形式（-Ft）は pg_restore で復元します。psql に直接流し込めるのはプレーンテキスト形式（-Fp）だけです。\n並列ダンプでは同期スナップショットを使って複数の接続が同じ時点を参照するため、一貫性は保たれます。\nなお pg_restore 側の `-j` は、カスタム形式とディレクトリ形式の両方で利用できます。',
  refs: [
    ['pg_dump', 'app-pgdump.html'],
    ['pg_restore', 'app-pgrestore.html']
  ]
},
{
  id: 'G1.2-019', level: 'gold', cat: 'G1.2',
  q: '自動バキュームの負荷を抑えるコストベースの遅延に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'autovacuum_vacuum_cost_delay を大きくすると、自動バキュームの1回あたりの処理は速く終わるようになる',
    'autovacuum_vacuum_cost_limit の既定値 -1 は、vacuum_cost_limit の値を使うことを意味する',
    'コストベースの遅延は自動バキューム専用で、手動の VACUUM では一切利用できない',
    'autovacuum_vacuum_cost_limit は、起動している自動バキュームワーカーごとに個別に割り当てられる',
    'autovacuum_vacuum_cost_delay の既定値は 0 であり、遅延なしで動作する'
  ],
  answer: 1,
  exp: 'autovacuum_vacuum_cost_limit の既定値は -1 で、これは通常の vacuum_cost_limit（既定 200）の値を使うことを意味します。\nautovacuum_vacuum_cost_delay（PostgreSQL 12 以降の既定値は 2ms）を大きくすると待ち時間が増え、I/O 負荷は下がりますが処理は遅くなります。\nコストベースの遅延は手動の VACUUM でも vacuum_cost_delay（既定 0 = 遅延なし）などで利用できます。\nコスト上限は複数の自動バキュームワーカーで按分されるため、ワーカー数を増やしても全体の I/O 負荷の上限は変わりません。',
  refs: [
    ['自動バキュームの設定', 'runtime-config-autovacuum.html'],
    ['コストに基づくバキューム遅延', 'runtime-config-resource.html#RUNTIME-CONFIG-RESOURCE-VACUUM-COST']
  ]
},
{
  id: 'G1.2-020', level: 'gold', cat: 'G1.2',
  q: '`pg_receivewal` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'archive_command と同様に、サーバが WAL セグメントを切り替えたタイミングでのみ WAL を取得する',
    'ストリーミングレプリケーションのプロトコルで WAL を受信し、アーカイブに近い仕組みを小さな遅延で実現できる',
    'スタンバイサーバ上で動作し、受信した WAL を自動的に適用してリカバリを進めるツールである',
    'ベースバックアップの取得機能を持っており、pg_basebackup の代わりに使用することができる',
    'レプリケーションスロットには対応しておらず、WAL の保持はサーバ側の wal_keep_size にのみ依存する'
  ],
  answer: 1,
  exp: 'pg_receivewal はストリーミングレプリケーションのプロトコルを使ってサーバから WAL を受け取り、ローカルのファイルに書き出すツールです。WAL セグメントが満たされるのを待つ archive_command と違い、リアルタイムに近い形で WAL を退避できます。\n受信中のファイルには .partial という接尾辞が付きます。\n`--slot` でレプリケーションスロットを指定でき、スロットを使えば未受信の WAL がサーバから削除されることを防げます。\nWAL の適用（リカバリ）は行わず、ベースバックアップの取得機能もありません。',
  refs: [
    ['pg_receivewal', 'app-pgreceivewal.html'],
    ['レプリケーションスロット', 'warm-standby.html#STREAMING-REPLICATION-SLOTS']
  ]
},
{
  id: 'G1.2-021', level: 'gold', cat: 'G1.2',
  q: 'PostgreSQL 14 で取得したベースバックアップの内容が壊れていないかを検証する方法として、正しいものを1つ選びなさい。',
  choices: [
    'pg_basebackup が出力する backup_manifest を使い、pg_verifybackup でファイルの過不足とチェックサムを検証する',
    'pg_controldata にバックアップディレクトリを指定すると、格納されている全ファイルのチェックサムが検証される',
    'pg_dump でバックアップディレクトリを読み込ませると、破損している場合にエラーが返される',
    'バックアップ検証専用の SQL 関数 pg_verify_backup() を、稼働中のサーバ上で実行する',
    'amcheck モジュールをバックアップディレクトリに対して実行し、内容を検証する'
  ],
  answer: 0,
  exp: 'pg_basebackup はバックアップの各ファイルの一覧とチェックサム、必要な WAL の範囲を記録した backup_manifest ファイルを出力します。pg_verifybackup（PostgreSQL 13 で追加）はこのマニフェストを使って、ファイルの過不足や内容の変化を検証します。`-n` を付けると WAL の検証を省略できます。\npg_controldata は pg_control の内容を表示するツールで、検証機能はありません。\namcheck は稼働中のサーバのインデックスの整合性を検査するモジュールです。',
  refs: [
    ['pg_verifybackup', 'app-pgverifybackup.html'],
    ['pg_basebackup', 'app-pgbasebackup.html']
  ]
},
{
  id: 'G1.2-022', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: 'WAL アーカイブを保存しているディレクトリの使用量が増え続けている。不要になった WAL を整理する方法として、最も適切なものを1つ選びなさい。',
  choices: [
    'pg_archivecleanup に、保持したいベースバックアップが必要とする最古の WAL ファイル名を渡して古いものを削除する',
    'pg_wal ディレクトリの中身と同じものが入っているだけなので、アーカイブ先のファイルはいつ削除してもよい',
    'archive_cleanup_interval パラメータを設定しておくと、サーバが自動的にアーカイブを削除してくれる',
    'pg_resetwal をアーカイブディレクトリに対して実行すると、不要になったファイルが削除される',
    'VACUUM を実行すると、不要になったアーカイブ済みの WAL も併せて削除される'
  ],
  answer: 0,
  exp: 'アーカイブ先の WAL はサーバが自動的に削除しないため、運用者が管理する必要があります。pg_archivecleanup は、指定した WAL ファイルより古いアーカイブを削除するツールで、単独で実行するほか、スタンバイの archive_cleanup_command に指定して使うこともできます。\n削除してよいのは、保持しているベースバックアップのリカバリに不要になったものだけです。まだ必要な WAL を消すと PITR ができなくなります。\npg_resetwal は停止中のデータディレクトリの WAL を初期化する緊急用のツールで、アーカイブの整理には使いません。',
  evidence: [
    ['pg_archivecleanup で、バックアップより古いアーカイブを整理した例',
      'ERROR:  duplicate key value violates unique constraint "av_pkey"\nDETAIL:  Key (id)=(100001) already exists.\nERROR:  duplicate key value violates unique constraint "av_pkey"\nDETAIL:  Key (id)=(100001) already exists.\n$ ls archive/\n000000010000000000000092\n000000010000000000000092.00000028.backup\n000000010000000000000093\n000000010000000000000094\n000000010000000000000095\n000000010000000000000099\n$ ls base2/ | grep backup_label\nbackup_label\nbackup_manifest\nバックアップの開始位置を示すファイル: 000000010000000000000092.00000028.backup\n$ pg_archivecleanup -n archive/ <上記のファイル>   （-n は削除せずに一覧表示）\n/var/lib/pgsql/14/backup/archive/000000010000000000000074\n/var/lib/pgsql/14/backup/archive/000000010000000000000076\n/var/lib/pgsql/14/backup/archive/000000010000000000000078\n/var/lib/pgsql/14/backup/archive/00000001000000000000007A\n/var/lib/pgsql/14/backup/archive/00000001000000000000007B\n$ pg_archivecleanup archive/ <上記のファイル>\n$ ls archive/\n000000010000000000000092.00000028.backup\n000000010000000000000093\n000000010000000000000094\n000000010000000000000095\n000000010000000000000099']
  ],
  refs: [
    ['pg_archivecleanup', 'pgarchivecleanup.html'],
    ['継続的アーカイブ', 'continuous-archiving.html']
  ]
},
{
  id: 'G1.2-023', level: 'gold', cat: 'G1.2',
  q: 'VACUUM の並列実行に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'VACUUM (PARALLEL n) はインデックスの処理を並列化するもので、VACUUM FULL では使用できない',
    'VACUUM (PARALLEL n) は1つのテーブルの本体スキャンを n 個のワーカーで分担する',
    'vacuumdb の -j オプションは、1つのテーブルの VACUUM を複数ワーカーで実行する',
    'VACUUM の並列実行は max_connections の範囲で自動的に行われ、明示指定はできない',
    'インデックスが1つしかないテーブルでも、PARALLEL を指定すれば並列に処理される'
  ],
  answer: 0,
  exp: 'PostgreSQL 13 以降、VACUUM (PARALLEL n) はテーブルに付いたインデックスのバキューム処理を複数のパラレルワーカーで分担できます。テーブル本体のスキャン自体は並列化されません。対象となるインデックスが2つ以上ある場合にのみ意味があり、VACUUM FULL では使えません。\nワーカー数は max_parallel_maintenance_workers に制限されます。\nvacuumdb の -j は複数のテーブルに対する VACUUM を同時に走らせるもので、意味が異なります。',
  refs: [
    ['VACUUM', 'sql-vacuum.html'],
    ['vacuumdb', 'app-vacuumdb.html'],
    ['max_parallel_maintenance_workers', 'runtime-config-resource.html#GUC-MAX-PARALLEL-MAINTENANCE-WORKERS']
  ]
},
{
  id: 'G1.2-024', level: 'gold', cat: 'G1.2',
  q: '更新の激しい特定のテーブルだけ、自動バキュームをより頻繁に実行させたい。適切な方法を1つ選びなさい。',
  choices: [
    'ALTER TABLE ... SET (autovacuum_vacuum_scale_factor = 0.02) のように、テーブル単位の格納パラメータを設定する',
    'postgresql.conf の autovacuum_vacuum_scale_factor を小さくして、全体の設定を変更する',
    'そのテーブルに対して ALTER TABLE ... SET (autovacuum = force) を設定する',
    'テーブル単位では設定できないため、cron などから定期的に VACUUM を実行するしかない',
    'そのテーブルを専用のテーブル空間に移動させると、自動バキュームの優先度が上がる'
  ],
  answer: 0,
  exp: '自動バキュームのしきい値はテーブル単位の格納パラメータで上書きできます。ALTER TABLE ... SET (autovacuum_vacuum_scale_factor = 0.02, autovacuum_vacuum_threshold = 1000) のように指定すると、そのテーブルだけ早めにバキュームされます。autovacuum_enabled、autovacuum_vacuum_cost_delay、autovacuum_analyze_* なども同様に設定できます。\npostgresql.conf を変更するとすべてのテーブルに影響してしまいます。\nautovacuum = force という値はありません。\nテーブル空間は格納場所の指定であり、バキュームの優先度とは関係ありません。',
  refs: [
    ['格納パラメータ', 'sql-createtable.html#SQL-CREATETABLE-STORAGE-PARAMETERS'],
    ['自動バキュームデーモン', 'routine-vacuuming.html#AUTOVACUUM']
  ]
},
{
  id: 'G1.2-025', level: 'gold', cat: 'G1.2',
  q: 'サービスを止めずにインデックスを再作成したい。PostgreSQL 14 における方法として、正しいものを1つ選びなさい。',
  choices: [
    'REINDEX INDEX CONCURRENTLY を使うと、書き込みをほぼ止めずに再作成できるが、通常より時間がかかる',
    'REINDEX INDEX CONCURRENTLY は読み取りも含めてテーブルを排他ロックするため、停止時間が必要になる',
    'REINDEX は常にテーブルへの書き込みを許可するため、CONCURRENTLY を指定する意味はない',
    'REINDEX CONCURRENTLY はトランザクションブロックの中で実行する必要がある',
    'REINDEX CONCURRENTLY が途中で失敗した場合、元のインデックスも一緒に削除される'
  ],
  answer: 0,
  exp: 'PostgreSQL 12 以降、REINDEX に CONCURRENTLY を指定できます。新しいインデックスを裏で構築してから入れ替えるため、対象テーブルへの書き込みをほぼ阻害しません。その代わりテーブルを複数回スキャンし、他のトランザクションの完了を待つため、通常の REINDEX より時間がかかります。\nCONCURRENTLY を付けない REINDEX は、対象インデックスのテーブルに対する書き込みをブロックします。\nCONCURRENTLY はトランザクションブロックの中では実行できません。\n失敗した場合は、_ccnew という接尾辞の付いた無効なインデックスが残ることがあり、DROP INDEX で削除します。元のインデックスは残ります。',
  refs: [
    ['REINDEX', 'sql-reindex.html'],
    ['インデックスの再構築', 'routine-reindex.html']
  ]
},
{
  id: 'G1.2-026', level: 'gold', cat: 'G1.2',
  q: '`CREATE INDEX CONCURRENTLY` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '作成中もテーブルへの書き込みを許可するが、失敗すると無効なインデックスが残るため削除が必要になる',
    '作成中はテーブルへの書き込みを禁止するが、読み取りは許可される',
    '通常の CREATE INDEX よりテーブルのスキャン回数が少なく、短時間で完了する',
    '作成に失敗した場合は自動的に後始末が行われるため、利用者が対処する必要はない',
    'トランザクションブロックの中でのみ実行できる'
  ],
  answer: 0,
  exp: 'CREATE INDEX CONCURRENTLY は、対象テーブルへの INSERT / UPDATE / DELETE を止めずにインデックスを作成します。その代わりテーブルを2回スキャンし、実行中のトランザクションの完了を待つため、通常より時間がかかります。\n通常の CREATE INDEX は、作成中そのテーブルへの書き込みをブロックします。\nCONCURRENTLY で作成に失敗すると、pg_index の indisvalid が false の「無効なインデックス」が残ります。これは検索には使われませんが更新時の維持コストはかかるため、DROP INDEX で削除してから作り直します。無効なインデックスは psql の \\d で INVALID と表示されます。\nトランザクションブロック内では実行できません。',
  refs: [
    ['CREATE INDEX', 'sql-createindex.html'],
    ['インデックスの同時作成', 'sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY']
  ]
},
{
  id: 'G1.2-027', level: 'gold', cat: 'G1.2',
  q: '運用中のパーティションテーブルから、古いパーティションを切り離す操作に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'ALTER TABLE ... DETACH PARTITION ... CONCURRENTLY を使うと、親テーブルへの参照を止めずに切り離せる',
    'DETACH PARTITION を実行すると、切り離されたパーティションのデータも同時に削除される',
    'DETACH PARTITION CONCURRENTLY は、トランザクションブロックの中でのみ実行できる',
    'パーティションを切り離すには、いったん親テーブルごと DROP するしかない',
    '切り離したテーブルは独立した通常のテーブルにはならず、参照することができない'
  ],
  answer: 0,
  exp: 'PostgreSQL 14 で ALTER TABLE ... DETACH PARTITION ... CONCURRENTLY が追加され、親テーブルに対する強いロックを長く取らずにパーティションを切り離せるようになりました（トランザクションブロックの中では実行できません）。\n通常の DETACH PARTITION でも、切り離されたパーティションは独立した通常のテーブルとして残り、データは保持されます。アーカイブ用に別の場所へ移したり、その後 DROP TABLE で削除したりできます。\n古いデータの一括削除では、DELETE よりも該当パーティションの切り離しや削除の方がはるかに軽い処理になります。',
  refs: [
    ['ALTER TABLE', 'sql-altertable.html'],
    ['パーティションの管理', 'ddl-partitioning.html#DDL-PARTITIONING-DECLARATIVE-MAINTENANCE']
  ]
},
{
  id: 'G1.2-028', level: 'gold', cat: 'G1.2',
  q: '自動バキュームの対象にならないため、必要に応じてセッションから VACUUM や ANALYZE を実行すべきオブジェクトを1つ選びなさい。',
  choices: [
    '一時テーブル',
    'UNLOGGED テーブル',
    'パーティションの子テーブル',
    'マテリアライズドビュー',
    'TOAST テーブル'
  ],
  answer: 0,
  shuffle: false,
  exp: '一時テーブルは、それを作成したセッションからしかアクセスできないため、自動バキュームのワーカーが処理できません。長時間のセッションで一時テーブルを繰り返し更新する場合は、そのセッション内で VACUUM や ANALYZE を明示的に実行する必要があります。\nUNLOGGED テーブルやパーティションの子テーブルは通常のテーブルと同じく自動バキュームの対象です。\nTOAST テーブルは、親テーブルのバキューム時に併せて処理されます。',
  refs: [
    ['定常的なバキューム作業', 'routine-vacuuming.html'],
    ['自動バキュームデーモン', 'routine-vacuuming.html#AUTOVACUUM']
  ]
},
{
  id: 'G1.2-029', level: 'gold', cat: 'G1.2',
  q: 'PostgreSQL 14 の `pg_start_backup(label, fast, exclusive)` の引数に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    '第2引数に true を指定すると、チェックポイントを急いで実行し、すぐにバックアップを開始できる',
    '第3引数を省略すると排他的バックアップになる',
    '第2引数に true を指定すると、バックアップ自体が並列で実行される',
    '第3引数を省略すると非排他的バックアップになる',
    '第1引数のラベルは、あらかじめ決められた書式に従う必要がある'
  ],
  answer: [0, 1],
  exp: 'pg_start_backup の第2引数 fast に true を指定すると、通常の I/O 平準化を待たずにチェックポイントを即座に実行するため、バックアップをすぐ開始できます（そのぶん一時的な I/O 負荷は高くなります）。並列実行を指示するものではありません。\n第3引数 exclusive を省略した場合は排他的バックアップになります。非排他的バックアップを行うには false を明示します。\n第1引数のラベルは利用者が自由に付けられる識別用の文字列です。\nなお排他的バックアップは PostgreSQL 9.6 以降は非推奨で、これらの関数は 15 で pg_backup_start / pg_backup_stop に置き換えられています。',
  refs: [
    ['バックアップ制御関数', 'functions-admin.html#FUNCTIONS-ADMIN-BACKUP'],
    ['低レベルAPIによるバックアップ', 'continuous-archiving.html#BACKUP-LOWLEVEL-BASE-BACKUP']
  ]
},
{
  id: 'G1.2-030', level: 'gold', cat: 'G1.2',
  q: 'WAL アーカイブに関する説明として、**適切でないもの**を2つ選びなさい。',
  choices: [
    'archive_mode が off でも、archive_command が設定されていればアーカイブは出力される',
    'ベースバックアップを取得すれば、それ以前の WAL アーカイブはリカバリに不要である',
    'archive_command には圧縮コマンドを組み合わせて指定できる',
    'アーカイブした WAL ファイルは、別のサーバへ退避させてもよい',
    'アーカイブを有効にするには、wal_level を replica 以上にする必要がある'
  ],
  answer: [0, 1],
  exp: 'archive_command が設定されていても、archive_mode が off であればアーカイブは行われません。両方を有効にする必要があり、archive_mode の変更にはサーバの再起動が必要です。\n新しいベースバックアップを取得しても、それより古いベースバックアップから復旧する可能性がある限り、その時点以降の WAL アーカイブは必要です。「取得したから以前のアーカイブは不要」と一律には言えません。\narchive_command は任意のシェルコマンドなので、圧縮して保存することもできます。アーカイブ先を別サーバにすることも一般的です。\nアーカイブを行うには wal_level が replica 以上である必要があります。',
  refs: [
    ['WALアーカイブの設定', 'continuous-archiving.html#BACKUP-ARCHIVING-WAL'],
    ['アーカイブ処理', 'runtime-config-wal.html#RUNTIME-CONFIG-WAL-ARCHIVING']
  ]
},
{
  id: 'G1.2-031', level: 'gold', cat: 'G1.2',
  q: 'テーブルの肥大化を解消する保守コマンドに関する説明として、適切なものを3つ選びなさい。',
  choices: [
    'VACUUM FULL はテーブルを書き直すため、元のサイズとほぼ同じ空き容量が一時的に必要になる',
    'CLUSTER は指定したインデックスの順に行を並べ替えて書き直す',
    'VACUUM FULL と CLUSTER はいずれも ACCESS EXCLUSIVE ロックを獲得する',
    'VACUUM FULL は実行中も対象テーブルへの参照と更新を許可する',
    'CLUSTER はインデックスがないテーブルでも実行できる'
  ],
  answer: [0, 1, 2],
  exp: 'VACUUM FULL はテーブルの内容を新しいファイルに書き直して不要領域を OS に返却します。書き直しの間は新旧両方のファイルが存在するため、元のテーブルとほぼ同じ空き容量が必要です。\nCLUSTER は指定したインデックスの順序で行を並べ替えて書き直すコマンドで、やはりテーブル全体が作り直されます。対象とするインデックスが必要なので、インデックスのないテーブルには実行できません。\nどちらも ACCESS EXCLUSIVE ロックを獲得するため、実行中はそのテーブルへの参照も更新もできません。オンラインで行いたい場合は pg_repack のような外部ツールを検討します。',
  refs: [
    ['VACUUM', 'sql-vacuum.html'],
    ['CLUSTER', 'sql-cluster.html'],
    ['定常的なバキューム作業', 'routine-vacuuming.html#VACUUM-FOR-SPACE-RECOVERY']
  ]
},
{
  id: 'G1.2-032', level: 'gold', cat: 'G1.2',
  q: 'PostgreSQL 14 の `VACUUM` のオプションに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'INDEX_CLEANUP を off にすると、インデックスの掃除を省いて処理時間を短縮できる',
    'PROCESS_TOAST を off にすると、対応する TOAST テーブルの処理を省略できる',
    'TRUNCATE を off にすると、テーブル末尾の空きページも必ず OS に返却される',
    'DISABLE_PAGE_SKIPPING を指定すると、可視性マップを使ってページを飛ばすようになる',
    'SKIP_LOCKED を指定すると、ロックを獲得できるまで待ってから処理する'
  ],
  answer: [0, 1],
  exp: 'INDEX_CLEANUP はインデックスの掃除を行うかどうかの指定で、PostgreSQL 14 では既定値が auto になり、必要と判断された場合だけ実行されます。off にすると省略され、周回が迫った状況で急いで凍結したいときなどに使います。\nPROCESS_TOAST（PostgreSQL 14 で追加）を off にすると、TOAST テーブルの処理を省けます。\nTRUNCATE はテーブル末尾の空きページを切り詰めて OS に返す処理で、off にすると返却しなくなります（説明が逆です）。\nDISABLE_PAGE_SKIPPING は可視性マップによるページのスキップを「やめる」指定です。\nSKIP_LOCKED はロックを獲得できないテーブルを「待たずに飛ばす」指定です。',
  refs: [
    ['VACUUM', 'sql-vacuum.html'],
    ['定常的なバキューム作業', 'routine-vacuuming.html']
  ]
},
{
  id: 'G1.2-033', level: 'gold', cat: 'G1.2',
  q: 'PostgreSQL 14 で追加された `vacuum_failsafe_age` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'トランザクションIDの周回が迫ると、バキュームがコスト遅延やインデックス掃除を省いて凍結を急ぐ',
    'この値を超えたトランザクションを自動的にロールバックする',
    'バキュームの実行間隔を、この値を上限として自動調整する',
    'この値を超えた時間が経過したセッションを、自動的に切断する',
    'この値を超えると、自動バキュームが停止して警告だけを出すようになる'
  ],
  answer: 0,
  exp: 'vacuum_failsafe_age（既定 16億）は、テーブルの最も古い未凍結トランザクションIDの年齢がこの値を超えたときに、バキュームを「フェイルセーフモード」に切り替えるパラメータです。このモードではコストに基づく遅延が無効になり、インデックスの掃除も省略して、凍結の完了を最優先します。\nマルチトランザクション用には vacuum_multixact_failsafe_age があります。\nこれは周回によってデータベースが停止する事態を避けるための最後の砦で、通常はここに至る前に autovacuum_freeze_max_age による周回防止バキュームが動きます。',
  refs: [
    ['トランザクションIDの周回エラーの防止', 'routine-vacuuming.html#VACUUM-FOR-WRAPAROUND'],
    ['vacuum_failsafe_age', 'runtime-config-client.html#GUC-VACUUM-FAILSAFE-AGE']
  ]
},
{
  id: 'G1.2-034', level: 'gold', cat: 'G1.2',
  q: '`REINDEX` の対象指定に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'REINDEX DATABASE を実行すると、他のデータベースのインデックスも併せて再構築される',
    'REINDEX SYSTEM は、システムカタログのインデックスだけを再構築する',
    'PostgreSQL 14 では、パーティションテーブルやパーティションインデックスを対象にできる',
    'REINDEX TABLE を実行すると、そのテーブルのすべてのインデックスが再構築される',
    'REINDEX INDEX は、指定した1つのインデックスだけを再構築する'
  ],
  answer: 0,
  exp: 'REINDEX DATABASE が対象とするのは、現在接続しているデータベースのインデックスだけです。他のデータベースには作用しません。この点が誤りです。\nREINDEX SYSTEM はシステムカタログのインデックスに限定します。\nREINDEX TABLE はそのテーブルのすべてのインデックス、REINDEX INDEX は1つのインデックスが対象です。\nPostgreSQL 14 からは、パーティションテーブルやパーティションインデックスを指定すると、その配下のすべてのパーティションのインデックスが再構築されるようになりました（この場合は複数のトランザクションに分かれて実行されます）。',
  refs: [
    ['REINDEX', 'sql-reindex.html'],
    ['インデックスの再構築', 'routine-reindex.html']
  ]
},
{
  id: 'G1.2-035', level: 'gold', cat: 'G1.2',
  q: 'ログの出力量を抑えつつスロークエリを把握する設定として、適切なものを2つ選びなさい。',
  choices: [
    'log_min_duration_sample と log_statement_sample_rate で、一定時間を超えた文の一部だけを記録する',
    'log_min_duration_statement は、超えた文をすべて記録するため出力量が増えやすい',
    'log_statement_sample_rate は、log_min_duration_statement を超えた文にも適用される',
    'log_min_duration_sample を設定すると、log_min_duration_statement は無視される',
    'log_duration を on にすると、実行時間の長い文だけが記録される'
  ],
  answer: [0, 1],
  exp: 'log_min_duration_statement は、指定時間を超えたすべての文を記録します。確実ですが、該当する文が多いとログが膨らみます。\nPostgreSQL 13 で log_min_duration_sample と log_statement_sample_rate が追加され、「この時間を超えた文のうち、指定した割合だけを記録する」というサンプリングができるようになりました。両方を設定した場合、log_min_duration_statement を超えた文は必ず記録され、log_min_duration_sample を超えた分はサンプリングの対象になります。\nlog_duration は、記録される文に実行時間を付ける設定で、時間による絞り込みは行いません。',
  refs: [
    ['ログをいつ出力するか', 'runtime-config-logging.html#GUC-LOG-MIN-DURATION-SAMPLE'],
    ['エラー報告とログ取得', 'runtime-config-logging.html']
  ]
},
{
  id: 'G1.2-036', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: 'orders テーブルで大量の UPDATE と DELETE を行った後に、次の結果を確認した。orders には `ALTER TABLE orders SET (autovacuum_enabled = off)` が設定されている。説明と対処として、最も適切なものを1つ選びなさい。',
  code: ' relname | n_live_tup | n_dead_tup | n_tup_upd | n_tup_del | last_autovacuum\n---------+------------+------------+-----------+-----------+-----------------\n orders  |     270000 |     130000 |    100000 |     30000 |',
  choices: [
    '不要タプルが 13 万件たまっており、自動バキュームが無効なので手動で VACUUM を実行する',
    'n_dead_tup は削除した行数だけを数えるので、13 万行が DELETE されたことを示している',
    'last_autovacuum が空なのは統計の収集が止まっているためで、track_counts を on にする',
    'n_live_tup のほうが n_dead_tup より多いので、バキュームは必要ない',
    '不要タプルを回収するには、必ず VACUUM FULL を実行しなければならない'
  ],
  answer: 0,
  exp: 'n_dead_tup は不要タプル（どのトランザクションからも見えなくなった古い行バージョン）の推定数です。UPDATE でも古いバージョンが残るため、この例では UPDATE の 10 万件と DELETE の 3 万件を合わせた 13 万件が不要タプルになっています。\nテーブル単位で autovacuum_enabled = off にしているため自動バキュームは動かず、last_autovacuum は空のままです。手動で VACUUM を実行します。実際に VACUUM を実行すると、各インデックスから 130000 件の行バージョンが削除されました。\n通常の VACUUM で不要タプルの領域は再利用できるようになります。ファイルを縮めて OS に返す必要がある場合だけ、排他ロックを伴う VACUUM FULL を検討します。\n自動バキュームは不要タプルの割合（既定 20%）としきい値で起動するため、件数の大小だけで不要と判断はできません。',
  evidence: [
    ['自動バキュームを無効にしたテーブルの pg_stat_user_tables',
      'relname | n_live_tup | n_dead_tup | n_tup_upd | n_tup_hot_upd | n_tup_del | last_vacuum | last_autovacuum |         last_analyze          | seq_scan | idx_scan\n---------+------------+------------+-----------+---------------+-----------+-------------+-----------------+-------------------------------+----------+----------\n orders  |     270000 |     130000 |    100000 |             0 |     30000 |             |                 | 2026-09-17 06:30:24.656713+00 |        5 |        0\n(1 row)\n\nERROR:  function pgstattuple(unknown) does not exist\n\nLINE 1: ..., round(free_percent::numeric,1) AS free_pct FROM pgstattupl...\n                                                             ^\nHINT:  No function matches the given name and argument types. You might need to add explicit type casts.']
  ],
  refs: [
    ['pg_stat_all_tables', 'monitoring-stats.html#MONITORING-PG-STAT-ALL-TABLES-VIEW'],
    ['定常的なバキューム作業', 'routine-vacuuming.html'],
    ['格納パラメータ', 'sql-createtable.html#SQL-CREATETABLE-STORAGE-PARAMETERS']
  ]
},
{
  id: 'G1.2-037', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: '`VACUUM (VERBOSE) orders;` を実行したところ、次の出力が得られた（一部省略）。読み取れることとして、適切なものを2つ選びなさい。',
  code: 'INFO:  vacuuming "public.orders"\nINFO:  launched 1 parallel vacuum worker for index vacuuming (planned: 1)\nINFO:  scanned index "orders_pkey" to remove 130000 row versions\nINFO:  scanned index "orders_customer_id_idx" to remove 130000 row versions\nINFO:  table "orders": removed 130000 dead item identifiers in 2942 pages\nINFO:  index "orders_pkey" now contains 270000 row versions in 1647 pages\nINFO:  table "orders": found 30000 removable, 270000 nonremovable row versions\n       in 2942 out of 2942 pages\nDETAIL:  0 dead row versions cannot be removed yet, oldest xmin: 755\nINFO:  vacuuming "pg_toast.pg_toast_16450"\nVACUUM',
  choices: [
    'インデックスの掃除に、パラレルワーカーが1つ使われた',
    '古いトランザクションに邪魔されて回収できなかった不要な行バージョンはない',
    'テーブルのファイルサイズは、回収した不要行の分だけ縮小された',
    'TOAST テーブルは、VACUUM の処理対象から外されている',
    'VACUUM の実行中、orders には ACCESS EXCLUSIVE ロックがかかっていた'
  ],
  answer: [0, 1],
  exp: 'PostgreSQL 13 以降、インデックスが2つ以上あるテーブルの VACUUM では、インデックスの掃除をパラレルワーカーで分担できます。「launched 1 parallel vacuum worker for index vacuuming」がそれを示しています。\n「0 dead row versions cannot be removed yet」は、長時間のトランザクションなどのせいで回収できずに残った不要行がないことを表します。この値が大きい場合は、pg_stat_activity で古いトランザクションや idle in transaction のセッションを探します。\n通常の VACUUM は領域を再利用可能にするだけで、ファイルは基本的に縮みません。取得するのも読み書きを妨げない SHARE UPDATE EXCLUSIVE ロックです。\n最後の「vacuuming "pg_toast.pg_toast_16450"」のとおり、TOAST テーブルも既定で処理されます（PostgreSQL 14 の PROCESS_TOAST オプションで省略可能）。\nこの出力は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['VACUUM (VERBOSE) の出力全体',
      'INFO:  vacuuming "public.orders"\nINFO:  launched 1 parallel vacuum worker for index vacuuming (planned: 1)\nINFO:  scanned index "orders_pkey" to remove 130000 row versions\nDETAIL:  CPU: user: 0.02 s, system: 0.02 s, elapsed: 0.21 s\nINFO:  scanned index "orders_customer_id_idx" to remove 130000 row versions\nDETAIL:  CPU: user: 0.07 s, system: 0.01 s, elapsed: 0.26 s\nINFO:  table "orders": removed 130000 dead item identifiers in 2942 pages\nDETAIL:  CPU: user: 0.00 s, system: 0.00 s, elapsed: 0.13 s\nINFO:  index "orders_pkey" now contains 270000 row versions in 1647 pages\nDETAIL:  130000 index row versions were removed.\n0 index pages were newly deleted.\n0 index pages are currently deleted, of which 0 are currently reusable.\nCPU: user: 0.00 s, system: 0.00 s, elapsed: 0.00 s.\nINFO:  index "orders_customer_id_idx" now contains 270000 row versions in 1067 pages\nDETAIL:  130000 index row versions were removed.\n0 index pages were newly deleted.\n0 index pages are currently deleted, of which 0 are currently reusable.\nCPU: user: 0.00 s, system: 0.00 s, elapsed: 0.00 s.\nINFO:  table "orders": found 30000 removable, 270000 nonremovable row versions in 2942 out of 2942 pages\nDETAIL:  0 dead row versions cannot be removed yet, oldest xmin: 755\nSkipped 0 pages due to buffer pins, 0 frozen pages.\nCPU: user: 0.02 s, system: 0.04 s, elapsed: 0.46 s.\nINFO:  vacuuming "pg_toast.pg_toast_16450"\nINFO:  table "pg_toast_16450": found 0 removable, 0 nonremovable row versions in 0 out of 0 pages\nDETAIL:  0 dead row versions cannot be removed yet, oldest xmin: 755\nSkipped 0 pages due to buffer pins, 0 frozen pages.\nCPU: user: 0.00 s, system: 0.00 s, elapsed: 0.00 s.\nVACUUM']
  ],
  refs: [
    ['VACUUM', 'sql-vacuum.html'],
    ['定常的なバキューム作業', 'routine-vacuuming.html']
  ]
},
{
  id: 'G1.2-038', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: '`log_autovacuum_min_duration = 0` のサーバで、10 万行を INSERT して作ったばかりのテーブル hs について、次のログが出力された。説明として正しいものを1つ選びなさい。',
  code: 'LOG:  automatic vacuum of table "shop.public.hs": index scans: 0\n        pages: 0 removed, 443 remain, 0 skipped due to pins, 0 skipped frozen\n        tuples: 0 removed, 100000 remain, 0 are dead but not yet removable, oldest xmin: 778\n        index scan not needed: 0 pages from table (0.00% of total) had 0 dead item identifiers removed\nLOG:  automatic analyze of table "shop.public.hs"',
  choices: [
    '挿入された行数でも自動バキュームが起動するため、不要タプルがなくてもバキュームが実行された',
    '不要タプルがないのにバキュームが実行されているので、自動バキュームの設定が誤っている',
    '100000 行が不要タプルとして残っており、回収に失敗している',
    'インデックスの掃除を省略したため、次回は VACUUM FULL が必要になる',
    '自動 ANALYZE は、自動バキュームが不要タプルを回収した場合にだけ実行される'
  ],
  answer: 0,
  exp: 'PostgreSQL 13 以降、自動バキュームは更新・削除による不要タプルだけでなく、挿入された行数でも起動します（autovacuum_vacuum_insert_threshold / autovacuum_vacuum_insert_scale_factor）。挿入だけのテーブルでもバキュームして、可視性マップの更新や行の凍結を進めるためです。\nこのログでは「tuples: 0 removed, 100000 remain」と、回収する不要タプルはなく、すべての行が有効なまま残っています。「index scan not needed」はインデックスから消すものがなかったことを表します。\n自動 ANALYZE は、変更された行数（挿入を含む）が autovacuum_analyze_threshold と scale_factor に基づくしきい値を超えると、バキュームとは独立に実行されます。\nこのログは PostgreSQL 14 で実際に出力されたものです。',
  evidence: [
    ['INSERT だけを行ったテーブルに対する自動バキュームのログ',
      '2026-09-17 06:31:03.461 UTC [9005] LOG:  automatic vacuum of table "shop.public.customers": index scans: 0\n2026-09-17 06:44:11.605 UTC [13920] LOG:  automatic vacuum of table "shop.public.hs": index scans: 0\n2026-09-17 06:44:11.777 UTC [13920] LOG:  automatic analyze of table "shop.public.hs"\n	index scan not needed: 0 pages from table (0.00% of total) had 0 dead item identifiers removed\n	avg read rate: 0.050 MB/s, avg write rate: 13.623 MB/s\n--\n2026-09-17 06:44:11.605 UTC [13920] LOG:  automatic vacuum of table "shop.public.hs": index scans: 0\n	pages: 0 removed, 443 remain, 0 skipped due to pins, 0 skipped frozen\n	tuples: 0 removed, 100000 remain, 0 are dead but not yet removable, oldest xmin: 778\n	index scan not needed: 0 pages from table (0.00% of total) had 0 dead item identifiers removed\n	avg read rate: 0.624 MB/s, avg write rate: 0.624 MB/s']
  ],
  refs: [
    ['自動バキュームデーモン', 'routine-vacuuming.html#AUTOVACUUM'],
    ['log_autovacuum_min_duration', 'runtime-config-logging.html#GUC-LOG-AUTOVACUUM-MIN-DURATION'],
    ['自動バキュームの設定', 'runtime-config-autovacuum.html']
  ]
},
{
  id: 'G1.2-039', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: '誤って DROP TABLE を実行したため、その直前の 06:57:35 を recovery_target_time に指定して PITR を行った（recovery_target_action は既定値）。サーバログは次のとおりである。説明として適切なものを2つ選びなさい。',
  code: 'LOG:  starting point-in-time recovery to 2026-09-17 06:57:35+00\nLOG:  restored log file "000000010000000000000071" from archive\nLOG:  redo starts at 0/71000028\nLOG:  consistent recovery state reached at 0/71000100\nLOG:  database system is ready to accept read-only connections\nLOG:  restored log file "000000010000000000000072" from archive\nLOG:  recovery stopping before commit of transaction 813, time 2026-09-17 06:57:37.31168+00\nLOG:  pausing at the end of recovery\nHINT:  Execute pg_wal_replay_resume() to promote.',
  choices: [
    '目標時刻より後の 06:57:37 にコミットされたトランザクションは適用せずに、リカバリを止めている',
    'リカバリは一時停止しており、読み取り専用で状態を確認でき、pg_wal_replay_resume() で昇格できる',
    'リカバリはすでに完了して、書き込みもできる通常の状態で稼働している',
    'トランザクション 813 は目標時刻の直前なので、コミットまで適用されている',
    '一時停止を解除するには、recovery.signal を手動で削除してからサーバを再起動する'
  ],
  answer: [0, 1],
  exp: 'recovery_target_time を指定すると、その時刻より後にコミットされたトランザクションに到達した時点でリカバリを止めます（recovery_target_inclusive の既定 on は「目標時刻ちょうどのものは含める」という意味です）。この例では 06:57:37 にコミットされたトランザクション 813（誤った DROP TABLE）の直前で止まっています。\nrecovery_target_action の既定値は pause で、「pausing at the end of recovery」のとおり一時停止します。この間は読み取り専用の接続ができるため、データを確認してから pg_wal_replay_resume() を実行すると昇格します。目標が違っていた場合は、サーバを停止して別の目標時刻でやり直せます。\n昇格すると recovery.signal は自動的に削除されます。\nこのログは PostgreSQL 14 で実際に PITR を行って採取したものです。',
  evidence: [
    ['PITR の準備（アーカイブを有効にしてベースバックアップを取得）',
      'archive_mode\n--------------\n on\n(1 row)\n\n                                      archive_command\n--------------------------------------------------------------------------------------------\n test ! -f /var/lib/pgsql/14/backup/archive/%f && cp %p /var/lib/pgsql/14/backup/archive/%f\n(1 row)\n\nNOTICE:  all required WAL segments have been archived\n目標時刻: 2026-09-17 06:57:35+00\n archived_count |    last_archived_wal     | failed_count\n----------------+--------------------------+--------------\n              4 | 000000010000000000000072 |            0\n(1 row)'],
    ['recovery_target_time を指定して起動したときのログと、一時停止した状態',
      'LOG:  starting point-in-time recovery to 2026-09-17 06:57:35+00\nLOG:  restored log file "000000010000000000000071" from archive\nLOG:  redo starts at 0/71000028\nLOG:  consistent recovery state reached at 0/71000100\nLOG:  database system is ready to accept read-only connections\nLOG:  restored log file "000000010000000000000072" from archive\nLOG:  recovery stopping before commit of transaction 813, time 2026-09-17 06:57:37.31168+00\nLOG:  pausing at the end of recovery\nHINT:  Execute pg_wal_replay_resume() to promote.\n pg_is_in_recovery | pg_is_wal_replay_paused\n-------------------+-------------------------\n t                 | t\n(1 row)\n\n count |    last_row\n-------+----------------\n  1001 | before-mistake\n(1 row)\n\nls: cannot access \'/var/lib/pgsql/14/pitr/recovery.signal\': No such file or directory']
  ],
  refs: [
    ['ポイントインタイムリカバリ', 'continuous-archiving.html#BACKUP-PITR-RECOVERY'],
    ['リカバリターゲット', 'runtime-config-wal.html#RUNTIME-CONFIG-WAL-RECOVERY-TARGET'],
    ['リカバリ制御関数', 'functions-admin.html#FUNCTIONS-RECOVERY-CONTROL']
  ]
},
{
  id: 'G1.2-040', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: '誤って `DROP TABLE products` を実行したため、その直前の時刻を recovery_target_time に指定して PITR を行った。recovery_target_action は既定値のままで、ログに「recovery stopping before commit of transaction 813」（813 は誤って実行した DROP TABLE のトランザクション）と「pausing at the end of recovery」が出て、リカバリが一時停止した。復元できたか確認しようとして products テーブルを SELECT したところ、応答が返らなくなった。別のセッションで確認した結果が次のとおりである。原因として最も適切なものを1つ選びなさい。',
  code: '=# SELECT pid, backend_type, wait_event_type, wait_event, now() - query_start AS waiting\n     FROM pg_stat_activity WHERE backend_type IN (\'client backend\', \'startup\')\n       AND pid <> pg_backend_pid();\n  pid  |  backend_type  | wait_event_type |  wait_event   |     waiting\n-------+----------------+-----------------+---------------+-----------------\n 23566 | client backend | Lock            | relation      | 00:19:38.590172\n 23552 | startup        | IPC             | RecoveryPause |\n\n=# SELECT l.pid, a.backend_type, l.relation, l.mode, l.granted\n     FROM pg_locks l LEFT JOIN pg_stat_activity a USING (pid)\n     WHERE l.locktype = \'relation\' AND l.relation = 24592;\n  pid  |  backend_type  | relation |        mode         | granted\n-------+----------------+----------+---------------------+---------\n 23566 | client backend |    24592 | AccessShareLock     | f\n 23552 | startup        |    24592 | AccessExclusiveLock | t',
  choices: [
    'コミットされていない DROP TABLE のロック取得まで WAL が適用されており、startup プロセスがロックを保持したまま停止している',
    'リカバリ中はテーブルを一切参照できない仕様なので、SELECT は必ず待たされる',
    'products テーブルの行数が多いため、SELECT が単に時間を要している',
    'client backend と startup プロセスがデッドロックしているので、deadlock_timeout 後に自動で解消される',
    'recovery_target_time の指定が誤っているため、products テーブルは存在しない'
  ],
  answer: 0,
  exp: 'DROP TABLE は、実行時にテーブルの AccessExclusiveLock を取得し、その情報が WAL に記録されます。PITR はコミットの直前で止まるため、この例ではロック取得の WAL までは適用され、コミットの WAL は適用されていない状態で一時停止しています。WAL を適用する startup プロセスがそのロックを保持し続けるため、products を読もうとした SELECT が待ち続けました（pg_blocking_pids() でも startup プロセスが返りました）。\nこのロックは、トランザクション 813 が確定しないまま昇格する（中止扱いになる）と解放されます。実際に pg_wal_replay_resume() で昇格すると SELECT が完了し、DROP 直前の 1001 行が残っていることを確認できました。\n一時停止中も読み取り専用の接続はでき、このロックと関係のない問い合わせ（別セッションからの pg_stat_activity の参照など）は実行できました。デッドロックではないため、自動的には解消しません。\nこの状況は PostgreSQL 14 で実際に再現したものです。',
  evidence: [
    ['リカバリの適用（startup プロセス）と参照が競合して、問い合わせが待たされている状態',
      'pid  |  backend_type  | state  | wait_event_type |  wait_event   |     waiting     |                            query\n-------+----------------+--------+-----------------+---------------+-----------------+--------------------------------------------------------------\n 23566 | client backend | active | Lock            | relation      | 00:19:38.590172 | SELECT count(*), max(name) FILTER (WHERE id = 5001) AS last_\n 23552 | startup        |        | IPC             | RecoveryPause |                 |\n(2 rows)\n\n  pid  |  backend_type  | locktype | relation |        mode         | granted\n-------+----------------+----------+----------+---------------------+---------\n 23566 | client backend | relation |    24592 | AccessShareLock     | f\n 23552 | startup        | relation |    24597 | AccessExclusiveLock | t\n 23552 | startup        | relation |    24599 | AccessExclusiveLock | t\n 23552 | startup        | relation |    24595 | AccessExclusiveLock | t\n 23552 | startup        | relation |    24592 | AccessExclusiveLock | t\n 23552 | startup        | relation |    24596 | AccessExclusiveLock | t\n(6 rows)\n\n  pid  | pg_blocking_pids\n-------+------------------\n 23566 | {23552}\n(1 row)'],
    ['そのときのリカバリのログ',
      'LOG:  starting point-in-time recovery to 2026-09-17 06:57:35+00\nLOG:  restored log file "000000010000000000000071" from archive\nLOG:  redo starts at 0/71000028\nLOG:  consistent recovery state reached at 0/71000100\nLOG:  database system is ready to accept read-only connections\nLOG:  restored log file "000000010000000000000072" from archive\nLOG:  recovery stopping before commit of transaction 813, time 2026-09-17 06:57:37.31168+00\nLOG:  pausing at the end of recovery\nHINT:  Execute pg_wal_replay_resume() to promote.\n pg_is_in_recovery | pg_is_wal_replay_paused\n-------------------+-------------------------\n t                 | t\n(1 row)\n\n count |    last_row\n-------+----------------\n  1001 | before-mistake\n(1 row)\n\nls: cannot access \'/var/lib/pgsql/14/pitr/recovery.signal\': No such file or directory']
  ],
  refs: [
    ['ポイントインタイムリカバリ', 'continuous-archiving.html#BACKUP-PITR-RECOVERY'],
    ['ホットスタンバイでの競合の処理', 'hot-standby.html#HOT-STANDBY-CONFLICT'],
    ['pg_locks', 'view-pg-locks.html']
  ]
},
{
  id: 'G1.2-041', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: 'PITR の一時停止中に `pg_wal_replay_resume()` を実行して昇格させた。その後の確認結果は次のとおりである。説明として適切なものを2つ選びなさい。',
  code: 'LOG:  selected new timeline ID: 2\nLOG:  archive recovery complete\nLOG:  database system is ready to accept connections\n\n=# SELECT pg_is_in_recovery();\n f\n\n$ ls $PGDATA/recovery.signal\nls: cannot access \'.../recovery.signal\': No such file or directory\n$ cat $PGDATA/pg_wal/00000002.history\n1	0/72011270	before 2026-09-17 06:57:37.31168+00',
  choices: [
    '新しいタイムライン 2 が始まり、どの位置で分岐したかが履歴ファイルに記録された',
    'リカバリが完了して通常の稼働状態になり、recovery.signal は自動的に削除された',
    'タイムライン 1 の WAL は不要になったので、アーカイブから削除してよい',
    'pg_is_in_recovery() が f なので、まだリカバリを続けている',
    '新しいタイムラインで生成される WAL は、元のタイムライン 1 の WAL を上書きする'
  ],
  answer: [0, 1],
  exp: 'アーカイブリカバリの完了時には新しいタイムライン ID が割り当てられ、以降の WAL ファイル名の先頭がそれに変わります（00000002...）。こうすることで、元のタイムライン 1 の WAL を上書きせずに、元の歴史と分岐後の歴史を両立できます。\nタイムライン履歴ファイル 00000002.history には、親のタイムライン（1）、分岐した位置（0/72011270）、理由（06:57:37 のコミットの前で停止）が記録され、アーカイブにも保存されます。\n昇格すると recovery.signal は自動的に削除され、pg_is_in_recovery() は f（通常稼働）になります。\n元のタイムラインの WAL は、別の時点へ PITR し直す可能性がある間は残しておく必要があります。\nこの結果は PostgreSQL 14 で実際に PITR を行って採取したものです。',
  evidence: [
    ['pg_wal_replay_resume() で昇格させた後の状態（タイムラインの履歴ファイルを含む）',
      'ERROR:  recovery is not in progress\nHINT:  Recovery control functions can only be executed during recovery.\nLOG:  selected new timeline ID: 2\nLOG:  archive recovery complete\nLOG:  database system is ready to accept connections\n pg_is_in_recovery\n-------------------\n f\n(1 row)\n\nls: cannot access \'/var/lib/pgsql/14/pitr/recovery.signal\': No such file or directory\n00000002.history\n1	0/72011270	before 2026-09-17 06:57:37.31168+00\n\ndone'],
    ['そこに至るまでのリカバリのログ',
      'LOG:  starting point-in-time recovery to 2026-09-17 06:57:35+00\nLOG:  restored log file "000000010000000000000071" from archive\nLOG:  redo starts at 0/71000028\nLOG:  consistent recovery state reached at 0/71000100\nLOG:  database system is ready to accept read-only connections\nLOG:  restored log file "000000010000000000000072" from archive\nLOG:  recovery stopping before commit of transaction 813, time 2026-09-17 06:57:37.31168+00\nLOG:  pausing at the end of recovery\nHINT:  Execute pg_wal_replay_resume() to promote.\n pg_is_in_recovery | pg_is_wal_replay_paused\n-------------------+-------------------------\n t                 | t\n(1 row)\n\n count |    last_row\n-------+----------------\n  1001 | before-mistake\n(1 row)\n\nls: cannot access \'/var/lib/pgsql/14/pitr/recovery.signal\': No such file or directory']
  ],
  refs: [
    ['タイムライン', 'continuous-archiving.html#BACKUP-TIMELINES'],
    ['ポイントインタイムリカバリ', 'continuous-archiving.html#BACKUP-PITR-RECOVERY']
  ]
},
{
  id: 'G1.2-042', level: 'gold', cat: 'G1.2',
  q: 'データベースクラスタにある全データベースと、ロールおよびテーブル空間の定義をバックアップしたい。ただし、大きなデータベース sales は複数のジョブで並列にダンプして時間を短縮したい。適切な方法を1つ選びなさい。',
  choices: [
    'pg_dumpall --globals-only でロールとテーブル空間を取得し、sales は pg_dump -Fd -j 4 で、他のデータベースは pg_dump で取得する',
    'pg_dumpall -Fc -j 4 を実行して、全データベースとロールをカスタム形式で並列に取得する',
    'pg_dump --globals-only でロールとテーブル空間を取得し、sales は pg_dump -Fc -j 4 で取得する',
    'pg_dumpall で全体を取得すれば、sales のような大きなデータベースは自動的に並列でダンプされる',
    'pg_dumpall --roles-only だけを実行すれば、ロールと一緒に全データベースのデータも取得される'
  ],
  answer: 0,
  exp: 'pg_dumpall はクラスタ全体を対象とし、ロールやテーブル空間などのクラスタ共通のオブジェクトも出力します。内部ではデータベースごとに pg_dump を呼び出しますが、出力はプレーンテキストの SQL スクリプトだけで、カスタム形式（-Fc）や並列実行（-j）には対応していません。リストアは psql で行います。\n並列ダンプができるのは pg_dump のディレクトリ形式（-Fd）だけで、カスタム形式では -j を指定できません。一方 pg_dump はデータベースを1つずつ扱い、ロールやテーブル空間を出力しないため、--globals-only というオプションもありません。\nそこで、pg_dumpall --globals-only（-g）でロールとテーブル空間の定義を取得し、各データベースは pg_dump で取得します。sales は -Fd -j で並列にダンプし、pg_restore -j で並列にリストアできます。--roles-only（-r）はロールだけを出力し、データは含みません。',
  refs: [
    ['pg_dumpall', 'app-pg-dumpall.html'],
    ['pg_dump', 'app-pgdump.html'],
    ['pg_dumpallの使用', 'backup-dump.html#BACKUP-DUMP-ALL']
  ]
},
{
  id: 'G1.2-043', level: 'gold', cat: 'G1.2', type: 'scenario',
  q: 'サーバの状態を確認するため、次の3つの場面で pg_isready を実行した。出力の説明として、正しいものを1つ選びなさい。',
  code: '# (a) 通常運転中\n$ pg_isready -p 5432\n/run/postgresql:5432 - accepting connections\n$ echo $?\n0\n\n# (b) バックエンドの異常終了によるクラッシュリカバリの最中\n$ pg_isready -p 5432\n/run/postgresql:5432 - rejecting connections\n$ echo $?\n1\n\n# (c) ポート 5499 を指定\n$ pg_isready -p 5499\n/run/postgresql:5499 - no response\n$ echo $?\n2',
  choices: [
    '(b) の rejecting connections は、サーバは動いているが、起動処理やリカバリの途中などのため接続を受け付けていない状態を表す',
    '(c) の no response は、サーバには届いたものの、ユーザ名やパスワードが誤っていて認証に失敗したことを表す',
    'pg_isready は実際にログインして SELECT 1 を実行し、問い合わせに成功したかどうかで状態を判定している',
    '正しい状態を得るには、実在するデータベース名、ユーザ名とそのパスワードを必ず指定しなければならない',
    '終了ステータスが 0 以外であれば、どの値であってもサーバのプロセスが停止していることを表している'
  ],
  answer: 0,
  exp: 'pg_isready はサーバの接続状態を調べるコマンドで、終了ステータスは次のとおりです。\n・0: 接続を受け付けている（accepting connections）\n・1: 接続を拒否している（rejecting connections）。起動処理やリカバリの途中など\n・2: 接続の試みに応答がない（no response）。サーバが動いていない、ポートが違うなど\n・3: 接続を試みなかった（パラメータが不正な場合など）\n(b) はクラッシュリカバリの最中で、このとき psql で接続しても「the database system is in recovery mode」で拒否されました。リカバリが終わると accepting connections に戻ります。\npg_isready は問い合わせを実行せず、接続の可否だけを確認します。状態を得るために正しいユーザ名やパスワードは必要ありません（ただし、誤った値を指定すると、失敗した接続の試みがサーバログに記録されます）。監視スクリプトや、起動を待ってから処理を始めるスクリプトでよく使われます。',
  evidence: [
    ['pg_isready をいくつかの状況で実行した結果',
      '$ pg_isready -p 5432\n/run/postgresql:5432 - accepting connections\nexit status: 0\n$ pg_isready -h localhost -p 5432\nlocalhost:5432 - accepting connections\nexit status: 0\n$ pg_isready -p 5499\n/run/postgresql:5499 - no response\nexit status: 2\n$ pg_isready -q -p 5499\nexit status: 2\n$ pg_isready -p 5432 -d "port=abc"\n/run/postgresql:abc - no response\nexit status: 2'],
    ['クラッシュリカバリ中は rejecting connections（終了ステータス 1）になり、復旧後に戻る',
      '2026-09-18 13:20:53.453 UTC [4857] LOG:  database system is ready to accept connections\n2026-09-18 13:21:04.298 UTC [4857] LOG:  server process (PID 5027) was terminated by signal 11: Segmentation fault\n2026-09-18 13:21:04.298 UTC [4857] DETAIL:  Failed process was running: SELECT pg_sleep(30);\n2026-09-18 13:21:04.298 UTC [4857] LOG:  terminating any other active server processes\n2026-09-18 13:21:04.301 UTC [4857] LOG:  all server processes terminated; reinitializing\n2026-09-18 13:21:04.334 UTC [5042] LOG:  database system was interrupted; last known up at 2026-09-18 13:20:54 UTC\nterms=# SELECT count(*) FROM emp WHERE name = \'x\';\npsql: error: connection to server on socket "/run/postgresql/.s.PGSQL.5432" failed: FATAL:  the database system is in recovery mode\n$ pg_isready -p 5432\n/run/postgresql:5432 - rejecting connections\nexit status: 1\n\n2026-09-18 13:21:07.638 UTC [5042] LOG:  database system was not properly shut down; automatic recovery in progress\n2026-09-18 13:21:07.644 UTC [5042] LOG:  redo starts at 0/74006F70\n2026-09-18 13:21:07.705 UTC [5042] LOG:  redo done at 0/74A693F8 system usage: CPU: user: 0.03 s, system: 0.02 s, elapsed: 0.06 s\n2026-09-18 13:21:07.865 UTC [4857] LOG:  database system is ready to accept connections\n count\n-------\n     0\n(1 row)\n\n$ pg_isready -p 5432\n/run/postgresql:5432 - accepting connections\nexit status: 0']
  ],
  refs: [
    ['pg_isready', 'app-pg-isready.html'],
    ['サーバの起動', 'server-start.html']
  ]
},

/* ---------------- G1.3 データベースの構造（重要度 2 / 23問） ---------------- */
{
  id: 'G1.3-001', level: 'gold', cat: 'G1.3',
  q: 'PostgreSQL 14 を initdb 直後の既定の設定で起動したとき、起動しないバックグラウンドプロセスを1つ選びなさい。',
  choices: [
    'checkpointer',
    'background writer',
    'walwriter',
    'autovacuum launcher',
    'archiver'
  ],
  answer: 4,
  exp: 'PostgreSQL 14 を既定の設定で起動すると、postmaster の子プロセスとして checkpointer、background writer、walwriter、autovacuum launcher、stats collector、logical replication launcher などが起動します。\narchiver は WAL アーカイブを行うプロセスで、archive_mode が on（または always）の場合にのみ起動します。archive_mode の既定値は off です。\nなお stats collector は PostgreSQL 15 で廃止され、統計情報は共有メモリで管理されるようになりました。',
  refs: [
    ['標準Unixツール（プロセスの確認）', 'monitoring-ps.html'],
    ['archive_mode', 'runtime-config-wal.html#GUC-ARCHIVE-MODE']
  ]
},
{
  id: 'G1.3-002', level: 'gold', cat: 'G1.3',
  q: 'テーブルのデータの格納方法に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'テーブルのデータファイルのファイル名は、テーブル名と同じ名前になる',
    '空き領域マップは、ファイル名の末尾に _vm が付いたフォークに格納される',
    '可視性マップは、ファイル名の末尾に _fsm が付いたフォークに格納される',
    'データファイルは 1GB を超えると、relfilenode.1 などのセグメントに分割される',
    'テーブルのデータ本体は、WAL と同じ pg_wal ディレクトリに格納される'
  ],
  answer: 3,
  exp: 'テーブルやインデックスは base/<データベースのOID>/<relfilenode> というファイルに格納されます。ファイル名はテーブル名ではなく pg_class.relfilenode の値です（pg_relation_filepath() で確認できます）。\nファイルが 1GB（既定のセグメントサイズ）を超えると、relfilenode.1、relfilenode.2 … と分割されます。\n空き領域マップ（FSM）は _fsm、可視性マップ（VM）は _vm という接尾辞のフォークに格納されます。\npg_wal ディレクトリは WAL（先行書き込みログ）ファイルの格納場所です。',
  refs: [
    ['データベースファイルのレイアウト', 'storage-file-layout.html'],
    ['空き領域マップ', 'storage-fsm.html'],
    ['可視性マップ', 'storage-vm.html']
  ]
},
{
  id: 'G1.3-003', level: 'gold', cat: 'G1.3',
  q: '`postgres_fdw` を使って別の PostgreSQL サーバのテーブルを外部テーブルとして参照できるようにする場合の手順として、正しい順序のものを1つ選びなさい。',
  choices: [
    'CREATE EXTENSION → CREATE SERVER → CREATE USER MAPPING → CREATE FOREIGN TABLE',
    'CREATE SERVER → CREATE EXTENSION → CREATE FOREIGN TABLE → CREATE USER MAPPING',
    'CREATE FOREIGN TABLE → CREATE SERVER → CREATE EXTENSION → CREATE USER MAPPING',
    'CREATE USER MAPPING → CREATE EXTENSION → CREATE FOREIGN TABLE → CREATE SERVER',
    'CREATE EXTENSION → CREATE FOREIGN TABLE → CREATE USER MAPPING → CREATE SERVER'
  ],
  answer: 0,
  exp: 'postgres_fdw の基本的な設定手順は次のとおりです。\n1. CREATE EXTENSION postgres_fdw; で拡張（外部データラッパ）をインストールする\n2. CREATE SERVER で接続先（host、port、dbname など）を外部サーバとして定義する\n3. CREATE USER MAPPING で、ローカルのロールごとに接続先で使うユーザ名・パスワードを定義する\n4. CREATE FOREIGN TABLE（または IMPORT FOREIGN SCHEMA）で外部テーブルを作成する\n外部テーブルは外部サーバを参照するため、サーバ定義より前には作成できません。',
  refs: [
    ['postgres_fdw', 'postgres-fdw.html'],
    ['外部データ', 'ddl-foreign-data.html']
  ]
},
{
  id: 'G1.3-004', level: 'gold', cat: 'G1.3',
  q: 'データディレクトリ内のサブディレクトリと、その内容の組み合わせとして正しいものを1つ選びなさい。',
  choices: [
    'pg_xact: トランザクションのコミット状態に関するデータ',
    'pg_wal: 統計情報サブシステムの一時ファイル',
    'global: 各データベースに属するユーザテーブルのデータ',
    'base: pg_database などのクラスタ全体で共有されるテーブル',
    'pg_tblspc: テーブルスペースに格納されたテーブルのデータファイルそのもの'
  ],
  answer: 0,
  exp: 'データディレクトリの主なサブディレクトリは次のとおりです。\n・base: データベースごとのサブディレクトリ（データベースの OID 名）\n・global: pg_database などクラスタ全体で共有されるテーブル\n・pg_wal: WAL（先行書き込みログ）ファイル\n・pg_xact: トランザクションのコミット状態データ\n・pg_stat_tmp: 統計情報サブシステムの一時ファイル（PostgreSQL 14）\n・pg_tblspc: テーブルスペースへのシンボリックリンク\nテーブルスペースの実データは、CREATE TABLESPACE で指定したディレクトリに格納されます。',
  refs: [
    ['データベースファイルのレイアウト', 'storage-file-layout.html']
  ]
},
{
  id: 'G1.3-005', level: 'gold', cat: 'G1.3',
  q: 'テーブルファイルのページ構造に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ページサイズは initdb のオプションで、データベースクラスタごとに自由に変更できる',
    '1つの行（タプル）は、必要に応じて複数のページにまたがって格納される',
    'テーブルファイルは既定で 8kB の固定長ページに分割され、ページヘッダ、行ポインタ、タプルなどから構成される',
    'ページ内の空き領域の位置と大きさは、pg_class システムカタログに格納されている',
    'タプルのヘッダには、その行を作成したトランザクションの ID は含まれない'
  ],
  answer: 2,
  exp: 'テーブルやインデックスのファイルは固定長のページ（ブロック）に分割され、ページサイズは通常 8kB です。ページサイズはサーバのコンパイル時に決まり、initdb では変更できません。\nページは、ページヘッダ、各タプルの位置を指す行ポインタ（アイテム識別子）の配列、空き領域、タプル本体などで構成されます。\nタプルのヘッダには、MVCC のための t_xmin（挿入したトランザクション ID）や t_xmax などが含まれます。\n1つのタプルは複数ページにまたがらないため、大きな値は TOAST で扱います。ページの空き領域の情報は空き領域マップ（FSM）で管理されます。',
  refs: [
    ['データベースページのレイアウト', 'storage-page-layout.html'],
    ['空き領域マップ', 'storage-fsm.html']
  ]
},
{
  id: 'G1.3-006', level: 'gold', cat: 'G1.3',
  q: '`postgres_fdw` で作成した外部テーブルに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'postgres_fdw の外部テーブルは読み取り専用であり、INSERT や UPDATE はできない',
    '外部テーブルにインデックスを作成すると、リモートの検索が高速になる',
    '外部サーバの接続情報（ホスト名など）は、ローカル側の pg_hba.conf に記述する',
    'WHERE 句の条件のうちリモートで安全に評価できるものは、リモートサーバに送られて評価される',
    'リモートのスキーマに含まれるテーブルを一括で外部テーブルとして定義する方法はない'
  ],
  answer: 3,
  exp: 'postgres_fdw は、組み込みのデータ型・演算子・関数（IMMUTABLE のもの）を使った WHERE 句の条件などを、リモートサーバに送るクエリに含めて評価させます（プッシュダウン）。これにより転送する行数を減らせます。結合や集約も条件によってはリモートで実行されます。\npostgres_fdw の外部テーブルは INSERT、UPDATE、DELETE にも対応しています。\n外部テーブルにはインデックスを作成できません。接続先は CREATE SERVER のオプション、認証情報は CREATE USER MAPPING で指定し、接続の許可はリモート側の pg_hba.conf で行います。\nIMPORT FOREIGN SCHEMA で、リモートのスキーマのテーブルを一括で外部テーブルとして定義できます。',
  refs: [
    ['postgres_fdw', 'postgres-fdw.html'],
    ['IMPORT FOREIGN SCHEMA', 'sql-importforeignschema.html']
  ]
},
{
  id: 'G1.3-007', level: 'gold', cat: 'G1.3',
  q: 'PostgreSQL のプロセス構造に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'すべてのクライアント接続は、1つのサーバプロセス内のスレッドで処理される',
    'クライアントが接続するたびに postmaster がバックエンドプロセスを起動（fork）し、そのプロセスが接続を担当する',
    'PostgreSQL 本体にコネクションプーリングの機能が組み込まれており、既定で有効になっている',
    'バックエンドプロセスは、接続が終了した後も待機して次の接続に再利用される',
    'postmaster が、すべてのクライアントの問い合わせを直接実行する'
  ],
  answer: 1,
  exp: 'PostgreSQL は「1接続につき1プロセス」のプロセスモデルを採用しています。postmaster（親プロセス）がクライアントからの接続要求を待ち受け、接続があるたびに新しいバックエンドプロセスを fork して、そのプロセスが認証後の問い合わせを処理します。接続が終了するとバックエンドプロセスも終了します。\nプロセス間では共有メモリ（共有バッファなど）を使ってデータを共有します。\n本体にはコネクションプーリングの機能がないため、接続の確立が多いシステムでは pgbouncer や Pgpool-II などのプーラを利用します。',
  refs: [
    ['接続確立の流れ', 'connect-estab.html'],
    ['標準Unixツール（プロセスの確認）', 'monitoring-ps.html']
  ]
},
{
  id: 'G1.3-008', level: 'gold', cat: 'G1.3',
  q: 'テーブルの OID と relfilenode に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'テーブルの OID と relfilenode は常に同じ値であり、変わることはない',
    '通常の VACUUM を実行するたびに、relfilenode は新しい値に変わる',
    'ALTER TABLE ... RENAME TO でテーブル名を変更すると、データファイルの名前も変わる',
    'TRUNCATE、VACUUM FULL、CLUSTER などを実行すると、OID は変わらずに relfilenode が変わることがある',
    'relfilenode は global ディレクトリにのみ存在し、ユーザテーブルには割り当てられない'
  ],
  answer: 3,
  exp: 'テーブルの OID（pg_class.oid）はオブジェクトの識別子で、テーブルが存在する限り変わりません。一方、データファイルの名前は pg_class.relfilenode で決まります。作成直後は OID と同じ値になることが多いものの、TRUNCATE、VACUUM FULL、CLUSTER、REINDEX など、ファイルを作り直す操作を行うと新しい relfilenode が割り当てられます。\nそのため、ファイルを特定する際は OID から推測せず、pg_relation_filepath() などで確認します。\nテーブル名の変更や通常の VACUUM では、relfilenode は変わりません。',
  refs: [
    ['データベースファイルのレイアウト', 'storage-file-layout.html'],
    ['pg_class', 'catalog-pg-class.html']
  ]
},
{
  id: 'G1.3-009', level: 'gold', cat: 'G1.3',
  q: 'contrib モジュール `file_fdw` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'データベースサーバ上の CSV などのファイルを、外部テーブルとして読み取れる',
    'psql を実行しているクライアント端末上のファイルを、外部テーブルとして読み取れる',
    'file_fdw の外部テーブルに INSERT すると、ファイルに行が追記される',
    'file_fdw の外部テーブルにインデックスを作成して、検索を高速化できる',
    '別の PostgreSQL サーバに接続して、そのテーブルを参照するためのモジュールである'
  ],
  answer: 0,
  exp: 'file_fdw は、データベースサーバのファイルシステム上にあるファイルを、COPY FROM と同じ形式（text、csv など）で読み取る外部データラッパです。CREATE EXTENSION file_fdw、CREATE SERVER の後、CREATE FOREIGN TABLE の OPTIONS でファイル名や形式を指定します。サーバのログファイル（CSV 形式）を SQL で検索する用途などに使われます。\nfile_fdw の外部テーブルは読み取り専用で、インデックスは作成できません。ファイルはサーバ側で読まれるため、スーパーユーザか pg_read_server_files ロールのメンバーが設定する必要があります。\n別の PostgreSQL サーバを参照するのは postgres_fdw です。',
  refs: [
    ['file_fdw', 'file-fdw.html'],
    ['外部データ', 'ddl-foreign-data.html']
  ]
},
{
  id: 'G1.3-010', level: 'gold', cat: 'G1.3',
  q: 'テーブル空間（テーブルスペース）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'CREATE TABLESPACE で指定したディレクトリへのシンボリックリンクが、データディレクトリの pg_tblspc 配下に作成される',
    'テーブル空間のディレクトリは、initdb の実行前にデータディレクトリの内部に作成しておく必要がある',
    'テーブル空間を作成できるのはデータベースの所有者であり、スーパーユーザ権限は必要ない',
    'temp_tablespaces を設定しても、ソートで使われる一時ファイルの格納先は変更されない',
    'テーブル空間の中にオブジェクトが残っていても、DROP TABLESPACE ... CASCADE で削除できる'
  ],
  answer: 0,
  exp: 'CREATE TABLESPACE を実行すると、データディレクトリの pg_tblspc 配下に、指定ディレクトリを指すシンボリックリンクが作成されます。リンク名はテーブル空間の OID です。\nディレクトリは空であり、PostgreSQL の実行ユーザが所有している必要があります。また、データディレクトリの内部に置くことは推奨されていません。\nテーブル空間を作成できるのはスーパーユーザだけです。\ntemp_tablespaces は一時テーブルと、ソートなどで使う一時ファイルの格納先を指定します。\nDROP TABLESPACE に CASCADE はなく、中身が空でなければ削除できません。',
  refs: [
    ['テーブル空間', 'manage-ag-tablespaces.html'],
    ['CREATE TABLESPACE', 'sql-createtablespace.html'],
    ['temp_tablespaces', 'runtime-config-client.html#GUC-TEMP-TABLESPACES']
  ]
},
{
  id: 'G1.3-011', level: 'gold', cat: 'G1.3',
  q: '可視性マップ（VM）と空き領域マップ（FSM）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'VM はテーブルの各ページについて全タプルが可視かどうかを記録し、VACUUM の対象ページを絞り込むために使われる',
    'VM と FSM はテーブル本体のファイルの先頭ページに格納されており、別のファイルになることはない',
    'FSM はインデックスには存在せず、テーブルに対してのみ作成される',
    'VM が存在していると、インデックスオンリースキャンは使われなくなる',
    'VM と FSM は破損すると復旧できないため、失われるとテーブル全体が読めなくなる'
  ],
  answer: 0,
  exp: '可視性マップ（VM）はテーブルの各ページについて、すべてのタプルが全トランザクションから可視かどうか、および全タプルが凍結済みかどうかを1ビットずつ記録します。VACUUM は可視なページをスキップでき、インデックスオンリースキャンではヒープを参照せずに済むかの判定に使われます。\nVM と FSM はテーブル本体とは別のファイル（relfilenode に _vm、_fsm の接尾辞が付いたもの）に格納されます。\nFSM はインデックスにも存在します。\nVM と FSM は補助的な情報なので、失われても VACUUM で再構築でき、テーブルのデータ自体は失われません。',
  refs: [
    ['可視性マップ', 'storage-vm.html'],
    ['空き領域マップ', 'storage-fsm.html'],
    ['インデックスオンリースキャン', 'indexes-index-only-scans.html']
  ]
},
{
  id: 'G1.3-012', level: 'gold', cat: 'G1.3',
  q: 'テーブルやインデックスの実ファイルに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ファイルは既定で 1GB ごとに分割され、2つ目以降は relfilenode.1 のような名前になる',
    'ファイルはテーブルの大きさに関わらず常に1つであり、複数のファイルに分割されることはない',
    'ファイルの分割単位は、ページサイズ（既定 8kB）と同じ大きさである',
    '分割されたファイルは、それぞれ別のテーブル空間に自動的に配置される',
    'ファイルは base ディレクトリの直下に、テーブル名と同じ名前で作成される'
  ],
  answer: 0,
  exp: 'テーブルやインデックスの実ファイルは、既定で 1GB（ビルド時の --with-segsize で変更可能）を超えるとセグメントに分割され、2つ目以降は relfilenode.1、relfilenode.2 のように連番の接尾辞が付きます。これはファイルサイズに上限がある OS への対応です。\nファイルは base/<データベースの OID>/<relfilenode> という配置で、名前はテーブル名ではなく数値です。パスは pg_relation_filepath() で確認できます。\nページサイズの既定値 8kB は、ファイル内のブロックの大きさです。',
  refs: [
    ['データベースファイルのレイアウト', 'storage-file-layout.html'],
    ['データベースオブジェクト管理関数', 'functions-admin.html#FUNCTIONS-ADMIN-DBOBJECT']
  ]
},
{
  id: 'G1.3-013', level: 'gold', cat: 'G1.3',
  q: 'システムカタログと情報スキーマ（information_schema）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'information_schema は SQL 標準のビュー群であり、PostgreSQL 固有の情報は pg_catalog のカタログを参照する必要がある',
    'information_schema は pg_catalog の別名であり、参照できる内容はまったく同じである',
    'pg_catalog は search_path に含まれていないため、常にスキーマ名を明示して参照する必要がある',
    'information_schema のビューは、スーパーユーザ以外のロールからは参照できない',
    'システムカタログは通常のテーブルではないため、SELECT 文で問い合わせることはできない'
  ],
  answer: 0,
  exp: 'information_schema は SQL 標準で規定されたビューの集合で、移植性のある方法でメタデータを参照できます。ただし標準にない PostgreSQL 固有の情報（インデックスの種類、テーブル空間、統計情報など）は含まれないため、pg_class や pg_index といったシステムカタログを直接参照します。\npg_catalog は search_path に明示的に書かれていなくても、暗黙的に先頭で検索されます。\ninformation_schema のビューは、その利用者が権限を持つオブジェクトだけを表示します。\nシステムカタログは通常のテーブル（またはビュー）であり、SELECT で参照できます。',
  refs: [
    ['情報スキーマ', 'information-schema.html'],
    ['システムカタログ', 'catalogs.html'],
    ['スキーマ検索パス', 'ddl-schemas.html#DDL-SCHEMAS-PATH']
  ]
},
{
  id: 'G1.3-014', level: 'gold', cat: 'G1.3',
  q: '共有バッファに現在どのテーブルのどのブロックが載っているかを調べられる contrib モジュールを1つ選びなさい。',
  choices: [
    'pg_freespacemap',
    'pgstattuple',
    'pg_visibility',
    'pageinspect',
    'pg_buffercache'
  ],
  answer: 4,
  shuffle: false,
  exp: 'pg_buffercache は共有バッファの各バッファの状態（どのリレーションのどのブロックか、使用回数、ダーティかどうか）を pg_buffercache ビューで参照できるようにするモジュールです。どのテーブルがバッファを多く占めているかの調査に使えます。\npg_freespacemap は空き領域マップ、pg_visibility は可視性マップの内容を参照します。\npgstattuple はタプルレベルの統計（不要タプルの割合など）を取得し、肥大化の調査に使います。\npageinspect はページの内部構造をバイナリレベルで調べるモジュールです。',
  refs: [
    ['pg_buffercache', 'pgbuffercache.html'],
    ['追加で提供されるモジュール', 'contrib.html']
  ]
},
{
  id: 'G1.3-015', level: 'gold', cat: 'G1.3',
  q: 'データディレクトリ内の pg_xact、pg_multixact、pg_subtrans の役割の説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_xact はトランザクションのコミット状態を記録しており、行の可視性の判定に使われる',
    'pg_xact は実行中の SQL 文のテキストを記録しており、障害時の解析に使われる',
    'pg_multixact は複数のデータベースにまたがるトランザクションのログを格納する',
    'pg_subtrans はサブスクリプションの適用状況を記録しており、論理レプリケーションで使われる',
    'これらはいずれも一時的な作業領域なので、サーバ停止中に削除しても支障はない'
  ],
  answer: 0,
  exp: 'pg_xact は各トランザクション ID のコミット状態（コミット済み・アボート済み・実行中）を記録する領域で、行バージョンの可視性判定に使われます。PostgreSQL 10 より前は pg_clog という名前でした。\npg_multixact は、1つの行に複数のトランザクションが同時にロックを掛けている状態（マルチトランザクション）を管理します。\npg_subtrans はサブトランザクション（SAVEPOINT）の親子関係を記録します。\nいずれもデータの整合性に必要な情報で、削除するとデータベースが壊れます。不要になった古い部分は VACUUM によって整理されます。',
  refs: [
    ['データベースファイルのレイアウト', 'storage-file-layout.html'],
    ['トランザクションIDの周回エラーの防止', 'routine-vacuuming.html#VACUUM-FOR-WRAPAROUND']
  ]
},
{
  id: 'G1.3-016', level: 'gold', cat: 'G1.3',
  q: 'データベースとファイルの対応を調べる方法に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'base ディレクトリ直下のサブディレクトリ名はデータベースの OID で、pg_database を参照すれば対応が分かる',
    'base ディレクトリ直下のサブディレクトリ名はデータベース名そのものである',
    'すべてのデータベースのファイルは base ディレクトリ直下にまとめて格納される',
    'テーブル空間を指定して作成したデータベースのファイルも、必ず base ディレクトリに置かれる',
    'global ディレクトリには、テンプレートデータベース template1 の実体が格納されている'
  ],
  answer: 0,
  exp: 'base ディレクトリの下には、データベースごとにその OID を名前としたサブディレクトリが作られます。対応は `SELECT oid, datname FROM pg_database;` で確認でき、contrib の oid2name でも調べられます。\nデータベースを別のテーブル空間に作成した場合、そのファイルは pg_tblspc 配下のリンク先に置かれます。\nglobal ディレクトリには、pg_database や pg_authid のようにクラスタ全体で共有されるシステムカタログと、pg_control が格納されます。',
  refs: [
    ['データベースファイルのレイアウト', 'storage-file-layout.html'],
    ['oid2name', 'oid2name.html'],
    ['pg_database', 'catalog-pg-database.html']
  ]
},
{
  id: 'G1.3-017', level: 'gold', cat: 'G1.3', type: 'scenario',
  q: 'postgres_fdw を使った外部テーブルの参照が遅い。ローカル側で試す対処として、最も適切なものを1つ選びなさい。',
  choices: [
    '外部サーバまたは外部テーブルの fetch_size オプションを大きくする',
    'ローカルの shared_buffers を大きくする',
    'ローカルの temp_buffers を大きくする',
    '外部テーブルに対して VACUUM FULL を実行する',
    'ローカルの max_connections を大きくする'
  ],
  answer: 0,
  exp: 'postgres_fdw は、リモートから1回のフェッチで取得する行数を fetch_size オプション（既定 100）で決めます。行数の多い参照では往復回数が性能を左右するため、この値を大きくすると改善することがあります。CREATE SERVER や ALTER SERVER、ALTER FOREIGN TABLE の OPTIONS で指定でき、テーブル側の指定がサーバ側より優先されます。\n外部テーブルの実体はリモートにあるため、ローカルの共有バッファやバキュームは効果がありません。\nなお INSERT の往復回数は batch_size オプション（PostgreSQL 14 で追加）で調整します。',
  evidence: [
    ['postgres_fdw の実行計画（Remote SQL）と、統計・use_remote_estimate の効果',
      '=# EXPLAIN (VERBOSE, COSTS OFF) SELECT count(*) FROM f_orders WHERE customer_id = 5;\n                                    QUERY PLAN\n-----------------------------------------------------------------------------------\n Foreign Scan\n   Output: (count(*))\n   Relations: Aggregate on (public.f_orders)\n   Remote SQL: SELECT count(*) FROM public.remote_orders WHERE ((customer_id = 5))\n Query Identifier: 6765579859126191466\n(5 rows)\n\n=# EXPLAIN (ANALYZE, VERBOSE, TIMING OFF, SUMMARY OFF) SELECT * FROM f_orders WHERE customer_id = 5;\n                                            QUERY PLAN\n---------------------------------------------------------------------------------------------------\n Foreign Scan on public.f_orders  (cost=100.00..138.66 rows=11 width=12) (actual rows=100 loops=1)\n   Output: id, customer_id, amount\n   Remote SQL: SELECT id, customer_id, amount FROM public.remote_orders WHERE ((customer_id = 5))\n Query Identifier: -8634811883859016470\n(4 rows)\n\n（外部テーブルには統計がないため、行数の見積もりは既定値のまま）\n=# SELECT relname, reltuples FROM pg_class WHERE relname = \'f_orders\';\n relname  | reltuples\n----------+-----------\n f_orders |        -1\n(1 row)\n\n=# ANALYZE f_orders;\nANALYZE\n=# SELECT relname, reltuples FROM pg_class WHERE relname = \'f_orders\';\n relname  | reltuples\n----------+-----------\n f_orders |    100000\n(1 row)\n\n=# ALTER SERVER fdw_srv OPTIONS (ADD use_remote_estimate \'true\');\nALTER SERVER\n=# EXPLAIN (ANALYZE, VERBOSE, TIMING OFF, SUMMARY OFF) SELECT * FROM f_orders WHERE customer_id = 5;\n                                             QUERY PLAN\n-----------------------------------------------------------------------------------------------------\n Foreign Scan on public.f_orders  (cost=100.00..1893.00 rows=100 width=12) (actual rows=100 loops=1)\n   Output: id, customer_id, amount\n   Remote SQL: SELECT id, customer_id, amount FROM public.remote_orders WHERE ((customer_id = 5))\n Query Identifier: -8634811883859016470\n(4 rows)\n\n（ローカルで条件を評価する書き方だと、全行を取り寄せてしまう）\n=# EXPLAIN (VERBOSE, COSTS OFF) SELECT * FROM f_orders WHERE amount::text LIKE \'5%\';\n                               QUERY PLAN\n------------------------------------------------------------------------\n Foreign Scan on public.f_orders\n   Output: id, customer_id, amount\n   Filter: ((f_orders.amount)::text ~~ \'5%\'::text)\n   Remote SQL: SELECT id, customer_id, amount FROM public.remote_orders\n Query Identifier: 612401073934825444\n(5 rows)']
  ],
  refs: [
    ['postgres_fdw', 'postgres-fdw.html'],
    ['CREATE SERVER', 'sql-createserver.html']
  ]
},
{
  id: 'G1.3-018', level: 'gold', cat: 'G1.3',
  q: 'postgres_fdw で `IMPORT FOREIGN SCHEMA` を実行したとき、外部テーブルの定義に併せて取り込まれる制約を1つ選びなさい。',
  choices: [
    'NOT NULL 制約',
    'CHECK 制約',
    '主キー制約',
    '一意制約',
    '外部キー制約'
  ],
  answer: 0,
  shuffle: false,
  exp: 'IMPORT FOREIGN SCHEMA が取り込むのは列の定義と NOT NULL 制約だけです（import_not_null オプションで制御でき、既定は true）。\nCHECK 制約はローカルとリモートで評価結果が変わる危険があるため、自動では取り込まれません。必要であれば、意味を確認したうえで手作業で定義します。\n主キー・一意・外部キーの各制約は、そもそも外部テーブルには定義できません。\nまた、他のテーブルのパーティションである子テーブルは、LIMIT TO で明示しない限り取り込みの対象から除外されます。',
  refs: [
    ['postgres_fdw', 'postgres-fdw.html'],
    ['IMPORT FOREIGN SCHEMA', 'sql-importforeignschema.html']
  ]
},
{
  id: 'G1.3-019', level: 'gold', cat: 'G1.3',
  q: 'PostgreSQL のプロセス構成に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'クライアントが接続するたびに、postmaster がバックエンドプロセスをフォークして割り当てる',
    'postmaster プロセスを強制終了させると、そのクラスタは稼働を続けられない',
    'postmaster プロセスは、データベースごとに1つずつ起動される',
    'バックグラウンドプロセスは、クライアントからの SQL を処理するプロセスである',
    '1つのバックエンドプロセスが、複数のクライアント接続を同時に処理する'
  ],
  answer: [0, 1],
  exp: 'PostgreSQL はプロセスベースのアーキテクチャで、クライアントが接続するたびに postmaster（親プロセス）がバックエンドプロセスをフォークします。1つのバックエンドプロセスは1つの接続を担当します。\npostmaster はクラスタ全体で1つだけ起動され、データベースごとに起動されるわけではありません。これを強制終了させると、子プロセスの管理や新規接続の受け付けができなくなり、クラスタは稼働を続けられません。\nバックグラウンドプロセスは checkpointer や walwriter、自動バキュームワーカーなど、クライアントの SQL とは別に動く保守用のプロセスです。',
  refs: [
    ['データベースサーバの起動', 'server-start.html'],
    ['統計情報の閲覧', 'monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW']
  ]
},
{
  id: 'G1.3-020', level: 'gold', cat: 'G1.3',
  q: 'TOAST テーブルに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'TOAST テーブルは pg_toast スキーマに、親テーブルの OID を含む名前で作成される',
    'TOAST テーブルのサイズは pg_total_relation_size() に含まれる',
    'TOAST テーブルは利用者が直接 SELECT することを想定して公開されている',
    '1行が1ページ（8kB）に収まらない場合でも、TOAST が使われないことはない',
    'TOAST テーブルはテーブル作成時に必ず1つ作られる'
  ],
  answer: [0, 1],
  exp: 'TOAST テーブルは、可変長のデータが大きくて1ページに収まらないときに使われる補助テーブルで、pg_toast スキーマに pg_toast_<親テーブルの OID> という名前で自動的に作られます。\npg_total_relation_size() はテーブル本体、インデックス、TOAST を合計した大きさを返します。TOAST を除いた本体だけは pg_table_size() から TOAST 分を引くなどして調べます。\nTOAST テーブルは内部的なもので、利用者が直接操作することは想定されていません。\nTOAST 可能な列がまったくないテーブル（すべて固定長の列など）には TOAST テーブルは作られません。',
  refs: [
    ['TOAST', 'storage-toast.html'],
    ['データベースオブジェクト管理関数', 'functions-admin.html#FUNCTIONS-ADMIN-DBSIZE']
  ]
},
{
  id: 'G1.3-021', level: 'gold', cat: 'G1.3',
  q: '論理デコーディングに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'WAL の内容を出力プラグインを通して解釈し、論理的な変更内容として取り出す仕組みである',
    'SQL 文そのものを WAL に記録しておき、それをそのまま取り出す仕組みである',
    'wal_level が replica であれば利用できる',
    '論理レプリケーション専用の仕組みで、外部ツールから利用することはできない',
    '論理デコーディングにはレプリケーションスロットを使わない'
  ],
  answer: 0,
  exp: '論理デコーディングは、WAL に記録された物理的な変更を、出力プラグインを通してテーブルの行の変更という論理的な形に変換して取り出す仕組みです。組み込みの論理レプリケーションは pgoutput というプラグインを使い、ほかに contrib の test_decoding や、外部のツール（wal2json など）も利用できます。\n利用するには wal_level を logical にし、論理レプリケーションスロットを作成します。\nSQL 文そのものが WAL に記録されるわけではありません。\nスロットは、まだ読み取られていない WAL をサーバに保持させる役割を担います。',
  refs: [
    ['論理デコーディング', 'logicaldecoding.html'],
    ['論理デコーディングの例', 'logicaldecoding-example.html']
  ]
},
{
  id: 'G1.3-022', level: 'gold', cat: 'G1.3',
  q: 'サーバ上のファイルを SQL から確認する関数の説明として、適切なものを2つ選びなさい。',
  choices: [
    'pg_ls_waldir() は pg_wal 内のファイル名・サイズ・更新時刻を返す',
    'pg_ls_dir() はデータディレクトリ配下のファイル名を返し、既定ではスーパーユーザなどに限定される',
    'pg_ls_waldir() はアーカイブ先の WAL ファイルも一覧に含める',
    'pg_read_file() は、サーバ上の任意のパスのファイルを誰でも読み取れる',
    'これらの関数はクライアント側のファイルを対象とする'
  ],
  answer: [0, 1],
  exp: 'pg_ls_waldir() は pg_wal ディレクトリの内容を、pg_ls_logdir() はログディレクトリの内容を、名前・サイズ・更新時刻の組で返します。ディスク使用量の調査や、WAL がたまっていないかの確認に使えます。\npg_ls_dir() や pg_read_file() はデータディレクトリを基準にサーバ上のファイルを参照する関数で、実行にはスーパーユーザ権限、または pg_read_server_files などの定義済みロールが必要です。\n対象はあくまでサーバ側のファイルで、アーカイブ先のようにサーバの管理外にあるものは含まれません。',
  refs: [
    ['汎用ファイルアクセス関数', 'functions-admin.html#FUNCTIONS-ADMIN-GENFILE'],
    ['定義済みロール', 'predefined-roles.html']
  ]
},
{
  id: 'G1.3-023', level: 'gold', cat: 'G1.3', type: 'scenario',
  q: '次のコマンドの結果から読み取れることとして、適切なものを2つ選びなさい（ls の出力はサイズとファイル名のみ表示）。',
  code: '$ oid2name\nAll databases:\n    Oid  Database Name  Tablespace\n----------------------------------\n  13806       postgres  pg_default\n  16419           shop  pg_default\n  13805      template0  pg_default\n      1      template1  pg_default\n\n$ oid2name -d shop -t orders\nFrom database "shop":\n  Filenode  Table Name\n----------------------\n     16450      orders\n\n$ ls -l $PGDATA/base/16419 | grep 16450\n18071552 16450\n24576 16450_fsm',
  choices: [
    'orders テーブル本体のデータは、$PGDATA/base/16419/16450 に格納されている',
    '16450_fsm は空き領域マップで、テーブル本体とは別のファイルになっている',
    'ファイル名の 16450 は、VACUUM FULL を実行しても変わらない',
    '可視性マップのファイルがないため、orders テーブルは破損している',
    'orders は 1GB を超えていないが、すでに 2つのセグメントに分割されている'
  ],
  answer: [0, 1],
  exp: 'データベースのファイルは $PGDATA/base/<データベースの OID>/ に置かれます。oid2name の結果から shop の OID は 16419、orders のファイル名（relfilenode）は 16450 なので、本体は base/16419/16450 です。pg_relation_filepath(\'orders\') でも base/16419/16450 と確認できました。\n_fsm は空き領域マップ、_vm は可視性マップのファイルで、本体とは別に作られます。可視性マップはバキュームで初めて作られるため、まだ VACUUM されていないテーブルにないのは正常です。実際、この後 VACUUM を実行すると 16450_vm が作られました。\nファイル名は relfilenode です。作成直後は OID と同じ値（この例ではどちらも 16450）になることが多いものの別物で、VACUUM FULL や TRUNCATE、CLUSTER でテーブルが書き直されると relfilenode だけが変わります。\n1GB ごとのセグメントは 16450.1 のような名前になります。_fsm はセグメントではありません。',
  evidence: [
    ['oid2name と、実ファイルの確認',
      'All databases:\n    Oid  Database Name  Tablespace\n----------------------------------\n  13806       postgres  pg_default\n  16419           shop  pg_default\n  13805      template0  pg_default\n      1      template1  pg_default\nFrom database "shop":\n  Filenode  Table Name\n----------------------\n     16450      orders\n$ ls -l $PGDATA/base/16419 | grep 16450\n18071552 16450\n24576 16450_fsm\n pg_relation_filepath\n----------------------\n base/16419/16450\n(1 row)']
  ],
  refs: [
    ['データベースファイルのレイアウト', 'storage-file-layout.html'],
    ['oid2name', 'oid2name.html'],
    ['空き領域マップ', 'storage-fsm.html']
  ]
},

/* ---------------- G1.4 レプリケーション運用（重要度 1 / 19問） ---------------- */
{
  id: 'G1.4-001', level: 'gold', cat: 'G1.4',
  q: 'PostgreSQL 14 の論理レプリケーションに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'パブリッシャの wal_level は replica のままで利用できる',
    'テーブル定義（DDL）の変更は複製されないため、サブスクライバ側にも同じ定義のテーブルを用意する必要がある',
    'シーケンスの現在値もテーブルデータと同様に複製される',
    'サブスクライバ側のテーブルは読み取り専用となり、書き込みはできない',
    'CREATE SUBSCRIPTION はパブリッシャ側で実行する'
  ],
  answer: 1,
  exp: '論理レプリケーションでは、パブリッシャで CREATE PUBLICATION、サブスクライバで CREATE SUBSCRIPTION を実行します。パブリッシャの wal_level は logical にする必要があります。\nスキーマ（DDL）の変更は複製されないため、テーブル定義は事前に（例: pg_dump --schema-only で）サブスクライバに作成しておき、変更時は両側で行います。PostgreSQL 14 ではシーケンスのデータも複製されません。\nサブスクライバのテーブルは通常のテーブルなので書き込みも可能です（ただし複製データと競合しうる点に注意が必要です）。',
  refs: [
    ['論理レプリケーション', 'logical-replication.html'],
    ['制限事項', 'logical-replication-restrictions.html'],
    ['設定', 'logical-replication-config.html']
  ]
},
{
  id: 'G1.4-002', level: 'gold', cat: 'G1.4', type: 'scenario',
  q: 'プライマリで `synchronous_standby_names = \'FIRST 1 (s1, s2)\'` と設定した場合の説明として、正しいものを1つ選びなさい。',
  choices: [
    's1 と s2 の両方から応答があるまで、コミットは完了しない',
    '優先順位の高い s1 が同期スタンバイとなり、s1 が接続していない場合は s2 が同期スタンバイになる',
    'ANY 1 (s1, s2) と指定した場合と、まったく同じ意味である',
    'synchronous_commit を local にしても、同期スタンバイからの応答を待ってからコミットが完了する',
    'synchronous_standby_names を空文字列にすると、接続しているすべてのスタンバイが同期スタンバイになる'
  ],
  answer: 1,
  exp: 'FIRST num (standby_name, ...) は優先順位に基づく同期レプリケーションで、リストの先に書かれた稼働中のスタンバイから num 台が同期スタンバイになります。この例では s1 が同期スタンバイで、s1 が接続していなければ s2 が選ばれます。\nANY num (...) はクォーラムに基づく方式で、リスト内の任意の num 台から応答があればコミットが完了します。\nsynchronous_standby_names が空の場合は同期スタンバイがなく、非同期レプリケーションになります。\nsynchronous_commit = local や off の場合、そのトランザクションはスタンバイからの応答を待ちません（remote_write、on、remote_apply で待機の度合いが変わります）。',
  evidence: [
    ['synchronous_standby_names を設定したときの pg_stat_replication',
      'synchronous_standby_names\n------------------------------\n FIRST 1 (standby1, standby2)\n(1 row)\n\n application_name |   state   | sync_priority | sync_state |  sent_lsn  | flush_lsn  | replay_lsn\n------------------+-----------+---------------+------------+------------+------------+------------\n standby1         | streaming |             1 | sync       | 0/96DA9460 | 0/96DA9460 | 0/96DA9460\n(1 row)\n\n  status   | sender_host | sender_port | slot_name | flushed_lsn\n-----------+-------------+-------------+-----------+-------------\n streaming | 127.0.0.1   |        5432 | standby1  | 0/96DA9460\n(1 row)'],
    ['同期スタンバイを停止した状態でコミットした場合',
      'WARNING:  canceling wait for synchronous replication due to user request\nDETAIL:  The transaction has already committed locally, but might not have been replicated to the standby.\nINSERT 0 1\n  pid  | state  | wait_event_type | wait_event |                query\n-------+--------+-----------------+------------+--------------------------------------\n 13861 | active | IPC             | SyncRep    | INSERT INTO accounts VALUES (11, 0);\n(1 row)\n\n pg_reload_conf\n----------------\n t\n(1 row)\n\n--- 待たされていたクライアント ---\nINSERT 0 1']
  ],
  refs: [
    ['synchronous_standby_names', 'runtime-config-replication.html#GUC-SYNCHRONOUS-STANDBY-NAMES'],
    ['同期レプリケーション', 'warm-standby.html#SYNCHRONOUS-REPLICATION'],
    ['synchronous_commit', 'runtime-config-wal.html#GUC-SYNCHRONOUS-COMMIT']
  ]
},
{
  id: 'G1.4-003', level: 'gold', cat: 'G1.4',
  q: 'ホットスタンバイに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ホットスタンバイでは、一時テーブルを作成してデータを格納できる',
    'PostgreSQL 14 では hot_standby の既定値は off である',
    'ホットスタンバイで実行する問い合わせが、プライマリで行われた VACUUM による不要行の削除と競合することはない',
    'hot_standby = on のスタンバイでは、リカバリ（WAL の適用）中に読み取り専用の問い合わせを実行できる',
    'ホットスタンバイ上で CREATE INDEX を実行すると、プライマリにも反映される'
  ],
  answer: 3,
  exp: 'ホットスタンバイは、アーカイブリカバリやスタンバイモードで WAL を適用している間も、読み取り専用の問い合わせを受け付ける機能です。hot_standby の既定値は on です。\nスタンバイではデータを変更する操作（INSERT、UPDATE、DDL、一時テーブルの作成など）は実行できません。\nプライマリの VACUUM で削除された行をスタンバイの問い合わせが参照している場合など、WAL の適用と問い合わせが競合することがあり、max_standby_streaming_delay などの時間を超えると問い合わせがキャンセルされます。hot_standby_feedback = on にすると、この種の競合を減らせます。',
  refs: [
    ['ホットスタンバイ', 'hot-standby.html'],
    ['問い合わせコンフリクトの対応', 'hot-standby.html#HOT-STANDBY-CONFLICT'],
    ['hot_standby', 'runtime-config-replication.html#GUC-HOT-STANDBY']
  ]
},
{
  id: 'G1.4-004', level: 'gold', cat: 'G1.4',
  q: 'PostgreSQL 14 でストリーミングレプリケーションのスタンバイを構築する方法として、正しいものを1つ選びなさい。',
  choices: [
    'スタンバイのデータディレクトリに recovery.conf を作成し、standby_mode = on を記述する',
    'プライマリの wal_level を minimal にしてから pg_basebackup を実行する',
    'pg_basebackup に -R オプションを付けて取得すると、standby.signal の作成と primary_conninfo の設定が行われる',
    'スタンバイで WAL を受信するには、スタンバイ側の hot_standby を off にする必要がある',
    'max_wal_senders はスタンバイ側だけに設定すればよく、プライマリ側の設定は不要である'
  ],
  answer: 2,
  exp: 'pg_basebackup の -R（--write-recovery-conf）オプションを付けると、出力先に standby.signal を作成し、プライマリへの接続情報（primary_conninfo）を postgresql.auto.conf に追記するため、そのまま起動すればスタンバイとして動作します。\nPostgreSQL 12 以降は recovery.conf と standby_mode は廃止され、standby.signal ファイルでスタンバイモードを指定します。\nプライマリでは wal_level を replica 以上にし、max_wal_senders（既定 10）を必要な数以上にして、pg_hba.conf でレプリケーション接続を許可します。hot_standby はスタンバイで読み取り問い合わせを受け付けるかどうかの設定で、WAL の受信には関係しません。',
  refs: [
    ['スタンバイサーバの設定', 'warm-standby.html#STANDBY-SERVER-SETUP'],
    ['pg_basebackup', 'app-pgbasebackup.html']
  ]
},
{
  id: 'G1.4-005', level: 'gold', cat: 'G1.4',
  q: 'ストリーミングレプリケーションで物理レプリケーションスロットを使用する手順として、正しいものを1つ選びなさい。',
  choices: [
    'スタンバイで pg_create_physical_replication_slot() を実行し、プライマリの primary_slot_name にその名前を設定する',
    'プライマリで pg_create_physical_replication_slot() を実行してスロットを作成し、スタンバイの primary_slot_name にその名前を設定する',
    'レプリケーションスロットは、スタンバイが接続すると自動的に作成され、切断すると自動的に削除される',
    'レプリケーションスロットを使用すれば、プライマリの wal_level は minimal でもよい',
    'max_replication_slots を 0 にしておくと、スロットを必要な数だけ自動で作成できる'
  ],
  answer: 1,
  exp: '物理レプリケーションスロットは、プライマリで SELECT pg_create_physical_replication_slot(\'standby1\'); のように作成し、スタンバイの postgresql.conf の primary_slot_name にスロット名を設定します（pg_basebackup の -C -S オプションでも作成できます）。スロットを使うと、スタンバイが必要とする WAL がプライマリで削除されなくなります。\nスロットは明示的に削除（pg_drop_replication_slot()）するまで残るため、使わなくなったスロットは削除しないと WAL が蓄積し続けます。作成できるスロット数の上限は max_replication_slots（既定 10）です。',
  refs: [
    ['レプリケーションスロット', 'warm-standby.html#STREAMING-REPLICATION-SLOTS'],
    ['レプリケーション管理関数', 'functions-admin.html#FUNCTIONS-REPLICATION']
  ]
},
{
  id: 'G1.4-006', level: 'gold', cat: 'G1.4',
  q: '論理レプリケーションのパブリケーションに、主キーのないテーブルを追加した場合の説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'レプリカアイデンティティが自動的に FULL に設定され、UPDATE と DELETE も問題なく複製される',
    'パブリケーションに追加する時点でエラーになり、主キーのないテーブルは追加できない',
    'レプリカアイデンティティがないため、UPDATE や DELETE を複製するパブリケーションではパブリッシャでの UPDATE / DELETE がエラーになる',
    'INSERT も含め、そのテーブルに対するすべての変更がパブリッシャでエラーになる',
    'レプリカアイデンティティはテーブル作成後に変更できないため、テーブルを作り直す必要がある'
  ],
  answer: 2,
  exp: '論理レプリケーションで UPDATE や DELETE を複製するには、サブスクライバで対象の行を特定するためのレプリカアイデンティティ（既定は主キー）が必要です。主キーのないテーブルを、UPDATE / DELETE を公開するパブリケーション（既定）に追加すると、パブリッシャでそのテーブルに UPDATE や DELETE を実行した時点でエラーになります。INSERT は問題なく複製されます。\n対処として、ALTER TABLE ... REPLICA IDENTITY USING INDEX で NOT NULL 列の一意インデックスを指定するか、REPLICA IDENTITY FULL（行全体を使う。効率は悪い）を設定します。',
  refs: [
    ['パブリケーション', 'logical-replication-publication.html'],
    ['ALTER TABLE（REPLICA IDENTITY）', 'sql-altertable.html']
  ]
},
{
  id: 'G1.4-007', level: 'gold', cat: 'G1.4',
  q: 'カスケードレプリケーションに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'スタンバイが別のスタンバイに WAL を転送する構成で、上流のスタンバイは受信と送信を同時に行える',
    'カスケード構成の下流のスタンバイは、プライマリに直接接続して WAL を受け取る仕組みである',
    'カスケード構成を利用するには、プライマリで wal_level を logical に設定する必要がある',
    '中継するスタンバイを同期スタンバイとして扱えば、その下流のスタンバイも同期スタンバイになる',
    'カスケード構成では、上流のスタンバイが昇格すると下流のスタンバイは必ず作り直しになる'
  ],
  answer: 0,
  exp: 'カスケードレプリケーションは、スタンバイが受け取った WAL をさらに別のスタンバイへ転送する構成です。中継するスタンバイは WAL 受信者であると同時に WAL 送信者にもなり、プライマリの負荷や帯域を抑えられます。下流のスタンバイは上流のスタンバイに接続します。\n必要なのは wal_level が replica 以上であることと、中継するスタンバイで max_wal_senders が確保されていることです。\n同期レプリケーションはプライマリと直接つながるスタンバイにのみ適用され、カスケードの下流は常に非同期です。\n上流のスタンバイが昇格した場合、下流はそのまま追随できます。',
  refs: [
    ['カスケードレプリケーション', 'warm-standby.html#CASCADING-REPLICATION'],
    ['同期レプリケーション', 'warm-standby.html#SYNCHRONOUS-REPLICATION']
  ]
},
{
  id: 'G1.4-008', level: 'gold', cat: 'G1.4', type: 'scenario',
  q: 'ホットスタンバイで長時間実行の問い合わせが、リカバリとの競合により中断されてしまう。この現象への対処として、正しいものを1つ選びなさい。',
  choices: [
    'スタンバイで hot_standby_feedback = on にし、実行中の問い合わせが必要とする行をプライマリが削除しないようにする',
    'プライマリで hot_standby = on に設定すれば、スタンバイでの問い合わせの中断は発生しなくなる',
    'スタンバイで max_standby_streaming_delay = 0 に設定すると、問い合わせが中断されにくくなる',
    'スタンバイで synchronous_commit = off に設定すると、リカバリとの競合そのものが起きなくなる',
    'プライマリで wal_level を minimal にすると、競合による問い合わせの中断を回避できる'
  ],
  answer: 0,
  exp: 'この中断は、プライマリの VACUUM が削除した行バージョンを、スタンバイで実行中の問い合わせがまだ必要としているために起きるリカバリ競合です。\nスタンバイで hot_standby_feedback = on にすると、スタンバイの最も古いトランザクションの情報がプライマリへ通知され、プライマリ側の VACUUM が必要な行を削除しなくなります。ただしプライマリでの不要タプルの回収が遅れる副作用があります。\nmax_standby_streaming_delay を大きくすると WAL の適用を待たせて問い合わせを保護できますが、0 にするとむしろ即座に中断されます。\nhot_standby はスタンバイ側で問い合わせを許可するパラメータです。',
  evidence: [
    ['ホットスタンバイでリカバリと問い合わせが競合したときのログとエラー',
      'ERROR:  VACUUM cannot run inside a transaction block\n--- スタンバイ側クライアント ---\nCOMMIT\n--- スタンバイのログ ---\n datname | confl_tablespace | confl_lock | confl_snapshot | confl_bufferpin | confl_deadlock\n---------+------------------+------------+----------------+-----------------+----------------\n shop    |                0 |          0 |              0 |               0 |              0\n(1 row)']
  ],
  refs: [
    ['ホットスタンバイでの競合の処理', 'hot-standby.html#HOT-STANDBY-CONFLICT'],
    ['hot_standby_feedback', 'runtime-config-replication.html#GUC-HOT-STANDBY-FEEDBACK'],
    ['max_standby_streaming_delay', 'runtime-config-replication.html#GUC-MAX-STANDBY-STREAMING-DELAY']
  ]
},
{
  id: 'G1.4-009', level: 'gold', cat: 'G1.4',
  q: 'PostgreSQL 14 の論理レプリケーションの制限として、正しいものを1つ選びなさい。',
  choices: [
    'DDL は複製されないため、テーブル定義の変更はパブリッシャとサブスクライバの両方で行う必要がある',
    'シーケンスの現在値も含め、データベース内のすべてのオブジェクトが自動的に同期される',
    'サブスクリプションの作成時に既存データはコピーされないため、事前に pg_dump で移送する必要がある',
    'パブリッシャとサブスクライバのメジャーバージョンが同一でなければ利用することができない',
    'TRUNCATE は複製の対象外であるため、サブスクライバ側のテーブルには反映されない'
  ],
  answer: 0,
  exp: '論理レプリケーションで複製されるのは DML（INSERT / UPDATE / DELETE / TRUNCATE）だけで、DDL は複製されません。列の追加などはパブリッシャとサブスクライバの双方で実施する必要があります（通常はサブスクライバ側を先に変更します）。\nシーケンスの現在値、ラージオブジェクト、ビュー、マテリアライズドビュー、外部テーブルも複製されません。\nCREATE SUBSCRIPTION は既定（copy_data = true）で既存データの初期コピーを行います。\n論理レプリケーションは異なるメジャーバージョン間でも利用でき、TRUNCATE は PostgreSQL 11 以降で複製されます。',
  refs: [
    ['論理レプリケーションの制限', 'logical-replication-restrictions.html'],
    ['サブスクリプション', 'logical-replication-subscription.html']
  ]
},
{
  id: 'G1.4-010', level: 'gold', cat: 'G1.4',
  q: 'ストリーミングレプリケーションのための認証設定に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_hba.conf のデータベース欄に replication と書いた行が必要で、この行は all には含まれない',
    'pg_hba.conf のデータベース欄を all にしておけば、レプリケーション接続も許可される',
    'レプリケーション接続にはスーパーユーザ権限が必須で、専用ロールでは接続できない',
    'レプリケーション接続は認証を必要としないため、pg_hba.conf に記述しなくてよい',
    'スタンバイ側の primary_conninfo にはパスワードを書けないため、trust 認証にする必要がある'
  ],
  answer: 0,
  exp: 'レプリケーション接続は特別な接続で、pg_hba.conf のデータベース欄に replication と明示した行でのみ許可されます。all はこの接続を含みません。\n接続に使うロールには REPLICATION 属性（または pg_read_all_data などではなく LOGIN と REPLICATION）が必要ですが、スーパーユーザである必要はなく、専用ロールを作るのが一般的です。\nスタンバイ側の primary_conninfo には password を含められるほか、接続先サーバごとのパスワードを .pgpass に書いておく方法もあります。',
  refs: [
    ['認証（レプリケーション）', 'warm-standby.html#STREAMING-REPLICATION-AUTHENTICATION'],
    ['pg_hba.confファイル', 'auth-pg-hba-conf.html']
  ]
},
{
  id: 'G1.4-011', level: 'gold', cat: 'G1.4',
  q: 'パラメータ `synchronous_commit` の値に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'remote_write は同期スタンバイでの WAL のディスク書き込み完了までを保証する',
    'remote_apply はスタンバイで WAL が適用され、参照できるようになるまで待つ',
    'on はスタンバイが WAL をディスクに書き出すまで待つ（同期スタンバイがある場合）',
    'local はプライマリでの WAL のディスク書き込みだけを待ち、スタンバイは待たない',
    'off にするとプライマリでの WAL 書き込みも待たずにコミットを返す'
  ],
  answer: 0,
  exp: 'remote_write は、同期スタンバイが WAL を受け取って OS に書き出した（write した）ところまでを待ちます。ディスクへの同期（flush）までは保証しないため、スタンバイの OS がクラッシュするとデータが失われる可能性があります。この点が誤りです。\non（既定値）は同期スタンバイでの WAL の flush 完了までを待ちます。\nremote_apply はさらに進んで、スタンバイでその WAL が適用され参照できる状態になるまで待ちます。\nlocal はプライマリでの flush だけを待ち、off はプライマリでの flush すら待ちません。',
  refs: [
    ['synchronous_commit', 'runtime-config-wal.html#GUC-SYNCHRONOUS-COMMIT'],
    ['同期レプリケーション', 'warm-standby.html#SYNCHRONOUS-REPLICATION']
  ]
},
{
  id: 'G1.4-012', level: 'gold', cat: 'G1.4', type: 'scenario',
  q: 'スタンバイで `recovery_min_apply_delay = \'1h\'` と設定した場合の説明として、正しいものを1つ選びなさい。',
  choices: [
    'WAL の受信は通常どおり行われるが、適用が1時間遅らされる',
    'WAL の受信自体が1時間遅らされるため、プライマリに WAL が滞留する',
    'プライマリでのコミットが1時間待たされる',
    'スタンバイの起動が1時間遅れる',
    '1時間ごとにスタンバイが自動的に昇格する'
  ],
  answer: 0,
  exp: 'recovery_min_apply_delay はスタンバイでの WAL の「適用」を指定時間だけ遅らせるパラメータです。受信と保存は通常どおり行われるため、プライマリ側で WAL が滞留することはありません。\nこれにより、誤った DELETE や DROP がプライマリで行われても、指定時間内であればスタンバイには反映されていないため、そこからデータを救い出せます（遅延スタンバイ）。\nただし同期レプリケーションと併用すると、synchronous_commit = remote_apply の場合にコミットが遅延分だけ待たされる点に注意が必要です。\nホットスタンバイの問い合わせは、遅れた時点のデータを参照することになります。',
  evidence: [
    ['recovery_min_apply_delay = 1min を設定したときの、受信と適用の差',
      'pg_is_in_recovery\n-------------------\n t\n(1 row)\n\n recovery_min_apply_delay\n--------------------------\n 1min\n(1 row)\n\n--- プライマリ側\n application_name |   state   |  sent_lsn  | flush_lsn  | replay_lsn |   replay_lag\n------------------+-----------+------------+------------+------------+-----------------\n standby1         | streaming | 0/96DA9460 | 0/96DA9460 | 0/88143AE0 | 00:00:16.446569\n(1 row)\n\n--- スタンバイ側（受信は済んでいるが、適用は遅らせている）\n pg_last_wal_receive_lsn | pg_last_wal_replay_lsn |      delay\n-------------------------+------------------------+-----------------\n 0/96DA9460              | 0/8BEA2980             | 00:13:29.080804\n(1 row)\n\nERROR:  relation "delaytest" does not exist\nLINE 1: SELECT count(*) FROM delaytest;\n                             ^\n count\n-------\n     1\n(1 row)']
  ],
  refs: [
    ['recovery_min_apply_delay', 'runtime-config-replication.html#GUC-RECOVERY-MIN-APPLY-DELAY'],
    ['スタンバイサーバの設定', 'warm-standby.html#STANDBY-SERVER-OPERATION']
  ]
},
{
  id: 'G1.4-013', level: 'gold', cat: 'G1.4',
  q: 'ストリーミングレプリケーションのスタンバイに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    'プライマリで ANALYZE を実行して更新された統計情報は、WAL 経由でスタンバイにも反映される',
    'スタンバイでは SET コマンドによるパラメータ変更を行える',
    'スタンバイでも一時テーブルであれば作成できる',
    'プライマリで実行された SELECT 文が、スタンバイにも転送されて実行される',
    'スタンバイでは、WAL は SQL 文の形に変換されてから適用される'
  ],
  answer: [0, 1],
  exp: '統計情報はシステムカタログ（pg_statistic）に格納されるため、ANALYZE による更新も WAL に記録され、スタンバイに反映されます。\nスタンバイは読み取り専用ですが、SET によるセッション単位のパラメータ変更は行えます。\nスタンバイでは一時テーブルも作成できません。書き込みを伴う操作はすべて拒否されます。\nストリーミングレプリケーションで転送されるのは WAL レコードであって SQL 文ではありません。したがって SELECT のような更新を伴わない文が転送されることはなく、スタンバイでは WAL がそのまま適用されます。',
  refs: [
    ['ホットスタンバイ', 'hot-standby.html'],
    ['ホットスタンバイでのユーザ用概説', 'hot-standby.html#HOT-STANDBY-USERS']
  ]
},
{
  id: 'G1.4-014', level: 'gold', cat: 'G1.4',
  q: '論理レプリケーションの運用に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    '一時的に停止したいときは ALTER SUBSCRIPTION ... DISABLE を実行する',
    '構成をやめるときは、先にサブスクライバ側で DROP SUBSCRIPTION を実行する',
    '構成をやめるときは、先にパブリッシャ側で DROP PUBLICATION を実行する',
    'CREATE SUBSCRIPTION はパブリッシャへの接続文字列を必要としない',
    '1つのパブリケーションには、テーブルを1つしか登録できない'
  ],
  answer: [0, 1],
  exp: '論理レプリケーションを一時的に止めるには ALTER SUBSCRIPTION ... DISABLE、再開するには ENABLE を使います。\nやめる場合は、先にサブスクライバ側で DROP SUBSCRIPTION を実行します。これによりパブリッシャ側のレプリケーションスロットも削除されるためです。先にパブリケーションを削除すると、スロットが残って WAL が蓄積するおそれがあります（スロットを削除できない状況では ALTER SUBSCRIPTION ... SET (slot_name = NONE) を使います）。\nCREATE SUBSCRIPTION にはパブリッシャへの接続文字列（CONNECTION）が必要です。\nパブリケーションには複数のテーブルを登録でき、FOR ALL TABLES も指定できます。',
  refs: [
    ['サブスクリプション', 'logical-replication-subscription.html'],
    ['DROP SUBSCRIPTION', 'sql-dropsubscription.html'],
    ['CREATE PUBLICATION', 'sql-createpublication.html']
  ]
},
{
  id: 'G1.4-015', level: 'gold', cat: 'G1.4',
  q: 'レプリケーションスロットに関する説明として、適切なものを2つ選びなさい。',
  choices: [
    '物理スロットと論理スロットがあり、slot_type 列で区別できる',
    'active 列が false のスロットは接続が切れている状態で、WAL は保持され続ける',
    'スロットを作成すると、それ以降に生成された WAL がすべて永久に保持される',
    '論理スロットは、作成したデータベースとは無関係にクラスタ全体を対象とする',
    'スロットはサーバを再起動すると自動的に削除される'
  ],
  answer: [0, 1],
  exp: 'pg_replication_slots の slot_type 列は physical（ストリーミングレプリケーション用）または logical（論理レプリケーション・論理デコーディング用）です。\nactive 列は、そのスロットに現在接続があるかを示します。false でもスロット自体は残り、restart_lsn 以降の WAL が保持され続けるため、不要なスロットを放置すると pg_wal が肥大化します。\n保持されるのは接続先がまだ受信していない分だけで、受信が進めば解放されます。上限は max_slot_wal_keep_size で設けられます。\n論理スロットは特定のデータベースに属します（database 列）。\nスロットは永続的で、再起動しても残ります。削除は pg_drop_replication_slot() で行います。',
  refs: [
    ['pg_replication_slots', 'view-pg-replication-slots.html'],
    ['レプリケーションスロット', 'warm-standby.html#STREAMING-REPLICATION-SLOTS']
  ]
},
{
  id: 'G1.4-016', level: 'gold', cat: 'G1.4',
  q: 'パブリケーションの操作に関する説明として、**適切でないもの**を1つ選びなさい。',
  choices: [
    'FOR ALL TABLES で作成したパブリケーションには、後から ALTER PUBLICATION ... ADD TABLE で個別に追加する',
    'ALTER PUBLICATION ... ADD TABLE で、後からテーブルを追加できる',
    'publish パラメータで、複製する操作（insert、update、delete、truncate）を限定できる',
    'パブリケーションを作成できるのは、データベースに対する CREATE 権限を持つロールである',
    'テーブルを追加した後、サブスクライバ側で ALTER SUBSCRIPTION ... REFRESH PUBLICATION が必要になる'
  ],
  answer: 0,
  exp: 'FOR ALL TABLES で作成したパブリケーションは、そのデータベースのすべてのテーブル（今後作られるものも含む）を自動的に対象とします。個別にテーブルを追加することはできず、ALTER PUBLICATION ... ADD TABLE はエラーになります。この点が誤りです。\nテーブルを列挙して作成したパブリケーションには、ADD TABLE / DROP TABLE / SET TABLE で増減できます。\npublish パラメータ（既定は 4種類すべて）で複製する操作を絞れます。\nパブリケーションにテーブルを追加しても、サブスクライバ側で REFRESH PUBLICATION を実行するまでは取り込まれません。',
  refs: [
    ['CREATE PUBLICATION', 'sql-createpublication.html'],
    ['ALTER SUBSCRIPTION', 'sql-altersubscription.html']
  ]
},
{
  id: 'G1.4-017', level: 'gold', cat: 'G1.4', type: 'scenario',
  q: 'プライマリ（ポート 5432）とスタンバイで次の結果を得た（一部の列）。読み取れることとして、適切なものを2つ選びなさい。',
  code: '-- プライマリで実行\n=# SELECT application_name, state, sent_lsn, flush_lsn, replay_lsn, sync_state\n     FROM pg_stat_replication;\n application_name |   state   |  sent_lsn  | flush_lsn  | replay_lsn | sync_state\n------------------+-----------+------------+------------+------------+------------\n standby1         | streaming | 0/16561900 | 0/16561900 | 0/16561900 | async\n\n-- スタンバイで実行\n=# SELECT status, slot_name, sender_host, sender_port FROM pg_stat_wal_receiver;\n  status   | slot_name | sender_host | sender_port\n-----------+-----------+-------------+-------------\n streaming | standby1  | 127.0.0.1   |        5432',
  choices: [
    'スタンバイは送られた WAL をすべて受信・ディスクに保存・適用し終えており、遅れはない',
    'スタンバイはレプリケーションスロット standby1 を使ってプライマリから WAL を受信している',
    'sync_state が async なので、スタンバイへの WAL の送信は行われていない',
    'pg_stat_wal_receiver はプライマリで実行するビューで、スタンバイでは何も表示されない',
    'replay_lsn が sent_lsn と同じなので、このスタンバイは同期スタンバイとして動作している'
  ],
  answer: [0, 1],
  exp: 'pg_stat_replication はプライマリ（WAL を送る側）で参照し、sent_lsn（送信済み）、write_lsn（スタンバイの OS に書き込み済み）、flush_lsn（スタンバイのディスクに保存済み）、replay_lsn（スタンバイで適用済み）を比べると、どの段階で遅れているかが分かります。すべて同じなら遅れはありません。\npg_stat_wal_receiver はスタンバイ（受信する側）で参照し、接続先やスロット名を確認できます。\nsync_state の async は非同期レプリケーションであることを表し、WAL は送信されています。同期か非同期かは synchronous_standby_names の設定で決まり、LSN の一致とは関係ありません。\nこの結果は PostgreSQL 14 で実際に採取したものです。',
  evidence: [
    ['プライマリとスタンバイの状態',
      'synchronous_standby_names\n------------------------------\n FIRST 1 (standby1, standby2)\n(1 row)\n\n application_name |   state   | sync_priority | sync_state |  sent_lsn  | flush_lsn  | replay_lsn\n------------------+-----------+---------------+------------+------------+------------+------------\n standby1         | streaming |             1 | sync       | 0/96DA9460 | 0/96DA9460 | 0/96DA9460\n(1 row)\n\n  status   | sender_host | sender_port | slot_name | flushed_lsn\n-----------+-------------+-------------+-----------+-------------\n streaming | 127.0.0.1   |        5432 | standby1  | 0/96DA9460\n(1 row)\n\n--- スタンバイで書き込もうとした場合\nERROR:  cannot execute INSERT in a read-only transaction\nERROR:  cannot execute CREATE TABLE in a read-only transaction\n count\n-------\n     1\n(1 row)'],
    ['適用を一時停止して遅延させた場合',
      'pg_wal_replay_pause\n---------------------\n\n(1 row)\n\n application_name |   state   |  sent_lsn  | write_lsn  | flush_lsn  | replay_lsn | replay_behind |   replay_lag   | sync_state\n------------------+-----------+------------+------------+------------+------------+---------------+----------------+------------\n standby1         | streaming | 0/19B628C0 | 0/19B628C0 | 0/19B628C0 | 0/16569C78 | 54 MB         | 00:00:02.00898 | async\n(1 row)\n\n pg_last_wal_receive_lsn | pg_last_wal_replay_lsn | pg_is_wal_replay_paused |  replay_delay\n-------------------------+------------------------+-------------------------+-----------------\n 0/19B628C0              | 0/16569C78             | t                       | 00:00:11.755934\n(1 row)\n\n pg_wal_replay_resume\n----------------------\n\n(1 row)']
  ],
  refs: [
    ['pg_stat_replication', 'monitoring-stats.html#MONITORING-PG-STAT-REPLICATION-VIEW'],
    ['pg_stat_wal_receiver', 'monitoring-stats.html#MONITORING-PG-STAT-WAL-RECEIVER-VIEW']
  ]
},
{
  id: 'G1.4-018', level: 'gold', cat: 'G1.4', type: 'scenario',
  q: 'ホットスタンバイで次の SQL を実行したところ、いずれもエラーになった。説明として正しいものを1つ選びなさい。',
  code: '=# SELECT pg_is_in_recovery();\n pg_is_in_recovery\n-------------------\n t\n\n=# INSERT INTO accounts VALUES (3, 0);\nERROR:  cannot execute INSERT in a read-only transaction\n\n=# CREATE TEMP TABLE t (id int);\nERROR:  cannot execute CREATE TABLE in a read-only transaction',
  choices: [
    'リカバリ中のスタンバイは読み取り専用で、一時テーブルの作成も含めて書き込みはできない',
    'default_transaction_read_only が on になっているだけなので、SET で off にすれば書き込める',
    '一時テーブルはスタンバイにしか作れないため、CREATE TEMP TABLE のエラーは権限不足が原因である',
    'accounts テーブルに INSERT の権限を付与すれば、スタンバイでも書き込める',
    'pg_is_in_recovery() が t なので、このサーバはプライマリとして動作している'
  ],
  answer: 0,
  exp: 'pg_is_in_recovery() が t のサーバはリカバリ中（スタンバイ）です。ホットスタンバイでは読み取りの問い合わせだけを実行でき、INSERT や UPDATE、DDL は「read-only transaction」としてエラーになります。一時テーブルもカタログへの書き込みを伴うため作成できません。\nこれは WAL を適用しているスタンバイの性質であり、パラメータや権限の変更では書き込めるようになりません。書き込みが必要な処理はプライマリで行います（スタンバイを昇格させると書き込めるようになります）。\nこれらのエラーは PostgreSQL 14 で実際に出力されたものです。',
  evidence: [
    ['スタンバイで書き込もうとした場合のエラー',
      '--- スタンバイで書き込もうとした場合\nERROR:  cannot execute INSERT in a read-only transaction\nERROR:  cannot execute CREATE TABLE in a read-only transaction\n count\n-------\n     1\n(1 row)']
  ],
  refs: [
    ['ホットスタンバイでのユーザ用概説', 'hot-standby.html#HOT-STANDBY-USERS'],
    ['リカバリ情報関数', 'functions-admin.html#FUNCTIONS-RECOVERY-INFO-TABLE']
  ]
},
{
  id: 'G1.4-019', level: 'gold', cat: 'G1.4',
  q: 'ロジカルレプリケーションのサブスクライバで設定する max_logical_replication_workers に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '適用ワーカとテーブル同期ワーカを合わせた数の上限で、これらのワーカは max_worker_processes の枠から確保される',
    'パブリッシャで設定するパラメータで、WAL を送信する walsender プロセスの最大数を指定する',
    'サブスクリプション1つあたりのテーブル同期ワーカの上限で、pg_reload_conf() で変更を反映できる',
    '既定値は 0 で、ロジカルレプリケーションを使うには 1 以上に設定してから再起動する必要がある',
    'ワーカの数ではなく、1つのワーカが同時に複製できるテーブルの数の上限を指定するパラメータである'
  ],
  answer: 0,
  exp: 'max_logical_replication_workers は、サブスクライバで動くロジカルレプリケーションのワーカの最大数です。変更を適用する適用ワーカ（サブスクリプションごとに1つ）と、初期データをコピーするテーブル同期ワーカの両方が含まれます。これらのワーカは max_worker_processes で決まるバックグラウンドワーカの枠から確保されるため、max_worker_processes にも余裕が必要です。既定値は 4 で、変更にはサーバの再起動が必要です（pg_settings の context は postmaster）。\nサブスクリプション1つあたりのテーブル同期ワーカの上限は max_sync_workers_per_subscription（既定値 2、再読み込みで変更可能）です。\nwalsender の最大数はパブリッシャ（送信側）の max_wal_senders で指定します。',
  refs: [
    ['max_logical_replication_workers', 'runtime-config-replication.html#GUC-MAX-LOGICAL-REPLICATION-WORKERS'],
    ['論理レプリケーションの設定', 'logical-replication-config.html'],
    ['max_worker_processes', 'runtime-config-resource.html#GUC-MAX-WORKER-PROCESSES']
  ]
},

);
