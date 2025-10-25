# Requirements Document

## Introduction

habit100-ai-coachは、ユーザーが習慣を100日間継続するためのWebアプリケーションです。1つの習慣に集中し、毎日の達成状況を記録・可視化します。OpenRouter経由でClaude Sonnet 4.5を活用したAIコーチング機能により、パーソナライズされたサポートを提供し、習慣の定着を支援します。

**ビジネス価値**:
- 習慣形成の成功率を向上させる
- AIによるパーソナライズされたサポートで継続率を高める
- シンプルなUIで誰でも簡単に使える

## Requirements

### Requirement 1: 習慣の登録と管理
**Objective:** ユーザーとして、自分が継続したい習慣を登録・設定できるようにしたい。これにより、明確な目標を持って100日間のチャレンジを開始できる。

#### Acceptance Criteria
1. WHEN ユーザーがアプリに初回アクセスした時 THEN habit100アプリ SHALL 習慣登録フォームを表示する
2. WHEN ユーザーが習慣名を入力して「登録」ボタンをクリックした時 THEN habit100アプリ SHALL 習慣を保存し、ホーム画面に遷移する
3. IF 習慣名が空の状態で登録しようとした場合 THEN habit100アプリ SHALL エラーメッセージを表示し、登録を許可しない
4. WHERE ホーム画面 THE habit100アプリ SHALL 登録された習慣名を表示する
5. WHEN ユーザーが習慣の編集を要求した時 THEN habit100アプリ SHALL 習慣名を変更できる編集画面を表示する

### Requirement 2: 毎日の達成記録
**Objective:** ユーザーとして、その日の習慣の達成/未達成を簡単に記録できるようにしたい。これにより、日々の進捗を正確に追跡できる。

#### Acceptance Criteria
1. WHERE ホーム画面 THE habit100アプリ SHALL 「今日の記録」セクションに達成/未達成ボタンを表示する
2. WHEN ユーザーが「達成」ボタンをクリックした時 THEN habit100アプリ SHALL 当日の記録を達成として保存し、視覚的なフィードバックを表示する
3. WHEN ユーザーが「未達成」ボタンをクリックした時 THEN habit100アプリ SHALL 当日の記録を未達成として保存する
4. IF その日の記録が既に存在する場合 THEN habit100アプリ SHALL 記録の上書き確認ダイアログを表示する
5. WHILE 当日の日付が変わるまで THE habit100アプリ SHALL 記録の変更を許可する
6. WHEN 日付が変わった時 THEN habit100アプリ SHALL 前日の記録を確定し、新しい日の記録入力を受け付ける

### Requirement 3: 進捗の可視化（100日カレンダー）
**Objective:** ユーザーとして、100日間の進捗を一目で把握できるカレンダー表示が欲しい。これにより、モチベーションを維持し、継続の成果を実感できる。

#### Acceptance Criteria
1. WHERE カレンダー画面 THE habit100アプリ SHALL 10×10のグリッド形式で100日分のカレンダーを表示する
2. WHEN 習慣が達成された日の時 THEN habit100アプリ SHALL そのセルを緑色で表示する
3. WHEN 習慣が未達成の日の時 THEN habit100アプリ SHALL そのセルを赤色（または灰色）で表示する
4. WHEN 今日の日付の時 THEN habit100アプリ SHALL そのセルに特別な枠線または強調表示を適用する
5. WHERE カレンダー画面 THE habit100アプリ SHALL 現在のストリーク（連続達成日数）を表示する
6. WHERE カレンダー画面 THE habit100アプリ SHALL 全体の達成率（%）を表示する
7. WHEN ユーザーがカレンダーのセルをクリックした時 THEN habit100アプリ SHALL その日の詳細情報（メモやAIからのアドバイス）を表示する
8. IF まだ到達していない未来の日付の場合 THEN habit100アプリ SHALL そのセルを無効状態で表示する

### Requirement 4: AIコーチング機能
**Objective:** ユーザーとして、AIによるパーソナライズされたアドバイスと励ましを受けたい。これにより、挫折を防ぎ、習慣の継続をサポートしてもらえる。

#### Acceptance Criteria
1. WHERE ホーム画面またはチャット画面 THE habit100アプリ SHALL AIコーチとの会話インターフェースを提供する
2. WHEN ユーザーがメッセージを送信した時 THEN habit100アプリ SHALL OpenRouter経由でClaude Sonnet 4.5にリクエストを送信する
3. WHEN AIからレスポンスを受信した時 THEN habit100アプリ SHALL ストリーミング形式でメッセージを画面に表示する
4. IF ユーザーの進捗データ（達成率、ストリーク、最近の記録）が存在する場合 THEN habit100アプリ SHALL それらのコンテキストをAIに提供する
5. WHEN ユーザーが習慣を達成した時 AND 連続達成日数が7日、30日、50日、100日のマイルストーンに達した時 THEN habit100アプリ SHALL AIからの自動祝福メッセージを表示する
6. WHEN ストリークが途切れた時（未達成が記録された時） THEN habit100アプリ SHALL AIからの励ましと再開のアドバイスを提供する
7. WHEN 3日連続で未達成が記録された時 THEN habit100アプリ SHALL AIによる挫折予防のリマインドとサポートメッセージを表示する
8. WHERE チャット画面 THE habit100アプリ SHALL 過去の会話履歴を表示する

### Requirement 5: データの永続化
**Objective:** ユーザーとして、記録したデータが失われることなく保存され、いつでも参照できるようにしたい。これにより、安心して長期間利用できる。

#### Acceptance Criteria
1. WHEN ユーザーが習慣を登録した時 THEN habit100アプリ SHALL データをLocalStorageに保存する
2. WHEN ユーザーが日々の記録を保存した時 THEN habit100アプリ SHALL 達成状況をLocalStorageに永続化する
3. WHEN ユーザーがアプリを再度開いた時 THEN habit100アプリ SHALL LocalStorageから保存済みデータを読み込み、状態を復元する
4. WHEN AIとの会話履歴が生成された時 THEN habit100アプリ SHALL チャット履歴をLocalStorageに保存する
5. IF LocalStorageの容量制限に達した場合 THEN habit100アプリ SHALL 適切なエラーメッセージを表示する
6. WHERE データストレージ THE habit100アプリ SHALL 将来的にVercel Postgresへの移行を可能にする抽象化レイヤーを持つ

### Requirement 6: ユーザー体験とUI/UX
**Objective:** ユーザーとして、直感的で使いやすいインターフェースで操作したい。これにより、ストレスなく毎日の記録を継続できる。

#### Acceptance Criteria
1. WHERE すべての画面 THE habit100アプリ SHALL レスポンシブデザインを適用し、スマートフォン・タブレット・デスクトップで適切に表示する
2. WHEN ページが読み込まれる時 THEN habit100アプリ SHALL 0.5秒以内に主要コンテンツを表示する
3. WHERE すべてのインタラクション THE habit100アプリ SHALL ユーザーのアクションに対して即座に視覚的フィードバックを提供する
4. IF ネットワークエラーが発生した場合 THEN habit100アプリ SHALL ユーザーフレンドリーなエラーメッセージを表示する
5. WHERE ナビゲーション THE habit100アプリ SHALL ホーム、カレンダー、AIチャットへの明確なナビゲーション手段を提供する
