"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Blogger {
  id: number;
  name: string;
  followerCount: number;
  profilePhotoUrl: string; // 백엔드에서 반환되는 필드
  profileImageUrl: string; // 프론트엔드에서 처리된 필드
  blogId: number;
}

interface Post {
  id: number;
  title: string;
  blogId?: number;
  imageUrl?: string | null;
  excerpt?: string;
  authorName?: string;
  likeCount: number;
}

// AWS S3 URL 생성 함수 추가
const getS3ImageUrl = (imageKey: string | null | undefined) => {
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || "momentrees3bucket";
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "ap-northeast-2";
  const S3_PUBLIC_BASE = `https://${bucket}.s3.${region}.amazonaws.com`;

  if (!imageKey) return "/default-content.jpg";
  if (imageKey.startsWith("http")) return imageKey;
  if (imageKey.startsWith("uploads/")) {
    return `${S3_PUBLIC_BASE}/${imageKey}`;
  }
  return `${S3_PUBLIC_BASE}/uploads/${imageKey}`;
};

export default function BlogPage() {
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [realtimePosts, setRealtimePosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchBloggers = async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            "https://api.blog.momentree.site"
          }/api/v1/members/top5`
        );
        const data = await res.json();
        console.log("🔥 인기 블로거 응답 데이터:", data);

        const processedBloggers = data.map((blogger: Blogger) => ({
          ...blogger,
          profileImageUrl: blogger.profilePhotoUrl || "/default-profile.png", // 기본 이미지 설정
        }));

        setBloggers(processedBloggers);
      } catch (error) {
        console.error("인기 블로거 불러오기 실패:", error);
      }
    };

    // 최신 콘텐츠 가져오기
    const fetchTopPosts = async () => {
      try {
        const res = await fetch(
          "https://api.blog.momentree.site/api/v1/boards/latest"
        );
        const data: Post[] = await res.json(); // 응답 데이터를 Post[] 타입으로 지정
        console.log("최신 콘텐츠 API 응답:", data); // 여기에 구조 확인 로그 추가 // 백엔드 응답 구조에 따라 설정. 만약 { data: Post[] } 형태가 아니라면 그냥 data를 setTopPosts로 설정

        setTopPosts(data);
      } catch (error) {
        console.error("최신 콘텐츠 불러오기 실패:", error);
      }
    }; // 실시간 인기글 가져오기

    const fetchRealtimePosts = async () => {
      try {
        const res = await fetch(
          "https://api.blog.momentree.site/api/v1/boards/popular"
        );
        const data: Post[] = await res.json(); // 응답 데이터를 Post[] 타입으로 지정
        console.log("실시간 인기글 API 응답:", data); // 응답 데이터 구조 확인 로그
        setRealtimePosts(data);
      } catch (error) {
        console.error("실시간 인기글 불러오기 실패:", error);
      }
    };

    fetchBloggers();
    fetchTopPosts();
    fetchRealtimePosts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 인기 블로거 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">인기 블로거</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {bloggers.map((blogger: Blogger) => (
              <Link
                href={`/blog/${blogger.blogId}`}
                key={blogger.blogId}
                className="flex flex-col items-center hover:opacity-80 transition-opacity cursor-pointer"
              >
                {/* 프로필 이미지 렌더링 부분 */}
                <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 overflow-hidden">
                  <Image
                    src={blogger.profileImageUrl || "/logo.png"}
                    alt={blogger.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-center">
                  {blogger.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 최신 콘텐츠 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">최신 콘텐츠</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.isArray(topPosts) &&
              topPosts.map((post) => (
                <Link href={`/boards/${post.id}`} key={post.id}>
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-100 relative">
                      <Image
                        src={getS3ImageUrl(post.imageUrl)}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-2">{post.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="flex items-center mr-3">
                          ❤️ {post.likeCount?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* 실시간 인기글 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">실시간 인기글</h2>
          <div className="space-y-4">
            {realtimePosts.map((post) => (
              <Link href={`/boards/${post.id}`} key={post.id} className="block">
                <div className="flex gap-4 border-b pb-4 hover:bg-gray-50 transition-colors">
                  <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={getS3ImageUrl(post.imageUrl)}
                      alt={post.title}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-2">{post.authorName}</span>
                      <span className="flex items-center mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {/* 댓글 수는 데이터 구조에 따라 수정 */}
                      </span>
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span className="flex items-center">
                          ❤️ {post.likeCount?.toLocaleString() || 0}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
