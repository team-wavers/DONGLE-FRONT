import { describe, expect, test } from "vitest";
import { buildMainBannerPayload, createMainBannerDefaultValues, mainBannerSchema } from "./main-banner-form.schema";

function createValues(overrides: Record<string, unknown> = {}) {
    return {
        imageUrls: ["https://cdn.test/banner.png"],
        imageFile: null,
        link_url: "",
        publish_start_at: "2026-05-20 09:30:00",
        publish_end_at: "2026-05-21 09:30:00",
        is_active: true,
        ...overrides,
    };
}

describe("mainBannerSchema", () => {
    test("이미지가 없으면 실패한다", () => {
        const result = mainBannerSchema.safeParse(createValues({ imageUrls: [] }));

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("배너 이미지를 업로드해주세요.");
    });

    test("허용되지 않는 링크를 거부한다", () => {
        const result = mainBannerSchema.safeParse(createValues({ link_url: "javascript:alert(1)" }));

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.path.join(".")).toBe("link_url");
    });

    test("게시 종료일시는 시작일보다 늦어야 한다", () => {
        const result = mainBannerSchema.safeParse(
            createValues({
                publish_start_at: "2026-05-21 09:30:00",
                publish_end_at: "2026-05-20 09:30:00",
            })
        );

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("게시 종료일시는 게시 시작일시보다 늦어야 합니다.");
    });
});

describe("buildMainBannerPayload", () => {
    test("API payload 일시와 링크를 정규화한다", () => {
        expect(
            buildMainBannerPayload(
                {
                    imageUrls: [],
                    imageFile: null,
                    link_url: " /clubs ",
                    publish_start_at: "2026-05-20T09:30",
                    publish_end_at: "2026-05-21 09:30:15",
                    is_active: false,
                },
                "https://cdn.test/banner.png"
            )
        ).toEqual({
            image_url: "https://cdn.test/banner.png",
            link_url: "/clubs",
            publish_start_at: "2026-05-20 09:30:00",
            publish_end_at: "2026-05-21 09:30:15",
            is_active: false,
        });
    });
});

describe("createMainBannerDefaultValues", () => {
    test("수정 폼의 ISO 게시 일시 응답을 Seoul 기준 입력값으로 변환한다", () => {
        const values = createMainBannerDefaultValues({
            image_url: "https://cdn.test/banner.png",
            link_url: "/clubs",
            publish_start_at: "2026-05-20T10:00:00.000Z",
            publish_end_at: "2026-05-21T10:00:00.000Z",
            is_active: false,
        });

        expect(values).toMatchObject({
            imageUrls: ["https://cdn.test/banner.png"],
            link_url: "/clubs",
            publish_start_at: "2026-05-20T19:00",
            publish_end_at: "2026-05-21T19:00",
            is_active: false,
        });
    });
});
