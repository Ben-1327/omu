# Supabaseストレージ設定ガイド

## 1. 環境変数の設定

以下の環境変数を `.env.local` ファイルに設定してください：

```bash
# Supabase設定（必須）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 環境変数の取得方法

1. [Supabaseダッシュボード](https://supabase.com/dashboard)にログイン
2. プロジェクトを選択
3. Settings > API に移動
4. 以下の値をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** の **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. ストレージバケットの作成

### 2.1 ダッシュボードでの作成

1. Supabaseダッシュボードの **Storage** に移動
2. **New Bucket** をクリック
3. 以下のバケットを作成：
   - `profile-images` (プロフィール画像用)
   - `post-images` (投稿画像用)

### 2.2 SQLでの作成（オプション）

```sql
-- バケットの作成
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile-images', 'profile-images', true),
  ('post-images', 'post-images', true);
```

## 3. ストレージポリシーの設定

バケットへのアクセス権限を設定します。

### 3.1 ダッシュボードでの設定

1. Storage > **Configuration** > **Policies**
2. **Add new policy** をクリック
3. 各バケットに対して以下のポリシーを追加

### 3.2 SQLポリシー（推奨）

```sql
-- プロフィール画像: 認証ユーザーのみアップロード可能
CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- プロフィール画像: 誰でも閲覧可能
CREATE POLICY "Anyone can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- プロフィール画像: 自分の画像のみ更新可能
CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- プロフィール画像: 自分の画像のみ削除可能
CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 投稿画像: 認証ユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload post images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
  );

-- 投稿画像: 誰でも閲覧可能
CREATE POLICY "Anyone can view post images" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

-- 投稿画像: 投稿者のみ更新・削除可能
CREATE POLICY "Users can update their own post images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own post images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

## 4. Docker環境での確認

### 4.1 環境変数のチェック

```bash
# Dockerコンテナ内で環境変数を確認
docker exec omu-app env | grep SUPABASE
```

### 4.2 アプリケーションの再起動

```bash
# Dockerコンテナを再起動
docker-compose down
docker-compose up -d
```

## 5. トラブルシューティング

### 5.1 「バケットが見つからない」エラー

- [ ] バケットが正しく作成されているか確認
- [ ] バケット名のスペルミスがないか確認
- [ ] 環境変数が正しく設定されているか確認

### 5.2 「アクセス拒否」エラー

- [ ] ストレージポリシーが設定されているか確認
- [ ] ユーザーが認証されているか確認
- [ ] APIキーが正しいか確認

### 5.3 デバッグ用コード

```typescript
// lib/supabase.ts に追加してデバッグ
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')

// バケット一覧の取得
export async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets()
  if (error) {
    console.error('Error listing buckets:', error)
    return null
  }
  console.log('Available buckets:', data)
  return data
}
```

## 6. セキュリティのベストプラクティス

1. **ファイルサイズ制限**: 大きなファイルのアップロードを防ぐ
2. **ファイル形式制限**: 画像ファイルのみ許可
3. **認証チェック**: アップロード前にユーザー認証を確認
4. **適切なポリシー**: 最小権限の原則に従う

## 7. 本番環境での注意点

- 環境変数を本番用に更新
- CORS設定の確認
- CDN設定の検討
- バックアップ設定 