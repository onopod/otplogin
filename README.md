# OTP Login - SMS認証システム

Next.jsで構築された電話番号認証（SMS OTP）システムです。

## 機能

- **電話番号認証**: SMS OTPを使用した本人確認
- **4段階の登録フロー**:
  1. RegisterPage - 電話番号入力
  2. OtpPage - SMS認証コード入力
  3. UserInfoPage - ユーザー情報入力
  4. CompletePage - 登録完了

## 使用方法

### 開発環境

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（バックエンド:3001 + フロントエンド:3000）
npm run dev
```

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

### プロダクション

```bash
# Next.jsビルド
npm run build

# バックエンドサーバー起動
npm start
```

### テスト

```bash
npm test
```

## API エンドポイント

- `POST /api/send-otp` - SMS OTP送信
- `POST /api/verify-otp` - OTP認証
- `POST /api/register` - ユーザー登録

詳細な仕様は `AGENTS.md` を参照してください。

## 技術スタック

- **フロントエンド**: Next.js, React
- **バックエンド**: Node.js (HTTP サーバー)
- **開発**: concurrently (同時実行)