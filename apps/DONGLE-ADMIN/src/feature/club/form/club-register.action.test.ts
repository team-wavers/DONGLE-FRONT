import { afterEach, describe, expect, test, vi } from "vitest";
import { createClubService, updateClubService, uploadClubIconService } from "@dongle/service/club/club.service";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { submitClubRegisterAction } from "./club-register.action";
import type { ClubRegisterFormValues } from "./club-register.schema";

vi.mock("@dongle/service/club/club.service", () => ({
    createClubService: vi.fn(),
    updateClubService: vi.fn(),
    uploadClubIconService: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

vi.mock("next/headers", () => ({
    cookies: vi.fn(async () => ({
        set: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
    })),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

function createValues(overrides: Partial<ClubRegisterFormValues> = {}): ClubRegisterFormValues {
    return {
        clubName: "동글",
        category: "학술분과",
        recruitmentStatus: RECRUITMENT_STATUS.CLOSED,
        location: "학생회관 301호",
        description: "<p>동아리 소개</p>",
        main_activities: "<p>주요 활동</p>",
        presidentName: "홍길동",
        presidentContact: "010-1234-5678",
        loginId: "hong1234",
        password: "password1",
        passwordConfirm: "password1",
        recruitmentStartDate: "",
        recruitmentEndDate: "",
        instagram: "",
        youtube: "",
        tags: "",
        ...overrides,
    };
}

describe("submitClubRegisterAction", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("사용자가 입력한 아이디와 비밀번호로 회장 계정을 만들고 성공 경로만 반환한다", async () => {
        vi.mocked(createClubService).mockResolvedValue({
            isSuccess: true,
            result: { id: 11 },
        } as Awaited<ReturnType<typeof createClubService>>);

        const result = await submitClubRegisterAction("registration-key", createValues());

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.redirectTo).toBe("/club-register/register-success");
            expect(result.redirectTo).not.toContain("data=");
            expect(result.redirectTo).not.toContain("tempPassword");
        }
        expect(createClubService).toHaveBeenCalledTimes(1);
        expect(createClubService).toHaveBeenCalledWith(
            expect.objectContaining({
                key: "registration-key",
                newPresident: expect.objectContaining({
                    name: "홍길동",
                    login_id: "hong1234",
                    password: "password1",
                    phone: "010-1234-5678",
                }),
            })
        );
        const sentPayload = vi.mocked(createClubService).mock.calls[0]?.[0];
        expect(JSON.stringify(sentPayload)).not.toMatch(/dongle\d{6}/);
        expect(updateClubService).not.toHaveBeenCalled();
        expect(uploadClubIconService).not.toHaveBeenCalled();
        expect(cookies).not.toHaveBeenCalled();
        expect(result).not.toMatchObject({ sessionExpired: true });
    });

    test("빈 SNS 값은 payload에서 제외하고 성공 시 목록 캐시 태그를 항상 무효화한다", async () => {
        vi.mocked(createClubService).mockResolvedValue({
            isSuccess: true,
            result: { id: 11 },
        } as Awaited<ReturnType<typeof createClubService>>);

        const result = await submitClubRegisterAction("registration-key", createValues());

        expect(result.ok).toBe(true);
        expect(vi.mocked(createClubService).mock.calls[0]?.[0].sns).toEqual({});
        expect(revalidateTag).toHaveBeenCalledWith("user");
        expect(revalidateTag).toHaveBeenCalledWith("club");
        expect(revalidateTag).not.toHaveBeenCalledWith("club-11");
        expect(updateClubService).not.toHaveBeenCalled();
        expect(uploadClubIconService).not.toHaveBeenCalled();
    });

    test.each([
        ["LOGIN_ID_DUPLICATED", "login id already exists", "loginId"],
        ["PHONE_DUPLICATED", "phone already exists", "presidentContact"],
    ])("409 %s 코드를 %s 필드 에러로 매핑한다", async (code, message, field) => {
        vi.mocked(createClubService).mockResolvedValue({
            isSuccess: false,
            error: { status: 409, code, message },
        } as Awaited<ReturnType<typeof createClubService>>);

        const result = await submitClubRegisterAction("registration-key", createValues());

        expect(result).toMatchObject({ ok: false, fieldErrors: { [field]: message } });
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.formError).toBeUndefined();
    });

    test("메시지 문구가 달라도 중복 아이디 코드를 기준으로 필드 에러에 매핑한다", async () => {
        vi.mocked(createClubService).mockResolvedValue({
            isSuccess: false,
            error: { status: 409, code: "LOGIN_ID_DUPLICATED", message: "login id already exists" },
        } as Awaited<ReturnType<typeof createClubService>>);

        const result = await submitClubRegisterAction("registration-key", createValues());

        expect(result).toMatchObject({
            ok: false,
            fieldErrors: { loginId: "login id already exists" },
        });
    });

    test("중복 오류 메시지가 비어 있으면 필드별 기본 문구를 사용한다", async () => {
        vi.mocked(createClubService).mockResolvedValue({
            isSuccess: false,
            error: { status: 409, code: "PHONE_DUPLICATED", message: "" },
        } as Awaited<ReturnType<typeof createClubService>>);

        const result = await submitClubRegisterAction("registration-key", createValues());

        expect(result).toMatchObject({
            ok: false,
            fieldErrors: { presidentContact: "이미 사용 중인 전화번호입니다." },
        });
    });

    test.each([
        undefined,
        "UNKNOWN_DUPLICATE",
    ])("code가 없거나 알 수 없는 409는 formError로 처리한다 (code=%s)", async (code) => {
        vi.mocked(createClubService).mockResolvedValue({
            isSuccess: false,
            error: { status: 409, ...(code && { code }), message: "중복 응답" },
        } as Awaited<ReturnType<typeof createClubService>>);

        const result = await submitClubRegisterAction("registration-key", createValues());

        expect(result).toEqual({ ok: false, formError: "중복 응답" });
    });

    test("예외 메시지를 사용자 formError로 노출하지 않는다", async () => {
        vi.mocked(createClubService).mockRejectedValue(new Error("internal server detail"));

        const result = await submitClubRegisterAction("registration-key", createValues());

        expect(result).toEqual({
            ok: false,
            formError: "동아리 등록에 실패했습니다. 다시 시도해주세요.",
        });
    });

    test("동아리 생성이 실패하면(키 무효 등) 회장 계정도 만들어지지 않고 실패 응답만 반환한다", async () => {
        vi.mocked(createClubService).mockResolvedValue({
            isSuccess: false,
            error: { message: "club create failed" },
        } as Awaited<ReturnType<typeof createClubService>>);

        const result = await submitClubRegisterAction("registration-key", createValues());

        expect(result).toEqual({
            ok: false,
            formError: "club create failed",
        });
        // User+Club 생성이 백엔드에서 하나의 트랜잭션으로 처리되므로,
        // 실패 시 회장 계정을 별도로 정리(삭제)할 필요 자체가 없다.
        expect(createClubService).toHaveBeenCalledTimes(1);
        expect(revalidateTag).not.toHaveBeenCalled();
    });
});
