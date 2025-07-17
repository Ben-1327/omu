import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = searchParams.get('period') || 'all'; // all, week, month
    const type = searchParams.get('type') || 'posts'; // posts, likes, followers

    let dateFilter = {};
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { gte: monthAgo } };
    }

    let orderBy = {};
    let countField = '';

    switch (type) {
      case 'posts':
        orderBy = { posts: { _count: 'desc' } };
        countField = 'posts';
        break;
      case 'likes':
        orderBy = { posts: { _count: 'desc' } }; // We'll calculate total likes separately
        countField = 'likes';
        break;
      case 'followers':
        orderBy = { followers: { _count: 'desc' } };
        countField = 'followers';
        break;
      default:
        orderBy = { posts: { _count: 'desc' } };
        countField = 'posts';
    }

    if (type === 'likes') {
      // Special handling for likes ranking
      const userLikes = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          image: true,
          posts: {
            select: {
              _count: {
                select: {
                  likes: true
                }
              }
            },
            where: dateFilter
          }
        }
      });

      const result = userLikes
        .map(user => ({
          id: user.id,
          username: user.username,
          image: user.image,
          totalLikes: user.posts.reduce((sum, post) => sum + post._count.likes, 0)
        }))
        .sort((a, b) => b.totalLikes - a.totalLikes)
        .slice(0, limit)
        .map((user, index) => ({
          rank: index + 1,
          id: user.id,
          username: user.username,
          image: user.image,
          count: user.totalLikes
        }));

      return NextResponse.json(result);
    } else {
      // Regular ranking for posts and followers
      const userRanking = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          image: true,
          _count: {
            select: {
              posts: type === 'posts' ? { where: dateFilter } : undefined,
              followers: type === 'followers' ? true : undefined
            }
          }
        },
        orderBy,
        take: limit
      });

      const result = userRanking.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        username: user.username,
        image: user.image,
        count: type === 'posts' ? user._count.posts : user._count.followers
      }));

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error fetching user ranking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}