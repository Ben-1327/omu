import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'
import type { Account, Profile, User } from 'next-auth'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        if (!user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          userId: user.userId,
          isAdmin: user.isAdmin,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, request }: { user: User; account: Account | null; profile?: Profile; request?: any }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string }
          })

          // リクエストからisSignUpパラメータを取得（より厳密な判定）
          const url = request?.url || ''
          const urlParams = new URLSearchParams(url.split('?')[1] || '')
          const callbackUrl = urlParams.get('callbackUrl') || ''
          const isSignUp = url.includes('isSignUp=true') || callbackUrl.includes('isSignUp=true') || url.includes('/auth/signup')

          if (!existingUser) {
            // サインアップページからの認証の場合のみ新規ユーザーを作成
            if (isSignUp) {
              // OAuth認証の場合、usernameを生成
              let username = ''
              if (account?.provider === 'google') {
                username = (profile as { name?: string })?.name || user.name || user.email?.split('@')[0] || 'user'
              } else if (account?.provider === 'github') {
                username = (profile as { login?: string })?.login || user.name || user.email?.split('@')[0] || 'user'
              }
              
              // usernameの重複を回避
              const baseUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'
              let finalUsername = baseUsername
              let counter = 1
              while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
                finalUsername = `${baseUsername}${counter}`
                counter++
              }

              // userIdの重複を回避（usernameと同じ値を使用）
              let finalUserId = finalUsername
              let userIdCounter = 1
              while (await prisma.user.findUnique({ where: { userId: finalUserId } })) {
                finalUserId = `${finalUsername}${userIdCounter}`
                userIdCounter++
              }

              // ユーザーを作成
              await prisma.user.create({
                data: {
                  id: user.id,
                  email: user.email as string,
                  username: finalUsername,
                  userId: finalUserId,
                  image: user.image,
                  emailVerified: new Date(),
                  isAdmin: false,
                }
              })
              
              console.log(`New user created: ${finalUsername} (${user.email})`)
            } else {
              // ログインページからの認証でアカウントが存在しない場合はエラー
              console.log(`Account not found for login: ${user.email}`)
              return '/auth/signin?error=AccountNotFound'
            }
          } else {
            console.log(`Existing user logged in: ${existingUser.username} (${user.email})`)
          }
        } catch (error) {
          console.error('OAuth authentication error:', error)
          if (error instanceof Error && error.message === 'ACCOUNT_NOT_FOUND') {
            return '/auth/signin?error=AccountNotFound'
          }
          return false
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // サインアップ成功後は必ずプロフィールページへ
      if (url.includes('isSignUp=true') || url.includes('redirect=/profile')) {
        return `${baseUrl}/profile`
      }
      // 相対パスの場合はbaseUrlを付加
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // 同じドメインの場合はそのまま
      if (new URL(url).origin === baseUrl) {
        return url
      }
      // それ以外はbaseUrlを返す
      return baseUrl
    },
    async jwt({ token, user }: { token: JWT; user?: unknown }) {
      if (user && typeof user === 'object' && user !== null) {
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin
        token.userId = (user as { userId?: string }).userId
      }
      
      // OAuth認証の場合、DBからユーザー情報を取得
      if (token.sub && !token.userId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { userId: true, isAdmin: true }
          })
          if (dbUser) {
            token.userId = dbUser.userId
            token.isAdmin = dbUser.isAdmin
          }
        } catch (error) {
          console.error('Error fetching user data in JWT callback:', error)
        }
      }
      
      return token
    },
    async session({ session, token }: { session: Session; token?: JWT }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub as string,
          isAdmin: token.isAdmin as boolean,
          userId: token.userId as string
        } as Session['user'] & { id: string; isAdmin: boolean; userId: string }
      }
      return session
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
}

export default NextAuth(authOptions)