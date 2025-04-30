"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useGlobalLoginMember } from "../../../stores/auth/loginMember";
// import "@toast-ui/editor/dist/toastui-editor.css";
import Image from "next/image"; // Next.js의 Image 컴포넌트를 사용

// Toast UI Viewer 동적 임포트
const Viewer = dynamic(
  () => import("@toast-ui/react-editor").then((mod) => mod.Viewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full flex items-center justify-center">
        콘텐츠 로딩 중...
      </div>
    ),
  }
);

// Toast UI Editor CSS
import "@toast-ui/editor/dist/toastui-editor.css";

// Toast UI Editor CSS
import "@toast-ui/editor/dist/toastui-editor.css";

// 동적 임포트로 LikeList 컴포넌트 가져오기
import LikeList from "../../../components/LikeList"; // Ensure the alias resolves correctly

interface Post {
  boardId: number;
  title: string;
  content: string;
  authorName: string;
  authorId?: number;
  authorProfilePhoto?: string; // 작성자 프로필 사진 추가
  profilePhoto?: {
    url: string; // 프로필 이미지 URL
    key: string; // S3 키
  };
  createdAt: string;
  viewCount: number;
  likeCount: number;
  photos: string[] | null;
  likeUsers: string[];
}

interface Comment {
  id: number;
  userId: number;
  userName: string; // userName 필드 추가
  boardId: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author?: string; // author 속성 추가
  userProfileUrl?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  token?: string;
  profilePhoto?: {
    url: string;
    key: string;
  };
  profileImage?: string;
}

export default function BoardDetail() {
  const { loginMember, isLogin, setLoginMember } = useGlobalLoginMember();
  console.log("loginMember: " + loginMember);
  const router = useRouter();
  const { boardId } = useParams(); // boardId는 string 타입으로 반환됩니다.
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 0,
    name: "",
    email: "",
    profilePhoto: undefined,
  });
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [token, setToken] = useState<string | null>(null);
  const [isLikeListOpen, setIsLikeListOpen] = useState<boolean>(false);
  const viewerRef = useRef(null);

  // 상태 추가
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>("");

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
          "https://api.blog.momentree.site/api/v1/members/me",
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
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          // 게시글 데이터 가져오기
          const postResponse = await fetch(
            `https://api.blog.momentree.site/api/v1/boards/${boardIdNumber}`,
            {
              credentials: "include",
              headers,
            }
          );

          if (!postResponse.ok) {
            throw new Error("게시글 조회 실패");
          }

          const data = await postResponse.json();

          // 마크다운 내의 이미지 키를 URL로 변환
          if (data.content) {
            // S3 버킷 정보로 공개 URL 기본 주소 설정
            const bucket =
              process.env.NEXT_PUBLIC_S3_BUCKET || "momentrees3bucket";
            const region =
              process.env.NEXT_PUBLIC_AWS_REGION || "ap-northeast-2";
            const S3_PUBLIC_BASE = `https://${bucket}.s3.${region}.amazonaws.com`;

            // 상대 경로 패턴 찾기: 1) ![alt](/uploads/xxxx.jpg) 2) ![alt](uploads/xxxx.jpg)
            const relativePathPattern = /!\[(.*?)\]\(\/?uploads\/([^)]+)\)/g;

            // 키를 공개 URL로 변환
            data.content = data.content.replace(
              relativePathPattern,

              (match: string, alt: string, imageKey: string) => {
                const imageUrl = `${S3_PUBLIC_BASE}/uploads/${imageKey}`;
                console.log("이미지 URL로 변환:", imageKey, "->", imageUrl);
                return `![${alt}](${imageUrl})`;
              }
            );
          }

          // 대표 이미지 URL도 변환
          if (data.photos && data.photos.length > 0) {
            const bucket =
              process.env.NEXT_PUBLIC_S3_BUCKET || "momentrees3bucket";
            const region =
              process.env.NEXT_PUBLIC_AWS_REGION || "ap-northeast-2";
            const S3_PUBLIC_BASE = `https://${bucket}.s3.${region}.amazonaws.com`;

            data.photos = data.photos.map((photoUrl: string) => {
              if (photoUrl.startsWith("uploads/")) {
                return `${S3_PUBLIC_BASE}/${photoUrl}`;
              }
              return photoUrl;
            });
          }

          // 프로필 사진 URL도 처리
          if (data.authorProfilePhoto) {
            const bucket =
              process.env.NEXT_PUBLIC_S3_BUCKET || "momentrees3bucket";
            const region =
              process.env.NEXT_PUBLIC_AWS_REGION || "ap-northeast-2";
            const S3_PUBLIC_BASE = `https://${bucket}.s3.${region}.amazonaws.com`;

            // 상대 경로면 절대 경로로 변환
            if (data.authorProfilePhoto.startsWith("uploads/")) {
              data.authorProfilePhoto = `${S3_PUBLIC_BASE}/${data.authorProfilePhoto}`;
            }
          }

          setPost(data);
          setLikeCount(data.likeCount || 0);

          // 댓글 데이터 따로 가져오기
          const commentsResponse = await fetch(
            `https://api.blog.momentree.site/api/v1/boards/${boardIdNumber}/comments`,
            {
              credentials: "include",
              headers,
            }
          );

          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            // 댓글 데이터 처리 부분 수정
            const processComments = (commentsData: any[]) => {
              const bucket =
                process.env.NEXT_PUBLIC_S3_BUCKET || "momentrees3bucket";
              const region =
                process.env.NEXT_PUBLIC_AWS_REGION || "ap-northeast-2";
              const S3_PUBLIC_BASE = `https://${bucket}.s3.${region}.amazonaws.com`;

              return commentsData.map((comment) => ({
                ...comment,
                userProfileUrl: comment.userProfileUrl
                  ? comment.userProfileUrl.startsWith("http") // http로 시작하는지 먼저 확인
                    ? comment.userProfileUrl // 이미 완전한 URL이면 그대로 사용
                    : comment.userProfileUrl.startsWith("uploads/")
                    ? `${S3_PUBLIC_BASE}/${comment.userProfileUrl}` // uploads/로 시작하면 S3 URL 생성
                    : `${S3_PUBLIC_BASE}/uploads/${comment.userProfileUrl}` // 그 외의 경우 uploads/ 추가
                  : "/logo.png", // userProfileUrl이 없는 경우 기본 이미지
              }));
            };
            const processedComments = processComments(commentsData);
            setComments(processedComments);
          }

          if (currentUser && Number(data.userId) === Number(currentUser.id)) {
            setIsAuthor(true);
          }

          // 좋아요 상태 확인
          if (currentUser && data.likeUsers && Array.isArray(data.likeUsers)) {
            if (typeof data.likeUsers[0] === "string") {
              setIsLiked(data.likeUsers.includes(currentUser.name));
            } else {
              setIsLiked(
                data.likeUsers.some(
                  (user: any) => Number(user.id) === Number(currentUser.id)
                )
              );
            }
          }
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
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      router.push("/members/login");
      return;
    }

    try {
      const method = isLiked ? "DELETE" : "POST";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `https://api.blog.momentree.site/api/v1/boards/${boardIdNumber}/likes`,
        {
          method: method,
          headers,
          credentials: "include",
        }
      );

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
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

  // 댓글을 가져오는 부분 수정
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isLogin) {
      alert("로그인이 필요합니다.");
      router.push("/members/login");
      return;
    }

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `https://api.blog.momentree.site/api/v1/boards/${boardIdNumber}/comments`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            content: commentText,
          }),
        }
      );

      if (res.ok) {
        const savedComment = await res.json();

        // 새 댓글에 loginMember 정보 사용
        const newComment = {
          ...savedComment,
          userProfileUrl: loginMember.profilePhotoUrl || "/logo.png",
          userName: loginMember.name,
          userId: loginMember.id,
          createdAt: savedComment.createdAt || new Date().toISOString(),
        };

        setComments((prev) => [...prev, newComment]);
        setCommentText("");
      } else {
        alert("댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  // 댓글 수정 핸들러
  const handleCommentEdit = async (commentId: number) => {
    if (!editCommentText.trim()) return;

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `https://api.blog.momentree.site/api/v1/boards/${boardIdNumber}/comments/${commentId}`,
        {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({ content: editCommentText }),
        }
      );

      if (res.ok) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, content: editCommentText }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditCommentText("");
      } else {
        alert("댓글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  };

  // 댓글 삭제 핸들러
  const handleCommentDelete = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `https://api.blog.momentree.site/api/v1/boards/${boardIdNumber}/comments/${commentId}`,
        {
          method: "DELETE",
          headers,
          credentials: "include",
        }
      );

      if (res.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
      } else {
        alert("댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };

  // 게시글 삭제 핸들러
  const handleDelete = async () => {
    // if (!isAuthor) {
    //   alert("게시글 삭제 권한이 없습니다.");
    //   return;
    // }

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
          router.push("/members/login/myblog");
        } else {
          const errorData = await response.json().catch(() => null);
          const errorMessage =
            errorData?.message || "게시글 삭제에 실패했습니다.";
          alert(errorMessage);
        }
      } catch (error) {
        console.error("게시글 삭제 오류:", error);
        alert(
          "게시글 삭제 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요."
        );
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 페이지 상단 정보 섹션 */}
      <div className="mb-12 pb-8 border-b border-gray-100">
        {/* 카테고리 + 생성 날짜 */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span className="px-2 py-1 bg-gray-50 rounded-full">블로그</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        {/* 제목 */}
        <h1 className="text-4xl font-bold text-gray-800 mb-8">{post.title}</h1>

        {/* 작성자 정보 + 수정/삭제 버튼 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {post.profilePhoto?.url ? (
              <Image
                src={post.profilePhoto.url || "/default-profile.png"} // 기본 이미지 설정
                alt={post.authorName || "작성자"}
                width={40}
                height={40}
                className="object-cover rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-gray-500 font-medium">
                  {post.authorName && post.authorName[0]}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-800">{post.authorName}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* 수정/삭제 버튼 - 작성자에게만 표시 */}
          {loginMember.name === post.authorName && (
            <div className="flex space-x-3">
              <Link
                href={`/boards/${boardId}/edit`}
                className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors font-medium"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 본문 콘텐츠 영역 */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        {/* 대표 이미지 */}
        {post.photos && post.photos.length > 0 && (
          <div className="mb-8 flex justify-center relative">
            <img
              src={post.photos[0]}
              alt="대표 이미지"
              className="rounded-xl max-h-[500px] object-contain"
            />
            {post.photos.length > 1 && (
              <div className="absolute bottom-4 right-4">
                <Link
                  href={`/boards/${boardId}/photos`}
                  className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm hover:bg-opacity-80 transition flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  전체보기 ({post.photos.length}장)
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Toast UI Viewer로 마크다운 콘텐츠 렌더링 */}
        <div className="markdown-viewer pb-10 mx-auto max-w-3xl">
          <Viewer initialValue={post.content || ""} ref={viewerRef} />
        </div>

        {/* 좋아요 영역 */}
        <div className="mt-10 mb-16 flex justify-center">
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleLikeToggle}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isLiked
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            </button>

            {/* 좋아요 개수 버튼 - 클릭하면 좋아요 리스트 표시 */}
            <button
              onClick={toggleLikeList}
              className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              {likeCount > 0
                ? `${likeCount}명이 좋아합니다`
                : "첫 좋아요를 눌러보세요"}
            </button>
          </div>
        </div>
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
      <div className="mt-16 bg-white rounded-xl p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-8 flex items-center">
          <span className="mr-2">💬</span>
          <span>댓글</span>
          <span className="text-gray-500 ml-2">({comments.length})</span>
        </h3>

        <div className="space-y-6 mb-8">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="pt-4 pb-5 border-b border-gray-200"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-3">
                      <Image
                        src={comment.userProfileUrl || "/logo.png"} // 경로는 맞음
                        alt={comment.userName || "사용자"}
                        width={32}
                        height={32}
                        className="object-cover w-8 h-8 rounded-full"
                        priority // 이미지 로딩 우선순위 추가
                        unoptimized // Next.js의 이미지 최적화 비활성화
                        onError={(e: any) => {
                          // 이미지 로드 실패시 콘솔에 에러 로그
                          console.error("Image load failed:", e);
                          // 이미지 로드 실패시 기본 이미지로 대체
                          e.target.src = "/logo.png";
                        }}
                      />
                    </div>
                    <span className="font-medium">{comment.userName}</span>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center space-x-4">
                    <span>
                      {new Date(comment.createdAt).toLocaleString("ko-KR")}
                    </span>
                    {currentUser?.id === comment.userId && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditCommentText(comment.content);
                          }}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleCommentDelete(comment.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {editingCommentId === comment.id ? (
                  // 수정 모드일 때 보여줄 폼
                  <div className="pl-11">
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => handleCommentEdit(comment.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditCommentText("");
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // 일반 모드일 때 보여줄 내용
                  <p className="text-gray-700 pl-11">{comment.content}</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>첫 댓글을 남겨보세요!</p>
            </div>
          )}
        </div>

        {/* 댓글 입력 */}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit}>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <textarea
                placeholder="댓글을 입력하세요..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-4 outline-none resize-none text-gray-800 min-h-[100px]"
                rows={3}
              />
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                className="px-5 py-2 bg-[#2c714c] text-white font-medium rounded-md hover:bg-[#225c3d] transition-colors"
                disabled={!commentText.trim()}
              >
                댓글 작성
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-6 rounded-lg text-center border border-gray-200">
            <p className="text-gray-600 mb-4">
              댓글을 작성하려면 로그인이 필요합니다.
            </p>
            <Link
              href="/members/login"
              className="inline-block px-5 py-2 bg-[#2c714c] text-white font-medium rounded-md hover:bg-[#225c3d] transition-colors"
            >
              로그인하기
            </Link>
          </div>
        )}
      </div>

      {/* CSS - 스타일 오버라이드 */}
      <style jsx global>{`
        /* 페이지 전체 배경색 */
        body {
          background-color: #ffffff;
        }

        /* 콘텐츠 영역 스타일링 - 중앙 정렬 */
        .markdown-viewer .toastui-editor-contents {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
          font-size: 1.25rem; /* 글씨 크기 증가: 1.125rem -> 1.25rem (20px) */
          line-height: 1.8;
          color: #333;
          padding: 0 2rem;
          text-align: left !important;
        }

        /* 이미지 중앙 정렬 (중요!) */
        .toastui-editor-contents img {
          display: block !important;
          max-width: 100% !important; /* 이미지 크기 증가: 90% -> 100% */
          margin: 2rem auto !important;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* 제목 스타일 */
        .toastui-editor-contents h1,
        .toastui-editor-contents h2,
        .toastui-editor-contents h3,
        .toastui-editor-contents h4,
        .toastui-editor-contents h5,
        .toastui-editor-contents h6 {
          margin: 2rem 0 1rem;
          font-weight: 600;
          text-align: left;
        }

        .toastui-editor-contents h1 {
          font-size: 2rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }

        .toastui-editor-contents h2 {
          font-size: 1.75rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }

        .toastui-editor-contents h3 {
          font-size: 1.5rem;
        }

        /* 단락 스타일 */
        .toastui-editor-contents p {
          margin: 1rem 0;
          line-height: 1.8;
          text-align: left;
        }

        /* 인용구 스타일 */
        .toastui-editor-contents blockquote {
          background-color: #f8f9fa;
          border-left: 4px solid #2c714c;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          color: #555;
        }

        /* 코드 블록 스타일 */
        .toastui-editor-contents pre {
          background-color: #f6f8fa;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1.5rem 0;
          overflow-x: auto;
        }

        /* 인라인 코드 스타일 */
        .toastui-editor-contents code {
          background-color: #f6f8fa;
          border-radius: 0.25rem;
          padding: 0.2rem 0.4rem;
          font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo,
            monospace;
          font-size: 0.875em;
        }

        /* 리스트 스타일 */
        .toastui-editor-contents ul,
        .toastui-editor-contents ol {
          margin: 1rem 0 1rem 2rem;
          text-align: left;
        }

        .toastui-editor-contents li {
          margin-bottom: 0.5rem;
          text-align: left;
        }

        /* 테이블 스타일 */
        .toastui-editor-contents table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem auto;
        }

        .toastui-editor-contents th,
        .toastui-editor-contents td {
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1rem;
          text-align: left;
        }

        .toastui-editor-contents th {
          background-color: #f8fafc;
        }

        .toastui-editor-contents tr:nth-child(even) {
          background-color: #f9fafb;
        }

        /* 수평선 스타일 */
        .toastui-editor-contents hr {
          border: 0;
          height: 1px;
          background-color: #e2e8f0;
          margin: 2rem 0;
        }

        /* 링크 스타일 */
        .toastui-editor-contents a {
          color: #2c714c;
          text-decoration: none;
        }

        .toastui-editor-contents a:hover {
          text-decoration: underline;
        }

        /* 에디터 불필요한 요소 숨김 */
        .toastui-editor-mode-switch {
          display: none !important;
        }

        /* 이 스타일을 통해 Write 페이지와 충돌을 방지합니다 */
        #viewer-content-body-container .toastui-editor-contents p,
        #viewer-content-body-container .toastui-editor-contents h1,
        #viewer-content-body-container .toastui-editor-contents h2,
        #viewer-content-body-container .toastui-editor-contents h3,
        #viewer-content-body-container .toastui-editor-contents h4,
        #viewer-content-body-container .toastui-editor-contents h5,
        #viewer-content-body-container .toastui-editor-contents h6,
        #viewer-content-body-container .toastui-editor-contents ul,
        #viewer-content-body-container .toastui-editor-contents ol,
        #viewer-content-body-container .toastui-editor-contents blockquote {
          text-align: left;
        }
      `}</style>
    </div>
  );
}
