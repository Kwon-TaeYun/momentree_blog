"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Blogger {
  id: number; // 추가
  name: string;
  followerCount: number;
  profileImageUrl: string;
  blogId: number; // <-- 백엔드 UserResponse에서 받을 블로그 ID 필드를 여기에 추가
}

interface Post {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string;
  authorName: string;
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
        console.log("인기 블로거 API 응답:", data); // 응답 데이터 구조 확인 로그
        setBloggers(data);
      } catch (error) {
        console.error("인기 블로거 불러오기 실패:", error);
      }
    };

    // 최신 콘텐츠 가져오기
    const fetchTopPosts = async () => {
      try {
        // 백엔드 BoardApiV1Controller.getLatestPosts()는 List<BoardListResponseDto>를 반환
        const res = await fetch("http://localhost:8090/api/v1/boards/latest");
        const data: Post[] = await res.json(); // 응답 데이터를 Post[] 타입으로 지정
        console.log("최신 콘텐츠 API 응답:", data); // 여기에 구조 확인 로그 추가 // 백엔드 응답 구조에 따라 설정. 만약 { data: Post[] } 형태가 아니라면 그냥 data를 setTopPosts로 설정

        setTopPosts(data);
      } catch (error) {
        console.error("최신 콘텐츠 불러오기 실패:", error);
      }
    }; // 실시간 인기글 가져오기

    const fetchRealtimePosts = async () => {
      try {
        // 백엔드 BoardApiV1Controller.getPopularBoards()는 List<BoardListResponseDto>를 반환
        const res = await fetch("http://localhost:8090/api/v1/boards/popular");
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
              // --- 링크 수정 ---
              <Link
                // ✅ blogger.id 대신 blogger.blogId 사용
                // 백엔드 UserResponse DTO에 blogId 필드가 추가되었다면 이렇게 사용
                href={`/blog/${blogger.blogId}`}
                key={blogger.id} // key는 여전히 유저 ID 사용해도 무방합니다.
                className="flex flex-col items-center hover:opacity-80 transition-opacity cursor-pointer"
              >
                {/* 프로필 이미지 렌더링 부분 */}
                <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 overflow-hidden">
                  <Image
                    // 백엔드에서 보내주는 profileImageUrl 사용, 없으면 기본 이미지 사용
                    // ✅ 기본 이미지 경로가 /logo.png로 되어 있습니다.
                    //    /default-profile.png 등으로 바꾸는 것을 고려할 수 있습니다.
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
                <span className="text-xs text-gray-500">
                  팔로워 {blogger.followerCount?.toLocaleString() || "0"}
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
                <div
                  key={post.id}
                  className="rounded-lg overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="h-48 bg-gray-100 relative">
                    <Image
                      src={
                        // 게시글 이미지 URL 사용, 없으면 기본 이미지 사용
                        post.imageUrl && post.imageUrl.startsWith("http")
                          ? post.imageUrl
                          : // ✅ /default-content.jpg 경로가 여기서 사용됩니다.
                            "/default-content.jpg"
                      }
                      alt={post.title}
                      fill
                      className="object-cover"
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
              ))}
          </div>
        </section>

        {/* 실시간 인기글 */}
        {/* ... (실시간 인기글 렌더링 부분 - 최신 콘텐츠 부분과 유사하게 /default-content.jpg 사용) ... */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">실시간 인기글</h2>
          <div className="space-y-4">
            {realtimePosts.map((post) => (
              <div key={post.id} className="flex gap-4 border-b pb-4">
                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      // 게시글 이미지 URL 사용, 없으면 기본 이미지 사용
                      post.imageUrl && post.imageUrl.startsWith("http")
                        ? post.imageUrl
                        : // ✅ /default-content.jpg 경로가 여기서 사용됩니다.
                          "/default-content.jpg"
                    }
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
                      {post.likeCount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
