import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app'
  
  // 静的ページ
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]
  
  // 動的ページ - 投稿
  const posts = await prisma.post.findMany({
    where: {
      visibility: 'public'
    },
    select: {
      id: true,
      updatedAt: true
    }
  })
  
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  // 動的ページ - ユーザー
  const users = await prisma.user.findMany({
    select: {
      id: true,
      updatedAt: true
    }
  })
  
  const userPages = users.map((user) => ({
    url: `${baseUrl}/users/${user.id}`,
    lastModified: user.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))
  
  return [...staticPages, ...postPages, ...userPages]
} 