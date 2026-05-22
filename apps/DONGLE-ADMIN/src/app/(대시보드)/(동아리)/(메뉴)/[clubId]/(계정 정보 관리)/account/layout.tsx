import AdminPageHeader from "@/shared/components/molecules/layout/admin-page-header/admin-page-header";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col w-full h-full">
            <AdminPageHeader title="계정 정보 관리" description="로그인 계정 정보를 변경할 수 있습니다." />
            {children}
        </div>
    );
}
