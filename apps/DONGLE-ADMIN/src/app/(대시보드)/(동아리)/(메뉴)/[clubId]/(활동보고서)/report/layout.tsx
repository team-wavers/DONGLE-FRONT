import AdminPageHeader from "@/shared/components/molecules/layout/admin-page-header/admin-page-header";

export default function ReportLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col w-full h-full">
            <AdminPageHeader title="활동보고서 관리" description="동아리 활동보고서를 작성하고 관리할 수 있습니다." />
            {children}
        </div>
    );
}
