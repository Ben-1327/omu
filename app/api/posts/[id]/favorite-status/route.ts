import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ favorited: false })
  }

  try {
    const resolvedParams = await params
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: parseInt(resolvedParams.id)
        }
      }
    })

    return NextResponse.json({ favorited: !!favorite })
  } catch (error) {
    console.error('お気に入り状態確認エラー:', error)
    return NextResponse.json({ favorited: false })
  }
}