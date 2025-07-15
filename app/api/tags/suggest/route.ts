import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query.trim()) {
      return NextResponse.json([])
    }

    const tags = await prisma.tag.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        _count: {
          select: {
            postTags: true
          }
        }
      },
      orderBy: {
        postTags: {
          _count: 'desc'
        }
      },
      take: limit
    })

    return NextResponse.json(tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      count: tag._count.postTags
    })))
  } catch (error) {
    console.error('タグサジェスト取得エラー:', error)
    return NextResponse.json({ error: 'タグサジェストの取得に失敗しました' }, { status: 500 })
  }
}