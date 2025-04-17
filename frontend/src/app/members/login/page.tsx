"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";
const socialLoginForKakaoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao`
const redirectUrlAfterSocialLogin = process.env.NEXT_PUBLIC_FRONT_BASE_URL
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login attempt with:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <LoginContainer>
      <LoginBox>
        <LogoWrapper>
          <Image
            src="/logo.png"
            alt="Momentree"
            width={60} // 크기 축소
            height={60} // 크기 축소
            quality={100}
            priority
          />
        </LogoWrapper>

        <Title>로그인</Title>

        <LoginForm onSubmit={handleSubmit}>
          <InputWrapper>
            <InputLabel>아이디(이메일)</InputLabel>
            <InputField
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </InputWrapper>

          <InputWrapper>
            <InputLabel>비밀번호</InputLabel>
            <InputField
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </InputWrapper>

          <CheckboxWrapper>
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="rememberMe">아이디 저장</label>
          </CheckboxWrapper>

          <LoginButton type="submit">로그인</LoginButton>
        </LoginForm>

        <LinkContainer>
          <Link href="/find-id">아이디 찾기</Link>
          <Separator>|</Separator>
          <Link href="/find-password">비밀번호 찾기</Link>
          <Separator>|</Separator>
          <Link href="/signup">회원가입</Link>
        </LinkContainer>

        <SocialLoginSection>
  <SocialText>소셜 계정으로 로그인</SocialText>
  <Link
    href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                                        >
    <KakaoButton>
      <Image
        src="/kakao_login.png"
        alt="카카오 로그인"
        width={300}
        height={45}
        quality={100}
        priority
      />
    </KakaoButton>
  </Link>
</SocialLoginSection>

        <Footer>
          <FooterText>개인정보처리방침</FooterText>
          <Separator>|</Separator>
          <FooterText>이용약관</FooterText>
          <ContactInfo>고객센터: 1234-5678 (평일 09:00-18:00)</ContactInfo>
        </Footer>
      </LoginBox>
    </LoginContainer>
  );
}

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: white; // 배경색을 흰색으로 변경
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  // box-shadow와 background, border-radius 속성 제거
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 24px;
  margin-bottom: 30px;
  color: #000; // 글자색을 검정색으로 변경
  font-weight: 700; // 볼드 추가
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  color: #000;
  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  color: #000; // 글자색을 검정색으로 변경

  label {
    color: #000; // label 글자색을 검정색으로 변경
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #333;
  }
`;

const LinkContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
  a {
    color: #666;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Separator = styled.span`
  color: #ddd;
`;

const SocialLoginSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px; // 간격 줄임
  margin-top: 30px;
`;

const SocialText = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 5px;
  font-size: 14px; // Footer와 동일한 크기로 변경
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const KakaoButton = styled(SocialButton)`
  padding: 0;
  background: none;
  border: none;
  width: fit-content;
  margin: 0 auto;

  &:hover {
    opacity: 0.8;
  }
`;

const Footer = styled.footer`
  margin-top: 30px;
  text-align: center;
  font-size: 14px;
  color: #666;
`;

const FooterText = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const ContactInfo = styled.p`
  margin-top: 10px;
  color: #999;
  font-size: 12px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputLabel = styled.label`
  font-size: 14px;
  color: #000;
  font-weight: 500;
`;
