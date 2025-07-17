'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PostCard from '@/components/posts/PostCard'
import { Post, User, Tag } from '@prisma/client'
import styles from './search.module.css'

type PostWithDetails = Post & {
  user: User
  postTags: Array<{
    tag: Tag
  }>
  _count: {
    likes: number
  }
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'new')
  const [tag, setTag] = useState(searchParams.get('tag') || '')

  const performSearch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        type,
        sort,
        limit: '20'
      })
      
      if (tag) {
        params.append('tag', tag)
      }

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
  }, [query, type, sort, tag])

  useEffect(() => {
    if (query || type !== 'all' || tag) {
      performSearch()
    }
  }, [query, type, sort, tag, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          検索
        </h1>
        
        <form onSubmit={handleSearch} className={styles.form}>
          <div className={styles.formContainer}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="キーワードを入力..."
                className={styles.input}
              />
            </div>
            <div className={styles.controls}>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={styles.select}
              >
                <option value="all">すべて</option>
                <option value="article">記事</option>
                <option value="prompt">プロンプト</option>
                <option value="conversation">会話</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={styles.select}
              >
                <option value="new">新着順</option>
                <option value="popular">人気順</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className={styles.searchButton}
              >
                {loading ? '検索中...' : '検索'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className={styles.results}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>検索中...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (query || type !== 'all' || tag) ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>検索結果が見つかりませんでした。</p>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>キーワードを入力して検索してください。</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}