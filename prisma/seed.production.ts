import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 本番環境用シードデータの投入を開始します...')

  // 公式ユーザーアカウントの作成
  console.log('👥 公式ユーザーアカウントを作成中...')
  
  const officialPassword = await bcrypt.hash('Taichi1327', 10)
  
  const officialUser = await prisma.user.create({
    data: {
      id: 'official-user-omu',
      username: '【公式】omu',
      userId: 'omu_official',
      email: 'ff.walker1327@gmail.com',
      passwordHash: officialPassword,
      isAdmin: true,
      role: 'admin' as const,
      adFree: true,
      bio: 'omu（オムライス）の公式アカウントです🍳 AI活用とプロンプトエンジニアリングに関する情報を発信しています。皆さまのAI活用をサポートします！',
      website: 'https://omurice.tech',
      xLink: 'https://x.com/taichi_woot',
      image: null,
    },
  })

  console.log('✅ 公式ユーザーアカウントを作成しました')
  console.log('\n🎉 本番環境用シードデータの投入が完了しました！')
  console.log('\n📊 作成されたデータ:')
  console.log(`   👥 公式ユーザー: 1人`)
  console.log('\n🔑 公式アカウントログイン情報:')
  console.log('   📧 Email: ff.walker1327@gmail.com')
  console.log('   🔐 Password: Taichi1327')
  console.log('   👑 権限: 管理者権限')
  console.log('\n🌟 公式アカウントの準備が整いました！')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
