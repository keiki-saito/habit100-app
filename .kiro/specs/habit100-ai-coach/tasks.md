# Implementation Plan: habit100-ai-coach

## 実装タスク概要

このドキュメントは、habit100-ai-coachの実装タスクを定義します。各タスクは設計ドキュメント（design.md）と要件ドキュメント（requirements.md）に基づいており、順次的に実行されます。

---

## Phase 1: 基盤とデータ層

- [ ] 1. プロジェクトの型定義とデータモデルを作成
- [ ] 1.1 ドメインモデルの型定義を作成
  - Habitモデルの型定義（id、name、startDate、createdAt、updatedAt）
  - DailyRecordモデルの型定義（id、habitId、date、achieved、note、createdAt、updatedAt）
  - ChatMessage型定義（id、role、content、timestamp）
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 4.2_

- [ ] 1.2 入力・出力の型定義を作成
  - CreateHabitInput型（name、startDate）
  - UpdateHabitInput型（id、name）
  - RecordDayInput型（date、achieved、note）
  - _Requirements: 1.2, 2.2_

- [ ] 1.3 エラー型とユーティリティ型を定義
  - AppError、ValidationError、StorageQuotaExceededError、DuplicateHabitError
  - ErrorResponse型定義
  - _Requirements: すべてのエラーハンドリング要件_

- [ ] 2. データ永続化レイヤーを実装
- [ ] 2.1 ストレージアダプターのインターフェースと実装を作成
  - IStorageAdapterインターフェース定義（getItem、setItem、removeItem、clear）
  - LocalStorageAdapterクラス実装
  - JSONのシリアライズ・デシリアライズ処理
  - エラーハンドリング（容量超過、パースエラー）
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2.2 HabitRepositoryインターフェースと実装を作成
  - HabitRepositoryインターフェース定義（getHabit、createHabit、updateHabit、getDailyRecords、recordDay、clear）
  - LocalStorageHabitRepository実装
  - 習慣データの検証ロジック（重複チェック、バリデーション）
  - 日次記録の検証ロジック（日付範囲、重複チェック）
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 5.1, 5.2_

- [ ] 3. ユーティリティ関数を実装
- [ ] 3.1 ストリーク計算ロジックを実装
  - calculateStreak関数（DailyRecord[]を受け取り、連続達成日数を返す）
  - エッジケース処理（空配列、途中で途切れる場合）
  - _Requirements: 3.5_

- [ ] 3.2 達成率計算ロジックを実装
  - calculateAchievementRate関数（DailyRecord[]と開始日を受け取り、達成率%を返す）
  - エッジケース処理（空配列、開始日からの経過日数計算）
  - _Requirements: 3.6_

- [ ] 3.3 日付ユーティリティ関数を実装
  - isSameDay関数（2つのDateが同じ日か判定）
  - getDaysSince関数（開始日からの経過日数計算）
  - isToday関数（今日の日付か判定）
  - _Requirements: 2.6, 3.4_

---

## Phase 2: ホーム画面と習慣管理

- [ ] 4. 習慣データ管理のカスタムフックを実装
- [ ] 4.1 useHabitフックを実装
  - HabitRepositoryからデータ取得
  - 習慣の作成・更新機能
  - 日次記録の保存機能
  - ストリークと達成率の計算
  - ローディング状態とエラー状態の管理
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.5, 3.6_

- [ ] 5. ホーム画面のUI Components を実装
- [ ] 5.1 習慣登録フォームコンポーネントを作成
  - 習慣名入力フィールド
  - バリデーション（空文字、文字数制限）
  - 送信ボタンとローディング状態
  - エラー表示UI
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5.2 今日の記録コンポーネントを作成
  - 達成/未達成ボタン
  - 記録済み状態の表示
  - 上書き確認ダイアログ
  - 視覚的フィードバック（アニメーション、色変更）
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5.3 進捗サマリーコンポーネントを作成
  - 現在のストリーク表示
  - 全体の達成率表示
  - 習慣名と開始日の表示
  - _Requirements: 3.5, 3.6, 1.4_

- [ ] 5.4 ホームページを統合
  - 習慣登録フォームと記録コンポーネントの条件付き表示
  - useHabitフックとの連携
  - ナビゲーション（カレンダー、チャットへのリンク）
  - レスポンシブレイアウト
  - _Requirements: 1.1, 2.1, 6.1, 6.5_

---

## Phase 3: カレンダー機能

- [ ] 6. カレンダーUIコンポーネントを実装
- [ ] 6.1 CalendarGridコンポーネントを作成
  - 10×10グリッドのレンダリング（100セル）
  - 各セルの状態判定ロジック（達成、未達成、未到達、今日）
  - セルの色分け（緑=達成、赤=未達成、灰色=未到達、青枠=今日）
  - セルのクリックハンドラー
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.8_

- [ ] 6.2 セル詳細表示モーダルを作成
  - モーダルコンポーネント
  - 選択された日付の詳細表示（日付、達成状況、メモ）
  - モーダルの開閉状態管理
  - _Requirements: 3.7_

- [ ] 6.3 カレンダーページを統合
  - CalendarGridコンポーネントの配置
  - useHabitフックからデータ取得
  - ストリークと達成率の表示
  - レスポンシブレイアウト
  - _Requirements: 3.1, 3.5, 3.6, 6.1_

---

## Phase 4: AIコーチング機能

- [ ] 7. チャットAPIエンドポイントを実装
- [ ] 7.1 OpenRouter初期化ロジックを作成
  - 環境変数からAPIキーとモデル名を取得
  - createOpenRouter関数でクライアント初期化
  - エラーハンドリング（APIキー未設定）
  - _Requirements: 4.2_

- [ ] 7.2 システムメッセージ生成ロジックを実装
  - buildSystemMessage関数（進捗データを含むシステムメッセージを生成）
  - HabitRepositoryから現在の進捗データ取得
  - ストリーク、達成率、最近の記録をメッセージに含める
  - 習慣未登録時のデフォルトメッセージ
  - _Requirements: 4.4, 4.5_

- [ ] 7.3 /api/chatルートハンドラを実装
  - POSTリクエストの処理
  - リクエストボディのバリデーション（messages配列の検証）
  - システムメッセージの注入
  - streamText関数でストリーミングレスポンス生成
  - エラーハンドリングとエラーレスポンス
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 8. チャット画面のUIを実装
- [ ] 8.1 チャットメッセージ表示コンポーネントを作成
  - メッセージリストの表示
  - ユーザーメッセージとAIメッセージの区別
  - ストリーミング中のメッセージ表示
  - タイムスタンプ表示
  - _Requirements: 4.3, 4.8_

- [ ] 8.2 チャット入力コンポーネントを作成
  - テキスト入力フィールド
  - 送信ボタン
  - 送信中の状態表示
  - Enter キーで送信
  - _Requirements: 4.2_

- [ ] 8.3 チャットページを統合
  - useChat フックの初期化と連携
  - メッセージ送信処理
  - ストリーミング状態の管理（status: "ready" | "submitted" | "streaming" | "error"）
  - エラー表示とリトライボタン
  - レスポンシブレイアウト
  - _Requirements: 4.1, 4.2, 4.3, 6.1_

- [ ] 9. AIコーチングの自動メッセージ機能を実装
- [ ] 9.1 マイルストーン検出と祝福メッセージを実装
  - マイルストーン判定ロジック（7日、30日、50日、100日）
  - 自動祝福メッセージのトリガー
  - _Requirements: 4.5_

- [ ] 9.2 挫折予防メッセージを実装
  - ストリーク途切れ検出
  - 3日連続未達成の検出
  - 自動リマインドメッセージのトリガー
  - _Requirements: 4.6, 4.7_

---

## Phase 5: UI/UXとエラーハンドリング

- [ ] 10. グローバルUIコンポーネントを実装
- [ ] 10.1 トースト通知コンポーネントを作成
  - 成功、エラー、情報のトースト表示
  - 自動非表示タイマー
  - 複数トーストのキュー管理
  - _Requirements: 6.3_

- [ ] 10.2 モーダルダイアログコンポーネントを作成
  - 確認ダイアログ
  - エラーダイアログ
  - オーバーレイとクローズ処理
  - _Requirements: 2.4, 6.3_

- [ ] 10.3 ローディングインディケーターを作成
  - スピナーコンポーネント
  - ページローディング表示
  - ボタンローディング状態
  - _Requirements: 6.2, 6.3_

- [ ] 11. エラーハンドリングシステムを実装
- [ ] 11.1 エラー処理ユーティリティを作成
  - handleError関数（エラーメッセージとアクションを返す）
  - logError関数（エラーロギング）
  - _Requirements: すべてのエラーハンドリング要件_

- [ ] 11.2 エラーバウンダリーコンポーネントを作成
  - React Error Boundaryの実装
  - エラーページの表示
  - エラーリカバリー処理
  - _Requirements: 6.4_

- [ ] 12. レスポンシブデザインを実装
- [ ] 12.1 グローバルスタイルを調整
  - Tailwind CSSのブレークポイント設定
  - モバイルファーストデザイン
  - _Requirements: 6.1_

- [ ] 12.2 ナビゲーションコンポーネントを作成
  - ヘッダーまたはタブナビゲーション
  - ホーム、カレンダー、チャットへのリンク
  - モバイルメニュー
  - _Requirements: 6.5_

---

## Phase 6: テストとドキュメント

- [ ] 13. ユニットテストを実装
- [ ] 13.1 HabitRepositoryのテストを作成
  - getHabit、createHabit、updateHabit、getDailyRecords、recordDayのテスト
  - エッジケース（重複習慣、容量超過、無効な日付）のテスト
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 5.5_

- [ ] 13.2 ユーティリティ関数のテストを作成
  - calculateStreak、calculateAchievementRate、日付関数のテスト
  - エッジケース（空配列、境界値）のテスト
  - _Requirements: 3.5, 3.6_

- [ ] 13.3 システムメッセージ生成のテストを作成
  - buildSystemMessage関数のテスト
  - 進捗データの正しい注入を確認
  - _Requirements: 4.4_

- [ ] 14. 統合テストを実装
- [ ] 14.1 習慣登録フローのテストを作成
  - HomePage → HabitRepository → LocalStorageの一連の流れ
  - バリデーションエラーのテスト
  - _Requirements: 1.1, 1.2_

- [ ] 14.2 日次記録フローのテストを作成
  - 記録ボタンクリック → 保存 → UI更新の流れ
  - 上書き確認のテスト
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 14.3 カレンダー表示フローのテストを作成
  - CalendarPage → HabitRepository → CalendarGridの流れ
  - セルの色分けが正しいことを確認
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 14.4 AIチャットフローのテストを作成
  - ChatPage → /api/chat → OpenRouterの流れ
  - システムメッセージの注入を確認
  - モックを使用してOpenRouter APIをスタブ化
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 15. E2Eテストを実装
- [ ] 15.1 初回訪問から習慣登録までのE2Eテストを作成
  - ブラウザ起動 → 登録フォーム表示 → 習慣登録 → ホーム画面遷移
  - _Requirements: 1.1, 1.2_

- [ ] 15.2 日次記録のE2Eテストを作成
  - ホーム画面で「達成」ボタンクリック → 視覚的フィードバック確認
  - _Requirements: 2.1, 2.2_

- [ ] 15.3 カレンダー表示のE2Eテストを作成
  - カレンダーページ表示 → セルクリック → 詳細モーダル表示
  - _Requirements: 3.1, 3.7_

- [ ] 15.4 AIチャットのE2Eテストを作成
  - チャットページ → メッセージ送信 → AIレスポンス受信
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 16. 環境設定とドキュメントを作成
- [ ] 16.1 .env.local.exampleを作成
  - OPENROUTER_API_KEY、OPENROUTER_MODELの環境変数定義
  - コメントで説明を追加
  - _Requirements: 4.2_

- [ ] 16.2 プロジェクトREADMEを更新（オプション）
  - habit100-ai-coachの概要
  - セットアップ手順
  - 使用方法
  - _Requirements: なし（ドキュメント）_

---

## タスク実装の原則

1. **順次実行**: タスクは番号順に実行してください。後のタスクは前のタスクの出力に依存します。
2. **テスト駆動**: 可能な限り、実装前にテストを書いてください。
3. **コミット頻度**: 各主要タスク（1, 2, 3...）完了時にコミットを作成してください。
4. **設計準拠**: すべての実装は design.md の設計に従ってください。
5. **要件追跡**: 各タスクは対応する要件番号を参照しています。実装時に要件を確認してください。

---

**Generated**: 2025-10-25T01:35:10Z
**Status**: Ready for implementation
