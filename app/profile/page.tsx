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
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'favorites' | 'followers' | 'following'>('posts')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  const fetchUserData = useCallback(async () => {
    try {
      const [postsResponse, favoritesResponse, followersResponse, followingResponse] = await Promise.all([
        fetch(`/api/users/${session?.user?.id}/posts`),
        fetch(`/api/users/${session?.user?.id}/favorites`),
        fetch(`/api/users/${session?.user?.id}/followers`),
        fetch(`/api/users/${session?.user?.id}/following`)
      ])

      if (postsResponse.ok && favoritesResponse.ok && followersResponse.ok && followingResponse.ok) {
        const postsData = await postsResponse.json()
        const favoritesData = await favoritesResponse.json()
        const followersData = await followersResponse.json()
        const followingData = await followingResponse.json()
        setPosts(postsData)
        setFavorites(favoritesData)
        setFollowers(followersData)
        setFollowing(followingData)
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
            <div className={styles.statNumber}>{followers.length}</div>
            <div className={styles.statLabel}>フォロワー</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{following.length}</div>
            <div className={styles.statLabel}>フォロイング</div>
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
          <button
            onClick={() => setActiveTab('followers')}
            className={`${styles.tab} ${
              activeTab === 'followers' ? styles.tabActive : styles.tabInactive
            }`}
          >
            フォロワー ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`${styles.tab} ${
              activeTab === 'following' ? styles.tabActive : styles.tabInactive
            }`}
          >
            フォロイング ({following.length})
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
        ) : activeTab === 'favorites' ? (
          favorites.length > 0 ? (
            favorites.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>お気に入りがありません。</p>
            </div>
          )
        ) : activeTab === 'followers' ? (
          followers.length > 0 ? (
            followers.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {user.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.userName}>{user.username}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>フォロワーがいません。</p>
            </div>
          )
        ) : (
          following.length > 0 ? (
            following.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {user.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.userName}>{user.username}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>フォロイングがいません。</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}