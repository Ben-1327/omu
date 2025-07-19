import { NextRequest } from 'next/server'

// 除外するIPアドレスのリスト
const EXCLUDED_IPS = process.env.EXCLUDED_IPS?.split(',') || []

// 開発者IPアドレスかどうかをチェック
export function isExcludedIP(request: NextRequest): boolean {
  // 開発環境では常に除外
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // IPアドレスを取得（複数のヘッダーから試行）
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = request.headers.get('x-client-ip')
  
  let ip = forwarded?.split(',')[0] || realIP || clientIP || request.ip
  
  // IPv6ローカルアドレスの処理
  if (ip === '::1') {
    ip = '127.0.0.1'
  }
  
  console.log(`Client IP: ${ip}`)
  
  // 除外リストと照合
  if (ip && EXCLUDED_IPS.includes(ip)) {
    console.log(`IP ${ip} is excluded from analytics`)
    return true
  }
  
  return false
}

// クライアントサイドでの除外判定用のセッションストレージ設定
export function setAnalyticsExclusion(excluded: boolean) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('analytics_excluded', excluded.toString())
  }
}

export function getAnalyticsExclusion(): boolean {
  if (typeof window === 'undefined') return false
  
  const excluded = sessionStorage.getItem('analytics_excluded')
  return excluded === 'true'
}