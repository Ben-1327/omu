export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              omu
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              生成AI情報共有プラットフォーム
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              機能
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>記事投稿</li>
              <li>プロンプト共有</li>
              <li>会話共有</li>
              <li>検索・フィルター</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              リンク
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="/terms" className="hover:text-gray-900 dark:hover:text-white">
                  利用規約
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-gray-900 dark:hover:text-white">
                  プライバシーポリシー
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2024 omu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}