/**
 * Storage Adapter Interface
 * データ永続化の抽象化インターフェース
 */

/**
 * IStorageAdapter - ストレージアダプターのインターフェース
 * LocalStorage、Vercel Postgres、Supabaseなど、異なるストレージ実装を抽象化
 */
export interface IStorageAdapter {
  /**
   * アイテムを取得
   * @param key ストレージキー
   * @returns 保存されたデータ、存在しない場合はnull
   */
  getItem<T>(key: string): T | null;

  /**
   * アイテムを保存
   * @param key ストレージキー
   * @param value 保存するデータ
   */
  setItem<T>(key: string, value: T): void;

  /**
   * アイテムを削除
   * @param key ストレージキー
   */
  removeItem(key: string): void;

  /**
   * すべてのアイテムをクリア
   */
  clear(): void;
}
