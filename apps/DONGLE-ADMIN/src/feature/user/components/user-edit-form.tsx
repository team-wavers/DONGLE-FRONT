"use client";

import { useActionState, useEffect } from "react";
import { User } from "@dongle/types/user/user.d";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import { FormSelect } from "@/components/atoms/form/form-select/form-select";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@dongle/ui/dialog";
import { Button } from "@dongle/ui/button";
import { toast } from "sonner";
import { userEditFormAction, UserEditActionState } from "@/feature/user/action/user-edit-form.action";

interface UserEditFormProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UserEditForm({ user, isOpen, onClose, onSuccess }: UserEditFormProps) {
    const [state, formAction, isPending] = useActionState(userEditFormAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
    } as UserEditActionState);

    // 성공/실패 시 토스트 표시 및 다이얼로그 닫기
    useEffect(() => {
        if (state.success) {
            toast.success("사용자 정보가 성공적으로 수정되었습니다.");
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
                    <DialogTitle>사용자 정보 수정</DialogTitle>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="originalName" value={user.name} />
                    <input type="hidden" name="originalLoginId" value={user.login_id} />
                    <input type="hidden" name="originalRole" value={user.role} />
                    <input type="hidden" name="originalPhone" value={user.phone} />

                    <FormField
                        label="이름"
                        type="text"
                        name="name"
                        id="name"
                        required
                        error={state.fieldErrors?.name}
                        defaultValue={user.name}
                    />

                    <FormField
                        label="로그인 ID"
                        type="text"
                        name="login_id"
                        id="login_id"
                        required
                        error={state.fieldErrors?.login_id}
                        defaultValue={user.login_id}
                    />

                    <FormField
                        label="비밀번호 (변경시에만 입력)"
                        type="password"
                        name="password"
                        id="password"
                        placeholder="새 비밀번호를 입력하세요"
                        error={state.fieldErrors?.password}
                    />

                    <FormSelect
                        label="역할"
                        name="role"
                        id="role"
                        required
                        error={state.fieldErrors?.role}
                        defaultValue={user.role}
                        placeholder="역할을 선택하세요"
                        options={[
                            { value: "admin", label: "관리자" },
                            { value: "president", label: "회장" },
                        ]}
                    />

                    <FormField
                        label="전화번호"
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        error={state.fieldErrors?.phone}
                        defaultValue={user.phone}
                    />

                    <DialogFooter className="w-full">
                        <Button type="button" variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <LoadingButton type="submit" loading={isPending} loadingText="수정 중...">
                            수정
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
