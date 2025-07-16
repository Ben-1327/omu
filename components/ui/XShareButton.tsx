'use client'

import styles from './XShareButton.module.css'

interface XShareButtonProps {
  url: string
  text: string
  className?: string
}

export default function XShareButton({ url, text, className = '' }: XShareButtonProps) {
  const handleShare = () => {
    const shareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleShare}
      className={`${styles.shareButton} ${className}`}
      aria-label="Xでシェア"
      title="Xでシェア"
    >
      <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </button>
  )
}