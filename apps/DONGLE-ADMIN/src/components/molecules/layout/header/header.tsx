import Logo from "@/components/atoms/logo/logo";
import { AppHeader } from "@dongle/ui/headers/app-header";
import HeaderSidebarTrigger from "./header-sidebar-trigger";

export default async function Header() {
    return (
        <AppHeader center={<Logo type="icon" size="sm" />} left={<HeaderSidebarTrigger />} />
    );
}
