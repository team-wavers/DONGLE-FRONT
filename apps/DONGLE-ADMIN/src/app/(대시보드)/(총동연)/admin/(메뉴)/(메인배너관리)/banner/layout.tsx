import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";

export default function BannerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col w-full h-full">
            <AdminPageHeader title="배너 관리" description="메인 배너를 관리할 수 있습니다." />
            {children}
        </div>
    );
}
