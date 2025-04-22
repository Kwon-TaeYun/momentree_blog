"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WithdrawPage() {
  type CurrentUser = {
    id: number;
    email: string;
    name?: string;
  };

  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
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
          throw new Error("로그인이 필요합니다.");
        }

        const userData = await response.json();

        // 사용자 정보 상태 업데이트
        setCurrentUser({
          id: userData.id,
          email: userData.email || "",
          name: userData.name || "사용자",
        });
      } catch (err) {
        console.error("사용자 정보 로딩 오류:", err);
        router.push("/members/login"); // 로그인 페이지로 리디렉션
      }
    };

    fetchUser();
  }, [router]);

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
      window.location.href = "http://localhost:3000/members/login";
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
        <nav className="w-64 bg-white border-gray-100 border-r min-h-[calc(100vh-64px)]">
          <ul className="py-4">
            <li className="px-4 py-2 hover:bg-gray-100">
              <Link href="/mypage" className="flex items-center gap-2">
                프로필
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100">
              <Link href="/mypage/account" className="flex items-center gap-2">
                개인정보 관리
              </Link>
            </li>
          </ul>
        </nav>

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">회원 탈퇴</h1>

          <form onSubmit={handleWithdraw}>
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

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
                {error}
              </div>
            )}

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
        </main>
      </div>
    </div>
  );
}
