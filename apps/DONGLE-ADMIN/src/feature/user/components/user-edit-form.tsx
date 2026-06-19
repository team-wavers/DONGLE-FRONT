"use client";

import type { User } from "@dongle/types/user/user.d";
import { Button } from "@dongle/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@dongle/ui/dialog";
import { LoadingButton } from "@/shared/ui/feedback/button/loading-button/loading-button";
import { AdminFormActions } from "@/shared/layout/form-page/admin-form-layout";
import { FormRoot } from "@/shared/form/form-root";
import { RHFTextField } from "@/shared/form/rhf-text-field";
import type { UserEditFormValues } from "@/feature/user/form/user-form.schema";
import { useUserEditForm } from "@/feature/user/form/use-user-form";

interface UserEditFormProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UserEditForm({ user, isOpen, onClose, onSuccess }: UserEditFormProps) {
    const { form, formError, isSubmitting, onSubmit, onInvalid } = useUserEditForm({
        user,
        isOpen,
        onClose,
        onSuccess,
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="border-b px-6 py-5">
                    <DialogTitle>사용자 정보 수정</DialogTitle>
                </DialogHeader>
                <FormRoot
                    form={form}
                    onSubmit={onSubmit}
                    onInvalid={onInvalid}
                    formError={formError}
                    className="flex flex-col">
                    <div className="flex flex-col gap-4 px-6 py-5">
                        <RHFTextField<UserEditFormValues>
                            id="name"
                            name="name"
                            label="이름"
                            type="text"
                            required
                        />

                        <RHFTextField<UserEditFormValues>
                            id="login_id"
                            name="login_id"
                            label="로그인 ID"
                            type="text"
                            required
                        />

                        <RHFTextField<UserEditFormValues>
                            id="password"
                            name="password"
                            label="비밀번호 (변경시에만 입력)"
                            type="password"
                            placeholder="새 비밀번호를 입력하세요"
                        />

                        <RHFTextField<UserEditFormValues>
                            id="phone"
                            name="phone"
                            label="전화번호"
                            type="tel"
                            required
                        />
                    </div>

                    <AdminFormActions className="px-6 py-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <LoadingButton type="submit" loading={isSubmitting} loadingText="수정 중...">
                            수정
                        </LoadingButton>
                    </AdminFormActions>
                </FormRoot>
            </DialogContent>
        </Dialog>
    );
}
