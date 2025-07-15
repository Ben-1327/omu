import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const posts = await prisma.post.findMany({
      where: { userId: params.id },
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
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('ユーザー投稿取得エラー:', error)
    return NextResponse.json({ error: '投稿の取得に失敗しました' }, { status: 500 })
  }
}