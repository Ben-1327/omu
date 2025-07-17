'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TagRankingItem {
  rank: number;
  id: number;
  name: string;
  postCount: number;
}

interface TagRankingSectionProps {
  period?: 'all' | 'week' | 'month';
  limit?: number;
}

export default function TagRankingSection({ 
  period = 'all', 
  limit = 10 
}: TagRankingSectionProps) {
  const [rankings, setRankings] = useState<TagRankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tags/ranking?period=${period}&limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tag rankings');
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
  }, [period, limit]);

  if (loading) {
    return (
      <div className="border-l-2 border-gray-200 pl-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-900">人気タグ</h2>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-l-2 border-gray-200 pl-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-900">人気タグ</h2>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-900">人気タグ</h2>
      <div className="space-y-2">
        {rankings.map((tag) => (
          <Link
            key={tag.id}
            href={`/search?tag=${encodeURIComponent(tag.name)}`}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-500 w-4 text-center">
                {tag.rank}
              </span>
              <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
                #{tag.name}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {tag.postCount}件
            </span>
          </Link>
        ))}
      </div>
      {rankings.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-4">
          タグが見つかりません
        </div>
      )}
    </div>
  );
}