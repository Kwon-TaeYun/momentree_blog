"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaImage, FaTimes } from "react-icons/fa";
import { BsTag } from "react-icons/bs";
import dynamic from "next/dynamic";
import type { EditorInstance } from "@toast-ui/react-editor";
import { useGlobalLoginMember } from "../../../stores/auth/loginMember";

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
// import "@toast-ui/editor/dist/toastui-editor.css";
// import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";

// PhotoType enum 정의
enum PhotoType {
  MAIN = "MAIN",
  ADDITIONAL = "ADDITIONAL",
  PROFILE = "PROFILE",
}

// formData의 타입 정의
interface FormDataType {
  title: string;
  content: string;
  tags: string;
  categoryId: string | null; // categoryId를 string | null로 설정
}

type Category = {
  id: number;
  name: string;
};

export default function CreatePostPage() {
  const router = useRouter();
  const { loginMember } = useGlobalLoginMember(); // 전역 상태에서 사용자 정보 가져오기
  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    content: "",
    tags: "",
    categoryId: null, // 초기값은 null
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

  // 이미지 키를 관리하기 위한 상태 추가
  const [mainPhotoKey, setMainPhotoKey] = useState<string>("");
  const [additionalKeys, setAdditionalKeys] = useState<string[]>([]);

  // 카테고리 관련 상태값 추가
  const [categories, setCategories] = useState<Category[]>([]); // 카테고리 목록
  const [newCategory, setNewCategory] = useState(""); // 새 카테고리 입력값
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // 모달 상태

  // Editor 참조
  const editorRef = useRef<EditorInstance>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 클라이언트에서만 한글 번역 모듈을 불러옵니다
  useEffect(() => {
    import("@toast-ui/editor/dist/i18n/ko-kr").catch(console.error);
  }, []);

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

  // 에디터에 이미지 삽입 핸들러 - 하이브리드 방식
  const handleEditorImageUpload = (
    blob: File,
    callback: (url: string, alt: string) => void
  ) => {
    // 1. 먼저 즉시 화면에 보여주기 위해 FileReader로 미리보기 이미지 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImageUrl = e.target?.result as string;

      // 2. 에디터에 미리보기 이미지 표시 (사용자에게 보이는 부분)
      callback(previewImageUrl, blob.name);

      // 3. 동시에 백엔드에 실제 업로드 처리 시작
      uploadToS3(blob, previewImageUrl);
    };

    reader.readAsDataURL(blob);
    return false; // 기본 업로드 동작 방지
  };

  // S3 업로드 처리 함수 (별도 함수로 분리)
  const uploadToS3 = async (file: File, previewUrl: string) => {
    try {
      // 파일 정보 추출
      const filename = file.name;
      const contentType = file.type;

      // S3 프리사인드 URL 요청
      const response = await fetch(
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

      if (!response.ok) {
        throw new Error("프리사인드 URL 생성에 실패했습니다.");
      }

      // PUT용 URL, key, publicUrl 응답 받기
      const { url: uploadUrl, key, publicUrl } = await response.json();

      // S3에 직접 파일 업로드
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("이미지 업로드에 실패했습니다.");
      }

      // 에디터에서 base64 → publicUrl로 직접 교체 (URL 조합하지 않음)
      if (editorRef.current) {
        const editor = editorRef.current.getInstance();
        const md = editor.getMarkdown();
        // previewUrl이 포함된 마크다운을 찾아서 publicUrl로 교체
        const newMd = md.split(previewUrl).join(publicUrl);

        editor.setMarkdown(newMd);
      }

      // 키값만 저장 (백엔드 전송용)
      setAdditionalKeys((prev) => {
        if (prev.includes(key)) return prev;
        return [...prev, key];
      });
    } catch (error) {
      console.error("S3 이미지 업로드 오류:", error);
    }
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

    // 대표 이미지 유효성 검사 제거
    // 대표 이미지는 선택 사항으로 변경

    try {
      setSubmitting(true);

      // S3 기본 URL 정의 (환경 변수에서 가져오기)
      const S3_BASE =
        process.env.NEXT_PUBLIC_S3_BASE_URL ||
        "https://momentrees3bucket.s3.ap-northeast-2.amazonaws.com";

      // 콘텐츠에서 절대 경로(publicUrl)를 상대 경로(key)로 치환
      const submitContent = formData.content.replace(
        new RegExp(`${S3_BASE}/(uploads/[^)\\s]+)`, "g"),
        "/$1" // 또는 key 값만 남기려면 '$1'
      );

      console.log("제출 데이터:");
      console.log("- 제목:", formData.title);
      console.log("- 내용:", submitContent.substring(0, 100) + "...");
      console.log("- 대표 이미지 키:", mainPhotoKey || "없음");
      console.log("- 추가 이미지 키들:", additionalKeys);

      // 요청 데이터 생성 - BoardRequestDto와 일치하는 형식
      const requestData = {
        title: formData.title,
        content: submitContent, // 치환된 콘텐츠 사용
        currentMainPhotoUrl: mainPhotoKey || null, // 대표 이미지가 없으면 null 전송
        photoUrls: additionalKeys, // ADDITIONAL 키들
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null, // 유효하지 않은 값은 null로 처리
      };

      // console.log("Request Data:", requestData); // 디버깅용 로그

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
        }/api/v1/boards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "게시글 작성에 실패했습니다.");
      }

      alert("게시글이 성공적으로 작성되었습니다.");
      router.push("/members/login/myblog");
    } catch (error: any) {
      console.error("게시글 작성 오류:", error);
      alert(error.message || "게시글 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false); // 제출 상태 초기화
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
          setUploadedImages((prev) => [...prev, url]); // URL은 프리뷰용
          setAdditionalKeys((prev) => [...prev, key]); // 키는 백엔드 전송용
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

      const { url, key, publicUrl } = await presignedUrlResponse.json();

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

      // 업로드 성공한 이미지 정보 저장 - 키 값만 저장 (DB 용)
      setMainPhotoKey(key);

      // mainPhotoData에는 url 및 타입 정보 저장
      setMainPhotoData({
        url: key, // DB에 저장될 값은 key만
        publicUrl: publicUrl, // 브라우저에서 표시용
        type: PhotoType.MAIN,
      });
    } catch (error) {
      console.error("대표 이미지 업로드 오류:", error);
      alert("대표 이미지 업로드에 실패했습니다.");
      setRepresentativeImage(null);
      setMainImageFile(null);
      setMainPhotoKey("");
    }
  };

  // 대표 이미지 삭제 핸들러
  const handleRemoveRepresentativeImage = () => {
    setRepresentativeImage(null);
    setMainImageFile(null);
    setMainPhotoData(null);
    setMainPhotoKey("");
  };

  // 카테고리 모달 열기
  const openCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  // 카테고리 모달 닫기
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  // 카테고리 조회 함수
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
        }/api/v1/categories`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 인증 정보 포함
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data.map((category: Category) => category)); // 카테고리 객체로 설정
      } else {
        const errorMessage = await response.text();
        alert(`카테고리 조회 실패: ${errorMessage}`);
      }
    } catch (error) {
      console.error("카테고리 조회 중 오류:", error);
      alert("카테고리 조회 중 오류가 발생했습니다.");
    }
  };

  // 페이지 로드 시 카테고리 조회
  useEffect(() => {
    fetchCategories();
  }, []);

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("카테고리 이름을 입력하세요.");
      return;
    }
    console.log("loginMember:", loginMember);
    try {
      // blogId 가져오기

      const blogId = loginMember.blogId;
      if (!blogId) {
        alert("블로그 ID를 찾을 수 없습니다.");
        return;
      }

      // API 호출
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
        }/api/v1/categories/${blogId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newCategory.trim(), // 카테고리 이름
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories((prev) => [...prev, data]); // 새 카테고리를 목록에 추가
        setNewCategory(""); // 입력 필드 초기화
        alert("카테고리가 추가되었습니다.");
      } else {
        const errorMessage = await response.text();
        alert(`카테고리 추가 실패: ${errorMessage}`);
      }
    } catch (error) {
      console.error("카테고리 추가 중 오류:", error);
      alert("카테고리 추가 중 오류가 발생했습니다.");
    }
  };

  // 카테고리 선택
  const handleSelectCategory = (category: Category) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: category.id.toString(), // 카테고리 ID를 문자열로 설정
    }));
    closeCategoryModal();
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const blogId = loginMember.blogId;
      if (!blogId) {
        alert("블로그 ID를 찾을 수 없습니다.");
        return;
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
        }/api/v1/categories/${blogId}/${category.name}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat.id !== category.id)); // 삭제된 카테고리를 목록에서 제거
        alert("카테고리가 삭제되었습니다.");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "카테고리 삭제 실패";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("카테고리 삭제 중 오류:", error);
      alert("카테고리 삭제 중 오류가 발생했습니다.");
    }
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* 메인 콘텐츠 */}
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 py-4">
          <div className="flex-1">
            <div className="bg-white rounded-lg p-6">
              <h1 className="text-4xl font-bold mb-6">새 글 작성</h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 제목 입력 */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-lg font-medium text-black mb-2"
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
                  <label className="block text-lg font-medium text-black mb-2">
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

                {/* 카테고리 선택 */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    카테고리
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {categories.find(
                        (category) =>
                          category.id.toString() === formData.categoryId
                      )?.name || "카테고리를 선택하세요"}
                    </span>
                    <button
                      type="button"
                      onClick={openCategoryModal}
                      className="px-4 py-1 text-sm rounded-full border border-gray-200 hover:bg-gray-50 text-black"
                    >
                      카테고리 선택
                    </button>
                  </div>
                </div>

                {/* 내용 입력 - Toast UI Editor */}
                <div>
                  <label
                    htmlFor="content"
                    className="block text-lg font-medium text-black mb-2"
                  >
                    내용
                  </label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="toast-ui-editor-container">
                      <Editor
                        initialValue=" "
                        height="900px"
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
                        placeholder=""
                        hideModeSwitch={true}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * 이미지를 삽입하려면 툴바의 이미지 아이콘을 클릭하세요.
                  </p>
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

                <div className="flex justify-end space-x-2 pt-4">
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

      {/* 카테고리 모달 */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-medium text-black mb-4">
              카테고리 선택
            </h2>
            <div className="space-y-4">
              {/* 기존 카테고리 목록 */}
              {categories.map((category: Category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <span className="text-sm text-gray-700">{category.name}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(category)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      선택
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}

              {/* 새 카테고리 추가 */}
              <div>
                <label
                  htmlFor="new-category"
                  className="block text-sm font-medium text-black mb-2"
                >
                  새 카테고리 추가
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="new-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>

            {/* 모달 닫기 버튼 */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeCategoryModal}
                className="px-4 py-2 text-sm text-black border border-gray-300 rounded-md hover:bg-gray-100"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast UI Editor 스타일 */}
      <style jsx global>{`
        /* 에디터 기본 텍스트 숨기기 */
        .toastui-editor-defaultUI-toolbar {
          background: white !important;
        }

        .toastui-editor-mode-switch {
          display: none !important;
        }

        .toastui-editor-tabs {
          display: none !important;
        }

        .toastui-editor-main .ProseMirror {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
          font-size: 1.3em !important; /* 글씨 크기 30% 증가 */
          line-height: 1.6 !important;
          text-align: left !important; /* 텍스트 왼쪽 정렬 강제 */
          padding-top: 16px !important; /* 상단 패딩 추가 */
        }

        /* Write/Preview 텍스트 제거 - 첫번째 줄 숨김 제거 */
        /* .toastui-editor-main .ProseMirror p:first-child {
          display: none !important;
        } */

        /* 불필요한 여백 제거 */
        .toastui-editor-defaultUI {
          border: none !important;
        }

        .toastui-editor-main {
          background-color: white !important;
          padding-top: 16px !important; /* 상단 패딩 추가 */
        }

        /* 텍스트 왼쪽 정렬 */
        .toastui-editor-contents p,
        .toastui-editor-contents h1,
        .toastui-editor-contents h2,
        .toastui-editor-contents h3,
        .toastui-editor-contents h4,
        .toastui-editor-contents h5,
        .toastui-editor-contents h6,
        .toastui-editor-contents ul,
        .toastui-editor-contents ol,
        .toastui-editor-contents blockquote {
          text-align: left !important;
        }

        /* 이미지 정렬 옵션 */
        .toastui-editor-contents img {
          max-width: 100% !important;
          margin: 0 auto !important;
          display: block !important;
        }
      `}</style>
    </div>
  );
}
