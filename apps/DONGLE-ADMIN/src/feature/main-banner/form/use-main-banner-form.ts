"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { MainBanner } from "@dongle/types/main-banner/main-banner";
import { useActionFormSubmit } from "@/shared/form/use-action-form-submit";
import { submitMainBannerCreateAction, submitMainBannerUpdateAction } from "./main-banner-form.action";
import {
    createMainBannerDefaultValues,
    mainBannerSchema,
    type MainBannerFormValues,
} from "./main-banner-form.schema";

interface UseMainBannerFormOptions {
    initialData?: Partial<MainBanner>;
    successMessage: string;
    onLoadingChange?: (state: { loading: boolean; loadingText: string }) => void;
    loadingText: string;
}

export function useMainBannerForm({
    initialData,
    successMessage,
    onLoadingChange,
    loadingText,
}: UseMainBannerFormOptions) {
    const router = useRouter();
    const form = useForm<MainBannerFormValues>({
        resolver: zodResolver(mainBannerSchema),
        defaultValues: createMainBannerDefaultValues(initialData),
        mode: "onSubmit",
    });

    const submit = useActionFormSubmit({
        form,
        invalidMessage: "배너 정보를 다시 확인해주세요.",
        action: (values) =>
            initialData?.id === undefined
                ? submitMainBannerCreateAction(values)
                : submitMainBannerUpdateAction({ bannerId: initialData.id, values }),
        onSubmittingChange: (loading) => {
            onLoadingChange?.({
                loading,
                loadingText,
            });
        },
        onSuccess: ({ result }) => {
            toast.success(result.message ?? successMessage);
            router.push(result.redirectTo ?? "/admin/banner");
        },
    });

    useEffect(() => {
        form.reset(createMainBannerDefaultValues(initialData));
    }, [form, initialData]);

    return {
        form,
        ...submit,
    };
}
