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

const nextConfig = {
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
};

module.exports = nextConfig;
