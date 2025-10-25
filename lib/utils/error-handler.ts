/**
 * Error Handler Utilities
 * エラーハンドリングユーティリティ
 */

import type { AppError } from "../types/error";

/**
 * エラーメッセージとアクションを返す
 * @param error エラーオブジェクト
 * @returns エラーメッセージとアクション
 */
export function handleError(error: unknown): {
  message: string;
  action?: string;
} {
  if (error instanceof Error) {
    const errorCode = (error as AppError).code;
    return {
      message: error.message,
      action: getErrorAction(errorCode),
    };
  }

  console.error("Unexpected error:", error);
  return { message: "予期しないエラーが発生しました" };
}

/**
 * エラーコードに対応するアクションを取得
 * @param code エラーコード
 * @returns アクション文字列
 */
function getErrorAction(code?: string): string | undefined {
  if (!code) return undefined;

  const actions: Record<string, string> = {
    STORAGE_QUOTA_EXCEEDED: "データを削除",
    NETWORK_ERROR: "再試行",
    DUPLICATE_HABIT: "既存の習慣を削除",
  };

  return actions[code];
}

/**
 * エラーをログに記録
 * @param error エラーオブジェクト
 * @param context 追加のコンテキスト情報
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  console.error("[Error]", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });

  // 将来的にSentry等の外部サービスに送信
  // Sentry.captureException(error, { extra: context });
}
