'use client'

import { useState, useRef, useCallback } from 'react'
import { uploadImage, ImageUploadOptions, ImageUploadResult } from '@/lib/image-upload'

interface ImageUploadProps {
  onUploadComplete?: (result: ImageUploadResult) => void
  onUploadStart?: () => void
  onError?: (error: string) => void
  options: ImageUploadOptions
  className?: string
  accept?: string
  placeholder?: string
  showPreview?: boolean
  currentImageUrl?: string
}

export function ImageUpload({
  onUploadComplete,
  onUploadStart,
  onError,
  options,
  className = '',
  accept = 'image/*',
  placeholder = '画像をドラッグ&ドロップまたはクリックして選択',
  showPreview = true,
  currentImageUrl
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true)
      setError(null)
      onUploadStart?.()

      // プレビューを表示
      if (showPreview) {
        const preview = URL.createObjectURL(file)
        setPreviewUrl(preview)
      }

      const result = await uploadImage(file, options)

      if (result.success) {
        onUploadComplete?.(result)
        if (showPreview && result.url) {
          setPreviewUrl(result.url)
        }
      } else {
        setError(result.error || 'アップロードに失敗しました')
        onError?.(result.error || 'アップロードに失敗しました')
        // プレビューを元に戻す
        if (showPreview) {
          setPreviewUrl(currentImageUrl || null)
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = 'アップロード中にエラーが発生しました'
      setError(errorMessage)
      onError?.(errorMessage)
      // プレビューを元に戻す
      if (showPreview) {
        setPreviewUrl(currentImageUrl || null)
      }
    } finally {
      setIsUploading(false)
    }
  }, [options, onUploadComplete, onUploadStart, onError, showPreview, currentImageUrl])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* ファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        className="hidden"
        disabled={isUploading}
      />

      {/* ドロップエリア */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {/* プレビュー画像 */}
        {showPreview && previewUrl && !isUploading && (
          <div className="mb-4">
            <img
              src={previewUrl}
              alt="プレビュー"
              className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
            />
          </div>
        )}

        {/* アップロード状態 */}
        {isUploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600">アップロード中...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <svg 
              className="w-10 h-10 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <p className="text-sm text-gray-600">
              {previewUrl ? '画像を変更' : placeholder}
            </p>
            <p className="text-xs text-gray-500">
              対応形式: JPEG, PNG, WebP, GIF (最大10MB)
            </p>
          </div>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}