import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const { followedId } = await request.json()

    if (!followedId) {
      return NextResponse.json({ error: 'フォロー対象のユーザーIDが必要です' }, { status: 400 })
    }

    if (followedId === session.user.id) {
      return NextResponse.json({ error: '自分自身をフォローすることはできません' }, { status: 400 })
    }

    // フォロー対象のユーザーが存在するかチェック
    const targetUser = await prisma.user.findUnique({
      where: { id: followedId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // 既存のフォロー関係をチェック
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: session.user.id,
          followedId: followedId
        }
      }
    })

    if (existingFollow) {
      // フォロー解除
      await prisma.follow.delete({
        where: {
          followerId_followedId: {
            followerId: session.user.id,
            followedId: followedId
          }
        }
      })
      return NextResponse.json({ following: false })
    } else {
      // フォロー
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followedId: followedId
        }
      })
      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('フォロー処理エラー:', error)
    return NextResponse.json({ error: 'フォロー処理に失敗しました' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 })
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: session.user.id,
          followedId: userId
        }
      }
    })

    return NextResponse.json({ following: !!follow })
  } catch (error) {
    console.error('フォロー状態取得エラー:', error)
    return NextResponse.json({ error: 'フォロー状態の取得に失敗しました' }, { status: 500 })
  }
}