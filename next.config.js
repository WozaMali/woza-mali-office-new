/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Next.js 15 compatibility
  experimental: {
    // Enable better debugging
  },
  // Ensure proper client-side rendering for auth components
  reactStrictMode: true,
  // Redirects for simplified URLs
  async redirects() {
    return [
      {
        source: '/collections',
        destination: '/admin/collections',
        permanent: true,
      },
      {
        source: '/pickups',
        destination: '/admin/pickups',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/users',
        destination: '/admin/users',
        permanent: true,
      },
      {
        source: '/transactions',
        destination: '/admin/transactions',
        permanent: true,
      },
      {
        source: '/withdrawals',
        destination: '/admin/withdrawals',
        permanent: true,
      },
      {
        source: '/analytics',
        destination: '/admin/analytics',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/admin/settings',
        permanent: true,
      },
      {
        source: '/rewards',
        destination: '/admin/rewards',
        permanent: true,
      },
      {
        source: '/fund',
        destination: '/admin/fund',
        permanent: true,
      },
      {
        source: '/beneficiaries',
        destination: '/admin/beneficiaries',
        permanent: true,
      },
      {
        source: '/team-members',
        destination: '/admin/team-members',
        permanent: true,
      },
      {
        source: '/config',
        destination: '/admin/config',
        permanent: true,
      },
      {
        source: '/create-users',
        destination: '/admin/create-users',
        permanent: true,
      },
      {
        source: '/discover-earn',
        destination: '/admin/discover-earn',
        permanent: true,
      },
      {
        source: '/employee-form',
        destination: '/admin/employee-form',
        permanent: true,
      },
      {
        source: '/green-scholar',
        destination: '/admin/green-scholar',
        permanent: true,
      },
      {
        source: '/tiers',
        destination: '/admin/tiers',
        permanent: true,
      },
      {
        source: '/watch-ads',
        destination: '/admin/watch-ads',
        permanent: true,
      },
      {
        source: '/watch-ads-stats',
        destination: '/admin/watch-ads-stats',
        permanent: true,
      },
      {
        source: '/update-names',
        destination: '/admin/update-names',
        permanent: true,
      },
      {
        source: '/admin-activity',
        destination: '/admin/admin-activity',
        permanent: true,
      },
      {
        source: '/export-notifications',
        destination: '/admin/export-notifications',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Fix for core-js and other dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Suppress the workspace warning
  outputFileTracingRoot: process.cwd(),
}

module.exports = nextConfig
