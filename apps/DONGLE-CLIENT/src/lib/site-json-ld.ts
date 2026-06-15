import { DEFAULT_OG_IMAGE_PATH, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";

export function buildSiteJsonLd() {
    const organizationId = `${SITE_URL}/#organization`;
    const websiteId = `${SITE_URL}/#website`;

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": websiteId,
                url: SITE_URL,
                name: SITE_TITLE,
                description: SITE_DESCRIPTION,
                inLanguage: "ko-KR",
                publisher: {
                    "@id": organizationId,
                },
            },
            {
                "@type": "Organization",
                "@id": organizationId,
                name: SITE_TITLE,
                url: SITE_URL,
                logo: {
                    "@type": "ImageObject",
                    url: new URL(DEFAULT_OG_IMAGE_PATH, SITE_URL).toString(),
                },
            },
        ],
    };
}
