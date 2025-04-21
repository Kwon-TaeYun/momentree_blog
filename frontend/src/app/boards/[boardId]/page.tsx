"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { IoPersonOutline, IoImagesOutline } from "react-icons/io5";
import { MdOutlineDateRange, MdOutlineRemoveRedEye } from "react-icons/md";
import { FaRegComment } from "react-icons/fa";

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
  blogName?: string; // 추가
  date?: string; // 추가
  image?: string; // 추가
  views?: number; // 추가
  keyFeatures?: string[]; // 추가
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
        const headers: HeadersInit = {};

        // 토큰이 있으면 헤더에 추가
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          `http://localhost:8090/api/v1/boards/${boardIdNumber}`,
          {
            method: "DELETE",
            headers,
            credentials: "include",
          }
        );

        if (response.ok) {
          alert("게시글이 삭제되었습니다.");
          router.push("/boards"); // 게시글 목록으로 이동
        } else {
          alert("게시글 삭제에 실패했습니다.");
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* 메인 콘텐츠 */}
      <main className="flex-grow">
        <div className="max-w-screen-lg mx-auto px-4 py-12">
          {/* 제목 및 메타 정보 */}
          <div className="mb-12">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h1>

              {/* 작성자인 경우 수정/삭제 버튼 */}
              {isAuthor && (
                <div className="flex gap-3 ml-4">
                  <Link
                    href={`/boards/${boardId}/edit`}
                    className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 active:shadow-inner transition-colors"
                  >
                    <HiOutlinePencilAlt className="mr-1.5 text-lg" />
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 active:shadow-inner transition-colors"
                  >
                    <HiOutlineTrash className="mr-1.5 text-lg" />
                    삭제
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center text-gray-500 mb-8">
              <Link
                href={`/users/${post.authorId || ""}`}
                className="flex items-center justify-center border border-gray-200 rounded-full w-9 h-9 mr-2 hover:border-gray-300 transition-colors"
              >
                <IoPersonOutline className="text-gray-500" />
              </Link>
              <Link
                href={`/users/${post.authorId || ""}`}
                className="bg-gradient-to-r from-[#2c714c]/10 to-[#2c714c]/5 px-3 py-1 rounded-md font-medium text-[#2c714c] hover:from-[#2c714c]/20 hover:to-[#2c714c]/10 transition-all mr-4"
              >
                {post.blogName || post.authorName}
              </Link>
              <span className="flex items-center mr-4">
                <MdOutlineDateRange className="mr-1" />
                {post.date || new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* 상단 액션 버튼 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <MdOutlineRemoveRedEye className="mr-1" />
                  {post.views || post.viewCount || 0}
                </span>
                <span className="flex items-center">
                  <FaRegComment className="mr-1" />
                  {comments.length}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* 좋아요 버튼 */}
                <button
                  onClick={handleLikeToggle}
                  className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors active:scale-90 active:shadow-inner hover:shadow-md"
                  style={{
                    borderColor: isLiked ? "#ff6b6b" : "#e9ecef",
                    color: isLiked ? "#ff6b6b" : "#868e96",
                    backgroundColor: isLiked ? "#fff5f5" : "white",
                  }}
                >
                  {isLiked ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                  )}
                </button>
                <span className="text-gray-600">{likeCount}</span>

                {/* 게시글/사진 뷰 선택 */}
                <div className="flex rounded-md overflow-hidden border border-gray-200 ml-2 shadow-sm">
                  <button
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 text-sm border-0 active:bg-gray-200 transition-colors"
                    disabled
                  >
                    <HiOutlineDocumentText className="text-lg" />
                    <span>게시글</span>
                  </button>
                  <Link
                    href={`/boards/${boardId}/photos`}
                    className="flex items-center gap-1 bg-white text-gray-600 hover:bg-gray-50 active:bg-gray-100 px-3 py-1.5 text-sm border-0 transition-colors"
                  >
                    <IoImagesOutline className="text-lg" />
                    <span>사진</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="w-full h-px bg-gray-200 mb-8"></div>

          {/* 게시물 내용 */}
          <div className="prose max-w-none mb-12">
            <p className="text-lg leading-relaxed text-gray-800 mb-8">
              {post.content}
            </p>

            {post.image && (
              <div className="mb-10">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {post.keyFeatures && post.keyFeatures.length > 0 && (
              <div className="mb-8">
                <p className="font-medium text-lg mb-4">주요 특징:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-800">
                  {post.keyFeatures.map((feature, index) => (
                    <li key={index} className="text-lg">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-sm text-gray-500 mt-10 pt-4 border-t border-gray-200">
              최초 등록일:{" "}
              {post.date || new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>

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
      </main>
    </div>
  );
}
