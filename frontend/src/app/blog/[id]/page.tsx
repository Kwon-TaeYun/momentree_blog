"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import UserFollower from "@/components/user_follower";

// 타입 정의
interface CommentDto {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorProfileImage?: string;
  createdAt: string;
  modifiedAt: string;
}

interface BoardListResponseDto {
  id: number;
  title: string;
  blogId: number;
  mainPhotoUrl: string | null;
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
  postsCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  boards: PagedBoards;
}

// Comments 컴포넌트
const Comments = ({ boardId }: { boardId: number }) => {
  // ... Comments 컴포넌트 코드는 동일하게 유지

  return (
    <div className="mt-8">
      {/* ... Comments 컴포넌트 JSX는 동일하게 유지 */}
    </div>
  );
};

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [blogDetail, setBlogDetail] = useState<BlogDetails | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [activeFollowTab, setActiveFollowTab] = useState<
    "followers" | "following"
  >("followers");

  // 팔로워/팔로잉 수 조회
  const fetchFollowCounts = async (userId: number) => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(
          `http://localhost:8090/api/v1/follows/members/${userId}/followers/counts`,
          {
            credentials: "include",
          }
        ),
        fetch(
          `http://localhost:8090/api/v1/follows/members/${userId}/followings/counts`,
          {
            credentials: "include",
          }
        ),
      ]);

      if (followersRes.ok && followingRes.ok) {
        const followers = await followersRes.json();
        const following = await followingRes.json();
        setFollowerCount(followers);
        setFollowingCount(following);
      }
    } catch (error) {
      console.error("팔로우 카운트 조회 실패:", error);
    }
  };

  // 팔로우 처리
  const handleFollowToggle = async () => {
    try {
      const url = `http://localhost:8090/api/v1/follows/${
        isFollowing ? "unfollow" : "follow"
      }`;
      const response = await fetch(url, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ followingId: blogDetail?.id }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        // 팔로워 수 즉시 업데이트
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
        // 성공 메시지 표시 (선택사항)
        alert(isFollowing ? "언팔로우 되었습니다." : "팔로우 되었습니다.");
      }
    } catch (error) {
      console.error("팔로우 처리 실패:", error);
    }
  };

  // 팔로워/팔로잉 모달 표시 함수
  const handleShowFollowers = () => {
    setActiveFollowTab("followers");
    setShowFollowModal(true);
  };

  const handleShowFollowing = () => {
    setActiveFollowTab("following");
    setShowFollowModal(true);
  };

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8090/api/v1/blogs/${id}/details?page=${currentPage}&size=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || "블로그를 불러오는데 실패했습니다"
          );
        }

        const data = await response.json();
        setBlogDetail(data);
        setIsFollowing(data.isFollowing); // 초기 팔로우 상태 설정

        // 팔로우 카운트 조회 추가
        if (data.id) {
          fetchFollowCounts(data.id);
        }
      } catch (err) {
        console.error("에러 상세:", err);
        setError(
          err instanceof Error
            ? err.message
            : "블로그 정보를 불러오는데 실패했습니다"
        );
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

  const renderPagination = () => {
    if (!blogDetail || !blogDetail.boards.content.length) return null;

    return (
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: blogDetail.boards.totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 rounded ${
              currentPage === i
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 왼쪽 사이드바 - 프로필 섹션 */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 relative rounded-full overflow-hidden mb-4">
                  {blogDetail?.profileImage ? (
                    <Image
                      src={blogDetail.profileImage}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-4xl font-semibold text-gray-400">
                      ?
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-1">{blogDetail?.name}</h2>
                <p className="text-gray-500 mb-4">{blogDetail?.userEmail}</p>

                {/* 팔로우 버튼 */}
                <button
                  onClick={handleFollowToggle}
                  className={`w-full py-2 px-4 rounded-md mb-4 transition-colors ${
                    isFollowing
                      ? "bg-gray-200 hover:bg-gray-300"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {isFollowing ? "팔로잉" : "팔로우"}
                </button>

                <div className="w-full flex flex-col space-y-2">
                  <div className="flex justify-between p-2">
                    <p className="text-black">게시글</p>
                    <p className="font-bold">
                      {blogDetail?.boards.totalElements || 0}
                    </p>
                  </div>
                  <div
                    className="flex justify-between p-2 cursor-pointer hover:bg-gray-50 rounded"
                    onClick={handleShowFollowers}
                  >
                    <p className="text-black">팔로워</p>
                    <p className="font-bold">{followerCount}</p>
                  </div>
                  <div
                    className="flex justify-between p-2 cursor-pointer hover:bg-gray-50 rounded"
                    onClick={handleShowFollowing}
                  >
                    <p className="text-black">팔로잉</p>
                    <p className="font-bold">{followingCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 메인 컨텐츠 - 게시글 목록 */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">게시글 목록</h1>
            {blogDetail?.boards.content.length ? (
              <>
                <div className="space-y-4">
                  {blogDetail.boards.content.map((board) => (
                    <div
                      key={board.id}
                      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/boards/${board.id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        {board.mainPhotoUrl && (
                          <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                            <Image
                              src={board.mainPhotoUrl}
                              alt={board.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            {board.title}
                          </h3>
                          <div className="flex justify-between text-sm text-gray-500">
                            <div className="flex space-x-4">
                              <span>❤️ {board.likeCount}</span>
                              <span>💬 {board.commentCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination()}
              </>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">아직 작성한 게시글이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
        <UserFollower
          isOpen={showFollowModal}
          onClose={() => setShowFollowModal(false)}
          userId={blogDetail?.id?.toString()}
          initialTab={activeFollowTab}
        />
      </main>
    </div>
  );
}
