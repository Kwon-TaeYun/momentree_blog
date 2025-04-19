import Image from "next/image";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  date: string;
  views: number;
  author?: string;
  thumbnail: string;
}

export default function SearchResults() {
  // 임시 데이터
  const myPosts: Post[] = [
    {
      id: 1,
      title: "2024년 상반기 개발자 채용 동향 분석",
      date: "2024.03.15",
      views: 238,
      thumbnail:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80",
    },
    {
      id: 2,
      title: "프론트엔드 개발자를 위한 성능 최적화 가이드",
      date: "2024.03.10",
      views: 156,
      thumbnail:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80",
    },
  ];

  const otherPosts: Post[] = [
    {
      id: 3,
      title: "AI 기술을 활용한 코드 리뷰 자동화 방안",
      date: "2024.03.14",
      views: 342,
      author: "김철수",
      thumbnail:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&q=80",
    },
    {
      id: 4,
      title: "클라우드 네이티브 아키텍처의 미래",
      date: "2024.03.13",
      views: 287,
      author: "박지영",
      thumbnail:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center h-16">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Momentree Logo"
                width={46}
                height={46}
                className="object-contain"
              />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 검색 헤더 */}
        <h1 className="text-xl font-bold text-center mb-6 text-black">
          'AI 개발'에 대한 검색결과입니다
        </h1>

        {/* 검색창 */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="'AI 개발'에 대한 검색결과입니다"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder:text-gray-500"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-1 rounded-md text-sm">
              검색
            </button>
          </div>
        </div>

        {/* 내 게시글 섹션 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-5 text-black">내 게시글</h2>
          <div className="bg-white rounded-lg border">
            <div className="divide-y divide-gray-200">
              {myPosts.map((post) => (
                <Link
                  href={`/boards/${post.id}`}
                  key={post.id}
                  className="block"
                >
                  <div className="flex justify-between items-center p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="text-base font-medium mb-2 text-black">
                        {post.title}
                      </h3>
                      <div className="text-xs text-black">
                        <span>{post.date}</span>
                        <span className="mx-2 text-black">•</span>
                        <span>조회수 {post.views}</span>
                      </div>
                    </div>
                    <div className="w-20 h-20 bg-gray-200 rounded-md relative ml-4 overflow-hidden">
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* 내 게시글 페이지네이션 */}
            <div className="flex justify-center py-4 border-t border-gray-200">
              <div className="inline-flex rounded-md shadow-sm">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-l-md hover:bg-gray-50 text-black">
                  &lt;
                </button>
                {[1, 2, 3].map((page, index) => (
                  <button
                    key={page}
                    className={`px-3 py-1 text-sm border-t border-b border-r border-gray-300 ${
                      page === 1
                        ? "bg-black text-white hover:bg-gray-800"
                        : "text-black hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-3 py-1 text-sm border-t border-b border-r border-gray-300 rounded-r-md hover:bg-gray-50 text-black">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 다른 사용자 게시글 섹션 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-5 text-black">
            다른 사용자 게시글
          </h2>
          <div className="bg-white rounded-lg border">
            <div className="divide-y divide-gray-200">
              {otherPosts.map((post) => (
                <Link
                  href={`/boards/${post.id}`}
                  key={post.id}
                  className="block"
                >
                  <div className="flex justify-between items-center p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="text-base font-medium mb-2 text-black">
                        {post.title}
                      </h3>
                      <div className="text-xs text-black">
                        <span>{post.author}</span>
                        <span className="mx-2 text-black">•</span>
                        <span>{post.date}</span>
                        <span className="mx-2 text-black">•</span>
                        <span>조회수 {post.views}</span>
                      </div>
                    </div>
                    <div className="w-20 h-20 bg-gray-200 rounded-md relative ml-4 overflow-hidden">
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* 다른 사용자 게시글 페이지네이션 */}
            <div className="flex justify-center py-4 border-t border-gray-200">
              <div className="inline-flex rounded-md shadow-sm">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-l-md hover:bg-gray-50 text-black">
                  &lt;
                </button>
                {[1, 2, 3, 4, 5].map((page, index) => (
                  <button
                    key={page}
                    className={`px-3 py-1 text-sm border-t border-b border-r border-gray-300 ${
                      page === 1
                        ? "bg-black text-white hover:bg-gray-800"
                        : "text-black hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-3 py-1 text-sm border-t border-b border-r border-gray-300 rounded-r-md hover:bg-gray-50 text-black">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
