import { cookies } from "next/headers";
import { CheckCircle, Key, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Separator } from "@dongle/ui/separator";

interface SuccessData {
    tempId: string;
    tempPassword: string;
    clubName: string;
    warningMessage?: string;
}

function parseFlash(value?: string): SuccessData | null {
    if (!value) return null;
    try {
        const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<SuccessData>;
        return parsed.tempId && parsed.tempPassword && parsed.clubName ? (parsed as SuccessData) : null;
    } catch {
        return null;
    }
}

export default async function RegisterSuccessPage() {
    const successData = parseFlash((await cookies()).get("clubRegisterSuccess")?.value);

    if (!successData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="mx-auto max-w-md">
                    <CardHeader className="text-center">
                        <Users className="mx-auto h-8 w-8 text-destructive" />
                        <CardTitle>데이터를 찾을 수 없습니다</CardTitle>
                        <CardDescription>동아리 등록 페이지에서 다시 시도해주세요.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                        <CardTitle className="text-3xl text-green-700">동아리 등록 완료</CardTitle>
                        <CardDescription className="text-lg text-green-600">
                            <strong>{successData.clubName}</strong> 동아리가 등록되었습니다.
                        </CardDescription>
                    </CardHeader>
                </Card>
                {successData.warningMessage ? (
                    <Card className="border-amber-200 bg-amber-50/70">
                        <CardHeader>
                            <CardTitle className="text-lg text-amber-900">추가 확인이 필요합니다</CardTitle>
                            <CardDescription className="text-amber-800">{successData.warningMessage}</CardDescription>
                        </CardHeader>
                    </Card>
                ) : null}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" />임시 로그인 정보</CardTitle>
                        <CardDescription>이 페이지를 벗어나기 전에 안전한 곳에 보관하고, 로그인 후 반드시 비밀번호를 변경해주세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div><p className="text-sm font-medium">아이디</p><p className="rounded-md border bg-gray-50 p-3 font-mono">{successData.tempId}</p></div>
                        <Separator />
                        <div><p className="text-sm font-medium">비밀번호</p><p className="rounded-md border bg-gray-50 p-3 font-mono">{successData.tempPassword}</p></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
