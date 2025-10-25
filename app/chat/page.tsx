"use client";

import { useChat } from "@ai-sdk/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useHabit } from "@/lib/hooks/use-habit";

export default function ChatPage() {
  const { habit, streak, achievementRate } = useHabit();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const { messages, status, sendMessage, error } = useChat();

  // メッセージが更新されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || status !== "ready") return;

    sendMessage({ text: inputValue });
    setInputValue("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ← ホーム
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AIコーチ
            </h1>
            <Link
              href="/calendar"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              📅 カレンダー
            </Link>
          </div>
        </div>
      </header>

      {/* 進捗サマリー（習慣登録済みの場合） */}
      {habit && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  習慣:
                </span>
                <span className="text-blue-900 dark:text-blue-100 font-semibold">
                  {habit.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  ストリーク:
                </span>
                <span className="text-blue-900 dark:text-blue-100 font-semibold">
                  {streak}日
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  達成率:
                </span>
                <span className="text-blue-900 dark:text-blue-100 font-semibold">
                  {achievementRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* チャットメッセージエリア */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                AIコーチと話してみましょう
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                習慣継続のアドバイスや励ましを受けられます
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <p>💡 今日の調子はどうですか？</p>
                <p>💡 習慣を続けるコツを教えてください</p>
                <p>💡 モチベーションが下がっています</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                // メッセージの内容を取得
                const content =
                  message.parts
                    .map((part) => {
                      if (part.type === "text") {
                        return part.text;
                      }
                      return "";
                    })
                    .join("") || "";

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow"
                      }`}
                    >
                      <div className="text-sm font-medium mb-1 opacity-70">
                        {message.role === "user" ? "あなた" : "AIコーチ"}
                      </div>
                      <div className="whitespace-pre-wrap">{content}</div>
                    </div>
                  </div>
                );
              })}
              {status === "streaming" && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-3 bg-white dark:bg-gray-800 shadow">
                    <div className="flex items-center gap-2">
                      <div className="animate-bounce">●</div>
                      <div className="animate-bounce delay-100">●</div>
                      <div className="animate-bounce delay-200">●</div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            <p className="font-medium">エラーが発生しました</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </div>
      )}

      {/* 入力フォーム */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="メッセージを入力..."
              disabled={status !== "ready"}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       disabled:opacity-50 disabled:cursor-not-allowed
                       dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={status !== "ready" || !inputValue.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                       disabled:bg-gray-400 disabled:cursor-not-allowed
                       font-medium transition-colors"
            >
              {status === "streaming" ? "送信中..." : "送信"}
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            AIは間違った情報を提供する可能性があります。重要な決定には専門家に相談してください。
          </p>
        </div>
      </div>
    </div>
  );
}
