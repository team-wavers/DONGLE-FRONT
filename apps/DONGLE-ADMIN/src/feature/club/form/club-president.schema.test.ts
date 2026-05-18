import { describe, expect, test } from "vitest";
import { clubPresidentSchema, createClubPresidentDefaultValues } from "./club-president.schema";

describe("clubPresidentSchema", () => {
    test("회장 이름과 연락처를 필수로 검증한다", () => {
        const result = clubPresidentSchema.safeParse({
            presidentName: " ",
            presidentContact: "",
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(
            expect.arrayContaining(["presidentName", "presidentContact"])
        );
    });

    test("휴대폰 번호 형식이 아니면 거부한다", () => {
        const result = clubPresidentSchema.safeParse({
            presidentName: "홍길동",
            presidentContact: "02-123-4567",
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)");
    });

    test("입력값을 trim한다", () => {
        const result = clubPresidentSchema.safeParse({
            presidentName: " 홍길동 ",
            presidentContact: " 010-1234-5678 ",
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
            presidentName: "홍길동",
            presidentContact: "010-1234-5678",
        });
    });
});

describe("createClubPresidentDefaultValues", () => {
    test("기본값을 RHF values 형태로 만든다", () => {
        expect(createClubPresidentDefaultValues({ presidentName: "홍길동" })).toEqual({
            presidentName: "홍길동",
            presidentContact: "",
        });
    });
});
