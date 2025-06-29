# Firebase設定ガイド

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：time-tracking-app）
4. Googleアナリティクスの設定（任意）
5. プロジェクトを作成

## 2. Firestoreの設定

1. 左サイドバーから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. セキュリティルールで「テストモードで開始」を選択
4. ロケーションを選択（asia-northeast1推奨）
5. 「完了」をクリック

## 3. Webアプリの設定

1. プロジェクト設定（歯車アイコン）を選択
2. 「全般」タブの「マイアプリ」セクションで「ウェブ」アイコンをクリック
3. アプリのニックネームを入力
4. 「Firebase Hostingも設定する」にチェック
5. 「アプリを登録」をクリック
6. 設定オブジェクトをコピー

## 4. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の内容を記載：

```env
# Firebase設定（実際の値に置き換えてください）
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 5. Firestoreルールのデプロイ

```bash
# Firebase CLIをインストール（未インストールの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトを初期化（既に完了済み）
firebase init

# ルールとインデックスをデプロイ
firebase deploy --only firestore
```

## 6. ローカル開発での使用方法

### Firestore Emulatorを使用（推奨）

```bash
# Emulatorと開発サーバーを同時起動
npm run dev:emulator

# または個別に起動
npm run emulators  # Firestore Emulatorのみ起動
npm run dev        # 開発サーバーのみ起動
```

### 本番Firestoreを使用

```bash
# 環境変数を設定
echo "VITE_USE_PRODUCTION_FIREBASE=true" >> .env

# 開発サーバー起動
npm run dev
```

## 7. アプリのビルドとデプロイ

```bash
# アプリをビルド
npm run build

# Firebase Hostingにデプロイ
firebase deploy --only hosting
```

## トラブルシューティング

### 権限エラーが発生する場合

1. Firestoreのセキュリティルールが正しく設定されているか確認
2. `firebase deploy --only firestore` でルールをデプロイ
3. Firebase Consoleでルールが適用されているか確認

### 環境変数が読み込まれない場合

1. `.env`ファイルがプロジェクトルートにあることを確認
2. 環境変数名が`VITE_`で始まっていることを確認
3. 開発サーバーを再起動

### データが保存されない場合

1. Firebase設定が正しいことを確認
2. ブラウザの開発者ツールでエラーを確認
3. Firestore Consoleでデータベースが作成されているか確認