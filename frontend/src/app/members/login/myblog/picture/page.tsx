"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function BlogGalleryPage() {
  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState({
    name: "김지민의 나무",
    username: "@jimin_kim",
    posts: 128,
    visitors: 1234,
    followers: 56,
    following: 42,
  });

  // 이미지 데이터 (게시글에서 추출한 이미지들)
  const [images, setImages] = useState([
    {
      id: 1,
      src: "https://picsum.photos/id/235/800/600",
      alt: "가을 산책길의 풍경",
    },
    {
      id: 2,
      src: "https://picsum.photos/id/225/800/600",
      alt: "카페에서의 오후",
    },
    {
      id: 3,
      src: "https://picsum.photos/id/342/800/600",
      alt: "일몰의 순간",
    },
    {
      id: 4,
      src: "https://picsum.photos/id/65/800/600",
      alt: "숲속 풍경",
    },
    {
      id: 5,
      src: "https://picsum.photos/id/48/800/600",
      alt: "산의 풍경",
    },
    {
      id: 6,
      src: "https://picsum.photos/id/29/800/600",
      alt: "하늘 풍경",
    },
    {
      id: 7,
      src: "https://picsum.photos/id/110/800/600",
      alt: "안개 낀 풍경",
    },
    {
      id: 8,
      src: "https://picsum.photos/id/164/800/600",
      alt: "해변의 풍경",
    }
  ]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* 헤더 */}
      <header className="border-b border-gray-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Image 
                src="/images/logo.png" 
                alt="Momentree 로고" 
                width={46} 
                height={46}
              />
              <span className="font-medium text-black ml-1">Momentree</span>
            </Link>
            <nav>
              <ul className="flex space-x-8">
                <li className="font-medium border-b-2 border-black pb-1">
                  <Link href="/members/login/myblog">나의 나무</Link>
                </li>
                <li className="text-gray-500 hover:text-black">
                  <Link href="/social">사진첩</Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-green-100 text-green-800 px-4 py-2 rounded-md">글쓰기</button>
            <button className="text-gray-700 px-4 py-2 rounded-md">김지민님</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 좌측 프로필 영역 */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 relative rounded-full overflow-hidden mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" 
                    alt="프로필 이미지"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-bold mb-1">{userInfo.name}</h2>
                <p className="text-gray-500 mb-4">{userInfo.username}</p>
                
                <div className="w-full flex flex-col space-y-3 mb-4">
                  <div className="flex justify-between">
                    <p className="text-black">게시글</p>
                    <p className="font-bold">{userInfo.posts}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-black">방문자</p>
                    <p className="font-bold">{userInfo.visitors.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-black">팔로워</p>
                    <p className="font-bold">{userInfo.followers}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-black">팔로잉</p>
                    <p className="font-bold">{userInfo.following}</p>
                  </div>
                </div>
                
                <Link href="/members/login/myblog" className="w-full bg-green-50 text-green-700 font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  게시글 형식으로 보기
                </Link>
              </div>
            </div>
          </div>

          {/* 우측 이미지 갤러리 영역 */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">나의 순간들</h1>
            
            {/* 이미지 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(image => (
                <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                  <img 
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
