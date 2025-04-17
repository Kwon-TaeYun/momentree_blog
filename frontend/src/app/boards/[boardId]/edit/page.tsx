"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BiSearch, BiArrowBack, BiX } from "react-icons/bi";
import { BsImage, BsTag } from "react-icons/bs";
import dynamic from "next/dynamic";
import { FaImage, FaTimes } from "react-icons/fa";
import type { EditorInstance } from "@toast-ui/react-editor";

// Toast UI Editor를 클라이언트 사이드에서만 로드 (SSR 없이)
const Editor = dynamic(
  () => import("@toast-ui/react-editor").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full flex items-center justify-center">
        에디터 로딩 중...
      </div>
    ),
  }
);

// Toast UI Editor CSS 파일들
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";

// 언어 패키지는 Editor 컴포넌트의 language prop으로 처리

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params?.boardId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [representativeImage, setRepresentativeImage] = useState<string | null>(
    null
  );
  // 에디터에 삽입된 이미지 목록 추적
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Toast UI Editor 참조
  const editorRef = useRef<EditorInstance>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 인증 및 작성자 확인
  useEffect(() => {
    // 실제로는 API 호출로 대체
    setIsAuthenticated(true);
    setIsAuthor(true);
    setIsLoading(false);

    // 게시글 데이터 불러오기 (실제로는 API 호출)
    const fetchPostData = async () => {
      // API 호출 대신 임시 데이터
      const post = {
        title: "2024년 상반기 신제품 출시 안내",
        content:
          "안녕하세요, **2024년 상반기** 신제품 출시 일정을 안내드립니다.\n\n이번 신제품은 고객님들의 의견을 적극 반영하여 개발되었으며, 향상된 성능과 디자인으로 여러분을 찾아뵙게 되었습니다.",
        image:
          "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        tags: ["신제품", "2024", "기술"],
      };

      setTitle(post.title);
      setContent(post.content);
      setImage(post.image);
      setTags(post.tags || []);
      setIsLoading(false);

      // 에디터가 로드된 후 내용 설정
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.getInstance().setMarkdown(post.content);
        }
      }, 500);
    };

    fetchPostData();
  }, [boardId]);

  // 메인 이미지 업로드 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setImageFile(file);

    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        setImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 에디터에 이미지 삽입 핸들러
  const handleEditorImageUpload = (
    blob: File,
    callback: (url: string, alt: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;

      // HTML 태그와 스타일을 포함하여 중앙 정렬된 이미지로 삽입
      callback(imageUrl, blob.name);

      // 업로드된 이미지 목록에 추가
      setUploadedImages((prev) => [...prev, imageUrl]);
    };
    reader.readAsDataURL(blob);
    return false; // 기본 업로드 동작 방지
  };

  // 에디터 내용 변경 핸들러
  const handleEditorChange = () => {
    if (editorRef.current) {
      // 마크다운 콘텐츠 가져오기
      const markdownContent = editorRef.current.getInstance().getMarkdown();
      setContent(markdownContent);
    }
  };

  // 태그 관리 함수들
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 대표 이미지 업로드 핸들러
  const handleRepresentativeImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRepresentativeImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 대표 이미지 삭제 핸들러
  const handleRemoveRepresentativeImage = () => {
    setRepresentativeImage(null);
  };

  // 이미지 드래그 앤 드롭 핸들러
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRepresentativeImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 드래그 이벤트 방지
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 폼 제출 전 최종 내용 가져오기
      if (editorRef.current) {
        const markdownContent = editorRef.current.getInstance().getMarkdown();
        setContent(markdownContent);
      }

      // 유효성 검사
      if (!title.trim() || !content.trim()) {
        alert("제목과 내용을 모두 입력해주세요.");
        return;
      }

      // 실제로는 API 호출로 서버에 데이터 전송
      console.log("수정 데이터:", {
        boardId,
        title,
        content,
        imageFile,
        tags,
        representativeImage,
      });

      // 수정 완료 후 상세 페이지로 이동
      router.push(`/boards/${boardId}`);
    } catch (error) {
      console.error("게시글 수정 오류:", error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중이거나 인증되지 않은 경우
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  // 인증되지 않았거나 작성자가 아닌 경우
  if (!isAuthenticated || !isAuthor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다.</h1>
        <p className="mb-6">게시글을 수정할 권한이 없습니다.</p>
        <Link
          href={`/boards/${boardId}`}
          className="bg-[#2c714c] text-white px-4 py-2 rounded-md"
        >
          돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 헤더/네비게이션 */}
      <header className="border-b border-gray-100 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
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
                    사전집
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* 인증된 사용자의 경우 보여줄 UI */}
          {isAuthenticated && (
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
              <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden border-2 border-[#2c714c] cursor-pointer">
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
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-grow">
        <div className="max-w-screen-lg mx-auto px-4 py-8">
          {/* 뒤로가기 링크 */}
          <Link
            href={`/boards/${boardId}`}
            className="flex items-center text-gray-600 mb-6 hover:text-[#2c714c] transition-colors"
          >
            <BiArrowBack className="mr-1" />
            <span>게시글로 돌아가기</span>
          </Link>

          <h1 className="text-4xl font-bold mb-8">게시글 수정</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 제목 입력 */}
            <div>
              <label
                htmlFor="title"
                className="block mb-2 font-bold text-gray-700 text-xl"
              >
                제목
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#2c714c]"
                required
              />
            </div>

            {/* 태그 입력 */}
            <div>
              <label className="block mb-2 font-bold text-gray-700 text-xl">
                태그
              </label>
              <div className="mb-2">
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center bg-[#edf7f2] text-[#2c714c] px-3 py-1.5 rounded-full"
                    >
                      <span className="mr-1">#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[#2c714c] hover:text-[#225c3d]"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="태그를 입력하고 Enter를 누르세요"
                      className="w-full border border-gray-300 rounded-l-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#2c714c]"
                    />
                    <BsTag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-[#2c714c] text-white px-4 py-3 rounded-r-md hover:bg-[#225c3d] transition-colors"
                  >
                    추가
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  태그는 검색과 분류에 도움이 됩니다. (최대 10개)
                </p>
              </div>
            </div>

            {/* 대표 이미지 업로드 - 직관적인 UI로 변경 */}
            <div>
              <label className="block mb-2 font-bold text-gray-700 text-xl">
                대표 이미지
              </label>

              <div className="border border-gray-300 rounded-md overflow-hidden">
                {representativeImage ? (
                  // 이미지가 있는 경우 - 이미지 프리뷰 표시
                  <div className="relative">
                    <div className="bg-gray-100 w-full h-60 flex items-center justify-center">
                      <img
                        src={representativeImage}
                        alt="대표 이미지 미리보기"
                        className="max-h-60 max-w-full object-contain"
                      />
                    </div>

                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-25 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex gap-3">
                        {/* 이미지 변경 버튼 */}
                        <label className="cursor-pointer px-4 py-2 bg-white rounded shadow text-gray-700 hover:bg-gray-100 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleRepresentativeImageUpload}
                            className="hidden"
                          />
                          변경
                        </label>

                        {/* 이미지 삭제 버튼 */}
                        <button
                          type="button"
                          onClick={handleRemoveRepresentativeImage}
                          className="px-4 py-2 bg-white rounded shadow text-red-600 hover:bg-gray-100 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 이미지가 없는 경우 - 이미지 업로드 인터페이스 표시
                  <label className="flex flex-col items-center justify-center h-60 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center p-6">
                      <FaImage className="text-gray-400 w-16 h-16 mb-4" />
                      <p className="text-gray-700 font-medium mb-2 text-lg">
                        대표 이미지 업로드
                      </p>
                      <p className="text-gray-500 text-center">
                        JPG, PNG 파일을 여기에 끌어다 놓거나 클릭하여 선택하세요
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleRepresentativeImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 업로드된 이미지 목록 */}
            <div className="mt-6">
              <label className="block mb-2 font-bold text-gray-700 text-xl">
                업로드된 이미지
              </label>
              <div className="border border-gray-300 rounded-md p-4">
                {uploadedImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {uploadedImages.map((img, index) => (
                      <div
                        key={index}
                        className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden"
                      >
                        <img
                          src={img}
                          alt={`업로드된 이미지 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    에디터에 이미지를 추가하면 여기에 표시됩니다.
                  </div>
                )}
              </div>
            </div>

            {/* 내용 입력 - Toast UI Editor 사용 */}
            <div>
              <label className="block mb-2 font-bold text-gray-700 text-xl">
                내용
              </label>

              {/* 에디터 영역 */}
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <div className="toast-ui-editor-container">
                  {/* Toast UI Editor 컴포넌트 */}
                  <Editor
                    initialValue={content}
                    previewStyle="tab"
                    height="800px"
                    initialEditType="wysiwyg"
                    useCommandShortcut={true}
                    usageStatistics={false}
                    onChange={handleEditorChange}
                    ref={editorRef}
                    toolbarItems={[
                      ["heading", "bold", "italic", "strike"],
                      ["hr", "quote"],
                      ["ul", "ol", "task", "indent", "outdent"],
                      ["table", "image", "link"],
                      ["code", "codeblock"],
                    ]}
                    hooks={{
                      addImageBlobHook: handleEditorImageUpload,
                    }}
                    language="ko-KR"
                    placeholder="내용을 입력하세요..."
                    hideModeSwitch={true}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * 이미지를 삽입하려면 툴바의 이미지 아이콘을 클릭하세요.
              </p>
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-4 mt-10">
              <Link
                href={`/boards/${boardId}`}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors text-lg"
              >
                취소
              </Link>
              <button
                type="submit"
                className={`px-6 py-3 bg-[#2c714c] text-white rounded-md font-medium hover:bg-[#225c3d] transition-colors text-lg ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Toast UI Editor 스타일 */}
      <style jsx global>{`
        /* 에디터 컨테이너 스타일링 */
        .toast-ui-editor-container .toastui-editor-defaultUI {
          border: none;
        }

        /* 에디터 툴바 스타일링 */
        .toast-ui-editor-container .toastui-editor-toolbar {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        /* 에디터 내용 영역 스타일링 */
        .toast-ui-editor-container .toastui-editor-main {
          background-color: white;
        }

        /* 한글 입력 관련 스타일 */
        .toast-ui-editor-container .toastui-editor-ww-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          font-size: 1.15em;
        }

        /* 에디터 버튼 하이라이트 */
        .toast-ui-editor-container .toastui-editor-toolbar-icons.active {
          color: #2c714c !important;
          background-color: #edf7f2 !important;
        }

        /* 에디터 버튼 호버 */
        .toast-ui-editor-container .toastui-editor-toolbar-icons:hover {
          background-color: #edf7f2 !important;
        }

        /* 이미지 중앙 정렬 */
        .toast-ui-editor-container .toastui-editor-contents img {
          display: block;
          margin: 0 auto;
        }

        /* 에디터 내용 글씨 크기 */
        .toast-ui-editor-container .toastui-editor-contents {
          font-size: 1.15em;
        }
      `}</style>
    </div>
  );
}
