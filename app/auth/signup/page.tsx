'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './signup.module.css'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    userId: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // パスワード確認
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    // 利用規約・プライバシーポリシーの同意確認
    if (!termsAccepted || !privacyAccepted) {
      setError('利用規約とプライバシーポリシーに同意してください')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          userId: formData.userId,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // 登録成功後、自動ログイン
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.error) {
          console.error('Sign in error:', result.error)
          setError(`登録は完了しましたが、ログインに失敗しました: ${result.error}`)
        } else {
          router.push('/')
        }
      } else {
        console.error('Registration error:', data)
        setError(data.error || '登録に失敗しました')
      }
    } catch {
      setError('登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(true)
    setError('')
    try {
      const result = await signIn(provider, { 
        callbackUrl: '/',
        redirect: false 
      })
      
      if (result?.error) {
        setError(`${provider === 'google' ? 'Google' : 'GitHub'}認証に失敗しました`)
        setLoading(false)
      } else if (result?.ok) {
        // 認証成功時は自動的にリダイレクト
        window.location.href = result.url || '/'
      }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      setError('認証に失敗しました')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.cardWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            omuに新規登録
          </h2>
          <p className={styles.subtitle}>
            既にアカウントをお持ちの方は{' '}
            <Link href="/auth/signin" className={styles.link}>
              ログイン
            </Link>
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.fieldsContainer}>
            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>
                ユーザー名（表示名）
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className={styles.input}
                placeholder="山田太郎"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="userId" className={styles.label}>
                ユーザーID
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                required
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                className={styles.input}
                placeholder="yamada_taro"
              />
              <p className={styles.fieldHint}>
                英数字とアンダースコアのみ使用可能。表示時は@が付きます。
              </p>
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={styles.input}
                placeholder="your@example.com"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={styles.input}
                placeholder="パスワード（6文字以上）"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>
                パスワード確認
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={styles.input}
                placeholder="パスワード（再入力）"
              />
            </div>
          </div>

          <div className={styles.consentSection}>
            <div className={styles.consentItem}>
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="terms" className={styles.checkboxLabel}>
                <Link href="/terms" target="_blank" className={styles.link}>
                  利用規約
                </Link>
                に同意します
              </label>
            </div>

            <div className={styles.consentItem}>
              <input
                id="privacy"
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="privacy" className={styles.checkboxLabel}>
                <Link href="/privacy" target="_blank" className={styles.link}>
                  プライバシーポリシー
                </Link>
                に同意します
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !termsAccepted || !privacyAccepted}
              className={styles.submitButton}
            >
              {loading ? '登録中...' : '新規登録'}
            </button>
          </div>

          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <div className={styles.dividerText}>
              <span>または</span>
            </div>
          </div>

          <div className={styles.oauthButtons}>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className={styles.oauthButton}
            >
              <svg className={styles.oauthIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
              className={styles.oauthButton}
            >
              <svg className={styles.oauthIcon} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}