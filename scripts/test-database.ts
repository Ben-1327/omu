import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabase() {
  console.log('📊 データベース接続テストを開始します...')
  
  try {
    // ユーザー数を確認
    const userCount = await prisma.user.count()
    console.log(`👥 ユーザー数: ${userCount}`)
    
    // 投稿数を確認
    const postCount = await prisma.post.count()
    console.log(`📝 投稿数: ${postCount}`)
    
    // タグ数を確認
    const tagCount = await prisma.tag.count()
    console.log(`🏷️ タグ数: ${tagCount}`)
    
    // 新しいカラムのデータを確認
    console.log('\n🔍 新しいカラムの確認:')
    
    // ユーザーのプロフィール情報
    const users = await prisma.user.findMany({
      select: {
        username: true,
        role: true,
        adFree: true,
        bio: true,
        website: true,
        xLink: true,
      }
    })
    
    users.forEach(user => {
      console.log(`👤 ${user.username}:`)
      console.log(`   - Role: ${user.role}`)
      console.log(`   - Ad Free: ${user.adFree}`)
      console.log(`   - Bio: ${user.bio?.substring(0, 50)}...`)
      console.log(`   - Website: ${user.website}`)
      console.log(`   - X Link: ${user.xLink}`)
      console.log('')
    })
    
    // 投稿のビュー数・いいね数・可視性を確認
    const posts = await prisma.post.findMany({
      select: {
        title: true,
        viewCount: true,
        likeCount: true,
        visibility: true,
        user: {
          select: {
            username: true
          }
        }
      }
    })
    
    console.log('📊 投稿データ:')
    posts.forEach(post => {
      console.log(`📝 ${post.title}`)
      console.log(`   - 投稿者: ${post.user.username}`)
      console.log(`   - ビュー数: ${post.viewCount}`)
      console.log(`   - いいね数: ${post.likeCount}`)
      console.log(`   - 可視性: ${post.visibility}`)
      console.log('')
    })
    
    console.log('✅ データベース接続テストが完了しました！')
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()