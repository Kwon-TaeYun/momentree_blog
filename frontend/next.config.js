/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 빌드 중에 ESLint 검사를 건너뜁니다
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 타입 체크를 실행하지 않음
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "images.unsplash.com",
      "picsum.photos",
      "momentrees3bucket.s3.ap-northeast-2.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
