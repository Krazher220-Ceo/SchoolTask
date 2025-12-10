/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
          },
        ],
      },
    ]
  },
  // Защита от перечисления путей
  poweredByHeader: false,
  // Ограничение размера тела запроса
  serverRuntimeConfig: {
    maxRequestSize: '5mb',
  },
  webpack: (config, { isServer, dev }) => {
    // Исправление проблем с динамическими импортами
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // В dev режиме используем более стабильную стратегию для чанков
    if (dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
      }
    }
    
    return config
  },
  // Оптимизация импортов для уменьшения размера бандла
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Компрессия
  compress: true,
  // Оптимизация production сборки
  swcMinify: true,
  // Оптимизация кэширования
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig

