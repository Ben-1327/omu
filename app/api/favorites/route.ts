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

    // 既存のお気に入りをチェック
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: parseInt(postId)
        }
      }
    })

    if (existingFavorite) {
      // お気に入りを削除（取り消し）
      await prisma.favorite.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: parseInt(postId)
          }
        }
      })
      return NextResponse.json({ favorited: false })
    } else {
      // お気に入りを追加
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          postId: parseInt(postId)
        }
      })
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error('お気に入りエラー:', error)
    return NextResponse.json({ error: 'お気に入りの処理に失敗しました' }, { status: 500 })
  }
}