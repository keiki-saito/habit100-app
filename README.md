# habit100-app

100日習慣チャレンジアプリケーション - AIコーチング機能付き

## 概要

habit100-appは、ユーザーが1つの習慣を100日間継続するためのWebアプリケーションです。OpenRouter経由でClaude Sonnet 4.5を活用したAIコーチング機能により、パーソナライズされたサポートを提供し、習慣の定着を支援します。

## 主な機能

### ✅ 習慣管理
- 習慣の登録・編集
- 毎日の達成/未達成の記録
- ストリーク（連続達成日数）の表示
- 全体の達成率の表示

### 📅 100日カレンダー
- 10×10グリッドで100日間の進捗を視覚化
- 達成日・未達成日の色分け表示
- 日付詳細モーダル（メモ表示）

### 💬 AIコーチング
- Claude Sonnet 4.5によるパーソナライズされたアドバイス
- 進捗データに基づいた励まし
- マイルストーン（7日、30日、50日、100日）到達時の自動祝福
- 挫折予防のリマインド

## 技術スタック

### フロントエンド
- **Next.js** 15.5.4 (App Router with Turbopack)
- **React** 19.1.0
- **TypeScript** 5.x
- **Tailwind CSS** v4

### AI統合
- **Vercel AI SDK** 5.0.60
- **OpenRouter Provider** 1.2.0
- **Claude Sonnet 4.5** (via OpenRouter)

### データ永続化
- **LocalStorage** (Phase 1)
- 将来的にVercel Postgresへ移行可能な抽象化設計

### 開発ツール
- **Biome** 2.2.0 (Linter & Formatter)
- **Vitest** 3.2.4 (Testing)
- **Lefthook** 1.13.6 (Git Hooks)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、OpenRouter APIキーを設定します：

```bash
cp .env.local.example .env.local
```

`.env.local`を編集：

```
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_MODEL=anthropic/claude-sonnet-4.5
```

**OpenRouter APIキーの取得**: [https://openrouter.ai/keys](https://openrouter.ai/keys)

### 3. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションが起動します。

## 利用可能なスクリプト

| スクリプト | 説明 |
|-----------|------|
| `npm run dev` | 開発サーバーを起動（Turbopack） |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバーを起動 |
| `npm run lint` | Biomeによるlint |
| `npm run format` | コードフォーマット |
| `npm run test` | Vitestによるテスト実行 |
| `npm run typecheck` | TypeScript型チェック |

## プロジェクト構造

```
.
├── app/                    # Next.js App Router
│   ├── page.tsx           # ホーム画面
│   ├── calendar/          # カレンダー画面
│   ├── chat/              # AIチャット画面
│   └── api/chat/          # チャットAPIエンドポイント
├── components/             # Reactコンポーネント
│   ├── habit-form.tsx
│   ├── record-button.tsx
│   ├── progress-summary.tsx
│   ├── calendar-grid.tsx
│   └── day-detail-modal.tsx
├── lib/                    # ビジネスロジック
│   ├── types/             # 型定義
│   ├── storage/           # ストレージアダプター
│   ├── repositories/      # データリポジトリ
│   ├── hooks/             # カスタムフック
│   ├── utils/             # ユーティリティ関数
│   ├── openrouter/        # OpenRouter設定
│   └── ai/                # AIシステムメッセージ
├── .kiro/                  # 仕様ドキュメント
│   └── specs/habit100-ai-coach/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── doc/                    # 追加ドキュメント
```

## 仕様ドキュメント

Kiro-style仕様駆動開発を採用しています。詳細は`.kiro/specs/habit100-ai-coach/`を参照：

- **requirements.md**: EARS形式の要件定義
- **design.md**: 技術設計ドキュメント
- **tasks.md**: 実装タスクリスト
- **spec.json**: メタデータ

## テスト

```bash
# すべてのテストを実行
npm test

# ウォッチモード
npm test -- --watch

# カバレッジ
npm test -- --coverage
```

## デプロイ

### Vercelへのデプロイ（推奨）

1. [Vercel](https://vercel.com)にリポジトリを接続
2. 環境変数を設定：
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL` (オプション)
3. デプロイ

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずIssueを開いて変更内容を議論してください。

---

**Generated with** [Claude Code](https://claude.com/claude-code)
