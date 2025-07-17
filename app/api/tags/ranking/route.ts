import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = searchParams.get('period') || 'all'; // all, week, month

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

    const tagRanking = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            postTags: {
              where: {
                post: dateFilter
              }
            }
          }
        }
      },
      orderBy: {
        postTags: {
          _count: 'desc'
        }
      },
      take: limit
    });

    const result = tagRanking.map((tag, index) => ({
      rank: index + 1,
      id: tag.id,
      name: tag.name,
      postCount: tag._count.postTags
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tag ranking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}