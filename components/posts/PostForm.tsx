'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import TagInput from '@/components/ui/TagInput'

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

export default function PostForm() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<PostFormData>({
    type: 'article',
    title: '',
    content: '',
    platform: '',
    tags: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-center text-gray-600">投稿するにはログインしてください。</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">新規投稿</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* タイプ選択 */}
        <div>
          <label className="block text-sm font-medium mb-2">投稿タイプ</label>
          <div className="flex space-x-4">
            {[
              { value: 'article', label: '記事' },
              { value: 'prompt', label: 'プロンプト' },
              { value: 'conversation', label: '会話' }
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: value as PostType }))}
                className={`px-4 py-2 rounded-md border ${
                  formData.type === value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* プラットフォーム選択（会話の場合のみ） */}
        {formData.type === 'conversation' && (
          <div>
            <label className="block text-sm font-medium mb-2">プラットフォーム</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div>
          <label className="block text-sm font-medium mb-2">タイトル</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="タイトルを入力してください"
            maxLength={100}
            required
          />
        </div>

        {/* 本文 */}
        <div>
          <label className="block text-sm font-medium mb-2">本文</label>
          <div data-color-mode="light">
            <MDEditor
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value || '' }))}
              preview="edit"
              height={400}
              visibleDragBar={false}
              textareaProps={{
                placeholder: 'Markdownで記述してください',
                style: {
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontFamily: 'monospace',
                },
              }}
            />
          </div>
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium mb-2">タグ（最大5個）</label>
          <TagInput
            tags={formData.tags}
            onTagsChange={handleTagsChange}
            maxTags={5}
            placeholder="タグを入力してください"
          />
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  )
}