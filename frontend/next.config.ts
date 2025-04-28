import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com"],
  },
  eslint: {
    // 빌드 중에 ESLint 검사를 건너뜁니다
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
