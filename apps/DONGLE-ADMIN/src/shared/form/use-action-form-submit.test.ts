import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { actionFailure, actionSuccess } from "@/shared/action";
import { createActionFormInvalidHandler, runActionFormSubmit } from "./use-action-form-submit";

vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
    },
}));

type TestFormValues = {
    name: string;
    phone: string;
};

function createForm() {
    return {
        setError: vi.fn(),
    } as unknown as UseFormReturn<TestFormValues>;
}

describe("runActionFormSubmit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("action 성공 시 onSuccess에 제출값과 result를 전달한다", async () => {
        const values = { name: "홍길동", phone: "01012345678" };
        const result = actionSuccess({ message: "저장되었습니다." });
        const onSuccess = vi.fn();

        await runActionFormSubmit({
            form: createForm(),
            values,
            action: vi.fn().mockResolvedValue(result),
            onSuccess,
        });

        expect(onSuccess).toHaveBeenCalledWith({ values, result });
    });

    it("action 실패 시 field error와 form error를 반영한다", async () => {
        const form = createForm();
        const onFailure = vi.fn();

        await runActionFormSubmit({
            form,
            values: { name: "", phone: "01012345678" },
            action: vi.fn().mockResolvedValue(
                actionFailure<keyof TestFormValues & string>({
                    fieldErrors: {
                        name: "이름을 입력해주세요.",
                    },
                    formError: "입력값을 다시 확인해주세요.",
                })
            ),
            onSuccess: vi.fn(),
            onFailure,
        });

        expect(form.setError).toHaveBeenCalledWith("name", {
            type: "server",
            message: "이름을 입력해주세요.",
        });
        expect(onFailure).toHaveBeenCalledWith({
            result: {
                ok: false,
                fieldErrors: {
                    name: "이름을 입력해주세요.",
                },
                formError: "입력값을 다시 확인해주세요.",
            },
        });
        expect(toast.error).toHaveBeenCalledWith("입력값을 다시 확인해주세요.");
    });

    it("sessionExpired 실패는 toast 대신 onSessionExpired에 위임할 수 있다", async () => {
        const onSessionExpired = vi.fn();

        await runActionFormSubmit({
            form: createForm(),
            values: { name: "홍길동", phone: "01012345678" },
            action: vi.fn().mockResolvedValue(
                actionFailure({
                    formError: "로그인 시간이 만료되었습니다.",
                    sessionExpired: true,
                })
            ),
            onSuccess: vi.fn(),
            onSessionExpired,
        });

        expect(onSessionExpired).toHaveBeenCalledWith({
            result: {
                ok: false,
                formError: "로그인 시간이 만료되었습니다.",
                sessionExpired: true,
            },
        });
        expect(toast.error).not.toHaveBeenCalled();
    });

    it("sessionExpired handler가 없으면 기존 실패처럼 form error를 toast로 표시한다", async () => {
        await runActionFormSubmit({
            form: createForm(),
            values: { name: "홍길동", phone: "01012345678" },
            action: vi.fn().mockResolvedValue(
                actionFailure({
                    formError: "로그인 시간이 만료되었습니다.",
                    sessionExpired: true,
                })
            ),
            onSuccess: vi.fn(),
        });

        expect(toast.error).toHaveBeenCalledWith("로그인 시간이 만료되었습니다.");
    });

    it("onInvalid는 invalidMessage를 toast로 표시한다", () => {
        const onInvalid = createActionFormInvalidHandler<TestFormValues>("사용자 정보를 다시 확인해주세요.");

        onInvalid({});

        expect(toast.error).toHaveBeenCalledWith("사용자 정보를 다시 확인해주세요.");
    });
});
