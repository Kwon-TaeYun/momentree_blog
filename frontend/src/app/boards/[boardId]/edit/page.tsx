"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BiSearch, BiArrowBack, BiX } from "react-icons/bi";
import dynamic from "next/dynamic";
import { FaImage, FaTimes } from "react-icons/fa";
import type { EditorInstance } from "@toast-ui/react-editor";
import { useGlobalLoginMember } from "@/stores/auth/loginMember";

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

interface Board {
  id: number;
  title: string;
  content: string;
  categoryName?: string; // 선택적 필드
  currentMainPhotoUrl?: string;
}

// 언어 패키지는 Editor 컴포넌트의 language prop으로 처리

export default function EditPostPage() {
  useEffect(() => {
    import("@toast-ui/editor/dist/i18n/ko-kr").catch(console.error);
  }, []);
  const params = useParams();
  const router = useRouter();
  const boardId = params?.boardId as string;
  const { loginMember } = useGlobalLoginMember(); // 전역 상태에서 사용자 정보 가져오기
  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    content: "",
    tags: "",
    categoryId: null, // 초기값은 null
  });
  const [board, setBoard] = useState<Board | null>(null);

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
  // 키 관리를 위한 상태 추가
  const [mainPhotoKey, setMainPhotoKey] = useState<string>("");
  const [additionalKeys, setAdditionalKeys] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
      null
  );

  // 에디터에 삽입된 이미지 목록 추적
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Toast UI Editor 참조
  const editorRef = useRef<EditorInstance>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상대 경로를 절대 경로로 변환하는 함수
  const convertKeysToPublicUrls = (content: string) => {
    // S3 기본 URL 정의
    const S3_BASE =
        process.env.NEXT_PUBLIC_S3_BASE_URL ||
        "https://momentrees3bucket.s3.ap-northeast-2.amazonaws.com";

    // 정규 표현식으로 /uploads/xxx-yyy.png 형태의 경로를 찾아서 변환
    return content.replace(
        /!\[([^\]]*)\]\(\/uploads\/([^)]+)\)/g,
        (match, alt, fileName) => {
          return `![${alt}](${S3_BASE}/uploads/${fileName})`;
        }
    );
  };

  // 인증 및 작성자 확인
  // 카테고리 관련 상태값 추가
  const [categories, setCategories] = useState<Category[]>([]); // 카테고리 목록
  const [newCategory, setNewCategory] = useState(""); // 새 카테고리 입력값
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // 모달 상태
  const [currentCategoryName, setCurrentCategoryName] = useState<string | null>(
      ""
  ); // 현재 게시글의 카테고리 이름

  // 인증 및 작성자 확인 - 게시글 데이터 로드
  useEffect(() => {
    const fetchPostData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
            `http://localhost:8090/api/v1/boards/${boardId}`,
            {
              method: "GET",
              credentials: "include",
            }
        );

        if (!response.ok) {
          throw new Error("게시글을 불러오는데 실패했습니다.");
        }

        const data = await response.json();

        console.log("게시글 데이터:", data); // 데이터 확인

        // 게시글 데이터 설정
        setTitle(data.title);
        setContent(data.content);

        // 이미지 키와 URL을 별도로 관리
        if (data.currentMainPhotoKey) {
          // S3 키는 별도 상태로 저장 (백엔드로 다시 전송될 때 사용)
          setMainPhotoKey(data.currentMainPhotoKey);

          // URL은 화면에 표시할 때만 사용
          setRepresentativeImage(data.currentMainPhotoUrl);
        }

        // 업로드된 이미지 목록 설정 (추가 이미지들)
        if (data.additionalPhotoKeys && data.additionalPhotoKeys.length > 0) {
          // S3 키는 별도 상태로 저장 (백엔드로 다시 전송될 때 사용)
          setAdditionalKeys(data.additionalPhotoKeys);

          // URL은 화면에 표시할 때만 사용
          setUploadedImages(data.additionalPhotoUrls);
        }

        // 카테고리 정보 설정 - 서버에서 category 객체로 오는 경우 처리
        if (data.category) {
          console.log("서버에서 받은 카테고리 정보:", data.category);

          // 카테고리가 객체인 경우 (id와 name이 있는 경우)
          if (typeof data.category === "object" && data.category !== null) {
            if (data.category.id) {
              const categoryIdString = data.category.id.toString();
              setSelectedCategoryId(categoryIdString);
              setFormData((prev) => ({
                ...prev,
                categoryId: categoryIdString,
              }));
            }
            if (data.category.name) {
              setCurrentCategoryName(data.category.name);
            }
          }
          // 카테고리가 id만 있는 경우
          else if (typeof data.category === "number") {
            const categoryIdString = data.category.toString();
            setSelectedCategoryId(categoryIdString);
            setFormData((prev) => ({
              ...prev,
              categoryId: categoryIdString,
            }));
            // 카테고리 이름을 가져오기 위한 함수 호출
            fetchCategoryById(data.category);
          }
        }
        // 기존 categoryId 필드가 있는 경우를 위한 처리 유지
        else if (data.categoryId) {
          const categoryIdString = data.categoryId.toString();
          console.log("서버에서 받은 카테고리 ID:", categoryIdString);

          setSelectedCategoryId(categoryIdString);
          setFormData((prev) => ({
            ...prev,
            categoryId: categoryIdString,
          }));

          if (data.categoryName) {
            setCurrentCategoryName(data.categoryName);
          } else {
            fetchCategoryById(data.categoryId);
          }
        }

        // 에디터가 로드된 후 내용만 설정 (이미지는 별도로 추가하지 않음)
        setTimeout(() => {
          if (editorRef.current) {
            try {
              const editor = editorRef.current.getInstance();

              // 내용 설정 방법 변경 - 상대 경로를 절대 경로로 변환
              if (data.content && data.content.trim() !== "") {
                // 상대 경로를 절대 경로로 변환하여 에디터에 설정
                const convertedContent = convertKeysToPublicUrls(
                    data.content.trim()
                );
                editor.setMarkdown(convertedContent);

                // 에디터 포커스
                editor.focus();

                console.log("에디터 내용 설정 완료");
              }
            } catch (error) {
              console.error("에디터 내용 설정 오류:", error);
            }
          }

        }, 1500); // 시간을 조금 더 여유있게


        setIsLoading(false);
      } catch (error) {
        console.error("게시글 불러오기 오류:", error);
        setIsLoading(false);
        alert("게시글을 불러오는데 실패했습니다.");
        router.push("/boards");
      }
    };

    fetchPostData();
  }, [boardId, router]);

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
              photoType: "ADDITIONAL",
              boardId: boardId,
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
      // 로컬 미리보기용 URL 생성
      const reader = new FileReader();
      reader.onload = async (event) => {
        // 화면에 보여줄 URL 설정
        setRepresentativeImage(event.target?.result as string);

        try {
          // S3 업로드를 위한 프리사인드 URL 요청
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
                  filename: file.name,
                  contentType: file.type,
                  photoType: "MAIN",
                  boardId: boardId,
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
              "Content-Type": file.type,
            },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error("대표 이미지 업로드에 실패했습니다.");
          }

          // 업로드 성공 후 키 저장
          console.log("대표 이미지 키:", key);
          setMainPhotoKey(key);
        } catch (error) {
          console.error("대표 이미지 업로드 오류:", error);
          alert("대표 이미지 업로드에 실패했습니다.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 대표 이미지 삭제 핸들러
  const handleRemoveRepresentativeImage = () => {
    setRepresentativeImage(null);
    setMainPhotoKey("");
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
      let markdownContent = "";
      if (editorRef.current) {
        markdownContent = editorRef.current.getInstance().getMarkdown();

        // S3 기본 URL 정의 (환경 변수에서 가져오기)
        const S3_BASE =
            process.env.NEXT_PUBLIC_S3_BASE_URL ||
            "https://momentrees3bucket.s3.ap-northeast-2.amazonaws.com";

        // 콘텐츠에서 절대 경로(publicUrl)를 상대 경로(key)로 치환
        markdownContent = markdownContent.replace(
            new RegExp(`${S3_BASE}/(uploads/[^)\\s]+)`, "g"),
            "/$1" // 또는 key 값만 남기려면 '$1'
        );

        // 불필요한 엔터 제거 - 연속된 3개 이상의 줄바꿈을 2개로 제한
        markdownContent = markdownContent.replace(/\n{3,}/g, "\n\n");
        setContent(markdownContent);
      }

      if (!title.trim() || !markdownContent.trim()) {
        alert("제목과 내용을 모두 입력해주세요.");
        setIsLoading(false);
        return;
      }

      // 카테고리 ID가 문자열이면 숫자로 변환, 아니면 null
      let categoryIdValue = null;
      if (
          selectedCategoryId &&
          selectedCategoryId !== "null" &&
          selectedCategoryId !== ""
      ) {
        categoryIdValue = parseInt(selectedCategoryId);
      }

      console.log("선택된 카테고리 ID:", selectedCategoryId);
      console.log("변환된 카테고리 ID 값:", categoryIdValue);

      // 서버 요청 형식에 맞게 category 객체로 변환
      const category = categoryIdValue ? { id: categoryIdValue } : null;

      const requestData = {
        title,
        content: markdownContent,
        currentMainPhotoUrl: mainPhotoKey, // 백엔드에서는 여전히 url이란 이름을 사용하지만 실제로는 key 값을 전송
        photoUrls: additionalKeys, // 배열 형태로 S3 키값만 전송
        categoryId: categoryIdValue, // 카테고리 기능 구현 시 추가
      };

      console.log("서버로 전송되는 데이터:", requestData); // 디버깅용 로그

      const response = await fetch(
          `http://localhost:8090/api/v1/boards/${boardId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(requestData),
          }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
            `게시글 수정에 실패했습니다. ${errorData?.message || ""}`
        );
      }

      alert("게시글이 성공적으로 수정되었습니다.");
      router.push(`/boards/${boardId}`);
    } catch (error) {
      console.error("게시글 수정 오류:", error);
      alert(
          error instanceof Error
              ? error.message
              : "게시글 수정 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 ID로 카테고리 정보를 가져오는 함수
  const fetchCategoryById = async (categoryId: number | string) => {
    try {
      // 먼저 이미 로드된 카테고리 목록에서 찾기
      if (categories.length > 0) {
        const category = categories.find(
            (c) => c.id.toString() === categoryId.toString()
        );
        if (category) {
          setCurrentCategoryName(category.name);
          console.log("로컬에서 찾은 카테고리:", category.name);
          return;
        }
      }

      // 서버에서 카테고리 정보 가져오기
      const response = await fetch(
          `${
              process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
          }/api/v1/categories/${categoryId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
      );

      if (response.ok) {
        const category = await response.json();
        setCurrentCategoryName(category.name);
        console.log("서버에서 가져온 카테고리:", category.name);
      } else {
        console.error("카테고리 정보 가져오기 실패");
      }
    } catch (error) {
      console.error("카테고리 정보 가져오기 오류:", error);
    }
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

  // 카테고리 정보가 categories가 로드된 후에 제대로 설정되도록 추가적인 useEffect 추가
  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId) {
      const category = categories.find(
          (c) => c.id.toString() === selectedCategoryId
      );
      if (category) {
        setCurrentCategoryName(category.name);
        console.log("카테고리 목록 로드 후 카테고리 이름 설정:", category.name);
      }
    }
  }, [categories, selectedCategoryId]);

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

  // 카테고리 모달 열기
  const openCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  // 카테고리 모달 닫기
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  // 카테고리 선택 함수 수정
  const handleSelectCategory = (category: Category) => {
    if (!category || category.id === undefined) {
      console.error("유효하지 않은 카테고리:", category);
      return;
    }

    // categoryId를 문자열로 변환하여 저장
    const categoryIdString = category.id.toString();

    console.log("선택한 카테고리:", category);
    console.log("카테고리 ID 설정:", categoryIdString);

    // formData와 selectedCategoryId 업데이트
    setFormData((prev) => ({
      ...prev,
      categoryId: categoryIdString,
    }));

    setSelectedCategoryId(categoryIdString); // 선택된 카테고리 ID 설정
    setCurrentCategoryName(category.name); // 현재 카테고리 이름 설정

    closeCategoryModal(); // 모달 닫기
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
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-xl text-gray-600">로딩 중...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col bg-white">
        {/* 메인 콘텐츠 */}
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* 뒤로가기 링크 유지 */}
          <Link
              href={`/boards/${boardId}`}
              className="flex items-center text-gray-600 mt-6 mb-2 hover:text-[#2c714c] transition-colors"
          >
            <BiArrowBack className="mr-1" />
            <span>게시글로 돌아가기</span>
          </Link>

          <div className="flex gap-6 py-4">
            <div className="flex-1">
              <div className="bg-white rounded-lg p-6">
                <h1 className="text-4xl font-bold mb-6">게시글 수정</h1>
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
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
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
                      {representativeImage || image ? (
                          // 이미지가 있는 경우 - 이미지 프리뷰 표시
                          <div className="relative">
                            <div className="bg-gray-100 w-full h-60 flex items-center justify-center">
                              <img
                                  src={representativeImage || image || ""}
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
                        className="block text-lg font-medium text-black mb-2"
                    >
                      내용
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="toast-ui-editor-container">
                        <Editor
                            initialValue={content || " "}
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
                              addImageBlobHook: (
                                  blob: File,
                                  callback: Function
                              ) => {
                                // 비동기 함수를 호출하지만 boolean을 반환
                                handleEditorImageUpload(blob, callback as any);
                                return false;
                              },
                            }}
                            language="ko-KR"
                            placeholder="내용을 입력하세요"
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

            {/* 사이드바 설정 영역 */}
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

                  {/* 카테고리 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      카테고리
                    </label>
                    <div className="flex items-center justify-between">
                      <button
                          type="button"
                          onClick={openCategoryModal}
                          className="px-4 py-1 text-sm rounded-full border border-gray-200 hover:bg-gray-50 text-black"
                      >
                        카테고리 선택
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-black mb-2">
                      현재 카테고리
                    </h3>
                    <p className="text-sm text-gray-700">
                      {currentCategoryName ||
                          board?.categoryName ||
                          "카테고리 없음"}
                    </p>
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
                    >
                      저장
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
                        저장
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

        /* Write/Preview 텍스트 제거 - 이 부분 주석 처리 */
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

        /* 이미지 크기 조절 및 중앙 정렬 */
        .toastui-editor-contents img {
          max-width: 70% !important; /* 이미지 최대 너비를 70%로 제한 */
          height: auto !important;
          margin-left: auto !important;
          margin-right: auto !important;
          display: block !important;
        }

        /* 에디터 내용 전체 스타일링 */
        .toastui-editor-contents {
          font-size: 1.3em !important; /* 글씨 크기 30% 증가 */
        }

        /* 코드블록 등 다른 요소들도 동일하게 중앙 정렬 필요시 추가 */
      `}</style>
      </div>
  );
}