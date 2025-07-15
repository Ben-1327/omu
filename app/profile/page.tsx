'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import PostCard from '@/components/posts/PostCard'
import { Post, User, Tag } from '@prisma/client'

type PostWithDetails = Post & {
  user: User
  postTags: Array<{
    tag: Tag
  }>
  _count: {
    likes: number
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [favorites, setFavorites] = useState<PostWithDetails[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'favorites'>('posts')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      const [postsResponse, favoritesResponse] = await Promise.all([
        fetch(`/api/users/${session?.user?.id}/posts`),
        fetch(`/api/users/${session?.user?.id}/favorites`)
      ])

      if (postsResponse.ok && favoritesResponse.ok) {
        const postsData = await postsResponse.json()
        const favoritesData = await favoritesResponse.json()
        setPosts(postsData)
        setFavorites(favoritesData)
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {session.user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.user.name}</h1>
            <p className="text-gray-600">{session.user.email}</p>
            {session.user.isAdmin && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                管理者
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
            <div className="text-gray-600">投稿</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{favorites.length}</div>
            <div className="text-gray-600">お気に入り</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-gray-600">フォロワー</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'posts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            投稿 ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'favorites'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            お気に入り ({favorites.length})
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {activeTab === 'posts' ? (
          posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">まだ投稿がありません。</p>
            </div>
          )
        ) : (
          favorites.length > 0 ? (
            favorites.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">お気に入りがありません。</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}