"use client";
import { LoginMemberContext, useLoginMember } from "@/stores/auth/loginMember";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { BiSearch } from "react-icons/bi"; // BiSearch 아이콘도 필요함
import React from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
export function ClientLayout({ children }: { children: React.ReactNode }) {
  const {
    loginMember,
    setLoginMember,
    setNoLoginMember,
    isLoginMemberPending,
    isLogin,
    logout,
    logoutAndHome,
  } = useLoginMember();

  // 전역관리를 위한 Store 등록 - context api 사용
  const loginMemberContextValue = {
    loginMember,
    setLoginMember,
    isLoginMemberPending,
    isLogin,
    logout,
    logoutAndHome,
  };
  useEffect(() => {
    fetch("http://localhost:8090/api/v1/members/me", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setLoginMember(data);
      })
      .catch((error) => {
        setNoLoginMember();
      });
  }, []);

  return (
    <LoginMemberContext.Provider value={loginMemberContextValue}>
      <main>
        <Header />
        {children}
        <Footer />
      </main>
    </LoginMemberContext.Provider>
  );
}
