import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import React from "react";
import {
  LoginMemberContext,
  useLoginMember,
} from "../../stores/auth/loginMember";
import { useRouter } from "next/navigation";

export default function Header() {
  const socialLoginForKakaoUrl =
    "https://api.blog.momentree.site/oauth2/authorization/kakao";
  const redirectUrlAfterSocialLogin = "http://www.momentree.site/home";
  const {
    loginMember,
    setLoginMember,
    setNoLoginMember,
    isLoginMemberPending,
    isLogin,
    logout,
    logoutAndHome,
  } = useLoginMember();

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(
        `/boards/search?keyword=${encodeURIComponent(searchTerm.trim())}`
      );
      setSearchTerm(""); // 검색 후 입력 필드 초기화
    }
  };

  // Add a local state to track login status
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // Improved logout function
  const handleLogout = () => {
    fetch("https://api.blog.momentree.site/api/v1/members/logout", {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          // Clear login state
          setNoLoginMember();
          setIsUserLoggedIn(false);

          // Force page refresh to clear any cached state
          window.location.href = "/";
        }
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  // Check login status on component mount and whenever isLogin changes
  useEffect(() => {
    const checkLoginStatus = () => {
      fetch("https://api.blog.momentree.site/api/v1/members/me", {
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Not logged in");
          }
          return response.json();
        })
        .then((data) => {
          setLoginMember(data);
          setIsUserLoggedIn(true);
        })
        .catch((error) => {
          setNoLoginMember();
          setIsUserLoggedIn(false);
        });
    };

    checkLoginStatus();
  }, []);

  if (isLoginMemberPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold">로딩중...</div>
      </div>
    );
  }

  return (
    <header className="border-b border-gray-100 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="relative w-[46px] h-[46px]">
              <Image
                src="/images/logo.png"
                alt="Momentree"
                width={46}
                height={46}
                className="object-contain"
              />
            </div>
            <span className="text-[#2c714c] text-2xl font-medium ml-2">
              Momentree
            </span>
          </Link>

          {/* 메뉴 */}
          <nav className="ml-12">
            <ul className="flex space-x-8">
              <li>
                <Link
                  href="/home"
                  className="text-gray-600 hover:text-gray-900 py-4"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/members/login/myblog"
                  className="text-gray-600 hover:text-gray-900 py-4"
                >
                  나의 나무
                </Link>
              </li>
              <li>
                <Link
                  href="/photoList"
                  className="text-gray-600 hover:text-gray-900 py-4"
                >
                  사진첩
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* 인증된 사용자의 경우 보여줄 UI */}
        <div className="flex items-center gap-4">
          {/* 검색창 */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="검색"
              className="bg-gray-100 rounded-full pl-10 pr-4 py-2 w-60 focus:outline-none focus:ring-2 focus:ring-[#2c714c]/30"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            >
              <BiSearch className="text-gray-500 text-lg" />
            </button>
          </form>

          {/* 글쓰기 버튼 - 로그인한 사용자에게만 표시 */}
          {isUserLoggedIn && (
            <Link
              href="/boards/new"
              className="bg-[#2c714c] text-white px-4 py-2 rounded-full font-medium shadow-sm hover:bg-[#225c3d] transition-colors"
            >
              글쓰기
            </Link>
          )}

          {isUserLoggedIn ? (
            <div className="flex items-center gap-4">
              <div>{loginMember.name}님 환영합니다!</div>

              <Link
                href="/mypage"
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition"
              >
                마이페이지
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gray-400 text-black px-4 py-2 rounded-md hover:bg-gray-500 transition">
                <Link href={`/members/login`}>
                  <span className="font-bold">로그인</span>
                </Link>
              </div>
              <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition">
                <Link href={`/members/signup`}>회원가입</Link>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
