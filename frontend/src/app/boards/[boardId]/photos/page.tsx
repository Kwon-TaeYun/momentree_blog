"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { MdKeyboardArrowDown, MdClose } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";
import { IoImagesOutline } from "react-icons/io5";
import { useParams } from "next/navigation";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// 사진 데이터를 위한 인터페이스 정의
interface Photo {
  id: number;
  src: string;
  title: string;
  totalImages: number;
  isMain: boolean;
  isDefault?: boolean;
}

export default function PhotosPage() {
  const params = useParams();
  const boardId = params?.boardId as string;
  const [photoFilter, setPhotoFilter] = useState<string>("전체사진");
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(8); // 초기에 보여질 사진 개수
  const [loading, setLoading] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 팝업 상태 관리
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // 사진 더미 데이터 생성 함수 (무한 스크롤 시연용)
  const generateDummyPhotos = (count: number): Photo[] => {
    const dummyImages = [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
      "https://images.unsplash.com/photo-1556911220-bff31c812dba",
      "https://images.unsplash.com/photo-1559599238-308793637427",
      "https://images.unsplash.com/photo-1617104678098-de229db51175",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92",
    ];

    // 첫 16개만 생성 (무한 스크롤 테스트를 위해)
    return Array.from({ length: Math.min(count, 16) }, (_, i) => ({
      id: i + 1,
      src: dummyImages[i % dummyImages.length],
      title: `사진 ${i + 1}`,
      totalImages: 4,
      isMain: i === 0, // 첫번째 사진만 메인으로 설정
    }));
  };

  // 예시 데이터 (실제로는 API에서 가져올 것입니다)
  const [allPhotos, setAllPhotos] = useState<Photo[]>(() =>
    generateDummyPhotos(16)
  );

  // 무한 스크롤 관찰자 설정
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading) {
          loadMorePhotos();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleCount, loading]);

  // 추가 사진 로드 함수
  const loadMorePhotos = useCallback(() => {
    if (visibleCount >= allPhotos.length) return;

    setLoading(true);

    // 실제 API 호출 대신 지연 시간을 두어 로딩 효과를 보여줌
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 4, allPhotos.length));
      setLoading(false);
    }, 800);
  }, [visibleCount, allPhotos.length]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 메인 사진이 있는지 확인
  const hasMainPhoto = allPhotos.some((photo) => photo.isMain);

  // 메인 사진이 없는 경우 사용할 기본 로고 사진
  const defaultMainPhoto: Photo = {
    id: 0,
    src: "/images/logo.png", // 로고 이미지 경로
    title: "기본 이미지",
    totalImages: 1,
    isMain: true,
    isDefault: true,
  };

  // 필터링 및 정렬된 사진 목록
  const filteredPhotos = allPhotos
    .filter((photo) => {
      if (photoFilter === "전체사진") return true;
      if (photoFilter === "메인사진") return photo.isMain;
      if (photoFilter === "추가사진") return !photo.isMain;
      return true;
    })
    .sort((a, b) => {
      // 메인 사진을 항상 첫 번째로 정렬
      if (a.isMain) return -1;
      if (b.isMain) return 1;
      return 0;
    });

  // 최종 표시할 사진 목록 (메인 사진이 없으면 기본 이미지 추가)
  const displayPhotos = hasMainPhoto
    ? filteredPhotos
    : photoFilter === "전체사진" || photoFilter === "메인사진"
    ? [defaultMainPhoto, ...filteredPhotos]
    : filteredPhotos;

  // 표시할 사진 목록 (무한 스크롤을 위해 visibleCount로 제한)
  const visiblePhotos = displayPhotos.slice(0, visibleCount);

  // 팝업에서 다음/이전 사진으로 이동
  const navigatePhoto = (direction: "prev" | "next") => {
    if (!selectedPhoto) return;

    const currentIndex = displayPhotos.findIndex(
      (p) => p.id === selectedPhoto.id
    );
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === "prev") {
      newIndex =
        (currentIndex - 1 + displayPhotos.length) % displayPhotos.length;
    } else {
      newIndex = (currentIndex + 1) % displayPhotos.length;
    }

    setSelectedPhoto(displayPhotos[newIndex]);
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      } else if (e.key === "ArrowLeft") {
        navigatePhoto("prev");
      } else if (e.key === "ArrowRight") {
        navigatePhoto("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto]);

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 헤더/네비게이션 */}
      <header className="border-b border-gray-100 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center">
          {/* 로고 */}
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
                  href="/my-tree"
                  className="text-gray-600 hover:text-gray-900 py-4"
                >
                  나의 나무
                </Link>
              </li>
              <li>
                <Link
                  href="/dictionary"
                  className="text-gray-900 border-b-2 border-gray-700 py-4"
                >
                  사전집
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        {/* 필터링 섹션 */}
        <div className="mb-6">
          {/* 필터 및 정렬 옵션 - 통일된 디자인 */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {/* 사진 필터 */}
              <div className="relative" ref={filterRef}>
                <button
                  className="flex items-center bg-white border-0 px-4 py-2.5 rounded-lg text-gray-700 shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <span>{photoFilter}</span>
                  <MdKeyboardArrowDown
                    className={`ml-2 transition-transform ${
                      showFilterDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* 드롭다운 메뉴 */}
                {showFilterDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <button
                      className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                        photoFilter === "전체사진"
                          ? "bg-gray-50 font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        setPhotoFilter("전체사진");
                        setShowFilterDropdown(false);
                      }}
                    >
                      전체사진
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                        photoFilter === "메인사진"
                          ? "bg-gray-50 font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        setPhotoFilter("메인사진");
                        setShowFilterDropdown(false);
                      }}
                    >
                      메인사진
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                        photoFilter === "추가사진"
                          ? "bg-gray-50 font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        setPhotoFilter("추가사진");
                        setShowFilterDropdown(false);
                      }}
                    >
                      추가사진
                    </button>
                  </div>
                )}
              </div>

              {/* 정렬 옵션 - 전체 사진 옆으로 이동 */}
              <div className="relative">
                <button className="flex items-center bg-white border-0 px-4 py-2.5 rounded-lg text-gray-700 shadow-md hover:shadow-lg transition-shadow">
                  <span>최신순</span>
                  <MdKeyboardArrowDown className="ml-2" />
                </button>
              </div>
            </div>

            {/* 뷰 타입 전환 - 게시글/사진 모아보기 */}
            <div className="flex items-center">
              <div className="flex rounded-lg overflow-hidden shadow-md">
                <Link
                  href={`/boards/${boardId}`}
                  className="flex items-center gap-1 bg-white text-gray-600 hover:bg-gray-50 px-4 py-2.5 border-0 transition-colors"
                >
                  <HiOutlineDocumentText className="text-lg" />
                  <span>게시글 보기</span>
                </Link>
                <button
                  className="flex items-center gap-1 bg-gray-100 text-gray-900 px-4 py-2.5 border-0"
                  disabled
                >
                  <IoImagesOutline className="text-lg" />
                  <span>사진 모아보기</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 사진 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visiblePhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-xl overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white cursor-pointer"
              onClick={() => {
                setSelectedPhoto(photo);
                setShowModal(true);
              }}
            >
              <div className="relative pb-[75%]">
                <div className="absolute inset-0">
                  {photo.isDefault ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Image
                        src={photo.src}
                        alt={photo.title}
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                {photo.isMain && (
                  <div className="absolute top-2 left-2 bg-[#2c714c] text-white text-xs px-2 py-1 rounded-md">
                    메인
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 무한 스크롤을 위한 로딩 인디케이터 */}
        {visibleCount < displayPhotos.length && (
          <div
            ref={loadMoreRef}
            className="flex justify-center items-center my-8 h-10"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full bg-[#2c714c] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-[#2c714c] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-[#2c714c] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            ) : (
              <div className="text-gray-400">스크롤하여 더 많은 사진 보기</div>
            )}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="py-6 text-center border-t border-gray-100 mt-8 bg-white"></footer>

      {/* 사진 팝업 모달 */}
      {showModal && selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setShowModal(false)}
        >
          {/* 모달 내용 - 이벤트 버블링 방지 */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              className="absolute top-0 right-0 z-10 p-2 text-white bg-black bg-opacity-50 rounded-bl-lg hover:bg-opacity-70 transition-all"
              onClick={() => setShowModal(false)}
            >
              <MdClose size={24} />
            </button>

            {/* 이전 사진 버튼 */}
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 text-white bg-black bg-opacity-50 rounded-r-lg hover:bg-opacity-70 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("prev");
              }}
            >
              <FiChevronLeft size={28} />
            </button>

            {/* 다음 사진 버튼 */}
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 text-white bg-black bg-opacity-50 rounded-l-lg hover:bg-opacity-70 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("next");
              }}
            >
              <FiChevronRight size={28} />
            </button>

            {/* 사진 표시 */}
            <div className="h-[85vh] flex items-center justify-center">
              {selectedPhoto.isDefault ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={selectedPhoto.src}
                    alt={selectedPhoto.title}
                    width={200}
                    height={200}
                    className="object-contain max-h-full"
                  />
                </div>
              ) : (
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="object-contain max-h-full max-w-full"
                />
              )}
            </div>

            {/* 사진 정보 */}
            {selectedPhoto.isMain && (
              <div className="absolute top-2 left-2 bg-[#2c714c] text-white px-3 py-1 rounded-md">
                메인
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
