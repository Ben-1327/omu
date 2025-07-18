import { supabase } from '../lib/supabase'

/**
 * Supabaseストレージの初期設定を行うスクリプト
 * バケットの作成とポリシーの設定を自動化
 */

async function createBucket(bucketName: string, isPublic: boolean = true) {
  console.log(`Creating bucket: ${bucketName}`)
  
  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: isPublic,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880, // 5MB
  })
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log(`✅ Bucket '${bucketName}' already exists`)
      return true
    }
    console.error(`❌ Error creating bucket '${bucketName}':`, error)
    return false
  }
  
  console.log(`✅ Successfully created bucket '${bucketName}'`)
  return true
}

async function setupStoragePolicies() {
  console.log('Setting up storage policies...')
  
  const policies = [
    {
      name: 'Users can upload their own profile images',
      query: `
        CREATE POLICY "Users can upload their own profile images" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'profile-images' 
            AND auth.role() = 'authenticated'
            AND (storage.foldername(name))[1] = auth.uid()::text
          );
      `
    },
    {
      name: 'Anyone can view profile images',
      query: `
        CREATE POLICY "Anyone can view profile images" ON storage.objects
          FOR SELECT USING (bucket_id = 'profile-images');
      `
    },
    {
      name: 'Users can update their own profile images',
      query: `
        CREATE POLICY "Users can update their own profile images" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'profile-images'
            AND auth.role() = 'authenticated'
            AND (storage.foldername(name))[1] = auth.uid()::text
          );
      `
    },
    {
      name: 'Users can delete their own profile images',
      query: `
        CREATE POLICY "Users can delete their own profile images" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'profile-images'
            AND auth.role() = 'authenticated'
            AND (storage.foldername(name))[1] = auth.uid()::text
          );
      `
    },
    {
      name: 'Authenticated users can upload post images',
      query: `
        CREATE POLICY "Authenticated users can upload post images" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'post-images'
            AND auth.role() = 'authenticated'
          );
      `
    },
    {
      name: 'Anyone can view post images',
      query: `
        CREATE POLICY "Anyone can view post images" ON storage.objects
          FOR SELECT USING (bucket_id = 'post-images');
      `
    },
    {
      name: 'Users can update their own post images',
      query: `
        CREATE POLICY "Users can update their own post images" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'post-images'
            AND auth.role() = 'authenticated'
            AND (storage.foldername(name))[1] = auth.uid()::text
          );
      `
    },
    {
      name: 'Users can delete their own post images',
      query: `
        CREATE POLICY "Users can delete their own post images" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'post-images'
            AND auth.role() = 'authenticated'
            AND (storage.foldername(name))[1] = auth.uid()::text
          );
      `
    }
  ]
  
  console.log('⚠️  Note: Storage policies need to be created via Supabase dashboard or SQL editor')
  console.log('Copy and paste the following SQL queries into your Supabase SQL editor:')
  console.log('\n' + '='.repeat(60))
  
  for (const policy of policies) {
    console.log(`\n-- ${policy.name}`)
    console.log(policy.query.trim())
  }
  
  console.log('\n' + '='.repeat(60))
}

async function setupStorage() {
  console.log('🚀 Starting Supabase Storage setup...\n')
  
  try {
    // 1. 接続テスト
    console.log('1. Testing connection...')
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Connection failed:', error)
      console.log('\n🔧 Please check:')
      console.log('   - NEXT_PUBLIC_SUPABASE_URL is set correctly')
      console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY is set correctly')
      console.log('   - Your Supabase project is active')
      return
    }
    
    console.log('✅ Connection successful\n')
    
    // 2. バケットの作成
    console.log('2. Creating storage buckets...')
    const bucketsToCreate = [
      { name: 'profile-images', public: true },
      { name: 'post-images', public: true }
    ]
    
    for (const bucket of bucketsToCreate) {
      await createBucket(bucket.name, bucket.public)
    }
    
    console.log('\n3. Storage policies setup:')
    await setupStoragePolicies()
    
    console.log('\n✅ Storage setup completed!')
    console.log('\n📝 Next steps:')
    console.log('   1. Copy the SQL policies above to your Supabase SQL editor')
    console.log('   2. Execute them to set up proper access controls')
    console.log('   3. Test image upload functionality in your application')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// スクリプトの実行
if (require.main === module) {
  setupStorage()
}

export { setupStorage, createBucket } 