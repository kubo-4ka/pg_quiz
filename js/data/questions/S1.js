/*
 * Silver S1 一般知識（32問）
 * PostgreSQL 14 文書に基づくオリジナル問題。形式は DEVELOPMENT.md を参照。
 * tools/format.js で整形しています（node tools/format.js）。
 */
(window.PGQ_QUESTIONS = window.PGQ_QUESTIONS || []).push(

/* ---------------- S1.1 OSS-DBの一般的特徴（重要度 4 / 15問） ---------------- */
{
  id: 'S1.1-001', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL のライセンスに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'BSD や MIT ライセンスに類似した PostgreSQL License で配布されており、改変・再配布・商用利用が可能である',
    'GPL で配布されているため、改変したプログラムを配布する場合はソースコードの公開が義務付けられる',
    '個人利用は無償だが、商用利用には有償ライセンスの購入が必要である',
    'コミュニティ版と商用版のデュアルライセンスとなっており、コミュニティ版は改変が禁止されている',
    'ライセンス上、PostgreSQL を組み込んだ製品を販売することは禁止されている'
  ],
  answer: 0,
  exp: 'PostgreSQL は BSD/MIT に類似した寛容な「PostgreSQL License」で配布されています。著作権表示とライセンス文を残せば、目的を問わず無償で使用・複製・改変・配布ができ、改変したソースの公開義務もありません。そのため商用製品への組み込みや販売も可能です。GPL やデュアルライセンスではありません。',
  refs: [
    ['法的告知（ライセンス）', 'legalnotice.html'],
    ['PostgreSQL の略歴', 'history.html']
  ]
},
{
  id: 'S1.1-002', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL 14.5 というバージョン表記に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '「14」がメジャーバージョン、「5」がマイナーバージョンを表す',
    '14.5 から 14.6 へのアップデートでは、pg_dump と pg_restore によるデータ移行が必須である',
    '14 から 15 へのメジャーバージョンアップでは内部データ形式が変わらないため、実行ファイルを入れ替えるだけでよい',
    'メジャーバージョンは原則として毎月リリースされる',
    '各メジャーバージョンは初回リリースから10年間サポートされる'
  ],
  answer: 0,
  exp: 'PostgreSQL 10 以降は、先頭の数字がメジャーバージョン、2つ目がマイナーバージョンです。\nマイナーリリースではデータの内部形式は変わらないため、実行ファイルを入れ替えてサーバを再起動するだけでアップデートできます。\n一方メジャーバージョンアップでは内部形式が変わりうるため、pg_dumpall などによるダンプ・リストア、pg_upgrade、または論理レプリケーションによる移行が必要です。\nメジャーバージョンは概ね年1回リリースされ、サポート期間は約5年間です。',
  refs: [
    ['PostgreSQLクラスタのアップグレード', 'upgrading.html'],
    ['バージョン管理ポリシー（公式英語）', 'https://www.postgresql.org/support/versioning/']
  ]
},
{
  id: 'S1.1-003', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL の不具合を見つけた場合の報告方法として、ドキュメントで案内されているものを1つ選びなさい。',
  choices: [
    'pgsql-bugs メーリングリスト、または PostgreSQL の Web サイトにあるバグ報告フォームから報告する',
    '商用サポート契約を結んでいる利用者だけが報告でき、契約先の企業を通じて報告する',
    'GitHub にあるソースコードのミラーリポジトリの Issues に登録するのが正式な方法である',
    'セキュリティ上の問題も含め、すべて一般向けメーリングリスト pgsql-general に公開で投稿する',
    'バグ報告はメジャーバージョンのベータ期間中にのみ受け付けられる'
  ],
  answer: 0,
  exp: 'ドキュメントの「バグreportingガイドライン」では、バグは pgsql-bugs メーリングリスト（pgsql-bugs@lists.postgresql.org）か、Web サイトのバグ報告フォームから報告するよう案内されています。報告時は PostgreSQL のバージョン、再現手順、期待した結果と実際の結果などを含めます。\nPostgreSQL は開発者コミュニティによって開発されており、誰でも報告できます。GitHub 上のリポジトリはミラーで、Issues やプルリクエストは受け付けていません。\nセキュリティに関わる問題は、公開のメーリングリストではなく security@postgresql.org に報告します。',
  refs: [
    ['バグreportingガイドライン', 'bug-reporting.html'],
    ['セキュリティ（公式英語）', 'https://www.postgresql.org/support/security/']
  ]
},
{
  id: 'S1.1-004', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL の機能に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ストアドファンクションは C 言語でのみ記述でき、SQL や PL/pgSQL では記述できない',
    'MVCC（多版型同時実行制御）により、データの読み取りと書き込みが互いにブロックしない',
    'CREATE TABLE などの DDL はトランザクションに含められないため、ロールバックできない',
    '1つのテーブルに格納できる行数は約21億行までに制限されている',
    'ユーザが独自のデータ型や演算子を定義することはできない'
  ],
  answer: 1,
  exp: 'PostgreSQL は MVCC（Multiversion Concurrency Control）を採用しており、各トランザクションはある時点のスナップショットを参照するため、読み取りは書き込みをブロックせず、書き込みも読み取りをブロックしません。\n関数は SQL、PL/pgSQL、C のほか PL/Perl、PL/Python などでも記述できます。DDL もトランザクション内で実行でき、ロールバックできます。\nテーブルの行数に固定の上限はなく（テーブルサイズの上限は既定で 32TB）、CREATE TYPE や CREATE OPERATOR でデータ型や演算子を独自に定義できる拡張性も特徴です。',
  refs: [
    ['MVCC入門', 'mvcc-intro.html'],
    ['手続き言語', 'xplang.html'],
    ['PostgreSQLの制限', 'limits.html']
  ]
},
{
  id: 'S1.1-005', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL のマイナーリリースに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'マイナーリリースでは、新機能の追加が中心となる',
    '14.2 から 14.5 へ上げる場合は、14.3、14.4 を順番に適用しなければならない',
    'マイナーリリースは、バグ修正やセキュリティ修正などを含み、少なくとも3か月に1回程度の頻度で予定されている',
    'マイナーリリースを適用するには、initdb でデータベースクラスタを作り直す必要がある',
    'サポート期間が終了したメジャーバージョンにも、セキュリティ修正のマイナーリリースは提供され続ける'
  ],
  answer: 2,
  exp: 'PostgreSQL のバージョン管理ポリシーでは、マイナーリリースは少なくとも3か月に1回程度予定され、頻繁に発生するバグ、セキュリティ問題、データ破損の問題の修正だけを含み、新機能は追加されません。\nマイナーリリースは累積的なので、途中のリリースを飛ばして最新のマイナーリリースに直接更新できます。データ形式は変わらないため、initdb やダンプ・リストアは不要です（ただしリリースノートに REINDEX などの追加手順が記載される場合があります）。\nサポート期間（約5年）を過ぎたメジャーバージョンには修正が提供されません。',
  refs: [
    ['PostgreSQLクラスタのアップグレード', 'upgrading.html'],
    ['バージョン管理ポリシー（公式英語）', 'https://www.postgresql.org/support/versioning/']
  ]
},
{
  id: 'S1.1-006', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL の開発体制に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '特定の1企業が開発を所有しており、ソースコードは契約者にのみ公開されている',
    '新機能は、マイナーリリースのたびに随時追加される',
    '開発中のパッチは、CommitFest と呼ばれる期間ごとにまとめてレビューされる',
    'パッチは GitHub のプルリクエストでのみ受け付けられている',
    'コアチームのメンバー以外は、パッチを提出することができない'
  ],
  answer: 2,
  exp: 'PostgreSQL は PostgreSQL Global Development Group と呼ばれる世界中の開発者コミュニティによって開発されており、特定の企業が所有するものではありません。ソースコードは誰でも入手できます。\n新機能の開発では、パッチを pgsql-hackers メーリングリストに投稿し、1つの開発サイクルの間に複数回設けられる CommitFest（コミットフェスト）という期間にまとめてレビューが行われます。誰でもパッチの提出やレビューに参加できます。\n新機能はメジャーリリースで追加され、マイナーリリースはバグ修正などに限られます。',
  refs: [
    ['PostgreSQL の略歴', 'history.html'],
    ['CommitFest（PostgreSQL Wiki、英語）', 'https://wiki.postgresql.org/wiki/CommitFest']
  ]
},
{
  id: 'S1.1-007', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL の拡張機能（extension）と追加提供モジュール（contrib）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'contrib のモジュールは本体とは別の商用ライセンスで提供され、商用利用はできない',
    '拡張機能を利用するには、PostgreSQL サーバ本体を再コンパイルする必要がある',
    '一度 CREATE EXTENSION を実行すると、クラスタ内のすべてのデータベースで利用できる',
    'CREATE EXTENSION を実行すると、必要なファイルがインターネットから自動的にダウンロードされる',
    'pgcrypto などの contrib モジュールは、利用するデータベースで CREATE EXTENSION を実行して組み込む'
  ],
  answer: 4,
  exp: 'contrib（追加提供モジュール）は PostgreSQL のソースツリーに含まれる拡張群で、本体と同じ PostgreSQL License で提供されます。pgcrypto、postgres_fdw、pg_stat_statements などがあります。\n拡張機能はデータベース単位で登録するもので、利用するデータベースごとに CREATE EXTENSION を実行します（template1 で実行しておくと、以後作成するデータベースに引き継がれます）。\n拡張のファイル（制御ファイルや共有ライブラリ）はあらかじめサーバにインストールされている必要があり、CREATE EXTENSION が自動でダウンロードすることはありません。サーバ本体の再コンパイルは不要です。',
  refs: [
    ['追加で提供されるモジュール（contrib）', 'contrib.html'],
    ['CREATE EXTENSION', 'sql-createextension.html']
  ]
},
{
  id: 'S1.1-008', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL の成り立ちに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'MySQL のソースコードから派生して開発された',
    '商用データベース製品のソースコードが公開されて始まった',
    'バークレー校の POSTGRES プロジェクトを起源とし、後に SQL に対応した',
    '日本の研究機関で開発され、後に海外のコミュニティに引き継がれた',
    '最初のバージョンから SQL を問い合わせ言語として採用していた'
  ],
  answer: 2,
  exp: 'PostgreSQL の起源は、1986年にカリフォルニア大学バークレー校でマイケル・ストーンブレーカー教授が始めた POSTGRES プロジェクトです。当初の問い合わせ言語は PostQUEL でした。\n1994年に SQL の問い合わせ言語が追加された Postgres95 が公開され、1996年に SQL 対応を明確にするため PostgreSQL と改名されました（バージョン 6.0）。以降は世界中の開発者によるコミュニティ（PostgreSQL Global Development Group）で開発が続けられています。',
  refs: [
    ['PostgreSQL の略歴', 'history.html']
  ]
},
{
  id: 'S1.1-009', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL が動作するプラットフォームに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'Linux 専用であり、Windows では動作しない',
    'Windows 専用であり、Linux では動作しない',
    'Linux、Windows、macOS、各種 BSD など、多くのオペレーティングシステムで動作する',
    '動作させるには、専用のハードウェアアプライアンスが必要である',
    'x86 以外の CPU アーキテクチャでは動作しない'
  ],
  answer: 2,
  exp: 'PostgreSQL は移植性の高い C 言語で書かれており、Linux、Windows、macOS、FreeBSD・OpenBSD・NetBSD などの BSD 系、Solaris など、多くのオペレーティングシステムで動作します。CPU アーキテクチャも x86 / x86_64 のほか、ARM、PowerPC、s390x などに対応しています。\nソースコードからのビルドのほか、各 OS 向けのパッケージやインストーラも提供されています。',
  refs: [
    ['サポートされるプラットフォーム', 'supported-platforms.html'],
    ['PostgreSQL とは', 'intro-whatis.html']
  ]
},
{
  id: 'S1.1-010', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL License の条件に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '開発元が動作を保証しており、不具合による損害は開発元が補償する',
    '改変したプログラムを配布する場合は、GPL と同じくソースコードを公開しなければならない',
    '無保証であることを前提に、著作権表示などを残せば、目的を問わず無償で利用・改変・再配布できる',
    '商用製品に組み込む場合は、コミュニティに利用料を支払う必要がある',
    'ソースコードは入手できるが、改変することは禁止されている'
  ],
  answer: 2,
  exp: 'PostgreSQL License は BSD / MIT ライセンスに近い寛容なオープンソースライセンスです。著作権表示と許諾文、および免責条項を含めることを条件に、使用・複製・改変・配布を目的を問わず無償で行うことが許可されています。改変したソースコードの公開義務はありません。\nソフトウェアは「現状のまま」提供され、カリフォルニア大学などの著作権者は一切の保証を行わず、損害に対する責任を負いません。業務で保証やサポートが必要な場合は、商用サポートを提供する企業を利用します。',
  refs: [
    ['法的告知（ライセンス）', 'legalnotice.html'],
    ['ライセンス（公式英語）', 'https://www.postgresql.org/about/licence/']
  ]
},
{
  id: 'S1.1-011', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL のメジャーバージョンのサポート期間に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '初回リリースからおおむね5年間サポートされ、その後は新しいマイナーリリースが提供されなくなる',
    'サポート期間は定められておらず、すべてのバージョンが無期限に保守される',
    'サポート期間は1年間で、毎年メジャーバージョンアップが必須になる',
    'サポートが終了したバージョンでも、重大な脆弱性についてはコミュニティが修正を提供し続ける',
    'サポート期間は有償サポートの契約者にのみ適用され、無償利用では対象外である'
  ],
  answer: 0,
  exp: 'PostgreSQL のメジャーバージョンは、初回リリースからおおむね5年間サポートされます。この間は不具合や脆弱性を修正したマイナーリリースが提供され、期間が終了する（EOL）と、それ以降は修正が提供されません。\nメジャーバージョンは年1回のペースでリリースされるため、常に5つ前後のバージョンが同時にサポートされている状態になります。\nサポートはコミュニティが無償で提供するもので、契約の有無とは関係ありません。\n運用にあたっては、使用中のバージョンの EOL 時期を把握し、計画的にメジャーバージョンアップを行う必要があります。',
  refs: [
    ['バージョニングポリシー', 'upgrading.html'],
    ['PostgreSQLとは？', 'intro-whatis.html']
  ]
},
{
  id: 'S1.1-012', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL の同時実行制御に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '多版同時実行制御（MVCC）を採用しており、読み取りが書き込みを、書き込みが読み取りを妨げない',
    '読み取り時に共有ロックを獲得するため、更新中の行は参照できない',
    '更新は行を直接上書きするため、古いバージョンの行が残ることはない',
    '参照の一貫性はテーブル全体をロックすることで保証している',
    'MVCC を採用しているため、VACUUM のような不要領域の回収処理は必要ない'
  ],
  answer: 0,
  exp: 'PostgreSQL は多版同時実行制御（MVCC）を採用しています。各トランザクションはある時点のスナップショットを見るため、読み取りが書き込みをブロックせず、書き込みも読み取りをブロックしません。\n更新は既存の行を上書きせず、新しい行バージョンを追加して古い方を「不要」と印付けする追記型の方式です。削除も同様に印を付けるだけです。\nこのため、どのトランザクションからも見えなくなった古い行バージョンを回収する VACUUM が必要になります。\n明示的なロックが必要な場面では、SELECT ... FOR UPDATE などを使います。',
  refs: [
    ['同時実行制御', 'mvcc.html'],
    ['はじめに（MVCC）', 'mvcc-intro.html']
  ]
},
{
  id: 'S1.1-013', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL が「オブジェクトリレーショナルデータベース」と呼ばれる理由の説明として、最も適切なものを1つ選びなさい。',
  choices: [
    'ユーザ定義のデータ型や関数、演算子、テーブルの継承といった拡張の仕組みを備えているため',
    'データをオブジェクト単位のファイルとして格納し、SQL を使わずに操作できるため',
    'リレーショナルモデルを採用しておらず、階層型のデータモデルを用いているため',
    'Java などのオブジェクト指向言語からしか接続できないため',
    '表計算ソフトのようにセル単位でデータを編集できるため'
  ],
  answer: 0,
  exp: 'PostgreSQL はリレーショナルデータベースとしての機能に加え、ユーザ定義のデータ型・関数・演算子・集約・インデックスアクセスメソッド、テーブルの継承といったオブジェクト指向的な拡張の仕組みを備えており、オブジェクトリレーショナルデータベース管理システム（ORDBMS）と呼ばれます。\n拡張機能（extension）として機能をまとめて追加・削除できる点も特徴です。\n操作は標準的な SQL で行い、接続できる言語も特定のものに限られません。',
  refs: [
    ['PostgreSQLとは？', 'intro-whatis.html'],
    ['サーバプログラミング', 'server-programming.html']
  ]
},
{
  id: 'S1.1-014', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL のメジャーバージョンアップの方法に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'pg_dump によるダンプとリストア、pg_upgrade、論理レプリケーションのいずれかを用いる',
    '新しいバージョンのバイナリに入れ替えてサーバを起動すれば、データはそのまま利用できる',
    'メジャーバージョンアップは pg_upgrade でしか行えない',
    'マイナーリリースの適用と同様に、データディレクトリの変換は一切必要ない',
    'メジャーバージョンアップでは、必ず古いバージョンのデータが失われる'
  ],
  answer: 0,
  exp: 'メジャーバージョン間では内部のデータ形式が変わることがあるため、データディレクトリをそのまま使い回すことはできません。主な方法は、pg_dump / pg_dumpall によるダンプとリストア、pg_upgrade による変換、論理レプリケーションを使った移行の3つです。\npg_dump は確実ですが大規模なデータでは時間がかかり、pg_upgrade は --link オプションを使えば短時間で切り替えられます。論理レプリケーションは停止時間を最小にできます。\n一方、マイナーリリース（14.5 から 14.6 など）ではバイナリを入れ替えて再起動するだけで、ダンプもリストアも不要です。',
  refs: [
    ['バージョンアップグレード', 'upgrading.html'],
    ['pg_upgrade', 'pgupgrade.html']
  ]
},
{
  id: 'S1.1-015', level: 'silver', cat: 'S1.1',
  q: 'PostgreSQL のクライアントインタフェースに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'C 言語用のライブラリ libpq が本体に含まれ、多くの言語のドライバがこれを利用している',
    'クライアントから接続できるのは psql だけで、アプリケーションからは接続できない',
    'JDBC ドライバは PostgreSQL 本体に同梱されており、別途入手する必要はない',
    'クライアントとサーバの通信は HTTP で行われるため、Web ブラウザから直接接続できる',
    'ODBC は PostgreSQL では利用できない'
  ],
  answer: 0,
  exp: 'PostgreSQL 本体には C 言語用のクライアントライブラリ libpq が含まれており、psql をはじめとする付属ツールもこれを使っています。Python の psycopg や PHP の拡張など、多くの言語のドライバも libpq を利用しています。\nJDBC ドライバ（PgJDBC）や ODBC ドライバ（psqlODBC）、.NET 用の Npgsql などは、本体とは別に配布されている公式・準公式のドライバです。JDBC ドライバのように Java で独自にプロトコルを実装したものもあります。\nクライアントとサーバの通信は、独自のフロントエンド／バックエンドプロトコルで行われます。',
  refs: [
    ['libpq - C言語ライブラリ', 'libpq.html'],
    ['クライアントインタフェース', 'client-interfaces.html']
  ]
},

/* ---------------- S1.2 リレーショナルデータベースに関する一般知識（重要度 4 / 17問） ---------------- */
{
  id: 'S1.2-001', level: 'silver', cat: 'S1.2',
  q: 'SQL の分類で DCL（データ制御言語）に該当するものを1つ選びなさい。',
  choices: [
    'CREATE TABLE',
    'UPDATE',
    'GRANT',
    'ALTER TABLE',
    'SELECT'
  ],
  answer: 2,
  exp: 'DCL（Data Control Language）はアクセス権限などを制御する命令で、GRANT や REVOKE が該当します。\nCREATE TABLE / ALTER TABLE はオブジェクトを定義・変更する DDL（Data Definition Language）、SELECT / UPDATE はデータを操作する DML（Data Manipulation Language）に分類されます。',
  refs: [
    ['GRANT', 'sql-grant.html'],
    ['権限', 'ddl-priv.html']
  ]
},
{
  id: 'S1.2-002', level: 'silver', cat: 'S1.2',
  q: '正規化に関する説明のうち、第3正規形の説明として正しいものを1つ選びなさい。',
  choices: [
    '繰り返し項目（非単純な値）を排除し、すべての属性値が単一の値となっている',
    '第2正規形を満たし、さらにキー以外の属性間の推移的関数従属を排除している',
    '第1正規形を満たし、候補キーの一部に対する部分関数従属を排除している',
    'すべてのテーブルに外部キー制約が定義されている',
    'すべてのテーブルが単一の列だけで構成されている'
  ],
  answer: 1,
  exp: '第1正規形は繰り返し項目を排除した状態、第2正規形は第1正規形に加えて候補キーへの部分関数従属を排除した状態、第3正規形は第2正規形に加えて推移的関数従属（キー以外の属性に従属する属性）を排除した状態です。\n外部キー制約の有無は正規形の定義とは関係ありません。正規化した結果として参照整合性を保つために外部キー制約を利用します。',
  refs: [
    ['OSS-DB Silver 出題範囲（S1.2）', 'https://oss-db.jp/outline/silver'],
    ['制約（外部キー）', 'ddl-constraints.html#DDL-CONSTRAINTS-FK']
  ]
},
{
  id: 'S1.2-003', level: 'silver', cat: 'S1.2',
  q: '主キー（PRIMARY KEY）と外部キー（FOREIGN KEY）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '主キーは単一の列にしか定義できない',
    '1つのテーブルに主キーを複数定義できる',
    '主キーの列は一意であればよく、NULL を1行だけ格納できる',
    '主キーは、値が一意で NULL を含まない列（または列の組み合わせ）であり、1つのテーブルに1つだけ定義できる',
    '外部キーは、参照先テーブルの主キーや一意制約のない任意の列を参照できる'
  ],
  answer: 3,
  exp: '主キー制約は、一意制約と NOT NULL 制約を組み合わせたもので、行を一意に識別するための列または列の組み合わせです。1つのテーブルに主キーは1つだけ定義できます（一意制約は複数定義できます）。\n外部キー制約は、参照先テーブルの値との整合性（参照整合性）を保つための制約で、参照先の列は主キーまたは一意制約を持つ列でなければなりません。',
  refs: [
    ['主キー', 'ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS'],
    ['外部キー', 'ddl-constraints.html#DDL-CONSTRAINTS-FK']
  ]
},
{
  id: 'S1.2-004', level: 'silver', cat: 'S1.2',
  q: 'トランザクションの ACID 特性のうち、「コミットされたトランザクションの結果は、その後にシステム障害が発生しても失われない」という性質を表すものを1つ選びなさい。',
  choices: [
    '原子性（Atomicity）',
    '一貫性（Consistency）',
    '独立性（Isolation）',
    '永続性（Durability）',
    '可用性（Availability）'
  ],
  answer: 3,
  shuffle: false,
  exp: 'ACID はトランザクションが備えるべき4つの性質です。\n・原子性: トランザクション内の処理はすべて実行されるか、まったく実行されないかのどちらかになる\n・一貫性: トランザクションの前後でデータベースが整合性のある状態に保たれる\n・独立性: 同時に実行されるトランザクションが互いに影響しない\n・永続性: コミットされた結果は障害が起きても失われない\nPostgreSQL は WAL（先行書き込みログ）によって、クラッシュ後もコミット済みの変更を復旧できるようにして永続性を保証しています。可用性は ACID には含まれません。',
  refs: [
    ['トランザクション（チュートリアル）', 'tutorial-transactions.html'],
    ['WAL（先行書き込みログ）', 'wal-intro.html']
  ]
},
{
  id: 'S1.2-005', level: 'silver', cat: 'S1.2',
  q: '関係代数の演算のうち「射影（projection）」に相当する SQL の操作として、最も適切なものを1つ選びなさい。',
  choices: [
    'WHERE 句で条件に一致する行だけを取り出す',
    'SELECT リストで必要な列だけを指定して取り出す',
    '2つのテーブルを JOIN で組み合わせる',
    '2つの問い合わせ結果を UNION でまとめる',
    '一方の問い合わせ結果から、もう一方の結果を EXCEPT で取り除く'
  ],
  answer: 1,
  exp: '関係代数の「射影」は、リレーションから特定の属性（列）だけを取り出す演算で、SQL では SELECT リストでの列の指定に相当します。\nWHERE 句で行を絞り込む操作は「選択（selection）」、JOIN は「結合」、UNION は「和」、EXCEPT は「差」に相当します。',
  refs: [
    ['選択リスト', 'queries-select-lists.html'],
    ['問い合わせの組み合わせ（UNION、EXCEPT）', 'queries-union.html']
  ]
},
{
  id: 'S1.2-006', level: 'silver', cat: 'S1.2', type: 'scenario',
  q: '次の表は第1正規形を満たしている。この表が満たしていない正規形のうち、最も低いものを1つ選びなさい。',
  code: '受注明細（受注番号, 商品番号, 商品名, 数量）\n  主キー: (受注番号, 商品番号)\n  商品名は商品番号だけで決まる',
  choices: [
    '第1正規形',
    '第2正規形',
    '第3正規形',
    'ボイス・コッド正規形',
    '第4正規形'
  ],
  answer: 1,
  shuffle: false,
  exp: '第2正規形は、第1正規形を満たし、かつ主キー（候補キー）以外の属性がキー全体に完全関数従属している（キーの一部だけに従属する部分関数従属がない）状態です。\nこの表では、主キーは (受注番号, 商品番号) ですが、商品名は主キーの一部である商品番号だけで決まるため、部分関数従属があります。したがって第2正規形を満たしていません。\n商品（商品番号, 商品名）の表を分離すると、受注明細（受注番号, 商品番号, 数量）は第2正規形を満たします。',
  evidence: [
    ['第2正規形になっていない表と、分割した場合の違い（実際に試した結果）',
      '=# CREATE TABLE order_items (order_no int, item_no int, item_name text, qty int, PRIMARY KEY (order_no, item_no));\nCREATE TABLE\n=# INSERT INTO order_items VALUES (1, 100, \'ペン\', 2), (1, 200, \'ノート\', 1), (2, 100, \'ペン\', 5);\nINSERT 0 3\n=# SELECT * FROM order_items ORDER BY order_no, item_no;\n order_no | item_no | item_name | qty\n----------+---------+-----------+-----\n        1 |     100 | ペン      |   2\n        1 |     200 | ノート    |   1\n        2 |     100 | ペン      |   5\n(3 rows)\n\n（商品名を変えるには、その商品を含むすべての行を更新する必要がある＝更新時異常）\n=# UPDATE order_items SET item_name = \'油性ペン\' WHERE item_no = 100 AND order_no = 1;\nUPDATE 1\n=# SELECT DISTINCT item_no, item_name FROM order_items ORDER BY item_no;\n item_no | item_name\n---------+-----------\n     100 | ペン\n     100 | 油性ペン\n     200 | ノート\n(3 rows)\n\n（第2正規形に分割すると、商品名は1か所で管理できる）\n=# CREATE TABLE items (item_no int PRIMARY KEY, item_name text); INSERT INTO items VALUES (100, \'ペン\'), (200, \'ノート\');\nINSERT 0 2\n=# CREATE TABLE order_lines (order_no int, item_no int REFERENCES items, qty int, PRIMARY KEY (order_no, item_no)); INSERT INTO order_lines VALUES (1, 100, 2), (1, 200, 1), (2, 100, 5);\nINSERT 0 3\n=# UPDATE items SET item_name = \'油性ペン\' WHERE item_no = 100;\nUPDATE 1\n=# SELECT l.order_no, l.item_no, i.item_name, l.qty FROM order_lines l JOIN items i USING (item_no) ORDER BY 1, 2;\n order_no | item_no | item_name | qty\n----------+---------+-----------+-----\n        1 |     100 | 油性ペン  |   2\n        1 |     200 | ノート    |   1\n        2 |     100 | 油性ペン  |   5\n(3 rows)']
  ],
  refs: [
    ['OSS-DB Silver 出題範囲（S1.2）', 'https://oss-db.jp/outline/silver'],
    ['外部キー', 'ddl-constraints.html#DDL-CONSTRAINTS-FK']
  ]
},
{
  id: 'S1.2-007', level: 'silver', cat: 'S1.2',
  q: 'リレーショナルデータモデルの用語に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'テーブルの列をタプル、行を属性と呼ぶ',
    'テーブルの行をタプル、列を属性と呼び、属性が取りうる値の集合をドメインと呼ぶ',
    'ドメインとは、データベースに含まれるテーブルの集合のことである',
    'リレーションでは行の並び順に意味があり、格納した順に取り出されることが保証される',
    '関係代数の「結合」は、1つのテーブルから条件に合う行を取り出す演算である'
  ],
  answer: 1,
  exp: 'リレーショナルデータモデルでは、テーブルをリレーション、行をタプル、列を属性と呼び、属性が取りうる値の集合をドメインと呼びます。\nリレーションは集合として扱われるため、行の順序に意味はありません。SQL でも ORDER BY を指定しない限り、結果の行の順序は保証されません。\n1つのテーブルから条件に合う行を取り出すのは「選択」で、「結合」は複数のリレーションを組み合わせる演算です。',
  refs: [
    ['概念（チュートリアル）', 'tutorial-concepts.html'],
    ['行の並べ替え（ORDER BY）', 'queries-order.html']
  ]
},
{
  id: 'S1.2-008', level: 'silver', cat: 'S1.2', type: 'scenario',
  q: '列 col に 1、2、NULL の3行が格納されたテーブル t に対して次の SQL を実行した場合の結果として、正しいものを1つ選びなさい。',
  code: 'SELECT col FROM t WHERE NOT (col = 1);',
  choices: [
    '2 だけが返される',
    '2 と NULL の2行が返される',
    'NULL だけが返される',
    '1、2、NULL の3行が返される',
    'NULL との比較を含むためエラーになる'
  ],
  answer: 0,
  exp: 'SQL の論理値は真（true）、偽（false）、不明（NULL / unknown）の3値論理です。col が NULL の行では col = 1 が NULL になり、NOT NULL も NULL のままです。WHERE 句は条件が真の行だけを返すため、NULL の行は結果に含まれません。\nしたがって、NOT (col = 1) が真になる 2 の行だけが返されます。NULL の行も含めたい場合は、WHERE col IS DISTINCT FROM 1 や WHERE col <> 1 OR col IS NULL と書きます。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'SELECT col FROM t WHERE NOT (col = 1);\n col\n-----\n   2\n(1 row)\n\nSELECT col, (col = 1) AS eq1, NOT (col = 1) AS not_eq1 FROM t;\n col | eq1 | not_eq1\n-----+-----+---------\n   1 | t   | f\n   2 | f   | t\n     |     |\n(3 rows)\n\nSELECT col FROM t WHERE col IS DISTINCT FROM 1;\n col\n-----\n   2\n\n(2 rows)']
  ],
  refs: [
    ['論理演算子', 'functions-logical.html'],
    ['比較関数および演算子', 'functions-comparison.html']
  ]
},
{
  id: 'S1.2-009', level: 'silver', cat: 'S1.2',
  q: 'データベース管理システム（DBMS）の主な役割として、正しいものを1つ選びなさい。',
  choices: [
    'DBMS を使うと、アプリケーションはデータファイルの物理的な形式を常に意識して読み書きする必要がある',
    '複数のユーザからの同時アクセスを制御し、障害が発生してもデータの一貫性を保って回復できるようにする',
    '同時実行制御はアプリケーションの責任であり、DBMS は行わない',
    '障害からの回復は OS の機能で行われ、DBMS には回復の機能はない',
    'DBMS は1人のユーザが1つのプログラムから使うことを前提としている'
  ],
  answer: 1,
  exp: 'DBMS はデータを一元管理し、アプリケーションからデータの物理的な格納方法を隠す（データ独立性）ことで、SQL などを通じてデータを扱えるようにします。\nさらに、複数のユーザやプログラムからの同時アクセスを制御してデータの整合性を保つ同時実行制御（PostgreSQL では MVCC とロック）、障害が発生してもコミット済みのデータを失わずに回復する障害回復（PostgreSQL では WAL）、アクセス権限の管理なども DBMS の重要な役割です。',
  refs: [
    ['アーキテクチャの基本概念', 'tutorial-arch.html'],
    ['MVCC入門', 'mvcc-intro.html']
  ]
},
{
  id: 'S1.2-010', level: 'silver', cat: 'S1.2', type: 'scenario',
  q: '次の表を第3正規形になるように分割した結果として、最も適切なものを1つ選びなさい。',
  code: '社員（社員番号, 氏名, 部署番号, 部署名）\n  主キー: 社員番号\n  部署名は部署番号によって決まる',
  choices: [
    '社員（社員番号, 氏名, 部署番号）と 部署（部署番号, 部署名）に分割する',
    '社員（社員番号, 氏名）と 部署（社員番号, 部署番号, 部署名）に分割する',
    '社員（社員番号, 部署名）と 部署（部署番号, 氏名）に分割する',
    '表は分割せず、部署名の列に一意制約を設定する',
    '社員（社員番号, 部署番号, 部署名）と 氏名（社員番号, 氏名）に分割する'
  ],
  answer: 0,
  exp: 'この表では、主キーの社員番号が部署番号を決め、その部署番号が部署名を決めています。このようにキー以外の属性を介してキーに従属する関係を推移的関数従属と呼び、第3正規形ではこれを排除します。\n部署番号 → 部署名 の関係を部署テーブルとして分離し、社員テーブルには外部キーとして部署番号を残すと、部署名の重複や更新時の不整合（更新時異状）を防げます。\n他の選択肢では推移的関数従属が残るか、社員と部署名などの対応関係が失われます。',
  evidence: [
    ['第3正規形への分割を実際に試した結果',
      '=# CREATE TABLE emp_all (emp_no int PRIMARY KEY, name text, dept_no int, dept_name text);\nCREATE TABLE\n=# INSERT INTO emp_all VALUES (1,\'Sato\',10,\'営業\'), (2,\'Suzuki\',10,\'営業\'), (3,\'Tanaka\',20,\'開発\');\nINSERT 0 3\n=# SELECT * FROM emp_all ORDER BY emp_no;\n emp_no |  name  | dept_no | dept_name\n--------+--------+---------+-----------\n      1 | Sato   |      10 | 営業\n      2 | Suzuki |      10 | 営業\n      3 | Tanaka |      20 | 開発\n(3 rows)\n\n（部署名は部署番号で決まる＝推移的関数従属。分割すると部署名は1行で管理できる）\n=# CREATE TABLE dept (dept_no int PRIMARY KEY, dept_name text); INSERT INTO dept VALUES (10,\'営業\'), (20,\'開発\');\nINSERT 0 2\n=# CREATE TABLE emp3 (emp_no int PRIMARY KEY, name text, dept_no int REFERENCES dept); INSERT INTO emp3 VALUES (1,\'Sato\',10), (2,\'Suzuki\',10), (3,\'Tanaka\',20);\nINSERT 0 3\n=# UPDATE dept SET dept_name = \'第1営業部\' WHERE dept_no = 10;\nUPDATE 1\n=# SELECT e.emp_no, e.name, d.dept_no, d.dept_name FROM emp3 e JOIN dept d USING (dept_no) ORDER BY 1;\n emp_no |  name  | dept_no | dept_name\n--------+--------+---------+-----------\n      1 | Sato   |      10 | 第1営業部\n      2 | Suzuki |      10 | 第1営業部\n      3 | Tanaka |      20 | 開発\n(3 rows)']
  ],
  refs: [
    ['OSS-DB Silver 出題範囲（S1.2）', 'https://oss-db.jp/outline/silver'],
    ['外部キー', 'ddl-constraints.html#DDL-CONSTRAINTS-FK']
  ]
},
{
  id: 'S1.2-011', level: 'silver', cat: 'S1.2', type: 'scenario',
  q: 'テーブル a の id 列に 1, 2, 3、テーブル b の id 列に 2, 3, 4 が格納されている。`SELECT id FROM a ??? SELECT id FROM b;` の結果が 1 だけになる演算子として、正しいものを1つ選びなさい。',
  choices: [
    'UNION',
    'UNION ALL',
    'INTERSECT',
    'EXCEPT',
    'CROSS JOIN'
  ],
  answer: 3,
  exp: 'SQL の集合演算は、関係代数の和・積・差に相当します。\n・UNION: 和集合（重複を除去）→ 1, 2, 3, 4\n・UNION ALL: 重複を除去しない和 → 1, 2, 3, 2, 3, 4\n・INTERSECT: 積集合（両方にある行）→ 2, 3\n・EXCEPT: 差集合（左にあって右にない行）→ 1\n集合演算を行う2つの問い合わせは、列の数と対応する列のデータ型が一致している必要があります。CROSS JOIN は集合演算ではなく、行の組み合わせ（直積）を返す結合です。',
  evidence: [
    ['集合演算と外部結合の結果',
      '=# SELECT id FROM a EXCEPT SELECT id FROM b;\n id\n----\n  1\n(1 row)\n\n=# SELECT id FROM a INTERSECT SELECT id FROM b;\n id\n----\n  3\n  2\n(2 rows)\n\n=# SELECT id FROM a UNION SELECT id FROM b ORDER BY id;\n id\n----\n  1\n  2\n  3\n  4\n(4 rows)\n\n=# SELECT * FROM a FULL OUTER JOIN b ON a.id = b.id ORDER BY a.id, b.id;\n id | id\n----+----\n  1 |\n  2 |  2\n  3 |  3\n    |  4\n(4 rows)']
  ],
  refs: [
    ['問い合わせの組み合わせ（UNION、INTERSECT、EXCEPT）', 'queries-union.html']
  ]
},
{
  id: 'S1.2-012', level: 'silver', cat: 'S1.2',
  q: 'リレーショナルモデルにおけるキーの用語の説明として、正しいものを1つ選びなさい。',
  choices: [
    '候補キーのうち1つを主キーに選び、残りは代替キーと呼ばれる',
    'スーパーキーは候補キーのうち、列数が最も少ないものを指す',
    '候補キーは1つの表に必ず1つしか存在しない',
    '外部キーは、同じ表の中でのみ参照関係を定義できる',
    '主キーには NULL を含む列を指定することができる'
  ],
  answer: 0,
  exp: '行を一意に識別できる列の組をスーパーキーといい、そこから余分な列を取り除いて「これ以上減らせない」状態にしたものが候補キーです。候補キーは1つの表に複数存在しえます。\nその中から設計者が1つ選んで主キーとし、選ばれなかった候補キーを代替キーと呼びます。\n主キーは行を一意に識別するため、重複と NULL を許しません。\n外部キーは他の表（同じ表を参照する自己参照も可能）の主キーや一意キーを参照し、参照整合性を保ちます。',
  refs: [
    ['制約', 'ddl-constraints.html'],
    ['一意性制約', 'ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS']
  ]
},
{
  id: 'S1.2-013', level: 'silver', cat: 'S1.2',
  q: '外部結合に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'LEFT OUTER JOIN は左側の表の行をすべて残し、対応する行がなければ右側の列は NULL になる',
    'LEFT OUTER JOIN は右側の表の行をすべて残し、対応する行がなければ左側の列は NULL になる',
    'FULL OUTER JOIN は両方の表に対応する行がある組み合わせだけを返す',
    'INNER JOIN は対応する行がない場合も、相手側を NULL として結果に含める',
    'OUTER キーワードは省略できないため、LEFT JOIN とは書けない'
  ],
  answer: 0,
  exp: 'LEFT OUTER JOIN は左側の表の行をすべて残し、結合条件に合う行が右側になければ右側の列を NULL で埋めます。RIGHT OUTER JOIN はその逆です。\nFULL OUTER JOIN は両側の行をすべて残し、対応がない側を NULL で埋めます。\nINNER JOIN は結合条件に合う組み合わせだけを返し、対応のない行は結果に含まれません。\nOUTER は省略でき、LEFT JOIN、RIGHT JOIN、FULL JOIN と書いても同じ意味です。逆に INNER は省略して JOIN とだけ書けます。',
  refs: [
    ['結合テーブル', 'queries-table-expressions.html#QUERIES-JOIN'],
    ['SELECT', 'sql-select.html']
  ]
},
{
  id: 'S1.2-014', level: 'silver', cat: 'S1.2',
  q: 'データベース設計における E-R モデルの説明として、正しいものを1つ選びなさい。',
  choices: [
    '実体（エンティティ）と関連（リレーションシップ）でデータ構造を表し、多対多の関連は中間の表に分解して実装する',
    '実体と関連でデータ構造を表し、多対多の関連もそのまま1つの表として実装できる',
    'E-R モデルは物理設計の手法であり、インデックスやテーブル空間の配置を決めるために使う',
    'E-R 図では、1対多の関連を表現することができない',
    'E-R モデルはリレーショナルデータベースでは使用できず、階層型データベース専用である'
  ],
  answer: 0,
  exp: 'E-R モデルは、実体（エンティティ）、その属性、実体間の関連（リレーションシップ）でデータ構造を記述する概念設計の手法です。関連には1対1、1対多、多対多といった多重度（カーディナリティ）があります。\nリレーショナルデータベースでは、1対多の関連は「多」側に外部キーを持たせて実装します。多対多の関連はそのままでは表現できないため、両方の主キーを持つ中間の表（連関実体）に分解します。\nインデックスや格納場所の決定は、その後の物理設計の段階で行います。',
  refs: [
    ['データ定義', 'ddl.html'],
    ['外部キー', 'ddl-constraints.html#DDL-CONSTRAINTS-FK']
  ]
},
{
  id: 'S1.2-015', level: 'silver', cat: 'S1.2',
  q: 'トランザクションの ACID 特性のうち、「トランザクション内の処理はすべて実行されるか、まったく実行されないかのいずれかである」という性質を1つ選びなさい。',
  choices: [
    '原子性（Atomicity）',
    '一貫性（Consistency）',
    '独立性（Isolation）',
    '永続性（Durability）',
    '可用性（Availability）'
  ],
  answer: 0,
  shuffle: false,
  exp: '原子性（Atomicity）は、トランザクションに含まれる処理が「すべて成功して反映される」か「まったく反映されない」かのどちらかになる性質です。途中で失敗すればロールバックされ、それまでの変更も取り消されます。\n一貫性（Consistency）は、トランザクションの前後でデータベースが制約を満たした正しい状態に保たれる性質です。\n独立性（Isolation）は、同時に実行される他のトランザクションの途中経過が見えない性質で、分離レベルで制御します。\n永続性（Durability）は、コミットした結果が障害後も失われない性質で、PostgreSQL では WAL によって実現されます。\n可用性は ACID には含まれません。',
  refs: [
    ['トランザクション', 'tutorial-transactions.html'],
    ['同時実行制御', 'mvcc.html']
  ]
},
{
  id: 'S1.2-016', level: 'silver', cat: 'S1.2',
  q: 'ビューを利用する利点の説明として、最も適切なものを1つ選びなさい。',
  choices: [
    '複雑な問い合わせに名前を付けて再利用でき、元の表の構造を隠して見せる範囲を限定できる',
    'ビューを作成すると問い合わせ結果が保存されるため、元の表を参照するより必ず高速になる',
    'ビューを経由すると、元の表に存在しない列のデータを新たに保存できる',
    'ビューには権限を設定できないため、アクセス制御には使えない',
    'ビューを作成すると、元の表は自動的に削除される'
  ],
  answer: 0,
  exp: 'ビューは問い合わせに名前を付けたもので、複雑な結合や集計を隠して簡単に再利用できます。特定の列や行だけを含むビューを作り、そのビューにだけ権限を与えれば、元の表を直接見せずにアクセスを限定できます。表の構造が変わってもビューの定義を直せば利用者側の SQL を変えずに済むという、論理データ独立性の利点もあります。\n通常のビューは問い合わせのたびに元の表を参照するため、結果が保存されるわけではありません。結果を保存したい場合はマテリアライズドビューを使います。\nビュー自体はデータを持たないため、元の表にない情報を保存することはできません。',
  refs: [
    ['ビュー', 'tutorial-views.html'],
    ['CREATE VIEW', 'sql-createview.html']
  ]
},
{
  id: 'S1.2-017', level: 'silver', cat: 'S1.2',
  q: '関係代数の演算と SQL の対応の説明として、正しいものを1つ選びなさい。',
  choices: [
    '選択（selection）は条件を満たす行を取り出す演算で、SQL の WHERE 句に相当する',
    '選択（selection）は必要な列だけを取り出す演算で、SQL の SELECT 句の列指定に相当する',
    '結合（join）は2つの表の行を縦に連結する演算で、SQL の UNION に相当する',
    '直積（直積演算）は SQL では表現できず、必ず結合条件が必要である',
    '差（difference）は SQL の INTERSECT に相当する'
  ],
  answer: 0,
  exp: '選択（selection）は表から条件を満たす行を取り出す演算で、SQL では WHERE 句に相当します。\n必要な列だけを取り出すのは射影（projection）で、SELECT 句の列指定に相当します。\n結合（join）は2つの表を共通の属性で結び付けて横に連結する演算で、JOIN に相当します。行を縦に連結する和（union）が UNION です。\n直積は SQL の CROSS JOIN（または結合条件のない FROM の複数指定）で表現できます。\n差（difference）は EXCEPT、共通部分（intersection）は INTERSECT に相当します。',
  refs: [
    ['問い合わせ', 'queries.html'],
    ['問い合わせの結合', 'queries-union.html']
  ]
},

);
