"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// 전역 에러 핸들러
export function setupGlobalErrorHandler() {
  if (typeof window === "undefined") return;

  // 전역 에러 이벤트 리스너
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;

    if (
      error?.name === "SESSION_EXPIRED" ||
      error?.message === "SESSION_EXPIRED"
    ) {
      // 세션 만료 토스트 표시
      toast.error("세션이 만료되었습니다. 다시 로그인해주세요.", {
        duration: 3000,
      });

      // 로그인 페이지로 리다이렉트
      setTimeout(() => {
        window.location.replace("/login");
      }, 1000);

      // 이벤트 기본 동작 방지
      event.preventDefault();
    }
  });
}

// React 컴포넌트에서 사용할 수 있는 훅
export function useErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);

  const handleSessionExpired = () => {
    toast.error("세션이 만료되었습니다. 다시 로그인해주세요.", {
      duration: 3000,
    });

    setTimeout(() => {
      router.replace("/login");
    }, 1000);
  };

  return { handleSessionExpired };
}
