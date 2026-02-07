import Logo from "@/components/atoms/logo/logo";
import HeaderSidebarTrigger from "./header-sidebar-trigger";

export default async function Header() {
    return (
        <div className="sticky top-0 z-10 w-full border-b border-zinc-200">
            <div className="relative flex items-center w-full h-16 bg-white">
                <HeaderSidebarTrigger />
                {/* 가운데 로고 */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Logo type="icon" size="sm" />
                </div>
            </div>
        </div>
    );
}
