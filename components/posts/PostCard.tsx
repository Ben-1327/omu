import Link from 'next/link'
import { Post, User, Tag } from '@prisma/client'
import { ProfileImage } from '@/components/ui/OptimizedImage'

interface PostCardProps {
 post: Post & {
  user: User
  description?: string | null
  postTags: Array<{
   tag: Tag
  }>
  _count: {
   likes: number
  }
 }
}

export default function PostCard({ post }: PostCardProps) {
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

 return (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 min-h-[240px] max-h-[280px] flex flex-col">
   <div className="p-4 flex-1 flex flex-col">
    <div className="flex items-start justify-between mb-3">
     <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(post.type)}`}>
       {getTypeLabel(post.type)}
      </span>
      {post.platform && (
       <span className="text-xs text-gray-500">
        {post.platform}
       </span>
      )}
     </div>
     <span className="text-sm text-gray-500 flex-shrink-0">
      {new Date(post.createdAt).toLocaleDateString('ja-JP')}
     </span>
    </div>

    <Link href={`/posts/${post.id}`} className="block flex-1 overflow-hidden">
     <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 line-clamp-2 leading-tight">
      {post.title}
     </h3>
     <p className="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed overflow-hidden">
      {(post.type === 'prompt' || post.type === 'conversation') && post.description 
        ? post.description.length > 120 ? post.description.substring(0, 120) + '...' : post.description
        : post.content ? (post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content) : ''
      }
     </p>
    </Link>

    <div className="flex items-center justify-between mt-auto pt-2">
     <div className="flex items-center space-x-2 min-w-0 flex-1">
      <Link href={`/users/${post.user.id}`} className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-800 hover:underline truncate">
       <ProfileImage
        src={post.user.profileImageUrl || post.user.image || undefined}
        alt={`${post.user.username}のプロフィール画像`}
        size="sm"
        fallbackInitial={post.user.username[0]?.toUpperCase()}
       />
       <span className="truncate">by {post.user.username}</span>
      </Link>
      <span className="text-sm text-gray-500 flex-shrink-0">
       ♥ {post._count.likes}
      </span>
     </div>
     
     <div className="flex flex-wrap gap-1 ml-2 flex-shrink-0">
      {post.postTags.slice(0, 2).map(({ tag }) => (
       <span
        key={tag.id}
        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
       >
        #{tag.name}
       </span>
      ))}
      {post.postTags.length > 2 && (
       <span className="text-xs text-gray-500">
        +{post.postTags.length - 2}
       </span>
      )}
     </div>
    </div>
   </div>
  </div>
 )
}