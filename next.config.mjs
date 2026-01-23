/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      "i.scdn.co",
      "mosaic.scdn.co",
      "i.scdn.co",
      "platform-lookaside.fbsbx.com",
    ],
  },
  // Add this for better performance on Vercel
  swcMinify: true,
  // Enable compression
  compress: true,
  // Handle API timeouts
  api: {
    responseLimit: false,
  },
};

export default nextConfig;
