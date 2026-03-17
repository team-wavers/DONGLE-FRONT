import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";

export default function ClubFormLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col w-full h-full">
            <AdminPageHeader title="동아리 정보 관리" description="동아리 정보를 수정할 수 있습니다." />
            {children}
        </div>
    );
}
