import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// デバッグ用ログ（開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// デバッグ用関数: バケット一覧の取得
export async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets()
  if (error) {
    console.error('Error listing buckets:', error)
    return null
  }
  console.log('Available buckets:', data)
  return data
}

// デバッグ用関数: バケットの存在確認
export async function checkBucketExists(bucketName: string) {
  const { data, error } = await supabase.storage.getBucket(bucketName)
  if (error) {
    console.error(`Bucket '${bucketName}' not found:`, error)
    return false
  }
  console.log(`Bucket '${bucketName}' exists:`, data)
  return true
}

// デバッグ用関数: ストレージ接続テスト
export async function testStorageConnection() {
  try {
    console.log('Testing Supabase Storage connection...')
    
    // バケット一覧を取得してテスト
    const buckets = await listBuckets()
    
    if (buckets) {
      console.log('✅ Storage connection successful')
      console.log('Available buckets:', buckets.map(b => b.name))
      
      // 必要なバケットの存在確認
      const requiredBuckets = ['profile-images', 'post-images']
      for (const bucketName of requiredBuckets) {
        const exists = await checkBucketExists(bucketName)
        if (!exists) {
          console.warn(`⚠️  Required bucket '${bucketName}' not found`)
        } else {
          console.log(`✅ Bucket '${bucketName}' is ready`)
        }
      }
    } else {
      console.error('❌ Storage connection failed')
    }
    
    return !!buckets
  } catch (error) {
    console.error('❌ Storage connection test failed:', error)
    return false
  }
}

// 画像アップロード関数
export async function uploadImage(
  file: File, 
  bucket: 'profile-images' | 'post-images', 
  userId: string
) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)
    
    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    return { 
      success: true, 
      url: urlData.publicUrl,
      path: fileName 
    }
  } catch (error) {
    console.error('Upload function error:', error)
    return { success: false, error: 'アップロードに失敗しました' }
  }
}

// 画像削除関数
export async function deleteImage(
  bucket: 'profile-images' | 'post-images',
  filePath: string
) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])
    
    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Delete function error:', error)
    return { success: false, error: '削除に失敗しました' }
  }
}