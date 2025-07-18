# ベースイメージ（Node.js 20のAlpine版）
FROM node:20-alpine AS base

# 依存関係のインストール段階
FROM base AS deps
# Alpineのパッケージマネージャー用の依存関係を追加
RUN apk add --no-cache libc6-compat
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./
# 依存関係をインストール
RUN npm ci --only=production

# ビルド段階
FROM base AS builder
WORKDIR /app
# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
# ソースコードをコピー
COPY . .

# Next.jsのテレメトリを無効化
ENV NEXT_TELEMETRY_DISABLED 1

# アプリケーションをビルド
RUN npm run build

# 実行段階
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# システムユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# public フォルダをコピー
COPY --from=builder /app/public ./public

# standalonモードのファイルをコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prismaのスキーマとクライアントをコピー
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# サーバー起動
CMD ["node", "server.js"]