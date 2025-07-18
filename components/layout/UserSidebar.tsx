'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProfileImage } from '@/components/ui/OptimizedImage'
import styles from './UserSidebar.module.css'

interface User {
  id: string
  username: string
  email: string
  image?: string
  profileImageUrl?: string
  createdAt: string
  isAdmin: boolean
  _count: {
    posts: number
    followers: number
    following: number
  }
}

export default function UserSidebar() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false)
      return
    }

    if (status === 'authenticated') {
      fetchUserData()
    }
  }, [status])

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

  // 未認証の場合は何も表示しない
  if (status === 'unauthenticated') {
    return (
      <div className={styles.container}>
        <div className={styles.loginPrompt}>
          <div className={styles.loginCard}>
            <h3 className={styles.loginTitle}>ログインして参加</h3>
            <p className={styles.loginDescription}>
              投稿やフォローができます
            </p>
            <Link href="/auth/signin" className={styles.loginButton}>
              ログイン
            </Link>
          </div>
        </div>
      </div>
    )
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

  return (
    <div className={styles.container}>
      {/* ユーザー情報カード */}
      <div className={styles.userCard}>
        <div className={styles.userHeader}>
          <ProfileImage
            src={user.profileImageUrl || user.image || undefined}
            alt={`${user.username}のプロフィール画像`}
            size="lg"
            fallbackInitial={user.username?.[0]?.toUpperCase() || 'U'}
            className={styles.avatar}
          />
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{user.username}</h2>
            <p className={styles.userHandle}>@{user.username}</p>
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

        {/* プロフィール編集ボタン */}
        <Link href="/settings" className={styles.editButton}>
          プロフィールを編集する
        </Link>
      </div>

      {/* 投稿セクション */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>投稿した記事</h3>
        <div className={styles.sectionContent}>
          <div className={styles.articleCount}>
            <span className={styles.count}>{user._count.posts}</span>
            <span className={styles.countLabel}>記事</span>
          </div>
          <Link href="/profile" className={styles.sectionLink}>
            すべて見る
          </Link>
        </div>
      </div>

      {/* フォロー情報 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>フォロー中</h3>
        <div className={styles.sectionContent}>
          <div className={styles.followInfo}>
            <div className={styles.followItem}>
              <span className={styles.followCount}>{user._count.followers}</span>
              <span className={styles.followLabel}>フォロワー</span>
            </div>
            <div className={styles.followItem}>
              <span className={styles.followCount}>{user._count.following}</span>
              <span className={styles.followLabel}>フォロー中</span>
            </div>
          </div>
          <Link href="/profile" className={styles.sectionLink}>
            詳細を見る
          </Link>
        </div>
      </div>
    </div>
  )
}