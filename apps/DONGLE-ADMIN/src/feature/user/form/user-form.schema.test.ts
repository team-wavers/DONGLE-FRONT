import { describe, expect, test } from "vitest";
import { buildUserEditPayload, userCreateSchema, userEditSchema } from "./user-form.schema";

describe("userCreateSchema", () => {
    test("관리자 생성 필수 입력값을 검증한다", () => {
        const result = userCreateSchema.safeParse({
            name: "",
            login_id: " ",
            password: "",
            phone: "",
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(
            expect.arrayContaining(["name", "login_id", "password", "phone"])
        );
    });

    test("입력값을 trim한다", () => {
        const result = userCreateSchema.safeParse({
            name: " 운영자 ",
            login_id: " admin ",
            password: " password ",
            phone: " 010-1234-5678 ",
        });

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
            name: "운영자",
            login_id: "admin",
            password: " password ",
            phone: "010-1234-5678",
        });
    });
});

describe("userEditSchema", () => {
    test("사용자 수정에서 비밀번호는 빈 값을 허용한다", () => {
        const result = userEditSchema.safeParse({
            name: "운영자",
            login_id: "admin",
            password: "",
            phone: "010-1234-5678",
        });

        expect(result.success).toBe(true);
    });
});

describe("buildUserEditPayload", () => {
    test("변경된 필드와 입력된 비밀번호만 payload에 포함한다", () => {
        expect(
            buildUserEditPayload(
                {
                    name: "운영자",
                    login_id: "admin2",
                    password: "new-password",
                    phone: "010-9999-9999",
                },
                {
                    name: "운영자",
                    login_id: "admin",
                    password: "",
                    phone: "010-9999-9999",
                }
            )
        ).toEqual({
            login_id: "admin2",
            password: "new-password",
        });
    });
});
