import AdminSidber from "@/components/molecules/layout/sidber/AdminSidber/AdminSideber";
import SidebarCloseOnNavigate from "@/components/molecules/layout/sidber/sidebar-close-on-navigate";
import { SidebarInset } from "@dongle/ui/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AdminSidber />
            <SidebarInset className="flex flex-col justify-start items-center min-h-screen h-full gap-6">
                <SidebarCloseOnNavigate />
                <div className="flex justify-center items-start max-w-7xl w-full h-full px-6 py-6 md:px-8 md:py-10">
                    {children}
                </div>
            </SidebarInset>
        </>
    );
}
