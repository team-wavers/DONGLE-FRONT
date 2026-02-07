import AdminSidber from "@/components/molecules/layout/sidber/AdminSidber/AdminSideber";
import SidebarCloseOnNavigate from "@/components/molecules/layout/sidber/sidebar-close-on-navigate";
import { SidebarInset } from "@dongle/ui/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AdminSidber />
            <SidebarInset className="flex flex-col justify-center items-center min-h-screen h-full gap-8">
                <SidebarCloseOnNavigate />
                <div className="flex justify-center items-center max-w-5xl w-full h-full md:py-24 py-8 px-8">
                    {children}
                </div>
            </SidebarInset>
        </>
    );
}
