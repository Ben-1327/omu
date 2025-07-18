import { supabase } from './supabase'

export interface ImageUploadOptions {
  bucket: 'profile-images' | 'post-images'
  userId?: string
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

// 画像をリサイズ・最適化する関数
export async function resizeImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    format = 'webp'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // アスペクト比を保持しながらリサイズ
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // 背景を白で塗りつぶし（透明度がある場合）
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // 画像を描画
      ctx.drawImage(img, 0, 0, width, height)

      // Blobとして出力
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        format === 'webp' ? 'image/webp' : 
        format === 'jpeg' ? 'image/jpeg' : 'image/png',
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// ファイルバリデーション
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'サポートされていないファイル形式です。JPEG、PNG、WebP、GIFのみ対応しています。'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。'
    }
  }

  return { valid: true }
}

// 一意のファイル名を生成
export function generateUniqueFileName(originalName: string, userId?: string): string {
  const extension = originalName.split('.').pop()
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const userPrefix = userId ? `${userId}/` : ''
  
  return `${userPrefix}${timestamp}-${randomStr}.${extension}`
}

// Supabase Storageにアップロード
export async function uploadToSupabase(
  file: File | Blob,
  path: string,
  bucket: string
): Promise<ImageUploadResult> {
  try {
    // Supabaseにアップロード
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return {
        success: false,
        error: `アップロードに失敗しました: ${error.message || 'Unknown error'}`
      }
    }

    // パブリックURLを取得
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: path
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'アップロード中にエラーが発生しました。'
    }
  }
}

// 画像削除
export async function deleteFromSupabase(
  path: string,
  bucket: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: `削除に失敗しました: ${error.message}`
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: '削除中にエラーが発生しました。'
    }
  }
}

// メイン画像アップロード関数
export async function uploadImage(
  file: File,
  options: ImageUploadOptions
): Promise<ImageUploadResult> {
  try {
    // バリデーション
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // 画像をリサイズ・最適化
    const optimizedBlob = await resizeImage(file, {
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      quality: options.quality,
      format: options.format
    })

    // ファイル名生成
    const fileName = generateUniqueFileName(file.name, options.userId)

    // Supabase Storageにアップロード
    const result = await uploadToSupabase(optimizedBlob, fileName, options.bucket)

    return result
  } catch (error) {
    console.error('Image upload error:', error)
    return {
      success: false,
      error: '画像のアップロードに失敗しました。'
    }
  }
}

// プロフィール画像専用のアップロード関数
export async function uploadProfileImage(
  file: File,
  userId: string
): Promise<ImageUploadResult> {
  return uploadImage(file, {
    bucket: 'profile-images',
    userId,
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.8,
    format: 'webp'
  })
}

// 投稿画像専用のアップロード関数
export async function uploadPostImage(
  file: File,
  userId: string
): Promise<ImageUploadResult> {
  return uploadImage(file, {
    bucket: 'post-images',
    userId,
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.85,
    format: 'webp'
  })
}