# HelpSync Server

このプロジェクトは、近隣の助け合いをリアルタイムで実現するアプリケーション「HelpSync」のバックエンドサーバーです。Firebase (Cloud Functions, Firestore) 上に構築されており、ドメイン駆動設計（DDD）のアプローチを採用しています。

## アーキテクチャ

- **サーバーレス**: Firebase Cloud Functions を利用し、スケーラブルなサーバーレスアーキテクチャを実現しています。
- **データベース**: Firestoreをデータストアとして使用しています。
- **リアルタイム通知**: Firebase Cloud Messaging (FCM) を通じて、ユーザーのデバイスにプッシュ通知を送信します。
- **非同期処理**: Cloud Tasksを利用して、時間のかかる処理やスケジュールされたタスク（例：タイムアウト処理）を非同期で実行します。

## 主な機能 (Cloud Functions)

クライアントからのリクエストに応じて、以下の機能を提供します。

| 関数名                                | トリガー   | 認証 | 説明                                                                                                                   |
| :------------------------------------ | :--------- | :--- | :--------------------------------------------------------------------------------------------------------------------- |
| `createHelpRequest`                   | Callable   | 必要 | **ヘルプ要請の作成**: ユーザーが助けを求めると、その位置情報に基づき、近くにいる他のユーザーに助けを求める通知を送信します。 |
| `handleProximityVerificationResult`   | Callable   | 必要 | **近接確認への応答**: ヘルプ要請の通知を受け取ったユーザーが「助ける」または「今は無理」と応答した結果を処理します。         |
| `onProximityVerificationTimeout`      | HTTPS      | -    | **タイムアウト処理**: ヘルプ要請後、一定時間応答がなかった場合に、要請者にその旨を通知するための内部的な処理です。（Cloud Tasksから呼び出されます） |
| `completeHelpRequest`                 | Callable   | 必要 | **ヘルプ要請の完了**: 助け合いが完了したことをシステムに通知し、要請をクローズします。                                     |
| `updateDeviceLocation`                | Callable   | 必要 | **位置情報の更新**: ユーザーのデバイスの現在地を定期的に更新します。                                                     |
| `renewDeviceToken`                    | Callable   | 必要 | **デバイストークンの更新**: プッシュ通知に必要なFCMトークンを更新します。                                                 |
| `registerNewDevice`                 | Callable   | 必要 | **新規デバイスの登録**: 新しいデバイスをユーザーに紐付けてシステムに登録します。                                         |
| `deleteDevice`                      | Callable   | 必要 | **デバイスの削除**: 登録されているデバイスをユーザーのアカウントから削除します。                                           |

## 技術スタック

- **バックエンド**: Node.js, TypeScript, Firebase Cloud Functions
- **データベース**: Firestore
- **その他Firebaseサービス**: Cloud Tasks, Firebase Cloud Messaging (FCM)
- **テスト**: Jest, ts-jest
- **設計**: ドメイン駆動設計 (DDD)

## セットアップとデプロイ

### 必要なもの
- Node.js
- Firebase CLI

### 手順
1. **依存関係のインストール:**
   ```bash
   # プロジェクトルート
   npm install
   # functionsディレクトリ
   cd functions
   npm install
   ```

2. **ビルド:**
   `functions`ディレクトリで以下のコマンドを実行します。
   ```bash
   npm run build
   ```

3. **テスト:**
   `functions`ディレクトリで以下のコマンドを実行します。
   ```bash
   npm run test
   ```

4. **デプロイ:**
   プロジェクトのルートディレクトリでFirebaseにログインし、デプロイを実行します。
   ```bash
   firebase login
   firebase deploy
   ```
