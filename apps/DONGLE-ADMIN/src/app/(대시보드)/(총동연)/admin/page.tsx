import Logo from "@/components/atoms/logo/logo";
import Link from "next/link";
import { Button } from "@dongle/ui/button";

export default function AdminPage() {
    return (
        <div className="flex flex-col items-center justify-center w-full gap-8 py-8">
            <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
                <Logo type="full" />

                <div className="flex flex-col gap-6 w-full">
                    <h2 className="text-2xl font-bold text-center">관리자 메뉴</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <Link href="/admin/club">
                            <Button
                                variant="outline"
                                className="w-full h-24 flex flex-col gap-2 items-center justify-center hover:bg-zinc-50 transition-colors">
                                <span className="text-lg font-semibold">동아리 정보 관리</span>
                                <span className="text-sm text-muted-foreground text-center">
                                    동아리 정보 조회 및 수정
                                </span>
                            </Button>
                        </Link>

                        <Link href="/admin/club-register">
                            <Button
                                variant="outline"
                                className="w-full h-24 flex flex-col gap-2 items-center justify-center hover:bg-zinc-50 transition-colors">
                                <span className="text-lg font-semibold">동아리 등록</span>
                                <span className="text-sm text-muted-foreground text-center">새로운 동아리 등록</span>
                            </Button>
                        </Link>

                        <Link href="/admin/report">
                            <Button
                                variant="outline"
                                className="w-full h-24 flex flex-col gap-2 items-center justify-center hover:bg-zinc-50 transition-colors">
                                <span className="text-lg font-semibold">활동보고서 관리</span>
                                <span className="text-sm text-muted-foreground text-center">
                                    모든 동아리 활동보고서 조회
                                </span>
                            </Button>
                        </Link>

                        <Link href="/admin/user">
                            <Button
                                variant="outline"
                                className="w-full h-24 flex flex-col gap-2 items-center justify-center hover:bg-zinc-50 transition-colors">
                                <span className="text-lg font-semibold">사용자 관리</span>
                                <span className="text-sm text-muted-foreground text-center">
                                    모든 사용자 조회 및 관리
                                </span>
                            </Button>
                        </Link>

                        <Link href="/admin/banner">
                            <Button
                                variant="outline"
                                className="w-full h-24 flex flex-col gap-2 items-center justify-center hover:bg-zinc-50 transition-colors">
                                <span className="text-lg font-semibold">배너 관리</span>
                                <span className="text-sm text-muted-foreground text-center">메인 배너 등록 및 관리</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
