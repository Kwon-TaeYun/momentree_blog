"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlobalLoginMember } from "../../stores/auth/loginMember";

// 사진첩 데이터 타입 정의
interface PhotoAlbum {
  userId: number;
  boardId: number;
  mainPhotoKey: string;
  mainPhotoUrl: string;
  additionalPhotoKeys: string[];
  additionalPhotoUrls: string[];
  title?: string;
  authorName?: string;
  createdAt?: string;
}

// 사진 모음집 컴포넌트
export default function PhotoListPage() {
  const { loginMember, isLogin } = useGlobalLoginMember();
  const router = useRouter();
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 정렬 상태
  const [sortOrder, setSortOrder] = useState<"최신순" | "인기순">("최신순");

  // 무한 스크롤 관련 상태
  const [visibleAlbums, setVisibleAlbums] = useState<PhotoAlbum[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(date.getDate()).padStart(2, "0")}`;
  };

  // 사진첩 데이터 가져오기
  const fetchAlbums = useCallback(async () => {
    if (!isLogin) {
      router.push("/members/login");
      return;
    }

    setLoading(true);
    try {
      // const token = localStorage.getItem("accessToken");
      const response = await fetch(
        "https://api.blog.momentree.site/api/v1/albums",
        {
          headers: {
            "Content-Type": "application/json",
            // ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("사진첩 데이터를 불러오는데 실패했습니다.");
      }

      const albumData = await response.json();

      // 유효한 앨범 필터링: 메인 사진이 있는 앨범만 포함
      const validAlbums = albumData.filter(
        (album: PhotoAlbum) =>
          album.mainPhotoUrl && album.mainPhotoUrl.trim() !== ""
      );

      // 각 앨범의 게시글 정보 가져오기
      const albumsWithDetails = await Promise.all(
        validAlbums.map(async (album: PhotoAlbum) => {
          try {
            const boardResponse = await fetch(
              `https://api.blog.momentree.site/api/v1/boards/${album.boardId}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  // ...(token && { Authorization: `Bearer ${token}` }),
                },
                credentials: "include",
              }
            );

            if (boardResponse.ok) {
              const boardData = await boardResponse.json();
              return {
                ...album,
                title: boardData.title,
                authorName: boardData.authorName,
                createdAt: boardData.createdAt,
              };
            }
            return album;
          } catch (err) {
            console.error(
              `게시글 ${album.boardId} 정보를 가져오는데 실패했습니다:`,
              err
            );
            return album;
          }
        })
      );

      setAlbums(albumsWithDetails);

      // 초기 페이지 로드 시 첫 8개만 표시
      setVisibleAlbums(albumsWithDetails.slice(0, 8));
      setHasMore(albumsWithDetails.length > 8);
      setPage(2); // 다음 페이지는 2페이지
    } catch (err) {
      console.error("사진첩 로딩 오류:", err);
      setError(
        err instanceof Error
          ? err.message
          : "사진첩 데이터를 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [isLogin, router]);

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // 정렬 기능 및 정렬 시 무한 스크롤 상태 초기화
  useEffect(() => {
    if (albums.length > 0) {
      const sortedAlbumsArray = [...albums].sort((a, b) => {
        if (sortOrder === "최신순") {
          return (
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
          );
        } else {
          return b.additionalPhotoUrls.length - a.additionalPhotoUrls.length;
        }
      });

      // 정렬 후 첫 8개만 표시
      setVisibleAlbums(sortedAlbumsArray.slice(0, 8));
      setHasMore(sortedAlbumsArray.length > 8);
      setPage(2);
    }
  }, [sortOrder, albums]);

  // 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          // 다음 페이지의 앨범 4개를 가져옴
          const sortedAlbums = [...albums].sort((a, b) => {
            if (sortOrder === "최신순") {
              return (
                new Date(b.createdAt || "").getTime() -
                new Date(a.createdAt || "").getTime()
              );
            } else {
              return (
                b.additionalPhotoUrls.length - a.additionalPhotoUrls.length
              );
            }
          });

          const nextItems = sortedAlbums.slice((page - 1) * 4, page * 4);

          if (nextItems.length > 0) {
            setVisibleAlbums((prev) => [...prev, ...nextItems]);
            setPage((prev) => prev + 1);
            setHasMore(page * 4 < sortedAlbums.length);
          } else {
            setHasMore(false);
          }
        }
      },
      { threshold: 1.0 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loading, page, albums, sortOrder]);

  if (loading && page === 1) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">사진첩을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchAlbums()}
            className="mt-4 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">사진첩에 표시할 데이터가 없습니다.</p>
          <Link
            href="/boards/new"
            className="mt-4 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 inline-block"
          >
            새 게시글 작성하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 헤더 부분 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          게시글 별 사진 모음집
        </h1>

        {/* 필터 컨트롤 - 뷰 모드 토글 제거 */}
        <div className="flex items-center">
          {/* 정렬 선택 */}
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "최신순" | "인기순")
              }
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="최신순">최신순</option>
              <option value="인기순">인기순</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 게시글 별 사진 모음 (그리드 뷰만 사용) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleAlbums.map((album) => (
          <div
            key={album.boardId}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
          >
            <Link href={`/boards/${album.boardId}/photos`}>
              <div className="relative pb-[75%]">
                <img
                  src={album.mainPhotoUrl}
                  alt={album.title || `게시글 ${album.boardId}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
                  {album.additionalPhotoUrls.length + 1}장
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-1 truncate">
                  {album.title || `게시글 ${album.boardId}`}
                </h3>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{album.authorName || "작성자 정보 없음"}</span>
                  <span>{formatDate(album.createdAt || "")}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* 무한 스크롤 감지 영역 */}
      {hasMore && (
        <div ref={observerTarget} className="h-10 mt-8 flex justify-center">
          {loading && page > 1 && (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-700"></div>
          )}
        </div>
      )}

      {/* 더 불러올 데이터가 없는 경우 메시지 */}
      {!hasMore && albums.length > 0 && (
        <div className="mt-10 text-center text-gray-500">
          <p>모든 사진첩을 불러왔습니다.</p>
        </div>
      )}
    </main>
  );
}
