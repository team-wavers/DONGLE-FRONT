"use server";

import { deleteMainBannerService } from "@dongle/service/main-banner/main-banner.service";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";

export async function deleteMainBannerAction(id: number, _formData: FormData): Promise<void> {
    await requireServerActionAccessToken();

    const response = await deleteMainBannerService(id);

    if (!response.isSuccess) {
        throw new Error(response.error?.message || "배너 삭제에 실패했습니다.");
    }

    revalidateTag("main-banner");
    revalidateTag(`main-banner-${id}`);
    redirect("/admin/banner");
}
