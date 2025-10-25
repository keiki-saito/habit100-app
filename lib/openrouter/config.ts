/**
 * OpenRouter Configuration
 * OpenRouterの初期化とモデル設定
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/**
 * OpenRouterクライアントを取得
 * @throws {Error} APIキーが設定されていない場合
 */
export function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  return createOpenRouter({
    apiKey,
  });
}

/**
 * 使用するモデル名を取得
 * @returns モデル名（デフォルト: anthropic/claude-sonnet-4.5）
 */
export function getModelName(): string {
  return process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";
}
