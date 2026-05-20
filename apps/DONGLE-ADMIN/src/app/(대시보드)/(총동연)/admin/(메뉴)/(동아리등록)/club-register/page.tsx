import UrlGenerator from "@/components/molecules/layout/url-generator/url-generator";
import { AlertCircle } from "lucide-react";
import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";

export default function ClubRegisterPage() {
    return (
        <div className="flex flex-col gap-6 w-full h-full">
            <AdminPageHeader title="동아리 등록" description="새로운 동아리 등록 URL을 생성할 수 있습니다." />
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0">
                    <p className="font-semibold">등록 URL은 10분 동안만 유효합니다.</p>
                    <p className="mt-1 text-amber-700">
                        만료되기 전에 등록을 완료하도록 안내하고, 문제가 생기면 새 URL을 다시 발급하세요.
                    </p>
                </div>
            </div>
            <div className="flex w-full">
                <UrlGenerator />
            </div>
        </div>
    );
}
