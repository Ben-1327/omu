import HorizontalSlider from '@/components/home/HorizontalSlider'
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

      <div className={styles.content}>
        {/* 横スライダーセクション */}
        <div className={styles.sliderSection}>
          <HorizontalSlider title="🔥 人気の投稿" type="all" limit={10} />
          <HorizontalSlider title="📚 人気の記事" type="article" limit={8} />
          <HorizontalSlider title="⚡ 人気のプロンプト" type="prompt" limit={8} />
          <HorizontalSlider title="💬 人気の会話" type="conversation" limit={8} />
        </div>

        {/* 従来のグリッドセクション（サマリー用） */}
        <div className={styles.gridSection}>
          <h2 className={styles.sectionTitle}>カテゴリー別サマリー</h2>
          <div className={styles.grid}>
            <PopularSection title="全体人気" type="all" />
            <PopularSection title="記事人気" type="article" />
            <PopularSection title="プロンプト人気" type="prompt" />
            <PopularSection title="会話人気" type="conversation" />
          </div>
        </div>
      </div>
    </div>
  )
}
