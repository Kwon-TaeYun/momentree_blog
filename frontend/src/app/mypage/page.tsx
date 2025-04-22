"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfileType {
  id: number;
  name: string;
  email: string;
  message: string;
  joinDate: string;
  username?: string;
  blogName?: string;
  profileImage?: string;
}

export default function Mypage() {
  const router = useRouter();

  // 사용자 프로필 상태
  const [userProfile, setUserProfile] = useState<UserProfileType>({
    id: 0,
    name: "",
    joinDate: "",
    email: "",
    message: "안녕하세요!",
    username: "",
    blogName: "",
    profileImage: "",
  });

  // 활동 내역 상태
  const [activities, setActivities] = useState([
    { type: "게시글 작성", date: "2024-02-14" },
    { type: "댓글 작성", date: "2024-02-13" },
  ]);

  // 토큰 가져오기 함수
  const getAuthToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token") || null
    );
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 토큰 확인
        const token = getAuthToken();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        // 토큰이 있으면 헤더에 추가
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // 현재 로그인한 사용자 정보 가져오기 (쿠키 기반 인증)
        const userResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
          }/api/v1/members/me`,
          {
            method: "GET",
            credentials: "include", // 쿠키 포함
            headers,
          }
        );

        if (!userResponse.ok) {
          throw new Error("로그인이 필요합니다.");
        }

        const userData = await userResponse.json();

        // API에서 받아온 사용자 정보로 상태 업데이트
        setUserProfile({
          id: userData.id,
          name: userData.name || "사용자",
          email: userData.email || "",
          message: userData.message || "안녕하세요!",
          joinDate: userData.createDate?.split("T")[0] || "",
          blogName: userData.blogName || "나의 블로그",
          profileImage: userData.profileImage || "",
        });
      } catch (err) {
        console.error("사용자 정보 로딩 오류:", err);
        // 로그인 페이지로 리디렉션
        router.push("/members/login");
      }
    };

    fetchUserInfo();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="flex">
        {/* 좌측 네비게이션 */}
        <nav className="w-64 bg-white border-gray-100 border-r min-h-[calc(100vh-64px)]">
          <ul className="py-4">
            <li className="px-4 py-2 bg-black text-white">
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
            <li className="px-4 py-2 hover:bg-gray-100">
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
          {/* 프로필 섹션 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-6">{userProfile.name}</h1>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 relative rounded-full overflow-hidden bg-gray-50">
                {userProfile.profileImage ? (
                  <Image
                    src={userProfile.profileImage}
                    alt="프로필 이미지"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-16 h-16"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-black mb-1">{userProfile.email}</p>
                <p className="text-sm text-gray-500 mb-1">
                  가입일: {userProfile.joinDate}
                </p>
              </div>
            </div>
          </div>

          {/* 블로그 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">블로그 정보</h2>
            <div className="bg-white rounded border-gray-100 border p-4">
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  블로그 이름
                </p>
                <p className="p-2 bg-gray-50 rounded">{userProfile.blogName}</p>
              </div>
            </div>
          </div>

          {/* 개인정보 관리 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">개인정보</h2>
            <div className="bg-white rounded border-gray-100 border divide-y divide-gray-100">
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">이름</p>
                <p className="font-medium">{userProfile.name}</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">이메일</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
            <div className="bg-white rounded border-gray-100 border">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex justify-between p-4 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{activity.type}</p>
                  </div>
                  <p className="text-sm text-black">{activity.date}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
