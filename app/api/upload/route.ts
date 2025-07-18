import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImage, validateImageFile } from '@/lib/image-upload'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // FormDataを解析
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const maxWidth = formData.get('maxWidth') as string
    const maxHeight = formData.get('maxHeight') as string
    const quality = formData.get('quality') as string
    const format = formData.get('format') as string

    // 必須パラメータの検証
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    if (!bucket || !['profile-images', 'post-images'].includes(bucket)) {
      return NextResponse.json(
        { error: '無効なバケットです' },
        { status: 400 }
      )
    }

    // ファイルバリデーション
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // アップロードオプション設定
    const options = {
      bucket: bucket as 'profile-images' | 'post-images',
      userId: session.user.id,
      maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
      maxHeight: maxHeight ? parseInt(maxHeight) : undefined,
      quality: quality ? parseFloat(quality) : undefined,
      format: format as 'webp' | 'jpeg' | 'png' | undefined
    }

    // アップロード実行
    const result = await uploadImage(file, options)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'アップロード中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // URLパラメータを解析
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const bucket = searchParams.get('bucket')

    if (!path || !bucket) {
      return NextResponse.json(
        { error: 'パスとバケットが必要です' },
        { status: 400 }
      )
    }

    // バケットの検証
    if (!['profile-images', 'post-images'].includes(bucket)) {
      return NextResponse.json(
        { error: '無効なバケットです' },
        { status: 400 }
      )
    }

    // パスから所有者を確認（セキュリティ）
    const pathParts = path.split('/')
    const fileOwner = pathParts[0]
    
    if (fileOwner !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    // 削除実行
    const { deleteFromSupabase } = await import('@/lib/image-upload')
    const result = await deleteFromSupabase(path, bucket)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '画像が削除されました'
    })

  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: '削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}