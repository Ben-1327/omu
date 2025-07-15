'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import styles from './admin.module.css'

interface User {
  id: number
  username: string
  email: string
  isAdmin: boolean
  createdAt: string
}

interface Post {
  id: number
  title: string
  type: string
  user: {
    username: string
  }
  createdAt: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin')
    }
    
    if (status === 'authenticated' && !session?.user?.isAdmin) {
      redirect('/')
    }
  }, [session, status])

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [usersResponse, postsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/posts')
      ])

      if (usersResponse.ok && postsResponse.ok) {
        const usersData = await usersResponse.json()
        const postsData = await postsResponse.json()
        setUsers(usersData)
        setPosts(postsData)
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm('本当にこのユーザーを削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
      }
    } catch (error) {
      console.error('ユーザー削除エラー:', error)
    }
  }

  const deletePost = async (postId: number) => {
    if (!confirm('本当にこの投稿を削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('投稿削除エラー:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>管理者ダッシュボード</h1>

      <div className={styles.tabContainer}>
        <div className={styles.tabList}>
          <button
            onClick={() => setActiveTab('users')}
            className={`${styles.tab} ${
              activeTab === 'users' ? styles.tabActive : styles.tabInactive
            }`}
          >
            ユーザー管理
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`${styles.tab} ${
              activeTab === 'posts' ? styles.tabActive : styles.tabInactive
            }`}
          >
            投稿管理
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>ユーザー一覧</h2>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>ID</th>
                  <th className={styles.tableHeaderCell}>ユーザー名</th>
                  <th className={styles.tableHeaderCell}>メールアドレス</th>
                  <th className={styles.tableHeaderCell}>管理者</th>
                  <th className={styles.tableHeaderCell}>登録日</th>
                  <th className={styles.tableHeaderCell}>操作</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {users.map((user) => (
                  <tr key={user.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{user.id}</td>
                    <td className={styles.tableCell}>{user.username}</td>
                    <td className={styles.tableCell}>{user.email}</td>
                    <td className={styles.tableCell}>
                      {user.isAdmin ? '管理者' : '一般'}
                    </td>
                    <td className={styles.tableCell}>
                      {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className={styles.tableCell}>
                      {!user.isAdmin && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className={styles.deleteButton}
                        >
                          削除
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>投稿一覧</h2>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>ID</th>
                  <th className={styles.tableHeaderCell}>タイトル</th>
                  <th className={styles.tableHeaderCell}>タイプ</th>
                  <th className={styles.tableHeaderCell}>投稿者</th>
                  <th className={styles.tableHeaderCell}>投稿日</th>
                  <th className={styles.tableHeaderCell}>操作</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {posts.map((post) => (
                  <tr key={post.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{post.id}</td>
                    <td className={styles.tableCell}>{post.title}</td>
                    <td className={styles.tableCell}>{post.type}</td>
                    <td className={styles.tableCell}>{post.user.username}</td>
                    <td className={styles.tableCell}>
                      {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className={styles.tableCell}>
                      <button
                        onClick={() => deletePost(post.id)}
                        className={styles.deleteButton}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}