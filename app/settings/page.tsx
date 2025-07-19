'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { ImageUploadResult } from '@/lib/image-upload'
import { ProfileImage } from '@/components/ui/OptimizedImage'
import styles from './settings.module.css'

interface User {
  id: string
  username: string
  userId: string
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

export default function SettingsPage() {
  const { status, update } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    userId: ''
  })
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)

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
          username: userData.username,
          userId: userData.userId
        })
        setProfileImageUrl(userData.profileImageUrl || null)
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
        body: JSON.stringify({
          ...formData,
          profileImageUrl
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data)
        setSuccess('プロフィールを更新しました')
        // セッションを更新
        await update({ name: data.username, userId: data.userId })
        // マイページにリダイレクト
        setTimeout(() => {
          router.push('/profile')
        }, 1000)
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

  const handleImageUpload = (result: ImageUploadResult) => {
    if (result.success && result.url) {
      setProfileImageUrl(result.url)
      setSuccess('プロフィール画像をアップロードしました')
    }
  }

  const handleImageUploadError = (error: string) => {
    setError(error)
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
            <ProfileImage
              src={profileImageUrl || user.profileImageUrl || user.image || undefined}
              alt={`${user.username}のプロフィール画像`}
              size="xl"
              fallbackInitial={user.username?.[0]?.toUpperCase() || 'U'}
              className={styles.avatar}
            />
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
              <label className={styles.label}>
                プロフィール画像
              </label>
              <ImageUpload
                onUploadComplete={handleImageUpload}
                onError={handleImageUploadError}
                options={{
                  bucket: 'profile-images',
                  userId: user.id,
                  maxWidth: 400,
                  maxHeight: 400,
                  quality: 0.8,
                  format: 'webp'
                }}
                className={styles.imageUpload}
                currentImageUrl={profileImageUrl || user.image}
                placeholder="プロフィール画像をアップロード"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>
                ユーザー名（表示名）
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={styles.input}
                placeholder="山田太郎"
                required
                minLength={2}
              />
              <p className={styles.fieldDescription}>
                投稿やコメントで表示される名前です
              </p>
            </div>

            <div className={styles.field}>
              <label htmlFor="userId" className={styles.label}>
                ユーザーID
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                className={styles.input}
                placeholder="yamada_taro"
                required
                minLength={2}
              />
              <p className={styles.fieldDescription}>
                英数字とアンダースコアのみ使用可能。表示時は@が付きます（@{formData.userId}）
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