import Link from "next/link";
import Image from "next/image";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 인기 블로거 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">인기 블로거</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {[
              { name: "여행하는꿀벌이", followers: "12.5k" },
              { name: "맛집헌터", followers: "10.2k" },
              { name: "일상소확행", followers: "8.7k" },
              { name: "스타일리시해", followers: "7.9k" },
            ].map((blogger, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 overflow-hidden">
                  <Image
                    src={`/blogger-${index + 1}.jpg`}
                    alt={blogger.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-center">
                  {blogger.name}
                </span>
                <span className="text-xs text-gray-500">
                  팔로워 {blogger.followers}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 인기 콘텐츠 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">인기 콘텐츠</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <div className="h-48 bg-gray-100 relative">
                <Image
                  src="/content-1.jpg"
                  alt="오늘의 카페 탐방"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">오늘의 카페 탐방</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    2.1k
                  </span>
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    324
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <div className="h-48 bg-gray-100 relative">
                <Image
                  src="/content-2.jpg"
                  alt="서울 야경 스팟"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">서울 야경 스팟</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    1.8k
                  </span>
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    256
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <div className="h-48 bg-gray-100 relative">
                <Image
                  src="/content-3.jpg"
                  alt="맛집 리뷰"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">맛집 리뷰</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    1.5k
                  </span>
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    198
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 실시간 인기글 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">실시간 인기글</h2>
          <div className="space-y-4">
            <div className="flex gap-4 border-b pb-4">
              <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src="/post-1.jpg"
                  alt="주말 피크닉"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">주말 피크닉 명소 추천</h3>
                <p className="text-sm text-gray-600 mb-2">
                  서울 근교 피크닉하기 좋은 장소들과 준비물 공유합니다.
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">김다정</span>
                  <span className="flex items-center mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    42
                  </span>
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    238
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src="/post-2.jpg"
                  alt="우리집 홈스타일링"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">우리집 홈스타일링 노하우</h3>
                <p className="text-sm text-gray-600 mb-2">
                  작은 예산으로 인테리어 분위기를 바꾸는 방법을 소개합니다.
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">박보랜드</span>
                  <span className="flex items-center mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    35
                  </span>
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    186
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
