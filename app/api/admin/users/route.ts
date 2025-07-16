import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return NextResponse.json({ error: 'ユーザーの取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }

  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: '無効なJSONデータです' }, { status: 400 })
    }
    
    const { username, email, password, isAdmin = false } = body || {}

    // バリデーション（通常の新規登録と同じ要件に合わせる）
    if (!username || !email || !password) {
      return NextResponse.json({ error: '全ての項目を入力してください' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'パスワードは6文字以上で入力してください' }, { status: 400 })
    }

    // ユーザー名の重複チェック
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json({ error: 'このユーザー名は既に使用されています' }, { status: 400 })
    }

    // メールアドレスの重複チェック
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json({ error: 'このメールアドレスは既に使用されています' }, { status: 400 })
    }

    // パスワードハッシュ化（通常の新規登録と同じハッシュ化強度）
    const passwordHash = await bcrypt.hash(password, 10)

    // ユーザーを作成
    const newUser = await prisma.user.create({
      data: {
        username,
        name: username,
        email,
        passwordHash,
        isAdmin: Boolean(isAdmin),
      },
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ 
      message: 'ユーザーを作成しました',
      user: newUser 
    }, { status: 201 })

  } catch (error) {
    console.error('ユーザー作成エラー:', error)
    return NextResponse.json({ error: 'ユーザーの作成に失敗しました' }, { status: 500 })
  }
}