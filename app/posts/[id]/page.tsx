'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Post, User, Tag } from '@prisma/client'
import ReactMarkdown from 'react-markdown'

type PostWithDetails = Post & {
  user: User
  postTags: Array<{
    tag: Tag
  }>
  _count: {
    likes: number
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
        
        // いいね・お気に入り状態を確認
        if (session?.user?.id) {
          checkLikeAndFavoriteStatus()
        }
      }
    } catch (error) {
      console.error('投稿取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkLikeAndFavoriteStatus = async () => {
    try {
      const [likeResponse, favoriteResponse] = await Promise.all([
        fetch(`/api/posts/${params.id}/like-status`),
        fetch(`/api/posts/${params.id}/favorite-status`)
      ])

      if (likeResponse.ok) {
        const likeData = await likeResponse.json()
        setLiked(likeData.liked)
      }

      if (favoriteResponse.ok) {
        const favoriteData = await favoriteResponse.json()
        setFavorited(favoriteData.favorited)
      }
    } catch (error) {
      console.error('状態確認エラー:', error)
    }
  }

  const handleLike = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: params.id })
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        
        // いいね数を更新
        if (post) {
          setPost({
            ...post,
            _count: {
              ...post._count,
              likes: post._count.likes + (data.liked ? 1 : -1)
            }
          })
        }
      }
    } catch (error) {
      console.error('いいねエラー:', error)
    }
  }

  const handleFavorite = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: params.id })
      })

      if (response.ok) {
        const data = await response.json()
        setFavorited(data.favorited)
      }
    } catch (error) {
      console.error('お気に入りエラー:', error)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article':
        return '記事'
      case 'prompt':
        return 'プロンプト'
      case 'conversation':
        return '会話'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800'
      case 'prompt':
        return 'bg-green-100 text-green-800'
      case 'conversation':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">投稿が見つかりません</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(post.type)}`}>
              {getTypeLabel(post.type)}
            </span>
            {post.platform && (
              <span className="text-sm text-gray-500">
                {post.platform}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString('ja-JP')}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {post.user.username[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-gray-700">
              {post.user.username}
            </span>
          </div>
          
          {session?.user?.id && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                  liked 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>♥</span>
                <span>{post._count.likes}</span>
              </button>
              
              <button
                onClick={handleFavorite}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                  favorited 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>★</span>
                <span>{favorited ? 'お気に入り済み' : 'お気に入り'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="prose prose-lg max-w-none mb-6">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.postTags.map(({ tag }) => (
            <span
              key={tag.id}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </article>

      {session?.user?.id && (session.user.id === post.userId || session.user.isAdmin) && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              編集
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}