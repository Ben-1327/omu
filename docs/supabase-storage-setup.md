# Supabase Storage 設定手順

## 前提条件
- Supabaseプロジェクトが作成済み
- データベースの設定が完了している

## 1. Supabase Storageの有効化

### 開発環境（現在のプロジェクト: `nnfwnybihekdmwuwitwy`）

1. Supabaseダッシュボードにアクセス
2. プロジェクト `nnfwnybihekdmwuwitwy` を選択
3. 左サイドメニューから「Storage」を選択
4. 必要なバケットを作成

### 作成するバケット

#### 1. profile-images バケット
```
バケット名: profile-images
説明: ユーザーのプロフィール画像用
パブリック: true
ファイルサイズ制限: 5MB
許可形式: image/jpeg, image/png, image/webp
```

#### 2. post-images バケット
```
バケット名: post-images
説明: 投稿内の画像用
パブリック: true
ファイルサイズ制限: 10MB
許可形式: image/jpeg, image/png, image/webp, image/gif
```

## 2. ストレージ設定（NextAuth.js使用時）

### 重要: NextAuth.jsとSupabase Authの違い

このプロジェクトでは**NextAuth.js**を使用しており、Supabase Authは使用していません。
そのため、Supabase StorageのRLSポリシーで`auth.uid()`を使用することはできません。

### 推奨設定: パブリックバケット + アプリケーションレベル認証

#### 1. バケットをパブリックに設定
- Supabaseダッシュボードで各バケットを「Public」に設定
- RLSポリシーは設定しない
- 代わりにアプリケーションレベル（API）で認証制御

#### 2. セキュリティ考慮事項
- ファイル名にランダムUUIDを使用（推測困難）
- APIレベルでNextAuth.jsセッション認証
- ファイルの所有者チェック
- 適切なファイル形式・サイズ制限

### 代替案: カスタムRLSポリシー（高度）

NextAuth.jsのセッション情報をSupabase RLSで使用する場合：

```sql
-- 注意: この方法は複雑で、実際のプロジェクトでは推奨されません
-- パブリックバケット + アプリケーションレベル認証の方が簡単です

-- 全てのファイルへの読み取り権限
CREATE POLICY "Public read access for all buckets"
ON storage.objects FOR SELECT
USING (true);

-- 認証済みユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (true);

-- 誰でも削除可能（アプリケーションレベルで制御）
CREATE POLICY "Allow delete for all"
ON storage.objects FOR DELETE
USING (true);
```

## 3. 実際のSupabase設定手順

### Step 1: Supabaseダッシュボードでの設定

1. **Supabaseダッシュボード**にアクセス
2. プロジェクト `nnfwnybihekdmwuwitwy` を選択
3. 左サイドメニューから「**Storage**」を選択
4. 「**Create a new bucket**」をクリック

### Step 2: バケット作成

#### profile-images バケット
```
Name: profile-images
Public bucket: ✅ チェック
File size limit: 5MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

#### post-images バケット
```
Name: post-images
Public bucket: ✅ チェック
File size limit: 10MB
Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
```

### Step 3: 環境変数の設定

#### 開発環境用のAPIキー取得
1. Supabaseダッシュボードで「Settings」→「API」を選択
2. 「Project API keys」セクションから`anon public`キーをコピー
3. **既に設定済み**（`.env`ファイルに設定済み）

#### 環境変数の確認
```bash
# 以下が既に設定されているか確認
NEXT_PUBLIC_SUPABASE_URL="https://nnfwnybihekdmwuwitwy.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uZndueWJpaGVrZG13dXdpdHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjEzNTksImV4cCI6MjA2ODM5NzM1OX0.eit67us0Es41J1cKLxkqCPaeuGIYwZ-h1xySBhyo3mM"
```

### Step 4: セキュリティ設定（重要）

#### パブリックバケットの安全な使用
- ✅ ファイル名にランダムUUID使用（推測困難）
- ✅ APIレベルでNextAuth.jsセッション認証
- ✅ アップロード時にファイル形式・サイズ制限
- ✅ 所有者チェック（削除時）

#### RLSポリシーの無効化
- バケットをパブリックに設定することで、RLSポリシーの設定は不要
- 代わりにアプリケーションレベルで認証制御を実装済み

## 4. 注意点

### セキュリティ
- ファイルサイズ制限を適切に設定
- 許可するファイル形式を制限
- RLSポリシーで適切なアクセス制御

### パフォーマンス
- 画像の最適化（WebP形式推奨）
- 適切なファイル名の設定（UUID使用推奨）
- CDN活用（Supabase Storage内蔵）

## 5. 確認方法

Supabaseクライアントから接続テスト：
```typescript
import { supabase } from '@/lib/supabase'

// Storage接続テスト
const { data, error } = await supabase.storage.listBuckets()
console.log('Buckets:', data)
```

## 次のステップ

1. この設定を完了後、アプリケーションコードでStorageを使用
2. 画像アップロード機能の実装
3. 画像表示機能の最適化