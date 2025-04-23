"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// 게시글 타입 정의
interface Post {
  id: number;
  title: string;
  date: string;
  photoCount: number;
  thumbnail: string;
  author: string;
}

// 사진 모음집 컴포넌트
export default function PhotoListPage() {
  // 게시글 별 사진 모음 데이터 (실제로는 API에서 가져오게 됨)
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      title: "거실 인테리어 리모델링",
      date: "2024-06-25",
      photoCount: 4,
      thumbnail: "https://picsum.photos/id/239/800/600",
      author: "홍길동"
    },
    {
      id: 2,
      title: "주방 인테리어 아이디어",
      date: "2024-06-24",
      photoCount: 4,
      thumbnail: "https://picsum.photos/id/235/800/600",
      author: "김철수"
    },
    {
      id: 3,
      title: "아늑한 거실 만들기",
      date: "2024-06-22",
      photoCount: 4,
      thumbnail: "https://picsum.photos/id/238/800/600",
      author: "이영희"
    },
    {
      id: 4,
      title: "침실 인테리어 포인트",
      date: "2024-06-20",
      photoCount: 4,
      thumbnail: "https://picsum.photos/id/240/800/600",
      author: "박지민"
    }
  ]);

  // 정렬 상태
  const [sortOrder, setSortOrder] = useState<'최신순' | '인기순'>('최신순');
  
  // 뷰 모드 상태 (그리드 또는 리스트)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // 날짜 형식 변환 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 헤더 부분 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">게시글 별 사진 모음집</h1>
        
        {/* 필터 및 뷰 모드 컨트롤 */}
        <div className="flex items-center space-x-4">
          {/* 정렬 선택 */}
          <div className="relative">
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as '최신순' | '인기순')}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="최신순">최신순</option>
              <option value="인기순">인기순</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          
          {/* 뷰 모드 토글 */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              aria-label="Grid view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              aria-label="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>


      {/* 게시글 별 사진 모음 (그리드 뷰) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
              <Link href={`/boards/${post.id}/photos`}>
                <div className="relative pb-[75%]">
                  <img 
                    src={post.thumbnail} 
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
                    {post.photoCount}장
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-1 truncate">{post.title}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{post.author}</span>
                    <span>{formatDate(post.date)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 게시글 별 사진 모음 (리스트 뷰) */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
              <Link href={`/boards/${post.id}/photos`}>
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-56 h-48">
                    <img 
                      src={post.thumbnail} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
                      {post.photoCount}장
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="text-xl font-medium text-gray-800 mb-2">{post.title}</h3>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>{post.author}</span>
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      게시글에 포함된 사진 {post.photoCount}장을 모아볼 수 있습니다.
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 더 보기 버튼 */}
      <div className="mt-10 flex justify-center">
        <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors">
          더 보기
        </button>
      </div>
    </main>
  );
}
