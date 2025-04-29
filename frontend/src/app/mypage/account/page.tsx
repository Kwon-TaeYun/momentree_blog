"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGlobalLoginMember } from "../../../stores/auth/loginMember";

export default function AccountPage() {
  const router = useRouter();
  const { loginMember, isLogin, setLoginMember } = useGlobalLoginMember();

  // 로딩 상태 및 에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 사용자 정보 수정 함수
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError("");

      // 수정 API 호출
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://api.blog.momentree.site"
        }/api/v1/members/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id: loginMember.id,
            name: loginMember.name,
            email: loginMember.email,
            blogName: loginMember.blogName,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "회원정보 수정 중 오류가 발생했습니다."
        );
      }

      const updatedMember = await response.json();
      setLoginMember(updatedMember); // 수정된 회원 정보를 전역 상태에 업데이트
      alert("회원정보가 수정되었습니다.");
    } catch (err: any) {
      console.error("회원정보 수정 오류:", err);
      setError(err.message || "회원정보 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="flex">
        {/* 좌측 네비게이션 */}
        <nav className="w-64 bg-white border-gray-100 border-r min-h-[calc(100vh-64px)]">
          <ul className="py-4">
            <li className="px-4 py-2 hover:bg-gray-100">
              <Link href="/mypage" className="flex items-center gap-2">
                프로필
              </Link>
            </li>
            <li className="px-4 py-2 bg-black text-white">
              <Link href="/mypage/account" className="flex items-center gap-2">
                개인정보 관리
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100">
              <Link
                href="/mypage/withdraw"
                className="flex items-center gap-2 text-red-500"
              >
                회원탈퇴
              </Link>
            </li>
          </ul>
        </nav>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">개인정보 관리</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                value={loginMember.name || ""}
                onChange={(e) =>
                  setLoginMember({ ...loginMember, name: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={loginMember.email || ""}
                onChange={(e) =>
                  setLoginMember({ ...loginMember, email: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
              />
            </div>

            {/* 블로그 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                블로그 이름
              </label>
              <input
                type="text"
                value={loginMember.blogName || ""}
                onChange={(e) =>
                  setLoginMember({ ...loginMember, blogName: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
              />
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`w-full py-3 rounded text-white ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-900"
              }`}
            >
              {isLoading ? "저장 중..." : "저장"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
