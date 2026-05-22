"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@dongle/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@dongle/ui/dialog";
import { LoadingButton } from "@/shared/ui/feedback/button/loading-button/loading-button";
import { AdminFormActions } from "@/shared/layout/form-page/admin-form-layout";
import { FormRoot } from "@/shared/form/form-root";
import { RHFTextField } from "@/shared/form/rhf-text-field";
import {
    USER_CREATE_DEFAULT_VALUES,
    userCreateSchema,
    type UserCreateFormValues,
} from "@/feature/user/form/user-form.schema";
import { useUserCreateSubmit } from "@/feature/user/form/use-user-form-submit";

interface UserCreateFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UserCreateForm({ isOpen, onClose, onSuccess }: UserCreateFormProps) {
    const form = useForm<UserCreateFormValues>({
        resolver: zodResolver(userCreateSchema),
        defaultValues: USER_CREATE_DEFAULT_VALUES,
        mode: "onSubmit",
    });
    const { formError, isSubmitting, onSubmit, onInvalid } = useUserCreateSubmit({
        form,
        onSuccess: () => {
            onSuccess();
            onClose();
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset(USER_CREATE_DEFAULT_VALUES);
        }
    }, [form, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="border-b px-6 py-5">
                    <DialogTitle>관리자 생성</DialogTitle>
                </DialogHeader>
                <FormRoot
                    form={form}
                    onSubmit={onSubmit}
                    onInvalid={onInvalid}
                    formError={formError}
                    className="flex flex-col">
                    <div className="flex flex-col gap-4 px-6 py-5">
                        <RHFTextField<UserCreateFormValues>
                            id="name"
                            name="name"
                            label="이름"
                            type="text"
                            placeholder="이름을 입력하세요"
                            required
                        />

                        <RHFTextField<UserCreateFormValues>
                            id="login_id"
                            name="login_id"
                            label="로그인 ID"
                            type="text"
                            placeholder="로그인 ID를 입력하세요"
                            required
                        />

                        <RHFTextField<UserCreateFormValues>
                            id="password"
                            name="password"
                            label="비밀번호"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />

                        <RHFTextField<UserCreateFormValues>
                            id="phone"
                            name="phone"
                            label="전화번호"
                            type="tel"
                            placeholder="010-1234-5678"
                            required
                        />
                    </div>

                    <AdminFormActions className="px-6 py-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <LoadingButton type="submit" loading={isSubmitting} loadingText="생성 중...">
                            생성
                        </LoadingButton>
                    </AdminFormActions>
                </FormRoot>
            </DialogContent>
        </Dialog>
    );
}
