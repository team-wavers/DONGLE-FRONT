import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decodeJwtToken } from "@dongle/api/utils/jwt.util";
import { AUTH_ROLE } from "@dongle/types/auth/auth-role";

export const dynamic = "force-dynamic";

export default async function MainPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
        redirect("/login");
    }

    const payload = await decodeJwtToken(accessToken);
    if (!payload) {
        redirect("/login");
    }

    const { role, club_id: clubId } = payload;

    if (role === AUTH_ROLE.ADMIN) {
        redirect("/admin");
    }

    redirect(`/${clubId}/club-form`);
}
