import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/posts/*',
          '/users/*', 
          '/search',
          '/tags/*'
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/auth/*',
          '/settings',
          '/profile',
          '/posts/new',
          '/posts/*/edit'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
} 