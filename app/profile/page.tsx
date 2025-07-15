'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { redirect } from 'next/navigation'
import PostCard from '@/components/posts/PostCard'
import { Post, User, Tag } from '@prisma/client'
import styles from './profile.module.css'

type PostWithDetails = Post & {
  user: User
  postTags: Array<{
    tag: Tag
  }>
  _count: {
    likes: number
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [favorites, setFavorites] = useState<PostWithDetails[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'favorites'>('posts')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  const fetchUserData = useCallback(async () => {
    try {
      const [postsResponse, favoritesResponse] = await Promise.all([
        fetch(`/api/users/${session?.user?.id}/posts`),
        fetch(`/api/users/${session?.user?.id}/favorites`)
      ])

      if (postsResponse.ok && favoritesResponse.ok) {
        const postsData = await postsResponse.json()
        const favoritesData = await favoritesResponse.json()
        setPosts(postsData)
        setFavorites(favoritesData)
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData()
    }
  }, [session, fetchUserData])

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {session.user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{session.user.name}</h1>
            <p className={styles.profileEmail}>{session.user.email}</p>
            {session.user.isAdmin && (
              <span className={styles.adminBadge}>
                管理者
              </span>
            )}
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{posts.length}</div>
            <div className={styles.statLabel}>投稿</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{favorites.length}</div>
            <div className={styles.statLabel}>お気に入り</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>0</div>
            <div className={styles.statLabel}>フォロワー</div>
          </div>
        </div>
      </div>

      <div className={styles.tabContainer}>
        <div className={styles.tabList}>
          <button
            onClick={() => setActiveTab('posts')}
            className={`${styles.tab} ${
              activeTab === 'posts' ? styles.tabActive : styles.tabInactive
            }`}
          >
            投稿 ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`${styles.tab} ${
              activeTab === 'favorites' ? styles.tabActive : styles.tabInactive
            }`}
          >
            お気に入り ({favorites.length})
          </button>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {activeTab === 'posts' ? (
          posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>まだ投稿がありません。</p>
            </div>
          )
        ) : (
          favorites.length > 0 ? (
            favorites.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>お気に入りがありません。</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}