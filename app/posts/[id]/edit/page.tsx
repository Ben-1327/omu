'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Post, Tag } from '@/types/prisma'
import dynamic from 'next/dynamic'
import TagInput from '@/components/ui/TagInput'
import remarkBreaks from 'remark-breaks'
import styles from './edit.module.css'

// Markdownエディタを動的インポート（SSR対応）
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

type PostType = 'article' | 'prompt' | 'conversation'

interface PostFormData {
  type: PostType
  title: string
  content: string
  platform?: string
  tags: string[]
}

type PostWithTags = Post & {
  postTags: Array<{
    tag: Tag
  }>
}

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  
  const [post, setPost] = useState<PostWithTags | null>(null)
  const [formData, setFormData] = useState<PostFormData>({
    type: 'article',
    title: '',
    content: '',
    platform: '',
    tags: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'live'>('live')

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setPost(data)
          setFormData({
            type: data.type,
            title: data.title,
            content: data.content,
            platform: data.platform || '',
            tags: data.postTags.map((pt: { tag: { name: string } }) => pt.tag.name)
          })
        } else {
          setError('投稿が見つかりません')
        }
      } catch (error) {
        console.error('投稿取得エラー:', error)
        setError('投稿の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !post) return

    // 権限チェック
    if (post.userId !== session.user.id && !session.user.isAdmin) {
      setError('編集権限がありません')
      return
    }

    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/posts/${params.id}`)
      } else {
        const data = await response.json()
        setError(data.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('更新エラー:', error)
      setError('更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!session || !post) return

    // 権限チェック
    if (post.userId !== session.user.id && !session.user.isAdmin) {
      setError('削除権限がありません')
      return
    }

    if (!confirm('本当にこの投稿を削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      setError('削除に失敗しました')
    }
  }

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }))
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>ログインが必要です</div>
      </div>
    )
  }

  if (post && post.userId !== session.user.id && !session.user.isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>編集権限がありません</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>投稿を編集</h1>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        {/* タイプ選択 */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>投稿タイプ</label>
          <div className={styles.typeSelector}>
            {[
              { value: 'article', label: '記事', icon: '📝', description: '技術記事やノウハウを共有' },
              { value: 'prompt', label: 'プロンプト', icon: '🤖', description: 'AI用プロンプトを共有' },
              { value: 'conversation', label: '会話', icon: '💬', description: 'AIとの会話を共有' }
            ].map(({ value, label, icon, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: value as PostType }))}
                className={`${styles.typeCard} ${
                  formData.type === value ? styles.typeCardActive : ''
                }`}
              >
                <div className={styles.typeIcon}>{icon}</div>
                <div className={styles.typeLabel}>{label}</div>
                <div className={styles.typeDescription}>{description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* プラットフォーム選択（会話の場合のみ） */}
        {formData.type === 'conversation' && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>プラットフォーム</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
              className={styles.select}
              required
            >
              <option value="">選択してください</option>
              <option value="ChatGPT">ChatGPT</option>
              <option value="Claude">Claude</option>
              <option value="Gemini">Gemini</option>
              <option value="Grok">Grok</option>
            </select>
          </div>
        )}

        {/* タイトル */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>
            タイトル
            <span className={styles.characterCount}>
              {formData.title.length}/100
            </span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={styles.titleInput}
            placeholder="タイトルを入力してください"
            maxLength={100}
            required
          />
        </div>

        {/* 本文 */}
        <div className={styles.section}>
          <div className={styles.editorHeader}>
            <label className={styles.sectionLabel}>
              本文
              <span className={styles.characterCount}>
                {formData.content.length} 文字
              </span>
            </label>
            <div className={styles.editorModeToggle}>
              <button
                type="button"
                onClick={() => setPreviewMode('edit')}
                className={`${styles.modeButton} ${previewMode === 'edit' ? styles.modeButtonActive : ''}`}
              >
                編集
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('live')}
                className={`${styles.modeButton} ${previewMode === 'live' ? styles.modeButtonActive : ''}`}
              >
                プレビュー
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('preview')}
                className={`${styles.modeButton} ${previewMode === 'preview' ? styles.modeButtonActive : ''}`}
              >
                プレビューのみ
              </button>
            </div>
          </div>
          <div className={styles.editorContainer} data-color-mode="light">
            <MDEditor
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value || '' }))}
              preview={previewMode}
              height={400}
              hideToolbar
              data-color-mode="light"
              visibleDragbar={false}
              textareaProps={{
                placeholder: 'Markdownで記述してください',
                className: styles.mdEditorTextarea,
              }}
              previewOptions={{
                remarkPlugins: [remarkBreaks],
                rehypePlugins: [],
              }}
            />
          </div>
        </div>

        {/* タグ */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>タグ（最大5個）</label>
          <TagInput
            tags={formData.tags}
            onTagsChange={handleTagsChange}
            maxTags={5}
            placeholder="タグを入力してください"
          />
        </div>

        {/* 送信ボタン */}
        <div className={styles.submitSection}>
          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={handleDelete}
              className={styles.deleteButton}
            >
              削除
            </button>
            <div className={styles.rightButtons}>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.cancelButton}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? '更新中...' : '更新'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}