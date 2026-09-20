/*
 * 出題範囲（カテゴリ）定義
 * 出典: https://oss-db.jp/outline/silver / https://oss-db.jp/outline/gold
 * weight = 重要度（模試ではこの数だけ出題する）
 */
window.PGQ_CATEGORIES = {
  silver: {
    id: 'silver',
    name: 'Silver',
    examQuestions: 50,
    outlineUrl: 'https://oss-db.jp/outline/silver',
    groups: [
      {
        id: 'S1', name: '一般知識', ratio: 16,
        cats: [
          { id: 'S1.1', name: 'OSS-DBの一般的特徴', weight: 4, topics: 'PostgreSQLの機能概要、ライセンス、コミュニティ、メジャー/マイナーバージョン、リリースサイクル、サポートポリシー、バグ報告' },
          { id: 'S1.2', name: 'リレーショナルデータベースに関する一般知識', weight: 4, topics: 'リレーショナルデータモデル、DBMSの役割、SQL一般知識、DDL/DML/DCL、データベース設計と正規化' }
        ]
      },
      {
        id: 'S2', name: '運用管理', ratio: 52,
        cats: [
          { id: 'S2.1', name: 'インストール方法', weight: 2, topics: 'initdb、データベースクラスタ、テンプレートデータベース（template0 / template1）、PGDATA' },
          { id: 'S2.2', name: '標準付属ツールの使い方', weight: 5, topics: 'pg_ctl、createuser、dropuser、createdb、dropdb、psql、pg_config、pg_controldata、pg_isready、pg_resetwal、メタコマンド' },
          { id: 'S2.3', name: '設定ファイル', weight: 5, topics: 'postgresql.conf、pg_hba.conf、SET/SHOW、pg_settings' },
          { id: 'S2.4', name: 'バックアップ方法', weight: 7, topics: 'pg_dump、pg_dumpall、pg_restore、pg_basebackup、PITR、WAL、WALアーカイブ、backup_label、recovery.signal、COPY、\\copy' },
          { id: 'S2.5', name: '基本的な運用管理作業', weight: 7, topics: '起動・停止、ロール/ユーザ管理、VACUUM、ANALYZE、自動バキューム、GRANT/REVOKE、information_schema' }
        ]
      },
      {
        id: 'S3', name: '開発/SQL', ratio: 32,
        cats: [
          { id: 'S3.1', name: 'SQLコマンド', weight: 13, topics: 'SELECT/INSERT/UPDATE/DELETE、データ型、テーブル定義、インデックス、ビュー、トリガー、シーケンス、スキーマ、パーティション、関数、PL/pgSQL、レプリケーション' },
          { id: 'S3.2', name: '組み込み関数', weight: 2, topics: '集約関数、算術関数、演算子、文字列関数、日付時刻関数' },
          { id: 'S3.3', name: 'トランザクションの概念', weight: 1, topics: 'BEGIN/COMMIT/ROLLBACK、SAVEPOINT、分離レベル、LOCK、行ロック、デッドロック' }
        ]
      }
    ]
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    examQuestions: 30,
    outlineUrl: 'https://oss-db.jp/outline/gold',
    groups: [
      {
        id: 'G1', name: '運用管理', ratio: 30,
        cats: [
          { id: 'G1.1', name: 'データベースサーバ構築', weight: 2, topics: 'セキュリティ、通信経路暗号化、データ暗号化、クライアント認証、監査ログ、ユーザ・データベース単位のパラメータ設定' },
          { id: 'G1.2', name: '運用管理用コマンド全般', weight: 4, topics: '排他/非排他バックアップ、PITR、VACUUM、ANALYZE、REINDEX、自動バキューム、チェックポイント、サーバログ管理、ディスク容量監視' },
          { id: 'G1.3', name: 'データベースの構造', weight: 2, topics: 'データベースクラスタの構造、プロセス構造、データの格納方法、外部テーブル（FDW）' },
          { id: 'G1.4', name: 'レプリケーション運用', weight: 1, topics: 'ストリーミングレプリケーション、ロジカルレプリケーション、同期/非同期、パブリケーション・サブスクリプション' }
        ]
      },
      {
        id: 'G2', name: '性能監視', ratio: 30,
        cats: [
          { id: 'G2.1', name: 'アクセス統計情報', weight: 3, topics: 'pg_locks、稼働統計情報ビュー、行・ブロックレベル統計、待機イベント' },
          { id: 'G2.2', name: 'テーブル/カラム統計情報', weight: 2, topics: 'pg_class、pg_stats、テーブル・インデックスの実ファイル、拡張統計' },
          { id: 'G2.3', name: 'クエリ実行計画', weight: 3, topics: 'EXPLAIN / EXPLAIN ANALYZE、計画型、結合方式、パーティション、パラレルクエリ、ウィンドウ関数' },
          { id: 'G2.4', name: 'その他の性能監視', weight: 1, topics: 'スロークエリ検出、付属ツール（pg_stat_statements等）による解析、性能劣化要因' }
        ]
      },
      {
        id: 'G3', name: 'パフォーマンスチューニング', ratio: 20,
        cats: [
          { id: 'G3.1', name: '性能に関係するパラメータ', weight: 4, topics: '資源消費、WAL、問い合わせ計画、実行時統計情報、ロック管理' },
          { id: 'G3.2', name: 'チューニングの実施', weight: 2, topics: 'パラメータ・実行計画・SQLのチューニング、テーブル構成、ディスクI/O分散、インデックス活用' }
        ]
      },
      {
        id: 'G4', name: '障害対応', ratio: 20,
        cats: [
          { id: 'G4.1', name: '起こりうる障害のパターン', weight: 3, topics: 'サーバダウン、動作不良、データ消失、OSリソース枯渇、サーバプロセスの状態管理' },
          { id: 'G4.2', name: '破損クラスタ復旧', weight: 2, topics: 'トランザクションログ復旧、システムテーブル復旧、インデックス破損復旧、チェックサム' },
          { id: 'G4.3', name: 'レプリケーションの障害と復旧', weight: 1, topics: 'ストリーミング・ロジカルレプリケーション障害、プライマリ・スタンバイの復旧' }
        ]
      }
    ]
  },
  /* 試験範囲外: バージョン間の主な変更点・非互換（weight 0 = 模試には出題しない） */
  ver: {
    id: 'ver',
    name: 'バージョン差分',
    outOfScope: true,
    examQuestions: 0,
    outlineUrl: 'https://www.postgresql.org/docs/release/',
    groups: [
      {
        id: 'V1', name: 'バージョン間の主な変更点（試験範囲外）', ratio: 0,
        cats: [
          { id: 'V1.1', name: 'ディレクトリ・ファイル構成の変更', weight: 0, topics: 'pg_xlog → pg_wal、pg_clog → pg_xact、recovery.conf の廃止、postgresql.auto.conf' },
          { id: 'V1.2', name: 'コマンド・関数の名称変更', weight: 0, topics: 'pg_resetxlog → pg_resetwal、xlog 系関数 → wal 系関数、バックアップ関数の変更、削除されたツール' },
          { id: 'V1.3', name: '設定パラメータの変更', weight: 0, topics: 'checkpoint_segments、wal_keep_segments、wal_level、password_encryption、統計情報コレクタ' },
          { id: 'V1.4', name: 'SQL・動作の非互換', weight: 0, topics: 'public スキーマの権限、WITH OIDS、CTE のインライン化、後置演算子、バージョン番号、既定値の変更' },
          { id: 'V1.5', name: '主要機能の導入時期', weight: 0, topics: '論理レプリケーション、宣言的パーティショニング、MERGE、増分バックアップ、JIT、非同期 I/O' }
        ]
      }
    ]
  }
};
