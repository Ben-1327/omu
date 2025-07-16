'use client'

import { useState, useEffect } from 'react'
import PostCard from '@/components/posts/PostCard'
import { Post, User, Tag } from '@prisma/client'

interface PopularSectionProps {
 title: string
 type?: 'all' | 'article' | 'prompt' | 'conversation'
}

type PostWithDetails = Post & {
 user: User
 postTags: Array<{
  tag: Tag
 }>
 _count: {
  likes: number
 }
}

export default function PopularSection({ title, type = 'all' }: PopularSectionProps) {
 const [posts, setPosts] = useState<PostWithDetails[]>([])
 const [loading, setLoading] = useState(true)

 useEffect(() => {
  const fetchPosts = async () => {
   try {
    const params = new URLSearchParams({
     sort: 'popular',
     limit: '5'
    })
    
    if (type !== 'all') {
     params.append('type', type)
    }

    const response = await fetch(`/api/posts?${params}`)
    if (response.ok) {
     const data = await response.json()
     setPosts(data)
    }
   } catch (error) {
    console.error('投稿取得エラー:', error)
   } finally {
    setLoading(false)
   }
  }

  fetchPosts()
 }, [type])

 if (loading) {
  return (
   <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
    <div className="space-y-4">
     {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse">
       <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
       <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
     ))}
    </div>
   </div>
  )
 }

 return (
  <div className="bg-white rounded-lg shadow-md p-6">
   <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
   <div className="space-y-4">
    {posts.length > 0 ? (
     posts.map((post) => (
      <PostCard key={post.id} post={post} />
     ))
    ) : (
     <p className="text-gray-500 text-center py-8">
      まだ投稿がありません
     </p>
    )}
   </div>
  </div>
 )
}