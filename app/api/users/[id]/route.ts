import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const userId = resolvedParams.id

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 })
    }

    // usernameまたはuserIdで検索を試行
    let user = await prisma.user.findUnique({
      where: { username: userId },
      select: {
        id: true,
        username: true,
        userId: true,
        image: true,
        createdAt: true,
        isAdmin: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    })

    // usernameで見つからない場合、userIdで検索
    if (!user) {
      user = await prisma.user.findUnique({
        where: { userId: userId },
        select: {
          id: true,
          username: true,
          userId: true,
          image: true,
          createdAt: true,
          isAdmin: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true
            }
          }
        }
      })
    }

    // それでも見つからない場合、idで検索
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          userId: true,
          image: true,
          createdAt: true,
          isAdmin: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true
            }
          }
        }
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 })
  }
}