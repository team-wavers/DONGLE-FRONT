"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormDatePicker } from "@/components/atoms/form/form-datepicker/form-datepicker";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import { FileUpload } from "@/components/atoms/form/file-upload/file-upload";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { MainBannerActionState, createMainBannerAction } from "@/feature/main-banner/action/main-banner-form.action";
import { MainBanner } from "@dongle/types/main-banner/main-banner";
import { Label } from "@dongle/ui/label";
import { RadioGroup, RadioGroupItem } from "@dongle/ui/radio-group";
import { Button } from "@dongle/ui/button";

interface MainBannerFormProps {
    customAction?: (prevState: MainBannerActionState, formData: FormData) => Promise<MainBannerActionState>;
    initialData?: Partial<MainBanner>;
    submitText?: string;
    loadingText?: string;
    successMessage?: string;
    formId?: string;
    showSubmitButton?: boolean;
}

interface UploadMainBannerImageApiResponse {
    isSuccess?: boolean;
    result?: {
        image_url?: string;
    };
    error?: {
        message?: string;
        detail?: string;
    };
}

function toDateValue(value?: string | null): Date | undefined {
    if (!value) return undefined;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;

    return date;
}

export default function MainBannerForm({
    customAction,
    initialData,
    submitText = "등록",
    loadingText = "처리 중...",
    successMessage = "배너가 저장되었습니다.",
    formId,
    showSubmitButton = true,
}: MainBannerFormProps) {
    const router = useRouter();
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | undefined>(undefined);
    const [state, formAction, isPending] = useActionState(customAction || createMainBannerAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
    });

    useEffect(() => {
        if (state.success) {
            toast.success(successMessage);
            router.push("/admin/banner");
        }

        if (state.error) {
            toast.error(state.error);
        }
    }, [state.success, state.error, successMessage, router]);

    const handleImageFileChange = async (files: File[]) => {
        const nextFile = files[0];

        if (!nextFile) {
            setUploadedImageUrl("");
            setUploadError(undefined);
            return;
        }

        setIsImageUploading(true);
        setUploadError(undefined);

        try {
            const formData = new FormData();
            formData.append("file", nextFile);

            const response = await fetch("/api/main-banners/images", {
                method: "POST",
                body: formData,
            });
            const data = (await response.json()) as UploadMainBannerImageApiResponse;

            if (!response.ok || !data.isSuccess || !data.result?.image_url) {
                setUploadedImageUrl("");
                setUploadError(data.error?.message || "배너 이미지 업로드에 실패했습니다.");
                return;
            }

            setUploadedImageUrl(data.result.image_url);
        } catch {
            setUploadedImageUrl("");
            setUploadError("배너 이미지 업로드에 실패했습니다.");
        } finally {
            setIsImageUploading(false);
        }
    };

    return (
        <form id={formId} action={formAction} className="w-full flex flex-col gap-6">
            <div className="flex justify-start">
                <Button type="button" variant="outline" onClick={() => router.back()} size="lg">
                    뒤로가기
                </Button>
            </div>

            {initialData?.id ? <input type="hidden" name="banner_id" value={initialData.id} /> : null}
            <input type="hidden" name="image_uploaded_url" value={uploadedImageUrl} />
            <FileUpload
                id="main-banner-image"
                name="image"
                label="배너 이미지"
                description="권장 비율은 3:1입니다. 1440x480px 또는 1920x640px 이미지를 권장하며, 핵심 문구와 로고는 중앙에 배치해주세요. jpg, png, webp 파일을 업로드할 수 있습니다. (최대 10MB)"
                fileType="image"
                multiple={false}
                maxFiles={1}
                maxSize={10}
                selectionMode="replace"
                error={uploadError || state.fieldErrors?.image}
                defaultValue={initialData?.image_url ? [initialData.image_url] : []}
                onFileChange={handleImageFileChange}
            />

            <FormField
                id="link_url"
                name="link_url"
                label="클릭 이동 링크"
                placeholder="https://example.com 또는 /clubs"
                defaultValue={initialData?.link_url ?? ""}
                description="입력하면 사용자가 배너를 클릭했을 때 해당 링크로 이동합니다."
                error={state.fieldErrors?.link_url}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormDatePicker
                    id="publish_start_at"
                    name="publish_start_at"
                    label="게시 시작일시"
                    required
                    defaultValue={toDateValue(initialData?.publish_start_at)}
                    error={state.fieldErrors?.publish_start_at}
                />

                <FormDatePicker
                    id="publish_end_at"
                    name="publish_end_at"
                    label="게시 종료일시"
                    required
                    defaultValue={toDateValue(initialData?.publish_end_at)}
                    error={state.fieldErrors?.publish_end_at}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label className="font-semibold text-zinc-700 text-base">
                    사용여부<span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                    name="is_active"
                    defaultValue={initialData?.is_active === false ? "false" : "true"}
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
                {state.fieldErrors?.is_active ? (
                    <p className="text-xs text-red-500">{state.fieldErrors.is_active}</p>
                ) : null}
            </div>

            {showSubmitButton ? (
                <LoadingButton
                    type="submit"
                    loading={isPending || isImageUploading}
                    loadingText={isImageUploading ? "이미지 업로드 중..." : loadingText}
                    className="w-full">
                    {submitText}
                </LoadingButton>
            ) : null}
        </form>
    );
}
