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
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fcpuyl3posiztzia.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "tjcflen0aawylolt.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "coocz2x3shrtqkfu.public.blob.vercel-storage.com",
      },
    ],
  },
};

module.exports = nextConfig;
