import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react'
import { BiSearch } from 'react-icons/bi'; // BiSearch 아이콘도 필요함
import React from 'react';
import { useGlobalLoginMember, LoginMemberContext, useLoginMember } from '@/stores/auth/loginMember';

export default function Header() {
    const socialLoginForKakaoUrl =
    "http://localhost:8090/oauth2/authorization/kakao";
  //  const redirectUrlAfterSocialLogin = "http://localhost:3000";
  const redirectUrlAfterSocialLogin = "http://localhost:3000/success";
    const { isLogin, loginMember, logoutAndHome } = useGlobalLoginMember();

    // 전역관리를 위한 Store 등록 - context api 사용
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
                    href="/"
                    className="text-gray-600 hover:text-gray-900 py-4"
                  >
                    홈
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-tree"
                    className="text-gray-600 hover:text-gray-900 py-4"
                  >
                    나의 나무
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dictionary"
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
            <div className="relative">
              <input
                type="text"
                placeholder="검색"
                className="bg-gray-100 rounded-full pl-10 pr-4 py-2 w-60 focus:outline-none focus:ring-2 focus:ring-[#2c714c]/30"
              />
              <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
            </div>
      
            {/* 글쓰기 버튼 */}
            <Link
              href="/boards/create"
              className="bg-[#2c714c] text-white px-4 py-2 rounded-full font-medium shadow-sm hover:bg-[#225c3d] transition-colors"
            >
              글쓰기
            </Link>
      
            {/* 프로필 이미지 */}
            {/* <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden border-2 border-[#2c714c] cursor-pointer">
              <Image
                src="https://images.unsplash.com/photo-1560941001-d4b52ad00ecc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Profile"
                width={36}
                height={36}
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/logo.png"; // 프로필 이미지 로드 실패 시 기본 이미지
                }}
              />
            </div> */}
            {/* 카카오 로그인 (필요한 경우 활성화) */}
            {isLogin ? (
                                      <div className="flex items-center gap-4">
                                          <div>{loginMember.name}님 환영합니다!</div>
                                          <button onClick={logoutAndHome}>로그아웃</button>
                                      </div>
                                  ) : (
                                      <>
                                          <div className="bg-gray-400 text-black px-4 py-2 rounded-md hover:bg-gray-500 transition">
          <Link href={`/members/login`}>
              <span className="font-bold">로그인</span>
          </Link>
      </div>
                                          <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition">
                                          <Link
                                                  href={`/members/signup`}
                                              >
                                              회원가입
                                              </Link>
                                          </button>
                                      </>
                                  )}
          </div>
        </div>
      </header>
    )
}   
