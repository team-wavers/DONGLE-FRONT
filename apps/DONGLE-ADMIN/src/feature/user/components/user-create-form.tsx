"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@dongle/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@dongle/ui/dialog";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { FormRoot, RHFTextField } from "@/shared/form";
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>관리자 생성</DialogTitle>
                </DialogHeader>
                <FormRoot
                    form={form}
                    onSubmit={onSubmit}
                    onInvalid={onInvalid}
                    formError={formError}
                    className="space-y-4">
                    {/* 이름 */}
                    <RHFTextField<UserCreateFormValues>
                        id="name"
                        name="name"
                        label="이름"
                        type="text"
                        placeholder="이름을 입력하세요"
                        required
                    />

                    {/* 로그인 ID */}
                    <RHFTextField<UserCreateFormValues>
                        id="login_id"
                        name="login_id"
                        label="로그인 ID"
                        type="text"
                        placeholder="로그인 ID를 입력하세요"
                        required
                    />

                    {/* 비밀번호 */}
                    <RHFTextField<UserCreateFormValues>
                        id="password"
                        name="password"
                        label="비밀번호"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        required
                    />

                    {/* 전화번호 */}
                    <RHFTextField<UserCreateFormValues>
                        id="phone"
                        name="phone"
                        label="전화번호"
                        type="tel"
                        placeholder="010-1234-5678"
                        required
                    />

                    <DialogFooter className="w-full">
                        <Button type="button" variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <LoadingButton type="submit" loading={isSubmitting} loadingText="생성 중...">
                            생성
                        </LoadingButton>
                    </DialogFooter>
                </FormRoot>
            </DialogContent>
        </Dialog>
    );
}
