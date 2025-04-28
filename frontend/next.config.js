/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "picsum.photos",
      "momentrees3bucket.s3.ap-northeast-2.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
