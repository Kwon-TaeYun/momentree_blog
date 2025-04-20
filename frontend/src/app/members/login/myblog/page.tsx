"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MyBlogPage() {
  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState({
    name: "김지민의 나무",
    username: "@jimin_kim",
    posts: 128,
    visitors: 1234,
    followers: 56,
    following: 42,
  });

  // 게시글 목록 상태
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "가을 산책길에서",
      content: "오늘은 단풍이 물든 공원을 산책했다. 마스크가려도 낙엽을 밟으며 걷는 기분이 참 좋았다.",
      date: "2024.01.15",
      likes: 24,
      comments: 12,
      image: "https://picsum.photos/id/235/800/600"
    },
    {
      id: 2,
      title: "카페에서의 오후",
      content: "조용한 카페에서 책을 읽으며 보내는 여유로운 시간.",
      date: "2024.01.14",
      likes: 18,
      comments: 8,
      image: "https://picsum.photos/id/225/800/600"
    },
    {
      id: 3,
      title: "일몰의 순간",
      content: "하늘이 온통 주황빛으로 물들었다. 이 아름다운 순간을 카메라에 담았다.",
      date: "2024.01.13",
      likes: 32,
      comments: 15,
      image: "https://picsum.photos/id/342/800/600"
    }
  ]);

  return (
      <div className="min-h-screen bg-white text-black">

        <main className="max-w-7xl mx-auto py-8 px-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* 좌측 프로필 영역 */}
            <div className="w-full md:w-72 shrink-0">
              <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 relative rounded-full overflow-hidden mb-4">
                    <Image
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
                        alt="프로필 이미지"
                        width={128}
                        height={128}
                        className="object-cover"
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

                  <button className="w-full bg-green-50 text-green-700 font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    블로그 형식으로 보기
                  </button>
                </div>
              </div>
            </div>

            {/* 우측 게시글 영역 */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-6">나의 순간들</h1>

              <div className="space-y-8">
                {posts.map(post => (
                    <div key={post.id} className="border border-gray-100 rounded-lg overflow-hidden">
                      {/* 게시글 이미지 */}
                      <div className="w-full h-80 bg-gray-100 relative">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 게시글 내용 */}
                      <div className="p-6">
                        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                        <p className="text-gray-800 mb-4">{post.content}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">{post.date}</span>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-red-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center text-blue-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                              <span>{post.comments}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}