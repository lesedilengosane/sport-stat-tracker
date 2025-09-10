import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mcoxscmcokkpbmonrxku.supabase.co", // Supabase storage
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile pics
      },
    ],
  },
};

export default nextConfig;
