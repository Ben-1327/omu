'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PostCard from '@/components/posts/PostCard'
import { Post, User, Tag } from '@prisma/client'
import styles from './ProfileTabs.module.css'

type PostWithDetails = Post & {
  user: User
  postTags: Array<{
    tag: Tag
  }>
  _count: {
    likes: number
  }
}

interface ProfileTabsProps {
  userId?: string
}

export default function ProfileTabs({ userId }: ProfileTabsProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks' | 'followers' | 'following'>('posts')
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [bookmarks, setBookmarks] = useState<PostWithDetails[]>([])
  const [followers, setFollowers] = useState<{id: string, username: string, email?: string}[]>([])
  const [following, setFollowing] = useState<{id: string, username: string, email?: string}[]>([])
  const [loading, setLoading] = useState(true)

  const targetUserId = userId || session?.user?.id

  useEffect(() => {
    if (targetUserId) {
      fetchData()
    }
  }, [targetUserId, activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      let response
      switch (activeTab) {
        case 'posts':
          response = await fetch(`/api/users/${targetUserId}/posts`)
          if (response.ok) {
            const data = await response.json()
            setPosts(data)
          }
          break
        case 'bookmarks':
          response = await fetch(`/api/users/${targetUserId}/favorites`)
          if (response.ok) {
            const data = await response.json()
            setBookmarks(data)
          }
          break
        case 'followers':
          response = await fetch(`/api/users/${targetUserId}/followers`)
          if (response.ok) {
            const data = await response.json()
            setFollowers(data)
          }
          break
        case 'following':
          response = await fetch(`/api/users/${targetUserId}/following`)
          if (response.ok) {
            const data = await response.json()
            setFollowing(data)
          }
          break
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'posts', label: '投稿', count: posts.length },
    { id: 'bookmarks', label: 'ブックマーク', count: bookmarks.length },
    { id: 'followers', label: 'フォロワー', count: followers.length },
    { id: 'following', label: 'フォロー中', count: following.length }
  ]

  if (loading && activeTab === 'posts') {
    return (
      <div className={styles.container}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <div key={tab.id} className={styles.tab}>
              <span className={styles.tabLabel}>{tab.label}</span>
              <span className={styles.tabCount}>(0)</span>
            </div>
          ))}
        </div>
        <div className={styles.content}>
          <div className={styles.loading}>読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id as 'posts' | 'bookmarks' | 'followers' | 'following')}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
            <span className={styles.tabCount}>({tab.count})</span>
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>読み込み中...</div>
        ) : (
          <>
            {activeTab === 'posts' && (
              <div className={styles.postsGrid}>
                {posts.length === 0 ? (
                  <div className={styles.empty}>
                    <p>まだ投稿がありません</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className={styles.postItem}>
                      <PostCard post={post} />
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className={styles.postsGrid}>
                {bookmarks.length === 0 ? (
                  <div className={styles.empty}>
                    <p>ブックマークがありません</p>
                  </div>
                ) : (
                  bookmarks.map((post) => (
                    <div key={post.id} className={styles.postItem}>
                      <PostCard post={post} />
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'followers' && (
              <div className={styles.usersGrid}>
                {followers.length === 0 ? (
                  <div className={styles.empty}>
                    <p>フォロワーがいません</p>
                  </div>
                ) : (
                  followers.map((user) => (
                    <div key={user.id} className={styles.userCard}>
                      <div className={styles.userHeader}>
                        <div className={styles.userAvatar}>
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{user.username}</div>
                          <div className={styles.userHandle}>@{user.username}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'following' && (
              <div className={styles.usersGrid}>
                {following.length === 0 ? (
                  <div className={styles.empty}>
                    <p>フォロー中のユーザーがいません</p>
                  </div>
                ) : (
                  following.map((user) => (
                    <div key={user.id} className={styles.userCard}>
                      <div className={styles.userHeader}>
                        <div className={styles.userAvatar}>
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{user.username}</div>
                          <div className={styles.userHandle}>@{user.username}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}