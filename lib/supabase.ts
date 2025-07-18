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