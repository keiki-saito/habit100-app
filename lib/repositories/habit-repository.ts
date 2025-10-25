/**
 * Habit Repository
 * 習慣データと日次記録の永続化・取得を管理
 */

import { v4 as uuidv4 } from "uuid";
import type { IStorageAdapter } from "../storage/interface";
import {
  DuplicateHabitError,
  InvalidDateError,
  RecordBeforeStartDateError,
  ValidationError,
} from "../types/error";
import type {
  CreateHabitInput,
  DailyRecord,
  Habit,
  RecordDayInput,
  UpdateHabitInput,
} from "../types/habit";

/**
 * LocalStorageのキー定義
 */
const STORAGE_KEYS = {
  HABIT: "habit",
  DAILY_RECORDS: "dailyRecords",
} as const;

/**
 * HabitRepository Interface
 */
export interface IHabitRepository {
  getHabit(): Habit | null;
  createHabit(data: CreateHabitInput): Habit;
  updateHabit(data: UpdateHabitInput): Habit;
  getDailyRecords(): DailyRecord[];
  recordDay(data: RecordDayInput): DailyRecord;
  clear(): void;
}

/**
 * LocalStorageHabitRepository - LocalStorageを使用したHabitRepository実装
 */
export class LocalStorageHabitRepository implements IHabitRepository {
  constructor(private storage: IStorageAdapter) {}

  /**
   * 現在の習慣を取得
   * @returns 習慣データ、存在しない場合はnull
   */
  getHabit(): Habit | null {
    const habitData = this.storage.getItem<Habit>(STORAGE_KEYS.HABIT);
    if (!habitData) {
      return null;
    }

    // Date型の復元（LocalStorageはJSONで保存されるため文字列になっている）
    return {
      ...habitData,
      startDate: new Date(habitData.startDate),
      createdAt: new Date(habitData.createdAt),
      updatedAt: new Date(habitData.updatedAt),
    };
  }

  /**
   * 新しい習慣を作成
   * @param data 習慣作成データ
   * @returns 作成された習慣
   * @throws {ValidationError} バリデーションエラー
   * @throws {DuplicateHabitError} 既に習慣が存在する場合
   */
  createHabit(data: CreateHabitInput): Habit {
    // バリデーション
    this.validateCreateHabitInput(data);

    // 既存の習慣チェック
    const existingHabit = this.getHabit();
    if (existingHabit) {
      throw new DuplicateHabitError();
    }

    // 新しい習慣を作成
    const now = new Date();
    const habit: Habit = {
      id: uuidv4(),
      name: data.name.trim(),
      startDate: data.startDate,
      createdAt: now,
      updatedAt: now,
    };

    // 保存
    this.storage.setItem(STORAGE_KEYS.HABIT, habit);

    return habit;
  }

  /**
   * 習慣を更新
   * @param data 習慣更新データ
   * @returns 更新された習慣
   * @throws {ValidationError} バリデーションエラー
   */
  updateHabit(data: UpdateHabitInput): Habit {
    const existingHabit = this.getHabit();
    if (!existingHabit) {
      throw new ValidationError("習慣が存在しません");
    }

    if (existingHabit.id !== data.id) {
      throw new ValidationError("習慣IDが一致しません");
    }

    // 名前の更新
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new ValidationError("習慣名を入力してください");
      }
      if (data.name.length > 100) {
        throw new ValidationError("習慣名は100文字以内で入力してください");
      }
    }

    const updatedHabit: Habit = {
      ...existingHabit,
      ...(data.name !== undefined && { name: data.name.trim() }),
      updatedAt: new Date(),
    };

    this.storage.setItem(STORAGE_KEYS.HABIT, updatedHabit);

    return updatedHabit;
  }

  /**
   * 全ての日次記録を取得
   * @returns 日次記録の配列
   */
  getDailyRecords(): DailyRecord[] {
    const recordsData = this.storage.getItem<DailyRecord[]>(
      STORAGE_KEYS.DAILY_RECORDS,
    );
    if (!recordsData) {
      return [];
    }

    // Date型の復元
    return recordsData.map((record) => ({
      ...record,
      date: new Date(record.date),
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    }));
  }

  /**
   * 日次記録を作成または更新
   * @param data 記録データ
   * @returns 作成/更新された記録
   * @throws {ValidationError} バリデーションエラー
   * @throws {RecordBeforeStartDateError} 開始日より前の日付で記録しようとした場合
   * @throws {InvalidDateError} 未来の日付で記録しようとした場合
   */
  recordDay(data: RecordDayInput): DailyRecord {
    // 習慣の存在確認
    const habit = this.getHabit();
    if (!habit) {
      throw new ValidationError("習慣が登録されていません");
    }

    // バリデーション
    this.validateRecordDayInput(data, habit);

    const records = this.getDailyRecords();
    const existingRecordIndex = records.findIndex((r) =>
      this.isSameDay(r.date, data.date),
    );

    let record: DailyRecord;
    const now = new Date();

    if (existingRecordIndex !== -1) {
      // 既存の記録を更新
      record = {
        ...records[existingRecordIndex],
        achieved: data.achieved,
        note: data.note,
        updatedAt: now,
      };
      records[existingRecordIndex] = record;
    } else {
      // 新しい記録を作成
      record = {
        id: uuidv4(),
        habitId: habit.id,
        date: data.date,
        achieved: data.achieved,
        note: data.note,
        createdAt: now,
        updatedAt: now,
      };
      records.push(record);
    }

    // 保存（日付でソート）
    records.sort((a, b) => a.date.getTime() - b.date.getTime());
    this.storage.setItem(STORAGE_KEYS.DAILY_RECORDS, records);

    return record;
  }

  /**
   * 全データをクリア（テスト・リセット用）
   */
  clear(): void {
    this.storage.removeItem(STORAGE_KEYS.HABIT);
    this.storage.removeItem(STORAGE_KEYS.DAILY_RECORDS);
  }

  /**
   * CreateHabitInputのバリデーション
   */
  private validateCreateHabitInput(data: CreateHabitInput): void {
    // 習慣名のバリデーション
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("習慣名を入力してください");
    }

    if (data.name.length > 100) {
      throw new ValidationError("習慣名は100文字以内で入力してください");
    }

    // 開始日のバリデーション
    if (
      !(data.startDate instanceof Date) ||
      Number.isNaN(data.startDate.getTime())
    ) {
      throw new InvalidDateError("開始日が無効です");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.startDate > today) {
      throw new InvalidDateError("開始日は今日以前の日付を指定してください");
    }
  }

  /**
   * RecordDayInputのバリデーション
   */
  private validateRecordDayInput(data: RecordDayInput, habit: Habit): void {
    // 日付のバリデーション
    if (!(data.date instanceof Date) || Number.isNaN(data.date.getTime())) {
      throw new InvalidDateError("記録日が無効です");
    }

    // 未来の日付チェック
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.date > today) {
      throw new InvalidDateError("未来の日付は記録できません");
    }

    // 開始日より前のチェック
    const startDate = new Date(habit.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (data.date < startDate) {
      throw new RecordBeforeStartDateError();
    }

    // メモのバリデーション
    if (data.note && data.note.length > 500) {
      throw new ValidationError("メモは500文字以内で入力してください");
    }
  }

  /**
   * 2つの日付が同じ日かどうか判定
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
