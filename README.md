# TasmaneV2

TasmaneV2は、作業時間を効率的に管理するためのWebアプリケーションです。工数管理、セッション履歴、リアルタイムデータ同期機能を提供します。

## 📋 主な機能

- 📊 **工数管理**: 作業内容と時間を詳細に記録
- 📈 **工数サマリー**: 作業時間の集計と可視化
- 🗂️ **セッション履歴**: 年月別の作業履歴管理
- 🔄 **リアルタイム同期**: Firebase Firestoreによるデータ同期
- 🔐 **二段階認証**: Basic認証 + Firebase認証
- 📱 **レスポンシブデザイン**: モバイル対応UI

## 🛠️ 使用技術

### フロントエンド
- **React** 19.1.0 - UIライブラリ
- **TypeScript** 5.8.3 - 型安全性の確保
- **Vite** 7.0.0 - 高速なビルドツール
- **CSS3** - モダンなスタイリング

### バックエンド・インフラ
- **Firebase Auth** - ユーザー認証（メール/パスワード、Google OAuth）
- **Firebase Firestore** - NoSQLデータベース
- **Firebase Hosting** - 静的サイトホスティング

### 開発ツール
- **Firebase Emulator Suite** - ローカル開発環境
- **Concurrently** - 複数プロセスの並行実行
- **Testing Library** - テストフレームワーク

## 🚀 ローカル環境の構築手順

### 1. 前提条件

以下がインストールされていることを確認してください：
- **Node.js** (v18以上推奨)
- **npm** または **yarn**
- **Firebase CLI**

```bash
# Firebase CLIのインストール
npm install -g firebase-tools
```

### 2. リポジトリのクローン

```bash
git clone https://github.com/your-username/tasmanev2.git
cd tasmanev2
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. Firebase プロジェクトの設定

#### 4.1 Firebaseプロジェクトの作成
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. Authentication と Firestore を有効化

#### 4.2 Firebase設定ファイルの作成
```bash
# Firebase プロジェクトの初期化
firebase init

# 以下を選択：
# - Firestore
# - Hosting
# - Emulators (Auth, Firestore)
```

#### 4.3 環境変数の設定
`.env`ファイルを作成し、Firebase設定を追加：

```bash
# Firebase設定
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Basic認証（オプション）
VITE_BASIC_AUTH_USERNAME=admin
VITE_BASIC_AUTH_PASSWORD=password
```

### 5. 開発サーバーの起動

#### 通常の開発環境
```bash
npm run dev
```

#### Firebase Emulator付きの開発環境（推奨）
```bash
npm run dev:emulator
```

アプリケーションは `http://localhost:5173` で起動します。

### 6. ログイン

#### Basic認証
- **ユーザー名**: `admin`
- **パスワード**: `password`

#### Firebase認証
- メールアドレスとパスワードで新規登録
- または Google アカウントでサインイン

## 🚀 デプロイ手順

### 1. Firebase Hostingへのデプロイ

#### 1.1 プロダクションビルド
```bash
npm run build
```

#### 1.2 Firebase へのデプロイ
```bash
firebase deploy
```

#### 1.3 特定のサービスのみデプロイ
```bash
# Hostingのみ
firebase deploy --only hosting

# Firestoreルールのみ
firebase deploy --only firestore:rules
```

### 2. その他のプラットフォームへのデプロイ

#### Vercel
```bash
# Vercel CLIのインストール
npm install -g vercel

# デプロイ
vercel --prod
```

#### Netlify
```bash
# Netlify CLIのインストール
npm install -g netlify-cli

# ビルド
npm run build

# デプロイ
netlify deploy --prod --dir=dist
```

## 📁 プロジェクト構造

```
tasmanev2/
├── public/                 # 静的ファイル
├── src/
│   ├── components/        # Reactコンポーネント
│   │   ├── BasicAuth.tsx     # Basic認証
│   │   ├── LoginForm.tsx     # Firebase認証
│   │   ├── TimeTrackingSheet.tsx  # メイン工数表
│   │   ├── SessionSidebar.tsx     # セッション履歴
│   │   └── Header.tsx            # ヘッダー
│   ├── hooks/            # カスタムフック
│   │   ├── useAuth.ts       # Firebase認証
│   │   ├── useBasicAuth.ts  # Basic認証
│   │   ├── useTimeTracking.ts    # 工数管理
│   │   └── useFirestore.ts      # Firestore操作
│   ├── firebase/         # Firebase設定
│   ├── types/           # TypeScript型定義
│   ├── utils/           # ユーティリティ関数
│   └── App.tsx          # メインアプリケーション
├── firebase.json        # Firebase設定
├── firestore.rules     # Firestoreセキュリティルール
└── README.md           # このファイル
```

## 🧪 テスト

```bash
# テストの実行
npm test

# カバレッジ付きテスト
npm test -- --coverage
```

## 🔧 開発時のコマンド

```bash
# 開発サーバー起動
npm run dev

# Firebase Emulator + 開発サーバー
npm run dev:emulator

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# Firebase Emulatorのみ起動
npm run emulators
```

## 🔒 セキュリティ

### 認証システム
1. **Basic認証**: アプリケーションへの初回アクセス制御
2. **Firebase認証**: ユーザー管理とデータアクセス制御

### Firestoreセキュリティルール
- ユーザーは自分のデータのみアクセス可能
- 認証されていないユーザーはデータにアクセス不可

## 🤝 コントリビューション

1. フォークしてください
2. フィーチャーブランチを作成してください (`git checkout -b feature/amazing-feature`)
3. 変更をコミットしてください (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュしてください (`git push origin feature/amazing-feature`)
5. プルリクエストを開いてください

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 トラブルシューティング

### よくある問題

#### Firebase Emulatorが起動しない
```bash
# Firebaseプロジェクトの再初期化
firebase logout
firebase login
firebase use --add
```

#### ビルドエラー
```bash
# node_modulesとキャッシュをクリア
rm -rf node_modules package-lock.json
npm install
```

#### 環境変数が読み込まれない
- `.env`ファイルが正しい場所にあるか確認
- 変数名が`VITE_`で始まっているか確認
- 開発サーバーを再起動

## 📞 サポート

問題や質問がある場合は、[Issues](https://github.com/your-username/tasmanev2/issues)を作成してください。