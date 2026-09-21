/*
 * Silver S3 開発/SQL（113問）
 * PostgreSQL 14 文書に基づくオリジナル問題。形式は DEVELOPMENT.md を参照。
 * tools/format.js で整形しています（node tools/format.js）。
 */
(window.PGQ_QUESTIONS = window.PGQ_QUESTIONS || []).push(

/* ---------------- S3.1 SQLコマンド（重要度 13 / 80問） ---------------- */
{
  id: 'S3.1-001', level: 'silver', cat: 'S3.1',
  q: '文字型に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'text 型に格納できる文字列は最大255文字である',
    'character(n) の列に n 文字未満の値を格納すると、残りは NULL で埋められる',
    'character varying(n) の列に n 文字を超える文字列を INSERT すると、エラーにならずに n 文字に切り詰められる',
    'character varying を長さ指定なしで宣言すると、任意の長さの文字列を格納できる',
    'character を長さ指定なしで宣言すると、text 型と同じになる'
  ],
  answer: 3,
  exp: 'character varying（varchar）を長さ指定なしで使うと任意長の文字列を格納でき、text と同様に振る舞います。\ncharacter(n) は n 文字に満たない部分を空白で埋めます。character を長さ指定なしで宣言すると character(1) になります。\nvarchar(n)・char(n) に n 文字を超える文字列を格納しようとするとエラーです（超過部分がすべて空白の場合のみ切り詰められます）。明示的なキャストの場合は切り詰められます。\ntext 型に255文字の制限はありません（1値の上限は約1GB）。',
  refs: [
    ['文字型', 'datatype-character.html']
  ]
},
{
  id: 'S3.1-002', level: 'silver', cat: 'S3.1',
  q: '宣言的パーティショニングに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'パーティションテーブル（親テーブル）自体にもデータが格納される',
    'パーティションキーの値を変更する UPDATE は常にエラーになる',
    'パーティション方式として指定できるのは範囲（RANGE）とリスト（LIST）の2種類のみである',
    'パーティションテーブルには主キーを定義できない',
    'デフォルトパーティションがない場合、どのパーティションにも該当しない行を INSERT するとエラーになる'
  ],
  answer: 4,
  exp: '宣言的パーティショニングでは、親のパーティションテーブル自体は実データを持たず、行はパーティション境界に従って各パーティションに振り分けられます。該当するパーティションがなくデフォルトパーティションもない場合、INSERT はエラーになります。\nパーティション方式は RANGE / LIST / HASH の3種類です（HASH は PostgreSQL 11 以降）。\nPostgreSQL 11 以降は、パーティションキーを変更する UPDATE で行が適切なパーティションに移動します。\n主キーや一意制約も、パーティションキーの列をすべて含めれば定義できます。',
  refs: [
    ['テーブルのパーティショニング', 'ddl-partitioning.html'],
    ['CREATE TABLE（PARTITION BY）', 'sql-createtable.html']
  ]
},
{
  id: 'S3.1-003', level: 'silver', cat: 'S3.1',
  q: '`json` 型と `jsonb` 型に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'jsonb 型は入力テキストをそのまま保存するため、空白やキーの順序が保持される',
    'jsonb 型では、同じオブジェクト内でキーが重複している場合、最後の値だけが保持される',
    'json 型は分解済みのバイナリ形式で格納されるため、処理が jsonb より高速である',
    'json 型の列には GIN インデックスを直接作成でき、@> 演算子による検索を高速化できる',
    'jsonb 型では、不正な JSON テキストも警告付きで格納できる'
  ],
  answer: 1,
  exp: 'json 型は入力テキストをそのまま保存するため、空白・キーの順序・重複キーが保持され、処理のたびに解析が必要です。\njsonb 型は分解されたバイナリ形式で格納されるため、入力はやや遅いものの処理は高速です。空白やキーの順序は保持されず、重複キーは最後の値だけが残ります。\nGIN インデックスや @> などの包含演算子は jsonb 型で利用できます。どちらの型も不正な JSON は受け付けずエラーになります。',
  refs: [
    ['JSON型', 'datatype-json.html'],
    ['jsonbのインデックス付け', 'datatype-json.html#JSON-INDEXING']
  ]
},
{
  id: 'S3.1-004', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL を実行したとき、最後の SELECT 文が返す行数として正しいものを1つ選びなさい。',
  code: 'CREATE TABLE dept (id integer PRIMARY KEY, dname text);\nCREATE TABLE emp (id integer, name text, dept_id integer);\nINSERT INTO dept VALUES (10, \'Sales\'), (30, \'Dev\');\nINSERT INTO emp VALUES (1, \'A\', 10), (2, \'B\', 20), (3, \'C\', NULL);\n\nSELECT e.name, d.dname\n  FROM emp e LEFT OUTER JOIN dept d ON e.dept_id = d.id;',
  choices: [
    '1行',
    '2行',
    '3行',
    '4行',
    '6行'
  ],
  answer: 2,
  shuffle: false,
  exp: 'LEFT OUTER JOIN は、結合条件に一致する行の組み合わせに加え、左側のテーブル（emp）で一致する行がなかった行も、右側の列を NULL にして出力します。\n・A: dept_id = 10 が一致 → A / Sales\n・B: dept_id = 20 に一致する部署がない → B / NULL\n・C: dept_id が NULL のため比較結果が真にならない → C / NULL\nしたがって結果は3行です。INNER JOIN なら A の1行、FULL OUTER JOIN なら右側だけにある Dev を加えた4行になります。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE dept (id integer PRIMARY KEY, dname text);\nCREATE TABLE\nCREATE TABLE emp (id integer, name text, dept_id integer);\nCREATE TABLE\nINSERT INTO dept VALUES (10, \'Sales\'), (30, \'Dev\');\nINSERT 0 2\nINSERT INTO emp VALUES (1, \'A\', 10), (2, \'B\', 20), (3, \'C\', NULL);\nINSERT 0 3\nSELECT e.name, d.dname\n  FROM emp e LEFT OUTER JOIN dept d ON e.dept_id = d.id;\n name | dname\n------+-------\n A    | Sales\n B    |\n C    |\n(3 rows)']
  ],
  refs: [
    ['結合テーブル', 'queries-table-expressions.html#QUERIES-JOIN'],
    ['外部結合（チュートリアル）', 'tutorial-join.html']
  ]
},
{
  id: 'S3.1-005', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: 'テーブル t の id 列に 1 から 10 までの整数が1行ずつ格納されている。次の SELECT 文が返す id の値として、正しいものを1つ選びなさい。',
  code: 'SELECT id FROM t ORDER BY id LIMIT 3 OFFSET 2;',
  choices: [
    '1, 2, 3',
    '2, 3, 4',
    '3, 4, 5',
    '4, 5, 6',
    '3, 4'
  ],
  answer: 2,
  shuffle: false,
  exp: 'OFFSET n は結果の先頭から n 行を読み飛ばし、LIMIT m は最大 m 行を返します。ORDER BY id で並べた 1〜10 から先頭の2行（1, 2）を読み飛ばし、続く3行（3, 4, 5）が返されます。\nORDER BY を指定しないと行の順序は保証されないため、LIMIT / OFFSET を使う場合は一意な順序になるように ORDER BY を指定するのが重要です。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'SELECT id FROM t ORDER BY id LIMIT 3 OFFSET 2;\n id\n----\n  3\n  4\n  5\n(3 rows)']
  ],
  refs: [
    ['LIMITとOFFSET', 'queries-limit.html']
  ]
},
{
  id: 'S3.1-006', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE sales (region text, amount integer);\nINSERT INTO sales VALUES\n  (\'east\', 100), (\'east\', 200), (\'west\', 50), (\'west\', 30), (\'north\', 300);\n\nSELECT region, sum(amount) FROM sales\n GROUP BY region\nHAVING sum(amount) >= 100\n ORDER BY region;',
  choices: [
    'east | 300 と north | 300 の2行',
    'east | 300、north | 300、west | 80 の3行',
    'north | 300 の1行',
    'east | 100、east | 200、north | 300 の3行',
    'HAVING 句で集約関数を使っているためエラーになる'
  ],
  answer: 0,
  exp: 'GROUP BY region によって region ごとにグループ化され、sum(amount) は east = 300、west = 80、north = 300 になります。HAVING 句はグループ化した後の結果に対する条件で、sum(amount) >= 100 を満たす east と north だけが残ります。ORDER BY region により east、north の順に並びます。\nWHERE 句はグループ化の前に各行に適用されるため集約関数を使えませんが、HAVING 句では集約関数を使えます。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE sales (region text, amount integer);\nCREATE TABLE\nINSERT INTO sales VALUES\n  (\'east\', 100), (\'east\', 200), (\'west\', 50), (\'west\', 30), (\'north\', 300);\nINSERT 0 5\nSELECT region, sum(amount) FROM sales\n GROUP BY region\nHAVING sum(amount) >= 100\n ORDER BY region;\n region | sum\n--------+-----\n east   | 300\n north  | 300\n(2 rows)']
  ],
  refs: [
    ['GROUP BYとHAVING句', 'queries-table-expressions.html#QUERIES-GROUP'],
    ['集約関数（チュートリアル）', 'tutorial-agg.html']
  ]
},
{
  id: 'S3.1-007', level: 'silver', cat: 'S3.1',
  q: 'NULL の扱いに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'WHERE col = NULL と書くと、col が NULL の行を取り出せる',
    'NULL = NULL の比較結果は真（true）である',
    '文字列型の列では、空文字列 \'\' と NULL は同じものとして扱われる',
    'col が NULL かどうかを判定するには IS NULL（IS NOT NULL）を使う',
    'count(col) は、col が NULL の行も含めて数える'
  ],
  answer: 3,
  exp: 'NULL は「不明な値」を表し、通常の比較演算子で NULL と比較した結果は真でも偽でもなく NULL になります（NULL = NULL も NULL）。そのため WHERE col = NULL では行が取り出せず、IS NULL / IS NOT NULL を使います。NULL を等しいものとして比較したい場合は IS NOT DISTINCT FROM を使えます。\nPostgreSQL では空文字列と NULL は別の値です。\ncount(*) は全行を数えますが、count(col) は col が NULL の行を数えません。',
  refs: [
    ['比較関数および演算子', 'functions-comparison.html'],
    ['集約関数', 'functions-aggregate.html']
  ]
},
{
  id: 'S3.1-008', level: 'silver', cat: 'S3.1',
  q: 'マテリアライズドビューに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '元のテーブルが更新されると、マテリアライズドビューの内容も自動的に最新の状態に更新される',
    '問い合わせの結果を実体として保持し、REFRESH MATERIALIZED VIEW を実行して内容を更新する',
    '通常のビュー（CREATE VIEW）も、問い合わせの結果をディスクに保存している',
    'マテリアライズドビューにはインデックスを作成できない',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY は、一意インデックスがなくても利用できる'
  ],
  answer: 1,
  exp: 'マテリアライズドビューは CREATE MATERIALIZED VIEW で作成し、定義した問い合わせの結果をテーブルのように保持します。元のテーブルを更新しても自動では反映されず、REFRESH MATERIALIZED VIEW で内容を作り直します。\n通常のビューは問い合わせの定義だけを持ち、参照のたびに問い合わせを実行します。\nマテリアライズドビューにはインデックスを作成できます。REFRESH ... CONCURRENTLY を使うと参照をブロックせずに更新できますが、マテリアライズドビューに列名だけを使った（WHERE 句のない）一意インデックスが必要です。',
  refs: [
    ['マテリアライズドビュー', 'rules-materializedviews.html'],
    ['REFRESH MATERIALIZED VIEW', 'sql-refreshmaterializedview.html']
  ]
},
{
  id: 'S3.1-009', level: 'silver', cat: 'S3.1',
  q: '`serial` 型とシーケンスに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'serial は、integer 型の列とシーケンスを作成し、列のデフォルト値に nextval() を設定するための省略記法である',
    'serial 型の列の値は、欠番のない連続した値になることが保証されている',
    'nextval() で取得したシーケンスの値は、トランザクションをロールバックすると元に戻る',
    'serial は通常のデータ型と同じく、他のデータ型から serial 型へキャストできる',
    'PostgreSQL 14 では、GENERATED ALWAYS AS IDENTITY による識別列は使用できない'
  ],
  answer: 0,
  exp: 'serial（smallserial / bigserial）は真のデータ型ではなく、列を integer（smallint / bigint）型で作成し、シーケンスを作成して列のデフォルト値を nextval(\'シーケンス名\') に設定する省略記法です。\nnextval() は複数のトランザクションが同時に値を取得できるように、ロールバックされても値を戻しません。そのため、INSERT の失敗やロールバックによって欠番が発生することがあります。\nPostgreSQL 10 以降は、SQL 標準に準拠した識別列（GENERATED { ALWAYS | BY DEFAULT } AS IDENTITY）も利用できます。',
  refs: [
    ['連番型', 'datatype-numeric.html#DATATYPE-SERIAL'],
    ['シーケンス操作関数', 'functions-sequence.html'],
    ['CREATE TABLE（GENERATED AS IDENTITY）', 'sql-createtable.html']
  ]
},
{
  id: 'S3.1-010', level: 'silver', cat: 'S3.1',
  q: '数値データ型に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'numeric 型は指定した精度で値を正確に格納できるため、金額など誤差が許されない計算に適している',
    'real 型は numeric 型よりも正確に小数を表現できる',
    'integer 型の格納サイズは 8 バイトである',
    'smallint 型の範囲は、およそ -21億から +21億である',
    'double precision 型は、0.1 のような 10 進数の小数を常に誤差なく表現できる'
  ],
  answer: 0,
  exp: 'numeric（decimal）型は非常に大きな桁数を扱え、指定した精度で正確に値を格納・計算できるため、金額など正確さが必要な用途に向いています。その代わり、整数型や浮動小数点型に比べて計算は遅くなります。\nreal（4バイト）と double precision（8バイト）は不正確な可変精度の浮動小数点型で、0.1 のような値を正確には表現できません。\n整数型のサイズと範囲は、smallint が 2バイト（-32768〜+32767）、integer が 4バイト（約 ±21億）、bigint が 8バイトです。',
  refs: [
    ['数値データ型', 'datatype-numeric.html']
  ]
},
{
  id: 'S3.1-011', level: 'silver', cat: 'S3.1',
  q: '日付/時刻データ型に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'timestamp with time zone 型は、入力時に指定したタイムゾーン名も値として保持する',
    'timestamp with time zone 型の値は内部的に UTC で格納され、表示時にはセッションの TimeZone 設定に従って変換される',
    'timestamp（without time zone）型は日付のみを格納し、時刻は格納しない',
    'date 型は、日付に加えて時刻も格納する',
    'interval 型は、ある特定の日時（時点）を表すデータ型である'
  ],
  answer: 1,
  exp: 'timestamp with time zone（timestamptz）型では、入力値はタイムゾーンを考慮して UTC に変換されて格納され、元のタイムゾーン情報は保持されません。出力時には現在の TimeZone パラメータのタイムゾーンに変換して表示されます。\ntimestamp（without time zone）は日付と時刻を持ち、タイムゾーンは考慮しません。date は日付のみ、time は時刻のみを格納します。\ninterval は「3 days」「2 hours」のような時間間隔を表す型です。',
  refs: [
    ['日付/時刻データ型', 'datatype-datetime.html'],
    ['タイムゾーン', 'datatype-datetime.html#DATATYPE-TIMEZONES']
  ]
},
{
  id: 'S3.1-012', level: 'silver', cat: 'S3.1',
  q: 'PostgreSQL のトリガーに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'トリガーで実行する SQL 文を、CREATE TRIGGER 文の中に直接記述して定義する',
    '行単位（FOR EACH ROW）のトリガーのみ定義でき、文単位のトリガーは定義できない',
    'BEFORE の行単位トリガー関数が返す値は無視され、処理には影響しない',
    'ビューにはトリガーを定義できないため、ビューの更新には RULE を使う必要がある',
    'RETURNS trigger の関数を作成し、CREATE TRIGGER でテーブルに関連付ける'
  ],
  answer: 4,
  exp: 'PostgreSQL のトリガーは、まず RETURNS trigger のトリガー関数を PL/pgSQL などで作成し、CREATE TRIGGER で対象テーブル、イベント（INSERT / UPDATE / DELETE / TRUNCATE）、タイミング（BEFORE / AFTER / INSTEAD OF）、行単位（FOR EACH ROW）か文単位（FOR EACH STATEMENT）かを指定して関連付けます。\nBEFORE の行単位トリガー関数が NULL を返すとその行に対する操作はスキップされ、変更した行を返すとその値で処理されます。\nビューには INSTEAD OF トリガーを定義して、ビューに対する更新を実現できます。',
  refs: [
    ['トリガ定義の概要', 'trigger-definition.html'],
    ['CREATE TRIGGER', 'sql-createtrigger.html'],
    ['PL/pgSQLのトリガ関数', 'plpgsql-trigger.html']
  ]
},
{
  id: 'S3.1-013', level: 'silver', cat: 'S3.1',
  q: 'PostgreSQL のプロシージャ（CREATE PROCEDURE）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'プロシージャは SELECT 文の選択リストの中で呼び出す',
    'プロシージャは必ず戻り値を返す必要がある',
    'CALL で実行し、PL/pgSQL のプロシージャ内では COMMIT や ROLLBACK を実行できる',
    'プロシージャは PL/pgSQL でしか記述できない',
    'プロシージャは関数（CREATE FUNCTION）と完全に同じもので、どちらでもトランザクション制御ができる'
  ],
  answer: 2,
  exp: 'プロシージャは PostgreSQL 11 で追加されたオブジェクトで、CALL 文で実行します。関数と異なり戻り値を返す必要はなく（OUT / INOUT 引数で値を返すことはできます）、問い合わせの中で呼び出すことはできません。\n関数の中ではトランザクションを制御できませんが、プロシージャでは PL/pgSQL などの手続き言語で COMMIT や ROLLBACK を実行できます（CALL を明示的なトランザクションブロック内で実行した場合を除く）。\nプロシージャは SQL や C などの言語でも作成できます。',
  refs: [
    ['CREATE PROCEDURE', 'sql-createprocedure.html'],
    ['CALL', 'sql-call.html'],
    ['PL/pgSQLのトランザクション制御', 'plpgsql-transactions.html']
  ]
},
{
  id: 'S3.1-014', level: 'silver', cat: 'S3.1',
  q: 'スキーマに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '1つのデータベース内で、異なるスキーマに同じ名前のテーブルを作成することはできない',
    'スキーマは複数のデータベースで共有され、他のデータベースのスキーマ内のテーブルも直接参照できる',
    'スキーマ修飾のない名前は search_path の順に検索され、既定値は "$user", public である',
    'public スキーマは削除できない',
    'CREATE SCHEMA を実行できるのはスーパーユーザだけである'
  ],
  answer: 2,
  exp: 'スキーマはデータベース内の名前空間で、異なるスキーマには同じ名前のオブジェクトを作成できます。スキーマ名を省略したテーブル名は search_path の順に検索され、既定値 "$user", public ではまずユーザ名と同じ名前のスキーマ（あれば）、次に public が検索されます。\nスキーマはデータベースごとに独立しており、1つの接続から他のデータベースのオブジェクトは直接参照できません。\npublic スキーマも通常のスキーマと同様に削除できます。CREATE SCHEMA には、データベースに対する CREATE 権限があれば実行できます。',
  refs: [
    ['スキーマ', 'ddl-schemas.html'],
    ['スキーマ検索パス', 'ddl-schemas.html#DDL-SCHEMAS-PATH']
  ]
},
{
  id: 'S3.1-015', level: 'silver', cat: 'S3.1',
  q: 'インデックスに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '外部キー制約を定義すると、参照元の列にインデックスが自動的に作成される',
    'CREATE INDEX（CONCURRENTLY なし）の実行中も、対象テーブルへの INSERT や UPDATE はブロックされない',
    'インデックスの種類を指定しない場合は、ハッシュインデックスが作成される',
    'テーブルに主キー制約や一意制約を定義すると、一意インデックスが自動的に作成される',
    'インデックスを作成すると、そのテーブルの統計情報は不要になる'
  ],
  answer: 3,
  exp: '主キー制約や一意制約を定義すると、その制約を実現するための一意インデックスが自動的に作成されます。一方、外部キー制約では参照元の列にインデックスは自動作成されないため、必要に応じて作成します。\nインデックスの種類を指定しない CREATE INDEX では B-tree インデックスが作成されます。\n通常の CREATE INDEX は SHARE ロックを取得するため、テーブルの読み取りはできますが、書き込みは作成完了までブロックされます。書き込みを止めずに作成するには CREATE INDEX CONCURRENTLY を使います。\nインデックスを使うかどうかの判断にも統計情報が使われます。',
  refs: [
    ['一意インデックス', 'indexes-unique.html'],
    ['CREATE INDEX', 'sql-createindex.html'],
    ['インデックス種類', 'indexes-types.html']
  ]
},
{
  id: 'S3.1-016', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL を実行した後の SELECT 文の結果として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE stock (item text PRIMARY KEY, qty integer);\nINSERT INTO stock VALUES (\'apple\', 10);\n\nINSERT INTO stock VALUES (\'apple\', 5), (\'banana\', 3)\n  ON CONFLICT (item) DO UPDATE SET qty = stock.qty + EXCLUDED.qty;\n\nSELECT item, qty FROM stock ORDER BY item;',
  choices: [
    'apple | 15、banana | 3',
    'apple | 5、banana | 3',
    'apple | 10、banana | 3',
    'apple | 10 のみ（一意制約違反でエラーになる）',
    'apple | 10、apple | 5、banana | 3'
  ],
  answer: 0,
  exp: 'INSERT ... ON CONFLICT は、一意制約や排他制約に違反する行があった場合の動作を指定する構文（いわゆる UPSERT）です。DO UPDATE を指定すると、競合した既存の行を更新します。EXCLUDED は挿入しようとして競合した行を表します。\nこの例では apple が主キーと競合するため、既存の qty 10 に EXCLUDED.qty の 5 を加えて 15 に更新され、競合しない banana は通常どおり挿入されます。\nDO NOTHING を指定すると、競合した行は何もせずに読み飛ばされます。ON CONFLICT は PostgreSQL 9.5 で導入されました。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE stock (item text PRIMARY KEY, qty integer);\nCREATE TABLE\nINSERT INTO stock VALUES (\'apple\', 10);\nINSERT 0 1\nINSERT INTO stock VALUES (\'apple\', 5), (\'banana\', 3)\n  ON CONFLICT (item) DO UPDATE SET qty = stock.qty + EXCLUDED.qty;\nINSERT 0 2\nSELECT item, qty FROM stock ORDER BY item;\n  item  | qty\n--------+-----\n apple  |  15\n banana |   3\n(2 rows)']
  ],
  refs: [
    ['INSERT（ON CONFLICT 句）', 'sql-insert.html#SQL-ON-CONFLICT']
  ]
},
{
  id: 'S3.1-017', level: 'silver', cat: 'S3.1',
  q: '`RETURNING` 句に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'RETURNING 句は INSERT 文でのみ使用できる',
    'DELETE 文では、削除された行の値を RETURNING 句で返すことはできない',
    'serial 列に採番された値を取得するには、必ず INSERT の後に別の SELECT 文を実行する必要がある',
    'INSERT、UPDATE、DELETE に RETURNING 句を付けると、処理した行の値を結果として返せる',
    'RETURNING 句が返すのは、BEFORE トリガーで変更される前の値である'
  ],
  answer: 3,
  exp: 'INSERT、UPDATE、DELETE の各コマンドには RETURNING 句を付けられ、処理対象となった行の列の値や式の結果を、SELECT のように返すことができます。例えば INSERT INTO t (name) VALUES (\'x\') RETURNING id; で、デフォルト値として採番された id を1回の文で取得できます。\nDELETE では削除された行の内容、UPDATE では更新後の行の内容が返されます。返される値は BEFORE トリガーによる変更を反映した、実際に格納された値です。',
  refs: [
    ['変更された行からのデータの返却', 'dml-returning.html'],
    ['INSERT', 'sql-insert.html']
  ]
},
{
  id: 'S3.1-018', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE t1 (id integer);\nCREATE TABLE t2 (id integer);\nINSERT INTO t1 VALUES (1), (2), (3);\nINSERT INTO t2 VALUES (2), (NULL);\n\nSELECT id FROM t1 WHERE id NOT IN (SELECT id FROM t2);',
  choices: [
    '1 と 3 の2行が返される',
    '1 だけが返される',
    '行は返されない',
    '1、2、3 の3行が返される',
    'サブクエリの結果に NULL が含まれるためエラーになる'
  ],
  answer: 2,
  exp: 'x NOT IN (サブクエリ) は、サブクエリのすべての値について x <> 値 が真の場合に真になります。サブクエリの結果に NULL が含まれると、例えば 1 について 1 <> 2 は真ですが 1 <> NULL は NULL になるため、全体も NULL となり、WHERE 句を満たしません。2 は 2 <> 2 が偽なので除外されます。そのため、行は1つも返されません。\nNULL を含みうる列で「存在しない行」を求める場合は、WHERE NOT EXISTS (SELECT 1 FROM t2 WHERE t2.id = t1.id) を使うと、1 と 3 が返されます。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE t1 (id integer);\nCREATE TABLE\nCREATE TABLE t2 (id integer);\nCREATE TABLE\nINSERT INTO t1 VALUES (1), (2), (3);\nINSERT 0 3\nINSERT INTO t2 VALUES (2), (NULL);\nINSERT 0 2\nSELECT id FROM t1 WHERE id NOT IN (SELECT id FROM t2);\n id\n----\n(0 rows)']
  ],
  refs: [
    ['サブクエリ式（NOT IN）', 'functions-subquery.html#FUNCTIONS-SUBQUERY-NOTIN'],
    ['サブクエリ式（EXISTS）', 'functions-subquery.html#FUNCTIONS-SUBQUERY-EXISTS']
  ]
},
{
  id: 'S3.1-019', level: 'silver', cat: 'S3.1',
  q: '次の SELECT 文が返す行数として、正しいものを1つ選びなさい。',
  code: 'SELECT 1 UNION SELECT 1 UNION ALL SELECT 1;',
  choices: [
    '0行',
    '1行',
    '2行',
    '3行',
    'UNION と UNION ALL を混在させているためエラーになる'
  ],
  answer: 2,
  shuffle: false,
  exp: 'UNION は2つの問い合わせの結果を結合して重複行を取り除き、UNION ALL は重複を取り除かずにすべての行を返します。\n複数の UNION / UNION ALL は、括弧がなければ左から順に評価されます。この例は (SELECT 1 UNION SELECT 1) UNION ALL SELECT 1 と同じ意味で、まず UNION で 1 の1行になり、そこに UNION ALL で 1 が追加されるため、結果は2行です。\nなお INTERSECT は UNION / EXCEPT より優先して評価されます。',
  refs: [
    ['問い合わせの組み合わせ（UNION、INTERSECT、EXCEPT）', 'queries-union.html']
  ]
},
{
  id: 'S3.1-020', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL を実行したとき、name が B の行の rank 列の値として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE scores (name text, score integer);\nINSERT INTO scores VALUES (\'A\', 90), (\'B\', 80), (\'C\', 90), (\'D\', 70);\n\nSELECT name, rank() OVER (ORDER BY score DESC) AS rank FROM scores;',
  choices: [
    '1',
    '2',
    '3',
    '4',
    'NULL'
  ],
  answer: 2,
  shuffle: false,
  exp: 'rank() はウィンドウ関数の一つで、ORDER BY の順序における順位を返します。同じ値の行には同じ順位が付き、その次の順位は同順位の行数だけ飛ばされます。\nscore の降順では A と C が 90 で同率1位、B（80）は3番目の行なので rank は 3、D（70）は 4 になります。\n同順位の次の順位を飛ばさない dense_rank() では B は 2 に、同順位を区別せず連番を振る row_number() では 3 になります。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE scores (name text, score integer);\nCREATE TABLE\nINSERT INTO scores VALUES (\'A\', 90), (\'B\', 80), (\'C\', 90), (\'D\', 70);\nINSERT 0 4\nSELECT name, rank() OVER (ORDER BY score DESC) AS rank FROM scores;\n name | rank\n------+------\n A    |    1\n C    |    1\n B    |    3\n D    |    4\n(4 rows)']
  ],
  refs: [
    ['ウィンドウ関数', 'functions-window.html'],
    ['ウィンドウ関数（チュートリアル）', 'tutorial-window.html']
  ]
},
{
  id: 'S3.1-021', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SELECT 文の説明として、正しいものを1つ選びなさい。',
  code: 'SELECT DISTINCT ON (dept) dept, name, salary\n  FROM emp\n ORDER BY dept, salary DESC;',
  choices: [
    '部署（dept）ごとに、給与（salary）が最も高い行を1行ずつ返す',
    '部署の重複を取り除いたうえで、全従業員の行を返す',
    '給与の値が重複する行を取り除いて返す',
    '部署ごとに、給与が最も低い行を1行ずつ返す',
    'DISTINCT ON を使う場合は ORDER BY を指定できないため、エラーになる'
  ],
  answer: 0,
  exp: 'DISTINCT ON (式) は PostgreSQL 独自の構文で、指定した式の値が同じ行のグループごとに、最初の1行だけを返します。どの行が「最初」になるかは ORDER BY で決まり、ORDER BY の先頭は DISTINCT ON の式と一致させる必要があります。\nこの例では dept ごとに salary の降順で並べた最初の行、つまり部署ごとに給与が最も高い従業員の行が返されます。\n通常の DISTINCT は、選択したすべての列の組み合わせが重複する行を取り除きます。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'SELECT DISTINCT ON (dept) dept, name, salary\n  FROM emp\n ORDER BY dept, salary DESC;\n dept | name | salary\n------+------+--------\n dev  | Sato |    500\n ops  | Ito  |    420\n(2 rows)\n\nSELECT * FROM emp ORDER BY dept, salary DESC;\n dept |  name  | salary\n------+--------+--------\n dev  | Sato   |    500\n dev  | Suzuki |    450\n ops  | Ito    |    420\n ops  | Tanaka |    400\n(4 rows)']
  ],
  refs: [
    ['SELECT（DISTINCT 句）', 'sql-select.html#SQL-DISTINCT'],
    ['DISTINCT', 'queries-select-lists.html#QUERIES-DISTINCT']
  ]
},
{
  id: 'S3.1-022', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '`CREATE TABLE products (id integer, price integer CHECK (price > 0));` で作成したテーブルに、`INSERT INTO products VALUES (1, NULL);` を実行した場合の結果として、正しいものを1つ選びなさい。',
  choices: [
    'CHECK 制約違反でエラーになる',
    '行は正常に挿入される',
    'price には 0 が格納される',
    '警告が出力され、行は挿入されずにスキップされる',
    'CHECK 制約が自動的に無効化されてから挿入される'
  ],
  answer: 1,
  exp: '検査制約（CHECK）は、式の評価結果が真または NULL の場合に満たされたものとみなされます。price が NULL の場合、price > 0 は NULL になるため制約違反にはならず、行は正常に挿入されます。\nNULL を許可したくない場合は、NOT NULL 制約を併せて指定します（price integer NOT NULL CHECK (price > 0)）。\nこの NULL の扱いは、一意制約（NULL 同士は重複とみなされない）とあわせて押さえておきたいポイントです。',
  evidence: [
    ['CHECK 制約に対する INSERT の結果',
      '=# CREATE TABLE products (id integer, price integer CHECK (price > 0));\nCREATE TABLE\n=# INSERT INTO products VALUES (1, 100);\nINSERT 0 1\n=# INSERT INTO products VALUES (2, 0);\nERROR:  new row for relation "products" violates check constraint "products_price_check"\nDETAIL:  Failing row contains (2, 0).\n=# INSERT INTO products VALUES (3, NULL);\nINSERT 0 1\n=# SELECT * FROM products ORDER BY id;\n id | price\n----+-------\n  1 |   100\n  3 |\n(2 rows)']
  ],
  refs: [
    ['検査制約', 'ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS'],
    ['制約（非NULL制約）', 'ddl-constraints.html']
  ]
},
{
  id: 'S3.1-023', level: 'silver', cat: 'S3.1',
  q: '既にデータが格納されているテーブルに対する `ALTER TABLE ... ADD COLUMN` の説明として、正しいものを1つ選びなさい。',
  choices: [
    '既存の行があるテーブルには、列を追加できない',
    'DEFAULT を指定しなくても、NOT NULL を付けた列を追加できる',
    '追加した列は、テーブルの先頭の列として配置される',
    '既存の行の新しい列には、DEFAULT で指定した値（指定がなければ NULL）が入る',
    'DROP COLUMN で列を削除すると、その場でテーブルのファイルサイズが縮小される'
  ],
  answer: 3,
  exp: 'ALTER TABLE ... ADD COLUMN で追加した列は、テーブルの最後の列になり、既存の行にはデフォルト値（DEFAULT を省略した場合は NULL）が設定されます。PostgreSQL 11 以降は、揮発性でないデフォルト値ならテーブル全体を書き換えずに高速に追加できます。\nデフォルト値のない NOT NULL 列は、既存の行が NULL になってしまうため、行があるテーブルには追加できません。\nDROP COLUMN は列を見えなくするだけで、ディスク領域は以後の更新や VACUUM FULL などでテーブルが書き換えられるまで解放されません。',
  refs: [
    ['列の追加', 'ddl-alter.html#DDL-ALTER-ADDING-A-COLUMN'],
    ['ALTER TABLE', 'sql-altertable.html']
  ]
},
{
  id: 'S3.1-024', level: 'silver', cat: 'S3.1',
  q: '外部キー制約で、参照先（親テーブル）の行を削除したときに、それを参照している子テーブルの行も自動的に削除されるようにする指定として、正しいものを1つ選びなさい。',
  choices: [
    'ON DELETE CASCADE',
    'ON DELETE SET NULL',
    'ON DELETE RESTRICT',
    'ON DELETE NO ACTION',
    'ON DELETE SET DEFAULT'
  ],
  answer: 0,
  exp: '外部キー制約の ON DELETE で、参照されている行が削除されたときの動作を指定します。\n・CASCADE: 参照している行も削除する\n・SET NULL / SET DEFAULT: 参照している行の外部キー列を NULL / デフォルト値にする\n・RESTRICT: 参照している行があれば削除を禁止する（即座に検査）\n・NO ACTION: 参照している行があればエラーにする（既定。制約の遅延が可能）\n参照先の値が更新されたときの動作も、ON UPDATE で同様に指定できます。',
  refs: [
    ['外部キー', 'ddl-constraints.html#DDL-CONSTRAINTS-FK'],
    ['CREATE TABLE', 'sql-createtable.html']
  ]
},
{
  id: 'S3.1-025', level: 'silver', cat: 'S3.1',
  q: 'ビュー（CREATE VIEW）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ビューは常に読み取り専用であり、ビューに対する INSERT や UPDATE はできない',
    'ビューを作成すると、元のテーブルのデータがビュー用に複製される',
    'CREATE OR REPLACE VIEW を使えば、既存のビューの列を自由に削除したり型を変更したりできる',
    'ビューにインデックスを作成して、ビューの検索を高速化できる',
    '1つのテーブルだけを参照し、集約などを含まない単純なビューは、自動的に更新可能なビューになる'
  ],
  answer: 4,
  exp: 'ビューは問い合わせに名前を付けたもので、データは複製されず、参照するたびに元の問い合わせが実行されます。インデックスはビューではなく元のテーブルに作成します。\nFROM 句にテーブル（または更新可能なビュー）が1つだけで、GROUP BY、DISTINCT、集約関数、ウィンドウ関数、集合演算などを含まない単純なビューは、自動更新可能なビューとなり、INSERT、UPDATE、DELETE を実行できます。それ以外のビューでも、INSTEAD OF トリガーやルールで更新を実装できます。\nCREATE OR REPLACE VIEW では、既存の列と同じ名前・型の列を同じ順序で持つ必要があり、追加できるのは末尾の列だけです。',
  refs: [
    ['CREATE VIEW（更新可能なビュー）', 'sql-createview.html'],
    ['ビュー（チュートリアル）', 'tutorial-views.html']
  ]
},
{
  id: 'S3.1-026', level: 'silver', cat: 'S3.1',
  q: 'テーブルスペースに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'CREATE TABLESPACE で指定したディレクトリが存在しない場合は、自動的に作成される',
    'テーブルスペースは1つのデータベースの中で定義され、他のデータベースからは利用できない',
    'CREATE TABLESPACE で指定するディレクトリは空で、PostgreSQL を実行する OS ユーザが所有している必要がある',
    '既定のテーブルスペース pg_default は、不要であれば削除できる',
    'テーブルスペースのディレクトリをコピーすれば、そのまま別のデータベースクラスタで利用できる'
  ],
  answer: 2,
  exp: 'テーブルスペースは、データベースオブジェクトを格納するファイルシステム上の場所を定義するもので、CREATE TABLESPACE 名前 LOCATION \'ディレクトリ\' で作成します。指定するディレクトリは事前に作成しておく必要があり、空で、PostgreSQL の OS ユーザが所有している必要があります。\nテーブルスペースはデータベースクラスタ全体で共有されるオブジェクトで、どのデータベースからも CREATE TABLE ... TABLESPACE などで利用できます。initdb 時に pg_default と pg_global が作成され、これらは削除できません。\nテーブルスペースのファイルはデータディレクトリの情報（WAL やカタログ）がないと利用できないため、別のクラスタに移して使うことはできません。',
  refs: [
    ['テーブル空間', 'manage-ag-tablespaces.html'],
    ['CREATE TABLESPACE', 'sql-createtablespace.html']
  ]
},
{
  id: 'S3.1-027', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の PL/pgSQL 関数を定義した後、`SELECT add_tax(99);` を実行した結果として、正しいものを1つ選びなさい。',
  code: 'CREATE FUNCTION add_tax(price integer) RETURNS integer AS $$\nBEGIN\n  RETURN price * 110 / 100;\nEND;\n$$ LANGUAGE plpgsql;',
  choices: [
    '99',
    '108',
    '108.9',
    '109',
    '戻り値の型と計算結果の型が一致しないためエラーになる'
  ],
  answer: 1,
  shuffle: false,
  exp: 'integer 同士の演算結果は integer になり、整数の除算（/）では小数点以下が切り捨てられます。99 * 110 = 10890、10890 / 100 = 108（108.9 の小数部を切り捨て）となり、戻り値は 108 です。\n四捨五入したい場合は、round(price * 1.1) のように numeric 型で計算してから丸めます（1.1 は numeric 型の定数です）。\nPL/pgSQL の関数は、DECLARE（任意）、BEGIN、END で囲んだブロックで本体を記述し、$$ で囲んだ文字列として定義します。',
  evidence: [
    ['関数の実行結果と、整数どうしの計算',
      '=# SELECT add_tax(99), add_tax(100), add_tax(1);\n add_tax | add_tax | add_tax\n---------+---------+---------\n     108 |     110 |       1\n(1 row)\n\n=# SELECT 99 * 110 AS step1, 99 * 110 / 100 AS step2, (99 * 110.0 / 100) AS numeric_result;\n step1 | step2 |    numeric_result\n-------+-------+----------------------\n 10890 |   108 | 108.9000000000000000\n(1 row)']
  ],
  refs: [
    ['PL/pgSQLの構造', 'plpgsql-structure.html'],
    ['数学関数と演算子', 'functions-math.html']
  ]
},
{
  id: 'S3.1-028', level: 'silver', cat: 'S3.1',
  q: 'シーケンス操作関数に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'currval() は、すべてのセッションで最後に採番された値を返す',
    'setval() はシーケンスの現在値を返すだけで、値を変更することはできない',
    '現在のセッションでそのシーケンスの nextval() を一度も呼び出していない場合、currval() はエラーになる',
    'nextval() で採番した値は、トランザクションをロールバックすると再利用される',
    'lastval() は、シーケンスに関係なく常に NULL を返す'
  ],
  answer: 2,
  exp: 'シーケンス操作関数の概要は次のとおりです。\n・nextval(\'seq\'): シーケンスを進めて新しい値を返す。ロールバックされても戻らない\n・currval(\'seq\'): 現在のセッションでそのシーケンスに対して最後に nextval() が返した値。セッション内で nextval() を呼んでいなければエラー\n・lastval(): 現在のセッションで最後に使われた nextval() の値（シーケンスを問わない）\n・setval(\'seq\', 値): シーケンスの現在値を設定する\ncurrval() はセッション単位の値なので、他のセッションの採番の影響を受けません。',
  refs: [
    ['シーケンス操作関数', 'functions-sequence.html']
  ]
},
{
  id: 'S3.1-029', level: 'silver', cat: 'S3.1',
  q: 'jsonb 型の演算子 `->` と `->>` の違いとして、正しいものを1つ選びなさい。',
  choices: [
    '-> は要素を jsonb（json）として取り出し、->> は text として取り出す',
    '->> はネストしたオブジェクトには使えず、-> はネストしたオブジェクトにのみ使える',
    '-> は配列の要素だけを取り出す演算子で、オブジェクトのキーは指定できない',
    '->> はキーが存在するかどうかを真偽値で返す',
    '-> と ->> は同じ意味で、どちらを使っても結果の型は text になる'
  ],
  answer: 0,
  exp: 'json / jsonb の -> 演算子は、オブジェクトのキー（または配列の添字）を指定して要素を json / jsonb 型のまま取り出し、->> 演算子は text 型で取り出します。例えば \'{"a": {"b": 1}}\'::jsonb -> \'a\' ->> \'b\' は text の \'1\' になります。\nパスを配列で指定する #> / #>>、キーの存在を確認する ?、包含を判定する @> などの演算子もあります。PostgreSQL 12 以降は、jsonb_path_query などの SQL/JSON パス言語も使えます。',
  refs: [
    ['JSON関数と演算子', 'functions-json.html'],
    ['JSON型', 'datatype-json.html']
  ]
},
{
  id: 'S3.1-030', level: 'silver', cat: 'S3.1',
  q: '`ALTER TABLE ... ATTACH PARTITION` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '親テーブルと列の構成が異なるテーブルでも、パーティションとして追加できる',
    'ATTACH PARTITION を実行すると、既存のテーブルのデータは親テーブルに移動される',
    '既存のテーブルを、境界値を指定してパーティションテーブルのパーティションとして追加できる',
    'ハッシュパーティションには ATTACH PARTITION を使用できない',
    'DETACH PARTITION で切り離したパーティションは、自動的に削除される'
  ],
  answer: 2,
  exp: 'ALTER TABLE 親テーブル ATTACH PARTITION テーブル FOR VALUES ... で、既存のテーブルを指定した境界値のパーティションとして追加できます。追加するテーブルは親テーブルと同じ列（名前と型）を持つ必要があります。追加時には既存の行が境界値に合うか検査されるため、あらかじめ同じ条件の CHECK 制約を付けておくと検査を省略できます。\nデータは移動せず、そのテーブル自体がパーティションになります。ハッシュパーティションも追加できます。\nDETACH PARTITION で切り離したパーティションは通常のテーブルとして残るため、アーカイブや削除などを別途行えます。',
  refs: [
    ['パーティションのメンテナンス', 'ddl-partitioning.html#DDL-PARTITIONING-DECLARATIVE-MAINTENANCE'],
    ['ALTER TABLE', 'sql-altertable.html']
  ]
},
{
  id: 'S3.1-031', level: 'silver', cat: 'S3.1',
  q: 'テーブル orders を論理レプリケーションで複製するための SQL として、正しい組み合わせを1つ選びなさい。',
  choices: [
    'パブリッシャで CREATE PUBLICATION mypub FOR TABLE orders; を実行し、サブスクライバで CREATE SUBSCRIPTION mysub CONNECTION \'...\' PUBLICATION mypub; を実行する',
    'サブスクライバで CREATE PUBLICATION mypub FOR TABLE orders; を実行し、パブリッシャで CREATE SUBSCRIPTION mysub CONNECTION \'...\' PUBLICATION mypub; を実行する',
    'パブリッシャで CREATE SUBSCRIPTION mysub FOR TABLE orders; を実行し、サブスクライバで CREATE PUBLICATION mypub CONNECTION \'...\'; を実行する',
    'パブリッシャとサブスクライバの両方で CREATE PUBLICATION mypub FOR TABLE orders; を実行するだけでよい',
    'パブリッシャで CREATE REPLICATION orders TO \'...\'; を実行し、サブスクライバでは何も実行しなくてよい'
  ],
  answer: 0,
  exp: '論理レプリケーションでは、複製元（パブリッシャ）で CREATE PUBLICATION により複製するテーブルの集合（パブリケーション）を定義し、複製先（サブスクライバ）で CREATE SUBSCRIPTION によりパブリッシャへの接続文字列とパブリケーション名を指定して購読します。\nサブスクライバにはあらかじめ同じ定義のテーブルを作成しておく必要があり、CREATE SUBSCRIPTION の実行時に既存データの初期コピーが行われます（copy_data = true が既定）。\nパブリッシャ側の wal_level は logical にしておく必要があります。',
  refs: [
    ['CREATE PUBLICATION', 'sql-createpublication.html'],
    ['CREATE SUBSCRIPTION', 'sql-createsubscription.html'],
    ['論理レプリケーション', 'logical-replication.html']
  ]
},
{
  id: 'S3.1-032', level: 'silver', cat: 'S3.1',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'SELECT char_length(CAST(\'ab \' AS character(5)));',
  choices: [
    '2',
    '3',
    '5',
    '6',
    'エラーになる'
  ],
  answer: 0,
  shuffle: false,
  exp: 'character(n) 型の値は n 文字に満たない部分が空白で埋められますが、末尾の空白は意味を持たないものとして扱われます。character 型の値を char_length() などの文字列関数に渡すと、他の文字列型への変換時に末尾の空白が取り除かれるため、\'ab \' を character(5) にした値の char_length は 2 になります。\nvarchar(5) や text にキャストした場合は、末尾の空白も文字として扱われるため 3 になります。\ncharacter 型の比較でも末尾の空白は無視されるなど、character 型は直感と異なる動作をするため、通常は text や varchar の使用が推奨されています。',
  refs: [
    ['文字型', 'datatype-character.html']
  ]
},
{
  id: 'S3.1-033', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: 'テーブル t1 に3行、テーブル t2 に2行が格納されている。`SELECT * FROM t1 CROSS JOIN t2;` が返す行数として、正しいものを1つ選びなさい。',
  choices: [
    '0行',
    '2行',
    '3行',
    '5行',
    '6行'
  ],
  answer: 4,
  shuffle: false,
  exp: 'CROSS JOIN（交差結合）は、2つのテーブルのすべての行の組み合わせ（直積）を返します。結果の行数は t1 の行数 × t2 の行数なので、3 × 2 = 6 行です。\nFROM t1, t2 のようにカンマで区切って指定し、結合条件を書かなかった場合も同じ結果になります。大きなテーブル同士で結合条件を書き忘れると、膨大な行数の結果になるので注意が必要です。',
  evidence: [
    ['CROSS JOIN の結果',
      '=# SELECT * FROM t1 CROSS JOIN t2;\n v | n\n---+---\n x | 1\n y | 1\n z | 1\n x | 2\n y | 2\n z | 2\n(6 rows)\n\n=# SELECT count(*) FROM t1 CROSS JOIN t2;\n count\n-------\n     6\n(1 row)']
  ],
  refs: [
    ['結合テーブル', 'queries-table-expressions.html#QUERIES-JOIN']
  ]
},
{
  id: 'S3.1-034', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: 'テーブル a の id 列に 1, 2, 3、テーブル b の id 列に 2, 3, 4 が格納されている。`SELECT * FROM a FULL OUTER JOIN b ON a.id = b.id;` が返す行数として、正しいものを1つ選びなさい。',
  choices: [
    '2行',
    '3行',
    '4行',
    '6行',
    '9行'
  ],
  answer: 2,
  shuffle: false,
  exp: 'FULL OUTER JOIN は、結合条件に一致した行の組み合わせに加えて、左右それぞれのテーブルで一致する行がなかった行も、相手側の列を NULL にして返します。\n・一致する行: (2, 2)、(3, 3)\n・a にだけある行: (1, NULL)\n・b にだけある行: (NULL, 4)\nしたがって結果は4行です。INNER JOIN なら2行、LEFT OUTER JOIN なら3行（1、2、3）、CROSS JOIN なら9行になります。',
  evidence: [
    ['FULL OUTER JOIN と集合演算の結果',
      '=# SELECT id FROM a EXCEPT SELECT id FROM b;\n id\n----\n  1\n(1 row)\n\n=# SELECT id FROM a INTERSECT SELECT id FROM b;\n id\n----\n  3\n  2\n(2 rows)\n\n=# SELECT id FROM a UNION SELECT id FROM b ORDER BY id;\n id\n----\n  1\n  2\n  3\n  4\n(4 rows)\n\n=# SELECT * FROM a FULL OUTER JOIN b ON a.id = b.id ORDER BY a.id, b.id;\n id | id\n----+----\n  1 |\n  2 |  2\n  3 |  3\n    |  4\n(4 rows)']
  ],
  refs: [
    ['結合テーブル', 'queries-table-expressions.html#QUERIES-JOIN']
  ]
},
{
  id: 'S3.1-035', level: 'silver', cat: 'S3.1',
  q: 'boolean 型に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '\'yes\'、\'on\'、\'1\'、\'true\' などの文字列は、いずれも真として入力できる',
    'boolean 型の列には NULL を格納できない',
    'boolean 型には、整数の 0 と 1 以外は入力できない',
    '\'はい\' や \'真\' といった日本語の文字列も、真として入力できる',
    'boolean 型の値は、内部的に1文字の文字列として格納される'
  ],
  answer: 0,
  exp: 'boolean 型は真、偽、および NULL（不明）を扱うデータ型です。入力には、真として true、yes、on、1（およびそれらの一意な接頭辞 t、y など）、偽として false、no、off、0 などの文字列を使え、大文字小文字や前後の空白は無視されます。出力は t / f です。\n整数型からのキャスト（1::boolean）も可能です。日本語の文字列は受け付けられません。boolean 型の格納サイズは1バイトです。',
  refs: [
    ['論理値データ型', 'datatype-boolean.html']
  ]
},
{
  id: 'S3.1-036', level: 'silver', cat: 'S3.1',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'SELECT date \'2026-01-31\' + interval \'1 month\';',
  choices: [
    '2026-02-28 00:00:00',
    '2026-03-03 00:00:00',
    '2026-02-31 00:00:00',
    '2026-03-01 00:00:00',
    '存在しない日付になるためエラーになる'
  ],
  answer: 0,
  shuffle: false,
  exp: 'date に interval を加算すると、結果は timestamp without time zone になります。月単位の加算では、同じ「日」が存在しない場合、その月の末日に丸められます。1月31日に1か月を加えると2月31日は存在しないため、2026年2月の末日である 2026-02-28 00:00:00 になります。\n日数で加算したい場合は date \'2026-01-31\' + 30（date + integer は date 型）や interval \'30 days\' を使います。月末日を扱う計算では、この丸めの動作に注意が必要です。',
  refs: [
    ['日付/時刻関数と演算子', 'functions-datetime.html'],
    ['日付/時刻データ型', 'datatype-datetime.html']
  ]
},
{
  id: 'S3.1-037', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '列 v に 1、NULL、NULL、2 の4行が格納されたテーブル t に対して、`SELECT count(*) FROM (SELECT DISTINCT v FROM t) AS s;` を実行した結果として、正しいものを1つ選びなさい。',
  choices: [
    '1',
    '2',
    '3',
    '4',
    'NULL を含むためエラーになる'
  ],
  answer: 2,
  shuffle: false,
  exp: 'DISTINCT による重複除去では、NULL 同士は同じ値（重複）として扱われます。そのため SELECT DISTINCT v の結果は 1、2、NULL の3行になり、それを count(*) で数えると 3 になります。GROUP BY v でも同様に、NULL は1つのグループにまとめられます。\n一方、count(DISTINCT v) は NULL を数えないため 2 になります。「比較では NULL = NULL は真にならないが、DISTINCT や GROUP BY では NULL 同士を同一とみなす」という違いを押さえておきましょう。',
  evidence: [
    ['DISTINCT と NULL、count の違い',
      '=# SELECT DISTINCT v FROM tn;\n v\n---\n\n 2\n 1\n(3 rows)\n\n=# SELECT count(*) FROM (SELECT DISTINCT v FROM tn) AS s;\n count\n-------\n     3\n(1 row)\n\n=# SELECT count(v) AS count_v, count(*) AS count_all, count(DISTINCT v) AS count_distinct_v FROM tn;\n count_v | count_all | count_distinct_v\n---------+-----------+------------------\n       2 |         4 |                2\n(1 row)']
  ],
  refs: [
    ['DISTINCT', 'queries-select-lists.html#QUERIES-DISTINCT'],
    ['集約関数', 'functions-aggregate.html']
  ]
},
{
  id: 'S3.1-038', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '列 score に 85、60、59 の3行が格納されたテーブル t に対して次の SQL を実行した結果として、正しいものを1つ選びなさい（結果は score の降順）。',
  code: 'SELECT CASE WHEN score >= 80 THEN \'A\'\n            WHEN score >= 60 THEN \'B\'\n            ELSE \'C\' END AS rank\n  FROM t ORDER BY score DESC;',
  choices: [
    'A, B, C',
    'A, A, B',
    'A, C, C',
    'A, B, B',
    'B, B, C'
  ],
  answer: 0,
  exp: 'CASE 式は、WHEN の条件を上から順に評価し、最初に真になった条件の THEN の値を返します。どの条件も真にならなければ ELSE の値（ELSE を省略した場合は NULL）を返します。\n・85: score >= 80 が真 → A\n・60: score >= 80 は偽、score >= 60 が真 → B\n・59: どちらも偽 → C\nしたがって結果は A, B, C です。境界値（60 は 60 以上に含まれる）の扱いに注意します。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'SELECT CASE WHEN score >= 80 THEN \'A\'\n            WHEN score >= 60 THEN \'B\'\n            ELSE \'C\' END AS rank\n  FROM t ORDER BY score DESC;\n rank\n------\n A\n B\n C\n(3 rows)']
  ],
  refs: [
    ['CASE', 'functions-conditional.html#FUNCTIONS-CASE']
  ]
},
{
  id: 'S3.1-039', level: 'silver', cat: 'S3.1',
  q: '`SELECT coalesce(NULL, \'\', \'x\'), nullif(1, 1);` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    '\'\'（空文字列） | NULL',
    '\'x\' | NULL',
    'NULL | 1',
    '\'x\' | 1',
    '\'\'（空文字列） | 1'
  ],
  answer: 0,
  exp: 'coalesce(値1, 値2, ...) は、引数を先頭から順に調べ、最初に NULL でない値を返します。空文字列 \'\' は NULL ではないため、2番目の引数の \'\' が返されます（Oracle と異なり、PostgreSQL では空文字列と NULL は別の値です）。\nnullif(値1, 値2) は、2つの値が等しい場合に NULL を、等しくない場合に値1を返します。1 と 1 は等しいため NULL になります。0 による除算を避けるために x / nullif(y, 0) のように使うこともあります。',
  refs: [
    ['COALESCE', 'functions-conditional.html#FUNCTIONS-COALESCE-NVL-IFNULL'],
    ['NULLIF', 'functions-conditional.html#FUNCTIONS-NULLIF']
  ]
},
{
  id: 'S3.1-040', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SELECT 文の結果として、正しい説明を1つ選びなさい。',
  code: 'SELECT name\n  FROM emp e\n WHERE salary > (SELECT avg(salary) FROM emp WHERE dept = e.dept);',
  choices: [
    '全社員の平均給与より給与が高い社員の名前を返す',
    '各部署の平均給与を部署ごとに1行ずつ返す',
    '自分の所属する部署の平均給与より給与が高い社員の名前を返す',
    'サブクエリが複数行を返すため、必ずエラーになる',
    '給与が最も高い社員の名前だけを返す'
  ],
  answer: 2,
  exp: 'この問い合わせのサブクエリは、外側の問い合わせの行（e.dept）を参照する相関サブクエリです。外側の emp の各行について、その行の部署（e.dept）に属する社員の平均給与をサブクエリで求め、その値より給与が高い行だけを返します。\nサブクエリは集約関数 avg で1行1列の値を返すスカラサブクエリなので、比較演算子で比較できます。部署ごとに平均が異なるため、「全社の平均」ではなく「自分の部署の平均」との比較になります。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'SELECT name\n  FROM emp e\n WHERE salary > (SELECT avg(salary) FROM emp WHERE dept = e.dept);\n name\n------\n Sato\n Ito\n(2 rows)\n\nSELECT dept, avg(salary) FROM emp GROUP BY dept ORDER BY dept;\n dept |         avg\n------+----------------------\n dev  | 400.0000000000000000\n ops  | 410.0000000000000000\n(2 rows)']
  ],
  refs: [
    ['スカラ副問い合わせ', 'sql-expressions.html#SQL-SYNTAX-SCALAR-SUBQUERIES'],
    ['副問い合わせ式', 'functions-subquery.html']
  ]
},
{
  id: 'S3.1-041', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の UPDATE 文の説明として、正しいものを1つ選びなさい。',
  code: 'UPDATE orders o\n   SET status = \'vip\'\n  FROM customers c\n WHERE o.customer_id = c.id\n   AND c.rank = \'gold\';',
  choices: [
    'customers テーブルの rank が gold の行の status を vip に更新する',
    'UPDATE 文に FROM 句は指定できないため、エラーになる',
    'orders テーブルのすべての行の status を vip に更新する',
    'customers と結合し、rank が gold の顧客の注文について、orders の status を vip に更新する',
    'orders と customers の両方のテーブルの status を vip に更新する'
  ],
  answer: 3,
  exp: 'PostgreSQL の UPDATE では、FROM 句に他のテーブルを指定して結合し、その条件に一致する行だけを更新できます（SQL 標準にはない PostgreSQL の拡張構文です）。更新されるのは UPDATE の直後に指定した orders テーブルだけで、FROM 句の customers は条件の判定や SET の値の参照に使われます。\n同じ処理はサブクエリを使って WHERE customer_id IN (SELECT id FROM customers WHERE rank = \'gold\') と書くこともできます。DELETE でも USING 句で他のテーブルを結合できます。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'UPDATE orders o\n   SET status = \'vip\'\n  FROM customers c\n WHERE o.customer_id = c.id\n   AND c.rank = \'gold\';\nUPDATE 2\nSELECT * FROM orders ORDER BY id;\n id | customer_id | status\n----+-------------+--------\n 11 |           1 | vip\n 12 |           2 | normal\n 13 |           1 | vip\n(3 rows)']
  ],
  refs: [
    ['UPDATE', 'sql-update.html'],
    ['DELETE（USING 句）', 'sql-delete.html']
  ]
},
{
  id: 'S3.1-042', level: 'silver', cat: 'S3.1',
  q: '`TRUNCATE` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'TRUNCATE はトランザクションブロック内で実行しても、ロールバックすることはできない',
    'TRUNCATE に WHERE 句を指定して、条件に合う行だけを削除できる',
    'TRUNCATE は行ごとに削除するため、大きなテーブルでは DELETE より遅い',
    'TRUNCATE で削除した領域を再利用するには、VACUUM を実行する必要がある',
    'テーブルの全行を高速に削除して領域をすぐに解放し、行ごとの ON DELETE トリガーは発火しない'
  ],
  answer: 4,
  exp: 'TRUNCATE はテーブルのデータファイルを作り直すことで、全行を高速に削除します。行を1件ずつ削除しないため、大きなテーブルでも速く、領域もすぐに OS に解放され、VACUUM は不要です。WHERE 句は指定できません。\n行ごとの削除ではないため、行単位の ON DELETE トリガーは発火しません（TRUNCATE トリガーは別に定義できます）。他のテーブルから外部キーで参照されている場合は、CASCADE を指定しないとエラーになります。\nPostgreSQL の TRUNCATE はトランザクションに対応しており、ROLLBACK で取り消せます。ACCESS EXCLUSIVE ロックを取得する点にも注意します。',
  refs: [
    ['TRUNCATE', 'sql-truncate.html']
  ]
},
{
  id: 'S3.1-043', level: 'silver', cat: 'S3.1',
  q: '`CREATE TABLE orders_2025 AS SELECT * FROM orders WHERE order_date < \'2026-01-01\';` の説明として、正しいものを1つ選びなさい。',
  choices: [
    '問い合わせの結果から新しいテーブルを作成するが、元のテーブルの主キーやインデックスなどの制約はコピーされない',
    '元のテーブルの主キー、インデックス、制約もすべてコピーされる',
    'テーブルの定義だけが作成され、データはコピーされない',
    '元のテーブルへの参照が作成され、orders を更新すると orders_2025 にも反映される',
    'SELECT の結果が0行の場合は、テーブルは作成されない'
  ],
  answer: 0,
  exp: 'CREATE TABLE ... AS（CTAS）は、SELECT の結果の列名と型で新しいテーブルを作成し、結果のデータを格納します。作成後は元のテーブルと独立した通常のテーブルで、元のテーブルを更新しても反映されません。\n元のテーブルの主キー、一意制約、NOT NULL 制約、インデックス、デフォルト値などはコピーされないため、必要に応じて後から定義します。結果が0行でも（WITH NO DATA を指定した場合も）テーブルは作成されます。\n同じ機能は SELECT ... INTO でも実現できますが、CREATE TABLE AS の使用が推奨されています。',
  refs: [
    ['CREATE TABLE AS', 'sql-createtableas.html']
  ]
},
{
  id: 'S3.1-044', level: 'silver', cat: 'S3.1',
  q: '`CREATE TABLE orders_copy (LIKE orders INCLUDING ALL);` の説明として、正しいものを1つ選びなさい。',
  choices: [
    '列の定義だけが複製され、デフォルト値や制約、インデックスは複製されない',
    '列の定義に加えてデフォルト値、制約、インデックスなども複製されるが、データはコピーされない',
    '列の定義もデータもすべて複製される',
    'orders を参照するビューが作成される',
    'orders の外部キー制約も含めて、すべての制約が必ず複製される'
  ],
  answer: 1,
  exp: 'CREATE TABLE の LIKE 句は、既存のテーブルの列の名前、データ型、NOT NULL 制約を新しいテーブルにコピーします。INCLUDING DEFAULTS、INCLUDING CONSTRAINTS（検査制約）、INCLUDING INDEXES（主キーや一意制約を含む）、INCLUDING COMMENTS などを指定するとそれぞれも複製され、INCLUDING ALL ですべてを指定できます。\nデータはコピーされません。また、外部キー制約は複製されません。同じ構造の作業用テーブルを作る場合などに便利です。',
  refs: [
    ['CREATE TABLE（LIKE 句）', 'sql-createtable.html']
  ]
},
{
  id: 'S3.1-045', level: 'silver', cat: 'S3.1',
  q: '`SELECT (ARRAY[10, 20, 30])[1];` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    '10',
    '20',
    '30',
    'NULL',
    '添字の指定に誤りがあるためエラーになる'
  ],
  answer: 0,
  shuffle: false,
  exp: 'PostgreSQL の配列の添字は、既定で 1 から始まります。そのため [1] は最初の要素の 10 を返します。範囲外の添字（例えば [0] や [4]）を指定しても、エラーにはならず NULL が返されます。\n配列は ARRAY[...] や \'{10,20,30}\' のリテラルで作成でき、列のデータ型として integer[] のように宣言できます。array_length()、unnest()、= ANY (配列) などの関数・演算子があります。',
  refs: [
    ['配列', 'arrays.html'],
    ['配列関数と演算子', 'functions-array.html']
  ]
},
{
  id: 'S3.1-046', level: 'silver', cat: 'S3.1',
  q: '一時テーブル（CREATE TEMPORARY TABLE）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '一時テーブルは、同じデータベースに接続している他のセッションからも参照できる',
    '一時テーブルはサーバを再起動するまで残り、手動で削除する必要がある',
    '一時テーブルには、インデックスを作成できない',
    '一時テーブルは作成したセッションだけから見え、セッションの終了時に自動的に削除される',
    '通常のテーブルと同じ名前の一時テーブルは作成できない'
  ],
  answer: 3,
  exp: 'CREATE TEMPORARY（TEMP）TABLE で作成した一時テーブルは、作成したセッション内でだけ参照でき、セッションの終了時に自動的に削除されます。ON COMMIT DROP を指定するとトランザクションの終了時に削除、ON COMMIT DELETE ROWS を指定するとトランザクションの終了時に全行が削除されます。\n一時テーブルはセッション固有の特別なスキーマに作成されるため、通常のテーブルと同じ名前でも作成でき、その場合はセッション内で一時テーブルが優先されます。インデックスも作成できます。WAL が書かれず、自動バキュームの対象外である点にも注意します。',
  refs: [
    ['CREATE TABLE（TEMPORARY）', 'sql-createtable.html']
  ]
},
{
  id: 'S3.1-047', level: 'silver', cat: 'S3.1',
  q: '`SELECT \'2026-09-16 10:20:30.123456\'::timestamp(0);` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    '2026-09-16 10:20:30',
    '2026-09-16 10:20:31',
    '2026-09-16 00:00:00',
    '2026-09-16 10:20:30.123456',
    '精度の指定が不正なためエラーになる'
  ],
  answer: 0,
  shuffle: false,
  exp: 'timestamp(p) の p は秒の小数点以下の桁数（0〜6）を指定する精度です。timestamp(0) は小数点以下を持たないため、30.123456 秒は丸められて 30 秒になります（切り捨てではなく丸めなので、30.5 以上なら 31 秒になります）。\n精度を省略した timestamp はマイクロ秒（6桁）まで保持します。time や interval でも同様に精度を指定できます。日付だけにしたい場合は date 型へのキャストや date_trunc() を使います。',
  refs: [
    ['日付/時刻データ型', 'datatype-datetime.html']
  ]
},
{
  id: 'S3.1-048', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE t (g text, v integer);\nINSERT INTO t VALUES (\'a\', 1), (\'a\', 2), (\'b\', 3), (\'b\', 4), (\'c\', 5);\n\nSELECT g, sum(v) FROM t WHERE v >= 2 GROUP BY g HAVING sum(v) >= 7;',
  choices: [
    'b と 7 の1行が返る',
    'b と 7、c と 5 の2行が返る',
    'a と 2、b と 7、c と 5 の3行が返る',
    'WHERE 句で集約関数を使っていないためエラーになる',
    'HAVING 句は GROUP BY より前に書く必要があるためエラーになる'
  ],
  answer: 0,
  exp: 'WHERE 句はグループ化の前に個々の行を絞り込みます。v >= 2 により (a,2)、(b,3)、(b,4)、(c,5) の4行が残ります。\n次に g でグループ化すると、a は合計 2、b は合計 7、c は合計 5 になります。\nHAVING 句はグループ化した後の結果に対する条件なので、sum(v) >= 7 を満たす b の 7 だけが残ります。\nこのように、集約前の条件は WHERE に、集約結果に対する条件は HAVING に書きます。HAVING は GROUP BY の後に記述します。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE t (g text, v integer);\nCREATE TABLE\nINSERT INTO t VALUES (\'a\', 1), (\'a\', 2), (\'b\', 3), (\'b\', 4), (\'c\', 5);\nINSERT 0 5\nSELECT g, sum(v) FROM t WHERE v >= 2 GROUP BY g HAVING sum(v) >= 7;\n g | sum\n---+-----\n b |   7\n(1 row)']
  ],
  refs: [
    ['GROUP BY句とHAVING句', 'queries-table-expressions.html#QUERIES-GROUP'],
    ['集約関数', 'functions-aggregate.html']
  ]
},
{
  id: 'S3.1-049', level: 'silver', cat: 'S3.1',
  q: '`DISTINCT ON` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '括弧内の式が等しい行のグループごとに、ORDER BY で先頭になった1行だけを返す',
    '括弧内の式が等しい行をすべて削除し、1件しかない行だけを返す',
    'DISTINCT と同じ意味であり、括弧内の指定は読みやすさのためのものである',
    '括弧内の式は ORDER BY の先頭に書いてはならない',
    'SQL 標準で定義された構文であり、他のデータベース製品でも同じように使える'
  ],
  answer: 0,
  exp: 'SELECT DISTINCT ON (式, ...) は、指定した式の値が等しい行のまとまりごとに、最初の1行だけを残します。「最初」がどの行かは ORDER BY で決まるため、実質的に ORDER BY と組み合わせて使います。\nたとえば `SELECT DISTINCT ON (user_id) * FROM logs ORDER BY user_id, created_at DESC;` は、利用者ごとの最新のログを1行ずつ取得します。\nDISTINCT ON の式は ORDER BY の先頭の式と一致している必要があります。\nこれは PostgreSQL の拡張で、SQL 標準ではありません。',
  refs: [
    ['DISTINCT句', 'queries-select-lists.html#QUERIES-DISTINCT'],
    ['SELECT', 'sql-select.html']
  ]
},
{
  id: 'S3.1-050', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL を実行した後、テーブル t の内容として正しいものを1つ選びなさい。',
  code: 'CREATE TABLE t (id integer PRIMARY KEY, name text);\nINSERT INTO t VALUES (1, \'apple\');\n\nINSERT INTO t VALUES (1, \'banana\')\n  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;',
  choices: [
    'id = 1、name = \'banana\' の1行',
    'id = 1、name = \'apple\' の1行',
    'id = 1 の行が2行',
    '一意制約違反のエラーになり、1行目の内容が残る',
    'ON CONFLICT は INSERT では使えないため構文エラーになる'
  ],
  answer: 0,
  exp: 'INSERT ... ON CONFLICT は、一意制約や排他制約に違反したときの動作を指定する構文です（UPSERT）。\nDO UPDATE SET を指定すると、衝突した既存行を更新します。EXCLUDED は「挿入しようとした行」を参照する特別な名前なので、EXCLUDED.name は \'banana\' です。結果として既存行の name が \'banana\' に更新されます。\nDO NOTHING を指定した場合は、衝突した行について何もせず、エラーにもなりません。\n衝突の判定対象は、列名や制約名で明示するか、DO NOTHING では省略できます。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE t (id integer PRIMARY KEY, name text);\nCREATE TABLE\nINSERT INTO t VALUES (1, \'apple\');\nINSERT 0 1\nINSERT INTO t VALUES (1, \'banana\')\n  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\nINSERT 0 1\nSELECT * FROM t ORDER BY id;\n id |  name\n----+--------\n  1 | banana\n(1 row)']
  ],
  refs: [
    ['INSERT の ON CONFLICT 句', 'sql-insert.html#SQL-ON-CONFLICT'],
    ['INSERT', 'sql-insert.html']
  ]
},
{
  id: 'S3.1-051', level: 'silver', cat: 'S3.1',
  q: 'UNIQUE 制約と NULL の扱いに関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'UNIQUE 制約のある列には、NULL を複数行に格納することができる',
    'UNIQUE 制約のある列には、NULL は1行にしか格納できない',
    'UNIQUE 制約のある列には、NULL を格納することができない',
    'UNIQUE 制約を付けると、その列は自動的に NOT NULL になる',
    '主キー制約の列にも、NULL であれば複数行に格納できる'
  ],
  answer: 0,
  exp: 'PostgreSQL 14 では、UNIQUE 制約において NULL 同士は等しくないものとして扱われるため、NULL を複数の行に格納できます。これは SQL 標準に沿った動作です。\n複数列の UNIQUE 制約でも、比較で NULL を含む組み合わせは重複とみなされません。\n一方、主キー（PRIMARY KEY）は UNIQUE と NOT NULL を組み合わせたものなので、NULL は格納できません。\nUNIQUE 制約を付けただけでは NOT NULL にはなりません。\nなお PostgreSQL 15 では、NULL を重複とみなす UNIQUE NULLS NOT DISTINCT が追加されています。',
  refs: [
    ['一意性制約', 'ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS'],
    ['主キー', 'ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS']
  ]
},
{
  id: 'S3.1-052', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE t (v integer);\nINSERT INTO t VALUES (3), (NULL), (1);\n\nSELECT v FROM t ORDER BY v;',
  choices: [
    '1、3、NULL の順に返る',
    'NULL、1、3 の順に返る',
    '1、3 の2行だけが返り、NULL の行は除外される',
    '3、NULL、1 の順（挿入順）に返る',
    'NULL を含む列は ORDER BY に指定できないためエラーになる'
  ],
  answer: 0,
  exp: 'PostgreSQL では ORDER BY における NULL の既定の位置が、昇順（ASC）のときは最後、降順（DESC）のときは最初と決められています。NULL はどの値よりも大きいものとして扱われる、と考えると分かりやすいでしょう。\nしたがってこの問い合わせは 1、3、NULL の順に返します。\n明示したい場合は `ORDER BY v NULLS FIRST` や `ORDER BY v DESC NULLS LAST` のように NULLS FIRST / NULLS LAST を指定します。\nORDER BY で NULL の行が除外されることはありません。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE t (v integer);\nCREATE TABLE\nINSERT INTO t VALUES (3), (NULL), (1);\nINSERT 0 3\nSELECT v FROM t ORDER BY v;\n v\n---\n 1\n 3\n\n(3 rows)']
  ],
  refs: [
    ['行の並べ替え', 'queries-order.html'],
    ['SELECT', 'sql-select.html']
  ]
},
{
  id: 'S3.1-053', level: 'silver', cat: 'S3.1',
  q: 'テーブルの継承（INHERITS）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '親テーブルへの SELECT では子テーブルの行も返り、ONLY を付けると親の行だけになる',
    '親テーブルへの SELECT では、子テーブルの行は返らない',
    '親テーブルに作成した主キーや一意制約は、子テーブルにも自動的に引き継がれて適用される',
    '子テーブルに行を挿入すると、その行は親テーブルにも実体としてコピーされる',
    '継承した子テーブルには、親テーブルにない列を追加することができない'
  ],
  answer: 0,
  exp: '`CREATE TABLE child (...) INHERITS (parent);` で作成した子テーブルの行は、親テーブルへの問い合わせでも返ります。親テーブルだけを対象にしたい場合は `SELECT * FROM ONLY parent;` のように ONLY を付けます。\n行が二重に格納されるわけではなく、親への問い合わせが子も走査する仕組みです。\nCHECK 制約と NOT NULL は子に引き継がれますが、主キー・一意制約・外部キー制約は継承されず、テーブルをまたいだ一意性も保証されません。これが、宣言的パーティショニングとの大きな違いの1つです。\n子テーブルには独自の列を追加できます。',
  refs: [
    ['継承', 'ddl-inherit.html'],
    ['テーブルのパーティショニング', 'ddl-partitioning.html']
  ]
},
{
  id: 'S3.1-054', level: 'silver', cat: 'S3.1',
  q: '`LIMIT` と `OFFSET` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ORDER BY を指定しないと、どの行が返るかは保証されない',
    'ORDER BY を指定しなくても、テーブルに挿入した順に行が返ることが保証されている',
    'OFFSET で読み飛ばした行は読み込まれないため、OFFSET を大きくしても処理は速いままである',
    'LIMIT は必ず OFFSET より後に記述しなければならない',
    'LIMIT 0 を指定するとエラーになる'
  ],
  answer: 0,
  exp: 'LIMIT は返す行数の上限、OFFSET は先頭から読み飛ばす行数を指定します。問い合わせの結果の順序は ORDER BY を指定しない限り保証されないため、LIMIT や OFFSET と組み合わせるときは必ず ORDER BY を付けます。並び順が一意に定まらない場合は、主キーなどを整列キーに加えます。\nOFFSET で読み飛ばす行も内部では処理されるため、値が大きくなるほど遅くなります。ページ送りでは、直前のページの最後の値を条件にする方法が効率的です。\nLIMIT と OFFSET はどちらの順に書いても構いません。LIMIT 0 は 0 行を返し、エラーにはなりません。',
  refs: [
    ['LIMITとOFFSET', 'queries-limit.html'],
    ['SELECT', 'sql-select.html']
  ]
},
{
  id: 'S3.1-055', level: 'silver', cat: 'S3.1',
  q: '`GENERATED ALWAYS AS IDENTITY` と `serial` の違いとして、正しいものを1つ選びなさい。',
  choices: [
    'IDENTITY 列は SQL 標準の構文で、ALWAYS を指定すると明示的な値の挿入が既定で拒否される',
    'IDENTITY 列は PostgreSQL 独自の構文で、serial が SQL 標準の書き方である',
    'IDENTITY 列はシーケンスを使わずに値を採番する',
    'serial 列は列を削除してもシーケンスが残るため、IDENTITY 列より管理しやすい',
    'IDENTITY 列には NOT NULL 制約を付けることができない'
  ],
  answer: 0,
  exp: 'GENERATED ALWAYS AS IDENTITY は SQL 標準の採番列の構文で、PostgreSQL 10 で導入されました。ALWAYS を指定すると明示的な値の挿入はエラーになり、どうしても入れたい場合は OVERRIDING SYSTEM VALUE を指定します。BY DEFAULT を指定すると、serial と同じように明示的な値も受け付けます。\nどちらも内部ではシーケンスを使いますが、IDENTITY 列のシーケンスは列に従属するため、列やテーブルを削除すると一緒に削除されます。serial ではシーケンスが残ることがあります。\nIDENTITY 列には暗黙的に NOT NULL が付きます。',
  refs: [
    ['CREATE TABLE', 'sql-createtable.html'],
    ['連番型', 'datatype-numeric.html#DATATYPE-SERIAL']
  ]
},
{
  id: 'S3.1-056', level: 'silver', cat: 'S3.1',
  q: '列挙型（`CREATE TYPE ... AS ENUM`）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '定義したときの並び順が値の大小関係になり、ORDER BY でその順に並べられる',
    '値の大小関係はアルファベット順で決まるため、定義した順序は意味を持たない',
    '一度作成した列挙型に、後から値を追加することはできない',
    '列挙型の値は、キャストなしで整数型と比較することができる',
    '列挙型はテーブルごとに定義する必要があり、複数のテーブルで共有できない'
  ],
  answer: 0,
  exp: 'CREATE TYPE mood AS ENUM (\'low\', \'mid\', \'high\'); のように定義すると、その順序が値の大小関係になります。ORDER BY や比較演算子では定義順が使われるため、状態や優先度のように意味のある順序を持つ値に向きます。\nALTER TYPE ... ADD VALUE で後から値を追加でき、BEFORE / AFTER で挿入位置も指定できます（既存の値の削除や並べ替えはできません）。\n列挙型は独立した型として作られるため、複数のテーブルで使えます。異なる列挙型どうしや、他の型との比較はできません。',
  refs: [
    ['列挙型', 'datatype-enum.html'],
    ['CREATE TYPE', 'sql-createtype.html']
  ]
},
{
  id: 'S3.1-057', level: 'silver', cat: 'S3.1',
  q: 'ドメイン（`CREATE DOMAIN`）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '既存の型に制約や既定値を付けて名前を付けたもので、複数の列で同じ検査を再利用できる',
    '複数の列をまとめて1つの型として扱うための、複合型を定義する機能である',
    'ドメインには CHECK 制約を付けることができず、型の別名を定義するだけである',
    'ドメインを使うとテーブルの列に NOT NULL を指定できなくなる',
    'ドメインはスキーマに属さないため、データベース全体で名前が重複してはならない'
  ],
  answer: 0,
  exp: 'CREATE DOMAIN は既存のデータ型に、CHECK 制約、NOT NULL、既定値などを組み合わせて名前を付ける機能です。たとえば CREATE DOMAIN email AS text CHECK (VALUE LIKE \'%@%\'); のように定義しておくと、複数のテーブルの列で同じ検査を使い回せます。制約の中では VALUE でその値を参照します。\n制約の内容は ALTER DOMAIN で後から変更でき、その変更はドメインを使うすべての列に反映されます。\n複数の列をまとめた型は CREATE TYPE による複合型です。\nドメインはスキーマに属するオブジェクトです。',
  refs: [
    ['ドメイン型', 'domains.html'],
    ['CREATE DOMAIN', 'sql-createdomain.html']
  ]
},
{
  id: 'S3.1-058', level: 'silver', cat: 'S3.1',
  q: '生成列（`GENERATED ALWAYS AS (式) STORED`）に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    '他の列から計算された値が実際に格納され、その列に直接 INSERT や UPDATE で値を指定することはできない',
    '値は格納されず、参照されるたびに計算される（仮想生成列）',
    '生成列には他のテーブルの列を参照する副問い合わせを書くことができる',
    '生成列にはインデックスを作成することができない',
    '生成列の値は INSERT 時にだけ計算され、元の列を更新しても再計算されない'
  ],
  answer: 0,
  exp: '生成列は同じ行の他の列から計算される列です。PostgreSQL 14 でサポートされるのは STORED のみで、計算結果が実際にテーブルに格納され、元の列が更新されると再計算されます。参照のたびに計算する VIRTUAL は 14 では使えません。\n値は必ず式から決まるため、INSERT や UPDATE でその列に値を指定することはできません（DEFAULT の指定のみ可能です）。\n式には同じ行の他の列と不変（IMMUTABLE）な関数だけが使え、副問い合わせや他の行の参照はできません。\n生成列にもインデックスを作成できます。',
  refs: [
    ['生成列', 'ddl-generated-columns.html'],
    ['CREATE TABLE', 'sql-createtable.html']
  ]
},
{
  id: 'S3.1-059', level: 'silver', cat: 'S3.1',
  q: '`ALTER TABLE ... ALTER COLUMN ... TYPE` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '暗黙的に変換できない型に変更する場合は、USING 句で変換式を指定する必要がある',
    'どのような型変更でも、USING 句を指定することはできない',
    '型を変更しても、その列を参照するインデックスやビューは影響を受けない',
    'varchar(10) から varchar(20) への拡張でも、必ずテーブル全体が書き換えられる',
    '型の変更はテーブルが空の場合にしか実行できない'
  ],
  answer: 0,
  exp: 'ALTER TABLE ... ALTER COLUMN ... TYPE で列の型を変更できます。text から integer のように暗黙のキャストがない場合は、USING col::integer のように変換式を指定します。\n型の変更は一般にテーブルの書き換えを伴い、対象テーブルへの排他ロックが必要です。ただし varchar(10) から varchar(20) や varchar から text のように、格納形式が変わらない拡張では書き換えが省略されます。\nその列を使うインデックスや制約は自動的に再構築されますが、その列に依存するビューがあると変更できず、ビューを作り直す必要があります。',
  refs: [
    ['ALTER TABLE', 'sql-altertable.html'],
    ['テーブルの変更', 'ddl-alter.html']
  ]
},
{
  id: 'S3.1-060', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE a (id integer);\nCREATE TABLE b (id integer);\nINSERT INTO a VALUES (1), (2);\nINSERT INTO b VALUES (2), (NULL);\n\nSELECT id FROM a WHERE id NOT IN (SELECT id FROM b);',
  choices: [
    '1行も返らない',
    '1 の1行が返る',
    '1 と 2 の2行が返る',
    '2 の1行が返る',
    '副問い合わせに NULL が含まれるためエラーになる'
  ],
  answer: 0,
  exp: 'NOT IN は「いずれの値とも等しくない」という条件ですが、比較対象に NULL があると結果が真になりません。1 と 2 を比べると、1 = 2 は偽、1 = NULL は不明（NULL）となり、全体は「偽」ではなく「不明」になるため、条件を満たさず行は返りません。\nこのため、副問い合わせに NULL が含まれる可能性がある場合、NOT IN は意図しない結果になります。NOT EXISTS を使うか、副問い合わせ側で IS NOT NULL を付けるのが安全です。\nNOT EXISTS では、対応する行がなければ真になるため、この例では 1 が返ります。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE a (id integer);\nCREATE TABLE\nCREATE TABLE b (id integer);\nCREATE TABLE\nINSERT INTO a VALUES (1), (2);\nINSERT 0 2\nINSERT INTO b VALUES (2), (NULL);\nINSERT 0 2\nSELECT id FROM a WHERE id NOT IN (SELECT id FROM b);\n id\n----\n(0 rows)']
  ],
  refs: [
    ['副問い合わせ式', 'functions-subquery.html'],
    ['比較関数と演算子', 'functions-comparison.html']
  ]
},
{
  id: 'S3.1-061', level: 'silver', cat: 'S3.1',
  q: '`SELECT \'PostgreSQL\' LIKE \'%SQL\', \'PostgreSQL\' ILIKE \'postgre%\';` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    't と t',
    't と f',
    'f と t',
    'f と f',
    'ILIKE は PostgreSQL では使用できないためエラーになる'
  ],
  answer: 0,
  exp: 'LIKE のパターンで % は0文字以上の任意の文字列、_ は任意の1文字に一致します。\'%SQL\' は「SQL で終わる」という意味なので、\'PostgreSQL\' は一致して t になります。\nILIKE は大文字と小文字を区別しない LIKE で、PostgreSQL の拡張です。\'postgre%\' は大文字小文字を無視すれば一致するため t になります。\n% や _ そのものを検索したい場合は ESCAPE 句で指定したエスケープ文字を前に置きます。\nより複雑な検索には正規表現の演算子 ~（一致）、~*（大文字小文字を無視）が使えます。',
  refs: [
    ['パターンマッチング', 'functions-matching.html'],
    ['LIKE', 'functions-matching.html#FUNCTIONS-LIKE']
  ]
},
{
  id: 'S3.1-062', level: 'silver', cat: 'S3.1',
  q: '`timestamp with time zone`（timestamptz）型に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '値は UTC で格納され、表示や入力の際にセッションの TimeZone 設定に従って変換される',
    '値はタイムゾーン名とともに格納され、列ごとに異なるタイムゾーンを保持できる',
    'timestamp without time zone と同じで、タイムゾーンは一切考慮されない',
    'TimeZone パラメータを変更しても、すでに格納されている値の表示は変わらない',
    'timestamptz 型には now() の値を格納することができない'
  ],
  answer: 0,
  exp: 'timestamp with time zone 型は、入力された値をセッションの TimeZone 設定に基づいて UTC に変換して格納します。表示時には再びセッションのタイムゾーンに変換されるため、TimeZone を変えると同じ値でも表示が変わります。タイムゾーン名そのものは保存されません。\n一方 timestamp without time zone は、入力された文字列をそのまま保持し、タイムゾーンの変換を行いません。\n複数の地域を扱うシステムでは timestamptz が推奨されます。\nAT TIME ZONE 演算子を使うと、任意のタイムゾーンでの表現に変換できます。',
  refs: [
    ['日付/時刻データ型', 'datatype-datetime.html'],
    ['時間帯', 'datatype-datetime.html#DATATYPE-TIMEZONES']
  ]
},
{
  id: 'S3.1-063', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE t (v integer);\nINSERT INTO t VALUES (1), (5), (9);\n\nSELECT count(*) FROM t WHERE v > ALL (ARRAY[2, 4]);',
  choices: [
    '2',
    '1',
    '3',
    '0',
    'ALL は配列には使用できないためエラーになる'
  ],
  answer: 0,
  exp: 'ANY（SOME）と ALL は、値と集合または配列の各要素を比較する演算子です。`v > ALL (ARRAY[2, 4])` は「v がすべての要素より大きい」、つまり v > 2 かつ v > 4 という意味になります。\n該当するのは 5 と 9 の2行なので、count(*) は 2 です。\n`v > ANY (...)` であれば「いずれかの要素より大きい」となり、v > 2 または v > 4、つまり 5 と 9 に加えて条件を満たす行が対象になります。\nIN は `= ANY (...)` と同じ意味で、NOT IN は `<> ALL (...)` と同じ意味です。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE t (v integer);\nCREATE TABLE\nINSERT INTO t VALUES (1), (5), (9);\nINSERT 0 3\nSELECT count(*) FROM t WHERE v > ALL (ARRAY[2, 4]);\n count\n-------\n     2\n(1 row)']
  ],
  refs: [
    ['副問い合わせ式', 'functions-subquery.html'],
    ['行と配列の比較', 'functions-comparisons.html']
  ]
},
{
  id: 'S3.1-064', level: 'silver', cat: 'S3.1',
  q: '`ALTER TABLE ... DROP COLUMN` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '列は論理的に削除されるだけで領域はすぐには解放されず、行が更新されるか VACUUM FULL を行うまで残る',
    '実行と同時にテーブル全体が書き換えられ、その列が使っていた領域が解放される',
    '削除した列は ALTER TABLE ... ADD COLUMN で元の値ごと復元できる',
    'その列を参照するビューがあっても、ビューは自動的に修正されるため影響はない',
    'テーブルの最後の列を削除しようとすると、行数に関係なくエラーになる'
  ],
  answer: 0,
  exp: 'DROP COLUMN はシステムカタログ上で列を削除済みとして印を付けるだけで、既存の行に格納されている値はその場では消えません。領域が実際に解放されるのは、行が更新されるか、VACUUM FULL や CLUSTER などでテーブルが書き換えられたときです。このため実行自体は一瞬で終わります。\n削除した列の値を戻す方法はありません。\nその列を参照するビューや制約がある場合はエラーになり、CASCADE を指定するとそれらも削除されます。\nすべての列を削除して、列のないテーブルにすることもできます。',
  refs: [
    ['ALTER TABLE', 'sql-altertable.html'],
    ['列の削除', 'ddl-alter.html#DDL-ALTER-REMOVING-A-COLUMN']
  ]
},
{
  id: 'S3.1-065', level: 'silver', cat: 'S3.1',
  q: '`LATERAL` を使った結合に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'FROM 句の副問い合わせから、その左側にあるテーブルの列を参照できるようになる',
    'FROM 句に書いた副問い合わせを、必ず実体化してから結合する指定である',
    '左外部結合の別名であり、LEFT JOIN と同じ意味である',
    '副問い合わせの結果を、行ではなく列方向に展開するための構文である',
    'LATERAL を付けた副問い合わせでは、LIMIT を使うことができない'
  ],
  answer: 0,
  exp: '通常、FROM 句に書いた副問い合わせは互いに独立しており、他の要素の列を参照できません。LATERAL を付けると、その副問い合わせは左側に現れたテーブルの列を参照できるようになり、行ごとに評価されます。\nたとえば「顧客ごとの最新の注文3件」のように、外側の行ごとに ORDER BY と LIMIT を適用したい場合に使います。関数呼び出しを FROM 句に書く場合は、LATERAL を省略しても同じ動作になります。\nLEFT JOIN LATERAL と書けば、副問い合わせが1行も返さない行も結果に残せます。',
  refs: [
    ['LATERAL副問い合わせ', 'queries-table-expressions.html#QUERIES-LATERAL'],
    ['SELECT', 'sql-select.html']
  ]
},
{
  id: 'S3.1-066', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'WITH RECURSIVE nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 4\n)\nSELECT sum(n) FROM nums;',
  choices: [
    '10',
    '4',
    '6',
    '15',
    '再帰が終了しないためエラーになる'
  ],
  answer: 0,
  exp: 'WITH RECURSIVE は再帰的な共通テーブル式で、非再帰項（初期値）と再帰項を UNION または UNION ALL でつないで書きます。\nこの例では初期値 1 から始まり、n < 4 の間 n + 1 を繰り返すため、1、2、3、4 の4行が生成されます。n = 4 では条件を満たさず再帰が止まります。合計は 1 + 2 + 3 + 4 = 10 です。\n再帰項に終了条件がないと無限に行が生成されるため、WHERE 句や LIMIT で必ず停止するように書きます。\n組織図や部品構成のような階層データの展開によく使われます。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'WITH RECURSIVE nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 4\n)\nSELECT sum(n) FROM nums;\n sum\n-----\n  10\n(1 row)']
  ],
  refs: [
    ['再帰問い合わせ', 'queries-with.html#QUERIES-WITH-RECURSIVE'],
    ['WITH問い合わせ', 'queries-with.html']
  ]
},
{
  id: 'S3.1-067', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL の実行結果として返る行数を1つ選びなさい。',
  code: 'CREATE TABLE sales (region text, item text, amt integer);\nINSERT INTO sales VALUES\n  (\'east\', \'a\', 10), (\'east\', \'b\', 20), (\'west\', \'a\', 30);\n\nSELECT region, item, sum(amt) FROM sales GROUP BY ROLLUP (region, item);',
  choices: [
    '3行',
    '4行',
    '5行',
    '6行',
    '9行'
  ],
  answer: 3,
  shuffle: false,
  exp: 'ROLLUP (region, item) は、(region, item)、(region)、() という3段階のグループ化をまとめて行います。\n(region, item) の組み合わせが3行、region ごとの小計が east と west の2行、全体の合計が1行で、合計 6行になります。小計・合計の行では、集約されていない列が NULL になります。\nGROUPING SETS を使えば任意の組み合わせを指定でき、CUBE はすべての組み合わせ（この例では4通り、計 3+2+2+1 = 8行）を生成します。\nNULL が「元データの NULL」か「小計行」かは GROUPING() 関数で区別できます。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE sales (region text, item text, amt integer);\nCREATE TABLE\nINSERT INTO sales VALUES\n  (\'east\', \'a\', 10), (\'east\', \'b\', 20), (\'west\', \'a\', 30);\nINSERT 0 3\nSELECT region, item, sum(amt) FROM sales GROUP BY ROLLUP (region, item);\n region | item | sum\n--------+------+-----\n        |      |  60\n east   | b    |  20\n west   | a    |  30\n east   | a    |  10\n west   |      |  30\n east   |      |  30\n(6 rows)']
  ],
  refs: [
    ['GROUPING SETS、CUBE、ROLLUP', 'queries-table-expressions.html#QUERIES-GROUPING-SETS'],
    ['集約関数', 'functions-aggregate.html']
  ]
},
{
  id: 'S3.1-068', level: 'silver', cat: 'S3.1',
  q: '集約関数の `FILTER` 句に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '集約関数ごとに対象行を絞り込めるため、1回の走査で条件別の集計ができる',
    'WHERE 句と同じ意味で、書き方が違うだけである',
    'GROUP BY を書いた問い合わせでは使用できない',
    'ウィンドウ関数には一切使用できない',
    'FILTER で除外された行は、count(*) の結果からも除かれる'
  ],
  answer: 0,
  exp: 'FILTER (WHERE 条件) は集約関数ごとに対象行を限定する構文です。`SELECT count(*), count(*) FILTER (WHERE status = \'ng\') FROM t;` のように書くと、全体の件数と条件付きの件数を1回の走査で同時に得られます。CASE 式で書く方法より意図が明確です。\nWHERE 句は問い合わせ全体の行を絞るため、集約ごとに違う条件を適用することはできません。この例で WHERE を使うと、両方の count が絞り込まれてしまいます。\nGROUP BY と併用でき、ウィンドウ関数の集約にも使えます。',
  refs: [
    ['集約式', 'sql-expressions.html#SYNTAX-AGGREGATES'],
    ['集約関数', 'functions-aggregate.html']
  ]
},
{
  id: 'S3.1-069', level: 'silver', cat: 'S3.1',
  q: 'ウィンドウ関数のフレーム指定に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'ORDER BY を伴う場合の既定は「先頭から現在行まで」で、累計の計算に使える',
    'ORDER BY を伴う場合の既定は、パーティション全体が対象になり累計にはならない',
    'ROWS と RANGE はまったく同じ意味である',
    'フレームは rank() や row_number() の結果にも影響する',
    'フレームを指定すると、ウィンドウ関数は集約関数として扱われる'
  ],
  answer: 0,
  exp: 'OVER 句に ORDER BY を書いた場合、フレームの既定は「パーティションの先頭から現在行まで」（RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW）です。そのため `sum(amt) OVER (ORDER BY d)` は累計になります。ORDER BY を書かない場合は、パーティション全体が既定のフレームです。\nROWS は物理的な行数で、RANGE は値が同じ行（ピア）をまとめて扱う点が異なります。移動平均のように厳密な行数で区切りたい場合は ROWS を使います。\nrank() や row_number() のような順位付けの関数はフレームの影響を受けません。',
  refs: [
    ['ウィンドウ関数呼び出し', 'sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS'],
    ['ウィンドウ関数', 'tutorial-window.html']
  ]
},
{
  id: 'S3.1-070', level: 'silver', cat: 'S3.1',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'SELECT NULL = NULL, NULL IS NOT DISTINCT FROM NULL, 1 IS DISTINCT FROM NULL;',
  choices: [
    'NULL、t、t',
    'f、f、f',
    't、t、t',
    'NULL、f、f',
    'f、t、NULL'
  ],
  answer: 0,
  exp: '通常の比較演算子では、NULL との比較は常に NULL（不明）になります。したがって `NULL = NULL` は真でも偽でもなく NULL です。\nIS DISTINCT FROM と IS NOT DISTINCT FROM は、NULL を「ひとつの値」として扱う比較で、結果は必ず真か偽になります。`NULL IS NOT DISTINCT FROM NULL` は「両方 NULL なので区別できない」＝真（t）です。\n`1 IS DISTINCT FROM NULL` は「一方が NULL で他方が 1 なので異なる」＝真（t）です。\nNULL を含む可能性のある列どうしを比較する場面で役立ちます。',
  refs: [
    ['比較関数と演算子', 'functions-comparison.html'],
    ['問い合わせ', 'functions-comparisons.html']
  ]
},
{
  id: 'S3.1-071', level: 'silver', cat: 'S3.1',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'SELECT array_agg(v ORDER BY v) FROM (VALUES (3), (1), (2)) AS t(v);',
  choices: [
    '{1,2,3}',
    '{3,1,2}',
    '{1,2,3} が3行',
    '3 行（1、2、3）',
    '集約関数に ORDER BY は指定できないためエラーになる'
  ],
  answer: 0,
  exp: 'array_agg() は複数行の値を1つの配列にまとめる集約関数です。集約関数の引数には ORDER BY を書けるため、`array_agg(v ORDER BY v)` とすると並べ替えた配列 {1,2,3} が返ります。GROUP BY がないので結果は1行です。\n同様に string_agg(v, \',\' ORDER BY v) で区切り文字付きの文字列にまとめられます。\n逆に配列を行に展開するのは unnest() です。`SELECT unnest(ARRAY[1,2,3]);` は3行を返します。\nVALUES 句は複数行のリテラルを表す構文で、副問い合わせとして FROM に書けます。',
  refs: [
    ['集約関数', 'functions-aggregate.html'],
    ['配列関数と演算子', 'functions-array.html']
  ]
},
{
  id: 'S3.1-072', level: 'silver', cat: 'S3.1',
  q: '範囲型に関する説明として、PostgreSQL 14 において正しいものを1つ選びなさい。',
  choices: [
    'int4range や tsrange などがあり、`@>` で値や範囲が含まれるかを判定できる',
    '範囲型は下限と上限を必ず含む閉区間としてのみ表現できる',
    '範囲型どうしが重なるかを判定する演算子はない',
    '範囲型に対して排他制約を設定することはできない',
    '複数の範囲をまとめて扱う多重範囲型は、PostgreSQL 14 では使用できない'
  ],
  answer: 0,
  exp: '範囲型は int4range、numrange、tsrange、tstzrange、daterange などがあり、`@>`（含む）、`&&`（重なる）、`<<`（左にある）といった演算子が使えます。\n境界は `[1,10)` のように、角括弧が閉区間、丸括弧が開区間を表し、下限を含み上限を含まない形が既定です。\nGiST インデックスと EXCLUDE 制約を組み合わせると、「期間が重なる予約を許さない」といった制約を宣言的に書けます。\nPostgreSQL 14 では、複数の範囲の集合を1つの値として扱う多重範囲型（int4multirange など）が追加されました。',
  refs: [
    ['範囲型', 'rangetypes.html'],
    ['範囲関数と演算子', 'functions-range.html']
  ]
},
{
  id: 'S3.1-073', level: 'silver', cat: 'S3.1',
  q: 'PostgreSQL 14 で `WITH RECURSIVE` に追加された句に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'SEARCH 句で探索順（深さ優先・幅優先）を、CYCLE 句で循環の検出を指定できる',
    'SEARCH 句で全文検索を、CYCLE 句で繰り返し回数の上限を指定できる',
    'SEARCH 句は再帰でない CTE にのみ使用できる',
    'CYCLE 句を指定すると、循環が見つかった時点でエラーになる',
    'これらの句は PostgreSQL 14 では使用できない'
  ],
  answer: 0,
  exp: 'PostgreSQL 14 で、再帰的な共通テーブル式に SEARCH 句と CYCLE 句が追加されました。\nSEARCH DEPTH FIRST BY 列 SET 順序列 / SEARCH BREADTH FIRST BY ... と書くと、探索順を表す列が結果に追加され、ORDER BY でその順に並べられます。\nCYCLE 列 SET 循環フラグ列 USING 経路列 と書くと、同じ行を再びたどったときにフラグが立ち、それ以上の再帰が止まります。組織図や部品構成に循環があってもエラーや無限ループにならず、検出できる点が利点です。\nどちらも、自分で経路の配列を持ち回って判定する従来の書き方を、標準的な構文に置き換えるものです。',
  refs: [
    ['WITH問い合わせ', 'queries-with.html#QUERIES-WITH-RECURSIVE'],
    ['SELECT', 'sql-select.html']
  ]
},
{
  id: 'S3.1-074', level: 'silver', cat: 'S3.1',
  q: '全文検索に関する説明として、適切なものを2つ選びなさい。',
  choices: [
    '`to_tsvector()` で文書を、`to_tsquery()` で検索語を変換し、`@@` 演算子で照合する',
    'tsvector 列や式に GIN インデックスを作成すると、検索を高速化できる',
    'tsvector への変換には、テキスト検索設定（言語）は影響しない',
    '全文検索は LIKE の別名であり、内部的には同じ処理である',
    '全文検索を使うには、あらかじめ contrib モジュールの導入が必要である'
  ],
  answer: [0, 1],
  exp: '全文検索では、文書を to_tsvector() で語句（レキシーム）の集合である tsvector に、検索条件を to_tsquery() や plainto_tsquery() で tsquery に変換し、`@@` 演算子で一致を判定します。\nどのように語を切り出し、どの語を無視するか（ストップワード）は、default_text_search_config などのテキスト検索設定によって決まります。日本語の分かち書きには別途 pg_bigm や textsearch_ja といった外部のモジュールを使うのが一般的です。\n高速化には GIN インデックス（更新は重いが検索が速い）や GiST インデックスを、tsvector 列や `to_tsvector(...)` の式に作成します。\n基本的な全文検索の機能は本体に含まれています。',
  refs: [
    ['全文検索', 'textsearch.html'],
    ['テキスト検索のためのインデックスの種類', 'textsearch-indexes.html']
  ]
},
{
  id: 'S3.1-075', level: 'silver', cat: 'S3.1',
  q: '排他制約（`EXCLUDE` 制約）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '任意の演算子で「同時に満たしてはいけない」組み合わせを禁止でき、期間の重複防止などに使える',
    '一意制約の別名であり、等価比較しか指定できない',
    '排他制約には専用のインデックスは不要である',
    '排他制約は列に NULL を許可しない',
    '排他制約は行が挿入されるときのみ検査され、更新時には検査されない'
  ],
  answer: 0,
  exp: 'EXCLUDE 制約は、指定した演算子で比較したときに「どの2行も同時には真にならない」ことを保証する制約です。`EXCLUDE USING gist (room WITH =, during WITH &&)` と書けば、同じ部屋で期間が重なる予約を許さない、といった条件を宣言的に表現できます。\n等価比較（=）だけを使えば一意制約と同じ意味になりますが、範囲型の重なり（&&）のような演算子も使える点が違いです。\n実装にはインデックスが使われ、範囲型には GiST、btree_gist を入れればスカラー型との組み合わせも可能です。\n挿入と更新のどちらでも検査されます。',
  refs: [
    ['排他制約', 'ddl-constraints.html#DDL-CONSTRAINTS-EXCLUSION'],
    ['範囲型', 'rangetypes.html#RANGETYPES-CONSTRAINT']
  ]
},
{
  id: 'S3.1-076', level: 'silver', cat: 'S3.1',
  q: 'PostgreSQL のストリーミングレプリケーションに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'プライマリで生成された WAL をスタンバイに送り、スタンバイがそれを適用して、データベースクラスタ全体の複製を保つ',
    '複製するテーブルを1つずつ選べるため、特定のテーブルだけをスタンバイに複製することができる',
    'スタンバイでも INSERT や UPDATE を実行でき、スタンバイで更新した内容はプライマリへ送り返される',
    'プライマリとスタンバイのメジャーバージョンが異なっていても、WAL を送ってそのまま複製を続けられる',
    'プライマリで実行された SQL 文そのものを送り、スタンバイで同じ SQL 文を実行し直して複製する'
  ],
  answer: 0,
  exp: 'ストリーミングレプリケーションは、プライマリが生成した WAL（先行書き込みログ）をスタンバイに送り続け、スタンバイがそれを適用（リカバリ）することで、データベースクラスタ全体を物理的に複製する仕組みです。スタンバイの作成には、pg_basebackup で取得したベースバックアップを使うのが一般的です。\n複製の単位はクラスタ全体で、テーブルを選ぶことはできません。テーブル単位で複製したい場合は、ロジカルレプリケーション（CREATE PUBLICATION / CREATE SUBSCRIPTION）を使います。\nhot_standby = on（既定）のスタンバイでは参照系の問い合わせを実行できますが、更新はできません。\nWAL の形式はメジャーバージョンごとに異なるため、プライマリとスタンバイは同じメジャーバージョンである必要があります。SQL 文を送る方式ではありません。',
  refs: [
    ['ストリーミングレプリケーション', 'warm-standby.html#STREAMING-REPLICATION'],
    ['ホットスタンバイ', 'hot-standby.html'],
    ['異なる解決策の比較', 'different-replication-solutions.html']
  ]
},
{
  id: 'S3.1-077', level: 'silver', cat: 'S3.1',
  q: 'ロジカルレプリケーション（論理レプリケーション）とストリーミングレプリケーションを比べた説明として、正しいものを2つ選びなさい。',
  choices: [
    'ロジカルレプリケーションでは、パブリケーションに含めたテーブルだけを複製できる',
    'ロジカルレプリケーションでは、メジャーバージョンが異なるサーバの間でも複製できる',
    'ストリーミングレプリケーションでは、スタンバイの複製先のテーブルにも書き込める',
    'ロジカルレプリケーションでは、ALTER TABLE などのテーブル定義の変更も複製される',
    'ストリーミングレプリケーションでは、データベースを1つだけ選んで複製することになる'
  ],
  answer: [0, 1],
  exp: 'ロジカルレプリケーションは、テーブルへの変更（INSERT / UPDATE / DELETE / TRUNCATE）を論理的な形式で送る仕組みです。パブリッシャで CREATE PUBLICATION により複製するテーブルを選び、サブスクライバで CREATE SUBSCRIPTION によって購読します。WAL の物理的な形式に依存しないため、メジャーバージョンが異なるサーバ間でも複製でき、バージョンアップにも使われます。\nただし、テーブル定義などのスキーマの変更（DDL）は複製されないため、サブスクライバ側にも同じ定義のテーブルを用意し、変更も両方で行う必要があります。\nストリーミングレプリケーションはクラスタ全体を物理的に複製するため、データベースやテーブルを選ぶことはできず、スタンバイは読み取り専用です。',
  refs: [
    ['論理レプリケーション', 'logical-replication.html'],
    ['論理レプリケーションの制限', 'logical-replication-restrictions.html'],
    ['ストリーミングレプリケーション', 'warm-standby.html#STREAMING-REPLICATION']
  ]
},
{
  id: 'S3.1-078', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: 'bytea 型について、次の SQL を実行した。結果から読み取れる説明として、正しいものを1つ選びなさい。',
  code: '=# SHOW bytea_output;\n bytea_output\n--------------\n hex\n(1 row)\n\n=# SELECT \'abc\'::bytea AS a, length(\'abc\'::bytea) AS len, octet_length(\'あ\'::bytea) AS o;\n    a     | len | o\n----------+-----+---\n \\x616263 |   3 | 3\n(1 row)\n\n=# SET bytea_output = \'escape\';\n=# SELECT \'abc\'::bytea;\n bytea\n-------\n abc\n(1 row)',
  choices: [
    'bytea はバイト列を格納する型で、既定の hex 形式では \\x に続けて各バイトを16進数で表示する',
    'bytea は text 型の別名で、格納するときにデータベースの文字コードへ変換される',
    'length は bytea でも文字数を返すため、「あ」を bytea にした値の length は 1 になる',
    'bytea_output を escape に変えると、格納済みの値が escape 形式に書き換えられる',
    'bytea 型に格納できるのは 255 バイトまでで、それを超える値はエラーになる'
  ],
  answer: 0,
  exp: 'bytea は任意のバイト列（バイナリデータ）を格納するデータ型です。文字列とは異なり、文字コードの変換や解釈は行われません。\n出力形式は bytea_output で決まり、既定の hex では \\x に続けて1バイトを2桁の16進数で表示します。\'abc\' は 0x61 0x62 0x63 なので \\x616263 です。escape にすると、表示できる文字はそのまま、それ以外は \\000 のような8進数で表示されます。変わるのは表示の形式だけで、格納されている値は同じです。\nbytea に対する length と octet_length はバイト数を返します。UTF-8 の「あ」は3バイトなので 3 です。\nbytea は可変長で、1つの値に最大 1GB まで格納できます。',
  evidence: [
    ['bytea の表示形式と長さ（hex と escape）',
      'terms=# SELECT \'abc\'::bytea AS a, length(\'abc\'::bytea) AS len, octet_length(\'あ\'::bytea) AS o, E\'\\\\x414243\'::bytea AS b;\n    a     | len | o |    b\n----------+-----+---+----------\n \\x616263 |   3 | 3 | \\x414243\n(1 row)\n\nterms=# SHOW bytea_output;\n bytea_output\n--------------\n hex\n(1 row)\n\nterms=# SET bytea_output = \'escape\'; SELECT \'abc\'::bytea, \'\\x00ff\'::bytea;\n bytea |  bytea\n-------+----------\n abc   | \\000\\377\n(1 row)']
  ],
  refs: [
    ['バイナリ列データ型', 'datatype-binary.html'],
    ['bytea_output', 'runtime-config-client.html#GUC-BYTEA-OUTPUT'],
    ['バイナリ文字列関数と演算子', 'functions-binarystring.html']
  ]
},
{
  id: 'S3.1-079', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次の SQL を1つのセッションで順に実行した。(1) と (2) の nextval が返す値の組み合わせとして、正しいものを1つ選びなさい。',
  code: 'CREATE SEQUENCE order_no START 100 INCREMENT 10;\nSELECT nextval(\'order_no\'), nextval(\'order_no\');   -- 100 と 110 が返る\n\nBEGIN;\nSELECT nextval(\'order_no\');\nROLLBACK;\n\nSELECT nextval(\'order_no\');                          -- (1)\n\nSELECT setval(\'order_no\', 500, false);\nSELECT nextval(\'order_no\');                          -- (2)',
  choices: [
    '(1) 120　(2) 500',
    '(1) 120　(2) 510',
    '(1) 130　(2) 500',
    '(1) 130　(2) 510',
    '(1) 130　(2) 501'
  ],
  answer: 2,
  exp: 'シーケンスの nextval は、トランザクションをロールバックしても取り消されません。複数のセッションが同時に番号を取得しても待たずに済むようにするためで、そのため採番した値には欠番が生じ得ます。したがって、ロールバックしたトランザクションで 120 が消費され、(1) は 130 になります。\nsetval の第3引数 is_called を false にすると、「まだ値を使っていない」状態で 500 に設定され、次の nextval は 500 を返します。第3引数を省略する（true）と、500 が使用済みとみなされ、次の nextval は 510（500 + INCREMENT 10）になります。\n実機でも、(1) は 130、(2) は 500 でした。また、MAXVALUE に達すると「nextval: reached maximum value of sequence」エラーになり、currval はそのセッションでまだ nextval を呼んでいないとエラーになります。',
  evidence: [
    ['シーケンスの採番を順に実行した結果（MAXVALUE や currval のエラーも）',
      'terms=# CREATE SEQUENCE order_no START 100 INCREMENT 10;\nCREATE SEQUENCE\nterms=# SELECT nextval(\'order_no\'), nextval(\'order_no\');\n nextval | nextval\n---------+---------\n     100 |     110\n(1 row)\n\nterms=# SELECT currval(\'order_no\');\nERROR:  currval of sequence "order_no" is not yet defined in this session\nterms=# BEGIN; SELECT nextval(\'order_no\'); ROLLBACK;\nROLLBACK\nterms=# SELECT nextval(\'order_no\');\n nextval\n---------\n     130\n(1 row)\n\nterms=# SELECT setval(\'order_no\', 500);\n setval\n--------\n    500\n(1 row)\n\nterms=# SELECT nextval(\'order_no\');\n nextval\n---------\n     510\n(1 row)\n\nterms=# SELECT setval(\'order_no\', 500, false);\n setval\n--------\n    500\n(1 row)\n\nterms=# SELECT nextval(\'order_no\');\n nextval\n---------\n     500\n(1 row)\n\nterms=# ALTER SEQUENCE order_no MAXVALUE 520;\nALTER SEQUENCE\nterms=# SELECT nextval(\'order_no\'), nextval(\'order_no\'), nextval(\'order_no\');\nERROR:  nextval: reached maximum value of sequence "order_no" (520)\n(新しいセッション)\nterms=# SELECT currval(\'order_no\');\nERROR:  currval of sequence "order_no" is not yet defined in this session\nterms=# DROP SEQUENCE order_no;\nDROP SEQUENCE']
  ],
  refs: [
    ['シーケンス操作関数', 'functions-sequence.html'],
    ['CREATE SEQUENCE', 'sql-createsequence.html'],
    ['ALTER SEQUENCE', 'sql-altersequence.html']
  ]
},
{
  id: 'S3.1-080', level: 'silver', cat: 'S3.1', type: 'scenario',
  q: '次のようにパーティション化したテーブル sales を作成し、行を挿入した。結果から読み取れる説明として、正しいものを1つ選びなさい。',
  code: '=# CREATE TABLE sales (id int, sold_on date, amount int) PARTITION BY RANGE (sold_on);\n=# CREATE TABLE sales_2023 PARTITION OF sales FOR VALUES FROM (\'2023-01-01\') TO (\'2024-01-01\');\n=# CREATE TABLE sales_2024 PARTITION OF sales FOR VALUES FROM (\'2024-01-01\') TO (\'2025-01-01\');\n=# INSERT INTO sales VALUES (1, \'2023-12-31\', 100), (2, \'2024-01-01\', 200);\nINSERT 0 2\n=# INSERT INTO sales VALUES (3, \'2025-01-01\', 300);\nERROR:  no partition of relation "sales" found for row\nDETAIL:  Partition key of the failing row contains (sold_on) = (2025-01-01).\n=# SELECT tableoid::regclass, * FROM sales ORDER BY id;\n  tableoid  | id |  sold_on   | amount\n------------+----+------------+--------\n sales_2023 |  1 | 2023-12-31 |    100\n sales_2024 |  2 | 2024-01-01 |    200\n(2 rows)',
  choices: [
    '2025-01-01 の行は格納先のパーティションがないためエラーになった。DEFAULT パーティションを作れば、そこに格納される',
    'FROM と TO の範囲は両端を含むため、2024-01-01 の行は sales_2023 と sales_2024 の両方に格納されている',
    '格納先のパーティションがない値の行は、エラーにはならずに親テーブル sales そのものに格納される',
    '既存のパーティションと範囲が重なるパーティションも作成でき、その場合は行が両方のパーティションに格納される',
    'パーティション化テーブルは、通常の CREATE TABLE の後に ALTER TABLE ... PARTITION BY を実行して作成する'
  ],
  answer: 0,
  exp: 'CREATE TABLE ... PARTITION BY でパーティション化テーブル（親）を作り、CREATE TABLE ... PARTITION OF ... FOR VALUES で各パーティションを作ります。範囲パーティションの FROM は含み、TO は含まないため、2024-01-01 の行は sales_2024 だけに格納されています（tableoid で格納先を確認できます）。\n親テーブル自体はデータを持たないため、どのパーティションにも当てはまらない行はエラーになります。CREATE TABLE sales_def PARTITION OF sales DEFAULT; で DEFAULT パーティションを作っておくと、そうした行はそこに格納されます（実機でも 2025-01-01 の行が sales_def に格納されました）。\n既存のパーティションと範囲が重なるパーティションは作成できず、「would overlap partition」エラーになります。パーティション化は作成時に PARTITION BY で指定し、既存の通常のテーブルを後から ALTER TABLE でパーティション化することはできません（既存のテーブルは ATTACH PARTITION でパーティションとして追加できます）。',
  evidence: [
    ['パーティションの作成・INSERT・DEFAULT パーティション・重なりのエラー',
      'terms=# CREATE TABLE sales (id int, sold_on date, amount int) PARTITION BY RANGE (sold_on);\nCREATE TABLE\nterms=# CREATE TABLE sales_2023 PARTITION OF sales FOR VALUES FROM (\'2023-01-01\') TO (\'2024-01-01\');\nCREATE TABLE\nterms=# CREATE TABLE sales_2024 PARTITION OF sales FOR VALUES FROM (\'2024-01-01\') TO (\'2025-01-01\');\nCREATE TABLE\nterms=# INSERT INTO sales VALUES (1, \'2023-12-31\', 100), (2, \'2024-01-01\', 200);\nINSERT 0 2\nterms=# INSERT INTO sales VALUES (3, \'2025-01-01\', 300);\nERROR:  no partition of relation "sales" found for row\nDETAIL:  Partition key of the failing row contains (sold_on) = (2025-01-01).\nterms=# SELECT tableoid::regclass, * FROM sales ORDER BY id;\n  tableoid  | id |  sold_on   | amount\n------------+----+------------+--------\n sales_2023 |  1 | 2023-12-31 |    100\n sales_2024 |  2 | 2024-01-01 |    200\n(2 rows)\n\nterms=# CREATE TABLE sales_2022 PARTITION OF sales FOR VALUES FROM (\'2022-06-01\') TO (\'2023-06-01\');\nERROR:  partition "sales_2022" would overlap partition "sales_2023"\nLINE 1: ...ITION OF sales FOR VALUES FROM (\'2022-06-01\') TO (\'2023-06-0...\n                                                             ^\nterms=# CREATE TABLE sales_def PARTITION OF sales DEFAULT;\nCREATE TABLE\nterms=# INSERT INTO sales VALUES (3, \'2025-01-01\', 300);\nINSERT 0 1\nterms=# SELECT tableoid::regclass, * FROM sales ORDER BY id;\n  tableoid  | id |  sold_on   | amount\n------------+----+------------+--------\n sales_2023 |  1 | 2023-12-31 |    100\n sales_2024 |  2 | 2024-01-01 |    200\n sales_def  |  3 | 2025-01-01 |    300\n(3 rows)\n\nterms=# CREATE TABLE sales_2025 PARTITION OF sales FOR VALUES FROM (\'2025-01-01\') TO (\'2026-01-01\');\nERROR:  updated partition constraint for default partition "sales_def" would be violated by some row\nterms=# CREATE TABLE lst (code text, v int) PARTITION BY LIST (code);\nCREATE TABLE\nterms=# CREATE TABLE lst_a PARTITION OF lst FOR VALUES IN (\'A\', \'B\');\nCREATE TABLE\nterms=# CREATE TABLE hsh (id int) PARTITION BY HASH (id);\nCREATE TABLE\nterms=# CREATE TABLE hsh_0 PARTITION OF hsh FOR VALUES WITH (MODULUS 2, REMAINDER 0);\nCREATE TABLE\nterms=# INSERT INTO hsh VALUES (1), (2), (3), (4);\nERROR:  no partition of relation "hsh" found for row\nDETAIL:  Partition key of the failing row contains (id) = (3).']
  ],
  refs: [
    ['テーブルのパーティショニング', 'ddl-partitioning.html'],
    ['CREATE TABLE', 'sql-createtable.html'],
    ['ALTER TABLE', 'sql-altertable.html']
  ]
},

/* ---------------- S3.2 組み込み関数（重要度 2 / 22問） ---------------- */
{
  id: 'S3.2-001', level: 'silver', cat: 'S3.2', type: 'scenario',
  q: '次の SQL を実行した結果として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE t (id integer, v integer);\nINSERT INTO t VALUES (1, 10), (2, NULL), (3, 30);\nSELECT count(*), count(v), sum(v), avg(v) FROM t;',
  choices: [
    'count=3, count=2, sum=40, avg=20',
    'count=3, count=3, sum=40, avg=13.33…',
    'count=2, count=2, sum=40, avg=20',
    'count=3, count=2, sum=NULL, avg=NULL',
    'count=3, count=3, sum=NULL, avg=NULL'
  ],
  answer: 0,
  exp: 'count(*) は NULL を含むすべての行数（3）を数えます。count(v) や sum(v)、avg(v) などの集約関数は NULL の入力を無視するため、count(v)=2、sum(v)=10+30=40、avg(v)=40/2=20 となります（avg の結果は numeric 型で 20.0000000000000000 と表示されます）。\nなお、入力行が0行、またはすべて NULL の場合、count 以外の集約関数は NULL を返します。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE t (id integer, v integer);\nCREATE TABLE\nINSERT INTO t VALUES (1, 10), (2, NULL), (3, 30);\nINSERT 0 3\nSELECT count(*), count(v), sum(v), avg(v) FROM t;\n count | count | sum |         avg\n-------+-------+-----+---------------------\n     3 |     2 |  40 | 20.0000000000000000\n(1 row)']
  ],
  refs: [
    ['集約関数', 'functions-aggregate.html'],
    ['集約式', 'sql-expressions.html#SYNTAX-AGGREGATES']
  ]
},
{
  id: 'S3.2-002', level: 'silver', cat: 'S3.2',
  q: '次の SQL を UTF8 のデータベースで実行した結果として、正しいものを1つ選びなさい。',
  code: 'SELECT substring(\'PostgreSQL\' from 5 for 3),\n       \'Postgres\' || NULL,\n       char_length(\'データ\');',
  choices: [
    'gre | NULL | 3',
    'tgr | Postgres | 3',
    'gre | Postgres | 9',
    'gre | NULL | 9',
    'tgre | NULL | 3'
  ],
  answer: 0,
  exp: 'substring(文字列 from 開始位置 for 文字数) は、開始位置（1始まり）から指定した文字数を取り出します。\'PostgreSQL\' の5文字目から3文字なので \'gre\' です。\n文字列連結演算子 || は、どちらかの入力が NULL の場合は結果も NULL になります（NULL を無視して連結したい場合は concat() 関数を使います）。\nchar_length() は文字数を返すため \'データ\' は 3 です。バイト数を返す octet_length() では UTF8 で 9 になります。',
  refs: [
    ['文字列関数と演算子', 'functions-string.html']
  ]
},
{
  id: 'S3.2-003', level: 'silver', cat: 'S3.2',
  q: '現在日時を返す関数に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'now() は、同じトランザクション内でも呼び出されるたびにその瞬間の時刻を返す',
    'current_timestamp は clock_timestamp() の別名で、呼び出しごとに値が変わる',
    'now() はトランザクション開始時刻を返し、clock_timestamp() は呼び出し時点の時刻を返す',
    'current_date は、現在の日付と時刻の両方を timestamp 型で返す',
    'age() 関数は、引数を指定しないと PostgreSQL サーバの起動時刻を返す'
  ],
  answer: 2,
  exp: 'now()、current_timestamp、transaction_timestamp() はいずれも現在のトランザクションの開始時刻を返すため、同じトランザクション内では同じ値になります。statement_timestamp() は現在の文の開始時刻、clock_timestamp() は関数を呼び出した実際の時刻を返し、1つの文の中でも値が変わります。\ncurrent_date は日付のみを返します。age(timestamp) は現在の日付（午前0時）からの経過期間を interval で返す関数です。',
  refs: [
    ['現在の日付/時刻', 'functions-datetime.html#FUNCTIONS-DATETIME-CURRENT'],
    ['日付/時刻関数と演算子', 'functions-datetime.html']
  ]
},
{
  id: 'S3.2-004', level: 'silver', cat: 'S3.2',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'SELECT extract(month FROM date \'2026-09-16\'),\n       to_char(date \'2026-09-16\', \'YYYY/MM/DD\');',
  choices: [
    '9 | 2026/09/16',
    '09 | 2026-09-16',
    '16 | 2026/09/16',
    '9 | 16/09/2026',
    'September | 2026/09/16'
  ],
  answer: 0,
  exp: 'extract(field FROM source) は日付・時刻の値から指定したフィールドを数値で取り出します。month を指定すると月が 9 として返されます（先頭の 0 は付きません）。year、day、dow（曜日）、epoch なども指定できます。\nto_char(値, 書式) は日付・数値を書式に従った文字列に変換します。YYYY は4桁の年、MM は2桁の月、DD は2桁の日を表すため、\'2026/09/16\' になります。月の名前にしたい場合は Month などの書式を使います。',
  refs: [
    ['EXTRACT、date_part', 'functions-datetime.html#FUNCTIONS-DATETIME-EXTRACT'],
    ['データ型書式設定関数', 'functions-formatting.html']
  ]
},
{
  id: 'S3.2-005', level: 'silver', cat: 'S3.2',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'SELECT round(2.5), trunc(-2.7), 7 / 2, 7 % 2;',
  choices: [
    '3 | -2 | 3 | 1',
    '2 | -3 | 3.5 | 1',
    '3 | -3 | 3 | 1',
    '2 | -2 | 3.5 | 1',
    '3 | -2 | 3.5 | 0'
  ],
  answer: 0,
  exp: '・round(2.5): numeric 型の round は四捨五入（0.5 は0から遠い方向に丸める）するため 3\n・trunc(-2.7): 0 の方向に切り捨てるため -2（floor(-2.7) なら -3）\n・7 / 2: 整数同士の除算は小数部が切り捨てられるため 3（7.0 / 2 なら 3.5000000000000000）\n・7 % 2: 剰余は 1（mod(7, 2) と同じ）\n整数の除算による切り捨ては、SQL の計算結果が想定と異なる典型的な原因の一つです。',
  refs: [
    ['数学関数と演算子', 'functions-math.html']
  ]
},
{
  id: 'S3.2-006', level: 'silver', cat: 'S3.2',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'SELECT \'abc\' LIKE \'a_c\', \'abc\' SIMILAR TO \'a%\', \'abc\' ~ \'^b\';',
  choices: [
    't | t | f',
    't | f | f',
    'f | t | t',
    't | t | t',
    'f | f | f'
  ],
  answer: 0,
  exp: '・LIKE では _ が任意の1文字、% が0文字以上の任意の文字列に一致します。\'a_c\' は \'abc\' に一致するため t（真）です。\n・SIMILAR TO は LIKE と同じ _ と % に加え、正規表現風の | や * なども使える SQL 標準の演算子で、文字列全体との一致を判定します。\'a%\' は \'abc\' に一致するため t です。\n・~ は POSIX 正規表現による一致判定で、部分一致です。^b は「b で始まる」を意味するため、\'abc\' には一致せず f（偽）です。大文字小文字を区別しない ~* や、否定の !~ もあります。',
  refs: [
    ['パターンマッチ', 'functions-matching.html']
  ]
},
{
  id: 'S3.2-007', level: 'silver', cat: 'S3.2',
  q: '`SELECT 10 / 4, 10 / 4.0;` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    '2.5 | 2.5',
    '3 | 2.5',
    '2 | 2',
    '2.5 | 2',
    '2 | 2.5000000000000000'
  ],
  answer: 4,
  shuffle: false,
  exp: '整数（integer）同士の除算では、結果も整数になり、小数点以下は切り捨てられるため 10 / 4 は 2 です。\n4.0 のように小数点を含む定数は numeric 型として扱われるため、10 / 4.0 は numeric の除算になり 2.5000000000000000 のような結果になります。\n整数の列同士で割合を計算する場合は、a::numeric / b や a * 1.0 / b のように、どちらかを numeric（または double precision）に変換してから除算します。',
  refs: [
    ['数学関数と演算子', 'functions-math.html'],
    ['数値定数', 'sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS-NUMERIC']
  ]
},
{
  id: 'S3.2-008', level: 'silver', cat: 'S3.2',
  q: '`SELECT position(\'SQL\' in \'PostgreSQL\'), left(\'PostgreSQL\', 4), upper(right(\'postgresql\', 3));` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    '8 | Post | SQL',
    '7 | Post | SQL',
    '8 | Pos | sql',
    '9 | Postg | SQL',
    '8 | Post | QL'
  ],
  answer: 0,
  exp: '・position(部分文字列 in 文字列) は、部分文字列が最初に現れる位置（1始まり）を返します。\'PostgreSQL\' では S が8文字目なので 8 です（見つからない場合は 0）。strpos(文字列, 部分文字列) も同じ働きをします。\n・left(文字列, n) は先頭から n 文字を返すため \'Post\' です。\n・right(文字列, n) は末尾から n 文字を返すため \'sql\'、upper() で大文字に変換して \'SQL\' になります。\nsubstring() と組み合わせて、文字列の一部を取り出す処理によく使われます。',
  refs: [
    ['文字列関数と演算子', 'functions-string.html']
  ]
},
{
  id: 'S3.2-009', level: 'silver', cat: 'S3.2',
  q: '`SELECT trim(\'  pg  \'), replace(\'a-b-c\', \'-\', \'\'), lpad(\'7\', 3, \'0\');` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    'pg | abc | 007',
    '  pg | abc | 700',
    'pg | a b c | 007',
    'pg   | abc | 7',
    'pg | a-b-c | 007'
  ],
  answer: 0,
  exp: '・trim(文字列) は、先頭と末尾の空白を取り除くため \'pg\' になります。ltrim() / rtrim() で片側だけを取り除けます。\n・replace(文字列, 検索文字列, 置換文字列) は、すべての検索文字列を置換するため、\'-\' を空文字列に置き換えて \'abc\' になります。\n・lpad(文字列, 長さ, 埋め文字) は、指定した長さになるまで左側を埋め文字で埋めるため \'007\' になります。右側を埋める rpad() もあります。\nゼロ埋めの番号を作る場合は、to_char(7, \'FM000\') も使えます。',
  refs: [
    ['文字列関数と演算子', 'functions-string.html']
  ]
},
{
  id: 'S3.2-010', level: 'silver', cat: 'S3.2',
  q: '`SELECT date_trunc(\'month\', timestamp \'2026-09-16 10:20:30\');` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    '2026-01-01 00:00:00',
    '2026-09-01 00:00:00',
    '2026-09-16 00:00:00',
    '2026-09-16 10:00:00',
    '2026-09-30 00:00:00'
  ],
  answer: 1,
  shuffle: false,
  exp: 'date_trunc(精度, 値) は、日付・時刻の値を指定した精度より下の部分を切り捨てた値を返します。\'month\' を指定すると、日以下が切り捨てられて月の初日の 0 時（2026-09-01 00:00:00）になります。\n\'year\' なら 2026-01-01 00:00:00、\'day\' なら 2026-09-16 00:00:00、\'hour\' なら 2026-09-16 10:00:00 になります。\n月ごとの集計（GROUP BY date_trunc(\'month\', order_date)）でよく使われます。月末日は date_trunc(\'month\', 値) + interval \'1 month\' - interval \'1 day\' などで求めます。',
  refs: [
    ['date_trunc', 'functions-datetime.html#FUNCTIONS-DATETIME-TRUNC']
  ]
},
{
  id: 'S3.2-011', level: 'silver', cat: 'S3.2',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'SELECT string_agg(name, \',\' ORDER BY name)\n  FROM (VALUES (\'b\'), (\'a\'), (\'c\')) AS t(name);',
  choices: [
    'a,b,c',
    'b,a,c',
    'abc',
    '{a,b,c}',
    'c,b,a'
  ],
  answer: 0,
  exp: 'string_agg(値, 区切り文字) は、グループ内の文字列を区切り文字でつないで1つの文字列にする集約関数です。集約関数の引数の後に ORDER BY を書くと、連結する順序を指定できるため、name の昇順で \'a,b,c\' になります。ORDER BY を指定しない場合の順序は保証されません。\n配列にまとめる場合は array_agg(name ORDER BY name) を使い、結果は {a,b,c} のような配列になります。\nVALUES リストは、FROM 句でテーブルのように使える定数の行の集合です。',
  refs: [
    ['集約関数', 'functions-aggregate.html'],
    ['VALUESリスト', 'queries-values.html']
  ]
},
{
  id: 'S3.2-012', level: 'silver', cat: 'S3.2',
  q: '`SELECT CAST(\'2026-09-16\' AS date) + 1, \'123\'::integer + 1, to_number(\'1,234\', \'9,999\');` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    '2026-09-17 | 124 | 1234',
    '2026-09-16 00:00:01 | 124 | 1,234',
    '2026-10-16 | 1231 | 1234',
    '2026-09-17 | 1231 | 1,234',
    '日付に整数を加算できないためエラーになる'
  ],
  answer: 0,
  exp: '・CAST(値 AS 型) と 値::型 は、どちらも型変換（キャスト）の構文です。date 型に整数を加算すると、その日数だけ進んだ date 型の値になるため 2026-09-17 です。\n・\'123\'::integer は文字列を整数に変換するため、1 を加えて 124 になります（文字列の連結ではありません）。\n・to_number(文字列, 書式) は、書式に従って文字列を数値に変換する関数で、カンマ区切りの \'1,234\' を 1234 に変換します。数値を書式付きの文字列にするのは to_char() です。',
  refs: [
    ['型変換（キャスト）', 'sql-expressions.html#SQL-SYNTAX-TYPE-CASTS'],
    ['データ型書式設定関数', 'functions-formatting.html']
  ]
},
{
  id: 'S3.2-013', level: 'silver', cat: 'S3.2', type: 'scenario',
  q: '次の SQL の実行結果として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE t (v integer);\nINSERT INTO t VALUES (10), (NULL), (20);\n\nSELECT count(*), count(v), sum(v), avg(v) FROM t;',
  choices: [
    '3、2、30、15',
    '3、3、30、10',
    '2、2、30、15',
    '3、2、NULL、NULL',
    '3、3、NULL、NULL'
  ],
  answer: 0,
  exp: 'count(*) は行数そのものを数えるので 3 です。count(列) は NULL でない値だけを数えるため 2 になります。\nsum() や avg() などの集約関数は NULL を無視して計算します。したがって sum(v) は 10 + 20 = 30、avg(v) は NULL を除いた2件の平均で 15 です。\nこのように、NULL を含む列で平均を求めるときは「NULL を 0 とみなした平均」にはならない点に注意が必要です。0 として扱いたい場合は avg(coalesce(v, 0)) のようにします。\nなお、行が1行もない場合、count() は 0 を返しますが sum() と avg() は NULL を返します。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE t (v integer);\nCREATE TABLE\nINSERT INTO t VALUES (10), (NULL), (20);\nINSERT 0 3\nSELECT count(*), count(v), sum(v), avg(v) FROM t;\n count | count | sum |         avg\n-------+-------+-----+---------------------\n     3 |     2 |  30 | 15.0000000000000000\n(1 row)']
  ],
  refs: [
    ['集約関数', 'functions-aggregate.html'],
    ['集約関数', 'tutorial-agg.html']
  ]
},
{
  id: 'S3.2-014', level: 'silver', cat: 'S3.2',
  q: '`SELECT \'ab\' || NULL, concat(\'ab\', NULL);` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    'NULL と ab',
    'ab と ab',
    'NULL と NULL',
    'ab と NULL',
    '連結演算子に NULL は使えないためエラーになる'
  ],
  answer: 0,
  exp: '文字列連結演算子 || は、どちらかの引数が NULL であれば結果も NULL になります。これは「NULL を含む演算の結果は NULL」という一般的な規則に従ったものです。\n一方 concat() 関数は NULL の引数を空文字列として扱って無視するため、\'ab\' が返ります。\n同様に concat_ws(区切り文字, ...) も NULL の引数を読み飛ばします。\n|| を使いつつ NULL を空文字として扱いたい場合は、coalesce(v, \'\') を組み合わせます。',
  refs: [
    ['文字列関数と演算子', 'functions-string.html'],
    ['比較関数と演算子', 'functions-comparison.html']
  ]
},
{
  id: 'S3.2-015', level: 'silver', cat: 'S3.2',
  q: '`SELECT to_char(1234.5, \'FM9999.00\'), to_char(date \'2026-09-16\', \'YYYY/MM/DD\');` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    '1234.50 と 2026/09/16',
    '1234.5 と 2026/09/16',
    '1234.50 と 2026-09-16',
    '1,234.50 と 20260916',
    'to_char は数値には使用できないためエラーになる'
  ],
  answer: 0,
  exp: 'to_char() は数値や日付/時刻を、指定した書式のテキストに変換する関数です。\n数値の書式で 9 は桁（値がなければ空白）、0 は桁（値がなければ 0）を表します。\'FM9999.00\' の 00 により小数第2位まで 0 詰めされ、FM 接頭辞が余分な空白を取り除くため \'1234.50\' になります。\n日付の書式では YYYY が4桁の年、MM が2桁の月、DD が2桁の日なので \'2026/09/16\' になります。区切り文字はそのまま出力されます。\n逆方向の変換には to_number()、to_date()、to_timestamp() を使います。',
  refs: [
    ['データ型書式設定関数', 'functions-formatting.html']
  ]
},
{
  id: 'S3.2-016', level: 'silver', cat: 'S3.2',
  q: '`SELECT generate_series(1, 5, 2);` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    '1、3、5 の3行',
    '1、2、3、4、5 の5行',
    '{1,3,5} という配列が1行',
    '1、5、2 の3行',
    '3行目の引数は指定できないためエラーになる'
  ],
  answer: 0,
  exp: 'generate_series(開始, 終了, 刻み) は、指定した間隔で連番を「行」として返す集合返却関数です。この例では 1 から 5 まで 2 ずつなので、1、3、5 の3行が返ります。刻みを省略すると 1 です。\n日付にも使え、`generate_series(date \'2026-01-01\', date \'2026-01-31\', interval \'1 day\')` のようにカレンダーを作れます。欠損日を埋めた集計やテストデータの生成でよく使われます。\n返るのは配列ではなく複数行なので、FROM 句に書いて他のテーブルと結合できます。',
  refs: [
    ['集合を返す関数', 'functions-srf.html']
  ]
},
{
  id: 'S3.2-017', level: 'silver', cat: 'S3.2',
  q: '`SELECT format(\'%s は %s 件\', \'東京\', 12);` の実行結果として、正しいものを1つ選びなさい。',
  choices: [
    '東京 は 12 件',
    '%s は %s 件',
    '東京 は 12 件（ただし数値は文字列に変換できないためエラー）',
    '東京12件',
    '引数の数が合わないためエラーになる'
  ],
  answer: 0,
  exp: 'format() は書式文字列に従って値を埋め込む関数です。%s は値をテキストに変換して埋め込むため、数値 12 もそのまま渡せます。結果は「東京 は 12 件」になります。\n%I は識別子（テーブル名や列名）として、%L はリテラル（文字列）として適切に引用符を付けて埋め込みます。動的に SQL 文を組み立てる際、%I と %L を使うと引用符の付け忘れや SQL インジェクションを避けられます。\n`%%` はパーセント記号そのものを表します。',
  refs: [
    ['文字列関数と演算子', 'functions-string.html#FUNCTIONS-STRING-FORMAT']
  ]
},
{
  id: 'S3.2-018', level: 'silver', cat: 'S3.2',
  q: 'PostgreSQL 14 で追加された `date_bin()` 関数に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '指定した間隔と基準時刻で、タイムスタンプを等間隔の区切りにそろえる',
    '日付を2進数に変換する関数である',
    'date_trunc() の別名であり、動作はまったく同じである',
    '2つの日付の差を日数で返す関数である',
    '日付が有効かどうかを判定する関数である'
  ],
  answer: 0,
  exp: 'date_bin(間隔, タイムスタンプ, 基準時刻) は、基準時刻から指定した間隔で区切ったときに、そのタイムスタンプがどの区間に入るかを返します。たとえば `date_bin(\'15 minutes\', ts, timestamp \'2026-01-01\')` とすれば、15分単位に丸めた集計ができます。\ndate_trunc() は年・月・日・時といった決まった単位にしか丸められないため、「5分ごと」「15分ごと」のような集計はこちらが適しています。\n時系列データを一定間隔で集計するグラフ表示などでよく使われます。',
  refs: [
    ['日付/時刻関数と演算子', 'functions-datetime.html']
  ]
},
{
  id: 'S3.2-019', level: 'silver', cat: 'S3.2',
  q: 'jsonb に対する SQL/JSON パス式に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '`$.items[*].name` のような書き方で抽出でき、PostgreSQL 12 以降で使える',
    'PostgreSQL 14 では利用できないため、`->` と `->>` だけを使うことになる',
    'パス式は json 型にのみ使用でき、jsonb 型には使えない',
    'パス式は必ず1つの値を返すため、複数の要素を取り出すことはできない',
    'パス式による検索にはインデックスを利用できない'
  ],
  answer: 0,
  exp: 'PostgreSQL 12 で SQL/JSON パス式が導入され、jsonpath 型と jsonb_path_query()、jsonb_path_exists()、jsonb_path_match() などの関数、`@?` や `@@` といった演算子が使えるようになりました。\n`$.items[*].name` のようにネストした構造から複数の要素を取り出せ、`$.price ? (@ > 100)` のようなフィルタも書けます。\njsonb_path_query() は集合を返す関数なので複数行を返します。1つの jsonb にまとめたい場合は jsonb_path_query_array() を使います。\njsonb 列に GIN インデックス（jsonb_path_ops など）を作れば、`@?` や `@>` による検索を高速化できます。',
  refs: [
    ['JSON関数と演算子', 'functions-json.html#FUNCTIONS-SQLJSON-PATH'],
    ['jsonbのインデックス', 'datatype-json.html#JSON-INDEXING']
  ]
},
{
  id: 'S3.2-020', level: 'silver', cat: 'S3.2', type: 'scenario',
  q: 'テーブル emp の内容が次のとき、集約関数の結果について正しいものを2つ選びなさい。',
  code: '=# SELECT * FROM emp;\n  name  | dept | salary\n--------+------+--------\n Sato   | dev  |    500\n suzuki | dev  |\n Tanaka | ops  |    400\n ito    | ops  |\n Kato   |      |    300\n(5 rows)',
  choices: [
    'SELECT max(salary), min(salary) FROM emp; の結果は 500 と 300 になる',
    'SELECT max(salary) FROM emp WHERE dept = \'none\'; の結果は NULL になる',
    'SELECT count(salary) FROM emp; の結果は、NULL の行も数えるため 5 になる',
    'SELECT name FROM emp WHERE salary = max(salary); で最高給の name が得られる',
    'max と min は数値型専用のため、SELECT max(name) FROM emp; はエラーになる'
  ],
  answer: [0, 1],
  exp: 'max や min などの集約関数は、NULL の行を無視して計算します。salary が NULL でない 500、400、300 の中で、max は 500、min は 300 です。count(*) は行数の 5 を、count(salary) は NULL でない値の数の 3 を返します。\n対象の行が1行もない場合、count 以外の集約関数は 0 ではなく NULL を返します。\n集約関数は WHERE 句では使えず、「aggregate functions are not allowed in WHERE」エラーになります。最高給の行を得るには、WHERE salary = (SELECT max(salary) FROM emp) のように副問い合わせを使います。\nmax と min は、文字列や日付など大小を比較できる型にも使えます。実機では max(name) が suzuki、min(name) が Kato でした（並び順は照合順序によります）。',
  evidence: [
    ['集約関数の結果と、WHERE 句で集約関数を使った場合',
      'terms=# CREATE TABLE emp (name text, dept text, salary int); INSERT INTO emp VALUES (\'Sato\',\'dev\',500), (\'suzuki\',\'dev\',NULL), (\'Tanaka\',\'ops\',400), (\'ito\',\'ops\',NULL), (\'Kato\',NULL,300);\nINSERT 0 5\nterms=# SELECT max(salary), min(salary), count(*), count(salary), max(name), min(name) FROM emp;\n max | min | count | count |  max   | min\n-----+-----+-------+-------+--------+------\n 500 | 300 |     5 |     3 | suzuki | Kato\n(1 row)\n\nterms=# SELECT dept, max(salary), min(salary) FROM emp GROUP BY dept ORDER BY dept;\n dept | max | min\n------+-----+-----\n dev  | 500 | 500\n ops  | 400 | 400\n      | 300 | 300\n(3 rows)\n\nterms=# SELECT max(lower(name)), min(upper(name)) FROM emp;\n  max   | min\n--------+-----\n tanaka | ITO\n(1 row)\n\nterms=# SELECT lower(\'ÄBC Postgres\'), upper(\'abc_ßx\'), lower(NULL) IS NULL AS n;\n    lower     | upper  | n\n--------------+--------+---\n äbc postgres | ABC_ßX | t\n(1 row)\n\nterms=# SELECT name FROM emp WHERE salary = max(salary);\nERROR:  aggregate functions are not allowed in WHERE\nLINE 1: SELECT name FROM emp WHERE salary = max(salary);\n                                            ^\nterms=# SELECT max(salary) FROM emp WHERE dept = \'none\';\n max\n-----\n\n(1 row)']
  ],
  refs: [
    ['集約関数', 'functions-aggregate.html'],
    ['集約関数（チュートリアル）', 'tutorial-agg.html']
  ]
},
{
  id: 'S3.2-021', level: 'silver', cat: 'S3.2',
  q: 'テーブル users の name 列には、\'Sato\'、\'SATO\'、\'sato\' のように大文字と小文字が混在した値が入っている。大文字と小文字を区別せずに sato という名前の行をすべて取得する SQL として、適切なものを1つ選びなさい。',
  choices: [
    'SELECT * FROM users WHERE lower(name) = \'sato\';',
    'SELECT * FROM users WHERE name = lower(\'Sato\');',
    'SELECT * FROM users WHERE lower(name) = \'Sato\';',
    'SELECT * FROM users WHERE upper(name) = \'sato\';',
    'SELECT * FROM users WHERE name LIKE \'sato\';'
  ],
  answer: 0,
  exp: 'lower は文字列を小文字に、upper は大文字に変換します。列の値を lower で小文字にそろえてから、小文字の \'sato\' と比較すれば、Sato、SATO、sato のすべてが一致します。\nname = lower(\'Sato\') は定数の側だけを小文字にしているため、sato の行しか一致しません。lower(name) = \'Sato\' や upper(name) = \'sato\' は、変換後の値と比較する値の大文字・小文字が合っていないため、どの行とも一致しません。\nLIKE は大文字と小文字を区別するため、sato の行しか一致しません。大文字と小文字を区別しないパターン照合には ILIKE を使います。\nなお、lower(name) で検索することが多い場合は、lower(name) に対する式インデックスを作成すると、インデックスを利用できます。',
  evidence: [
    ['lower / upper の動作',
      'terms=# CREATE TABLE emp (name text, dept text, salary int); INSERT INTO emp VALUES (\'Sato\',\'dev\',500), (\'suzuki\',\'dev\',NULL), (\'Tanaka\',\'ops\',400), (\'ito\',\'ops\',NULL), (\'Kato\',NULL,300);\nINSERT 0 5\nterms=# SELECT max(salary), min(salary), count(*), count(salary), max(name), min(name) FROM emp;\n max | min | count | count |  max   | min\n-----+-----+-------+-------+--------+------\n 500 | 300 |     5 |     3 | suzuki | Kato\n(1 row)\n\nterms=# SELECT dept, max(salary), min(salary) FROM emp GROUP BY dept ORDER BY dept;\n dept | max | min\n------+-----+-----\n dev  | 500 | 500\n ops  | 400 | 400\n      | 300 | 300\n(3 rows)\n\nterms=# SELECT max(lower(name)), min(upper(name)) FROM emp;\n  max   | min\n--------+-----\n tanaka | ITO\n(1 row)\n\nterms=# SELECT lower(\'ÄBC Postgres\'), upper(\'abc_ßx\'), lower(NULL) IS NULL AS n;\n    lower     | upper  | n\n--------------+--------+---\n äbc postgres | ABC_ßX | t\n(1 row)\n\nterms=# SELECT name FROM emp WHERE salary = max(salary);\nERROR:  aggregate functions are not allowed in WHERE\nLINE 1: SELECT name FROM emp WHERE salary = max(salary);\n                                            ^\nterms=# SELECT max(salary) FROM emp WHERE dept = \'none\';\n max\n-----\n\n(1 row)']
  ],
  refs: [
    ['文字列関数と演算子', 'functions-string.html'],
    ['LIKE / ILIKE', 'functions-matching.html#FUNCTIONS-LIKE'],
    ['式に対するインデックス', 'indexes-expressional.html']
  ]
},
{
  id: 'S3.2-022', level: 'silver', cat: 'S3.2',
  q: 'current_time、localtime、current_date に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'current_time は time with time zone 型の値を返し、22:20:55+09 のように時差を付けて表示される',
    'current_time は関数なので、current_time() のように括弧を付けて呼び出さないとエラーになる',
    'current_time は同じトランザクションの中でも、呼び出すたびにその時点の時刻を返す',
    'localtime は、タイムゾーンの情報を持つ timestamp with time zone 型の値を返す',
    'current_date は date 型ではなく、時刻部分を 00:00:00 にした timestamp 型の値を返す'
  ],
  answer: 0,
  exp: 'current_time は time with time zone 型、localtime は time without time zone 型、current_date は date 型、current_timestamp は timestamp with time zone 型の値を返します（実機で pg_typeof により確認できます）。TimeZone が Asia/Tokyo なら、current_time は 22:20:55+09 のように時差付きで表示されます。\nこれらは SQL 標準の特別な構文で、括弧を付けずに書きます。current_time() と書くと構文エラーになります。精度を指定する current_time(0) のような書き方は可能です。\ncurrent_time や current_timestamp は現在のトランザクションの開始時刻を返すため、同じトランザクション内では何度呼んでも同じ値です。実行時点の時刻が必要な場合は clock_timestamp() を使います。',
  evidence: [
    ['current_time などが返す型と値',
      'terms=# SHOW TimeZone;\n TimeZone\n----------\n UTC\n(1 row)\n\nterms=# SELECT pg_typeof(current_time) AS t1, pg_typeof(localtime) AS t2, pg_typeof(current_date) AS t3, pg_typeof(current_timestamp) AS t4;\n         t1          |           t2           |  t3  |            t4\n---------------------+------------------------+------+--------------------------\n time with time zone | time without time zone | date | timestamp with time zone\n(1 row)\n\nterms=# SET TimeZone = \'Asia/Tokyo\'; SELECT current_time(0), localtime(0), current_date;\n current_time | localtime | current_date\n--------------+-----------+--------------\n 22:20:55+09  | 22:20:55  | 2026-09-18\n(1 row)\n\nterms=# BEGIN; SELECT current_time(3) AS a, clock_timestamp()::time(3) AS c; SELECT pg_sleep(1.5); SELECT current_time(3) AS a, clock_timestamp()::time(3) AS c; COMMIT;\nCOMMIT\nterms=# SELECT current_time();\nERROR:  syntax error at or near ")"\nLINE 1: SELECT current_time();\n                            ^']
  ],
  refs: [
    ['現在の日付・時刻', 'functions-datetime.html#FUNCTIONS-DATETIME-CURRENT'],
    ['日付/時刻データ型', 'datatype-datetime.html']
  ]
},

/* ---------------- S3.3 トランザクションの概念（重要度 1 / 11問） ---------------- */
{
  id: 'S3.3-001', level: 'silver', cat: 'S3.3',
  q: 'PostgreSQL のトランザクション分離レベルに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '既定の分離レベルは SERIALIZABLE である',
    'READ UNCOMMITTED を指定すると、READ COMMITTED と同じ動作になる',
    'REPEATABLE READ では、ファントムリードが発生する',
    'SERIALIZABLE では、直列化失敗（serialization failure）によるエラーが発生することはない',
    'SET TRANSACTION による分離レベルの変更は、トランザクション内で最初の問い合わせを実行した後でも可能である'
  ],
  answer: 1,
  exp: 'PostgreSQL の既定の分離レベルは READ COMMITTED です。READ UNCOMMITTED を指定すると READ COMMITTED と同じ動作になり、ダーティリードは発生しません。\nSQL 標準では REPEATABLE READ でファントムリードが許容されますが、PostgreSQL の実装では発生しません。\nREPEATABLE READ や SERIALIZABLE では直列化失敗のエラーが発生しうるため、アプリケーション側でリトライが必要です。\nSET TRANSACTION は、そのトランザクションで最初の問い合わせやデータ変更文を実行する前に行う必要があります。',
  refs: [
    ['トランザクションの分離', 'transaction-iso.html'],
    ['SET TRANSACTION', 'sql-set-transaction.html']
  ]
},
{
  id: 'S3.3-002', level: 'silver', cat: 'S3.3', type: 'scenario',
  q: '空のテーブル t（列 id integer）に対して次の SQL を実行した後、t に格納されている id の値として正しいものを1つ選びなさい。',
  code: 'BEGIN;\nINSERT INTO t VALUES (1);\nSAVEPOINT sp1;\nINSERT INTO t VALUES (2);\nROLLBACK TO SAVEPOINT sp1;\nINSERT INTO t VALUES (3);\nCOMMIT;',
  choices: [
    '1',
    '1, 2, 3',
    '1, 3',
    '3',
    '行は格納されていない'
  ],
  answer: 2,
  shuffle: false,
  exp: 'SAVEPOINT はトランザクション内に目印を設定し、ROLLBACK TO SAVEPOINT でその時点以降の変更だけを取り消します。トランザクション自体は継続します。\nこの例では、SAVEPOINT sp1 以降に挿入した 2 が取り消され、その後に挿入した 3 と、sp1 より前に挿入した 1 が COMMIT で確定します。したがって格納されている値は 1 と 3 です。\nなお、ROLLBACK TO SAVEPOINT を実行してもセーブポイント sp1 自体は残ります（RELEASE SAVEPOINT で破棄できます）。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'BEGIN;\nBEGIN\nINSERT INTO t VALUES (1);\nINSERT 0 1\nSAVEPOINT sp1;\nSAVEPOINT\nINSERT INTO t VALUES (2);\nINSERT 0 1\nROLLBACK TO SAVEPOINT sp1;\nROLLBACK\nINSERT INTO t VALUES (3);\nINSERT 0 1\nCOMMIT;\nCOMMIT\nSELECT * FROM t ORDER BY id;\n id\n----\n  1\n  3\n(2 rows)']
  ],
  refs: [
    ['SAVEPOINT', 'sql-savepoint.html'],
    ['ROLLBACK TO SAVEPOINT', 'sql-rollback-to.html'],
    ['トランザクション（チュートリアル）', 'tutorial-transactions.html']
  ]
},
{
  id: 'S3.3-003', level: 'silver', cat: 'S3.3',
  q: '`SELECT ... FOR UPDATE` に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    '対象テーブル全体に排他ロックをかけ、他のトランザクションは別の行も更新できなくなる',
    '取得した行をロックし、他のトランザクションからの通常の SELECT もトランザクション終了まで待たせる',
    '取得した行のロックは、SELECT 文の実行が終わった時点で解放される',
    '取得した行をロックし、他のトランザクションによるその行の更新や削除をトランザクション終了まで待たせる',
    'FOR SHARE を指定すると、他のトランザクションはロックした行を自由に更新できる'
  ],
  answer: 3,
  exp: 'SELECT ... FOR UPDATE は、問い合わせで取得した行に行ロックをかけます。他のトランザクションがその行を UPDATE、DELETE、SELECT FOR UPDATE などしようとすると、ロックを保持するトランザクションが終了（COMMIT / ROLLBACK）するまで待たされます。行ロックはトランザクションの終了時に解放されます。\n通常の SELECT は MVCC により行ロックの影響を受けず、ブロックされません。\nFOR SHARE は共有ロックで、他のトランザクションも FOR SHARE は取得できますが、行の更新や削除は待たされます。NOWAIT や SKIP LOCKED を付けると、待たずにエラーにしたり、ロック中の行を読み飛ばしたりできます。',
  refs: [
    ['行レベルロック', 'explicit-locking.html#LOCKING-ROWS'],
    ['SELECT（ロック句）', 'sql-select.html#SQL-FOR-UPDATE-SHARE']
  ]
},
{
  id: 'S3.3-004', level: 'silver', cat: 'S3.3',
  q: 'デッドロックが発生した場合の PostgreSQL の動作として、正しいものを1つ選びなさい。',
  choices: [
    '関与するトランザクションは互いに永久に待ち続けるため、管理者がサーバを再起動する必要がある',
    'デッドロックを検出すると、関与するトランザクションのうち1つをエラーにして中断させる',
    'デッドロックを検出すると、関与するすべてのトランザクションが自動的にコミットされる',
    '必ず最も古く開始したトランザクションがエラーになる',
    'PostgreSQL は行ロックを使わないため、デッドロックは発生しない'
  ],
  answer: 1,
  exp: '2つ以上のトランザクションが互いに相手の保持するロックを待つとデッドロックになります。PostgreSQL はロック待ちが deadlock_timeout（既定 1s）を超えるとデッドロックの検査を行い、検出した場合は関与するトランザクションのうち1つを「deadlock detected」エラーで中断（アボート）させ、残りのトランザクションの処理を続けさせます。どのトランザクションが中断されるかは予測できません。\nデッドロックを避けるには、複数の行やテーブルをロックする場合に、すべてのトランザクションで同じ順序でロックを取得するようにします。',
  refs: [
    ['デッドロック', 'explicit-locking.html#LOCKING-DEADLOCKS'],
    ['deadlock_timeout', 'runtime-config-locks.html#GUC-DEADLOCK-TIMEOUT']
  ]
},
{
  id: 'S3.3-005', level: 'silver', cat: 'S3.3',
  q: 'テーブルロックに関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'LOCK TABLE はトランザクションブロックの外で実行でき、セッション終了までロックが保持される',
    '通常の SELECT 文は ROW EXCLUSIVE モードのロックを取得する',
    'ACCESS EXCLUSIVE モードは SELECT を含むすべてのアクセスと競合し、DROP TABLE などが取得する',
    'ロックは COMMIT の前に UNLOCK TABLE で明示的に解放する必要がある',
    'ACCESS SHARE モードは、UPDATE 文が取得する ROW EXCLUSIVE モードと競合する'
  ],
  answer: 2,
  exp: 'PostgreSQL のテーブルロックには8つのモードがあります。SELECT は最も弱い ACCESS SHARE、INSERT / UPDATE / DELETE は ROW EXCLUSIVE、DROP TABLE、TRUNCATE、VACUUM FULL、多くの ALTER TABLE は最も強い ACCESS EXCLUSIVE を取得します。ACCESS EXCLUSIVE はすべてのモードと競合するため、SELECT も待たされます。ACCESS SHARE と競合するのは ACCESS EXCLUSIVE だけです。\nLOCK TABLE は明示的にテーブルロックを取得するコマンドで、トランザクションブロック内でのみ使用でき、ロックはトランザクションの終了時に解放されます。UNLOCK TABLE というコマンドはありません。',
  refs: [
    ['テーブルレベルロック', 'explicit-locking.html#LOCKING-TABLES'],
    ['LOCK', 'sql-lock.html']
  ]
},
{
  id: 'S3.3-006', level: 'silver', cat: 'S3.3', type: 'scenario',
  q: '分離レベル READ COMMITTED のセッション A で次の操作を行った。A の2回目の SELECT の結果として、正しいものを1つ選びなさい（acct の id = 1 の balance は最初 100 とする）。',
  code: '-- セッションA\nBEGIN;\nSELECT balance FROM acct WHERE id = 1;   -- 結果: 100\n\n-- セッションB（自動コミット）\nUPDATE acct SET balance = 200 WHERE id = 1;\n\n-- セッションA\nSELECT balance FROM acct WHERE id = 1;   -- 結果: ?',
  choices: [
    '100',
    '200',
    '300',
    'シリアライゼーション失敗のエラーになる',
    'セッション A がコミットするまで待たされる'
  ],
  answer: 1,
  shuffle: false,
  exp: 'READ COMMITTED（PostgreSQL の既定）では、各 SQL 文はその文の開始時点までにコミットされたデータを参照します。セッション B の UPDATE は A の2回目の SELECT より前にコミットされているため、A の2回目の SELECT は 200 を返します。同じトランザクション内で読むたびに値が変わるこの現象を、反復不能読み取り（ノンリピータブルリード）と呼びます。\nA が REPEATABLE READ や SERIALIZABLE の場合は、トランザクション内の最初の文の時点のスナップショットを使い続けるため、2回目も 100 が返されます。\n読み取りは書き込みをブロックしないため、どちらのセッションも待たされません。',
  evidence: [
    ['READ COMMITTED のセッションで実行した結果（\\! の行は別セッションでの更新）',
      'BEGIN;\nBEGIN\nSHOW transaction_isolation;\n transaction_isolation\n-----------------------\n read committed\n(1 row)\n\nSELECT balance FROM acct WHERE id = 1;\n balance\n---------\n     100\n(1 row)\n\nUPDATE acct SET balance = 200 WHERE id = 1;\nUPDATE 1\nSELECT balance FROM acct WHERE id = 1;\n balance\n---------\n     200\n(1 row)\n\nCOMMIT;\nCOMMIT'],
    ['同じ操作を REPEATABLE READ で行った場合',
      'BEGIN ISOLATION LEVEL REPEATABLE READ;\nBEGIN\nSELECT balance FROM acct WHERE id = 1;\n balance\n---------\n     100\n(1 row)\n\nSELECT balance FROM acct WHERE id = 1;\n balance\n---------\n     100\n(1 row)\n\nCOMMIT;\nCOMMIT\nSELECT balance FROM acct WHERE id = 1;\n balance\n---------\n     300\n(1 row)']
  ],
  refs: [
    ['Read Committed分離レベル', 'transaction-iso.html#XACT-READ-COMMITTED'],
    ['トランザクションの分離', 'transaction-iso.html']
  ]
},
{
  id: 'S3.3-007', level: 'silver', cat: 'S3.3', type: 'scenario',
  q: 'BEGIN で開始したトランザクションの途中で SQL 文がエラーになった。その後の動作として、正しいものを1つ選びなさい。',
  choices: [
    'エラーになった文だけが取り消され、以降のコマンドは通常どおり実行できる',
    'トランザクションは自動的にコミットされて終了する',
    '中断状態になり、ROLLBACK するまで以降のコマンドはエラーで拒否される',
    'サーバとの接続が切断され、再接続が必要になる',
    'エラーになる前に実行した文の変更だけが自動的にコミットされる'
  ],
  answer: 2,
  exp: 'PostgreSQL では、トランザクションブロック内で文がエラーになると、そのトランザクションは中断（アボート）状態になり、以降のコマンドは「current transaction is aborted, commands ignored until end of transaction block」というエラーで拒否されます。ROLLBACK でトランザクションを終了する必要があります（COMMIT を実行してもロールバックされます）。\nエラーが起こりうる文の前に SAVEPOINT を設定しておけば、ROLLBACK TO SAVEPOINT でその時点まで戻り、トランザクションを続行できます。psql の ON_ERROR_ROLLBACK 変数を使うと、この処理を自動化できます。',
  evidence: [
    ['エラーの後に文を実行した場合と、ROLLBACK した場合',
      'CREATE TABLE tx (id int);\nCREATE TABLE\nBEGIN;\nBEGIN\nINSERT INTO tx VALUES (1);\nINSERT 0 1\nINSERT INTO tx VALUES (\'abc\');\nERROR:  invalid input syntax for type integer: "abc"\nLINE 1: INSERT INTO tx VALUES (\'abc\');\n                               ^\nINSERT INTO tx VALUES (2);\nERROR:  current transaction is aborted, commands ignored until end of transaction block\nSELECT count(*) FROM tx;\nERROR:  current transaction is aborted, commands ignored until end of transaction block\nCOMMIT;\nROLLBACK\nSELECT count(*) FROM tx;\n count\n-------\n     0\n(1 row)\n\n（ROLLBACK すれば、そのトランザクションを終了して次の文を実行できる）\nBEGIN;\nBEGIN\nINSERT INTO tx VALUES (1);\nINSERT 0 1\nINSERT INTO tx VALUES (\'abc\');\nERROR:  invalid input syntax for type integer: "abc"\nLINE 1: INSERT INTO tx VALUES (\'abc\');\n                               ^\nROLLBACK;\nROLLBACK\nINSERT INTO tx VALUES (3);\nINSERT 0 1\nSELECT * FROM tx;\n id\n----\n  3\n(1 row)']
  ],
  refs: [
    ['トランザクション（チュートリアル）', 'tutorial-transactions.html'],
    ['SAVEPOINT', 'sql-savepoint.html']
  ]
},
{
  id: 'S3.3-008', level: 'silver', cat: 'S3.3',
  q: '分離レベル SERIALIZABLE を使うアプリケーションの注意点として、正しいものを1つ選びなさい。',
  choices: [
    'SERIALIZABLE ではロック待ちが発生しないため、エラー処理は不要である',
    '直列化失敗（SQLSTATE 40001）が発生することがあるため、アプリケーションでトランザクション全体を再試行できるようにする',
    '直列化失敗が発生した場合は、失敗した文だけを再実行すればよい',
    'SERIALIZABLE を指定しても、PostgreSQL では READ COMMITTED と同じ動作になる',
    'SERIALIZABLE は、読み取り専用のトランザクションでは指定できない'
  ],
  answer: 1,
  exp: 'SERIALIZABLE 分離レベルでは、同時に実行されたトランザクションの結果が、何らかの順序で1つずつ実行した場合と同じになることが保証されます。その保証を守れない可能性を検出すると、トランザクションの一方が「could not serialize access」（SQLSTATE 40001、serialization_failure）のエラーで失敗します。\nこのエラーはトランザクションの最初からやり直せば成功する可能性があるため、アプリケーション側でトランザクション全体を再試行する仕組みを用意する必要があります。REPEATABLE READ でも更新の競合で同じエラーが発生することがあります。',
  refs: [
    ['Serializable分離レベル', 'transaction-iso.html#XACT-SERIALIZABLE'],
    ['PostgreSQLエラーコード', 'errcodes-appendix.html']
  ]
},
{
  id: 'S3.3-009', level: 'silver', cat: 'S3.3',
  q: 'PostgreSQL における分離レベル READ UNCOMMITTED の扱いとして、正しいものを1つ選びなさい。',
  choices: [
    '指定はできるが READ COMMITTED として扱われ、ダーティリードは発生しない',
    '指定でき、他のトランザクションが未コミットの変更を読み取れる',
    '指定するとエラーになり、トランザクションを開始できない',
    'PostgreSQL の既定の分離レベルであり、明示しなければこれが使われる',
    '指定すると SERIALIZABLE として扱われる'
  ],
  answer: 0,
  exp: 'SQL 標準は READ UNCOMMITTED、READ COMMITTED、REPEATABLE READ、SERIALIZABLE の4つを定めていますが、PostgreSQL は MVCC により未コミットのデータを読むことがそもそもありません。READ UNCOMMITTED を指定してもエラーにはならず、READ COMMITTED として動作するため、ダーティリードは起こりません。\n既定の分離レベルは READ COMMITTED です。\nまた PostgreSQL の REPEATABLE READ では、標準が許容するファントムリードも発生しません。',
  refs: [
    ['トランザクションの分離', 'transaction-iso.html'],
    ['SET TRANSACTION', 'sql-set-transaction.html']
  ]
},
{
  id: 'S3.3-010', level: 'silver', cat: 'S3.3', type: 'scenario',
  q: '次の SQL を実行した後、テーブル t に格納されている id の値として、正しいものを1つ選びなさい。',
  code: 'CREATE TABLE t (id integer);\n\nBEGIN;\nINSERT INTO t VALUES (1);\nSAVEPOINT sp1;\nINSERT INTO t VALUES (2);\nROLLBACK TO sp1;\nINSERT INTO t VALUES (3);\nCOMMIT;',
  choices: [
    '1 と 3',
    '1 と 2 と 3',
    '3 のみ',
    '1 のみ',
    'ROLLBACK TO の後は COMMIT できないため、何も格納されない'
  ],
  answer: 0,
  exp: 'SAVEPOINT はトランザクションの途中に保存点を作るコマンドです。ROLLBACK TO SAVEPOINT でその保存点まで戻すと、それ以降の変更だけが取り消され、トランザクション自体は継続します。\nこの例では、保存点 sp1 の後に挿入した 2 が取り消され、その後の 3 は有効なまま COMMIT されます。結果として 1 と 3 が格納されます。\n保存点は RELEASE SAVEPOINT で解放できます。\nまた、トランザクション内で文がエラーになった場合も、直前の保存点まで戻せば処理を続けられます。',
  evidence: [
    ['psql で実行した結果（PostgreSQL 14）',
      'CREATE TABLE t (id integer);\nCREATE TABLE\nBEGIN;\nBEGIN\nINSERT INTO t VALUES (1);\nINSERT 0 1\nSAVEPOINT sp1;\nSAVEPOINT\nINSERT INTO t VALUES (2);\nINSERT 0 1\nROLLBACK TO sp1;\nROLLBACK\nINSERT INTO t VALUES (3);\nINSERT 0 1\nCOMMIT;\nCOMMIT\nSELECT * FROM t ORDER BY id;\n id\n----\n  1\n  3\n(2 rows)']
  ],
  refs: [
    ['SAVEPOINT', 'sql-savepoint.html'],
    ['ROLLBACK TO SAVEPOINT', 'sql-rollback-to.html']
  ]
},
{
  id: 'S3.3-011', level: 'silver', cat: 'S3.3',
  q: 'アドバイザリロック（勧告的ロック）に関する説明として、正しいものを1つ選びなさい。',
  choices: [
    'アプリケーションが決めた任意の数値に対するロックで、テーブルや行とは結び付かない',
    'テーブルに対するロックの別名であり、LOCK TABLE と同じ働きをする',
    'アドバイザリロックを獲得すると、対象テーブルへの更新が自動的に禁止される',
    'セッションレベルのアドバイザリロックは、トランザクションの終了時に必ず解放される',
    'アドバイザリロックは pg_locks には表示されない'
  ],
  answer: 0,
  exp: 'アドバイザリロックは、アプリケーションが意味を決めた数値（キー）に対して獲得するロックです。データベースのオブジェクトとは結び付かないため、「同じ処理を二重に走らせない」といった排他制御に使えます。\npg_advisory_lock() で獲得したセッションレベルのロックは、明示的に pg_advisory_unlock() を呼ぶか、セッションが終わるまで保持されます。トランザクションレベルの pg_advisory_xact_lock() であれば、トランザクションの終了時に自動的に解放されます。\n「勧告的」という名のとおり、これ自体がテーブルへの操作を禁止するわけではなく、アプリケーション側が守ることで機能します。\n獲得状況は pg_locks の locktype が advisory の行で確認できます。',
  refs: [
    ['勧告的ロック', 'explicit-locking.html#ADVISORY-LOCKS'],
    ['ロック関数', 'functions-admin.html#FUNCTIONS-ADVISORY-LOCKS']
  ]
},

);
