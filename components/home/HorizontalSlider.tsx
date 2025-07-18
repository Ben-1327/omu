'use client'

import { useState, useEffect, useRef } from 'react'
import PostCard from '@/components/posts/PostCard'
import { Post, User, Tag } from '@/types/prisma'
import styles from './HorizontalSlider.module.css'

interface HorizontalSliderProps {
  title: string
  type?: 'all' | 'article' | 'prompt' | 'conversation'
  limit?: number
}

type PostWithDetails = Post & {
  user: User
  postTags: Array<{
    tag: Tag
  }>
  _count: {
    likes: number
  }
}

export default function HorizontalSlider({ title, type = 'all', limit = 10 }: HorizontalSliderProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams({
          sort: 'popular',
          limit: limit.toString()
        })
        
        if (type !== 'all') {
          params.append('type', type)
        }

        const response = await fetch(`/api/posts?${params}`)
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        console.error('投稿取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [type, limit])

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    updateScrollButtons()
    const handleResize = () => updateScrollButtons()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [posts])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320 // カード幅 + gap
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.scrollContainer}>
          <div className={styles.slider}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.loadingCard}>
                <div className={styles.loadingHeader}></div>
                <div className={styles.loadingContent}>
                  <div className={styles.loadingLine}></div>
                  <div className={styles.loadingLine}></div>
                  <div className={styles.loadingLineShort}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.emptyState}>
          <p>まだ投稿がありません</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.controls}>
          <button 
            className={`${styles.scrollButton} ${!canScrollLeft ? styles.disabled : ''}`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="左にスクロール"
          >
            ←
          </button>
          <button 
            className={`${styles.scrollButton} ${!canScrollRight ? styles.disabled : ''}`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="右にスクロール"
          >
            →
          </button>
        </div>
      </div>
      
      <div className={styles.scrollContainer}>
        <div 
          ref={scrollRef}
          className={styles.slider}
          onScroll={updateScrollButtons}
        >
          {posts.map((post) => (
            <div key={post.id} className={styles.slideItem}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}