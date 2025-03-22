/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "fcpuyl3posiztzia.public.blob.vercel-storage.com",
        },
      ],
    },
  };
  
  module.exports = nextConfig;
  