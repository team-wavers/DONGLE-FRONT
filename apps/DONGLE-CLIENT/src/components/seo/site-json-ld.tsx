import { buildSiteJsonLd } from "@/lib/site-json-ld";

export default function SiteJsonLd() {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSiteJsonLd()) }}
        />
    );
}
