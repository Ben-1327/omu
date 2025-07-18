import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://omurice.tech'
  
  // 静的ページ（必ず含まれる）
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
  
  try {
    console.log('🔄 sitemap.xml: データベース接続を試行中...')
    
    // 動的ページ - 投稿（エラーハンドリング付き）
    const posts = await prisma.post.findMany({
      where: {
        visibility: 'public'
      },
      select: {
        id: true,
        updatedAt: true
      },
      take: 1000 // 最大1000投稿に制限
    })
    
    const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/posts/${post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
    
    // 動的ページ - ユーザー（エラーハンドリング付き）
    const users = await prisma.user.findMany({
      select: {
        id: true,
        updatedAt: true
      },
      take: 500 // 最大500ユーザーに制限
    })
    
    const userPages: MetadataRoute.Sitemap = users.map((user) => ({
      url: `${baseUrl}/users/${user.id}`,
      lastModified: user.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
    
    console.log(`✅ sitemap.xml: 動的ページ生成成功 - 投稿: ${posts.length}, ユーザー: ${users.length}`)
    
    return [...staticPages, ...postPages, ...userPages]
    
  } catch (error) {
    // データベース接続エラー時の処理
    console.warn('⚠️ sitemap.xml: データベース接続失敗、静的ページのみ生成:', error instanceof Error ? error.message : 'Unknown error')
    
    // データベースに接続できない場合は静的ページのみを返す
    return staticPages
  } finally {
    // Prismaクライアントの明示的な切断（可能な場合）
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      // 切断エラーは無視（既に切断されている場合など）
      console.warn('⚠️ sitemap.xml: Prisma切断時の警告:', disconnectError instanceof Error ? disconnectError.message : 'Unknown disconnect error')
    }
  }
} 