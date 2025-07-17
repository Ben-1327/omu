'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  excerpt: string
  type: 'article' | 'prompt' | 'conversation'
  createdAt: string
  user: {
    id: string
    username: string
  }
  tags: {
    id: string
    name: string
  }[]
}

interface Tag {
  id: string
  name: string
  rank: number
  postCount: number
}

interface TagCategorySectionProps {
  className?: string
}

export default function TagCategorySection({ className }: TagCategorySectionProps) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [tagPosts, setTagPosts] = useState<{[key: string]: Post[]}>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopTags()
  }, [])

  const fetchTopTags = async () => {
    try {
      // 人気のタグ、投稿数が多いタグ、最近人気のタグから3つ選定
      const [popularTags, weeklyTags, monthlyTags] = await Promise.all([
        fetch('/api/tags/ranking?period=all&limit=5').then(res => res.json()),
        fetch('/api/tags/ranking?period=week&limit=5').then(res => res.json()),
        fetch('/api/tags/ranking?period=month&limit=5').then(res => res.json())
      ])

      // 重複を避けて3つのタグを選定
      const allTags = [...popularTags, ...weeklyTags, ...monthlyTags]
      const uniqueTags = allTags.filter((tag, index, self) => 
        index === self.findIndex(t => t.id === tag.id)
      )
      
      // 投稿数でソートして上位3つを選択
      const topTags = uniqueTags
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 3)

      setSelectedTags(topTags)

      // 各タグの投稿を取得
      const postsData: {[key: string]: Post[]} = {}
      for (const tag of topTags) {
        const posts = await fetchPostsByTag(tag.name)
        postsData[tag.id] = posts
      }
      setTagPosts(postsData)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPostsByTag = async (tagName: string): Promise<Post[]> => {
    try {
      const response = await fetch(`/api/search?tag=${encodeURIComponent(tagName)}&limit=10&sort=popular`)
      const data = await response.json()
      return data || []
    } catch (error) {
      console.error(`Failed to fetch posts for tag ${tagName}:`, error)
      return []
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return '📚'
      case 'prompt':
        return '⚡'
      case 'conversation':
        return '💬'
      default:
        return '📝'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'article':
        return '記事'
      case 'prompt':
        return 'プロンプト'
      case 'conversation':
        return '会話'
      default:
        return '投稿'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return 'たった今'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}分前`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}時間前`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}日前`
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return `${months}ヶ月前`
    } else {
      const years = Math.floor(diffInSeconds / 31536000)
      return `${years}年前`
    }
  }

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {selectedTags.map((tag) => (
        <div key={tag.id} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="mr-3">✓</span>
              {tag.name}
            </h2>
            <span className="text-sm text-gray-500">
              {tag.postCount}件
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(tagPosts[tag.id] || []).slice(0, 10).map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 p-6"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">
                        {getTypeIcon(post.type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-2">
                      <span>{post.user.username}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link
              href={`/search?tag=${encodeURIComponent(tag.name)}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              {tag.name}の記事をもっと見る →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}