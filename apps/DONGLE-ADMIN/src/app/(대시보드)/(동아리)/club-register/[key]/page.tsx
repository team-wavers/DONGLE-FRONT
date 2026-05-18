import { Card, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Users, AlertTriangle } from "lucide-react";
import ClubRegisterForm from "@/feature/club/components/club-register-form/club-register-form";

interface ClubRegisterPageProps {
    params: Promise<{ key?: string }>;
}

export default async function ClubRegisterPage({ params }: ClubRegisterPageProps) {
    const { key } = await params;

    //키 검증

    if (!key) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">접근 권한이 없습니다</CardTitle>
                            <CardDescription>
                                유효한 등록 링크가 필요합니다. 총동연 관리자에게 문의해주세요.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto py-8 px-4">
            {/* 페이지 헤더 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Users className="w-6 h-6 text-primary" />
                        동아리 등록
                    </CardTitle>
                    <CardDescription>새로운 동아리를 등록하여 학생들에게 소개해보세요</CardDescription>
                </CardHeader>
            </Card>

            <ClubRegisterForm registrationKey={key} />
        </div>
    );
}
