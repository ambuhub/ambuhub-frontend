import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/provider/listings/:id/edit",
        destination: "/provider/listings/edit/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
