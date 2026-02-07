import UrlGenerator from "@/components/molecules/layout/url-generator/url-generator";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@dongle/ui/card";
import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";

export default function ClubRegisterPage() {
    return (
        <div className="flex flex-col gap-6 w-full h-full">
            <AdminPageHeader title="동아리 등록" description="새로운 동아리 등록 URL을 생성할 수 있습니다." />
            {/* 주의사항 */}
            <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
                        <AlertCircle className="w-5 h-5" />
                        주의사항
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="text-sm text-amber-700 space-y-2">
                        <li>• URL 만료 시간은 10분 입니다.</li>
                        <li>• URL이 만료되기 전에 동아리 등록이 완료되도록 안내하세요</li>
                        <li>• 등록 과정에서 문제가 발생하면 새로운 URL을 생성하여 제공해 주세요.</li>
                        <li>• 등록된 동아리 정보는 동아리 관리 페이지에서 확인 및 수정할 수 있습니다</li>
                    </ul>
                </CardContent>
            </Card>
            {/* URL 생성기 */}
            <div className="flex justify-center w-full">
                <UrlGenerator />
            </div>
        </div>
    );
}
