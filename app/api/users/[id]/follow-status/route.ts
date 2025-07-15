import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const resolvedParams = await params
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: session.user.id,
          followedId: resolvedParams.id
        }
      }
    })

    return NextResponse.json({ following: !!follow })
  } catch (error) {
    console.error('フォロー状態取得エラー:', error)
    return NextResponse.json({ error: 'フォロー状態の取得に失敗しました' }, { status: 500 })
  }
}