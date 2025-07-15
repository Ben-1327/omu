import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }

  try {
    const resolvedParams = await params
    const userId = resolvedParams.id

    // 自分自身の削除を防ぐ
    if (userId === session.user.id) {
      return NextResponse.json({ error: '自分自身を削除することはできません' }, { status: 400 })
    }

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // 管理者の削除を防ぐ
    if (user.isAdmin) {
      return NextResponse.json({ error: '管理者を削除することはできません' }, { status: 400 })
    }

    // ユーザーを削除（カスケード削除で関連データも削除される）
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: 'ユーザーを削除しました' })
  } catch (error) {
    console.error('ユーザー削除エラー:', error)
    return NextResponse.json({ error: 'ユーザーの削除に失敗しました' }, { status: 500 })
  }
}