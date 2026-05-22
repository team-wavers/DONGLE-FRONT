import Header from "@/shared/components/molecules/layout/header/header";
import { SidebarProvider } from "@dongle/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider className="flex-col">
            <Header />
            <div className="flex w-full flex-1">{children}</div>
        </SidebarProvider>
    );
}
