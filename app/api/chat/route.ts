/**
 * Chat API Route
 * AIコーチング機能のAPIエンドポイント
 */

import { convertToCoreMessages, streamText } from "ai";
import { getModelName, getOpenRouterClient } from "@/lib/openrouter/config";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    // リクエストボディの取得
    const { messages } = await request.json();

    // OpenRouterクライアントの初期化
    const openrouter = getOpenRouterClient();
    const modelName = getModelName();

    // システムメッセージの構築
    const systemMessageContent = `あなたは習慣形成をサポートするAIコーチです。
ユーザーの習慣継続を励まし、パーソナライズされたアドバイスを提供してください。

応答は日本語で、親しみやすく、前向きなトーンで行ってください。`;

    const systemMessage = {
      role: "system" as const,
      content: systemMessageContent,
    };

    // メッセージをCoreMessage形式に変換
    const coreMessages = convertToCoreMessages(messages);
    const allMessages = [systemMessage, ...coreMessages];

    // ストリーミングレスポンス生成
    const result = streamText({
      model: openrouter(modelName),
      messages: allMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return Response.json(
      {
        error: {
          type: "api_error",
          message: errorMessage,
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 },
    );
  }
}
