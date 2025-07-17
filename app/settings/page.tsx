'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './settings.module.css'

interface User {
  id: string
  username: string
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

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    username: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchUserData()
    }
  }, [status, router])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData({
          username: userData.username
        })
      } else {
        setError('ユーザー情報の取得に失敗しました')
      }
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error)
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data)
        setSuccess('プロフィールを更新しました')
        // セッションを更新
        await update({ name: data.username })
      } else {
        setError(data.error || 'プロフィールの更新に失敗しました')
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      setError('プロフィールの更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>ユーザー情報が見つかりません</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>設定</h1>
        <p className={styles.subtitle}>アカウント情報を編集できます</p>
      </div>

      <div className={styles.content}>
        <div className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>プロフィール</h2>
          
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={styles.basicInfo}>
              <p className={styles.email}>{user.email}</p>
              <p className={styles.joinDate}>
                参加日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}
              </p>
              {user.isAdmin && (
                <span className={styles.adminBadge}>管理者</span>
              )}
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user._count.posts}</span>
              <span className={styles.statLabel}>投稿</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user._count.followers}</span>
              <span className={styles.statLabel}>フォロワー</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{user._count.following}</span>
              <span className={styles.statLabel}>フォロー中</span>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>プロフィール編集</h2>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorMessage}>{error}</div>
            )}
            
            {success && (
              <div className={styles.successMessage}>{success}</div>
            )}

            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>
                ユーザー名
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={styles.input}
                placeholder="ユーザー名"
                required
                minLength={2}
              />
              <p className={styles.fieldDescription}>
                2文字以上の英数字で入力してください
              </p>
            </div>


            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.cancelButton}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}