import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    isAdmin?: boolean
    userId?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      isAdmin?: boolean
      userId?: string
    }
  }

  interface JWT {
    isAdmin?: boolean
    userId?: string
  }
}