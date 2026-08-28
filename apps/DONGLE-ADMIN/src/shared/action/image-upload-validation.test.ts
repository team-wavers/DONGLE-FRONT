import { afterEach, describe, expect, it, vi } from "vitest";
import { isAllowedStoredImageUrl, MAX_IMAGE_UPLOAD_BYTES, validateImageUpload } from "./image-upload-validation";

function fileWithBytes(bytes: number[], name: string, type: string) {
    return new File([new Uint8Array(bytes)], name, { type });
}

function oversizedJpeg() {
    const file = fileWithBytes([0xff, 0xd8, 0xff], "photo.jpg", "image/jpeg");
    Object.defineProperty(file, "size", { value: MAX_IMAGE_UPLOAD_BYTES + 1 });
    return file;
}

describe("validateImageUpload", () => {
    it("rejects html and svg uploads", async () => {
        await expect(validateImageUpload(new File(["<html>"], "page.html", { type: "text/html" }))).resolves.toBe(
            "JPEG, PNG, GIF, WebP 이미지만 업로드할 수 있습니다."
        );
        await expect(
            validateImageUpload(new File(["<svg></svg>"], "icon.svg", { type: "image/svg+xml" }))
        ).resolves.toBe("JPEG, PNG, GIF, WebP 이미지만 업로드할 수 있습니다.");
    });

    it("rejects files over the size limit", async () => {
        await expect(validateImageUpload(oversizedJpeg())).resolves.toBe("이미지는 10MB 이하만 업로드할 수 있습니다.");
    });

    it("rejects jpeg-typed files without image signatures", async () => {
        await expect(validateImageUpload(fileWithBytes([0x00, 0x01, 0x02, 0x03], "photo.jpg", "image/jpeg"))).resolves.toBe(
            "이미지 파일 내용을 확인할 수 없습니다."
        );
    });

    it("accepts jpeg files with a valid signature", async () => {
        await expect(validateImageUpload(fileWithBytes([0xff, 0xd8, 0xff, 0xe0], "photo.jpg", "image/jpeg"))).resolves.toBeNull();
    });
});

describe("isAllowedStoredImageUrl", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("allows https hosts from configured storage and internal paths", () => {
        vi.stubEnv("NEXT_PUBLIC_S3_URL", "https://cdn.example.com/bucket");
        expect(isAllowedStoredImageUrl("https://cdn.example.com/banner.png")).toBe(true);
        expect(isAllowedStoredImageUrl("/uploads/banner.png")).toBe(true);
    });

    it("rejects javascript URLs and unknown hosts", () => {
        vi.stubEnv("NEXT_PUBLIC_S3_URL", "https://cdn.example.com/bucket");
        expect(isAllowedStoredImageUrl("javascript:alert(1)")).toBe(false);
        expect(isAllowedStoredImageUrl("https://evil.example/banner.png")).toBe(false);
        expect(isAllowedStoredImageUrl("//cdn.example.com/banner.png")).toBe(false);
    });
});
