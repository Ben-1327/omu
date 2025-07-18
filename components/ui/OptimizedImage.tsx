'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  containerClassName?: string
  showFallback?: boolean
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  className = '',
  containerClassName = '',
  showFallback = true,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleError = () => {
    setError(true)
    setLoading(false)
  }

  const handleLoad = () => {
    setLoading(false)
  }

  const isValidUrl = src.startsWith('http') || src.startsWith('/')

  // 画像URLが無効な場合はフォールバック
  if (!isValidUrl && showFallback) {
    return (
      <div className={`relative ${containerClassName}`}>
        <div className="flex items-center justify-center bg-gray-100 rounded-lg min-h-[200px]">
          <div className="text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">画像が見つかりません</p>
          </div>
        </div>
      </div>
    )
  }

  // エラーまたはフォールバックの場合
  if (error && showFallback) {
    return (
      <div className={`relative ${containerClassName}`}>
        {fallbackSrc ? (
          <Image
            src={fallbackSrc}
            alt={alt}
            className={className}
            onError={handleError}
            onLoad={handleLoad}
            {...props}
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg min-h-[200px]">
            <div className="text-gray-400 text-center">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">画像の読み込みに失敗しました</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
          <div className="text-gray-400">
            <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        {...props}
      />
    </div>
  )
}

// プロフィール画像専用のコンポーネント
export function ProfileImage({
  src,
  alt,
  size = 'md',
  className = '',
  fallbackInitial,
  ...props
}: {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackInitial?: string
} & Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>) {
  const sizes = {
    sm: { width: 32, height: 32, className: 'w-8 h-8' },
    md: { width: 48, height: 48, className: 'w-12 h-12' },
    lg: { width: 64, height: 64, className: 'w-16 h-16' },
    xl: { width: 96, height: 96, className: 'w-24 h-24' }
  }

  const { width, height, className: sizeClassName } = sizes[size]

  // 画像がない場合のフォールバック
  if (!src) {
    return (
      <div className={`${sizeClassName} bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
        <span className="text-sm">
          {fallbackInitial || '?'}
        </span>
      </div>
    )
  }

  return (
    <div className={`${sizeClassName} rounded-full overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-cover"
        containerClassName="w-full h-full"
        showFallback={false}
        {...props}
      />
    </div>
  )
}

// 投稿画像専用のコンポーネント
export function PostImage({
  src,
  alt,
  className = '',
  ...props
}: {
  src: string
  alt: string
  className?: string
} & Omit<ImageProps, 'src' | 'alt'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`rounded-lg shadow-md ${className}`}
      containerClassName="w-full"
      priority={false}
      {...props}
    />
  )
}