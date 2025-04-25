"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
// axios 사용을 위해 임포트 (fetch 대신 axios 사용 권장)
import axios from "axios";
import UserFollower from "@/components/user_follower";

// 타입 정의
// Comments 컴포넌트에서 사용될 타입 (수정 불필요)
interface CommentDto {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorProfileImage?: string;
  createdAt: string;
  modifiedAt: string;
}

// BoardListResponseDto 타입 (수정 불필요)
interface BoardListResponseDto {
  id: number;
  title: string;
  blogId: number;
  mainPhotoUrl: string | null;
  likeCount: number;
  commentCount: number;
}

// PagedBoards 타입 (수정 불필요)
interface PagedBoards {
  content: BoardListResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// BlogDetails 인터페이스 수정: 블로그 주인 유저 ID 필드 추가
interface BlogDetails {
  id: number; // 블로그 ID
  name: string; // 블로그 이름
  userName: string; // 블로그 주인 유저의 이름
  userEmail: string; // 블로그 주인 유저의 이메일
  profileImage: string; // 블로그 주인 유저의 프로필 이미지 URL
  postsCount: number;
  // 이 카운트가 블로그의 카운트인지 유저의 카운트인지 백엔드 API 명세 확인 필요. 유저의 카운트라고 가정하고 진행.
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean; // 현재 로그인된 유저가 이 블로그 주인 유저를 팔로우하는지 여부
  boards: PagedBoards;
  ownerId: number; // <-- 블로그 주인 유저의 ID 필드 추가 (백엔드 응답에 포함되어야 함)
}

// Comments 컴포넌트 (동일하게 유지)
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
  const id = params?.id; // 현재 보고 있는 블로그의 ID (URL 파라미터)

  const [blogDetail, setBlogDetail] = useState<BlogDetails | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // isFollowing과 팔로워/팔로잉 수는 blogDetail 상태에서 가져와 사용합니다.
  // blogDetail이 로드되면 isFollowing, followerCount, followingCount도 함께 업데이트됩니다.
  // 별도의 상태로 관리하는 대신 blogDetail 상태의 값을 사용하거나,
  // blogDetail 업데이트 시 이 상태들을 동기화하는 방식으로 합니다.
  // 현재 코드에서는 isFollowing, followerCount, followingCount를 별도 상태로 관리하므로 이 방식을 따르겠습니다.
  const [isFollowing, setIsFollowing] = useState(false); // 초기값 false
  const [followerCount, setFollowerCount] = useState(0); // 초기값 0
  const [followingCount, setFollowingCount] = useState(0); // 초기값 0

  const [showFollowModal, setShowFollowModal] = useState(false);
  const [activeFollowTab, setActiveFollowTab] = useState<
    "followers" | "following"
  >("followers");

  // 팔로워/팔로잉 수 조회 함수 수정: 유저 ID를 인자로 받도록 변경
  // 이 함수는 블로그 주인의 유저 ID를 받아서 해당 유저의 팔로우 카운트를 가져옵니다.
  const fetchFollowCounts = async (ownerUserId: number) => {
    // 인자를 ownerUserId로 변경
    if (!ownerUserId) {
      console.warn("Owner user ID is missing, cannot fetch follow counts.");
      setFollowerCount(0);
      setFollowingCount(0);
      return;
    }
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090";
      const [followersRes, followingRes] = await Promise.all([
        // 백엔드 API는 유저 ID를 경로 파라미터로 기대합니다.
        fetch(
          `${apiBaseUrl}/api/v1/follows/members/${ownerUserId}/followers/counts`,
          { credentials: "include" }
        ),
        fetch(
          `${apiBaseUrl}/api/v1/follows/members/${ownerUserId}/followings/counts`,
          { credentials: "include" }
        ),
      ]);

      if (followersRes.ok && followingRes.ok) {
        const followers = await followersRes.json(); // 백엔드가 숫자만 응답한다고 가정
        const following = await followingRes.json(); // 백엔드가 숫자만 응답한다고 가정
        setFollowerCount(followers);
        setFollowingCount(following);
      } else {
        console.error(
          "Failed to fetch follow counts: Response not ok",
          followersRes.status,
          followingRes.status
        );
        // 실패 시 카운트 초기화 (선택 사항)
        setFollowerCount(0);
        setFollowingCount(0);
      }
    } catch (error) {
      console.error("팔로우 카운트 조회 실패:", error);
      // 네트워크 또는 기타 오류 시 카운트 초기화 (선택 사항)
      setFollowerCount(0);
      setFollowingCount(0);
    }
  };

  // 팔로우/언팔로우 처리 함수 수정
  const handleFollowToggle = async () => {
    // 블로그 상세 정보와 블로그 주인 ID가 로드되었는지 확인
    if (!blogDetail?.ownerId) {
      console.error(
        "Cannot toggle follow: Blog detail or owner ID is missing."
      );
      alert("오류: 블로그 정보를 불러오는 중 문제가 발생했습니다.");
      return;
    }

    // 1. 로그인 상태 확인 (localStorage 토큰 사용)
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      // 필요시 로그인 페이지로 리다이렉트
      // router.push("/members/login");
      return;
    }

    // 현재 isFollowing 상태를 사용하여 POST 또는 DELETE 결정
    const currentFollowStatus = isFollowing; // 토글 전 상태를 저장

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090";
      // 2. 백엔드 API 엔드포인트 결정 (follow 또는 unfollow)
      const action = currentFollowStatus ? "unfollow" : "follow";
      // HTTP 메소드 결정
      const method = currentFollowStatus ? "DELETE" : "POST";

      // 3. & 4. 올바른 URL 구성 (쿼리 파라미터 사용) 및 Method 설정
      // 백엔드는 팔로우/언팔로우 대상 유저의 ID를 'followingid' 쿼리 파라미터로 기대합니다.
      // blogDetail.ownerId는 블로그 주인 유저의 ID입니다.
      const url = `${apiBaseUrl}/api/v1/follows/${action}?followingid=${blogDetail.ownerId}`; // <-- URL 구성 수정

      console.log(`Attempting ${method} request to ${url} for follow toggle.`);

      // fetch 대신 axios 사용 권장 (에러 핸들링 용이)
      // const response = await fetch(url, { ... });

      const response = await axios({
        // axios 사용 예시
        method: method, // 메소드 설정
        url: url, // URL 설정
        headers: {
          "Content-Type": "application/json", // Content-Type 유지
          Authorization: `Bearer ${token}`, // <-- Authorization 헤더 추가 (필수!)
          Accept: "application/json", // 응답 타입 명시
        },
        withCredentials: true, // 쿠키 포함 (세션 유지 등)
        // body: JSON.stringify({ followingId: blogDetail?.id }), // <-- 본문 제거 (쿼리 파라미터 사용)
        data: undefined, // DELETE/POST with query param usually have no body
      });

      if (response.status >= 200 && response.status < 300) {
        // 2xx 응답은 성공
        // 5. UI 업데이트: isFollowing 상태 변경 및 팔로워 수 업데이트
        const newFollowStatus = !currentFollowStatus;
        setIsFollowing(newFollowStatus); // 상태 토글

        // 팔로워 수 업데이트
        // 언팔로우 성공 시 -1, 팔로우 성공 시 +1
        setFollowerCount((prev) => (currentFollowStatus ? prev - 1 : prev + 1));

        // 성공 메시지 표시 (백엔드 응답 메시지 사용 또는 기본 메시지)
        const successMessage =
          response.data ||
          (currentFollowStatus ? "언팔로우 되었습니다." : "팔로우 되었습니다.");
        alert(successMessage);

        // 더 정확한 팔로워 수를 원하면 성공 후 다시 fetchFollowCounts 호출 (성능 고려)
        // if (blogDetail.ownerId) {
        //     fetchFollowCounts(blogDetail.ownerId);
        // }
      } else {
        // 2xx 외 응답은 실패 (4xx, 5xx 등)
        console.error(
          `API Error ${response.status}:`,
          response.data || response.statusText
        );

        // 에러 메시지 추출 (AxiosError 구조에 맞춰)
        const errorDataString =
          typeof response.data === "object"
            ? JSON.stringify(response.data)
            : response.data;
        const errorMessage =
          errorDataString || response.statusText || "팔로우 처리 실패";

        if (response.status === 401) {
          alert(
            "인증 정보가 만료되었습니다. 세션이 만료되었습니다. 다시 로그인 해주세요."
          );
          // router.push("/members/login");
        } else if (response.status === 400) {
          // 백엔드에서 로직 오류 시 400 응답 (예: 이미 팔로우 중, 팔로우하고 있지 않음)
          alert(`팔로우 실패: ${errorMessage}`);
        } else {
          alert(`팔로우 처리 중 오류 발생: ${errorMessage}`);
        }
        // 실패 시 UI 상태는 변경하지 않습니다 (또는 원래 상태로 복구)
      }
    } catch (error) {
      // 네트워크 오류 또는 fetch/axios 호출 자체에서 발생한 오류
      console.error("Network or other error during follow toggle:", error);
      // 오류 메시지 추출 (AxiosError 또는 기본 Error 객체)
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data
          ? typeof error.response.data === "object"
            ? JSON.stringify(error.response.data)
            : error.response.data
          : error instanceof Error
          ? error.message
          : String(error);
      alert(`팔로우 처리 중 네트워크 오류 발생: ${errorMessage}`);
      // 실패 시 UI 상태는 변경하지 않습니다 (또는 원래 상태로 복구)
    }
  };

  // 팔로워/팔로잉 모달 표시 함수 (동일하게 유지)
  const handleShowFollowers = () => {
    // blogDetail이 로드되었고 ownerId가 있는지 확인 후 모달 열기
    if (!blogDetail?.ownerId) {
      alert("오류: 블로그 정보를 불러오는 중 문제가 발생했습니다.");
      return;
    }
    setActiveFollowTab("followers");
    setShowFollowModal(true);
  };

  const handleShowFollowing = () => {
    // blogDetail이 로드되었고 ownerId가 있는지 확인 후 모달 열기
    if (!blogDetail?.ownerId) {
      alert("오류: 블로그 정보를 불러오는 중 문제가 발생했습니다.");
      return;
    }
    setActiveFollowTab("following");
    setShowFollowModal(true);
  };

  // 블로그 상세 정보 가져오기 (fetchBlog) 함수
  // useEffect 훅 내부에서 정의 및 호출
  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      setError(null); // 새로운 로딩 시작 시 에러 초기화
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090";
        const response = await fetch(
          `${apiBaseUrl}/api/v1/blogs/${id}/details?page=${currentPage}&size=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              // 블로그 상세 조회 시에도 인증 정보 필요할 수 있습니다.
              // 쿠키로 인증한다면 credentials: 'include' 만으로 충분합니다.
              // 만약 Authorization 헤더도 필요하다면 여기에 추가해야 합니다.
              // "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
            },
            credentials: "include", // 쿠키 포함
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          // 에러 메시지 추출 (응답 본문 > statusText > 기본 메시지 순)
          const errorMsg =
            errorData?.message ||
            response.statusText ||
            "블로그를 불러오는데 실패했습니다";
          console.error(
            `Error fetching blog ${response.status}:`,
            errorData || response.statusText
          );
          throw new Error(errorMsg);
        }

        const data: BlogDetails = await response.json(); // 응답 데이터를 BlogDetails 타입으로 지정
        console.log("Blog details fetched:", data);

        // 상태 업데이트
        setBlogDetail(data);
        // 블로그 상세 정보에 isFollowing, followerCount, followingCount, ownerId가 포함되어 있다고 가정
        setIsFollowing(data.isFollowing || false); // 초기 팔로우 상태 설정 (기본값 false)

        // 팔로우 카운트 조회 추가 (블로그 주인의 유저 ID로 호출)
        // 백엔드 응답에 ownerId가 있는지 확인하고 fetchFollowCounts 호출
        if (data.ownerId) {
          // <-- ownerId가 응답에 있는지 체크
          fetchFollowCounts(data.ownerId); // <-- 블로그 주인 유저 ID로 호출
        } else {
          console.warn(
            "Blog owner user ID (ownerId) not available in blog details response."
          );
          // ownerId가 없으면 카운트 API 호출 불가능. 블로그 상세 응답의 카운트 사용.
          setFollowerCount(data.followerCount || 0);
          setFollowingCount(data.followingCount || 0);
          // 향후 백엔드와 협의하여 ownerId를 응답에 추가하도록 요청하는 것이 좋습니다.
        }
      } catch (err) {
        console.error("에러 상세:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "블로그 정보를 불러오는데 실패했습니다";
        setError(errorMessage); // 에러 메시지 상태 업데이트
      } finally {
        setIsLoading(false);
      }
    };

    // id가 유효할 때만 fetchBlog 호출
    if (id) {
      fetchBlog();
    }
    // 의존성 배열: id 또는 currentPage가 변경될 때마다 fetchBlog 재실행
  }, [id, currentPage]); // fetchBlog 내에서 사용되는 상태/prop 추가

  // 로딩 중 UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩중...
      </div>
    );
  }

  // 에러 발생 시 UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // blogDetail이 로드되지 않았거나 boards가 없으면 게시글 목록 렌더링 안함
  const boards = blogDetail?.boards?.content || [];

  // 페이지네이션 렌더링 함수 (동일하게 유지)
  const renderPagination = () => {
    if (!blogDetail || !blogDetail.boards || blogDetail.boards.totalPages <= 1)
      return null; // 페이지가 1개 이하면 페이지네이션 숨김

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
                {/* 프로필 이미지 */}
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
                      {/* 프로필 이미지가 없을 경우 이니셜 또는 기본 아이콘 */}
                      {blogDetail?.userName
                        ? blogDetail.userName.charAt(0)
                        : "?"}
                    </div>
                  )}
                </div>
                {/* 유저 이름 및 이메일 */}
                <h2 className="text-xl font-bold mb-1">
                  {blogDetail?.userName}
                </h2>{" "}
                {/* 블로그 이름 대신 유저 이름 표시 */}
                <p className="text-gray-500 mb-4">{blogDetail?.userEmail}</p>
                {/* 팔로우/언팔로우 버튼 */}
                {/* 로그인된 유저가 자신의 블로그를 보고 있을 때는 팔로우 버튼 숨기기 (선택 사항) */}
                {/* TODO: 로그인된 유저 ID를 Context API에서 가져와 blogDetail.ownerId와 비교 */}
                {/* 현재는 로그인 유저 ID를 모르므로 이 로직은 나중에 추가 */}
                {/* <button
                     onClick={handleFollowToggle}
                     className="..."
                 >
                     {isFollowing ? "팔로잉" : "팔로우"}
                 </button> */}
                {/* 일단은 항상 버튼이 보이게 하고, 백엔드에서 자신 팔로우 시 400 에러 처리되도록 합니다. */}
                <button
                  onClick={handleFollowToggle} // 수정된 handleFollowToggle 함수 연결
                  className={`w-full py-2 px-4 rounded-md mb-4 transition-colors ${
                    isFollowing // isFollowing 상태에 따라 스타일 변경
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-900" // 팔로잉 상태
                      : "bg-black text-white hover:bg-gray-800" // 팔로우 안 하는 상태
                  }`}
                >
                  {/* 로딩 상태를 별도로 관리하면 버튼 텍스트 및 비활성화 처리 가능 */}
                  {/* {followStatus === 'loading' ? '처리 중...' : (isFollowing ? "팔로잉" : "팔로우")} */}
                  {isFollowing ? "팔로잉" : "팔로우"}{" "}
                  {/* isFollowing 상태에 따라 텍스트 변경 */}
                </button>
                <div className="w-full flex flex-col space-y-2">
                  <div className="flex justify-between p-2">
                    <p className="text-black">게시글</p>
                    <p className="font-bold">
                      {blogDetail?.postsCount || 0}{" "}
                      {/* blogDetail에서 postsCount 사용 */}
                    </p>
                  </div>
                  {/* 팔로워 수 표시 및 모달 열기 */}
                  <div
                    className="flex justify-between p-2 cursor-pointer hover:bg-gray-50 rounded"
                    onClick={handleShowFollowers} // 수정된 handleShowFollowers 함수 연결
                  >
                    <p className="text-black">팔로워</p>
                    {/* 팔로워 수 상태 표시 */}
                    <p className="font-bold">{followerCount}</p>
                  </div>
                  {/* 팔로잉 수 표시 및 모달 열기 */}
                  <div
                    className="flex justify-between p-2 cursor-pointer hover:bg-gray-50 rounded"
                    onClick={handleShowFollowing} // 수정된 handleShowFollowing 함수 연결
                  >
                    <p className="text-black">팔로잉</p>
                    {/* 팔로잉 수 상태 표시 */}
                    <p className="font-bold">{followingCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 메인 컨텐츠 - 게시글 목록 */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">게시글 목록</h1>
            {boards.length > 0 ? (
              <>
                <div className="space-y-4">
                  {boards.map((board) => (
                    <div
                      key={board.id}
                      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/boards/${board.id}`)} // 게시글 상세 페이지로 이동
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
                {renderPagination()} {/* 페이지네이션 렌더링 */}
              </>
            ) : (
              // 게시글이 없을 경우 메시지
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">아직 작성한 게시글이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
        {/* 팔로워/팔로잉 모달 */}
        {/* 모달에 넘겨주는 userId는 모달에서 목록을 조회할 대상 유저의 ID여야 합니다. */}
        {/* 블로그 주인의 유저 ID (ownerId)를 넘겨줘야 합니다. */}
        <UserFollower
          isOpen={showFollowModal}
          onClose={() => setShowFollowModal(false)}
          userId={blogDetail?.ownerId?.toString()} // <-- 모달에 블로그 주인 유저 ID 전달
          initialTab={activeFollowTab}
        />
      </main>
    </div>
  );
}
