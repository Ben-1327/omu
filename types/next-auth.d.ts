import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    isAdmin?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      isAdmin?: boolean
    }
  }

  interface JWT {
    isAdmin?: boolean
  }
}