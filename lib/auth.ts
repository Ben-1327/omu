import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'
import type { Account, Profile } from 'next-auth'

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
          isAdmin: user.isAdmin,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: Account | null; profile?: Profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string }
          })

          if (!existingUser) {
            // OAuth認証の場合、usernameを生成
            let username = ''
            if (account?.provider === 'google') {
              username = (profile as { name?: string })?.name || user.name || user.email?.split('@')[0] || 'user'
            } else if (account?.provider === 'github') {
              username = (profile as { login?: string })?.login || user.name || user.email?.split('@')[0] || 'user'
            }
            
            // usernameの重複を回避
            let finalUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '')
            let counter = 1
            while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
              finalUsername = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}${counter}`
              counter++
            }

            // ユーザーを作成
            await prisma.user.create({
              data: {
                id: user.id,
                email: user.email as string,
                username: finalUsername,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                isAdmin: false,
              }
            })
          }
        } catch (error) {
          console.error('OAuth user creation error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }: { token: JWT; user?: unknown }) {
      if (user && typeof user === 'object' && user !== null) {
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin
      }
      return token
    },
    async session({ session, token }: { session: Session; token?: JWT }) {
      if (token) {
        (session.user as { id: string; isAdmin: boolean }).id = token.sub as string
        (session.user as { id: string; isAdmin: boolean }).isAdmin = token.isAdmin as boolean
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