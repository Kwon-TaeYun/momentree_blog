"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);

  const checkEmail = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"
        }/api/v1/members/email?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.text();

      if (data.includes("찾을 수 없습니다")) {
        setIsEmailChecked(true);
        setIsError(false);
        setMessage("사용 가능한 이메일입니다.");
      } else {
        setIsEmailChecked(false);
        setIsError(true);
        setMessage("이미 사용 중인 이메일입니다.");
      }
    } catch (error) {
      setIsEmailChecked(false);
      setIsError(true);
      setMessage("이메일 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    setMessage("");

    try {
      // 1. 기본 유효성 검사
      if (!isEmailChecked) {
        throw new Error("이메일 중복 확인을 해주세요.");
      }

      if (!email || !password || !name) {
        throw new Error("모든 필수 항목을 입력해주세요.");
      }

      if (password !== confirmPassword) {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }

      // 2. 비밀번호 유효성 검사
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
      if (!passwordRegex.test(password)) {
        throw new Error("비밀번호는 8~20자의 영문, 숫자, 특수문자를 모두 포함해야 합니다.");
      }

      // 3. 이메일 형식 검사
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw new Error("올바른 이메일 형식이 아닙니다.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090"}/api/v1/members/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            name,
            blogName: `${name}의 블로그`
          })
        }
      );

      const data = await response.text();

      if (response.ok) {
        alert("회원가입이 성공적으로 완료되었습니다."); 
        router.push("/members/login");
      } else {
        // HTTP 상태 코드별 처리
        if (response.status === 400) {
          throw new Error(data || "입력하신 정보를 다시 확인해주세요.");
        } else if (response.status === 409) {
          throw new Error(data || "이미 사용 중인 이메일입니다.");
        } else if (response.status === 500) {
          console.error("Server Error:", data);
          throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else {
          throw new Error(data || "회원가입 처리 중 오류가 발생했습니다.");
        }
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "회원가입 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <div className="flex items-center mb-1">
              <Image
                src="/logo/logo.png"
                alt="Momentree"
                width={48}
                height={48}
                className="mr-2"
              />
              <span className="text-green-700 text-xl font-semibold">
                Momentree
              </span>
            </div>
          </Link>
          <h1 className="text-center text-2xl font-semibold mt-6 text-gray-900">
            회원가입
          </h1>
        </div>

        {message && (
          <div
            className={`p-4 mb-4 rounded-md text-center ${
              isError ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-800"
            }`}
          >
            <p>{message}</p>
          </div>
        )}

        {/* Signup Form */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                아이디(이메일) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsEmailChecked(false);
                  }}
                  placeholder="예: example@email.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={checkEmail}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                >
                  중복 확인
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                8~20자의 영문, 숫자, 특수문자를 조합하여 입력해주세요
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력해주세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-md font-medium
                hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
                transition-colors"
            >
              가입하기
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-base text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/members/login"
              className="text-green-700 hover:underline font-medium"
            >
              로그인하기
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          © 2024 Momentree. All rights reserved.
        </div>
      </div>
    </div>
  );
}
