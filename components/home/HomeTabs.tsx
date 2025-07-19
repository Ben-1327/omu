'use client'

import { useState, useEffect } from 'react'
import PostCard from '@/components/posts/PostCard'
import { Post, User, Tag } from '@/types/prisma'
import styles from './HomeTabs.module.css'

type PostWithDetails = Post & {
  user: User
  postTags: Array<{
    tag: Tag
  }>
  _count: {
    likes: number
  }
}

export default function HomeTabs() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'trending'>('timeline')
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [activeTab])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sort: activeTab === 'timeline' ? 'latest' : 'popular',
        limit: '20'
      })

      const response = await fetch(`/api/posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('投稿取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'timeline', label: 'タイムライン', description: '最新の投稿' },
    { id: 'trending', label: 'トレンド', description: '人気の投稿' }
  ]

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <div key={tab.id} className={styles.tab}>
              <span className={styles.tabLabel}>{tab.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.content}>
          <div className={styles.loading}>読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id as 'timeline' | 'trending')}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
            <span className={styles.tabDescription}>{tab.description}</span>
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {posts.length === 0 ? (
          <div className={styles.empty}>
            <p>まだ投稿がありません</p>
          </div>
        ) : (
          <div className={styles.posts}>
            {posts.map((post) => (
              <div key={post.id} className={styles.postItem}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}