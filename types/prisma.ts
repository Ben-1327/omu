// Prisma型定義
export type PostType = 'article' | 'prompt' | 'conversation'
export type UserRole = 'user' | 'premium' | 'admin'
export type PostVisibility = 'public' | 'private' | 'draft' | 'followers_only'

export interface User {
  id: string
  username: string
  userId: string
  email: string
  emailVerified?: Date | null
  image?: string | null
  profileImageUrl?: string | null
  passwordHash?: string | null
  isAdmin: boolean
  role: UserRole
  adFree: boolean
  bio?: string | null
  website?: string | null
  xLink?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: number
  userId: string
  type: PostType
  title: string
  content?: string | null
  description?: string | null
  platform?: string | null
  link?: string | null
  viewCount: number
  likeCount: number
  visibility: PostVisibility
  createdAt: Date
  updatedAt: Date
  user?: User
  postTags?: PostTag[]
  _count?: {
    likes: number
  }
}

export interface Tag {
  id: number
  name: string
  createdAt: Date
  postTags?: PostTag[]
}

export interface PostTag {
  postId: number
  tagId: number
  post?: Post
  tag: Tag
}

export interface Like {
  id: number
  userId: string
  postId: number
  user?: User
  post?: Post
}

export interface Follow {
  id: number
  followerId: string
  followedId: string
  follower?: User
  followed?: User
}

export interface Favorite {
  id: number
  userId: string
  postId: number
  user?: User
  post?: Post
}

// 拡張型定義
export interface PostWithDetails extends Omit<Post, 'postTags'> {
  user: User
  postTags: Array<{
    postId: number
    tagId: number
    tag: Tag
  }>
  _count: {
    likes: number
  }
}

export interface UserWithCounts extends User {
  _count?: {
    posts?: number
    followers?: number
    following?: number
  }
}

export interface TagWithCount extends Tag {
  _count?: {
    postTags?: number
  }
}