'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import styles from './FollowButton.module.css'

interface FollowButtonProps {
  userId: string
  className?: string
  onFollowChange?: () => void
}

export default function FollowButton({ userId, className = '', onFollowChange }: FollowButtonProps) {
  const { data: session } = useSession()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!session?.user?.id || userId === session.user.id) return

      try {
        const response = await fetch(`/api/users/${userId}/follow-status`)
        if (response.ok) {
          const data = await response.json()
          setFollowing(data.following)
        }
      } catch (error) {
        console.error('フォロー状態取得エラー:', error)
      }
    }

    checkFollowStatus()
  }, [userId, session?.user?.id])

  const handleFollow = async () => {
    if (!session?.user?.id || loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ followedId: userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setFollowing(data.following)
        onFollowChange?.()
      }
    } catch (error) {
      console.error('フォロー処理エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // 自分自身やログインしていない場合は表示しない
  if (!session?.user?.id || userId === session.user.id) {
    return null
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`${styles.followButton} ${
        following ? styles.following : styles.notFollowing
      } ${className}`}
    >
      {loading ? '...' : following ? 'フォロー中' : 'フォロー'}
    </button>
  )
}