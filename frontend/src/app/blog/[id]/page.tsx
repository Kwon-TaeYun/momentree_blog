"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

// S3 이미지 URL 처리를 위한 유틸리티 함수
const getS3ImageUrl = (imageKey: string | null) => {
  if (!imageKey) return null;
  if (imageKey.startsWith("http")) return imageKey;

  const key = imageKey.startsWith("uploads/")
    ? imageKey
    : `uploads/${imageKey}`;
  return `https://momentrees3bucket.s3.ap-northeast-2.amazonaws.com/${key}`;
};

interface BoardListResponseDto {
  id: number;
  title: string;
  blogId: number;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
}

interface PagedBoards {
  content: BoardListResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface BlogDetails {
  id: number;
  name: string;
  userName: string;
  userEmail: string;
  profileImage: string;
  followerCount: number;
  followingCount: number;
  boards: PagedBoards;
}

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [blogDetail, setBlogDetail] = useState<BlogDetails | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8090/api/v1/blogs/${id}/details?page=${currentPage}&size=10`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("블로그를 불러오는데 실패했습니다");
        }

        const data = await response.json();
        setBlogDetail(data);
      } catch (error: any) {
        console.error("상세 에러:", error);
        setError(error.message || "블로그 정보를 불러오는데 실패했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 왼쪽 사이드바 - 프로필 섹션 */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 relative rounded-full overflow-hidden mb-4 bg-gray-200">
                  {blogDetail?.profileImage && (
                    <Image
                      src={getS3ImageUrl(blogDetail.profileImage) || ""}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <h2 className="text-xl font-bold mb-1">{blogDetail?.name}</h2>
                <p className="text-gray-500 mb-4">{blogDetail?.userEmail}</p>
                <div className="w-full flex flex-col space-y-2">
                  <div className="flex justify-between p-2">
                    <p className="text-black">게시글</p>
                    <p className="font-bold">
                      {blogDetail?.boards.totalElements || 0}
                    </p>
                  </div>
                  <div className="flex justify-between p-2">
                    <p className="text-black">팔로워</p>
                    <p className="font-bold">
                      {blogDetail?.followerCount || 0}
                    </p>
                  </div>
                  <div className="flex justify-between p-2">
                    <p className="text-black">팔로잉</p>
                    <p className="font-bold">
                      {blogDetail?.followingCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 메인 컨텐츠 - 게시글 목록 */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">게시글 목록</h1>
            {blogDetail?.boards.content.length ? (
              <div className="space-y-4">
                {blogDetail.boards.content.map((board) => (
                  <div
                    key={board.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/boards/${board.id}`)}
                  >
                    <div className="flex gap-4 border-b pb-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                        {board.imageUrl && (
                          <Image
                            src={getS3ImageUrl(board.imageUrl) || ""}
                            alt={board.title}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{board.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              className="w-4 h-4 mr-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            {board.likeCount}
                          </span>
                          <span className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              className="w-4 h-4 mr-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {board.commentCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">아직 작성한 게시글이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
