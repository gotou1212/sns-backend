# 概要

SNSバックエンドAPIです。

# セットアップ

```bash
npm install
```

# 起動

```bash
node index.js
```

開発時（自動再起動）:

```bash
npm run dev
```

# 環境変数（任意）

- `PORT`: サーバーポート（デフォルト: `3000`）
- `JWT_SECRET`: JWT署名鍵（本番環境では必須）
- `JWT_EXPIRES_IN`: JWTの有効期限（デフォルト: `1h`）

# 認証

`/login` で取得したトークンを `Authorization: Bearer <token>` で指定してください。

投稿の作成・更新・削除は認証が必要です。
