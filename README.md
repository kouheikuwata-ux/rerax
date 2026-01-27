# リラックス (Rerax)

穏やかな次世代TODOアプリ。夢・目標・計画を低認知負荷で管理します。

## 特徴

- **シングルスクリーン**: 今日のフォーカス、今週の流れ、今月のテーマを1画面で確認
- **低認知負荷**: 長いリストやカレンダーグリッドを排除
- **AI提案**: AIが提案し、ユーザーが1タップで確定（自動変更なし）
- **差分表示**: 変更理由を1行で表示し、信頼性を確保

## セットアップ

### 必要環境

- Node.js 18+
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local

# データベースの初期化
npm run db:push

# (オプション) サンプルデータの投入
npm run db:seed
```

### 環境変数

`.env.local` に以下を設定:

```env
# Database (SQLite for local dev)
DATABASE_URL="file:./dev.db"

# OpenAI (optional - AI提案機能を使う場合)
OPENAI_API_KEY="sk-..."
```

### 開発サーバー

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアクセス

### テスト

```bash
# テスト実行
npm test

# ウォッチモード
npm run test:watch
```

### ビルド

```bash
npm run build
```

## ページ構成

| パス | 説明 |
|------|------|
| `/` | ホーム画面（今日のフォーカス、今週の流れ、今月のテーマ） |
| `/week` | 週の詳細画面（日ごとの編集） |

## データモデル

- **MonthTheme**: 今月のテーマ（2-5項目）
- **WeekPlan**: 週の計画（月〜日のスロット）
- **FocusItem**: 今日のフォーカス（最大3項目推奨）
- **ReflectionLog**: 振り返りログ

## AI機能

- `OPENAI_API_KEY` が設定されている場合、GPT-4o-miniを使用
- 未設定の場合、ルールベースの決定論的提案にフォールバック
- AI は直接データを変更しない（ユーザーが「採用」ボタンで確定）

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite + Prisma
- **Validation**: Zod
- **AI**: OpenAI GPT-4o-mini (optional)

## ライセンス

MIT
