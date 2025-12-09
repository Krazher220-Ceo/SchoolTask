/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
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
}

module.exports = nextConfig

