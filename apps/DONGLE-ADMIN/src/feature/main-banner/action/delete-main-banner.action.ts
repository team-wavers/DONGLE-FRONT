"use server";

import { deleteMainBannerService } from "@dongle/service/main-banner/main-banner.service";
import { mainBannerTagGroups } from "@dongle/service";
import { redirect } from "next/navigation";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { revalidateTags } from "@/lib/server/revalidate-tags";

export async function deleteMainBannerAction(id: number, _formData: FormData): Promise<void> {
    await requireServerActionAccessToken();

    const response = await deleteMainBannerService(id);

    if (!response.isSuccess) {
        throw new Error(response.error?.message || "배너 삭제에 실패했습니다.");
    }

    revalidateTags(mainBannerTagGroups.detail(id));
    redirect("/admin/banner");
}
