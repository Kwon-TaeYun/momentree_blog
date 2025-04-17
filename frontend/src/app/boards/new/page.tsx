"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement post creation logic
    console.log("Form submitted:", formData);
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
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex gap-6 py-8">
            <div className="flex-1">
              <div className="bg-white rounded-lg p-6">
                <h1 className="text-xl font-normal text-black mb-6">새 글 작성</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-black mb-2">
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

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-black mb-2">
                      내용
                    </label>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <textarea
                        id="content"
                        name="content"
                        placeholder="내용을 입력하세요"
                        value={formData.content}
                        onChange={handleChange}
                        className="block w-full min-h-[300px] border-0 text-base text-black placeholder-gray-600 focus:ring-0 focus:outline-none resize-none"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 text-black"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        사진
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 text-black"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        파일
                      </button>
                    </div>
                  </div>

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
                </form>
              </div>
            </div>

            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-medium mb-6 text-black">글 설정</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-black">공개 설정</h3>
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
                    <h3 className="text-sm font-medium text-black mb-2">태그 추가</h3>
                    <input
                      type="text"
                      placeholder="#태그 입력 (쉼표로 구분)"
                      className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black placeholder-gray-900"
                    />
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
                    >
                      작성
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 