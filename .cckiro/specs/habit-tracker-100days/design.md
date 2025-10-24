# 100日チャレンジ習慣トラッカー - 設計書

## 1. システムアーキテクチャ

### 1.1 全体構成
```
┌─────────────────────────────────────────┐
│         Next.js App Router              │
├─────────────────────────────────────────┤
│  app/                                   │
│  ├── page.tsx (習慣一覧)                │
│  ├── habits/                            │
│  │   └── [id]/                          │
│  │       └── page.tsx (習慣詳細)        │
│  └── api/                               │
│      ├── habits/route.ts                │
│      └── records/route.ts               │
├─────────────────────────────────────────┤
│  lib/                                   │
│  ├── db/                                │
│  │   ├── schema.ts (テーブル定義)       │
│  │   └── client.ts (DB接続)             │
│  ├── services/                          │
│  │   ├── habitService.ts                │
│  │   └── recordService.ts               │
│  └── utils/                             │
│      ├── dateUtils.ts                   │
│      └── statsCalculator.ts             │
├─────────────────────────────────────────┤
│  components/                            │
│  ├── habits/                            │
│  │   ├── HabitCard.tsx                  │
│  │   ├── HabitForm.tsx                  │
│  │   └── HabitList.tsx                  │
│  ├── calendar/                          │
│  │   ├── Calendar100Days.tsx            │
│  │   └── DayCell.tsx                    │
│  ├── stats/                             │
│  │   ├── ProgressBar.tsx                │
│  │   └── StatsPanel.tsx                 │
│  └── ui/ (共通UIコンポーネント)         │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│          SQLite Database                │
│  ├── habits テーブル                    │
│  └── habit_records テーブル             │
└─────────────────────────────────────────┘
```

### 1.2 データフロー
```
User Action → Component → API Route → Service Layer → Database
                ↑                                         ↓
                └─────────── Response ←───────────────────┘
```

## 2. データベース設計

### 2.1 スキーマ定義

#### habits テーブル
```sql
CREATE TABLE habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  start_date TEXT NOT NULL,  -- ISO 8601: YYYY-MM-DD
  created_at TEXT NOT NULL,  -- ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ
  updated_at TEXT NOT NULL
);
```

#### habit_records テーブル
```sql
CREATE TABLE habit_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL,
  date TEXT NOT NULL,        -- ISO 8601: YYYY-MM-DD
  completed INTEGER NOT NULL CHECK(completed IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  UNIQUE(habit_id, date)
);

CREATE INDEX idx_habit_records_habit_id ON habit_records(habit_id);
CREATE INDEX idx_habit_records_date ON habit_records(date);
```

### 2.2 データベース接続
- **ライブラリ**: `better-sqlite3` (同期API、Next.js Server Componentsと相性良い)
- **接続管理**: シングルトンパターンでDB接続を管理
- **ファイルパス**: `./data/habits.db` (プロジェクトルート)

## 3. API設計

### 3.1 習慣管理API

#### `GET /api/habits`
**概要**: 全習慣の一覧を取得

**レスポンス**:
```typescript
{
  habits: Array<{
    id: number;
    name: string;
    color: string;
    startDate: string;  // ISO 8601
    createdAt: string;
    updatedAt: string;
  }>
}
```

#### `POST /api/habits`
**概要**: 新規習慣を作成

**リクエストボディ**:
```typescript
{
  name: string;
  color: string;
  startDate: string;  // ISO 8601: YYYY-MM-DD
}
```

**レスポンス**:
```typescript
{
  habit: {
    id: number;
    name: string;
    color: string;
    startDate: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

#### `PATCH /api/habits/[id]`
**概要**: 習慣を更新

**リクエストボディ**:
```typescript
{
  name?: string;
  color?: string;
}
```

**レスポンス**:
```typescript
{
  habit: { /* 更新後の習慣データ */ }
}
```

#### `DELETE /api/habits/[id]`
**概要**: 習慣を削除（関連する記録も削除）

**レスポンス**:
```typescript
{
  success: true
}
```

### 3.2 記録管理API

#### `GET /api/records?habitId={id}&startDate={date}&endDate={date}`
**概要**: 指定期間の記録を取得

**クエリパラメータ**:
- `habitId`: 習慣ID（必須）
- `startDate`: 開始日（オプション、デフォルト: habit.startDate）
- `endDate`: 終了日（オプション、デフォルト: startDate + 99日）

**レスポンス**:
```typescript
{
  records: Array<{
    id: number;
    habitId: number;
    date: string;      // YYYY-MM-DD
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  }>
}
```

#### `POST /api/records`
**概要**: 記録を作成/更新（upsert）

**リクエストボディ**:
```typescript
{
  habitId: number;
  date: string;       // YYYY-MM-DD
  completed: boolean;
}
```

**レスポンス**:
```typescript
{
  record: { /* 記録データ */ }
}
```

## 4. コンポーネント設計

### 4.1 ページコンポーネント

#### `app/page.tsx` (習慣一覧ページ)
**責務**:
- 全習慣の一覧表示
- 新規習慣作成ボタン
- 各習慣の基本統計情報表示

**主要State**:
```typescript
const [habits, setHabits] = useState<Habit[]>([]);
const [isFormOpen, setIsFormOpen] = useState(false);
```

**子コンポーネント**:
- `<HabitList>`
- `<HabitForm>` (モーダル)

#### `app/habits/[id]/page.tsx` (習慣詳細ページ)
**責務**:
- 100日カレンダー表示
- 詳細統計情報表示
- 編集・削除機能

**主要State**:
```typescript
const [habit, setHabit] = useState<Habit | null>(null);
const [records, setRecords] = useState<Record[]>([]);
const [stats, setStats] = useState<Stats | null>(null);
```

**子コンポーネント**:
- `<Calendar100Days>`
- `<StatsPanel>`
- `<HabitForm>` (編集モード)

### 4.2 フィーチャーコンポーネント

#### `components/habits/HabitCard.tsx`
**Props**:
```typescript
interface HabitCardProps {
  habit: Habit;
  stats: {
    completedDays: number;
    completionRate: number;
    currentStreak: number;
  };
  onClick: () => void;
}
```

**機能**:
- 習慣名、色、進捗率の表示
- ミニプログレスバー
- クリックで詳細ページへ遷移

#### `components/habits/HabitForm.tsx`
**Props**:
```typescript
interface HabitFormProps {
  habit?: Habit;  // 編集時のみ
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormData) => Promise<void>;
}

interface HabitFormData {
  name: string;
  color: string;
  startDate: string;
}
```

**機能**:
- 習慣名入力フィールド
- カラーピッカー（プリセット色から選択）
- 開始日選択（新規作成時のみ）
- バリデーション
  - 名前: 1〜50文字
  - 色: 有効なカラーコード

#### `components/calendar/Calendar100Days.tsx`
**Props**:
```typescript
interface Calendar100DaysProps {
  habitId: number;
  startDate: string;
  records: Record[];
  onToggle: (date: string) => Promise<void>;
}
```

**機能**:
- 100日分のグリッド表示（10行×10列）
- 各セルをクリックで達成状態トグル
- 達成日: 習慣の色で塗りつぶし
- 未達成日: グレー/ボーダーのみ
- 未記録日: 白/透明
- 今日: ボーダーハイライト

**レイアウト**:
```
Day 1   Day 2   Day 3   ... Day 10
Day 11  Day 12  Day 13  ... Day 20
...
Day 91  Day 92  Day 93  ... Day 100
```

#### `components/calendar/DayCell.tsx`
**Props**:
```typescript
interface DayCellProps {
  dayNumber: number;
  date: string;
  completed: boolean | null;  // null = 未記録
  color: string;
  isToday: boolean;
  onClick: () => void;
}
```

#### `components/stats/StatsPanel.tsx`
**Props**:
```typescript
interface StatsPanelProps {
  stats: {
    completedDays: number;
    totalDays: 100;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
  };
}
```

**表示内容**:
- 達成日数 / 100日
- 達成率（%）
- 現在の連続達成日数
- 最長連続達成日数
- プログレスバー

#### `components/stats/ProgressBar.tsx`
**Props**:
```typescript
interface ProgressBarProps {
  current: number;
  total: number;
  color: string;
}
```

### 4.3 UIコンポーネント
- `Button.tsx`: 汎用ボタン
- `Modal.tsx`: 汎用モーダル
- `Input.tsx`: テキスト入力
- `ColorPicker.tsx`: カラー選択UI
- `ConfirmDialog.tsx`: 確認ダイアログ

## 5. サービスレイヤー設計

### 5.1 `lib/services/habitService.ts`
```typescript
export class HabitService {
  static getAllHabits(): Habit[]
  static getHabitById(id: number): Habit | null
  static createHabit(data: CreateHabitData): Habit
  static updateHabit(id: number, data: UpdateHabitData): Habit
  static deleteHabit(id: number): void
}
```

### 5.2 `lib/services/recordService.ts`
```typescript
export class RecordService {
  static getRecordsByHabit(
    habitId: number,
    startDate: string,
    endDate: string
  ): Record[]

  static upsertRecord(data: UpsertRecordData): Record

  static deleteRecordsByHabit(habitId: number): void
}
```

### 5.3 `lib/utils/statsCalculator.ts`
```typescript
export class StatsCalculator {
  static calculateStats(
    records: Record[],
    startDate: string
  ): HabitStats

  private static calculateCompletionRate(records: Record[]): number
  private static calculateCurrentStreak(records: Record[]): number
  private static calculateLongestStreak(records: Record[]): number
}

interface HabitStats {
  completedDays: number;
  totalDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}
```

### 5.4 `lib/utils/dateUtils.ts`
```typescript
export class DateUtils {
  // ISO 8601形式の日付文字列を生成
  static formatDate(date: Date): string  // YYYY-MM-DD
  static formatDateTime(date: Date): string  // ISO 8601完全形式

  // 100日分の日付配列を生成
  static generate100Days(startDate: string): string[]

  // 日付比較
  static isSameDay(date1: string, date2: string): boolean
  static isToday(date: string): boolean

  // 日付加算
  static addDays(date: string, days: number): string
}
```

## 6. 型定義

### 6.1 `types/habit.ts`
```typescript
export interface Habit {
  id: number;
  name: string;
  color: string;
  startDate: string;  // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitData {
  name: string;
  color: string;
  startDate: string;
}

export interface UpdateHabitData {
  name?: string;
  color?: string;
}
```

### 6.2 `types/record.ts`
```typescript
export interface Record {
  id: number;
  habitId: number;
  date: string;  // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertRecordData {
  habitId: number;
  date: string;
  completed: boolean;
}
```

### 6.3 `types/stats.ts`
```typescript
export interface HabitStats {
  completedDays: number;
  totalDays: number;
  completionRate: number;  // 0-100
  currentStreak: number;
  longestStreak: number;
}
```

## 7. スタイリング設計

### 7.1 Tailwind CSS設定
- **カラーパレット**:
  - Primary: Blue系（#3B82F6）
  - Success: Green系（#10B981）
  - Neutral: Gray系（Tailwind標準）
  - 習慣カラー: 10種類のプリセット

```typescript
// カラープリセット例
export const HABIT_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Cyan', value: '#06B6D4' },
];
```

### 7.2 レスポンシブブレークポイント
- `sm`: 640px（スマートフォン横）
- `md`: 768px（タブレット縦）
- `lg`: 1024px（タブレット横/小型デスクトップ）
- `xl`: 1280px（デスクトップ）

### 7.3 主要スタイリングパターン

#### カードコンポーネント
```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* content */}
</div>
```

#### ボタンスタイル
```tsx
// Primary
<button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">

// Secondary
<button className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-colors">
```

#### グリッドレイアウト（100日カレンダー）
```tsx
<div className="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3">
  {/* 10×10グリッド（モバイルは5×20） */}
</div>
```

## 8. エラーハンドリング

### 8.1 API エラーレスポンス
```typescript
interface ErrorResponse {
  error: {
    message: string;
    code: string;
  };
}
```

### 8.2 エラーコード
- `HABIT_NOT_FOUND`: 習慣が存在しない
- `INVALID_INPUT`: バリデーションエラー
- `DATABASE_ERROR`: DB操作エラー
- `INTERNAL_ERROR`: その他のサーバーエラー

### 8.3 フロントエンドエラー表示
- Toast通知での一時的なエラーメッセージ表示
- フォームバリデーションエラーのインライン表示

## 9. パフォーマンス最適化

### 9.1 データ取得
- Server Componentsでの初期データフェッチ
- Client ComponentsでのSWR/React Queryの検討（必要に応じて）

### 9.2 レンダリング最適化
- `React.memo`での不要な再レンダリング防止（特にDayCell）
- `useCallback`でのイベントハンドラーメモ化

### 9.3 データベース
- インデックスの適切な設定
- 必要な期間のみのクエリ実行

## 10. テスト戦略

### 10.1 ユニットテスト
- **サービス層**: 全関数のテスト
- **ユーティリティ**: dateUtils, statsCalculatorの全関数

### 10.2 コンポーネントテスト
- **重要コンポーネント**:
  - `Calendar100Days`: クリックイベント、状態表示
  - `HabitForm`: バリデーション、送信
  - `StatsPanel`: 統計計算の正確性

### 10.3 統合テスト
- API エンドポイントのリクエスト/レスポンステスト
- CRUD操作の一連のフロー

## 11. セキュリティ考慮事項

### 11.1 入力検証
- 習慣名: XSS対策（エスケープ処理）
- 日付: フォーマット検証
- カラーコード: ホワイトリスト方式

### 11.2 SQLインジェクション対策
- プリペアドステートメントの使用
- ORMレイヤーでのクエリビルディング

## 12. デプロイメント考慮事項

### 12.1 データベースファイル
- `./data/habits.db` をgitignore
- 初回起動時の自動テーブル作成

### 12.2 環境変数
```
DATABASE_PATH=./data/habits.db
NODE_ENV=production
```

### 12.3 ビルド設定
- SQLiteはサーバーサイドのみで使用
- Next.js API Routesでのみアクセス
- Static Exportは不可（API Routes必須）

## 13. ディレクトリ構造詳細

```
habit100-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 習慣一覧
│   ├── globals.css
│   ├── habits/
│   │   └── [id]/
│   │       └── page.tsx            # 習慣詳細
│   └── api/
│       ├── habits/
│       │   ├── route.ts            # GET, POST /api/habits
│       │   └── [id]/
│       │       └── route.ts        # PATCH, DELETE /api/habits/:id
│       └── records/
│           └── route.ts            # GET, POST /api/records
├── components/
│   ├── habits/
│   │   ├── HabitCard.tsx
│   │   ├── HabitForm.tsx
│   │   └── HabitList.tsx
│   ├── calendar/
│   │   ├── Calendar100Days.tsx
│   │   └── DayCell.tsx
│   ├── stats/
│   │   ├── ProgressBar.tsx
│   │   └── StatsPanel.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Input.tsx
│       ├── ColorPicker.tsx
│       └── ConfirmDialog.tsx
├── lib/
│   ├── db/
│   │   ├── client.ts               # DB接続・初期化
│   │   └── schema.ts               # テーブル定義
│   ├── services/
│   │   ├── habitService.ts
│   │   └── recordService.ts
│   └── utils/
│       ├── dateUtils.ts
│       └── statsCalculator.ts
├── types/
│   ├── habit.ts
│   ├── record.ts
│   └── stats.ts
├── data/
│   └── .gitkeep                    # habits.dbはgitignore
├── __tests__/                      # Vitestテスト
│   ├── services/
│   ├── utils/
│   └── components/
└── public/
    └── (static assets)
```
