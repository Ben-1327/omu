'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Post, User, Tag } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import TwitterShareButton from '@/components/ui/TwitterShareButton'
import styles from './post-detail.module.css'

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
  const router = useRouter()
  const { data: session } = useSession()
  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.origin)
  }, [])

  const checkLikeAndFavoriteStatus = useCallback(async () => {
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
  }, [params.id])

  const fetchPost = useCallback(async () => {
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
  }, [params.id, session?.user?.id, checkLikeAndFavoriteStatus])

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id, fetchPost])

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

  const handleDelete = async () => {
    if (!session?.user?.id || !post) return

    // 権限チェック
    if (post.userId !== session.user.id && !session.user.isAdmin) {
      alert('削除権限がありません')
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
        alert(data.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
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
        return styles.typeArticle
      case 'prompt':
        return styles.typePrompt
      case 'conversation':
        return styles.typeConversation
      default:
        return styles.typeDefault
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>投稿が見つかりません</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={`${styles.typeLabel} ${getTypeColor(post.type)}`}>
              {getTypeLabel(post.type)}
            </span>
            {post.platform && (
              <span className={styles.platform}>
                {post.platform}
              </span>
            )}
          </div>
          <span className={styles.date}>
            {new Date(post.createdAt).toLocaleDateString('ja-JP')}
          </span>
        </div>

        <h1 className={styles.title}>
          {post.title}
        </h1>

        <div className={styles.userInfo}>
          <div className={styles.userDetails}>
            <div className={styles.avatar}>
              {post.user.username[0]?.toUpperCase()}
            </div>
            <span className={styles.username}>
              {post.user.username}
            </span>
          </div>
          
          {session?.user?.id && (
            <div className={styles.actions}>
              <button
                onClick={handleLike}
                className={`${styles.actionButton} ${styles.likeButton} ${
                  liked ? styles.likeButtonActive : ''
                }`}
              >
                <span>♥</span>
                <span>{post._count.likes}</span>
              </button>
              
              <button
                onClick={handleFavorite}
                className={`${styles.actionButton} ${styles.favoriteButton} ${
                  favorited ? styles.favoriteButtonActive : ''
                }`}
              >
                <span>★</span>
                <span>{favorited ? 'お気に入り済み' : 'お気に入り'}</span>
              </button>
            </div>
          )}
          
          {/* Twitterシェアボタン */}
          {currentUrl && (
            <TwitterShareButton
              url={`${currentUrl}/posts/${post.id}`}
              text={`${post.title} | omu`}
            />
          )}
        </div>

        <div className={styles.content}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className={styles.tags}>
          {post.postTags.map(({ tag }) => (
            <span
              key={tag.id}
              className={styles.tag}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </article>

      {session?.user?.id && (session.user.id === post.userId || session.user.isAdmin) && (
        <div className={styles.adminActions}>
          <div className={styles.adminActionButtons}>
            <button 
              onClick={() => router.push(`/posts/${post.id}/edit`)}
              className={styles.editButton}
            >
              編集
            </button>
            <button 
              onClick={handleDelete}
              className={styles.deleteButton}
            >
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}