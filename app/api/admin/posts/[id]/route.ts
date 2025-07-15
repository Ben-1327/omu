import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }

  try {
    const postId = parseInt(params.id)

    // 投稿の存在確認
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    // 投稿を削除（カスケード削除で関連データも削除される）
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({ message: '投稿を削除しました' })
  } catch (error) {
    console.error('投稿削除エラー:', error)
    return NextResponse.json({ error: '投稿の削除に失敗しました' }, { status: 500 })
  }
}