"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MainBanner } from "@dongle/types/main-banner/main-banner";
import { Label } from "@dongle/ui/label";
import { RadioGroup, RadioGroupItem } from "@dongle/ui/radio-group";
import { LoadingButton } from "@/shared/ui/feedback/button/loading-button/loading-button";
import {
    AdminBackAction,
    AdminFormActions,
    AdminFormSection,
    AdminFormShell,
} from "@/shared/layout/form-page/admin-form-layout";
import { FormRoot } from "@/shared/form/form-root";
import { RHFDatePicker } from "@/shared/form/rhf-date-picker";
import { RHFFileUpload } from "@/shared/form/rhf-file-upload";
import { RHFTextField } from "@/shared/form/rhf-text-field";
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
            className="w-full">
            <AdminFormShell>
                <AdminBackAction onClick={() => router.back()} />

                <AdminFormSection title="이미지 자산" description="홈 화면 상단에 노출되는 메인 배너 이미지를 관리합니다.">
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
                </AdminFormSection>

                <AdminFormSection title="노출 설정" description="배너의 연결 링크, 게시 기간, 사용 여부를 설정합니다.">
                    <RHFTextField<MainBannerFormValues>
                        id="link_url"
                        name="link_url"
                        label="클릭 이동 링크"
                        placeholder="https://example.com 또는 /clubs"
                        description="입력하면 사용자가 배너를 클릭했을 때 해당 링크로 이동합니다."
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <RHFDatePicker<MainBannerFormValues>
                            id="publish_start_at"
                            name="publish_start_at"
                            label="게시 시작일시"
                            includeTime
                            required
                        />

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
                                <Label className="text-base font-semibold text-zinc-700">
                                    사용여부<span className="text-red-500">*</span>
                                </Label>
                                <RadioGroup
                                    value={field.value ? "true" : "false"}
                                    onValueChange={(value) => field.onChange(value === "true")}
                                    className="flex items-center gap-8">
                                    <Label
                                        htmlFor="is_active_true"
                                        className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                                        <RadioGroupItem id="is_active_true" value="true" className="size-5" />
                                        <span>사용</span>
                                    </Label>
                                    <Label
                                        htmlFor="is_active_false"
                                        className="flex cursor-pointer items-center gap-3 text-sm font-medium">
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
                </AdminFormSection>

                {showSubmitButton ? (
                    <AdminFormActions>
                        <LoadingButton type="submit" loading={isSubmitting} loadingText={loadingText} className="min-w-28">
                            {submitText}
                        </LoadingButton>
                    </AdminFormActions>
                ) : null}
            </AdminFormShell>
        </FormRoot>
    );
}
