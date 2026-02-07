"use client";

import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import { changeAccountFormAction, ChangeAccountActionState } from "@/feature/user/action/change-account-form.action";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Key } from "lucide-react";
import { toast } from "sonner";

export default function ChangeAccountForm() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(changeAccountFormAction, {} as ChangeAccountActionState);

    useEffect(() => {
        if (state.success) {
            toast.success("계정 정보가 성공적으로 변경되었습니다.");
            router.refresh();
        }
        if (state.error) {
            toast.error(state.error);
        }
    }, [state, router]);

    return (
        <Card className="max-w-2xl w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    계정 정보 관리
                </CardTitle>
                <CardDescription>
                    아이디와 비밀번호를 변경할 수 있습니다. 변경하고 싶은 항목만 입력하세요.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <FormField
                        id="currentPassword"
                        name="currentPassword"
                        label="현재 비밀번호"
                        type="password"
                        placeholder="현재 비밀번호를 입력하세요"
                        required
                        error={state.fieldErrors?.currentPassword}
                    />

                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                            변경할 정보 (변경하고 싶은 항목만 입력)
                        </h3>

                        <div className="space-y-4">
                            <FormField
                                id="newId"
                                name="newId"
                                label="새 아이디"
                                placeholder="새 아이디를 입력하세요 (선택사항)"
                                error={state.fieldErrors?.newId}
                            />

                            <FormField
                                id="newPassword"
                                name="newPassword"
                                label="새 비밀번호"
                                type="password"
                                placeholder="새 비밀번호를 입력하세요 (선택사항)"
                                error={state.fieldErrors?.newPassword}
                            />

                            <FormField
                                id="confirmPassword"
                                name="confirmPassword"
                                label="새 비밀번호 확인"
                                type="password"
                                placeholder="새 비밀번호를 다시 입력하세요"
                                error={state.fieldErrors?.confirmPassword}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full pt-4">
                        <LoadingButton className="flex-1" type="submit" disabled={isPending}>
                            {isPending ? "변경 중..." : "변경하기"}
                        </LoadingButton>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
