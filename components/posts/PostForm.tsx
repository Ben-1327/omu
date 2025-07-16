'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import TagInput from '@/components/ui/TagInput'
import styles from './PostForm.module.css'
import remarkBreaks from 'remark-breaks'

// Markdownエディタを動的インポート（SSR対応）
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

type PostType = 'article' | 'prompt' | 'conversation'

interface PostFormData {
  type: PostType
  title: string
  content: string
  description?: string
  platform?: string
  tags: string[]
}

export default function PostForm() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<PostFormData>({
    type: 'article',
    title: '',
    content: '',
    description: '',
    platform: '',
    tags: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'live'>('live')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('投稿エラー:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }))
  }

  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.loginPrompt}>
          <p>投稿するにはログインしてください。</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>新規投稿</h1>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
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

        {/* プロンプト投稿の場合の特別レイアウト */}
        {formData.type === 'prompt' ? (
          <>
            {/* プロンプト本文 */}
            <div className={styles.section}>
              <label className={styles.sectionLabel}>
                プロンプト本文
                <span className={styles.characterCount}>
                  {formData.content.length} 文字
                </span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className={styles.promptTextarea}
                placeholder="実際に使用するプロンプトを入力してください（コピー&ペーストで使えるように）"
                rows={8}
                required
              />
            </div>

            {/* 説明文 */}
            <div className={styles.section}>
              <label className={styles.sectionLabel}>
                説明文
                <span className={styles.characterCount}>
                  {formData.description?.length || 0} 文字
                </span>
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={styles.descriptionTextarea}
                placeholder="プロンプトの使い方、効果、コツなどを説明してください"
                rows={6}
                required
              />
            </div>
          </>
        ) : (
          /* 記事・会話投稿の場合の従来レイアウト */
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
              height={600}
              hideToolbar
              data-color-mode="light"
              visibleDragbar={false}
              textareaProps={{
                placeholder: 'Markdownで記述してください',
                style: {
                  fontSize: 16,
                  lineHeight: 1.6,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  backgroundColor: '#ffffff',
                  color: '#2d3748',
                  border: 'none',
                  outline: 'none',
                },
              }}
              previewOptions={{
                remarkPlugins: [remarkBreaks],
                rehypePlugins: [],
              }}
            />
          </div>
          </div>
        )}

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
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  )
}