/**
 * LocalStorage Adapter
 * ブラウザのLocalStorageを使用したストレージアダプター実装
 */

import { StorageQuotaExceededError } from "../types/error";
import type { IStorageAdapter } from "./interface";

/**
 * LocalStorageAdapter - LocalStorageを使用したストレージアダプター
 */
export class LocalStorageAdapter implements IStorageAdapter {
  /**
   * LocalStorageからアイテムを取得
   * @param key ストレージキー
   * @returns パースされたデータ、存在しない場合やパースエラー時はnull
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      // JSONパースエラー時は警告を出してnullを返す
      console.warn(
        `Failed to parse localStorage item for key "${key}":`,
        error,
      );
      return null;
    }
  }

  /**
   * LocalStorageにアイテムを保存
   * @param key ストレージキー
   * @param value 保存するデータ
   * @throws {StorageQuotaExceededError} ストレージ容量超過時
   */
  setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      // QuotaExceededErrorのチェック
      if (
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" ||
          error.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        throw new StorageQuotaExceededError();
      }
      // その他のエラーは再スロー
      throw error;
    }
  }

  /**
   * LocalStorageからアイテムを削除
   * @param key ストレージキー
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * LocalStorageのすべてのアイテムをクリア
   */
  clear(): void {
    localStorage.clear();
  }
}
