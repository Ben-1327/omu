import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const post = await prisma.post.findUnique({
      where: { id: parseInt(resolvedParams.id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            profileImageUrl: true,
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
    })

    if (!post) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('投稿取得エラー:', error)
    return NextResponse.json({ error: '投稿の取得に失敗しました' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const resolvedParams = await params
    const body = await request.json()
    const { title, content, platform, tags } = body

    // 投稿の存在確認と権限チェック
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(resolvedParams.id) },
      include: { user: true }
    })

    if (!existingPost) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    if (existingPost.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: '編集権限がありません' }, { status: 403 })
    }

    // トランザクション処理
    const updatedPost = await prisma.$transaction(async (prisma) => {
      // 投稿更新
      const post = await prisma.post.update({
        where: { id: parseInt(resolvedParams.id) },
        data: {
          title,
          content,
          platform: existingPost.type === 'conversation' ? platform : null,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              image: true,
              profileImageUrl: true,
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
      })

      // 既存のタグ関連付けを削除
      await prisma.postTag.deleteMany({
        where: { postId: parseInt(resolvedParams.id) }
      })

      // 新しいタグ処理
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
          })

          await prisma.postTag.create({
            data: {
              postId: parseInt(resolvedParams.id),
              tagId: tag.id
            }
          })
        }
      }

      return post
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('投稿更新エラー:', error)
    return NextResponse.json({ error: '投稿の更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const resolvedParams = await params
    const post = await prisma.post.findUnique({
      where: { id: parseInt(resolvedParams.id) },
      include: { user: true }
    })

    if (!post) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    if (post.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: '削除権限がありません' }, { status: 403 })
    }

    await prisma.post.delete({
      where: { id: parseInt(resolvedParams.id) }
    })

    return NextResponse.json({ message: '投稿を削除しました' })
  } catch (error) {
    console.error('投稿削除エラー:', error)
    return NextResponse.json({ error: '投稿の削除に失敗しました' }, { status: 500 })
  }
}