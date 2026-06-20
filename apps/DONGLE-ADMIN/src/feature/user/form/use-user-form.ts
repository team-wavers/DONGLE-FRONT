"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { User } from "@dongle/types/user/user.d";
import { toast } from "sonner";
import { useActionFormSubmit } from "@/shared/form/use-action-form-submit";
import { submitUserCreateAction, submitUserEditAction } from "./user-form.action";
import {
    createUserEditDefaultValues,
    USER_CREATE_DEFAULT_VALUES,
    userCreateSchema,
    userEditSchema,
    type UserCreateFormValues,
    type UserEditFormValues,
} from "./user-form.schema";

export function useUserCreateForm({
    isOpen,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const form = useForm<UserCreateFormValues>({
        resolver: zodResolver(userCreateSchema),
        defaultValues: USER_CREATE_DEFAULT_VALUES,
        mode: "onSubmit",
    });

    const submit = useActionFormSubmit({
        form,
        invalidMessage: "관리자 정보를 다시 확인해주세요.",
        action: submitUserCreateAction,
        onSuccess: ({ result }) => {
            toast.success(result.message ?? "관리자가 성공적으로 생성되었습니다.");
            onSuccess();
            onClose();
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset(USER_CREATE_DEFAULT_VALUES);
        }
    }, [form, isOpen]);

    return {
        form,
        ...submit,
    };
}

export function useUserEditForm({
    user,
    isOpen,
    onClose,
    onSuccess,
}: {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const initialValues = useMemo(() => createUserEditDefaultValues(user), [user]);
    const [originalValues, setOriginalValues] = useState<UserEditFormValues>(initialValues);
    const form = useForm<UserEditFormValues>({
        resolver: zodResolver(userEditSchema),
        defaultValues: initialValues,
        mode: "onSubmit",
    });

    const submit = useActionFormSubmit({
        form,
        invalidMessage: "사용자 정보를 다시 확인해주세요.",
        action: (values) =>
            submitUserEditAction({
                userId: user.id,
                values,
                originalValues,
            }),
        onSuccess: ({ values, result }) => {
            const nextOriginal = {
                ...values,
                password: "",
            };

            toast.success(result.message ?? "사용자 정보가 성공적으로 수정되었습니다.");
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

    return {
        form,
        ...submit,
    };
}
