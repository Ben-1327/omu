'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface UserRankingItem {
  rank: number;
  id: string;
  username: string;
  image: string | null;
  count: number;
}

interface UserRankingSectionProps {
  type?: 'posts' | 'likes' | 'followers';
  period?: 'all' | 'week' | 'month';
  limit?: number;
}

export default function UserRankingSection({ 
  type = 'posts',
  period = 'all', 
  limit = 10 
}: UserRankingSectionProps) {
  const [rankings, setRankings] = useState<UserRankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTitle = () => {
    return 'ユーザーランキング';
  };

  const getCountLabel = () => {
    switch (type) {
      case 'posts': return '投稿';
      case 'likes': return 'いいね';
      case 'followers': return 'フォロワー';
      default: return '';
    }
  };

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/ranking?type=${type}&period=${period}&limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user rankings');
        }
        const data = await response.json();
        setRankings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [type, period, limit]);

  if (loading) {
    return (
      <div className="border-l-2 border-gray-200 pl-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-900">{getTitle()}</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-l-2 border-gray-200 pl-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-900">{getTitle()}</h2>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-900">{getTitle()}</h2>
      <div className="space-y-2">
        {rankings.map((user) => (
          <Link
            key={user.id}
            href={`/users/${user.id}`}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-500 w-4 text-center">
                {user.rank}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.username}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900 hover:text-blue-600">
                  {user.username}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {user.count}{getCountLabel()}
            </span>
          </Link>
        ))}
      </div>
      {rankings.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-4">
          ユーザーが見つかりません
        </div>
      )}
    </div>
  );
}