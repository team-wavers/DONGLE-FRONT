"use client";

import { useActionState, useEffect } from "react";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@dongle/ui/dialog";
import { Button } from "@dongle/ui/button";
import { toast } from "sonner";
import { userCreateFormAction, UserCreateActionState } from "@/feature/user/action/user-create-form.action";

interface UserCreateFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UserCreateForm({ isOpen, onClose, onSuccess }: UserCreateFormProps) {
    const [state, formAction, isPending] = useActionState(userCreateFormAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
    } as UserCreateActionState);

    useEffect(() => {
        if (state.success) {
            toast.success("관리자가 성공적으로 생성되었습니다.");
            onSuccess();
            onClose();
        }
        if (state.error) {
            toast.error(state.error);
        }
    }, [state.success, state.error, onSuccess, onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>관리자 생성</DialogTitle>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                    <FormField
                        label="이름"
                        type="text"
                        name="name"
                        id="name"
                        required
                        error={state.fieldErrors?.name}
                        placeholder="이름을 입력하세요"
                    />

                    <FormField
                        label="로그인 ID"
                        type="text"
                        name="login_id"
                        id="login_id"
                        required
                        error={state.fieldErrors?.login_id}
                        placeholder="로그인 ID를 입력하세요"
                    />

                    <FormField
                        label="비밀번호"
                        type="password"
                        name="password"
                        id="password"
                        required
                        placeholder="비밀번호를 입력하세요"
                        error={state.fieldErrors?.password}
                    />

                    <FormField
                        label="전화번호"
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        error={state.fieldErrors?.phone}
                        placeholder="010-1234-5678"
                    />

                    <DialogFooter className="w-full">
                        <Button type="button" variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <LoadingButton type="submit" loading={isPending} loadingText="생성 중...">
                            생성
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
