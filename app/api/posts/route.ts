import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const sort = searchParams.get('sort') || 'new'
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const posts = await prisma.post.findMany({
      where: type ? { type: type as 'article' | 'prompt' | 'conversation' } : undefined,
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
      orderBy: sort === 'popular' 
        ? { likes: { _count: 'desc' } }
        : { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('投稿取得エラー:', error)
    return NextResponse.json({ error: '投稿の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, title, content, description, platform, tags } = body

    // バリデーション
    if (!type || !title || !content) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    // プロンプト投稿の場合は説明文も必須
    if (type === 'prompt' && !description) {
      return NextResponse.json({ error: 'プロンプト投稿には説明文が必要です' }, { status: 400 })
    }

    if (type === 'conversation' && !platform) {
      return NextResponse.json({ error: '会話投稿にはプラットフォームの選択が必要です' }, { status: 400 })
    }

    // トランザクション処理
    const post = await prisma.$transaction(async (prisma) => {
      // 投稿作成
      const newPost = await prisma.post.create({
        data: {
          userId: session.user.id,
          type,
          title,
          content,
          description: type === 'prompt' ? description : null,
          platform: type === 'conversation' ? platform : null,
        },
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
      })

      // タグ処理
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // タグを取得または作成
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
          })

          // 投稿とタグを関連付け
          await prisma.postTag.create({
            data: {
              postId: newPost.id,
              tagId: tag.id
            }
          })
        }
      }

      return newPost
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('投稿作成エラー:', error)
    return NextResponse.json({ error: '投稿の作成に失敗しました' }, { status: 500 })
  }
}