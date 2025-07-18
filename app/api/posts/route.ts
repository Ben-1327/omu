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
    console.log('認証エラー: セッションが存在しません')
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, title, content, description, platform, link, tags } = body

    console.log('API受信データ:', { type, title, content, description, platform, link, tags })

    // バリデーション
    if (!type || !title) {
      console.log('バリデーションエラー: 必須項目が不足', { type, title })
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    // 記事とプロンプト投稿の場合はcontentも必須
    if ((type === 'article' || type === 'prompt') && !content) {
      console.log('バリデーションエラー: 本文が必要', { type, content })
      return NextResponse.json({ error: '本文が必要です' }, { status: 400 })
    }

    // プロンプト投稿の場合は説明文も必須
    if (type === 'prompt' && !description) {
      console.log('バリデーションエラー: プロンプト投稿に説明文が必要', { type, description })
      return NextResponse.json({ error: 'プロンプト投稿には説明文が必要です' }, { status: 400 })
    }

    // 会話投稿の場合は説明文も必須
    if (type === 'conversation' && !description) {
      console.log('バリデーションエラー: 会話投稿に説明文が必要', { type, description })
      return NextResponse.json({ error: '会話投稿には説明文が必要です' }, { status: 400 })
    }

    // トランザクション処理
    console.log('トランザクション開始')
    const post = await prisma.$transaction(async (prisma) => {
      // 投稿作成
      const postData = {
        userId: session.user.id,
        type,
        title,
        content: type === 'conversation' ? null : content,
        description: type === 'prompt' || type === 'conversation' ? description : null,
        platform: type === 'conversation' ? platform : null,
        link: type === 'conversation' ? link : null,
      }
      
      console.log('投稿データ作成:', postData)
      
      const newPost = await prisma.post.create({
        data: postData,
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

      // タグ処理
      console.log('タグ処理開始:', tags)
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          if (tagName && tagName.trim()) {
            console.log('タグを処理中:', tagName)
            // タグを取得または作成
            const tag = await prisma.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName }
            })

            console.log('タグ作成成功:', tag)

            // 投稿とタグを関連付け
            await prisma.postTag.create({
              data: {
                postId: newPost.id,
                tagId: tag.id
              }
            })
            console.log('タグ関連付け成功')
          }
        }
      }

      return newPost
    })

    console.log('投稿作成成功:', post)
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('投稿作成エラー:', error)
    console.error('エラーの詳細:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ error: '投稿の作成に失敗しました' }, { status: 500 })
  }
}