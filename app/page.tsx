import HorizontalSlider from '@/components/home/HorizontalSlider'
import TagCategorySection from '@/components/home/TagCategorySection'
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

        {/* タグ別記事セクション */}
        <div className={styles.categorySection}>
          <TagCategorySection />
        </div>
      </div>
    </div>
  )
}
