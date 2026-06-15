import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE_PATH, SITE_TITLE } from "@/lib/site";

type PageMetadataInput = {
    title: string;
    description: string;
    canonicalPath: string;
    openGraphTitle?: string;
    openGraphType?: "website" | "article";
    image?: string;
    imageAlt?: string;
};

function resolveOpenGraphTitle(title: string, openGraphTitle?: string) {
    if (openGraphTitle) {
        return openGraphTitle;
    }

    return title.includes(SITE_TITLE) ? title : `${title} | ${SITE_TITLE}`;
}

export function buildPageMetadata({
    title,
    description,
    canonicalPath,
    openGraphTitle,
    openGraphType = "website",
    image = DEFAULT_OG_IMAGE_PATH,
    imageAlt = "동글 로고",
}: PageMetadataInput): Metadata {
    const resolvedOpenGraphTitle = resolveOpenGraphTitle(title, openGraphTitle);

    return {
        title,
        description,
        alternates: {
            canonical: canonicalPath,
        },
        openGraph: {
            title: resolvedOpenGraphTitle,
            description,
            url: canonicalPath,
            siteName: SITE_TITLE,
            locale: "ko_KR",
            type: openGraphType,
            images: [
                {
                    url: image,
                    alt: imageAlt,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: resolvedOpenGraphTitle,
            description,
            images: [image],
        },
    };
}
