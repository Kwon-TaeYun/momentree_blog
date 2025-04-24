import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios"; // axios 임포트 필요

interface UserFollowerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // 타겟 유저 ID
  initialTab?: "followers" | "following"; // 초기 탭
}

// 백엔드 UserFollowDto에 맞춰 User 인터페이스 정의
interface User {
  id: number;
  name: string;
  status: string; // 예: ACTIVE, DELETED
  currentProfilePhoto?: {
    // 프로필 사진 정보 (있을 수도, 없을 수도)
    url: string;
  } | null;
  isFollowing?: boolean; // 로그인한 유저가 이 목록의 유저를 팔로우하는지 여부 (백엔드 지원 필요)
}

const UserFollower: React.FC<UserFollowerProps> = ({
  isOpen,
  onClose,
  userId,
  initialTab = "followers",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    initialTab
  );
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // 팔로워와 팔로잉 목록을 가져오는 함수 (404 오류 해결)
  const fetchFollowData = async () => {
    if (!userId || !isOpen) return;

    setLoading(true);
    try {
      const baseURL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090";

      // --- 엔드포인트 구성 수정: activeTab 값에 따라 정확한 백엔드 경로 사용 ---
      const endpoint = `${baseURL}/api/v1/follows/members/${userId}/${
        activeTab === "followers" ? "followers" : "followings"
      }`; // <-- 404 오류 해결!

      console.log(
        `Workspaceing data for tab: ${activeTab} from endpoint: ${endpoint}. Relying on cookies.`
      );

      const response = await axios.get(endpoint, {
        withCredentials: true, // 브라우저가 쿠키 자동 포함
        // headers: { /* Authorization 헤더 없음 */ } // GET 요청에는 Authorization 헤더 불필요 (백엔드 설정에 따라)
      });

      const data = response.data; // axios는 응답 본문을 .data에 담음

      console.log(`Workspaceed data for ${activeTab}:`, data);

      // 받아온 데이터 구조에 맞춰 상태 업데이트
      if (activeTab === "following") {
        // 혹시 목록에 자신의 ID가 포함된다면 제외 (선택 사항)
        setFollowing(
          (data || []).filter((user: User) => user.id !== Number(userId))
        );
        setFollowers([]); // 다른 목록 비움
      } else {
        // activeTab === "followers"
        // 혹시 목록에 자신의 ID가 포함된다면 제외 (선택 사항)
        setFollowers(
          (data || []).filter((user: User) => user.id !== Number(userId))
        );
        setFollowing([]); // 다른 목록 비움
      }
    } catch (error) {
      console.error("Failed to fetch follow data:", error);
      if (activeTab === "following") {
        setFollowing([]);
      } else {
        setFollowers([]);
      }
      // --- 오류 메시지 표시 부분 수정 (404 처리 및 [object Object] 방지) ---
      // AxiosError인지 확인하고, response 객체가 있는지 확인합니다.
      if (axios.isAxiosError(error) && error.response) {
        // <-- error.response 체크 추가
        // error.response가 있다면 data와 status에 안전하게 접근 가능합니다.
        // error.response.data가 객체일 경우 문자열로 변환하여 [object Object] 방지
        const errorDataString =
          typeof error.response.data === "object"
            ? JSON.stringify(error.response.data)
            : error.response.data;
        const errorMessage =
          errorDataString || error.message || "알 수 없는 오류가 발생했습니다.";

        if (error.response.status === 401) {
          alert("인증 정보가 만료되었습니다. 다시 로그인 해주세요.");
          // router.push("/members/login");
        } else if (error.response.status === 404) {
          console.error(
            `404 Error: Endpoint not found. Check URL: ${error.config?.url}`,
            error
          ); // 전체 에러 로깅
          alert(
            `요청한 팔로워/팔로잉 목록을 찾을 수 없습니다: ${errorMessage}`
          ); // 사용자 정의 메시지와 백엔드 오류 메시지 함께 표시
        }
        // 다른 4xx (400 등) 또는 5xx 에러는 여기서 추가 처리 가능
      } else {
        // AxiosError가 아니거나 response 객체가 없는 경우 (네트워크 오류 등)
        const errorMessage =
          error instanceof Error ? error.message : String(error); // 'error' unknown 타입 처리
        console.error("목록 로딩 중 오류 발생:", error); // 전체 에러 로깅
        alert(`목록 로딩 중 오류가 발생했습니다: ${errorMessage}`); // 오류 메시지 표시
      }
    } finally {
      setLoading(false);
    }
  };

  // 팔로우/언팔로우 토글 함수 (500 오류 발생 시 백엔드 디버깅 필요)
  const handleFollowToggle = async (targetUserId: number) => {
    // 백엔드 컨트롤러가 Authorization 헤더를 요구하므로 토큰이 localStorage에 있어야 합니다.
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      // router.push("/members/login");
      return; // 토큰 없으면 요청 중단
    }

    // 현재 목록에서 대상 유저 찾기
    const userToToggle = (
      activeTab === "followers" ? followers : following
    ).find((u) => u.id === targetUserId);
    if (!userToToggle) {
      console.warn(
        "Attempted to toggle follow for user not in current list:",
        targetUserId
      );
      // fetchFollowData(); // 목록 새로고침 시도 (선택 사항)
      return;
    }

    // isFollowing 상태는 백엔드에서 정확히 내려온다는 가정 하에 토글 액션 결정
    const isCurrentlyFollowingStatus = userToToggle.isFollowing; // isFollowing 필드가 DTO에 있어야 함

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090";
      const method = isCurrentlyFollowingStatus ? "DELETE" : "POST"; // 상태에 따라 메소드 결정
      const action = isCurrentlyFollowingStatus ? "unfollow" : "follow"; // 상태에 따라 액션 경로 결정
      // 백엔드 컨트롤러 엔드포인트: POST /follow, DELETE /unfollow. 모두 쿼리 파라미터 'followingid' 사용.
      const url = `${apiBaseUrl}/api/v1/follows/${action}?followingid=${targetUserId}`;

      console.log(
        `Attempting ${method} request to ${url}. Adding Authorization header.`
      );

      const response = await axios({
        method: method, // 결정된 HTTP 메소드
        url: url, // 결정된 URL
        withCredentials: true, // 쿠키 포함
        headers: {
          "Content-Type": "application/json", // Content-Type 유지
          Authorization: `Bearer ${token}`, // --- Authorization 헤더 추가 (컨트롤러 요구) ---
        },
        data: undefined, // 본문 데이터 없음 (쿼리 파라미터 사용)
      });

      console.log("Follow Toggle response:", response.data);
      alert(response.data || "상태 변경 성공"); // 백엔드 응답 메시지 알림

      fetchFollowData(); // 상태 변경 후 목록 새로고침
    } catch (error) {
      console.error("Error toggling follow state:", error);
      // AxiosError인지 확인하고, response 객체가 있는지 확인합니다.
      if (axios.isAxiosError(error) && error.response) {
        // <-- error.response 체크 추가
        // error.response가 있다면 data와 status에 안전하게 접근 가능합니다.
        // error.response.data가 객체일 경우 문자열로 변환하여 [object Object] 방지
        const errorDataString =
          typeof error.response.data === "object"
            ? JSON.stringify(error.response.data)
            : error.response.data;
        const errorMessage =
          errorDataString || error.message || "알 수 없는 오류가 발생했습니다.";
        alert(errorMessage);

        if (error.response.status === 401) {
          alert(
            "인증 정보가 만료되었습니다. 세션이 만료되었습니다. 다시 로그인 해주세요."
          );
          // 필요시 로그인 페이지로 리다이렉트
          // router.push("/members/login");
        } else if (
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          // 4xx 클라이언트 에러 (백엔드 로직 오류 등)
          console.warn(
            `Toggle failed (Client Error ${error.response.status}):`,
            errorMessage
          );
          // alert(errorMessage); // 이미 위에서 alert 함
          fetchFollowData(); // 상태 동기화 위해 목록 다시 가져오기
        } else if (error.response.status >= 500) {
          // 5xx 서버 에러 처리
          console.error(
            `Toggle failed (Server Error ${error.response.status}):`,
            errorMessage
          );
          // alert(errorMessage); // 이미 위에서 alert 함
          fetchFollowData(); // 목록 다시 가져오기
        }
      } else {
        // AxiosError가 아니거나 response 객체가 없는 경우 (예: 네트워크 오류)
        const errorMessage =
          error instanceof Error ? error.message : String(error); // 'error' unknown 타입 해결 및 메시지 처리
        console.error("Toggle failed (Non-Axios or No Response Error):", error);
        alert(`팔로우 상태 변경 중 오류가 발생했습니다: ${errorMessage}`);
      }
    }
  };

  // 모달 상태, userId, activeTab 변경 시 데이터 가져오기
  useEffect(() => {
    console.log(
      `Effect triggered in UserFollower - isOpen: ${isOpen}, userId: ${userId}, activeTab: ${activeTab}`
    );
    if (isOpen && userId) {
      fetchFollowData();
    } else {
      // 모달 닫히거나 userId 없을 때 목록 비움
      setFollowers([]);
      setFollowing([]);
    }
    // activeTab 변경 시 fetchFollowData 다시 호출하도록 의존성 추가
  }, [isOpen, userId, activeTab]);

  // 현재 활성화된 탭에 따라 표시할 사용자 목록 선택
  const currentUsers = activeTab === "followers" ? followers : following;

  // 검색어로 사용자 목록 필터링
  const filteredUsers = currentUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log(
    `Rendering list for activeTab: ${activeTab}, Filtered list count: ${filteredUsers.length}`
  );

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // --- JSX 렌더링 시작 ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* 모달 본문 */}
      <div className="relative bg-white rounded-xl w-full max-w-[400px] mx-4">
        {/* 헤더 (닫기 버튼, 탭 이름) */}
        {/* ... (닫기 버튼, 탭 이름 표시 div, 빈 div) ... */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          {/* 닫기 버튼 */}
          <button onClick={onClose} className="p-2 hover:opacity-50">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {/* 탭 이름 */}
          <div className="flex-1 text-center font-semibold">
            {activeTab === "followers" ? "팔로워" : "팔로잉"}{" "}
            {/* "팔로우" 대신 "팔로잉"이 맞습니다 */}
          </div>
          <div className="w-10"></div> {/* 우측 여백 */}
        </div>

        {/* 탭 버튼 */}
        {/* ... (팔로워/팔로잉 탭 버튼) ... */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("followers")}
            className={`flex-1 text-sm font-medium py-3 ${
              activeTab === "followers"
                ? "border-b border-black text-black"
                : "text-gray-500"
            }`}
          >
            {" "}
            팔로워{" "}
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 text-sm font-medium py-3 ${
              activeTab === "following"
                ? "border-b border-black text-black"
                : "text-gray-500"
            }`}
          >
            {" "}
            팔로잉{" "}
          </button>
        </div>

        {/* 검색 입력 필드 */}
        {/* ... (검색 입력 필드) ... */}
        <div className="p-2">
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
              placeholder="검색"
              className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 목록 영역 (로딩, 빈 목록, 사용자 목록) */}
        <div className="overflow-y-auto max-h-[400px]">
          {loading ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              {" "}
              로딩 중...{" "}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 px-4">
              <div className="text-center">
                {/* 빈 목록 아이콘 */}
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    {activeTab === "followers" ? (
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-2 4v2"></path>
                    ) : (
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    )}{" "}
                    {/* Fix d attribute for followers */}
                    <circle cx="9" cy="7" r="4"></circle>
                    {activeTab === "following" && (
                      <>
                        {" "}
                        <circle cx="19" cy="11" r="2"></circle>{" "}
                        <path d="M19 8v1"></path> <path d="M19 13v1"></path>{" "}
                        <path d="M16 11h1"></path> <path d="M21 11h1"></path>{" "}
                      </>
                    )}
                  </svg>
                </div>

                {/* 빈 목록 텍스트 */}
                <h3 className="text-lg font-semibold mb-1">
                  {searchQuery
                    ? "검색 결과가 없습니다"
                    : activeTab === "followers"
                    ? "아직 팔로워가 없습니다"
                    : "아직 팔로우하는 사용자가 없습니다"}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {searchQuery
                    ? "다른 검색어를 시도해보세요"
                    : activeTab === "followers"
                    ? "다른 사용자들이 회원님을 팔로우하면 여기에 표시됩니다."
                    : "관심 있는 사용자를 팔로우하면 여기에 표시됩니다."}
                </p>
                {/* 팔로잉 탭에서 사용자 찾아보기 버튼 */}
                {!searchQuery && activeTab === "following" && (
                  <button
                    className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium"
                    onClick={() => {
                      onClose(); /* Optional: Add navigation */
                    }}
                  >
                    사용자 찾아보기
                  </button>
                )}
              </div>
            </div>
          ) : (
            // --- 목록 항목 렌더링 ---
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
              >
                {/* 유저 아바타, 이름, 상태 */}
                <div className="flex items-center flex-1 min-w-0">
                  <div className="relative h-11 w-11 rounded-full overflow-hidden border">
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      {/* 프로필 사진 또는 이니셜 표시 */}
                      {user.currentProfilePhoto?.url ? (
                        <Image
                          src={user.currentProfilePhoto.url}
                          alt={user.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {" "}
                          {user.name.charAt(0)}{" "}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {" "}
                      {user.name}{" "}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {" "}
                      {user.status}{" "}
                    </p>
                  </div>
                </div>

                {/* 팔로우/언팔로우 버튼 */}
                <button // 중복 조건문 2 (8062bc7 시점 코드 유지)
                  onClick={() => handleFollowToggle(user.id)} // handleFollowToggle 호출
                  className={`ml-2 text-sm font-semibold px-4 py-1 rounded-md transition-colors ${
                    user.isFollowing // isFollowing에 따라 스타일 결정
                      ? "bg-gray-100 text-gray-900 hover:bg-gray-200" // 팔로잉 상태 스타일
                      : "bg-blue-500 text-white hover:bg-blue-600" // 팔로우 안 하는 상태 스타일
                  }`}
                >
                  {user.isFollowing ? "팔로잉" : "팔로우"}{" "}
                  {/* isFollowing에 따라 텍스트 결정 */}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserFollower;
