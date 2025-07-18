import { PrismaClient, PostType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 シードデータの投入を開始します...')

  // 既存データを削除
  await prisma.postTag.deleteMany()
  await prisma.like.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 既存データを削除しました')

  // ユーザーデータの作成
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  const adminUser = await prisma.user.create({
    data: {
      id: 'admin-user-id',
      username: '管理者太郎',
      userId: 'admin_taro',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      isAdmin: true,
      image: null,
    },
  })

  const regularUser = await prisma.user.create({
    data: {
      id: 'regular-user-id',
      username: 'AI愛好家花子',
      userId: 'ai_lover_hanako',
      email: 'user@example.com',
      passwordHash: userPassword,
      isAdmin: false,
      image: null,
    },
  })

  console.log('👥 ユーザーデータを作成しました')

  // タグデータの作成
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'ChatGPT' } }),
    prisma.tag.create({ data: { name: 'Claude' } }),
    prisma.tag.create({ data: { name: 'プロンプトエンジニアリング' } }),
    prisma.tag.create({ data: { name: 'Next.js' } }),
    prisma.tag.create({ data: { name: 'TypeScript' } }),
    prisma.tag.create({ data: { name: 'AI活用' } }),
    prisma.tag.create({ data: { name: '生産性向上' } }),
    prisma.tag.create({ data: { name: 'コード生成' } }),
    prisma.tag.create({ data: { name: '文章作成' } }),
    prisma.tag.create({ data: { name: 'デバッグ' } }),
  ])

  console.log('🏷️ タグデータを作成しました')

  // 管理者の投稿データ
  const adminPosts = [
    // 記事投稿
    {
      type: PostType.article,
      title: 'Next.js 15でのAI活用開発ガイド',
      content: `# Next.js 15でのAI活用開発ガイド

最新のNext.js 15を使って、AI機能を組み込んだWebアプリケーションを開発する方法について解説します。

## 主な特徴

- **App Router**: 新しいルーティングシステム
- **Server Components**: サーバーサイドレンダリングの最適化
- **Turbopack**: 高速なバンドラー

## AI統合のベストプラクティス

### 1. OpenAI APIの統合

\`\`\`typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateText(prompt: string) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4',
  })
  
  return completion.choices[0].message.content
}
\`\`\`

### 2. ストリーミングレスポンス

リアルタイムでAIの応答を表示する実装例：

\`\`\`typescript
export async function streamResponse(prompt: string) {
  const stream = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4',
    stream: true,
  })

  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || ''
  }
}
\`\`\`

## まとめ

Next.js 15とAIを組み合わせることで、より動的で知的なWebアプリケーションを構築できます。`,
      description: null,
      platform: null,
      link: null,
      userId: adminUser.id,
      tagIds: [tags[3].id, tags[4].id, tags[5].id], // Next.js, TypeScript, AI活用
    },

    // プロンプト投稿
    {
      type: PostType.prompt,
      title: 'コードレビュー最適化プロンプト',
      content: `あなたは経験豊富なシニアエンジニアです。以下のコードをレビューして、改善点を具体的に指摘してください。

## レビュー観点
1. **パフォーマンス**: 処理速度やメモリ使用量の最適化
2. **可読性**: コードの理解しやすさ、命名規則
3. **保守性**: 将来の変更に対する柔軟性
4. **セキュリティ**: 潜在的な脆弱性
5. **ベストプラクティス**: 言語/フレームワーク固有の推奨事項

## 出力形式
- 問題箇所を具体的に引用
- 改善理由を明確に説明
- 修正後のコード例を提示
- 優先度（高/中/低）を明記

[ここにレビューしたいコードを貼り付け]`,
      description: 'ChatGPTやClaudeでコードレビューを依頼する際に使える包括的なプロンプトです。シニアエンジニアの視点で詳細なフィードバックが得られます。',
      platform: null,
      link: null,
      userId: adminUser.id,
      tagIds: [tags[0].id, tags[2].id, tags[7].id, tags[9].id], // ChatGPT, プロンプトエンジニアリング, コード生成, デバッグ
    },

    // 会話投稿
    {
      type: PostType.conversation,
      title: 'Docker環境での Next.js 開発環境構築',
      content: null,
      description: 'Next.jsアプリケーションをDocker化する際の設定方法について、Claude と詳しく議論しました。マルチステージビルドやdevcontainerの活用法など実践的な内容です。',
      platform: 'Claude',
      link: 'https://claude.ai/chat/example-conversation-1',
      userId: adminUser.id,
      tagIds: [tags[1].id, tags[3].id, tags[6].id], // Claude, Next.js, 生産性向上
    },
  ]

  // 一般ユーザーの投稿データ
  const userPosts = [
    // 記事投稿
    {
      type: PostType.article,
      title: 'AI を活用した日常業務の効率化テクニック',
      content: `# AI を活用した日常業務の効率化テクニック

日々の業務でChatGPTやClaudeなどのAIツールを活用して、生産性を向上させる方法をご紹介します。

## 文書作成の自動化

### メール作成
基本的なビジネスメールなら、以下のようなプロンプトで効率化できます：

\`\`\`
件名：[具体的な件名]
相手：[相手の立場・関係性]
目的：[メールの目的]
内容：[伝えたい要点]

上記の情報を元に、適切なビジネスメールを作成してください。
\`\`\`

### 議事録の整理
会議の音声録音をテキスト化した後、AIに以下を依頼：

1. 重要なポイントの抽出
2. アクションアイテムの整理  
3. 次回までのタスクの明確化

## データ分析の支援

### Excel/スプレッドシートの活用
- 複雑な関数の作成
- グラフの最適な表現方法の提案
- データクリーニングの手法

## まとめ

AIを「完全に任せる」のではなく、「協働パートナー」として活用することで、より質の高い成果物を効率的に作成できます。`,
      description: null,
      platform: null,
      link: null,
      userId: regularUser.id,
      tagIds: [tags[0].id, tags[5].id, tags[6].id, tags[8].id], // ChatGPT, AI活用, 生産性向上, 文章作成
    },

    // プロンプト投稿
    {
      type: PostType.prompt,
      title: '技術記事の構成作成プロンプト',
      content: `以下のテーマで技術記事を書くための詳細な構成を作成してください。

テーマ: [記事のテーマを入力]
対象読者: [初心者/中級者/上級者 から選択]
記事の長さ: [短編/中編/長編 から選択]

## 出力してほしい内容
1. **魅力的なタイトル案** (3つ)
2. **記事の概要** (2-3行)
3. **詳細な見出し構成** (h2, h3レベルまで)
4. **各セクションで扱う内容** (箇条書き)
5. **コード例が必要な箇所**
6. **参考になるリソース**
7. **想定文字数**

記事を読んだ読者が具体的に行動を起こせるような実践的な構成にしてください。`,
      description: 'Qiitaやブログで技術記事を書く際の構成を考えてもらうプロンプトです。対象読者に応じて適切な構成を提案してくれます。',
      platform: null,
      link: null,
      userId: regularUser.id,
      tagIds: [tags[2].id, tags[8].id], // プロンプトエンジニアリング, 文章作成
    },

    // 会話投稿
    {
      type: PostType.conversation,
      title: 'TypeScript の型安全性向上について',
      content: null,
      description: 'TypeScriptでより型安全なコードを書くためのテクニックについて ChatGPT と議論しました。Generics や Union Types の活用法、型ガードの実装方法など深い内容です。',
      platform: 'ChatGPT',
      link: 'https://chat.openai.com/share/example-conversation-2',
      userId: regularUser.id,
      tagIds: [tags[0].id, tags[4].id, tags[7].id], // ChatGPT, TypeScript, コード生成
    },

    // 追加のプロンプト投稿
    {
      type: PostType.prompt,
      title: 'バグ調査・デバッグ支援プロンプト',
      content: `以下のエラー・問題について詳しく調査し、解決策を提案してください。

## 問題の詳細
- **エラーメッセージ**: [エラーメッセージを貼り付け]
- **発生環境**: [OS, ブラウザ, バージョン等]
- **再現手順**: [問題が発生する具体的な手順]
- **期待する動作**: [本来どうなるべきか]
- **関連コード**: [問題箇所のコードを貼り付け]

## 調査してほしい内容
1. **根本原因の特定**
2. **具体的な修正方法**
3. **コード例の提示**
4. **同様の問題の予防策**
5. **参考資料・ドキュメント**

技術的な背景も含めて詳しく説明してください。`,
      description: 'プログラミングでエラーが発生した際に、AIに効果的にデバッグ支援を依頼するためのプロンプトテンプレートです。',
      platform: null,
      link: null,
      userId: regularUser.id,
      tagIds: [tags[9].id, tags[2].id], // デバッグ, プロンプトエンジニアリング
    },
  ]

  // 投稿データの作成
  console.log('📝 投稿データを作成中...')
  
  for (const postData of [...adminPosts, ...userPosts]) {
    const { tagIds, ...postFields } = postData
    
    const post = await prisma.post.create({
      data: postFields,
    })

    // タグを関連付け
    if (tagIds && tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map(tagId => ({
          postId: post.id,
          tagId: tagId,
        })),
      })
    }
  }

  console.log('📝 投稿データを作成しました')

  // いいねとお気に入りデータの作成
  const posts = await prisma.post.findMany()
  
  // 管理者が一般ユーザーの投稿にいいね
  const userPostIds = posts.filter(p => p.userId === regularUser.id).map(p => p.id)
  for (const postId of userPostIds.slice(0, 2)) {
    await prisma.like.create({
      data: {
        userId: adminUser.id,
        postId: postId,
      },
    })
  }

  // 一般ユーザーが管理者の投稿にいいねとお気に入り
  const adminPostIds = posts.filter(p => p.userId === adminUser.id).map(p => p.id)
  for (const postId of adminPostIds) {
    await prisma.like.create({
      data: {
        userId: regularUser.id,
        postId: postId,
      },
    })
    
    // 最初の投稿をお気に入りに追加
    if (postId === adminPostIds[0]) {
      await prisma.favorite.create({
        data: {
          userId: regularUser.id,
          postId: postId,
        },
      })
    }
  }

  // フォロー関係の作成
  await prisma.follow.create({
    data: {
      followerId: regularUser.id,
      followedId: adminUser.id,
    },
  })

  console.log('👍 いいね・お気に入り・フォローデータを作成しました')

  console.log('🎉 シードデータの投入が完了しました！')
  console.log('\n📊 作成されたデータ:')
  console.log(`   👥 ユーザー: 2人`)
  console.log(`   🏷️ タグ: ${tags.length}個`)
  console.log(`   📝 投稿: ${adminPosts.length + userPosts.length}件`)
  console.log(`   👍 いいね: 複数`)
  console.log(`   ⭐ お気に入り: 1件`)
  console.log(`   👥 フォロー: 1件`)
  console.log('\n🔑 ログイン情報:')
  console.log('   管理者: admin@example.com / admin123')
  console.log('   一般ユーザー: user@example.com / user123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })