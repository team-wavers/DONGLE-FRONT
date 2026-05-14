"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MainBanner } from "@dongle/types/main-banner/main-banner";
import { Button } from "@dongle/ui/button";
import { Label } from "@dongle/ui/label";
import { RadioGroup, RadioGroupItem } from "@dongle/ui/radio-group";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { FormRoot, RHFDatePicker, RHFFileUpload, RHFTextField } from "@/shared/form";
import {
    createMainBannerDefaultValues,
    mainBannerSchema,
    type MainBannerFormValues,
} from "@/feature/main-banner/form/main-banner-form.schema";
import { useMainBannerSubmit } from "@/feature/main-banner/form/use-main-banner-submit";

interface MainBannerFormProps {
    initialData?: Partial<MainBanner>;
    submitText?: string;
    loadingText?: string;
    successMessage?: string;
    formId?: string;
    showSubmitButton?: boolean;
    onLoadingChange?: (state: { loading: boolean; loadingText: string }) => void;
}

export default function MainBannerForm({
    initialData,
    submitText = "등록",
    loadingText = "처리 중...",
    successMessage = "배너가 저장되었습니다.",
    formId,
    showSubmitButton = true,
    onLoadingChange,
}: MainBannerFormProps) {
    const router = useRouter();
    const form = useForm<MainBannerFormValues>({
        resolver: zodResolver(mainBannerSchema),
        defaultValues: createMainBannerDefaultValues(initialData),
        mode: "onSubmit",
    });
    const {
        formError,
        isSubmitting,
        onSubmit,
        onInvalid,
    } = useMainBannerSubmit({
        form,
        bannerId: initialData?.id,
        successMessage,
        loadingText,
        onLoadingChange,
    });

    useEffect(() => {
        form.reset(createMainBannerDefaultValues(initialData));
    }, [form, initialData]);

    return (
        <FormRoot
            id={formId}
            form={form}
            onSubmit={onSubmit}
            onInvalid={onInvalid}
            formError={formError}
            className="w-full flex flex-col gap-6">
            <div className="flex justify-start">
                <Button type="button" variant="outline" onClick={() => router.back()} size="lg">
                    뒤로가기
                </Button>
            </div>

            {/* 배너 이미지 */}
            <RHFFileUpload<MainBannerFormValues>
                id="main-banner-image"
                name="imageUrls"
                fileName="imageFile"
                label="배너 이미지"
                description="권장 비율은 3:1입니다. 1440x480px 또는 1920x640px 이미지를 권장하며, 핵심 문구와 로고는 중앙에 배치해주세요. jpg, png, webp 파일을 업로드할 수 있습니다. (최대 10MB)"
                fileType="image"
                multiple={false}
                maxFiles={1}
                maxSize={10}
                selectionMode="replace"
            />

            {/* 클릭 이동 링크 */}
            <RHFTextField<MainBannerFormValues>
                id="link_url"
                name="link_url"
                label="클릭 이동 링크"
                placeholder="https://example.com 또는 /clubs"
                description="입력하면 사용자가 배너를 클릭했을 때 해당 링크로 이동합니다."
            />

            <div className="grid grid-cols-2 gap-4">
                {/* 게시 시작일시 */}
                <RHFDatePicker<MainBannerFormValues>
                    id="publish_start_at"
                    name="publish_start_at"
                    label="게시 시작일시"
                    includeTime
                    required
                />

                {/* 게시 종료일시 */}
                <RHFDatePicker<MainBannerFormValues>
                    id="publish_end_at"
                    name="publish_end_at"
                    label="게시 종료일시"
                    includeTime
                    required
                />
            </div>

            <Controller
                control={form.control}
                name="is_active"
                render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-2">
                        <Label className="font-semibold text-zinc-700 text-base">
                            사용여부<span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                            value={field.value ? "true" : "false"}
                            onValueChange={(value) => field.onChange(value === "true")}
                            className="flex items-center gap-8">
                            <Label
                                htmlFor="is_active_true"
                                className="flex items-center gap-3 cursor-pointer text-sm font-medium">
                                <RadioGroupItem id="is_active_true" value="true" className="size-5" />
                                <span>사용</span>
                            </Label>
                            <Label
                                htmlFor="is_active_false"
                                className="flex items-center gap-3 cursor-pointer text-sm font-medium">
                                <RadioGroupItem id="is_active_false" value="false" className="size-5" />
                                <span>미사용</span>
                            </Label>
                        </RadioGroup>
                        {fieldState.error?.message ? (
                            <p className="text-xs text-red-500">{fieldState.error.message}</p>
                        ) : null}
                    </div>
                )}
            />

            {showSubmitButton ? (
                <LoadingButton type="submit" loading={isSubmitting} loadingText={loadingText} className="w-full">
                    {submitText}
                </LoadingButton>
            ) : null}
        </FormRoot>
    );
}
