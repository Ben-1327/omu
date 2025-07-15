import PopularSection from '@/components/home/PopularSection'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          omu
        </h1>
        <p className={styles.subtitle}>
          生成AI情報共有プラットフォーム
        </p>
      </div>

      <div className={styles.grid}>
        <PopularSection title="全体人気" type="all" />
        <PopularSection title="記事人気" type="article" />
        <PopularSection title="プロンプト人気" type="prompt" />
        <PopularSection title="会話人気" type="conversation" />
      </div>
    </div>
  )
}
