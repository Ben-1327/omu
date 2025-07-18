import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const following = await prisma.follow.findMany({
      where: { followerId: resolvedParams.id },
      include: {
        followed: {
          select: {
            id: true,
            username: true,
            userId: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    return NextResponse.json(following.map(f => f.followed))
  } catch (error) {
    console.error('フォロイング取得エラー:', error)
    return NextResponse.json({ error: 'フォロイングの取得に失敗しました' }, { status: 500 })
  }
}