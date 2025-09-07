import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['mcoxscmcokkpbmonrxku.supabase.co'], // 👈 Add your Supabase project domain here
  remotePatterns: [
      {
        protocol: "https",
        hostname: "apiv2.allsportsapi.com",
      },
    ],
  },

};

export default nextConfig;
