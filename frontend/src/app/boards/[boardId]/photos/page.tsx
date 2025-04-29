"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaImages,
  FaShareAlt,
  FaDownload,
} from "react-icons/fa";

// API 응답 타입 정의
interface PresignedUrl {
  url: string;
  key: string;
  publicUrl: string;
}

interface BoardPhotoResponseDto {
  boardId: number;
  mainPhotoUrl: PresignedUrl;
  additionalPhotoUrls: PresignedUrl[];
  boardName?: string;
}

// 내부에서 사용할 사진 타입 정의
interface Photo {
  id: string;
  url: string;
  alt?: string;
  type?: string;
}

export default function PhotosPage() {
  const { boardId } = useParams();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [boardTitle, setBoardTitle] = useState<string>("");

  // 무한 스크롤 관련 상태
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 새로운 UI 관련 상태
  const [filter, setFilter] = useState<"all" | "main" | "additional">("all");

  // API 기본 URL
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.blog.momentree.site";

  // 사진 가져오기
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${API_BASE}/api/v1/boards/${boardId}/album/photos`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("사진을 가져오는데 실패했습니다.");
        const data: BoardPhotoResponseDto = await res.json();
        console.log("게시글 제목:", data.boardName);
        // 게시글 제목 설정
        setBoardTitle(data.boardName || `게시글 ${boardId}`);

        // mainPhotoUrl과 additionalPhotoUrls에서 url 필드만 꺼내서 하나의 배열로 병합
        const all: Photo[] = [];

        if (data.mainPhotoUrl) {
          all.push({
            id: "main",
            url: data.mainPhotoUrl.publicUrl,
            type: "MAIN",
            alt: "대표 사진",
          });
        }

        if (data.additionalPhotoUrls && data.additionalPhotoUrls.length > 0) {
          data.additionalPhotoUrls.forEach((p, i) => {
            all.push({
              id: `add-${i}`,
              url: p.publicUrl, // ← presigned URL
              type: "ADDITIONAL",
              alt: `추가 사진 ${i + 1}`,
            });
          });
        }

        setPhotos(all);

        // 초기 페이지 로드 시 첫 8개만 표시
        setVisiblePhotos(all.slice(0, 8));
        setHasMore(all.length > 8);
        setPage(2); // 다음 페이지는 2
      } catch (err) {
        console.error("사진 로딩 오류:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [boardId, API_BASE]);

  // 필터링된 사진 계산
  const filteredPhotos = useCallback(() => {
    if (filter === "all") return photos;
    return photos.filter(
      (photo) => photo.type === (filter === "main" ? "MAIN" : "ADDITIONAL")
    );
  }, [photos, filter]);

  // 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          // 필터링된 사진들 중 다음 페이지의 사진 4개를 가져옴
          const filtered = filteredPhotos();
          const nextItems = filtered.slice((page - 1) * 4, page * 4);

          if (nextItems.length > 0) {
            setVisiblePhotos((prev) => [...prev, ...nextItems]);
            setPage((prev) => prev + 1);
            setHasMore(page * 4 < filtered.length);
          } else {
            setHasMore(false);
          }
        }
      },
      { threshold: 0.5 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loading, page, filteredPhotos]);

  // 필터 변경 시 상태 초기화
  useEffect(() => {
    const filtered = filteredPhotos();
    setVisiblePhotos(filtered.slice(0, 8));
    setHasMore(filtered.length > 8);
    setPage(2);
  }, [filter, filteredPhotos]);

  // 사진 클릭 시 모달 표시
  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setSelectedPhoto(null);
  };

  // 이전 사진으로 이동
  const goToPrevPhoto = () => {
    if (!selectedPhoto) return;
    const filtered = filteredPhotos();
    const currentIndex = filtered.findIndex((p) => p.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + filtered.length) % filtered.length;
    setSelectedPhoto(filtered[prevIndex]);
  };

  // 다음 사진으로 이동
  const goToNextPhoto = () => {
    if (!selectedPhoto) return;
    const filtered = filteredPhotos();
    const currentIndex = filtered.findIndex((p) => p.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % filtered.length;
    setSelectedPhoto(filtered[nextIndex]);
  };

  // 키보드 이벤트 핸들러 - 모달이 열려있을 때만 작동
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (showModal) {
        if (event.key === "Escape") closeModal();
        if (event.key === "ArrowLeft") goToPrevPhoto();
        if (event.key === "ArrowRight") goToNextPhoto();
      }
    },
    [showModal, selectedPhoto]
  );

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto, handleKeyDown]);

  // 모달이 열려있을 때 스크롤 방지
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  // 사진 다운로드 함수
  const downloadPhoto = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename || "photo.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("다운로드 중 오류 발생:", error);
    }
  };

  // 사진 공유 함수
  const sharePhoto = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: boardTitle,
          text: "사진 공유하기",
          url: url,
        });
      } catch (error) {
        console.error("공유 중 오류 발생:", error);
      }
    } else {
      // 클립보드에 복사
      navigator.clipboard
        .writeText(url)
        .then(() => alert("링크가 클립보드에 복사되었습니다."))
        .catch((err) => console.error("클립보드 복사 실패:", err));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* 헤더 영역 - 현대적인 디자인으로 업데이트 */}
      <header className="py-4 px-6 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <Link
              href={`/boards/${boardId}`}
              className="mr-4 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center"
            >
              <FaChevronLeft className="mr-2" /> 돌아가기
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
              {boardTitle ? boardTitle : "사진 모아보기"}
            </h1>
          </div>

          {/* 컨트롤 영역 - 필터 옵션만 남기고 뷰 모드 토글 제거 */}
          <div className="flex items-center">
            {/* 필터 옵션 */}
            <div className="relative inline-block">
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as "all" | "main" | "additional")
                }
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-2 pl-3 pr-8 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="all">모든 사진</option>
                <option value="main">대표 사진</option>
                <option value="additional">추가 사진</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 로딩 상태 - 현대적인 스켈레톤 UI */}
      {loading && page === 1 && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-7xl">
            <div className="flex items-center justify-center flex-col">
              <div className="animate-pulse flex flex-col items-center space-y-8 w-full">
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 오류 상태 - 모던한 디자인으로 업데이트 */}
      {!loading && error && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              오류가 발생했습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 사진 그리드 - 항상 메이슨리 레이아웃만 사용(뷰 모드 전환 제거) */}
      {!loading && !error && (
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                총 {filteredPhotos().length}장의 사진
              </p>

              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                >
                  모든 사진 보기
                </button>
              )}
            </div>

            {/* 메이슨리 레이아웃 사용 (항상) */}
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {visiblePhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid transform transition-opacity duration-300 opacity-100"
                >
                  <div
                    className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => openPhotoModal(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt || "게시글 사진"}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="text-white text-sm font-medium">
                        {photo.type === "MAIN" ? "대표 사진" : `추가 사진`}
                      </div>
                    </div>

                    {photo.type === "MAIN" && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md">
                        대표
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 무한 스크롤 감지 영역 */}
            {hasMore && (
              <div
                ref={observerTarget}
                className="h-20 mt-8 flex justify-center items-center"
              >
                {loading && page > 1 && (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 dark:border-green-400"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      더 불러오는 중...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 더 불러올 데이터가 없는 경우 메시지 */}
            {!hasMore && photos.length > 8 && (
              <div className="mt-8 text-center text-gray-500 dark:text-gray-400 py-4">
                <p>모든 사진을 불러왔습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 사진 상세보기 모달 - 현대적인 디자인으로 업데이트 */}
      {showModal && selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
          {/* 모달 닫기 버튼 */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-gray-300 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            aria-label="닫기"
          >
            <FaTimes size={20} />
          </button>

          {/* 좌우 탐색 버튼 */}
          <button
            onClick={goToPrevPhoto}
            className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            aria-label="이전 사진"
          >
            <FaChevronLeft size={20} />
          </button>

          <button
            onClick={goToNextPhoto}
            className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            aria-label="다음 사진"
          >
            <FaChevronRight size={20} />
          </button>

          {/* 이미지 컨테이너 */}
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.alt || "게시글 사진"}
              className="max-w-full max-h-full object-contain transition-opacity duration-300"
              style={{ opacity: 1 }}
            />
          </div>

          {/* 하단 컨트롤 바 */}
          <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-between items-center px-4 md:px-6">
            <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-full text-sm backdrop-blur-sm">
              {selectedPhoto.type === "MAIN" ? "대표 사진" : "추가 사진"}
            </div>

            <div className="flex items-center space-x-2">
              {/* 다운로드 버튼 */}
              <button
                onClick={() =>
                  downloadPhoto(
                    selectedPhoto.url,
                    `photo-${selectedPhoto.id}.jpg`
                  )
                }
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors backdrop-blur-sm"
                aria-label="다운로드"
              >
                <FaDownload size={16} />
              </button>

              {/* 공유 버튼 */}
              <button
                onClick={() => sharePhoto(selectedPhoto.url)}
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors backdrop-blur-sm"
                aria-label="공유하기"
              >
                <FaShareAlt size={16} />
              </button>

              {/* 사진 인덱스 표시 */}
              <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-full text-sm backdrop-blur-sm">
                {filteredPhotos().findIndex((p) => p.id === selectedPhoto.id) +
                  1}{" "}
                / {filteredPhotos().length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
