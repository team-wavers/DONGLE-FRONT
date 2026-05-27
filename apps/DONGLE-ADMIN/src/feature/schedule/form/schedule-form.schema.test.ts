import { describe, expect, it } from "vitest";
import {
    buildClubSchedulePayload,
    clubScheduleSchema,
    createClubScheduleDefaultValues,
    getScheduleExternalUrlError,
} from "./schedule-form.schema";

describe("clubScheduleSchema", () => {
    it("필수 일정 입력값을 검증하고 문자열 값을 trim 정규화한다", () => {
        const result = clubScheduleSchema.safeParse({
            title: " CMUX 일정 ",
            type: "event",
            startsAt: "2026-06-16T20:00",
            endsAt: "2026-06-16T22:00",
            isPublic: true,
            location: " 학생회관 ",
            description: " 공개 일정 ",
            externalUrl: "",
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.data).toMatchObject({
            title: "CMUX 일정",
            location: "학생회관",
            description: "공개 일정",
            externalUrl: "",
        });
    });

    it("공지 유형은 일정 유형으로 허용하지 않는다", () => {
        const result = clubScheduleSchema.safeParse({
            title: "공지 일정",
            type: "notice",
            startsAt: "2026-06-16T20:00",
            endsAt: "2026-06-16T22:00",
            isPublic: true,
            location: "",
            description: "",
            externalUrl: "",
        });

        expect(result.success).toBe(false);
    });

    it("종료일시가 시작일시보다 빠르면 종료일시 field error를 반환한다", () => {
        const result = clubScheduleSchema.safeParse({
            title: "CMUX 일정",
            type: "event",
            startsAt: "2026-06-16T22:00",
            endsAt: "2026-06-16T20:00",
            isPublic: true,
            location: "",
            description: "",
            externalUrl: "",
        });

        expect(result.success).toBe(false);
        if (result.success) return;

        expect(result.error.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: ["endsAt"],
                    message: "종료일시는 시작일시보다 늦어야 합니다.",
                }),
            ])
        );
    });

    it("date-only 또는 존재하지 않는 날짜시간은 일정 일시로 허용하지 않는다", () => {
        const result = clubScheduleSchema.safeParse({
            title: "CMUX 일정",
            type: "event",
            startsAt: "2026-06-16",
            endsAt: "2026-02-31T10:00",
            isPublic: true,
            location: "",
            description: "",
            externalUrl: "",
        });

        expect(result.success).toBe(false);
        if (result.success) return;

        expect(result.error.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: ["startsAt"],
                    message: "시작일시 형식이 올바르지 않습니다.",
                }),
                expect.objectContaining({
                    path: ["endsAt"],
                    message: "종료일시 형식이 올바르지 않습니다.",
                }),
            ])
        );
    });

    it("외부 링크는 입력값이 있을 때 http 또는 https URL만 허용한다", () => {
        expect(getScheduleExternalUrlError("")).toBeNull();
        expect(getScheduleExternalUrlError(" dongle.kr/schedule ")).toBeNull();
        expect(getScheduleExternalUrlError("https://dongle.kr/schedule")).toBeNull();
        expect(getScheduleExternalUrlError("/schedule")).toBe("외부 링크는 http 또는 https URL로 입력해주세요.");
        expect(getScheduleExternalUrlError("javascript:alert(1)")).toBe("외부 링크는 http 또는 https URL로 입력해주세요.");
    });

    it("폼 값을 일정 API payload로 변환한다", () => {
        expect(
            buildClubSchedulePayload({
                title: " CMUX 일정 ",
                type: "event",
                startsAt: "2026-06-16T20:00",
                endsAt: "2026-06-16T22:00",
                isPublic: false,
                location: "  ",
                description: null,
                externalUrl: " dongle.kr/schedule ",
            })
        ).toEqual({
            title: "CMUX 일정",
            type: "event",
            start_at: "2026-06-16 20:00:00",
            end_at: "2026-06-16 22:00:00",
            is_public: false,
            location: "",
            description: "",
            external_url: "https://dongle.kr/schedule",
        });
    });

    it("수정 대상 일정으로 기본값을 만든다", () => {
        expect(
            createClubScheduleDefaultValues({
                id: 7,
                clubId: 1,
                clubName: "CMUX",
                category: "학술분과",
                title: "기존 일정",
                type: "regular_meeting",
                startsAt: "2026-06-16T20:00:00.000Z",
                endsAt: "2026-06-16T22:00:00.000Z",
                isPublic: false,
                location: "학생회관",
                description: "설명",
                externalUrl: "https://dongle.kr/schedule",
            })
        ).toEqual({
            title: "기존 일정",
            type: "regular_meeting",
            startsAt: "2026-06-17T05:00",
            endsAt: "2026-06-17T07:00",
            isPublic: false,
            location: "학생회관",
            description: "설명",
            externalUrl: "https://dongle.kr/schedule",
        });
    });
});
