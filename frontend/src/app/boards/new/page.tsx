"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaImage, FaTimes } from "react-icons/fa";
import { BsTag } from "react-icons/bs";
import dynamic from "next/dynamic";
import type { EditorInstance } from "@toast-ui/react-editor";

// Toast UI Editor 동적 임포트
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

// Toast UI Editor CSS
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";

// PhotoType enum 정의
enum PhotoType {
  MAIN = "MAIN",
  ADDITIONAL = "ADDITIONAL",
  PROFILE = "PROFILE",
}

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [representativeImage, setRepresentativeImage] = useState<string | null>(
    null
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // 이미지 업로드를 위한 상태값 추가
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainPhotoData, setMainPhotoData] = useState<any>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Editor 참조
  const editorRef = useRef<EditorInstance>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 로그인 여부 확인
  useEffect(() => {
    // 쿠키 확인으로 로그인 여부 체크
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        // 백엔드에 인증 확인 요청
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
          }/api/v1/members/me`,
          {
            method: "GET",
            credentials: "include", // 쿠키 포함
          }
        );

        if (!response.ok) {
          // 로그인 페이지로
          router.push("/members/login");
          return;
        }

        const userData = await response.json();
        setUserId(userData.id);
        setIsLoading(false);
      } catch (error) {
        console.error("인증 확인 오류:", error);
        router.push("/members/login");
      }
    };

    checkLoginStatus();
  }, [router]);

  // 에디터에 이미지 삽입 핸들러 - S3 업로드 구현
  const handleEditorImageUpload = (
    blob: File,
    callback: (url: string, alt: string) => void
  ) => {
    try {
      // 파일 정보 추출
      const filename = blob.name;
      const contentType = blob.type;

      // S3 프리사인드 URL 요청
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
        }/api/s3/presigned-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            filename,
            contentType,
            photoType: PhotoType.ADDITIONAL,
            userId: userId,
          }),
        }
      )
        .then(response => {
          if (!response.ok) {
            throw new Error("프리사인드 URL 생성에 실패했습니다.");
          }
          return response.json();
        })
        .then(({ url, key }) => {
          // S3에 직접 파일 업로드
          return fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": contentType,
            },
            body: blob,
          }).then(uploadResponse => {
            if (!uploadResponse.ok) {
              throw new Error("이미지 업로드에 실패했습니다.");
            }

            // 에디터에 이미지 URL 삽입 (실제 서비스 URL로 교체)
            const imageUrl = url.split("?")[0]; // 쿼리 파라미터 제거
            callback(imageUrl, blob.name);

            // 업로드된 이미지 목록에 추가
            setUploadedImages((prev) => [...prev, key]);
          });
        })
        .catch(error => {
          console.error("에디터 이미지 업로드 오류:", error);
          alert("이미지 업로드에 실패했습니다.");
        });
    } catch (error) {
      console.error("에디터 이미지 업로드 오류:", error);
      alert("이미지 업로드에 실패했습니다.");
    }

    return false; // 기본 업로드 동작 방지
  };

  // 에디터 내용 변경 핸들러
  const handleEditorChange = () => {
    if (editorRef.current) {
      const markdownContent = editorRef.current.getInstance().getMarkdown();
      setFormData((prev) => ({
        ...prev,
        content: markdownContent,
      }));
    }
  };

  // 태그 관리 함수들
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (!mainPhotoData) {
      alert("대표 이미지를 업로드해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      // S3에 업로드된 이미지의 key(URL)만 전송
      const mainPhotoUrl = mainPhotoData.url;

      // 추가 이미지 URL 목록
      const photoUrls = uploadedImages;

      // 요청 데이터 생성 - Photo 객체 대신 URL 문자열만 전송
      const requestData = {
        title: formData.title,
        content: formData.content,
        currentMainPhotoUrl: mainPhotoUrl, // Photo 객체 대신 URL 문자열만 전송
        photoUrls: photoUrls, // 배열 형태로 URL 문자열만 전송
        categoryId: null, // 카테고리 기능 구현 시 추가
      };

      // 백엔드 API 호출
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
        }/api/v1/boards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 쿠키 포함
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("게시글 작성에 실패했습니다.");
      }

      const result = await response.text();
      alert("게시글이 성공적으로 작성되었습니다.");

      // 게시글 목록 페이지로 이동
      router.push("/boards");
    } catch (error) {
      console.error("게시글 작성 오류:", error);
      alert("게시글 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(newFiles);
      setAdditionalImageFiles(newFiles);

      // 각 파일 업로드 처리
      newFiles.forEach(async (file) => {
        try {
          // 파일 메타데이터
          const filename = file.name;
          const contentType = file.type;

          // S3 프리사인드 URL 요청
          const presignedUrlResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
            }/api/s3/presigned-url`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                filename,
                contentType,
                photoType: PhotoType.ADDITIONAL,
                userId: userId,
              }),
            }
          );

          if (!presignedUrlResponse.ok) {
            throw new Error("프리사인드 URL 생성에 실패했습니다.");
          }

          const { url, key } = await presignedUrlResponse.json();

          // S3에 직접 파일 업로드
          const uploadResponse = await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": contentType,
            },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error("추가 이미지 업로드에 실패했습니다.");
          }

          // 업로드된 이미지 목록에 추가
          setUploadedImages((prev) => [...prev, key]);
        } catch (error) {
          console.error("추가 이미지 업로드 오류:", error);
        }
      });
    }
  };

  // 대표 이미지 업로드 핸들러
  const handleRepresentativeImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 파일 메타데이터
      const filename = file.name;
      const contentType = file.type;

      // 파일 상태 업데이트
      setMainImageFile(file);

      // 프리뷰용 로컬 URL 생성
      const reader = new FileReader();
      reader.onload = (event) => {
        setRepresentativeImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 만약 게시글 ID가 없는 경우(새 게시글 작성)
      // S3 프리사인드 URL 요청
      const presignedUrlResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
        }/api/s3/presigned-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            filename,
            contentType,
            photoType: PhotoType.MAIN,
            userId: userId,
          }),
        }
      );

      if (!presignedUrlResponse.ok) {
        throw new Error("프리사인드 URL 생성에 실패했습니다.");
      }

      const { url, key } = await presignedUrlResponse.json();

      // S3에 직접 파일 업로드
      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("대표 이미지 업로드에 실패했습니다.");
      }

      // 업로드 성공한 이미지 정보 저장
      setMainPhotoData({
        url: key,
        type: PhotoType.MAIN,
      });
    } catch (error) {
      console.error("대표 이미지 업로드 오류:", error);
      alert("대표 이미지 업로드에 실패했습니다.");
      setRepresentativeImage(null);
      setMainImageFile(null);
    }
  };

  // 대표 이미지 삭제 핸들러
  const handleRemoveRepresentativeImage = () => {
    setRepresentativeImage(null);
    setMainImageFile(null);
    setMainPhotoData(null);
  };

  // 로딩 중이면 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex gap-6 py-8">
          <div className="flex-1">
            <div className="bg-white rounded-lg p-6">
              <h1 className="text-xl font-normal text-black mb-6">
                새 글 작성
              </h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 제목 입력 */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    제목
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="제목을 입력하세요"
                      value={formData.title}
                      onChange={handleChange}
                      className="block w-full border-0 text-base text-black placeholder-gray-600 focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 대표 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    대표 이미지
                  </label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
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
                          <FaImage className="text-gray-400 w-12 h-12 mb-4" />
                          <p className="text-gray-700 font-medium mb-2 text-lg">
                            대표 이미지 업로드
                          </p>
                          <p className="text-gray-500 text-center text-sm">
                            JPG, PNG 파일을 여기에 끌어다 놓거나 클릭하여
                            선택하세요
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

                {/* 내용 입력 - Toast UI Editor */}
                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    내용
                  </label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="toast-ui-editor-container">
                      <Editor
                        initialValue=""
                        previewStyle="tab"
                        height="400px"
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

                {/* 추가 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    추가 이미지
                  </label>
                  <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8">
                    <div className="text-center">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mt-1 text-sm text-gray-600">
                            사진 업로드 또는 드래그 앤 드롭
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png,image/jpeg,image/gif"
                      />
                    </div>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {files.length}개의 파일이 선택됨
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6 text-black">글 설정</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-black">
                      공개 설정
                    </h3>
                    <button className="px-4 py-1 text-sm rounded-full border border-gray-200 hover:bg-gray-50 text-black">
                      전체 공개
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-black">카테고리</h3>
                    <button className="px-4 py-1 text-sm rounded-full border border-gray-200 hover:bg-gray-50 text-black">
                      카테고리 선택
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-black">댓글 허용</h3>
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      isDarkMode ? "bg-black" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        isDarkMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-black mb-2">
                    태그 추가
                  </h3>
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
                    <div className="relative">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="#태그 입력 (쉼표로 구분)"
                        className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black placeholder-gray-900 pr-14"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-black px-2 py-1"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-4">
                  <div className="flex items-center justify-center">
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                      작성 중인 글은 1분마다 자동저장됩니다.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 text-black"
                  >
                    임시저장
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 text-black"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm text-white rounded-md bg-black hover:bg-gray-800"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "저장 중..." : "작성"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
