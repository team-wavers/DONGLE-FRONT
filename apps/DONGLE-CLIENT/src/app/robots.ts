import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: "https://dongle.wavers.kr/sitemap.xml",
        host: "https://dongle.wavers.kr",
    };
}
