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
    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ error: '投稿IDが必要です' }, { status: 400 })
    }

    // 既存のいいねをチェック
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: parseInt(postId)
        }
      }
    })

    if (existingLike) {
      // いいねを削除（取り消し）
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: parseInt(postId)
          }
        }
      })
      return NextResponse.json({ liked: false })
    } else {
      // いいねを追加
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: parseInt(postId)
        }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('いいねエラー:', error)
    return NextResponse.json({ error: 'いいねの処理に失敗しました' }, { status: 500 })
  }
}