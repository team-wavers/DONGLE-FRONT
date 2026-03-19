import type { MetadataRoute } from "next";
import { getClubListService } from "@/lib/server/cached-services";

const siteUrl = "https://dongle.wavers.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
    ];

    try {
        const clubListResponse = await getClubListService();

        if (!clubListResponse.isSuccess || !clubListResponse.result) {
            return staticRoutes;
        }

        const clubRoutes = clubListResponse.result.map((club) => ({
            url: `${siteUrl}/clubs/${club.id}`,
            lastModified: club.updated_at ? new Date(club.updated_at) : new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));

        return [...staticRoutes, ...clubRoutes];
    } catch (error) {
        console.error("[sitemap] failed to fetch club list:", error);
        return staticRoutes;
    }
}
