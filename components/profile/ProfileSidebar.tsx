'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './ProfileSidebar.module.css'

interface User {
  id: string
  username: string
  userId: string
  email: string
  image?: string
  createdAt: string
  isAdmin: boolean
  _count: {
    posts: number
    followers: number
    following: number
  }
}

interface ProfileSidebarProps {
  userId?: string
}

export default function ProfileSidebar({ userId }: ProfileSidebarProps) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const targetUserId = userId || session?.user?.id

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false)
      return
    }

    if (targetUserId) {
      fetchUserData()
    }
  }, [status, targetUserId])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isOwnProfile = session?.user?.id === user.id

  return (
    <div className={styles.container}>
      {/* プロフィール情報カード */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{user.username}</h2>
            <p className={styles.profileHandle}>@{user.userId}</p>
            {user.isAdmin && (
              <span className={styles.adminBadge}>管理者</span>
            )}
          </div>
        </div>

        {/* 統計情報 */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{user._count.posts}</div>
            <div className={styles.statLabel}>投稿</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{user._count.followers}</div>
            <div className={styles.statLabel}>フォロワー</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{user._count.following}</div>
            <div className={styles.statLabel}>フォロー</div>
          </div>
        </div>

        {/* 編集/フォローボタン */}
        {isOwnProfile ? (
          <Link href="/settings" className={styles.editButton}>
            プロフィールを編集する
          </Link>
        ) : (
          <button className={styles.followButton}>
            フォローする
          </button>
        )}
      </div>

      {/* プロフィール詳細セクション */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>プロフィール詳細</h3>
        <div className={styles.sectionContent}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>登録日:</span>
            <span className={styles.detailValue}>
              {new Date(user.createdAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>ID:</span>
            <span className={styles.detailValue}>@{user.userId}</span>
          </div>
        </div>
      </div>

      {/* 最近のアクティビティ */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>アクティビティ</h3>
        <div className={styles.sectionContent}>
          <div className={styles.activityItem}>
            <div className={styles.activityCount}>{user._count.posts}</div>
            <div className={styles.activityLabel}>記事を投稿</div>
          </div>
        </div>
      </div>
    </div>
  )
}