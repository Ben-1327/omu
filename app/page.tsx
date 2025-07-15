import PopularSection from '@/components/home/PopularSection'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          omu
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          生成AI情報共有プラットフォーム
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <PopularSection title="全体人気" type="all" />
        <PopularSection title="記事人気" type="article" />
        <PopularSection title="プロンプト人気" type="prompt" />
        <PopularSection title="会話人気" type="conversation" />
      </div>
    </div>
  )
}
