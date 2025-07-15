'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import PostCard from '@/components/posts/PostCard'
import { Post, User, Tag } from '@prisma/client'

type PostWithDetails = Post & {
  user: User
  postTags: Array<{
    tag: Tag
  }>
  _count: {
    likes: number
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'new')

  const performSearch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        type,
        sort,
        limit: '20'
      })

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('検索エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [query, type, sort])

  useEffect(() => {
    if (query || type !== 'all') {
      performSearch()
    }
  }, [query, type, sort, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          検索
        </h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="キーワードを入力..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="article">記事</option>
                <option value="prompt">プロンプト</option>
                <option value="conversation">会話</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">新着順</option>
                <option value="popular">人気順</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? '検索中...' : '検索'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">検索中...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (query || type !== 'all') ? (
          <div className="text-center py-12">
            <p className="text-gray-600">検索結果が見つかりませんでした。</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">キーワードを入力して検索してください。</p>
          </div>
        )}
      </div>
    </div>
  )
}