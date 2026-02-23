"use client";

import { useActionState, useEffect, useState } from "react";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import { FormTextarea } from "@/components/atoms/form/form-textarea/form-textarea";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { toast } from "sonner";
import { activityReportAction, ActivityReportActionState } from "@/feature/report/action/activity-report-form.action";
import { UpdateActivityReportActionState } from "@/feature/report/action/update-activity-report-form.action";
import { FileUpload } from "@/components/atoms/form/file-upload/file-upload";
import { useRouter } from "next/navigation";

export interface ActivityReportFormProps {
    customAction?: (
        prevState: ActivityReportActionState | UpdateActivityReportActionState,
        formData: FormData
    ) => Promise<ActivityReportActionState | UpdateActivityReportActionState>;
    title?: string;
    content?: string;
    images?: string[];
    clubId: string;
    reportId?: string;
}

export default function ActivityReportForm({
    customAction,
    title,
    content,
    images,
    clubId,
    reportId,
}: ActivityReportFormProps) {
    const [existingUrls, setExistingUrls] = useState<string[]>(images || []);
    const [removedUrls, setRemovedUrls] = useState<string[]>([]);
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(customAction || activityReportAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
    } as ActivityReportActionState | UpdateActivityReportActionState);

    // 기존 URL 제거 핸들러
    const handleUrlRemove = (url: string) => {
        setExistingUrls((prev) => prev.filter((u) => u !== url));
        setRemovedUrls((prev) => [...prev, url]);
    };

    // 성공/실패 시 토스트 표시
    useEffect(() => {
        if (state.success) {
            toast.success("활동 보고서가 성공적으로 등록되었습니다!");
            router.back();
        }
        if (state.error) {
            toast.error(state.error);
        }
    }, [state.success, state.error, router]);

    return (
        <form action={formAction} className="space-y-6 w-full">
            <input type="hidden" name="reportId" value={reportId} />
            <input type="hidden" name="clubId" value={clubId} />
            <input type="hidden" name="existingUrls" value={JSON.stringify(existingUrls)} />
            <input type="hidden" name="removedUrls" value={JSON.stringify(removedUrls)} />
            {title && <input type="hidden" name="originalTitle" value={title} />}
            {content && <input type="hidden" name="originalContent" value={content} />}
            {images && <input type="hidden" name="originalImageUrls" value={JSON.stringify(images)} />}

            {/* 제목 */}
            <FormField
                label="보고서 제목"
                type="text"
                name="title"
                placeholder="활동 보고서 제목을 입력하세요"
                required
                error={state.fieldErrors?.title}
                id="title"
                defaultValue={title}
            />

            {/* 내용 */}
            <FormTextarea
                label="활동 내용"
                name="content"
                rows={8}
                placeholder="이번 달 동아리 활동 내용을 상세히 작성해주세요."
                required
                error={state.fieldErrors?.content}
                id="content"
                defaultValue={content}
            />

            {/* 이미지 업로드 */}
            <FileUpload
                label="활동 사진"
                name="images"
                multiple
                maxFiles={5}
                description="활동 사진을 업로드하세요"
                defaultValue={existingUrls}
                onUrlRemove={handleUrlRemove}
            />

            {/* 제출 버튼 */}
            <LoadingButton
                type="submit"
                className="w-full  bg-primary hover:bg-primary/90 text-white py-3 text-lg font-bold"
                loading={isPending}
                loadingText="보고서 등록 중...">
                등록
            </LoadingButton>
        </form>
    );
}
