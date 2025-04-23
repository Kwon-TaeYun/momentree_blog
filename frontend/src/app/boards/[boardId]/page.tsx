"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// 동적 임포트로 LikeList 컴포넌트 가져오기
const LikeList = dynamic(() => import("@/components/LikeList"), {
  ssr: false, // 클라이언트 사이드에서만 렌더링
});

interface Post {
  boardId: number;
  title: string;
  content: string;
  authorName: string;
  authorId?: number; // 작성자 ID 추가
  createdAt: string;
  viewCount: number;
  likeCount: number;
  photos: string[] | null;
  likeUsers: string[];
}

interface Comment {
  author: string;
  content: string;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  token?: string;
}

export default function BoardDetail() {
  const router = useRouter();
  const { boardId } = useParams(); // boardId는 string 타입으로 반환됩니다.
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [token, setToken] = useState<string | null>(null);
  const [isLikeListOpen, setIsLikeListOpen] = useState<boolean>(false);

  // boardId를 숫자 타입으로 변환합니다.
  const boardIdNumber = Number(boardId); // boardId를 숫자로 변환

  // 토큰 가져오기
  useEffect(() => {
    // 로컬 스토리지에서 토큰 가져오기 (클라이언트 사이드에서만 실행)
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // 로그인 상태 및 현재 사용자 정보 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 쿠키 기반 인증
        const response = await fetch(
          "http://localhost:8090/api/v1/members/me",
          {
            credentials: "include",
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("인증 확인 오류:", error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };

    checkAuth();
  }, [token]);

  useEffect(() => {
    if (currentUser !== null || !loading) {
      const fetchPost = async () => {
        if (!boardIdNumber) return;

        setLoading(true);
        try {
          const headers: HeadersInit = {};

          // 토큰이 있으면 헤더에 추가
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          const response = await fetch(
            `http://localhost:8090/api/v1/boards/${boardIdNumber}`,
            {
              credentials: "include",
              headers,
            }
          );

          if (!response.ok) {
            throw new Error("게시글 조회 실패");
          }

          const data = await response.json();
          setPost(data);
          setLikeCount(data.likeCount || 0);

          // 작성자 확인 로그 출력 및 타입 변환 비교
          console.log("data.authorId:", data.authorId);
          console.log("currentUser?.id:", currentUser?.id);

          if (currentUser && Number(data.authorId) === Number(currentUser.id)) {
            setIsAuthor(true);
          }

          // 현재 사용자가 좋아요를 눌렀는지 확인
          if (currentUser && data.likeUsers && Array.isArray(data.likeUsers)) {
            // 문자열 배열인 경우 현재 사용자의 이름이 포함되어 있는지 확인
            if (typeof data.likeUsers[0] === "string") {
              setIsLiked(data.likeUsers.includes(currentUser.name));
            }
            // 객체 배열인 경우 현재 사용자의 ID가 포함되어 있는지 확인
            else {
              setIsLiked(
                data.likeUsers.some(
                  (user: any) => Number(user.id) === Number(currentUser.id)
                )
              );
            }
          }

          setComments(data.comments || []);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "게시글을 불러오는 데 실패했습니다."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [boardIdNumber, currentUser, token]);

  // 좋아요 토글 핸들러
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      alert("좋아요를 누르려면 로그인이 필요합니다.");
      router.push("/members/login");
      return;
    }

    try {
      const method = isLiked ? "DELETE" : "POST";

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `http://localhost:8090/api/v1/boards/${boardIdNumber}/likes`,
        {
          method: method,
          headers,
          credentials: "include",
        }
      );

      if (response.ok) {
        // 좋아요 상태와 개수 업데이트
        setIsLiked(!isLiked);
        setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1)); // 좋아요 카운트 조정
      } else {
        const errorData = await response.json().catch(() => null);
        alert(
          `좋아요 처리 중 오류가 발생했습니다. ${errorData?.message || ""}`
        );
      }
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      router.push("/members/login");
      return;
    }

    const newComment = {
      author: currentUser?.name || "알 수 없음",
      content: commentText,
      createdAt: new Date().toLocaleString(),
    };

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `http://localhost:8090/api/v1/boards/${boardIdNumber}/comments`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(newComment),
        }
      );

      if (res.ok) {
        setComments((prev) => [...prev, newComment]);
        setCommentText("");
      } else {
        alert("댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  // 게시글 삭제 핸들러
  const handleDelete = async () => {
    if (!isAuthenticated || !isAuthor) {
      alert("게시글 삭제 권한이 없습니다.");
      return;
    }

    if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
          }/api/v1/boards/${boardIdNumber}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          alert("게시글이 성공적으로 삭제되었습니다.");
          // 마이블로그 페이지로 이동
          router.push("/members/login/myblog");
        } else {
          const errorData = await response.text();
          if (response.status === 403) {
            alert("게시글 삭제 권한이 없습니다.");
          } else {
            alert(errorData || "게시글 삭제에 실패했습니다.");
          }
        }
      } catch (error) {
        console.error("게시글 삭제 오류:", error);
        alert("게시글 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 좋아요 리스트 토글
  const toggleLikeList = () => {
    setIsLikeListOpen(!isLikeListOpen);
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        게시글을 불러오는 중입니다...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!post) {
    return (
      <div className="text-center py-20 text-gray-500">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="flex justify-between text-gray-500 text-sm mb-6">
        <span>작성자: {post.authorName}</span>
        <div className="flex items-center space-x-4">
          <span>{new Date(post.createdAt).toLocaleString()}</span>

          {/* 수정/삭제 버튼 - 작성자에게만 표시 */}
          {isAuthenticated && isAuthor && (
            <div className="flex space-x-3">
              <Link
                href={`/boards/${boardId}/edit`}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
      {/* photos 배열이 null이 아닐 때만 렌더링 */}
      {post.photos && post.photos.length > 0 && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {post.photos.map((photoUrl, index) => (
            <img
              key={index}
              src={photoUrl}
              alt={`게시글 이미지 ${index + 1}`}
              className="rounded-xl w-full h-auto object-cover"
            />
          ))}
        </div>
      )}
      <p className="text-lg text-gray-800 whitespace-pre-line">
        {post.content}
      </p>

      {/* 좋아요 버튼 및 카운트 */}
      <div className="mt-6 flex justify-end items-center space-x-2">
        <button
          onClick={handleLikeToggle}
          className={`flex items-center space-x-1 px-4 py-2 rounded-full transition-colors ${
            isLiked
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isLiked ? "0" : "1.5"}
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <span>{isLiked ? "좋아요 취소" : "좋아요"}</span>
        </button>

        {/* 좋아요 개수 버튼 - 클릭하면 좋아요 리스트 표시 */}
        <button
          onClick={toggleLikeList}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center"
        >
          <span className="mr-1">❤️</span>
          <span>{likeCount}</span>
        </button>
      </div>

      {/* 좋아요 리스트 모달 */}
      {isLikeListOpen && (
        <LikeList
          isOpen={isLikeListOpen}
          onClose={() => setIsLikeListOpen(false)}
          postId={boardIdNumber.toString()}
        />
      )}

      {/* 댓글 섹션 */}
      <div className="mt-16">
        <h3 className="text-xl font-bold mb-6">
          댓글 <span className="text-gray-500">({comments.length})</span>
        </h3>
        <div className="space-y-6 mb-8">
          {comments.map((comment, index) => (
            <div key={index} className="pt-4 pb-5 border-b border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                  <span className="font-medium">{comment.author}</span>
                </div>
                <div className="text-sm text-gray-400 flex items-center">
                  <span>{comment.createdAt}</span>
                </div>
              </div>
              <p className="text-gray-800 pl-11">{comment.content}</p>
            </div>
          ))}
        </div>

        {/* 댓글 입력 */}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit}>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <textarea
                placeholder="댓글을 입력하세요..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-4 outline-none resize-none text-gray-800"
                rows={3}
              />
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#2c714c] text-white text-sm font-medium rounded-md hover:bg-[#225c3d] transition-colors"
              >
                댓글 작성
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-600">
              댓글을 작성하려면{" "}
              <a
                href="/members/login"
                className="text-[#2c714c] hover:underline"
              >
                로그인
              </a>{" "}
              이 필요합니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
