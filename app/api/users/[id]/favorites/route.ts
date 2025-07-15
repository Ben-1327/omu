import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const favorites = await prisma.favorite.findMany({
      where: { userId: resolvedParams.id },
      include: {
        post: {
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
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    // お気に入りの投稿データを抽出
    const posts = favorites.map(favorite => favorite.post)

    return NextResponse.json(posts)
  } catch (error) {
    console.error('お気に入り取得エラー:', error)
    return NextResponse.json({ error: 'お気に入りの取得に失敗しました' }, { status: 500 })
  }
}