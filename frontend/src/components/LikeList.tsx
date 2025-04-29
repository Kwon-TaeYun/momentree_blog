"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface LikeListProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

interface LikeUser {
  id: string;
  email: string;
}

const LikeList: React.FC<LikeListProps> = ({ isOpen, onClose, postId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [likeUsers, setLikeUsers] = useState<LikeUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 좋아요 누른 사용자 데이터 가져오기
  useEffect(() => {
    const fetchLikeUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            "https://api.blog.momentree.site"
          }/api/v1/boards/${postId}/likes`,
          {
            withCredentials: true,
          }
        );

        const users = response.data.users;
        if (Array.isArray(users)) {
          setLikeUsers(users);
        } else {
          console.error("서버에서 users 배열이 누락되었습니다:", response.data);
          setLikeUsers([]);
        }
      } catch (err) {
        console.error("좋아요 목록 로딩 오류:", err);
        setError("좋아요 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikeUsers();
  }, [postId]); // postId가 변경될 때마다 호출

  // 검색어로 사용자 필터링
  const filteredUsers = likeUsers.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 블러 배경 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* 좋아요 모달 */}
      <div className="relative bg-white w-full max-w-[400px] mx-4 rounded-xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center h-12 border-b">
          <button onClick={onClose} className="px-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1 text-center font-semibold">좋아요</div>
          <div className="w-14"></div>
        </div>

        <div className="text-center py-4 border-b">
          <h2 className="text-base font-semibold">좋아요 목록</h2>
          <p className="text-sm text-gray-500">
            이 게시물에 좋아요를 누른 사람들입니다.
          </p>
        </div>

        {/* 검색창 */}
        <div className="px-4 py-2">
          <div className="relative bg-gray-100 rounded-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="이메일로 검색"
              className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-8 text-gray-500">
            <p>좋아요 목록을 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        )}

        {/* 좋아요 누른 사용자 목록 */}
        {!loading && !error && (
          <div className="overflow-y-auto max-h-[400px]">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                {searchQuery ? "검색 결과가 없습니다" : "좋아요가 없습니다"}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center px-4 py-3 border-b border-gray-100"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden border">
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikeList;
