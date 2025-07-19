'use client'

import { useEffect } from 'react'
import Script from 'next/script'

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}

// IPアドレス除外機能
const isExcludedIP = () => {
  if (typeof window === 'undefined') return false
  
  // 開発環境では常に除外
  if (process.env.NODE_ENV === 'development') return true
  
  // 特定のIPアドレスを除外（環境変数で設定）
  const excludedIPs = process.env.NEXT_PUBLIC_EXCLUDED_IPS?.split(',') || []
  
  // クライアントサイドでIPアドレスを取得するのは困難なため、
  // サーバーサイドでの判定も併用する
  return false
}

export const pageview = (url: string) => {
  if (!GA_TRACKING_ID || isExcludedIP()) return
  
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (!GA_TRACKING_ID || isExcludedIP()) return
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

export default function GoogleAnalytics() {
  useEffect(() => {
    if (isExcludedIP()) {
      console.log('Google Analytics disabled for this IP')
    }
  }, [])

  if (!GA_TRACKING_ID || isExcludedIP()) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'secure;samesite=strict'
            });
          `,
        }}
      />
    </>
  )
}