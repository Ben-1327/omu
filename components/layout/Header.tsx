'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              omu
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link 
              href="/posts/new" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              投稿
            </Link>
            <Link 
              href="/search" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              検索
            </Link>
            
            {session ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {session.user.name}
                </Link>
                {session.user.isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    管理者
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => signIn()}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ログイン
                </button>
                <Link 
                  href="/auth/signup" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  新規登録
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}