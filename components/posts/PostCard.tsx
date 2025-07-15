import Link from 'next/link'
import { Post, User, Tag } from '@prisma/client'

interface PostCardProps {
  post: Post & {
    user: User
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(post.type)}`}>
              {getTypeLabel(post.type)}
            </span>
            {post.platform && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {post.platform}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {post.createdAt.toLocaleDateString('ja-JP')}
          </span>
        </div>

        <Link href={`/posts/${post.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
            {post.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {post.content.substring(0, 150)}...
          </p>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              by {post.user.username}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ♥ {post._count.likes}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {post.postTags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              >
                #{tag.name}
              </span>
            ))}
            {post.postTags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{post.postTags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}