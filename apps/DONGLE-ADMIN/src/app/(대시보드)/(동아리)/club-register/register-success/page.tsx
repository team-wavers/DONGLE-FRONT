import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";

export default function RegisterSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="mx-auto max-w-md">
                <CardHeader className="items-center text-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                    <CardTitle className="text-3xl text-green-700">동아리 등록 완료</CardTitle>
                    <CardDescription>
                        아이디/비밀번호는 방금 입력하신 값입니다. 문제가 있으면 총동연에 문의해주세요
                    </CardDescription>
                    <Link
                        href="/login"
                        className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                        로그인
                    </Link>
                </CardHeader>
            </Card>
        </div>
    );
}
