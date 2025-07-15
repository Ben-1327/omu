import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // バリデーション
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

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        username,
        name: username,
        email,
        passwordHash: hashedPassword,
        isAdmin: false
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        isAdmin: true
      }
    })

    return NextResponse.json({ 
      message: 'ユーザー登録が完了しました',
      user 
    }, { status: 201 })
  } catch (error) {
    console.error('ユーザー登録エラー:', error)
    return NextResponse.json({ error: 'ユーザー登録に失敗しました' }, { status: 500 })
  }
}