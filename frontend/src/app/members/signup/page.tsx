'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreements, setAgreements] = useState({
    all: false,
    service: false,
    privacy: false,
    marketing: false,
  });

  const handleEmailVerification = () => {
    // Email verification logic would go here
    alert('이메일 인증 로직이 실행됩니다.');
  };

  const handleSignup = () => {
    // Signup logic would go here
    console.log('회원가입 시도:', { email, password, name, agreements });
  };

  const toggleAllAgreements = (checked: boolean) => {
    setAgreements({
      all: checked,
      service: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    const newAgreements = {
      ...agreements,
      [key]: checked,
    };
    
    // Update "all" checkbox based on other checkboxes
    newAgreements.all = newAgreements.service && newAgreements.privacy && newAgreements.marketing;
    
    setAgreements(newAgreements);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/">
          <div className="flex items-center">
            <Image src="/logo.png" alt="Momentree" width={40} height={40} />
            <span className="ml-2 text-xl font-semibold">Momentree</span>
          </div>
        </Link>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-center mb-8">회원가입</h1>

      {/* Signup Form */}
      <div className="w-full max-w-md bg-white rounded-lg p-6 sm:p-8">
        <form className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block font-medium">
              아이디(이메일) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="예: example@email.com"
                className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="button"
                onClick={handleEmailVerification}
                className="bg-black text-white px-4 py-2 rounded-md whitespace-nowrap text-sm"
              >
                이메일 중복 확인
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block font-medium">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="예: Abcd1234!"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <p className="text-xs text-gray-500">8~20자의 영문, 숫자, 특수문자를 조합하여 입력해주세요</p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block font-medium">
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력해주세요"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block font-medium">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Agreements */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="agreement-all"
                type="checkbox"
                checked={agreements.all}
                onChange={(e) => toggleAllAgreements(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="agreement-all" className="ml-2 block text-sm font-medium">
                전체 동의
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="agreement-service"
                type="checkbox"
                checked={agreements.service}
                onChange={(e) => handleAgreementChange('service', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="agreement-service" className="ml-2 block text-sm">
                서비스 이용약관 동의 <span className="text-red-500">(필수)</span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="agreement-privacy"
                type="checkbox"
                checked={agreements.privacy}
                onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="agreement-privacy" className="ml-2 block text-sm">
                개인정보 수집 및 이용 동의 <span className="text-red-500">(필수)</span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="agreement-marketing"
                type="checkbox"
                checked={agreements.marketing}
                onChange={(e) => handleAgreementChange('marketing', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="agreement-marketing" className="ml-2 block text-sm">
                마케팅 정보 수신 동의 <span className="text-gray-500">(선택)</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSignup}
            className="w-full bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            가입하기
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm text-gray-500">
        © {new Date().getFullYear()} Company. All rights reserved.
      </div>
    </div>
  );
}

