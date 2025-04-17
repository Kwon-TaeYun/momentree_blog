"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Mypage() {
  // 사용자 프로필 상태
  const [userProfile, setUserProfile] = useState({
    name: '김민수',
    joinDate: '2024년 2월 15일',
    email: 'kimms@example.com',
    phone: '010-1234-5678',
    message: '안녕하세요! 김민수입니다.',
  });

  // 활동 내역 상태
  const [activities, setActivities] = useState([
    { type: '게시글 작성', date: '2024-02-14' },
    { type: '댓글 작성', date: '2024-02-13' },
  ]);

  // 알림 설정 상태
  const [notifications, setNotifications] = useState({
    emailNotif: true,
    pushNotif: false,
  });

  // 보안 설정 상태
  const [security, setSecurity] = useState({
    twoFactor: true,
  });

  // 토글 핸들러
  const handleToggle = (setting: string, value: boolean) => {
    if (setting === 'emailNotif') {
      setNotifications({...notifications, emailNotif: value});
    } else if (setting === 'pushNotif') {
      setNotifications({...notifications, pushNotif: value});
    } else if (setting === 'twoFactor') {
      setSecurity({...security, twoFactor: value});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* 헤더 */}
      <header className="bg-white py-3 px-6 border-gray-100 border-b flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/images/logo.png" 
            alt="Momentree 로고" 
            width={46} 
            height={46} 
            className="object-contain"
          />
          <span className="font-medium text-black">Momentree</span>
        </Link>
        <button className="bg-black text-white px-3 py-1 rounded-md text-sm font-medium">로그아웃</button>
      </header>

      <div className="flex">
        {/* 좌측 네비게이션 */}
        <nav className="w-64 bg-white border-gray-100 border-r min-h-[calc(100vh-64px)]">
          <ul className="py-4">
            <li className="px-4 py-2 bg-black text-white">
              <Link href="/mypage" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                프로필
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100">
              <Link href="/mypage/account" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                개인정보 관리
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100">
              <Link href="/mypage/history" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                활동 내역
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100">
              <Link href="/mypage/notification" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                알림 설정
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100">
              <Link href="/mypage/security" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                보안 설정
              </Link>
            </li>
          </ul>
        </nav>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 p-8">
          {/* 프로필 섹션 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-6">김민수</h1>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 relative rounded-full overflow-hidden bg-gray-50">
                <div className="w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm text-black mb-1">최근 접속: {userProfile.joinDate}</p>
              </div>
            </div>
          </div>

          {/* 상태 메시지 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">상태 메시지</h2>
            <div className="border-gray-100 border p-4 rounded bg-white">
              <p>{userProfile.message}</p>
            </div>
          </div>

          {/* 개인정보 관리 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">개인정보 관리</h2>
            <div className="bg-white rounded border-gray-100 border divide-y divide-gray-100">
              <div className="p-4">
                <p className="text-sm text-black mb-1">이메일</p>
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                  className="w-full p-2 border-gray-100 border rounded"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-black mb-1">연락처</p>
                <input
                  type="tel"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                  className="w-full p-2 border-gray-100 border rounded"
                />
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
            <div className="bg-white rounded border-gray-100 border">
              {activities.map((activity, index) => (
                <div key={index} className="flex justify-between p-4 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium">{activity.type}</p>
                  </div>
                  <p className="text-sm text-black">{activity.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">알림 설정</h2>
            <div className="bg-white rounded border-gray-100 border divide-y divide-gray-100">
              <div className="flex justify-between items-center p-4">
                <p>이메일 알림</p>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    id="emailToggle"
                    className="opacity-0 absolute w-0 h-0"
                    checked={notifications.emailNotif}
                    onChange={(e) => handleToggle('emailNotif', e.target.checked)}
                  />
                  <label
                    htmlFor="emailToggle"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notifications.emailNotif ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                      notifications.emailNotif ? 'translate-x-6' : 'translate-x-0'
                    }`}></span>
                  </label>
                </div>
              </div>
              <div className="flex justify-between items-center p-4">
                <p>푸시 알림</p>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    id="pushToggle"
                    className="opacity-0 absolute w-0 h-0"
                    checked={notifications.pushNotif}
                    onChange={(e) => handleToggle('pushNotif', e.target.checked)}
                  />
                  <label
                    htmlFor="pushToggle"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notifications.pushNotif ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                      notifications.pushNotif ? 'translate-x-6' : 'translate-x-0'
                    }`}></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">보안 설정</h2>
            <div className="bg-white rounded border-gray-100 border divide-y divide-gray-100">
              <div className="flex justify-between items-center p-4">
                <p>2단계 인증</p>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    id="twoFactorToggle"
                    className="opacity-0 absolute w-0 h-0"
                    checked={security.twoFactor}
                    onChange={(e) => handleToggle('twoFactor', e.target.checked)}
                  />
                  <label
                    htmlFor="twoFactorToggle"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      security.twoFactor ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                      security.twoFactor ? 'translate-x-6' : 'translate-x-0'
                    }`}></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="mt-6">
            <button className="w-full bg-black text-white py-3 px-4 rounded-md font-medium">비밀번호 변경</button>
          </div>
        </main>
      </div>
    </div>
  );
}

