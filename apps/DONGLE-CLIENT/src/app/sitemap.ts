import type { MetadataRoute } from "next";
import { getClubListService } from "@/lib/server/cached-services";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${SITE_URL}/schedules`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    const clubListResponse = await getClubListService();

    if (!clubListResponse.isSuccess || !clubListResponse.result) {
        return staticRoutes;
    }

    const clubRoutes = clubListResponse.result.map((club) => ({
        url: `${SITE_URL}/clubs/${club.id}`,
        lastModified: club.updated_at ? new Date(club.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [...staticRoutes, ...clubRoutes];
}
