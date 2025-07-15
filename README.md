# omu - 生成AI情報共有プラットフォーム

omuは生成AIのプロンプト、記事、会話履歴を共有するQiita風のWebアプリケーションです。

## 主な機能

- **記事投稿**: Markdownで記事を投稿・共有
- **プロンプト共有**: 生成AIで使用するプロンプトを共有
- **会話共有**: ChatGPT、Claude、Geminiなどとの会話を共有
- **検索・フィルター**: キーワードやタグでの検索機能
- **いいね・お気に入り**: 投稿への評価とブックマーク機能
- **フォロー**: ユーザー間のフォロー機能
- **管理者機能**: ユーザー・投稿の管理

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL with Prisma
- **認証**: NextAuth.js (Google, GitHub, メール認証)
- **デプロイ**: Vercel

## セットアップ

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/Ben-1327/omu.git
   cd omu
   ```

2. **依存関係のインストール**
   ```bash
   cd omu-app
   npm install
   ```

3. **環境変数の設定**
   ```bash
   cp .env.example .env
   ```
   
   `.env`ファイルを編集して以下を設定：
   - `DATABASE_URL`: PostgreSQLデータベースのURL
   - `NEXTAUTH_SECRET`: NextAuth.jsの秘密鍵
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth設定
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: GitHub OAuth設定

4. **データベースのセットアップ**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## 投稿タイプ

### 記事 (Article)
- Markdownで記述
- 技術記事、チュートリアル、解説など

### プロンプト (Prompt)
- 生成AIで使用するプロンプトを共有
- 使用例やコツなども記載可能

### 会話 (Conversation)
- ChatGPT、Claude、Geminiなどとの会話を共有
- プラットフォーム選択機能付き

## 開発・デプロイ

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# 本番サーバー
npm start

# リント
npm run lint
```

## ライセンス

MIT License
