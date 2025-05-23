"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
const socialLoginForKakaoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao`;
const redirectUrlAfterSocialLogin = `${process.env.NEXT_PUBLIC_FRONT_BASE_URL}/home`;
export default function LoginPage() {
  console.log(
    process.env.NEXT_PUBLIC_API_BASE_URL +
      ":::" +
      process.env.NEXT_PUBLIC_FRONT_BASE_URL
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const router = useRouter(); // useRouter 훅 초기화

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      // 응답 데이터를 먼저 파싱
      const data = await response.json();

      if (!response.ok) {
        // 서버에서 보낸 에러 메시지 사용
        const errorMessage = data.message || "로그인에 실패했습니다.";
        console.error("로그인 실패:", response.status, data);
        alert(errorMessage);
        return;
      }

      const accessToken = data.accessToken;

      if (accessToken) {
        console.log("로그인 성공! Access token 수신 및 localStorage에 저장.");
        localStorage.setItem("accessToken", accessToken);
        alert("로그인 성공!");
        window.location.href = "/home";
      } else {
        console.warn(
          "로그인 성공 응답을 받았지만, Access Token 필드를 찾을 수 없습니다.",
          data
        );
        alert(
          "로그인은 성공했으나, 인증 정보를 받지 못했습니다. 다시 로그인해주세요."
        );
      }
    } catch (error) {
      console.error("로그인 요청 중 오류 발생:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(
        `로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n오류: ${errorMessage}`
      );
    }
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
          <Link href="/members/find/password">비밀번호 찾기</Link>
          <Separator>|</Separator>
          <Link href="/members/signup">회원가입</Link>
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
