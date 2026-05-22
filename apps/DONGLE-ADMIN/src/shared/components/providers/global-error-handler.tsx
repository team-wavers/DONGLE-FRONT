"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function isServerActionMismatchError(error: unknown) {
  if (!(error instanceof Error)) return false;

  return (
    error.name === "UnrecognizedActionError" ||
    error.message.includes("failed-to-find-server-action") ||
    error.message.includes("Server Action") ||
    error.message.includes("was not found on the server")
  );
}

export function GlobalErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    // 전역 에러 이벤트 리스너 설정
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      if (
        error?.name === "SESSION_EXPIRED" ||
        error?.message === "SESSION_EXPIRED"
      ) {
        // 세션 만료 토스트 표시
        toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");

        router.replace("/login");

        // 이벤트 기본 동작 방지
        event.preventDefault();
        return;
      }

      if (isServerActionMismatchError(error)) {
        toast.error("배포가 갱신되어 페이지를 새로고침합니다. 다시 로그인해주세요.");

        event.preventDefault();

        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    };

    // 전역 에러 이벤트 리스너 등록
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // 클린업 함수
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [router]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}
