"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Copy, Check, Users, Key, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@dongle/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Separator } from "@dongle/ui/separator";

interface SuccessData {
    tempId: string;
    tempPassword: string;
    clubName: string;
}

export default function RegisterSuccessPage() {
    const searchParams = useSearchParams();
    const [successData, setSuccessData] = useState<SuccessData | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        const encodedData = searchParams.get("data");
        if (encodedData) {
            try {
                const decodedData = JSON.parse(decodeURIComponent(encodedData));
                setSuccessData(decodedData);
            } catch (error) {
                console.error("데이터 디코딩 실패:", error);
            }
        }
    }, [searchParams]);

    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            toast.success(`${fieldName}가 복사되었습니다!`);

            // 2초 후 복사 상태 초기화
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            console.error("복사에 실패했습니다:", error);
            toast.error("복사에 실패했습니다.");
        }
    };

    if (!successData) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">데이터를 찾을 수 없습니다</CardTitle>
                            <CardDescription>동아리 등록 페이지에서 다시 시도해주세요.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
                {/* 성공 헤더 */}
                <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-3xl text-green-700">축하합니다! 🎉</CardTitle>
                        <CardDescription className="text-lg text-green-600">
                            <strong>{successData.clubName}</strong> 동아리가 성공적으로 등록되었습니다!
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* 임시 로그인 정보 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Key className="w-5 h-5 text-primary" />
                            임시 로그인 정보
                        </CardTitle>
                        <CardDescription>
                            아래 정보로 로그인하여 동아리 정보를 관리할 수 있습니다.
                            <br />
                            <strong className="text-orange-600">
                                보안을 위해 로그인 후 반드시 비밀번호를 변경해주세요!
                            </strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* 아이디 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">아이디</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 p-3 bg-gray-50 border rounded-md font-mono text-sm">
                                    {successData.tempId}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(successData.tempId, "아이디")}
                                    className="min-w-[80px]">
                                    {copiedField === "아이디" ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            복사됨
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-1" />
                                            복사
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* 비밀번호 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">비밀번호</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 p-3 bg-gray-50 border rounded-md font-mono text-sm">
                                    {successData.tempPassword}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(successData.tempPassword, "비밀번호")}
                                    className="min-w-[80px]">
                                    {copiedField === "비밀번호" ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            복사됨
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-1" />
                                            복사
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 다음 단계 안내 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <User className="w-5 h-5 text-blue-600" />
                            다음 단계
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm font-bold text-blue-600">1</span>
                            </div>
                            <div>
                                <p className="font-medium">위의 임시 로그인 정보로 로그인하세요</p>
                                <p className="text-sm text-gray-600">동아리 관리 페이지에서 로그인할 수 있습니다</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm font-bold text-blue-600">2</span>
                            </div>
                            <div>
                                <p className="font-medium">비밀번호를 변경하세요</p>
                                <p className="text-sm text-gray-600">
                                    보안을 위해 반드시 임시 비밀번호를 변경해야 합니다
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm font-bold text-blue-600">3</span>
                            </div>
                            <div>
                                <p className="font-medium">동아리 정보를 관리하세요</p>
                                <p className="text-sm text-gray-600">회원 관리, 활동 보고서 작성 등을 할 수 있습니다</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 홈으로 돌아가기 버튼 */}
                <div className="text-center">
                    <Button variant="outline" size="lg" onClick={() => (window.location.href = "/")} className="px-8">
                        홈으로 돌아가기
                    </Button>
                </div>
            </div>
        </div>
    );
}
