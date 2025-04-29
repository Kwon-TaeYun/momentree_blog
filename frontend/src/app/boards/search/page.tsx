"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface SearchResult {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  mainPhotoUrl?: string;
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="text-center py-20 text-black">로딩 중...</div>}
    >
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");
  const [searchInput, setSearchInput] = useState(keyword || "");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!keyword) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            "https://api.blog.momentree.site"
          }/api/v1/boards/search?keyword=${encodeURIComponent(keyword)}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("검색 중 오류가 발생했습니다.");
        }

        const data = await response.json();
        if (typeof data === "string") {
          setSearchResults([]);
        } else {
          setSearchResults(data.content || []);
        }
      } catch (error) {
        console.error("검색 오류:", error);
        setError(
          error instanceof Error
            ? error.message
            : "검색 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(
        `/boards/search?keyword=${encodeURIComponent(searchInput.trim())}`
      );
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-black">검색 중...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      {/* <nav className="bg-white border-b border-gray-200">
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
      </nav> */}

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 검색 헤더 */}
        <h1 className="text-xl font-bold text-center mb-6 text-black">
          '{keyword}'에 대한 검색결과입니다
        </h1>

        {/* 검색창 */}
        <form onSubmit={handleSearch} className="flex justify-center mb-10">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-1 rounded-md text-sm"
            >
              검색
            </button>
          </div>
        </form>

        {searchResults.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-lg border">
            <div className="divide-y divide-gray-200">
              {searchResults.map((result) => (
                <Link
                  href={`/boards/${result.id}`}
                  key={result.id}
                  className="block"
                >
                  <div className="flex justify-between items-center p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="text-base font-medium mb-2 text-black">
                        {result.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {result.content}
                      </p>
                      <div className="text-xs text-black">
                        <span>{result.authorName}</span>
                        <span className="mx-2 text-black">•</span>
                        <span>
                          {new Date(result.createdAt).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    {result.mainPhotoUrl && (
                      <div className="w-20 h-20 bg-gray-200 rounded-md relative ml-4 overflow-hidden">
                        <Image
                          src={result.mainPhotoUrl}
                          alt={result.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {/* 페이지네이션 */}
            <div className="flex justify-center py-4 border-t border-gray-200">
              <div className="inline-flex rounded-md shadow-sm">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-l-md hover:bg-gray-50 text-black">
                  &lt;
                </button>
                {[1, 2, 3].map((page) => (
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
        )}
      </div>
    </div>
  );
}
