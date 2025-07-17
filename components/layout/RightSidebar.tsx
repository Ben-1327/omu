'use client';

export default function RightSidebar() {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 pl-4">
      <div className="sticky top-4 space-y-4">
        {/* スポンサーセクション（将来実装予定） */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">スポンサー</h2>
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm">
              スポンサー広告
              <br />
              <span className="text-xs text-gray-400">準備中</span>
            </p>
          </div>
        </div>

        {/* イベントセクション（将来実装予定） */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">イベント</h2>
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm">
              コミュニティイベント
              <br />
              <span className="text-xs text-gray-400">準備中</span>
            </p>
          </div>
        </div>

        {/* 統計情報セクション（将来実装予定） */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">統計情報</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">総投稿数</span>
              <span className="text-sm font-medium text-gray-400">---</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">総ユーザー数</span>
              <span className="text-sm font-medium text-gray-400">---</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">今日の投稿</span>
              <span className="text-sm font-medium text-gray-400">---</span>
            </div>
            <div className="text-xs text-gray-400 text-center mt-4">
              統計機能は準備中です
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}