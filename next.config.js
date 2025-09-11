// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//       remotePatterns: [
//         {
//           protocol: "https",
//           hostname: "fcpuyl3posiztzia.public.blob.vercel-storage.com",
//         },
//       ],
//     },
//   };
  
//   module.exports = nextConfig;
  
/** @type {import('next').NextConfig} */

// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "fcpuyl3posiztzia.public.blob.vercel-storage.com",
//       },
//       {
//         protocol: "https",
//         hostname: "tjcflen0aawylolt.public.blob.vercel-storage.com",
//       },
//       {
//         protocol: "https",
//         hostname: "coocz2x3shrtqkfu.public.blob.vercel-storage.com",
//       },
//     ],
//   },
// };

// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'tjcflen0aawylolt.public.blob.vercel-storage.com',
//       },
//       {
//         protocol: 'https',
//         hostname: 'd1notes-image-storage.s3.us-east-2.amazonaws.com',
//       },
//       {
//         protocol: 'https',
//         hostname: 'd32doctt4s7o3m.cloudfront.net',
//       },
//       {
//         protocol: 'https',
//         hostname: 'd2gpzaycuwue25.cloudfront.net',
//       },
//       {
//         protocol: 'https',
//         hostname: 'd2wthp7ar6r0up.cloudfront.net',
//       },
//     ],
//     formats: ['image/webp', 'image/avif'], // Modern formats
//   },
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  swcMinify: true,
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By header

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tjcflen0aawylolt.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'd1notes-image-storage.s3.us-east-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'd32doctt4s7o3m.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'd2gpzaycuwue25.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'd2wthp7ar6r0up.cloudfront.net',
      },
    ],
    formats: ['image/webp', 'image/avif'], // Modern formats
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 200,
      };

      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    return config;
  },

  experimental: {
    webpackBuildWorker: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },

  typescript: {
    ignoreBuildErrors: false, // Always check types in production
  },

  eslint: {
    ignoreDuringBuilds: false, // Always lint in production
  },
};

module.exports = nextConfig;