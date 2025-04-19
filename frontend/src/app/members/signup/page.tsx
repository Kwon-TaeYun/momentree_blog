'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8090/api/v1/members/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          blogName: name + '의 블로그', // 또는 사용자가 입력하게 만들 수도 있음
        }),
      });
  
      const message = await response.text();
  
      if (response.ok) {
        alert(message); // 회원가입 성공 메시지
        // 로그인 페이지로 이동
        window.location.href = '/members/login';
      } else {
        alert(`회원가입 실패: ${message}`);
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('서버 오류가 발생했습니다.');
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
              <span className="text-green-700 text-xl font-semibold">Momentree</span>
            </div>
          </Link>
          <h1 className="text-center text-xl font-medium mt-6">회원가입</h1>
        </div>

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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="예: example@email.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                />
                <button
                  type="button"
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
              <p className="text-xs text-gray-500 mt-1">8~20자의 영문, 숫자, 특수문자를 조합하여 입력해주세요</p>
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
                이름 <span className="text-red-500">*</span>
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
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          © 2024 Momentree. All rights reserved.
        </div>
      </div>
    </div>
  );
}

