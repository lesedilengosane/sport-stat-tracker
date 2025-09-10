import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "mcoxscmcokkpbmonrxku.supabase.co", // Supabase project domain
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "apiv2.allsportsapi.com", // Sports API
      },
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

