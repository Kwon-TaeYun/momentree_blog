"use client";

import Image from 'next/image';

// @ts-ignore - JSX element type errors
export default function Home() {
  const socialLoginForKakaoUrl =
    "http://localhost:8090/oauth2/authorization/kakao";
  const redirectUrlAfterSocialLogin = "http://localhost:3000";
  return (
    <main className="flex flex-col min-h-screen bg-white text-black">

      {/* 메인 컨텐츠 */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-3xl mx-auto py-16">
        <h1 className="text-3xl font-bold mb-4 text-black">
          당신의 순간을<br />
          나무처럼 키워보세요
        </h1>
        <p className="mb-8 text-sm text-black">
          매일의 순간들을 기록하고 성장하는 나만의 이야기를 만들어보세요. 당신의 소중한 순간이 한 나의 나무가 되어 자라납니다.
        </p>
        <div className="flex gap-4">
          <a
            href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
            className="bg-black text-white px-6 py-2 rounded-md font-medium"
          >
            시작하기
          </a>
          <button className="border border-gray-300 px-6 py-2 rounded-md font-medium text-black">
            더 알아보기
          </button>
        </div>
      </section>
      
      {/* 특별한 순간 섹션 */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <Image 
              src="/images/logo.png" 
              alt="Momentree 로고" 
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm text-black mb-1">특별한 기록</p>
            <h2 className="text-2xl font-bold text-black">당신의 순간을 특별하게 만드는 방법</h2>
          </div>
        </div>
        <p className="mb-12 text-black">매일매일의 순간들을 기록하고 성장하는 과정을 시작적으로 확인해보세요.</p>
        
        {/* 4개의 기능 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <div className="bg-black text-white p-3 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-black">성장하는 나무</h3>
              <p className="text-sm text-black">기록에 열정있을 창선하여 나무가 자라납니다. 매일의 작은 순간들이 모여 여름에는 나무를 완성시킵니다.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-black text-white p-3 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-black">시간의 기록</h3>
              <p className="text-sm text-black">당해시점 만난적 있는 당신의 기록들. 지난 순간들을 쉽게 돌아보고 회상할 수 있습니다.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-black text-white p-3 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-black">함께하는 순간</h3>
              <p className="text-sm text-black">다른 사람들의 순간을 공유하고 소통하세요. 서로의 이야기로 더욱 풍성해지는 순간들을 경험하세요.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-black text-white p-3 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-black">성장의 통계</h3>
              <p className="text-sm text-black">당신의 기록 패턴과 성장을 한눈에 확인할 수 있는 통계 기능을 제공합니다.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 인기 블로거 섹션 */}
      <section className="py-12 px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-xl font-bold mb-6 text-black">인기 블로거</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex flex-col items-center min-w-[80px]">
              <div className="w-16 h-16 rounded-full bg-gray-300 mb-2"></div>
              <p className="text-sm font-medium text-black">사용자명</p>
              <p className="text-xs text-black">팔로워 {Math.floor(Math.random() * 100)}명</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* 인기 콘텐츠 섹션 */}
      <section className="py-12 px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-xl font-bold mb-6 text-black">인기 콘텐츠</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { title: '오늘의 카페 탐방', likes: '2.1k', comments: '324' },
            { title: '서울 야경 스팟', likes: '1.8k', comments: '256' },
            { title: '맛집 리뷰', likes: '1.5k', comments: '196' }
          ].map((content, idx) => (
            <div key={idx} className="rounded-lg overflow-hidden border">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <h3 className="font-medium mb-2 text-black">{content.title}</h3>
                <div className="flex text-sm text-black gap-4">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    {content.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg>
                    {content.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* 실시간 인기글 섹션 */}
      <section className="py-12 px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-xl font-bold mb-6 text-black">실시간 인기글</h2>
        <div className="space-y-4">
          {[
            { title: '주말 피크닉 명소 추천', location: '서울 강남', likes: 42, comments: 238 },
            { title: '우리집 홈스타일링 노하우', location: '경기 분당', likes: 35, comments: 186 }
          ].map((post, idx) => (
            <div key={idx} className="flex gap-4 border-b pb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
              <div className="flex-1">
                <h3 className="font-medium mb-1 text-black">{post.title}</h3>
                <p className="text-xs text-black mb-2">{post.location}</p>
                <div className="flex text-xs text-black gap-3">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg>
                    {post.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
