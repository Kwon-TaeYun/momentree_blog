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
    if (!email || !email.trim()) {
      setIsError(true);
      setMessage("이메일을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/check-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.available) {
        setIsEmailChecked(true);
        setIsError(false);
        setMessage(data.message || "사용 가능한 이메일입니다.");
      } else {
        setIsEmailChecked(false);
        setIsError(true);
        setMessage(data.message || "이미 사용 중인 이메일입니다.");
      }
    } catch (error) {
      setIsEmailChecked(false);
      setIsError(true);
      setMessage("이메일 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailChecked) {
      setIsError(true);
      setMessage("이메일 중복 확인을 해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 유효성 검사
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    if (!passwordRegex.test(password)) {
      setIsError(true);
      setMessage(
        "비밀번호는 8~20자의 영문, 숫자, 특수문자를 모두 포함해야 합니다."
      );
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            name,
            blogName: `${name}의 블로그`,
          }),
        }
      );

      if (response.ok) {
        setIsError(false);
        setMessage("회원가입이 완료되었습니다.");
        router.push("/members/login");
      } else {
        const data = await response.text();
        setIsError(true);
        setMessage(data || "회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      setIsError(true);
      setMessage("서버와의 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
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
          <h1 className="text-center text-xl font-medium mt-6">회원가입</h1>
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
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                아이디(이메일) <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsEmailChecked(false);
                  }}
                  placeholder="예: example@email.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                />
                <button
                  type="button"
                  onClick={checkEmail}
                  className="ml-2 bg-black text-white px-4 py-2 rounded-md text-sm"
                >
                  이메일 중복 확인
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="예: Abcd1234!"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                8~20자의 영문, 숫자, 특수문자를 조합하여 입력해주세요
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                이름(별명) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-900 transition-colors"
            >
              가입하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
