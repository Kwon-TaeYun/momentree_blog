"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WithdrawPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(
    null
  ); // 사용자 정보 상태 추가
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 토큰 가져오기 함수
  const getAuthToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token") || null
    );
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getAuthToken();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
          }/api/v1/members/me`,
          {
            method: "GET",
            credentials: "include",
            headers,
          }
        );

        if (!response.ok) {
          throw new Error("사용자 정보를 가져올 수 없습니다.");
        }

        const userData = await response.json();
        setCurrentUser({ email: userData.email }); // 사용자 이메일 설정
      } catch (err) {
        console.error("사용자 정보 로딩 오류:", err);
        setError("사용자 정보를 가져오는 중 오류가 발생했습니다.");
      }
    };

    fetchUser();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.email) {
      setError("이메일 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    if (confirmText !== "회원탈퇴") {
      setError("확인 문구를 정확히 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // 회원 탈퇴 API 호출
      const withdrawResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
        }/api/v1/members/delete`,
        {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({
            email: currentUser.email,
            password,
            reason,
          }),
        }
      );

      if (!withdrawResponse.ok) {
        const errorData = await withdrawResponse.json();
        throw new Error(
          errorData.message || "회원 탈퇴 처리 중 오류가 발생했습니다."
        );
      }

      // 로그아웃 API 호출
      const logoutResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
        }/api/v1/members/logout`,
        {
          method: "DELETE",
          credentials: "include",
          headers,
        }
      );

      if (!logoutResponse.ok) {
        throw new Error("로그아웃 처리 중 오류가 발생했습니다.");
      }

      // Clear user data on successful withdrawal and logout
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("currentUser");

      // Redirect to login page after logout
      window.location.href = "/login";
    } catch (err: any) {
      console.error("회원 탈퇴 오류:", err);
      setError(err.message || "회원 탈퇴 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="flex">
        {/* 좌측 네비게이션 */}
        <nav className="w-64 bg-white border-gray-100 border-r min-h-[calc(100vh-64px)]">
          <ul className="py-4">
            <li className="px-4 py-2 hover:bg-gray-100">
              <Link href="/mypage" className="flex items-center gap-2">
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
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                프로필
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100">
              <Link href="/mypage/account" className="flex items-center gap-2">
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
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                개인정보 관리
              </Link>
            </li>
            <li className="px-4 py-2 bg-black text-white">
              <Link
                href="/mypage/withdraw"
                className="flex items-center gap-2 text-red-500"
              >
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
                    d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                  />
                </svg>
                회원탈퇴
              </Link>
            </li>
          </ul>
        </nav>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">회원 탈퇴</h1>

          <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                탈퇴 전 꼭 확인해주세요
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>탈퇴 후에는 계정을 복구할 수 없습니다.</li>
                <li>작성하신 게시글 및 댓글은 자동으로 삭제되지 않습니다.</li>
                <li>
                  작성 게시글 및 댓글 삭제를 원하시면 탈퇴 전에 직접
                  삭제해주세요.
                </li>
                <li>탈퇴 후에는 동일한 이메일로 재가입이 30일간 제한됩니다.</li>
              </ul>
            </div>

            <form onSubmit={handleWithdraw}>
              {/* 이메일 확인 */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이메일 확인
                </label>
                <input
                  type="email"
                  id="email"
                  value={currentUser?.email || ""}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="이메일 정보가 없습니다."
                />
              </div>

              {/* 탈퇴 사유 */}
              <div className="mb-4">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  탈퇴 사유
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
                  required
                >
                  <option value="">탈퇴 사유 선택</option>
                  <option value="사용빈도 낮음">사용빈도가 낮아요</option>
                  <option value="콘텐츠 부족">원하는 콘텐츠가 부족해요</option>
                  <option value="더 나은 서비스">
                    더 나은 서비스를 찾았어요
                  </option>
                  <option value="기타">기타</option>
                </select>
              </div>

              {/* 비밀번호 확인 */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
                  placeholder="현재 비밀번호를 입력해주세요"
                  required
                />
              </div>

              {/* 확인 문구 입력 */}
              <div className="mb-6">
                <label
                  htmlFor="confirmText"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  확인 문구 입력
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  '회원탈퇴'를 입력하시면 탈퇴 버튼이 활성화됩니다.
                </p>
                <input
                  type="text"
                  id="confirmText"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setIsConfirmed(e.target.value === "회원탈퇴");
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
                  placeholder="회원탈퇴"
                  required
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
                  {error}
                </div>
              )}

              {/* 버튼 */}
              <div className="flex justify-end">
                <Link
                  href="/mypage"
                  className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={!isConfirmed || isLoading}
                  className={`px-4 py-2 rounded ${
                    isConfirmed
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "처리 중..." : "회원 탈퇴"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
