"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function PasswordRecovery() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Here you would add the API call to find the password
      // For now just showing a success message
      setMessage("비밀번호 찾기 요청이 완료되었습니다. 이메일을 확인해주세요.");
    } catch (error) {
      setMessage("비밀번호 찾기에 실패했습니다. 다시 시도해주세요.");
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
        </div>

        {message ? (
          <div className="bg-blue-50 p-4 rounded-md text-center">
            <p className="text-blue-800">{message}</p>
            <Link 
              href="/members/login" 
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none"
            >
              로그인 페이지로
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
        )}
      </div>
    </div>
  );
}
