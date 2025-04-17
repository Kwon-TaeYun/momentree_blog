'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreements, setAgreements] = useState({
    all: false,
    service: false,
    privacy: false,
    marketing: false
  });

  const toggleAgreement = (key: keyof typeof agreements) => {
    if (key === 'all') {
      const newValue = !agreements.all;
      setAgreements({
        all: newValue,
        service: newValue,
        privacy: newValue,
        marketing: newValue
      });
    } else {
      const newAgreements = {
        ...agreements,
        [key]: !agreements[key]
      };
      
      // Update the 'all' checkbox based on other checkboxes
      const allChecked = newAgreements.service && newAgreements.privacy && newAgreements.marketing;
      setAgreements({
        ...newAgreements,
        all: allChecked
      });
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log({ email, password, confirmPassword, name, agreements });
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <div className="flex items-center mb-1">
              <Image 
                src="/logo/momentree-logo.svg" 
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

            {/* Agreements */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreement-all"
                  checked={agreements.all}
                  onChange={() => toggleAgreement('all')}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="agreement-all" className="ml-2 text-sm font-medium">
                  전체 동의
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreement-service"
                  checked={agreements.service}
                  onChange={() => toggleAgreement('service')}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  required
                />
                <label htmlFor="agreement-service" className="ml-2 text-sm">
                  서비스 이용약관 동의 <span className="text-red-500">(필수)</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreement-privacy"
                  checked={agreements.privacy}
                  onChange={() => toggleAgreement('privacy')}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  required
                />
                <label htmlFor="agreement-privacy" className="ml-2 text-sm">
                  개인정보 수집 및 이용 동의 <span className="text-red-500">(필수)</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreement-marketing"
                  checked={agreements.marketing}
                  onChange={() => toggleAgreement('marketing')}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="agreement-marketing" className="ml-2 text-sm">
                  마케팅 정보 수신 동의 <span className="text-gray-500">(선택)</span>
                </label>
              </div>
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
