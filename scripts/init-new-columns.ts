import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initNewColumns() {
  console.log('既存データの初期化を開始します...')

  try {
    // 1. 既存ユーザーのroleを is_admin に基づいて設定
    const adminUsers = await prisma.user.updateMany({
      where: { isAdmin: true },
      data: { role: 'admin' }
    })
    console.log(`${adminUsers.count} 人の管理者ユーザーのroleを更新しました`)

    // 2. 既存投稿のlike_countを likes テーブルから計算して設定
    const posts = await prisma.post.findMany({
      include: {
        _count: {
          select: { likes: true }
        }
      }
    })

    for (const post of posts) {
      await prisma.post.update({
        where: { id: post.id },
        data: { likeCount: post._count.likes }
      })
    }
    console.log(`${posts.length} 件の投稿のlike_countを更新しました`)

    // 3. 既存投稿のvisibilityの確認（デフォルト値で 'public' が設定されているはず）
    const allPosts = await prisma.post.count()
    const publicPosts = await prisma.post.count({
      where: { visibility: 'public' }
    })
    console.log(`全投稿数: ${allPosts}, public投稿数: ${publicPosts}`)

    console.log('既存データの初期化が完了しました！')
  } catch (error) {
    console.error('エラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initNewColumns()