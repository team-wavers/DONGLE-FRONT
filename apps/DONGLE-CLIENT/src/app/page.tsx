import { getClubListService } from "@dongle/service";
import ClubMainClient from "@/components/main/club-main-client";

export default async function HomePage() {
    const clubListResponse = await getClubListService();
    const clubs = clubListResponse.isSuccess && clubListResponse.result ? clubListResponse.result : [];

    return <ClubMainClient clubs={clubs} />;
}
