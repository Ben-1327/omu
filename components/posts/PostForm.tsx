'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
  
  const [tagInput, setTagInput] = useState('')
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
            placeholder="Markdownで記述してください"
            maxLength={10000}
            required
          />
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium mb-2">タグ（最大5個）</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="タグを入力してください"
              disabled={formData.tags.length >= 5}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={formData.tags.length >= 5}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 disabled:opacity-50"
            >
              追加
            </button>
          </div>
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