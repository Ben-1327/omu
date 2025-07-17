'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import ProfileSidebar from '@/components/profile/ProfileSidebar'
import ProfileTabs from '@/components/profile/ProfileTabs'
import styles from './profile.module.css'

export default function ProfilePage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* 左サイドバー */}
        <aside className={styles.sidebar}>
          <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <ProfileSidebar />
          </Suspense>
        </aside>

        {/* 中央メインコンテンツ */}
        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>プロフィール</h1>
            <p className={styles.subtitle}>あなたの投稿とアクティビティ</p>
          </div>

          <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <ProfileTabs />
          </Suspense>
        </main>
      </div>
    </div>
  )
}