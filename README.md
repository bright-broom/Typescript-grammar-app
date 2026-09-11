# TS Grammar Dojo

英会話スクール「AQUES（アクエス）」の学習メソッドを TypeScript 文法学習に応用した Next.js フルスタックアプリです。
「日本語の説明 → TypeScript の型を書く」フラッシュトランスレーションと、忘却曲線に基づく間隔反復（SRS）で型システムを身につけます。

要件は [REQUIREMENTS.md](./REQUIREMENTS.md) を参照してください。

## 主な機能

- **デイリーチャレンジ** — SM-2 ベースの SRS が「復習 70% + 新規 30%」の出題セットを毎日自動生成（1日の目標問題数は設定で変更可能）
- **スパイラル学習** — Level N を正答率 80% 以上で 5 回クリアすると Level N+1 が解放。14 日以上触れていないカテゴリは強制的に復習キューへ。全レベル解放済みカテゴリは復習間隔が長くなる
- **フラッシュトランスレーション** — Monaco Editor で型を書き、サーバー側の TypeScript Compiler API でテストケースを型チェックして判定（ランタイム実行なし）。不正解のたびにヒントを 1 つずつ表示し、使い切ると模範解答を表示
- **フリープラクティス** — カテゴリ・レベルで絞り込み、苦手問題をブックマーク
- **進捗ダッシュボード** — 今日の進捗・正答率・学習時間、GitHub 風の学習カレンダー、カテゴリ別習熟度、弱点分析（苦手なカテゴリ／問題／時間がかかる問題／苦手な型パターン）
- **ゲーミフィケーション** — XP（難易度・即答・ストリークでボーナス）、ユーザーレベル、ストリーク、バッジ、週間／月間／全期間 XP ランキング（任意参加）
- **リマインダー** — Web Push で毎日のリマインドと、ストリークが途切れそうな時のアラート
- **ゲストモード** — ログインなしで問題を解ける（進捗は保存されない。Level 1 のみ）
- ダーク／ライトテーマ、フォントサイズ変更、キーボード操作（`Ctrl`/`⌘` + `Enter` で提出）

## 技術スタック

Next.js 16 (App Router) / React 19 / TypeScript / Tailwind CSS 4 + shadcn/ui (Base UI) / Monaco Editor / Prisma 6 + PostgreSQL / Auth.js (NextAuth v5) / Zustand / Zod / web-push / Vitest

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

```bash
cp .env.example .env
```

最低限 `DATABASE_URL` と `AUTH_SECRET`（`npx auth secret` などで生成）を設定します。
ログインするには GitHub または Google の OAuth アプリを作成し、`AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`（または Google 用）を設定してください。設定したプロバイダだけがサインイン画面に表示されます。

| 変数                                                                 | 用途                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                       | PostgreSQL の接続文字列                                                         |
| `AUTH_SECRET`, `AUTH_URL`                                            | Auth.js                                                                         |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`                               | GitHub OAuth（コールバック: `/api/auth/callback/github`）                       |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`                               | Google OAuth（コールバック: `/api/auth/callback/google`）                       |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web Push（`npx web-push generate-vapid-keys` で生成）。未設定なら通知機能は無効 |
| `CRON_SECRET`                                                        | リマインダー送信 API `/api/cron/reminders` の Bearer トークン                   |

### 3. データベース

```bash
docker compose up -d      # PostgreSQL 16 を起動
npm run db:migrate        # マイグレーションを適用（本番は npm run db:deploy）
npm run db:seed           # 問題データを投入（固定IDで upsert するので何度実行してもよい）
```

### 4. 開発サーバー

```bash
npm run dev
```

http://localhost:3000 を開きます。

## スクリプト

| コマンド                                   | 内容                             |
| ------------------------------------------ | -------------------------------- |
| `npm run dev`                              | 開発サーバー                     |
| `npm run build`                            | Prisma Client 生成 + 本番ビルド  |
| `npm run lint` / `npm run typecheck`       | ESLint / TypeScript の型チェック |
| `npm run format` / `npm run format:check`  | Prettier                         |
| `npm run test` / `npm run test:run`        | Vitest（ウォッチ / 1回実行）     |
| `npm run db:migrate` / `npm run db:deploy` | マイグレーション（開発 / 本番）  |
| `npm run db:seed`                          | 問題データの投入                 |
| `npm run db:studio`                        | Prisma Studio                    |

## 問題データ

問題は `prisma/data/level{1,2,3}.ts` に TypeScript で定義しています（ID は `<category>-<level>-<連番>`）。
`src/lib/__tests__/problems-data.test.ts` が全問題について「模範解答がすべてのテストケースに合格し、スターターコードのままでは正解にならない」ことを実際の型チェッカーで検証するので、問題を追加・修正したら `npm run test:run` を実行してください。

型チェックの仕様（`src/lib/typecheck.ts`）:

- `strict: true`、`lib: es2022 + dom`。回答コード単体に型エラーがあると全テスト不合格
- `shouldPass: true` のテストは結合したコードに型エラーがないこと、`shouldPass: false` のテストは**テストコード部分で**型エラーが起きること
- `noResolve` と独自の CompilerHost により、TypeScript 同梱の lib 定義以外のファイルは読み込まない

## ディレクトリ構成

```
prisma/
  schema.prisma, migrations/, seed.ts
  data/                 問題データ
src/
  app/
    (app)/              ダッシュボード・デイリー・フリー練習・問題・進捗・ランキング・設定
    api/                Route Handlers（REQUIREMENTS.md 6章の API）
    auth/               サインイン・エラー画面
  components/           UI コンポーネント（ui/ は shadcn/ui）
  lib/
    srs.ts              SM-2 とスパイラル学習（出題選択・レベル解放）
    gamification.ts     XP・レベル・ストリーク・バッジ
    typecheck.ts        サンドボックス化した型チェッカー
    dates.ts            タイムゾーンを考慮した日付計算
    reminders.ts        通知の送信判定
    rate-limit.ts       Rate Limiter
    server/             DB を使うサービス層
  proxy.ts              API の CSRF 対策（同一オリジン以外からの変更系リクエストを拒否）
public/sw.js            Push 通知用 Service Worker
```

## リマインダー通知の運用

`/api/cron/reminders` を定期的に（15 分おき程度）`Authorization: Bearer $CRON_SECRET` 付きで呼ぶと、各ユーザーのタイムゾーンで設定時刻を過ぎていて、その日まだ送っていないユーザーに通知します。
`.github/workflows/reminders.yml` が GitHub Actions から呼び出します（リポジトリの Secrets に `APP_URL` と `CRON_SECRET` を設定すると有効）。

## セキュリティ上の注意

- 提出コードは型チェックのみでランタイム実行はしません。コード長は 20,000 文字まで
- 型チェック API（提出を含む）は 1 分あたり 30 リクエストに制限しています。Rate Limiter はインメモリのため、複数インスタンス構成では上限がインスタンスごとになります
- 模範解答と解説は、正解するかヒントを使い切るまでクライアントに送りません
