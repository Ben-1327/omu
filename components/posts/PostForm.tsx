'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import TagInput from '@/components/ui/TagInput'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { ImageUploadResult } from '@/lib/image-upload'
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
  link?: string
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
    link: '',
    tags: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'live'>('live')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setIsSubmitting(true)
    
    try {
      // 会話投稿の場合はcontentを空文字に設定
      const submitData = {
        ...formData,
        content: formData.type === 'conversation' ? '' : formData.content
      }

      console.log('投稿データ:', submitData)

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      console.log('レスポンスステータス:', response.status)

      if (response.ok) {
        const responseData = await response.json()
        console.log('投稿成功:', responseData)
        router.push('/')
      } else {
        const errorData = await response.json()
        console.error('API エラー:', errorData)
        console.error('レスポンスヘッダー:', response.headers)
        alert(errorData.error || '投稿に失敗しました')
      }
    } catch (error) {
      console.error('投稿エラー (catch):', error)
      console.error('エラーの詳細:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      alert('投稿に失敗しました: ' + (error instanceof Error ? error.message : String(error)))
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

  const handleImageUpload = (result: ImageUploadResult) => {
    if (result.success && result.url) {
      // Markdownの画像形式でコンテンツに挿入
      const imageMarkdown = `![画像](${result.url})`
      setFormData(prev => ({
        ...prev,
        content: prev.content + '\n\n' + imageMarkdown
      }))
    }
  }

  const handleImageUploadError = (error: string) => {
    alert('画像のアップロードに失敗しました: ' + error)
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
        ) : formData.type === 'conversation' ? (
          /* 会話投稿の場合の専用レイアウト */
          <>
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
                placeholder="会話の内容、背景、得られた知見などを説明してください"
                rows={8}
                required
              />
            </div>

            {/* リンク */}
            <div className={styles.section}>
              <label className={styles.sectionLabel}>
                リンク（オプション）
              </label>
              <input
                type="url"
                value={formData.link || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                className={styles.titleInput}
                placeholder="元の会話へのリンク（ChatGPT、Claude など）"
              />
            </div>
          </>
        ) : (
          /* 記事投稿の場合の従来レイアウト */
          <>
            {/* 画像アップロード（記事投稿の場合のみ） */}
            <div className={styles.section}>
              <label className={styles.sectionLabel}>
                画像アップロード
              </label>
              <div className={styles.imageUploadContainer}>
                <ImageUpload
                  onUploadComplete={handleImageUpload}
                  onError={handleImageUploadError}
                  options={{
                    bucket: 'post-images',
                    userId: session?.user?.id,
                    maxWidth: 1200,
                    maxHeight: 800,
                    quality: 0.85,
                    format: 'webp'
                  }}
                  className={styles.imageUpload}
                  placeholder="画像をアップロードしてMarkdownに挿入"
                  showPreview={false}
                />
                <p className={styles.uploadHint}>
                  アップロードした画像は自動的に本文に挿入されます
                </p>
              </div>
            </div>

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
                className: styles.mdEditorTextarea,
              }}
              previewOptions={{
                remarkPlugins: [remarkBreaks],
                rehypePlugins: [],
              }}
            />
          </div>
          </div>
          </>
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