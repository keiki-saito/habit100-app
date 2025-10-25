/**
 * Error Types
 * エラー型定義とエラーハンドリング
 */

/**
 * AppError - アプリケーション共通エラー基底クラス
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
    // プロトタイプチェーンを正しく設定（TypeScript対応）
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * ValidationError - バリデーションエラー（400）
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message, 400);
  }
}

/**
 * StorageQuotaExceededError - ストレージ容量超過エラー（507）
 */
export class StorageQuotaExceededError extends AppError {
  constructor() {
    super(
      "STORAGE_QUOTA_EXCEEDED",
      "ストレージ容量が不足しています。古いデータを削除してください。",
      507,
    );
  }
}

/**
 * DuplicateHabitError - 習慣重複エラー（422）
 */
export class DuplicateHabitError extends AppError {
  constructor() {
    super(
      "DUPLICATE_HABIT",
      "既に習慣が登録されています。新しい習慣を登録するには、現在の習慣を削除してください。",
      422,
    );
  }
}

/**
 * RecordBeforeStartDateError - 開始日より前の記録エラー（422）
 */
export class RecordBeforeStartDateError extends AppError {
  constructor() {
    super(
      "RECORD_BEFORE_START_DATE",
      "習慣開始日より前の日付は記録できません",
      422,
    );
  }
}

/**
 * InvalidDateError - 無効な日付エラー（400）
 */
export class InvalidDateError extends AppError {
  constructor(message: string = "無効な日付です") {
    super("INVALID_DATE", message, 400);
  }
}

/**
 * ErrorResponse - APIエラーレスポンス型
 */
export interface ErrorResponse {
  error: {
    type: ErrorType;
    message: string;
    code: string;
  };
}

/**
 * ErrorType - エラー種別
 */
export type ErrorType =
  | "validation_error"
  | "authentication_error"
  | "rate_limit_error"
  | "api_error";

/**
 * OpenRouterError - OpenRouter APIエラー型
 */
export interface OpenRouterError {
  error: {
    type: ErrorType;
    message: string;
    code: string;
  };
}
