# 100日チャレンジ習慣トラッカー - 実装計画

## 実装フェーズ概要

実装を以下の8フェーズに分けて段階的に進めます。各フェーズは独立してテスト可能な単位とします。

```
Phase 1: 基盤セットアップ（型定義・ユーティリティ）
   ↓
Phase 2: データベース層の実装
   ↓
Phase 3: サービス層の実装
   ↓
Phase 4: API層の実装
   ↓
Phase 5: UI共通コンポーネントの実装
   ↓
Phase 6: 習慣管理機能の実装
   ↓
Phase 7: カレンダー・記録機能の実装
   ↓
Phase 8: 統計・進捗表示機能の実装
```

---

## Phase 1: 基盤セットアップ

### 1.1 依存パッケージのインストール

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

### 1.2 型定義ファイルの作成

#### ファイル: `types/habit.ts`
```typescript
export interface Habit {
  id: number;
  name: string;
  color: string;
  startDate: string;
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

#### ファイル: `types/record.ts`
```typescript
export interface HabitRecord {
  id: number;
  habitId: number;
  date: string;
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

#### ファイル: `types/stats.ts`
```typescript
export interface HabitStats {
  completedDays: number;
  totalDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}
```

### 1.3 定数ファイルの作成

#### ファイル: `lib/constants/colors.ts`
```typescript
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
] as const;
```

### 1.4 ユーティリティ関数の実装

#### ファイル: `lib/utils/dateUtils.ts`
**実装内容**:
- `formatDate(date: Date): string` - YYYY-MM-DD形式に変換
- `formatDateTime(date: Date): string` - ISO 8601完全形式
- `generate100Days(startDate: string): string[]` - 100日分の日付配列
- `isSameDay(date1: string, date2: string): boolean`
- `isToday(date: string): boolean`
- `addDays(date: string, days: number): string`

**テスト**: `__tests__/utils/dateUtils.test.ts`
- 各関数の正常系・異常系テスト
- タイムゾーン考慮のテスト

#### ファイル: `lib/utils/statsCalculator.ts`
**実装内容**:
- `calculateStats(records: HabitRecord[], startDate: string): HabitStats`
- `calculateCompletionRate(records: HabitRecord[]): number`
- `calculateCurrentStreak(records: HabitRecord[]): number`
- `calculateLongestStreak(records: HabitRecord[]): number`

**ロジック詳細**:
- **達成率**: (達成日数 / 記録済み日数) × 100
- **連続日数**: 今日から遡って連続で達成している日数
- **最長連続**: 過去の記録から最長の連続達成日数を計算

**テスト**: `__tests__/utils/statsCalculator.test.ts`

### 1.5 ディレクトリ構造の作成

```bash
mkdir -p types
mkdir -p lib/{db,services,utils,constants}
mkdir -p components/{habits,calendar,stats,ui}
mkdir -p app/api/{habits,records}
mkdir -p app/habits/[id]
mkdir -p data
mkdir -p __tests__/{utils,services,components}
```

### 1.6 gitignore更新

`.gitignore`に追加:
```
# SQLite database
/data/*.db
/data/*.db-journal
/data/*.db-wal
```

**成果物**:
- ✅ 型定義ファイル（habit, record, stats）
- ✅ ユーティリティ関数（dateUtils, statsCalculator）
- ✅ 定数ファイル（colors）
- ✅ ディレクトリ構造
- ✅ ユニットテスト

---

## Phase 2: データベース層の実装

### 2.1 データベーススキーマの定義

#### ファイル: `lib/db/schema.ts`
```typescript
export const CREATE_HABITS_TABLE = `
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    start_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

export const CREATE_HABIT_RECORDS_TABLE = `
  CREATE TABLE IF NOT EXISTS habit_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER NOT NULL CHECK(completed IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, date)
  )
`;

export const CREATE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_habit_records_habit_id ON habit_records(habit_id)',
  'CREATE INDEX IF NOT EXISTS idx_habit_records_date ON habit_records(date)',
];
```

### 2.2 データベース接続クライアントの実装

#### ファイル: `lib/db/client.ts`
**実装内容**:
```typescript
import Database from 'better-sqlite3';
import path from 'path';
import { CREATE_HABITS_TABLE, CREATE_HABIT_RECORDS_TABLE, CREATE_INDEXES } from './schema';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'habits.db');
    db = new Database(dbPath);

    // WALモード有効化（パフォーマンス向上）
    db.pragma('journal_mode = WAL');

    // テーブル作成
    db.exec(CREATE_HABITS_TABLE);
    db.exec(CREATE_HABIT_RECORDS_TABLE);

    // インデックス作成
    CREATE_INDEXES.forEach(sql => db!.exec(sql));
  }

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
```

**注意点**:
- シングルトンパターンでDB接続を管理
- 初回呼び出し時に自動でテーブル作成
- `data`ディレクトリが存在しない場合は事前に作成

### 2.3 データベース初期化スクリプト

#### ファイル: `scripts/init-db.ts`
```typescript
import { getDatabase } from '../lib/db/client';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = getDatabase();
console.log('✅ Database initialized successfully');
```

**package.jsonに追加**:
```json
"scripts": {
  "db:init": "tsx scripts/init-db.ts"
}
```

### 2.4 依存パッケージ追加

```bash
npm install -D tsx
```

**成果物**:
- ✅ スキーマ定義（schema.ts）
- ✅ DB接続クライアント（client.ts）
- ✅ 初期化スクリプト
- ✅ dataディレクトリ作成

---

## Phase 3: サービス層の実装

### 3.1 HabitServiceの実装

#### ファイル: `lib/services/habitService.ts`
**実装メソッド**:

```typescript
import { getDatabase } from '../db/client';
import type { Habit, CreateHabitData, UpdateHabitData } from '@/types/habit';
import { formatDateTime } from '../utils/dateUtils';

export class HabitService {
  static getAllHabits(): Habit[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM habits ORDER BY created_at DESC');
    const rows = stmt.all();
    return rows.map(this.mapRowToHabit);
  }

  static getHabitById(id: number): Habit | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM habits WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.mapRowToHabit(row) : null;
  }

  static createHabit(data: CreateHabitData): Habit {
    const db = getDatabase();
    const now = formatDateTime(new Date());
    const stmt = db.prepare(`
      INSERT INTO habits (name, color, start_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.name, data.color, data.startDate, now, now);
    return this.getHabitById(result.lastInsertRowid as number)!;
  }

  static updateHabit(id: number, data: UpdateHabitData): Habit {
    const db = getDatabase();
    const now = formatDateTime(new Date());
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      values.push(data.color);
    }

    updates.push('updated_at = ?');
    values.push(now, id);

    const stmt = db.prepare(`UPDATE habits SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    return this.getHabitById(id)!;
  }

  static deleteHabit(id: number): void {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM habits WHERE id = ?');
    stmt.run(id);
  }

  private static mapRowToHabit(row: any): Habit {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      startDate: row.start_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

**テスト**: `__tests__/services/habitService.test.ts`
- CRUD操作の全パターン
- エッジケース（存在しないID、不正なデータ等）

### 3.2 RecordServiceの実装

#### ファイル: `lib/services/recordService.ts`
**実装メソッド**:

```typescript
import { getDatabase } from '../db/client';
import type { HabitRecord, UpsertRecordData } from '@/types/record';
import { formatDateTime } from '../utils/dateUtils';

export class RecordService {
  static getRecordsByHabit(
    habitId: number,
    startDate: string,
    endDate: string
  ): HabitRecord[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM habit_records
      WHERE habit_id = ? AND date >= ? AND date <= ?
      ORDER BY date ASC
    `);
    const rows = stmt.all(habitId, startDate, endDate);
    return rows.map(this.mapRowToRecord);
  }

  static upsertRecord(data: UpsertRecordData): HabitRecord {
    const db = getDatabase();
    const now = formatDateTime(new Date());
    const completed = data.completed ? 1 : 0;

    const stmt = db.prepare(`
      INSERT INTO habit_records (habit_id, date, completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(habit_id, date)
      DO UPDATE SET completed = ?, updated_at = ?
    `);

    stmt.run(data.habitId, data.date, completed, now, now, completed, now);

    const selectStmt = db.prepare(
      'SELECT * FROM habit_records WHERE habit_id = ? AND date = ?'
    );
    return this.mapRowToRecord(selectStmt.get(data.habitId, data.date));
  }

  static deleteRecordsByHabit(habitId: number): void {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM habit_records WHERE habit_id = ?');
    stmt.run(habitId);
  }

  private static mapRowToRecord(row: any): HabitRecord {
    return {
      id: row.id,
      habitId: row.habit_id,
      date: row.date,
      completed: row.completed === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

**テスト**: `__tests__/services/recordService.test.ts`
- upsert動作の検証（新規作成・更新）
- 期間指定での取得
- 削除処理

**成果物**:
- ✅ HabitService実装
- ✅ RecordService実装
- ✅ サービス層のユニットテスト

---

## Phase 4: API層の実装

### 4.1 習慣管理API

#### ファイル: `app/api/habits/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { HabitService } from '@/lib/services/habitService';
import type { CreateHabitData } from '@/types/habit';

// GET /api/habits
export async function GET() {
  try {
    const habits = HabitService.getAllHabits();
    return NextResponse.json({ habits });
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Failed to fetch habits', code: 'DATABASE_ERROR' } },
      { status: 500 }
    );
  }
}

// POST /api/habits
export async function POST(request: NextRequest) {
  try {
    const body: CreateHabitData = await request.json();

    // バリデーション
    if (!body.name || body.name.length > 50) {
      return NextResponse.json(
        { error: { message: 'Invalid habit name', code: 'INVALID_INPUT' } },
        { status: 400 }
      );
    }

    const habit = HabitService.createHabit(body);
    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Failed to create habit', code: 'DATABASE_ERROR' } },
      { status: 500 }
    );
  }
}
```

#### ファイル: `app/api/habits/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { HabitService } from '@/lib/services/habitService';
import type { UpdateHabitData } from '@/types/habit';

// PATCH /api/habits/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body: UpdateHabitData = await request.json();

    const habit = HabitService.updateHabit(id, body);
    return NextResponse.json({ habit });
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Failed to update habit', code: 'DATABASE_ERROR' } },
      { status: 500 }
    );
  }
}

// DELETE /api/habits/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    HabitService.deleteHabit(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Failed to delete habit', code: 'DATABASE_ERROR' } },
      { status: 500 }
    );
  }
}
```

### 4.2 記録管理API

#### ファイル: `app/api/records/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { RecordService } from '@/lib/services/recordService';
import { HabitService } from '@/lib/services/habitService';
import { addDays } from '@/lib/utils/dateUtils';
import type { UpsertRecordData } from '@/types/record';

// GET /api/records?habitId=1&startDate=2024-01-01&endDate=2024-04-10
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const habitId = parseInt(searchParams.get('habitId') || '');

    if (!habitId) {
      return NextResponse.json(
        { error: { message: 'habitId is required', code: 'INVALID_INPUT' } },
        { status: 400 }
      );
    }

    const habit = HabitService.getHabitById(habitId);
    if (!habit) {
      return NextResponse.json(
        { error: { message: 'Habit not found', code: 'HABIT_NOT_FOUND' } },
        { status: 404 }
      );
    }

    const startDate = searchParams.get('startDate') || habit.startDate;
    const endDate = searchParams.get('endDate') || addDays(startDate, 99);

    const records = RecordService.getRecordsByHabit(habitId, startDate, endDate);
    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Failed to fetch records', code: 'DATABASE_ERROR' } },
      { status: 500 }
    );
  }
}

// POST /api/records (upsert)
export async function POST(request: NextRequest) {
  try {
    const body: UpsertRecordData = await request.json();

    const record = RecordService.upsertRecord(body);
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Failed to save record', code: 'DATABASE_ERROR' } },
      { status: 500 }
    );
  }
}
```

**成果物**:
- ✅ 習慣管理API（GET, POST, PATCH, DELETE）
- ✅ 記録管理API（GET, POST）
- ✅ バリデーション・エラーハンドリング

---

## Phase 5: UI共通コンポーネントの実装

### 5.1 Buttonコンポーネント

#### ファイル: `components/ui/Button.tsx`
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-md font-medium transition-colors';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### 5.2 Inputコンポーネント

#### ファイル: `components/ui/Input.tsx`
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

### 5.3 Modalコンポーネント

#### ファイル: `components/ui/Modal.tsx`
```typescript
'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
```

### 5.4 ColorPickerコンポーネント

#### ファイル: `components/ui/ColorPicker.tsx`
```typescript
import { HABIT_COLORS } from '@/lib/constants/colors';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Color
      </label>
      <div className="flex flex-wrap gap-2">
        {HABIT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`h-10 w-10 rounded-full transition-transform hover:scale-110 ${
              value === color.value ? 'ring-2 ring-gray-400 ring-offset-2' : ''
            }`}
            style={{ backgroundColor: color.value }}
            aria-label={color.name}
          />
        ))}
      </div>
    </div>
  );
}
```

### 5.5 ConfirmDialogコンポーネント

#### ファイル: `components/ui/ConfirmDialog.tsx`
```typescript
'use client';

import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-6 text-gray-600">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          削除
        </Button>
      </div>
    </Modal>
  );
}
```

**成果物**:
- ✅ Button, Input, Modal, ColorPicker, ConfirmDialog
- ✅ Tailwind CSSでのスタイリング
- ✅ アクセシビリティ対応（aria-label等）

---

## Phase 6: 習慣管理機能の実装

### 6.1 HabitFormコンポーネント

#### ファイル: `components/habits/HabitForm.tsx`
```typescript
'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { ColorPicker } from '../ui/ColorPicker';
import { Button } from '../ui/Button';
import { HABIT_COLORS } from '@/lib/constants/colors';
import { formatDate } from '@/lib/utils/dateUtils';
import type { Habit } from '@/types/habit';

interface HabitFormProps {
  habit?: Habit;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormData) => Promise<void>;
}

interface HabitFormData {
  name: string;
  color: string;
  startDate: string;
}

export function HabitForm({ habit, isOpen, onClose, onSubmit }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [color, setColor] = useState(habit?.color || HABIT_COLORS[0].value);
  const [startDate, setStartDate] = useState(
    habit?.startDate || formatDate(new Date())
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length === 0 || name.length > 50) {
      setError('習慣名は1〜50文字で入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), color, startDate });
      onClose();
      // リセット
      setName('');
      setColor(HABIT_COLORS[0].value);
      setStartDate(formatDate(new Date()));
    } catch (err) {
      setError('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={habit ? '習慣を編集' : '新しい習慣'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="習慣名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 筋トレ、読書、瞑想"
          error={error}
          maxLength={50}
        />

        <ColorPicker value={color} onChange={setColor} />

        {!habit && (
          <Input
            type="date"
            label="開始日"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : habit ? '更新' : '作成'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

### 6.2 HabitCardコンポーネント

#### ファイル: `components/habits/HabitCard.tsx`
```typescript
'use client';

import Link from 'next/link';
import type { Habit } from '@/types/habit';
import { ProgressBar } from '../stats/ProgressBar';

interface HabitCardProps {
  habit: Habit;
  stats: {
    completedDays: number;
    completionRate: number;
    currentStreak: number;
  };
}

export function HabitCard({ habit, stats }: HabitCardProps) {
  return (
    <Link href={`/habits/${habit.id}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <h3 className="text-lg font-semibold">{habit.name}</h3>
        </div>

        <ProgressBar
          current={stats.completedDays}
          total={100}
          color={habit.color}
        />

        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>{stats.completedDays} / 100日</span>
          <span>連続: {stats.currentStreak}日</span>
        </div>
      </div>
    </Link>
  );
}
```

### 6.3 HabitListコンポーネント

#### ファイル: `components/habits/HabitList.tsx`
```typescript
'use client';

import { HabitCard } from './HabitCard';
import type { Habit } from '@/types/habit';
import type { HabitStats } from '@/types/stats';

interface HabitListProps {
  habits: Array<{ habit: Habit; stats: HabitStats }>;
}

export function HabitList({ habits }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">まだ習慣が登録されていません</p>
        <p className="mt-2 text-sm text-gray-400">
          「新しい習慣」ボタンから習慣を追加しましょう
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {habits.map(({ habit, stats }) => (
        <HabitCard key={habit.id} habit={habit} stats={stats} />
      ))}
    </div>
  );
}
```

### 6.4 習慣一覧ページ

#### ファイル: `app/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { HabitList } from '@/components/habits/HabitList';
import { HabitForm } from '@/components/habits/HabitForm';
import { Button } from '@/components/ui/Button';
import type { Habit } from '@/types/habit';
import type { HabitStats } from '@/types/stats';

export default function HomePage() {
  const [habits, setHabits] = useState<Array<{ habit: Habit; stats: HabitStats }>>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await fetch('/api/habits');
      const { habits: fetchedHabits } = await res.json();

      // 各習慣の統計を取得
      const habitsWithStats = await Promise.all(
        fetchedHabits.map(async (habit: Habit) => {
          const statsRes = await fetch(
            `/api/records?habitId=${habit.id}&startDate=${habit.startDate}`
          );
          const { records } = await statsRes.json();

          // 統計計算（後でStatsCalculatorを使用）
          const completedDays = records.filter((r: any) => r.completed).length;
          const stats = {
            completedDays,
            totalDays: 100,
            completionRate: (completedDays / 100) * 100,
            currentStreak: 0, // TODO: 計算
            longestStreak: 0, // TODO: 計算
          };

          return { habit, stats };
        })
      );

      setHabits(habitsWithStats);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHabit = async (data: any) => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await fetchHabits();
    }
  };

  if (isLoading) {
    return <div className="p-8">読み込み中...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">100日チャレンジ</h1>
        <Button onClick={() => setIsFormOpen(true)}>新しい習慣</Button>
      </div>

      <HabitList habits={habits} />

      <HabitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateHabit}
      />
    </div>
  );
}
```

**成果物**:
- ✅ HabitForm（作成・編集）
- ✅ HabitCard（カード表示）
- ✅ HabitList（一覧）
- ✅ ホームページ（習慣一覧）

---

## Phase 7: カレンダー・記録機能の実装

### 7.1 DayCellコンポーネント

#### ファイル: `components/calendar/DayCell.tsx`
```typescript
'use client';

import { memo } from 'react';

interface DayCellProps {
  dayNumber: number;
  date: string;
  completed: boolean | null;
  color: string;
  isToday: boolean;
  onClick: () => void;
}

export const DayCell = memo(function DayCell({
  dayNumber,
  completed,
  color,
  isToday,
  onClick,
}: DayCellProps) {
  const getCellStyles = () => {
    if (completed === true) {
      return {
        backgroundColor: color,
        borderColor: color,
      };
    }
    if (completed === false) {
      return {
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
      };
    }
    return {
      backgroundColor: 'white',
      borderColor: '#e5e7eb',
    };
  };

  const styles = getCellStyles();

  return (
    <button
      onClick={onClick}
      className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
        isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={styles}
    >
      <span
        className={`text-sm font-medium ${
          completed === true ? 'text-white' : 'text-gray-600'
        }`}
      >
        {dayNumber}
      </span>
    </button>
  );
});
```

### 7.2 Calendar100Daysコンポーネント

#### ファイル: `components/calendar/Calendar100Days.tsx`
```typescript
'use client';

import { useMemo } from 'react';
import { DayCell } from './DayCell';
import { generate100Days, isToday } from '@/lib/utils/dateUtils';
import type { HabitRecord } from '@/types/record';

interface Calendar100DaysProps {
  habitId: number;
  habitColor: string;
  startDate: string;
  records: HabitRecord[];
  onToggle: (date: string) => Promise<void>;
}

export function Calendar100Days({
  habitId,
  habitColor,
  startDate,
  records,
  onToggle,
}: Calendar100DaysProps) {
  const dates = useMemo(() => generate100Days(startDate), [startDate]);

  const recordsMap = useMemo(() => {
    const map = new Map<string, boolean>();
    records.forEach((record) => {
      map.set(record.date, record.completed);
    });
    return map;
  }, [records]);

  const handleDayClick = async (date: string) => {
    await onToggle(date);
  };

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3">
      {dates.map((date, index) => (
        <DayCell
          key={date}
          dayNumber={index + 1}
          date={date}
          completed={recordsMap.get(date) ?? null}
          color={habitColor}
          isToday={isToday(date)}
          onClick={() => handleDayClick(date)}
        />
      ))}
    </div>
  );
}
```

**成果物**:
- ✅ DayCell（各日セル）
- ✅ Calendar100Days（100日グリッド）
- ✅ クリックでトグル機能
- ✅ React.memoでの最適化

---

## Phase 8: 統計・進捗表示機能の実装

### 8.1 ProgressBarコンポーネント

#### ファイル: `components/stats/ProgressBar.tsx`
```typescript
interface ProgressBarProps {
  current: number;
  total: number;
  color: string;
}

export function ProgressBar({ current, total, color }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">{percentage}%</span>
        <span className="text-gray-500">
          {current} / {total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
```

### 8.2 StatsPanelコンポーネント

#### ファイル: `components/stats/StatsPanel.tsx`
```typescript
import type { HabitStats } from '@/types/stats';

interface StatsPanelProps {
  stats: HabitStats;
  color: string;
}

export function StatsPanel({ stats, color }: StatsPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">統計情報</h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">達成日数</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {stats.completedDays} / {stats.totalDays}日
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">達成率</p>
          <p className="text-2xl font-bold">
            {stats.completionRate.toFixed(1)}%
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">現在の連続</p>
            <p className="text-xl font-semibold">{stats.currentStreak}日</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">最長連続</p>
            <p className="text-xl font-semibold">{stats.longestStreak}日</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 8.3 習慣詳細ページ

#### ファイル: `app/habits/[id]/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar100Days } from '@/components/calendar/Calendar100Days';
import { StatsPanel } from '@/components/stats/StatsPanel';
import { HabitForm } from '@/components/habits/HabitForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { StatsCalculator } from '@/lib/utils/statsCalculator';
import type { Habit } from '@/types/habit';
import type { HabitRecord } from '@/types/record';
import type { HabitStats } from '@/types/stats';

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const habitId = parseInt(params.id as string);

  const [habit, setHabit] = useState<Habit | null>(null);
  const [records, setRecords] = useState<HabitRecord[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchHabitData();
  }, [habitId]);

  const fetchHabitData = async () => {
    try {
      // 習慣取得
      const habitRes = await fetch(`/api/habits`);
      const { habits } = await habitRes.json();
      const foundHabit = habits.find((h: Habit) => h.id === habitId);

      if (!foundHabit) {
        router.push('/');
        return;
      }

      setHabit(foundHabit);

      // 記録取得
      const recordsRes = await fetch(
        `/api/records?habitId=${habitId}&startDate=${foundHabit.startDate}`
      );
      const { records: fetchedRecords } = await recordsRes.json();
      setRecords(fetchedRecords);

      // 統計計算
      const calculatedStats = StatsCalculator.calculateStats(
        fetchedRecords,
        foundHabit.startDate
      );
      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to fetch habit data:', error);
    }
  };

  const handleToggleDay = async (date: string) => {
    if (!habit) return;

    const existingRecord = records.find((r) => r.date === date);
    const newCompleted = existingRecord ? !existingRecord.completed : true;

    try {
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId: habit.id,
          date,
          completed: newCompleted,
        }),
      });

      await fetchHabitData();
    } catch (error) {
      console.error('Failed to toggle record:', error);
    }
  };

  const handleUpdateHabit = async (data: any) => {
    try {
      await fetch(`/api/habits/${habitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await fetchHabitData();
    } catch (error) {
      console.error('Failed to update habit:', error);
    }
  };

  const handleDeleteHabit = async () => {
    try {
      await fetch(`/api/habits/${habitId}`, { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  if (!habit || !stats) {
    return <div className="p-8">読み込み中...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← 戻る
          </button>
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <h1 className="text-3xl font-bold">{habit.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsEditFormOpen(true)}>
            編集
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            削除
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Calendar100Days
            habitId={habit.id}
            habitColor={habit.color}
            startDate={habit.startDate}
            records={records}
            onToggle={handleToggleDay}
          />
        </div>
        <div>
          <StatsPanel stats={stats} color={habit.color} />
        </div>
      </div>

      <HabitForm
        habit={habit}
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={handleUpdateHabit}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteHabit}
        title="習慣を削除"
        message="この習慣と全ての記録を削除してもよろしいですか?この操作は取り消せません。"
      />
    </div>
  );
}
```

**成果物**:
- ✅ ProgressBar（進捗バー）
- ✅ StatsPanel（統計パネル）
- ✅ 習慣詳細ページ（カレンダー + 統計）
- ✅ 編集・削除機能

---

## テスト実装計画

### ユニットテスト
1. **dateUtils.test.ts**
   - 日付フォーマット
   - 100日生成
   - 日付比較

2. **statsCalculator.test.ts**
   - 達成率計算
   - 連続日数計算

3. **habitService.test.ts**
   - CRUD操作

4. **recordService.test.ts**
   - Upsert動作

### コンポーネントテスト
1. **Calendar100Days.test.tsx**
   - クリックイベント
   - 状態表示

2. **HabitForm.test.tsx**
   - バリデーション
   - 送信処理

3. **StatsPanel.test.tsx**
   - 統計表示

---

## 実装順序まとめ

1. ✅ **Phase 1**: 基盤（型、ユーティリティ、定数）
2. ✅ **Phase 2**: DB層（スキーマ、接続）
3. ✅ **Phase 3**: サービス層（HabitService, RecordService）
4. ✅ **Phase 4**: API層（REST endpoints）
5. ✅ **Phase 5**: UI共通コンポーネント
6. ✅ **Phase 6**: 習慣管理機能
7. ✅ **Phase 7**: カレンダー・記録機能
8. ✅ **Phase 8**: 統計・進捗表示

---

## 最終チェックリスト

### 機能
- [ ] 習慣の作成・編集・削除
- [ ] 100日カレンダー表示
- [ ] 日々のチェック記録
- [ ] 統計情報の表示
- [ ] レスポンシブデザイン

### 品質
- [ ] 全ユニットテスト通過
- [ ] コンポーネントテスト通過
- [ ] Biomeリント通過
- [ ] TypeScript型チェック通過

### パフォーマンス
- [ ] ページ読み込み2秒以内
- [ ] チェック操作100ms以内
- [ ] React.memoで最適化

### デプロイ
- [ ] .gitignoreにDB追加
- [ ] 環境変数設定
- [ ] ビルド成功確認
