"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { User } from "@dongle/types/user/user.d";
import { Button } from "@dongle/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@dongle/ui/dialog";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { FormRoot, RHFTextField } from "@/shared/form";
import {
    createUserEditDefaultValues,
    userEditSchema,
    type UserEditFormValues,
} from "@/feature/user/form/user-form.schema";
import { useUserEditSubmit } from "@/feature/user/form/use-user-form-submit";

interface UserEditFormProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UserEditForm({ user, isOpen, onClose, onSuccess }: UserEditFormProps) {
    const initialValues = useMemo(() => createUserEditDefaultValues(user), [user]);
    const [originalValues, setOriginalValues] = useState<UserEditFormValues>(initialValues);
    const form = useForm<UserEditFormValues>({
        resolver: zodResolver(userEditSchema),
        defaultValues: initialValues,
        mode: "onSubmit",
    });
    const { formError, isSubmitting, onSubmit, onInvalid } = useUserEditSubmit({
        form,
        userId: user.id,
        originalValues,
        onSuccess: (values) => {
            const nextOriginal = {
                ...values,
                password: "",
            };
            setOriginalValues(nextOriginal);
            form.reset(nextOriginal);
            onSuccess();
            onClose();
        },
    });

    useEffect(() => {
        if (isOpen) {
            setOriginalValues(initialValues);
            form.reset(initialValues);
        }
    }, [form, initialValues, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>사용자 정보 수정</DialogTitle>
                </DialogHeader>
                <FormRoot
                    form={form}
                    onSubmit={onSubmit}
                    onInvalid={onInvalid}
                    formError={formError}
                    className="space-y-4">
                    {/* 이름 */}
                    <RHFTextField<UserEditFormValues>
                        id="name"
                        name="name"
                        label="이름"
                        type="text"
                        required
                    />

                    {/* 로그인 ID */}
                    <RHFTextField<UserEditFormValues>
                        id="login_id"
                        name="login_id"
                        label="로그인 ID"
                        type="text"
                        required
                    />

                    {/* 비밀번호 */}
                    <RHFTextField<UserEditFormValues>
                        id="password"
                        name="password"
                        label="비밀번호 (변경시에만 입력)"
                        type="password"
                        placeholder="새 비밀번호를 입력하세요"
                    />

                    {/* 전화번호 */}
                    <RHFTextField<UserEditFormValues>
                        id="phone"
                        name="phone"
                        label="전화번호"
                        type="tel"
                        required
                    />

                    <DialogFooter className="w-full">
                        <Button type="button" variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <LoadingButton type="submit" loading={isSubmitting} loadingText="수정 중...">
                            수정
                        </LoadingButton>
                    </DialogFooter>
                </FormRoot>
            </DialogContent>
        </Dialog>
    );
}
