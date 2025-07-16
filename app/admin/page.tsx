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
  
  // ユーザー作成フォームの状態
  const [createUserForm, setCreateUserForm] = useState({
    username: '',
    email: '',
    password: '',
    isAdmin: false
  })
  const [createUserLoading, setCreateUserLoading] = useState(false)
  const [createUserError, setCreateUserError] = useState('')
  const [createUserSuccess, setCreateUserSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  
  // バリデーション関数（通常の新規登録と同じ要件に合わせる）
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    // ユーザー名のバリデーション
    if (!createUserForm.username.trim()) {
      errors.username = 'ユーザー名は必須です'
    }
    
    // メールアドレスのバリデーション
    if (!createUserForm.email.trim()) {
      errors.email = 'メールアドレスは必須です'
    }
    
    // パスワードのバリデーション（通常の新規登録と同じ6文字以上）
    if (!createUserForm.password) {
      errors.password = 'パスワードは必須です'
    } else if (createUserForm.password.length < 6) {
      errors.password = 'パスワードは6文字以上で入力してください'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

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
    if (!confirm('本当にこのユーザーを削除しますか？関連する投稿も全て削除されます。')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
        setCreateUserSuccess('ユーザーを削除しました')
        
        // 成功メッセージを3秒後に自動消去
        setTimeout(() => {
          setCreateUserSuccess('')
        }, 3000)
      } else {
        setCreateUserError(data.error || 'ユーザーの削除に失敗しました')
      }
    } catch (error) {
      console.error('ユーザー削除エラー:', error)
      setCreateUserError('ユーザーの削除に失敗しました')
    }
  }

  const deletePost = async (postId: number) => {
    if (!confirm('本当にこの投稿を削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
        setCreateUserSuccess('投稿を削除しました')
        
        // 成功メッセージを3秒後に自動消去
        setTimeout(() => {
          setCreateUserSuccess('')
        }, 3000)
      } else {
        setCreateUserError(data.error || '投稿の削除に失敗しました')
      }
    } catch (error) {
      console.error('投稿削除エラー:', error)
      setCreateUserError('投稿の削除に失敗しました')
    }
  }

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // フロントエンドバリデーション
    if (!validateForm()) {
      return
    }
    
    setCreateUserLoading(true)
    setCreateUserError('')
    setCreateUserSuccess('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createUserForm),
      })

      const data = await response.json()

      if (response.ok) {
        setCreateUserSuccess('ユーザーを作成しました')
        setCreateUserForm({
          username: '',
          email: '',
          password: '',
          isAdmin: false
        })
        setFieldErrors({})
        // ユーザーリストを更新
        fetchData()
        
        // 成功メッセージを3秒後に自動消去
        setTimeout(() => {
          setCreateUserSuccess('')
        }, 3000)
      } else {
        setCreateUserError(data.error || 'ユーザーの作成に失敗しました')
      }
    } catch (error) {
      console.error('ユーザー作成エラー:', error)
      setCreateUserError('ユーザーの作成に失敗しました')
    } finally {
      setCreateUserLoading(false)
    }
  }

  const handleCreateUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setCreateUserForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // 個別フィールドのエラーをクリア
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // エラーメッセージをクリア
    if (createUserError) setCreateUserError('')
    if (createUserSuccess) setCreateUserSuccess('')
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
        <>
          {/* ユーザー作成フォーム */}
          <div className={styles.createUserSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>新規ユーザー作成</h2>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <form onSubmit={handleCreateUserSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.label}>
                      ユーザー名 *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={createUserForm.username}
                      onChange={handleCreateUserChange}
                      className={styles.input}
                      required
                      disabled={createUserLoading}
                    />
                    {fieldErrors.username && (
                      <div className={styles.errorMessage}>{fieldErrors.username}</div>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                      メールアドレス *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={createUserForm.email}
                      onChange={handleCreateUserChange}
                      className={styles.input}
                      required
                      disabled={createUserLoading}
                    />
                    {fieldErrors.email && (
                      <div className={styles.errorMessage}>{fieldErrors.email}</div>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.label}>
                      パスワード * (6文字以上)
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={createUserForm.password}
                      onChange={handleCreateUserChange}
                      className={styles.input}
                      required
                      minLength={6}
                      disabled={createUserLoading}
                      placeholder="パスワード（6文字以上）"
                    />
                    {fieldErrors.password && (
                      <div className={styles.errorMessage}>{fieldErrors.password}</div>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <div className={styles.checkboxGroup}>
                      <input
                        type="checkbox"
                        id="isAdmin"
                        name="isAdmin"
                        checked={createUserForm.isAdmin}
                        onChange={handleCreateUserChange}
                        className={styles.checkbox}
                        disabled={createUserLoading}
                      />
                      <label htmlFor="isAdmin" className={styles.label}>
                        管理者権限を付与
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className={styles.createButton}
                    disabled={createUserLoading}
                  >
                    {createUserLoading ? '作成中...' : 'ユーザーを作成'}
                  </button>
                  
                  {createUserError && (
                    <div className={styles.errorMessage}>{createUserError}</div>
                  )}
                  
                  {createUserSuccess && (
                    <div className={styles.successMessage}>{createUserSuccess}</div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* ユーザー一覧 */}
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
        </>
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