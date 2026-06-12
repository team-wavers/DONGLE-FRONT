import { expect, test } from "vitest";
import { buildSiteJsonLd } from "./site-json-ld";

test("사이트 JSON-LD는 WebSite와 Organization 스키마를 포함한다", () => {
    const jsonLd = buildSiteJsonLd();

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@graph"]).toHaveLength(2);
    expect(jsonLd["@graph"][0]).toMatchObject({
        "@type": "WebSite",
        url: "https://dongle.wavers.kr",
        name: "동글",
        inLanguage: "ko-KR",
    });
    expect(jsonLd["@graph"][1]).toMatchObject({
        "@type": "Organization",
        name: "동글",
        logo: {
            "@type": "ImageObject",
            url: "https://dongle.wavers.kr/logo/logo-og.png",
        },
    });
});
