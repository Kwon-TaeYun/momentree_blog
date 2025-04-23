'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Blogger {
  name: string;
  followerCount: number;
  profileImageUrl: string;
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
        const res = await fetch('http://localhost:8090/api/v1/members/top5');
        const data = await res.json();
        setBloggers(data);
      } catch (error) {
        console.error('블로거 불러오기 실패:', error);
      }
    };

    fetchBloggers();
    fetchTopPosts();
    fetchRealtimePosts();
  }, []);

  const fetchTopPosts = async () => {
    try {
      const res = await fetch('http://localhost:8090/api/v1/boards/latest');
      const data = await res.json();
      console.log('topPosts API 응답:', data); // 여기에 구조 확인 로그 추가
  
      // data의 구조가 { data: Post[] } 형태인지 확인
      setTopPosts(data);  // 만약 { data: Post[] } 형태가 아니라면 그냥 data를 setTopPosts로 설정
    } catch (error) {
      console.error('인기 콘텐츠 불러오기 실패:', error);
    }
  };

  const fetchRealtimePosts = async () => {
    try {
      const res = await fetch('http://localhost:8090/api/v1/boards/popular');
      const data = await res.json();
      setRealtimePosts(data);
    } catch (error) {
      console.error('실시간 인기글 불러오기 실패:', error);
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
            {bloggers.map((blogger: Blogger, index: number) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 overflow-hidden">
                  <Image 
                    src={blogger.profileImageUrl || `/logo.png`}
                    alt={blogger.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-center">{blogger.name}</span>
                <span className="text-xs text-gray-500">팔로워 {blogger.followerCount ? blogger.followerCount.toLocaleString() : '0'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 인기 콘텐츠 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">최신 콘텐츠</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {Array.isArray(topPosts) && topPosts.map((post) => (
    <div key={post.id} className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
      <div className="h-48 bg-gray-100 relative">
        <Image 
          src={post.imageUrl && post.imageUrl.startsWith('http') ? post.imageUrl : '/default-content.jpg'}
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
<section className="mb-8">
  <h2 className="text-xl font-bold mb-4">실시간 인기글</h2>
  <div className="space-y-4">
    {realtimePosts.map((post) => (
      <div key={post.id} className="flex gap-4 border-b pb-4">
        <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
          <Image 
            src={post.imageUrl && post.imageUrl.startsWith('http') ? post.imageUrl : '/default-content.jpg'}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {/* 댓글 수는 데이터 구조에 따라 수정 */}
            </span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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