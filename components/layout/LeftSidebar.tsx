'use client';

import { useState } from 'react';
import TagRankingSection from '@/components/ranking/TagRankingSection';
import UserRankingSection from '@/components/ranking/UserRankingSection';

export default function LeftSidebar() {
  const [userRankingPeriod, setUserRankingPeriod] = useState<'week' | 'month'>('week');

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 pr-4">
      <div className="pt-16 space-y-8">
        {/* タグランキング */}
        <TagRankingSection limit={8} />
        
        {/* ユーザーランキング */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">ユーザーランキング</h2>
            <div className="flex space-x-1">
              <button
                onClick={() => setUserRankingPeriod('week')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  userRankingPeriod === 'week'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                週間
              </button>
              <button
                onClick={() => setUserRankingPeriod('month')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  userRankingPeriod === 'month'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                月間
              </button>
            </div>
          </div>
          <UserRankingSection type="likes" period={userRankingPeriod} limit={8} />
        </div>
      </div>
    </aside>
  );
}