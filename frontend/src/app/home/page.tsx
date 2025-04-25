"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Blogger {
  id: number;
  name: string;
  followerCount: number;
  profileImageUrl: string;
}

interface Post {
  id: number;
  title: string;
  blogId?: number;
  imageUrl?: string;
  excerpt?: string;
  authorName?: string;
  likeCount: number;
}

export default function BlogPage() {
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [realtimePosts, setRealtimePosts] = useState<Post[]>([]);
  useEffect(() => {
    const fetchBloggers = async () => {
      try {
        const res = await fetch("http://localhost:8090/api/v1/members/top5");
        const data = await res.json();
        setBloggers(data);
      } catch (error) {
        console.error("블로거 불러오기 실패:", error);
      }
    };

    fetchBloggers();
    fetchTopPosts();
    fetchRealtimePosts();
  }, []);

  const fetchTopPosts = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/v1/boards/latest");
      const data = await res.json();
      console.log("topPosts API 응답:", data); // 여기에 구조 확인 로그 추가

      // data의 구조가 { data: Post[] } 형태인지 확인
      setTopPosts(data); // 만약 { data: Post[] } 형태가 아니라면 그냥 data를 setTopPosts로 설정
    } catch (error) {
      console.error("인기 콘텐츠 불러오기 실패:", error);
    }
  };

  const fetchRealtimePosts = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/v1/boards/popular");
      const data = await res.json();
      setRealtimePosts(data);
    } catch (error) {
      console.error("실시간 인기글 불러오기 실패:", error);
    }
  };

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
                href={`/blog/${blogger.id}`}
                key={blogger.id}
                className="flex flex-col items-center hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 overflow-hidden">
                  <Image
                    src={blogger.profileImageUrl || `/logo.png`}
                    alt={blogger.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-center">
                  {blogger.name}
                </span>
                <span className="text-xs text-gray-500">
                  팔로워 {blogger.followerCount?.toLocaleString() || "0"}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 인기 콘텐츠 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">최신 콘텐츠</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.isArray(topPosts) &&
              topPosts.map((post) => (
                <Link href={`/boards/${post.id}`} key={post.id}>
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 h-full">
                    <div className="h-48 bg-gray-100 relative">
                      {post.imageUrl ? (
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">이미지 없음</span>
                        </div>
                      )}
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
            {Array.isArray(realtimePosts) &&
              realtimePosts.map((post) => (
                <Link
                  href={`/boards/${post.id}`}
                  key={post.id}
                  className="block"
                >
                  <div className="flex gap-4 border-b pb-4 hover:bg-gray-50 transition-colors">
                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {post.imageUrl ? (
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-xs">
                            이미지 없음
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{post.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <span className="flex items-center">
                          ❤️ {post.likeCount?.toLocaleString() || 0}
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
