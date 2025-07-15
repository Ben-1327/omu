import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ liked: false })
  }

  try {
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: parseInt(params.id)
        }
      }
    })

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error('いいね状態確認エラー:', error)
    return NextResponse.json({ liked: false })
  }
}