"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KakaoOauthErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // 3초 후 홈으로 리디렉션
    const timer = setTimeout(() => {
      router.push("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">소셜 로그인 오류</h1>
      <p className="text-center mb-6">
        카카오 소셜 로그인 처리 중 오류가 발생했습니다.<br />
        잠시 후 홈 페이지로 이동합니다.
      </p>
      <button
        onClick={() => router.push("/members/login")}
        className="px-4 py-2 bg-black text-white rounded-md"
      >
        로그인 페이지로 돌아가기
      </button>
    </div>
  );
} 