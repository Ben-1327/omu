# Omu - 生成AI情報共有プラットフォーム

生成AIのプロンプト、記事、会話履歴を共有するQiita風のWebアプリケーションです。

## 技術スタック

- **Frontend**: Next.js 15.4.1 (App Router), React 19, TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **認証**: NextAuth.js
- **スタイリング**: Tailwind CSS
- **コンテナ**: Docker & Docker Compose

## 開発環境のセットアップ

### 方法1: Dockerを使用する（推奨）

#### 前提条件
- Docker Desktop がインストールされていること
- Docker Compose が使用可能であること

#### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd omu
```

#### 2. 環境変数の設定

```bash
# Docker用の環境変数ファイルをコピー
cp .env.docker .env
```

#### 3. Dockerコンテナを起動

```bash
# 開発環境として起動（ホットリロード対応）
docker-compose -f docker-compose.dev.yml up -d

# または本番形式として起動
docker-compose up -d
```

#### 4. データベースのマイグレーション

```bash
# アプリケーションコンテナ内でマイグレーション実行
docker-compose exec app npx prisma migrate dev
```

#### 5. アプリケーションにアクセス

[http://localhost:3000](http://localhost:3000) にアクセスしてください。

#### Docker関連のコマンド

```bash
# 開発環境の起動
docker-compose -f docker-compose.dev.yml up -d

# 本番環境の起動
docker-compose -f docker-compose.prod.yml up -d

# ログの確認
docker-compose logs -f

# コンテナの停止
docker-compose down

# データベースを含む完全削除
docker-compose down -v
```

### 方法2: ローカル環境で直接実行

#### 前提条件
- Node.js 20以上
- PostgreSQL

#### 1. 依存関係のインストール

```bash
npm install
```

#### 2. 環境変数の設定

```bash
cp .env.example .env
# .envファイルを編集して適切な値を設定
```

#### 3. データベースのセットアップ

```bash
npx prisma migrate dev
npx prisma generate
```

#### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセスしてください。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
