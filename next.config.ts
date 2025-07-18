import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/': ['./prisma/**/*'],
  },
  images: {
    domains: ['nnfwnybihekdmwuwitwy.supabase.co'],
  }
};

export default nextConfig;
