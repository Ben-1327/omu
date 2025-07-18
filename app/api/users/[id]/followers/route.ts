import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const followers = await prisma.follow.findMany({
      where: { followedId: resolvedParams.id },
      include: {
        follower: {
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

    return NextResponse.json(followers.map(f => f.follower))
  } catch (error) {
    console.error('フォロワー取得エラー:', error)
    return NextResponse.json({ error: 'フォロワーの取得に失敗しました' }, { status: 500 })
  }
}