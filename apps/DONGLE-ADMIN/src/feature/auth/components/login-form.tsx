"use client";

import { useActionState, useEffect, Suspense } from "react";
import { FormField } from "@/shared/ui/form/form-field/form-field";
import { LoadingButton } from "@/shared/ui/feedback/button/loading-button/loading-button";
import { toast } from "sonner";
import { loginFormAction } from "@/feature/auth/action/login-form.action";
import { normalizeInternalReturnTo } from "@/feature/auth/utils/normalize-internal-return-to";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH_ROLE } from "@dongle/types/auth/auth-role";

function LoginFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [state, formAction, isPending] = useActionState(loginFormAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
        clubId: undefined,
        role: undefined,
    });

    // 성공/실패 시 토스트 표시 및 콜백 호출
    useEffect(() => {
        if (state.success) {
            toast.success("로그인 성공");
            const clubId = state.clubId;
            const safeReturnTo = normalizeInternalReturnTo(searchParams.get("returnTo"));
            const url = safeReturnTo || (state.role === AUTH_ROLE.ADMIN ? "/admin" : `/${clubId}/club-form`);
            router.push(url);
        }
        if (state.error) {
            if (state.error) toast.error(state.error);
            else toast.error("로그인에 실패했습니다");
        }
    }, [router, searchParams, state]);

    useEffect(() => {
        const reason = searchParams.get("reason");
        const expired = searchParams.get("expired");

        if (expired) {
            toast.error("로그인 시간이 만료되었습니다. 다시 로그인해주세요.");
        } else if (reason === "no_token") {
            toast.error("로그인이 필요합니다.");
        } else if (reason === "expired") {
            toast.error("로그인 시간이 만료되었습니다. 다시 로그인해주세요.");
        } else if (reason === "invalid_token") {
            toast.error("유효하지 않은 토큰입니다. 다시 로그인해주세요.");
        } else if (reason === "unauthorized") {
            toast.error("접근 권한이 없습니다. 관리자 권한이 필요합니다.");
        }
    }, [searchParams]);

    return (
        <form action={formAction} className="flex flex-col gap-4 w-full">
            <FormField
                type="text"
                name="username"
                placeholder="아이디"
                required
                error={state.fieldErrors?.username}
                id="username"
            />

            <FormField
                type="password"
                name="password"
                placeholder="비밀번호"
                required
                error={state.fieldErrors?.password}
                className="pr-10"
                id="password"
            />

            <LoadingButton type="submit" className="w-full" loading={isPending} loadingText="로그인 중...">
                로그인
            </LoadingButton>
        </form>
    );
}

export default function LoginForm() {
    return (
        <Suspense fallback={<div>로딩 중...</div>}>
            <LoginFormContent />
        </Suspense>
    );
}
