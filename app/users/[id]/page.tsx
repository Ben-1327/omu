'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { User, Tag } from '@/types/prisma'
import PostCard from '@/components/posts/PostCard'
import FollowButton from '@/components/users/FollowButton'
import { ProfileImage } from '@/components/ui/OptimizedImage'
import styles from './user-profile.module.css'

interface UserWithCounts extends User {
  _count: {
    posts: number
    followers: number
    following: number
  }
}

interface PostWithDetails {
  id: number
  userId: string
  type: 'article' | 'prompt' | 'conversation'
  title: string
  content?: string | null
  description?: string | null
  platform?: string | null
  link?: string | null
  viewCount: number
  likeCount: number
  visibility: 'public' | 'private' | 'draft' | 'followers_only'
  createdAt: Date
  updatedAt: Date
  user: User
  postTags: Array<{
    tag: Tag
  }>
  _count: {
    likes: number
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const { data: session } = useSession()
  const [user, setUser] = useState<UserWithCounts | null>(null)
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'posts' | 'favorites'>('posts')

  const userId = params.id as string

  const fetchUserData = useCallback(async () => {
    try {
      const [userResponse, postsResponse] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/users/${userId}/posts`)
      ])

      if (userResponse.ok && postsResponse.ok) {
        const userData = await userResponse.json()
        const postsData = await postsResponse.json()
        setUser(userData)
        setPosts(postsData)
      } else {
        setError('ユーザー情報の取得に失敗しました')
      }
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error)
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId, fetchUserData])

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/favorites`)
      if (response.ok) {
        const favoritesData = await response.json()
        setPosts(favoritesData)
      }
    } catch (error) {
      console.error('お気に入り取得エラー:', error)
    }
  }

  const handleTabChange = (tab: 'posts' | 'favorites') => {
    setActiveTab(tab)
    if (tab === 'posts') {
      fetchUserData()
    } else {
      fetchFavorites()
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'ユーザーが見つかりません'}</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.userInfo}>
          <ProfileImage
            src={user.profileImageUrl || user.image || undefined}
            alt={`${user.username}のプロフィール画像`}
            size="xl"
            fallbackInitial={user.username[0]?.toUpperCase()}
            className={styles.avatar}
          />
          <div className={styles.userDetails}>
            <h1 className={styles.username}>{user.username}</h1>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{user._count.posts}</span>
                <span className={styles.statLabel}>投稿</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{user._count.followers}</span>
                <span className={styles.statLabel}>フォロワー</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{user._count.following}</span>
                <span className={styles.statLabel}>フォロー中</span>
              </div>
            </div>
          </div>
        </div>
        
        {session?.user?.id !== userId && (
          <div className={styles.actions}>
            <FollowButton 
              userId={userId}
              onFollowChange={() => fetchUserData()}
            />
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            onClick={() => handleTabChange('posts')}
            className={`${styles.tab} ${activeTab === 'posts' ? styles.tabActive : styles.tabInactive}`}
          >
            投稿 ({user._count.posts})
          </button>
          <button
            onClick={() => handleTabChange('favorites')}
            className={`${styles.tab} ${activeTab === 'favorites' ? styles.tabActive : styles.tabInactive}`}
          >
            ブックマーク
          </button>
        </div>

        <div className={styles.postsGrid}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post as any} />
            ))
          ) : (
            <div className={styles.noPosts}>
              {activeTab === 'posts' ? '投稿がありません' : 'ブックマークがありません'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}