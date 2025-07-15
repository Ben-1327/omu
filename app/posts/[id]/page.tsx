'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Post, User, Tag } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import TwitterShareButton from '@/components/ui/TwitterShareButton'
import styles from './post-detail.module.css'

interface TocItem {
  id: string
  text: string
  level: number
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

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [tocItems, setTocItems] = useState<TocItem[]>([])

  // 目次アイテムを生成する関数
  const generateTocItems = useCallback((content: string) => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const items: TocItem[] = []
    let match
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      
      items.push({ id, text, level })
    }
    
    return items
  }, [])

  // カスタムMarkdownコンポーネント
  const MarkdownComponents = {
    h1: ({ children }: { children: React.ReactNode }) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      return <h1 id={id}>{children}</h1>
    },
    h2: ({ children }: { children: React.ReactNode }) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      return <h2 id={id}>{children}</h2>
    },
    h3: ({ children }: { children: React.ReactNode }) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      return <h3 id={id}>{children}</h3>
    },
    h4: ({ children }: { children: React.ReactNode }) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      return <h4 id={id}>{children}</h4>
    },
    h5: ({ children }: { children: React.ReactNode }) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      return <h5 id={id}>{children}</h5>
    },
    h6: ({ children }: { children: React.ReactNode }) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      return <h6 id={id}>{children}</h6>
    },
  }

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
        
        // 目次を生成
        if (data.content) {
          const toc = generateTocItems(data.content)
          setTocItems(toc)
        }
        
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
      <div className={styles.contentWrapper}>
        {/* 左サイドバー */}
        <div className={styles.leftSidebar}>
          {session?.user?.id && (
            <>
              <button
                onClick={handleLike}
                className={`${styles.sideActionButton} ${styles.sideLikeButton} ${
                  liked ? styles.sideActionButtonActive : ''
                }`}
                title={`いいね (${post._count.likes})`}
              >
                <span className={styles.sideActionIcon}>♥</span>
                <span className={styles.sideActionCount}>{post._count.likes}</span>
              </button>
              
              <button
                onClick={handleFavorite}
                className={`${styles.sideActionButton} ${styles.sideFavoriteButton} ${
                  favorited ? styles.sideActionButtonActive : ''
                }`}
                title={favorited ? 'お気に入り済み' : 'お気に入り'}
              >
                <span className={styles.sideActionIcon}>★</span>
              </button>
              
              {/* Twitterシェアボタン */}
              {currentUrl && (
                <div className={styles.sideShareButton}>
                  <TwitterShareButton
                    url={`${currentUrl}/posts/${post.id}`}
                    text={`${post.title} | omu`}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* メインコンテンツ */}
        <div className={styles.mainContent}>
          <article className={styles.article}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
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
        </div>

        <h1 className={styles.title}>
          {post.title}
        </h1>


        <div className={styles.content}>
          <ReactMarkdown components={MarkdownComponents}>
            {post.content}
          </ReactMarkdown>
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
        </div>

        {/* 右サイドバー */}
        <div className={styles.sidebar}>
          {/* ユーザー情報 */}
          <div className={styles.authorInfo}>
            <div className={styles.authorCard}>
              <div className={styles.avatar}>
                {post.user.username[0]?.toUpperCase()}
              </div>
              <div className={styles.authorDetails}>
                <span className={styles.username}>
                  {post.user.username}
                </span>
                <div className={styles.dateInfo}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>投稿日:</span>
                    <span className={styles.dateValue}>
                      {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>更新日:</span>
                    <span className={styles.dateValue}>
                      {new Date(post.updatedAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 目次 */}
          {tocItems.length > 0 && (
            <div className={styles.tableOfContents}>
              <h3 className={styles.tocTitle}>目次</h3>
              <ul className={styles.tocList}>
                {tocItems.map((item, index) => (
                  <li key={index} className={`${styles.tocItem} ${styles[`tocLevel${item.level}`]}`}>
                    <a 
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(item.id)?.scrollIntoView({ 
                          behavior: 'smooth' 
                        })
                      }}
                      className={styles.tocLink}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

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