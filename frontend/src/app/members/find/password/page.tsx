"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function FindPassword() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);

    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/members/search?name=${encodeURIComponent(
          name
        )}&email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.text();

      if (response.ok) {
        if (data.includes("찾을 수 없습니다")) {
          setIsError(true);
          setMessage("입력하신 정보와 일치하는 사용자가 없습니다.");
        } else {
          setIsError(false);
          setMessage("비밀번호 재설정 링크를 이메일로 전송했습니다.");
        }
      } else {
        setIsError(true);
        setMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch (error) {
      setIsError(true);
      setMessage("서버와의 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Image
            src="/logo/logo.png"
            alt="Momentree Logo"
            width={180}
            height={40}
            priority
          />
          <h2 className="mt-6 text-center text-2xl font-bold">비밀번호 찾기</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            회원정보에 등록한 이메일로 비밀번호 재설정 링크를 받으실 수
            있습니다.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-md text-center ${
              isError ? "bg-red-50" : "bg-blue-50"
            }`}
          >
            <p className={isError ? "text-red-800" : "text-blue-800"}>
              {message}
            </p>
            {!isError && (
              <Link
                href="/members/login"
                className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none"
              >
                로그인 페이지로
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                placeholder="이름을 입력해주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                placeholder="이메일을 입력해주세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/members/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              로그인 페이지로 돌아가기
            </Link>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              취소
            </button>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none"
            >
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
