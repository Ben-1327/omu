import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const type = searchParams.get('type')
  const tag = searchParams.get('tag')
  const sort = searchParams.get('sort') || 'new'
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const where: {
      OR?: Array<{
        title?: { contains: string };
        content?: { contains: string };
      }>;
      type?: 'article' | 'prompt' | 'conversation';
      postTags?: {
        some: {
          tag: {
            name: string;
          };
        };
      };
    } = {}

    // テキスト検索 (SQLite向け - LIKE演算子を使用してcase-insensitive検索)
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { content: { contains: query } }
      ]
    }

    // 投稿タイプフィルター
    if (type && type !== 'all') {
      where.type = type as 'article' | 'prompt' | 'conversation'
    }

    // タグフィルター
    if (tag) {
      where.postTags = {
        some: {
          tag: {
            name: tag
          }
        }
      }
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          }
        },
        postTags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      },
      orderBy: sort === 'popular' 
        ? { likes: { _count: 'desc' } }
        : { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('検索エラー:', error)
    return NextResponse.json({ error: '検索に失敗しました' }, { status: 500 })
  }
}