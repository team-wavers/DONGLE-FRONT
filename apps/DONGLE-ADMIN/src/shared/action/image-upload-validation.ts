export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]);

function hasImageSignature(bytes: Uint8Array): boolean {
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    const isGif = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38;
    const isWebp =
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    return isJpeg || isPng || isGif || isWebp;
}

export async function validateImageUpload(file: File): Promise<string | null> {
    if (!IMAGE_MIME_TYPES.has(file.type)) return "JPEG, PNG, GIF, WebP 이미지만 업로드할 수 있습니다.";
    if (file.size <= 0 || file.size > MAX_IMAGE_UPLOAD_BYTES) return "이미지는 10MB 이하만 업로드할 수 있습니다.";
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    return hasImageSignature(bytes) ? null : "이미지 파일 내용을 확인할 수 없습니다.";
}

export function isAllowedStoredImageUrl(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) return true;

    try {
        const url = new URL(trimmed);
        if (url.protocol !== "https:") return false;
        const configured = [process.env.NEXT_PUBLIC_S3_URL, process.env.API_URL]
            .filter((candidate): candidate is string => Boolean(candidate))
            .map((candidate) => new URL(candidate).hostname);
        return configured.includes(url.hostname);
    } catch {
        return false;
    }
}
