# TypeScript文法マスター - 要件定義書

## 1. プロジェクト概要

### 1.1 プロダクト名
**TS Grammar Dojo**（仮称）

### 1.2 コンセプト
英会話スクール「AQUES（アクエス）」の学習メソッドをTypeScript文法学習に応用した、Next.jsフルスタックWebアプリケーション。「日本語の説明 → TypeScriptコードを書く」という強制アウトプット型の学習と、忘却曲線に基づくスパイラル学習（間隔反復）を組み合わせ、TypeScriptの型システムを体に染み込ませることを目指す。

### 1.3 アクエスメソッドの応用方針

アクエスの学習理論から以下の要素を取り入れる。

| アクエスの要素 | 本アプリでの実装 |
|---|---|
| 日英フラッシュトランスレーション | 日本語の型の説明 → TS構文を即座にタイピング |
| スパイラル学習（反復復習） | 忘却曲線ベースのSRS（間隔反復システム）で出題スケジュールを自動管理 |
| 大量アウトプット | 選択式ではなくコード入力型。実際に手を動かして型を書く |
| 自習不要（レッスン内完結） | アプリ内で復習が自動スケジュールされ、ユーザーは「今日の問題」をこなすだけ |
| 段階的難易度上昇 | 同じテーマを初級→中級→上級と深掘りしていくスパイラルカリキュラム |
| 習慣化の仕組み | デイリーストリーク、リマインダー通知、進捗ダッシュボード |

---

## 2. 技術スタック

### 2.1 フロントエンド
- **フレームワーク**: Next.js 14+（App Router）
- **言語**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **コードエディタ**: Monaco Editor（VSCode同等のTS補完・型チェック）
- **状態管理**: Zustand or React Server Components

### 2.2 バックエンド
- **API**: Next.js Route Handlers（App Router API Routes）
- **ORM**: Prisma
- **DB**: PostgreSQL（Supabase or Neon推奨）
- **認証**: NextAuth.js v5（GitHub / Google OAuth）

### 2.3 インフラ
- **ホスティング**: Vercel
- **DB**: Supabase / Neon PostgreSQL
- **CI/CD**: GitHub Actions

---

## 3. 機能要件

### 3.1 ユーザー認証

- GitHub / Google OAuthによるソーシャルログイン
- ゲストモード（ログインなしでお試し可能、進捗は保存されない）
- ユーザープロフィール（表示名、アバター、学習開始日）

### 3.2 問題データモデル

#### 3.2.1 カテゴリ体系（スパイラルカリキュラム対応）

問題は以下のカテゴリに分類され、各カテゴリ内でLevel 1→2→3とスパイラル的に難易度が上がる。

```
Level 1（基礎）→ Level 2（応用）→ Level 3（発展）
```

**カテゴリ一覧:**

1. **基本型** (Primitive Types)
   - L1: string, number, boolean, null, undefined
   - L2: literal types, template literal types
   - L3: branded types

2. **配列・タプル** (Arrays & Tuples)
   - L1: 配列型, readonly配列
   - L2: タプル型, 可変長タプル
   - L3: タプルの型操作

3. **オブジェクト型** (Object Types)
   - L1: interface基本, type alias
   - L2: optional, readonly, index signature
   - L3: excess property check, structural typing

4. **Union / Intersection**
   - L1: union type基本, type narrowing
   - L2: discriminated union, exhaustive check
   - L3: 複雑なunion分配

5. **関数型** (Function Types)
   - L1: 引数・戻り値の型, void
   - L2: overload, generic function
   - L3: 高階関数の型, thisパラメータ

6. **ジェネリクス** (Generics)
   - L1: 基本のジェネリクス, 型引数
   - L2: constraints (extends), default type
   - L3: 複数型引数, 推論パターン

7. **ユーティリティ型** (Utility Types)
   - L1: Partial, Required, Readonly, Pick, Omit
   - L2: Record, Extract, Exclude, NonNullable
   - L3: Parameters, ReturnType, ConstructorParameters

8. **条件型** (Conditional Types)
   - L1: 基本の条件型, extends キーワード
   - L2: 分配条件型, infer
   - L3: 再帰的条件型, テンプレートリテラル型操作

9. **Mapped Types**
   - L1: 基本のMapped Type, keyof
   - L2: as句によるキーリマッピング
   - L3: 複合Mapped Types

10. **型パズル** (Advanced Patterns)
    - L1: 型アサーション, 型ガード (is / in / typeof / instanceof)
    - L2: satisfies, const assertion, Module Augmentation
    - L3: type-challenges レベルの型パズル（DeepReadonly, Flatten, etc.）

#### 3.2.2 問題のデータ構造

```typescript
interface Problem {
  id: string;
  category: Category;         // 上記10カテゴリ
  level: 1 | 2 | 3;           // スパイラルレベル
  promptJa: string;           // 日本語の出題文（「○○な型を定義せよ」）
  promptEn?: string;          // 英語の出題文（任意）
  starterCode: string;        // 最初から表示されるコード（テンプレート）
  expectedAnswer: string;     // 模範解答コード
  testCases: TestCase[];      // 型チェック用のテストケース
  hints: string[];            // ヒント（段階的に表示）
  explanation: string;        // 解説（正解後に表示）
  tags: string[];             // 検索・フィルタ用タグ
  difficulty: 'easy' | 'medium' | 'hard';
}

interface TestCase {
  description: string;        // テストの説明
  code: string;               // 型チェックで通るべき/エラーになるべきコード
  shouldPass: boolean;        // trueなら型チェック成功、falseならエラー期待
}
```

### 3.3 学習モード

#### 3.3.1 デイリーチャレンジ（メイン学習）

アクエスの「レッスンを受けるだけ」思想を再現。ユーザーは毎日「今日のセット」をこなすだけ。

- SRSアルゴリズムが自動で出題セットを生成（新規問題 + 復習問題の混合）
- 1セッション = 10〜20問（設定で調整可能）
- 構成比率の目安: 新規30% + 復習70%（アクエスのスパイラル学習に倣う）
- 各問題にはタイマー表示（焦らせる目的ではなく、回答速度の記録用）

#### 3.3.2 フラッシュトランスレーション

アクエスの「日英フラッシュトランスレーション」のTS版。

- 日本語の説明が表示される（例：「文字列の配列を受け取り、その長さを返す関数の型を定義せよ」）
- ユーザーはMonaco Editorに型定義をタイピング
- リアルタイムで型チェック（TypeScript Compiler APIをWASM or サーバーサイドで実行）
- 正解判定: テストケースがすべてpassすればOK（模範解答と完全一致でなくてよい）
- 不正解時: ヒントを段階的に表示 → 最終的に模範解答を提示
- 正解後: 解説を表示

#### 3.3.3 フリープラクティス

- カテゴリ・レベルを選んで自由に練習
- SRSスケジュール外の追加練習用
- ブックマーク機能で苦手問題をストック

### 3.4 SRS（間隔反復システム）

#### 3.4.1 アルゴリズム

SM-2アルゴリズムをベースにカスタマイズ。

```typescript
interface SRSCard {
  odId: string;             // 問題ID
  userId: string;
  easeFactor: number;         // 容易さ係数（初期値2.5）
  interval: number;           // 次回復習までの日数
  repetitions: number;        // 連続正解回数
  nextReviewDate: Date;       // 次回復習日
  lastReviewDate: Date;
  responseHistory: Response[]; // 回答履歴
}

interface Response {
  timestamp: Date;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0=完全忘却 〜 5=即答
  timeSpent: number;                 // 回答にかかった秒数
  wasCorrect: boolean;
}
```

#### 3.4.2 SM-2アルゴリズム詳細

回答のquality（0〜5）に応じて以下のように更新する。

```
if quality >= 3 (正解):
  if repetitions == 0: interval = 1
  if repetitions == 1: interval = 6
  if repetitions >= 2: interval = interval * easeFactor
  repetitions += 1

if quality < 3 (不正解):
  repetitions = 0
  interval = 1

// easeFactor更新（全回答で実行）
easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
if easeFactor < 1.3: easeFactor = 1.3

nextReviewDate = today + interval日
```

**スパイラル学習用カスタムルール:**
- 14日以上触れていないカテゴリは、最もintervalの長い問題を強制的に復習キューに入れる
- 回答時間も考慮: 正解でも平均の2倍以上かかった場合はqualityを1段階下げる

#### 3.4.3 スパイラルレベルアップ

- 各カテゴリのLevel N問題を80%以上の正答率で5回以上クリアすると、Level N+1が解放される
- 解放後もLevel Nの復習は継続（スパイラル学習）
- 全レベル解放済みのカテゴリは復習頻度が徐々に下がる

### 3.5 コードエディタ・型チェック

#### 3.5.1 エディタ要件

- Monaco Editorを組み込み
- TypeScript構文ハイライト、IntelliSense（自動補完）
- リアルタイムエラー表示（赤波線）
- テーマ切り替え（ダーク/ライト）

#### 3.5.2 型チェック実行

- **正解判定（サーバーサイド）**: Next.js Route Handlerで`typescript`パッケージの`ts.createProgram`を使い、ユーザーコード + テストコードを結合して型チェック。submitボタン押下時にAPIリクエスト。
- **リアルタイムフィードバック（クライアントサイド）**: Monaco Editor内蔵のTypeScript Language Serviceでリアルタイムのエラー表示・IntelliSenseを提供（正解判定には使わない）。
- テストケースのコードとユーザーの回答を結合し、型エラーの有無で正解判定
- コンパイル結果（エラーメッセージ）をユーザーにフィードバック
- Rate Limit対策: 正解判定APIは submit時のみ呼ばれるため、リアルタイムチェックとは独立

### 3.6 進捗・統計ダッシュボード

#### 3.6.1 デイリー統計

- 今日解いた問題数 / 目標数
- 正答率
- 連続学習日数（ストリーク）
- 学習時間

#### 3.6.2 カテゴリ別進捗

- カテゴリごとの習熟度（%）
- 各カテゴリの解放済みレベル
- ヒートマップ（GitHub風の学習カレンダー）

#### 3.6.3 弱点分析

- 正答率が低いカテゴリ・問題のハイライト
- 平均回答時間が長い問題の特定
- 「苦手な型パターン」のレコメンデーション

### 3.7 ゲーミフィケーション

- **ストリーク**: 連続学習日数の記録・表示
- **XP（経験値）**: 問題を解くとXPを獲得（難易度・速度でボーナス）
- **レベルシステム**: XPに応じてユーザーレベルが上がる
- **バッジ**: 特定の実績で獲得（例：「ジェネリクスマスター」「100日連続学習」）
- **ランキング**: 週間/月間のXPランキング（任意参加）

### 3.8 通知・リマインダー

- ブラウザのPush通知で毎日の学習リマインド（時間はユーザー設定）
- 「今日の復習問題があります」通知
- ストリークが途切れそうな時のアラート

---

## 4. 画面一覧

| 画面名 | パス | 概要 |
|---|---|---|
| ランディング | `/` | アプリ紹介、ログイン/サインアップ導線 |
| ダッシュボード | `/dashboard` | デイリー統計、今日の学習開始ボタン |
| デイリーチャレンジ | `/practice/daily` | SRSが選んだ今日の問題セット |
| フリープラクティス | `/practice/free` | カテゴリ・レベル選択して練習 |
| 問題画面 | `/practice/[id]` | 問題文 + Monaco Editor + 実行結果 |
| 進捗 | `/progress` | カテゴリ別進捗、ヒートマップ、弱点分析 |
| 設定 | `/settings` | プロフィール、通知設定、1日の目標問題数 |
| ランキング | `/ranking` | 週間/月間XPランキング |

---

## 5. データベース設計（Prisma Schema概要）

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  image         String?
  level         Int       @default(1)
  xp            Int       @default(0)
  streak        Int       @default(0)
  lastActiveAt  DateTime?
  createdAt     DateTime  @default(now())
  accounts      Account[]
  sessions      Session[]
  srsCards       SRSCard[]
  responses     Response[]
  badges        UserBadge[]
  settings      UserSettings?
}

model Problem {
  id            String    @id @default(cuid())
  category      String
  level         Int
  difficulty    String
  promptJa      String
  promptEn      String?
  starterCode   String
  expectedAnswer String
  hints         String[]
  explanation   String
  tags          String[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  testCases     TestCase[]
  srsCards      SRSCard[]
  responses     Response[]
}

model TestCase {
  id            String   @id @default(cuid())
  problemId     String
  description   String
  code          String
  shouldPass    Boolean
  problem       Problem  @relation(fields: [problemId], references: [id])
}

model SRSCard {
  id            String   @id @default(cuid())
  userId        String
  problemId     String
  easeFactor    Float    @default(2.5)
  interval      Int      @default(0)
  repetitions   Int      @default(0)
  nextReviewDate DateTime
  lastReviewDate DateTime?
  user          User     @relation(fields: [userId], references: [id])
  problem       Problem  @relation(fields: [problemId], references: [id])

  @@unique([userId, problemId])
}

model Response {
  id            String   @id @default(cuid())
  userId        String
  problemId     String
  quality       Int
  timeSpent     Int
  wasCorrect    Boolean
  userAnswer    String
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
  problem       Problem  @relation(fields: [problemId], references: [id])
}

model UserBadge {
  id            String   @id @default(cuid())
  userId        String
  badgeId       String
  earnedAt      DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
}

model UserSettings {
  id                  String  @id @default(cuid())
  userId              String  @unique
  dailyGoal           Int     @default(10)
  reminderTime        String? // "HH:mm" format
  reminderEnabled     Boolean @default(true)
  theme               String  @default("dark")
  user                User    @relation(fields: [userId], references: [id])
}
```

---

## 6. API設計（主要エンドポイント）

```
POST   /api/auth/[...nextauth]    # 認証
GET    /api/practice/daily         # 今日のデイリーセット取得
GET    /api/practice/free          # フリープラクティス問題取得（クエリでカテゴリ・レベル指定）
GET    /api/problems/[id]          # 問題詳細取得
POST   /api/problems/[id]/submit   # 回答送信（型チェック実行 + SRS更新）
POST   /api/problems/[id]/hint     # ヒント取得
GET    /api/progress               # 進捗データ取得
GET    /api/progress/heatmap       # ヒートマップデータ
GET    /api/progress/weakness      # 弱点分析データ
GET    /api/ranking                # ランキングデータ
GET    /api/user/stats             # ユーザー統計
PUT    /api/user/settings          # 設定更新
POST   /api/typecheck              # TypeScriptコードの型チェック実行
```

---

## 7. 非機能要件

### 7.1 パフォーマンス

- 型チェックのレスポンス: 3秒以内
- ページ初期表示: 2秒以内（LCP）
- Monaco Editorの読み込み: 遅延ロード（dynamic import）

### 7.2 セキュリティ

- ユーザー提出コードはサンドボックス環境で実行（型チェックのみ、ランタイム実行はしない）
- CSRF対策
- Rate Limiting（型チェックAPI: 1分あたり30リクエスト）

### 7.3 レスポンシブ対応

- PCファースト（Monaco Editorはモバイルでの操作が困難なため）
- タブレットは対応、スマホは閲覧のみ（ダッシュボード・進捗確認）

### 7.4 アクセシビリティ

- キーボードナビゲーション対応
- ダーク/ライトテーマ切り替え
- フォントサイズ変更可能

---

## 8. 開発フェーズ

### Phase 1: MVP（4-6週間）
- 認証（GitHub OAuth）
- 問題データモデル・シードデータ（各カテゴリLevel 1の問題を最低5問ずつ）
- Monaco Editor統合
- 型チェック機能（サーバーサイド）
- フリープラクティスモード
- 基本的なSRS実装

### Phase 2: コア学習体験（3-4週間）
- デイリーチャレンジモード
- スパイラルカリキュラム（レベルアップシステム）
- 進捗ダッシュボード
- ヒートマップ

### Phase 3: エンゲージメント（2-3週間）
- ゲーミフィケーション（XP、バッジ、ストリーク）
- ランキング
- Push通知リマインダー
- 弱点分析

### Phase 4: コンテンツ拡充（継続的）
- Level 2, 3 の問題追加
- type-challenges連携
- コミュニティ問題投稿機能（将来的に）

---

## 9. 問題シードデータ例

以下はClaude Codeに渡して初期問題データを生成する際の参考例。

### 例1: 基本型 Level 1
```json
{
  "category": "primitive-types",
  "level": 1,
  "difficulty": "easy",
  "promptJa": "文字列型の変数nameと、数値型の変数ageを持つオブジェクト型Personを定義してください。",
  "starterCode": "type Person = // ここに型を書いてください",
  "expectedAnswer": "type Person = { name: string; age: number }",
  "testCases": [
    {
      "description": "正しいPerson型のオブジェクトが代入できること",
      "code": "const p: Person = { name: 'Taro', age: 25 }",
      "shouldPass": true
    },
    {
      "description": "ageが文字列のオブジェクトはエラーになること",
      "code": "const p: Person = { name: 'Taro', age: '25' }",
      "shouldPass": false
    }
  ],
  "hints": [
    "オブジェクト型は { } で定義します",
    "プロパティは 「プロパティ名: 型」 の形式で書きます"
  ],
  "explanation": "type aliasを使ってオブジェクト型を定義する基本パターンです。{ name: string; age: number } のように、各プロパティの名前と型をセミコロン区切りで記述します。"
}
```

### 例2: 条件型 Level 2
```json
{
  "category": "conditional-types",
  "level": 2,
  "difficulty": "hard",
  "promptJa": "型引数Tが配列型ならその要素型を、配列型でなければneverを返すユーティリティ型UnpackArrayを定義してください。",
  "starterCode": "type UnpackArray<T> = // ここに型を書いてください",
  "expectedAnswer": "type UnpackArray<T> = T extends (infer U)[] ? U : never",
  "testCases": [
    {
      "description": "string[]からstringが取り出せること",
      "code": "type R1 = UnpackArray<string[]>; const check1: R1 = 'hello'",
      "shouldPass": true
    },
    {
      "description": "number[]からnumberが取り出せること",
      "code": "type R2 = UnpackArray<number[]>; const check2: R2 = 42",
      "shouldPass": true
    },
    {
      "description": "配列でない型からはneverになること",
      "code": "type R3 = UnpackArray<string>; const check3: R3 = 'hello'",
      "shouldPass": false
    }
  ],
  "hints": [
    "条件型 T extends ... ? A : B を使います",
    "配列の要素型を取り出すには infer キーワードが使えます",
    "T extends (infer U)[] という形で要素型をUとして推論できます"
  ],
  "explanation": "Conditional TypesとinferキーワードのCombination。T extends (infer U)[] ? U : never で、Tが配列ならその要素型Uを返し、そうでなければneverを返します。"
}
```

---

## 10. Claude Codeへの指示事項

### 実装時の注意点

1. **型チェックの実装**: TypeScript Compiler APIを使い、ユーザーコード + テストコードを結合して`ts.createProgram`で型チェックする。ランタイム実行は行わない（セキュリティ上の理由）。

2. **Monaco Editorの設定**: `@monaco-editor/react`を使用し、TypeScriptのlib定義を読み込むこと。`dynamic import`で遅延ロードする。

3. **SRSの実装**: SM-2アルゴリズムを忠実に実装し、スパイラル学習用のカテゴリ強制復習ロジックを追加する。

4. **問題データ**: 初期シードデータとして各カテゴリLevel 1に最低5問、合計50問以上を用意する。JSON or Prisma seedスクリプトで投入。

5. **テスト**: 型チェックロジックとSRSアルゴリズムには必ずユニットテストを書く。

6. **コード品質**: ESLint + Prettier設定、strict TypeScript config。

7. **テストフレームワーク**: Vitest推奨。

8. **ヒント表示ロジック**: 不正解1回目で hints[0]、2回目で hints[1]...と段階的に表示。全ヒント消費後は模範解答を提示。

---

## 11. 環境変数一覧

```env
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/ts-grammar-dojo"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# GitHub OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## 12. 主要パッケージ

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.3.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^5.0.0-beta",
    "@monaco-editor/react": "^4.6.0",
    "zustand": "^4.5.0",
    "tailwindcss": "^3.4.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 付録: アクエスメソッド対応表（詳細）

| アクエスの原則 | 英語学習での実践 | 本アプリでの実践 |
|---|---|---|
| 日英フラッシュトランスレーション | 日本語→英語を瞬時に口に出す | 日本語の型説明→TSコードを即座にタイピング |
| オーバーラーニング | 覚えた表現も繰り返し練習 | SRSで定着済みの問題も低頻度で再出題 |
| スパイラルカリキュラム | 同じ文法を初級→上級で繰り返す | 各カテゴリLevel 1→2→3で同テーマを深掘り |
| アウトプット重視 | 聞くより話す時間を最大化 | 選択式でなくコード入力型で手を動かす |
| 自習不要 | レッスン内で復習が完結 | SRSが自動で復習スケジュールを管理 |
| 習慣化 | 講師から連絡が来てサボれない | ストリーク・リマインダー・デイリー目標 |
| 長時間集中 | 50-150分のロングレッスン | 1セッション10-20問で集中的にアウトプット |
