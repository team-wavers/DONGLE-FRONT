"use client";

import { useActionState, useEffect, useState } from "react";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { toast } from "sonner";
import { updateActivityReportAction } from "@/feature/report/action/update-activity-report-form.action";
import { ClubReport } from "@dongle/types/club/club.report.d";
import { Button } from "@dongle/ui/button";
import { RichTextViewer } from "@dongle/rich-text";
import { RichTextEditor } from "@/components/atoms/form/rich-text-editor/rich-text-editor";
import { FileUpload } from "@/components/atoms/form/file-upload/file-upload";

export interface UpdateActivityReportFormProps {
    report: ClubReport;
    reportId: string;
}

export default function UpdateActivityReportForm({ report, reportId }: UpdateActivityReportFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [existingUrls, setExistingUrls] = useState<string[]>(report.image_urls || []);
    const [removedUrls, setRemovedUrls] = useState<string[]>([]);
    const [state, formAction, isPending] = useActionState(updateActivityReportAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
    });

    const handleUrlRemove = (url: string) => {
        setExistingUrls((prev) => prev.filter((item) => item !== url));
        setRemovedUrls((prev) => [...prev, url]);
    };

    const handleReplaceExistingUrls = () => {
        if (existingUrls.length === 0) return;
        setRemovedUrls((prev) => [...new Set([...prev, ...existingUrls])]);
        setExistingUrls([]);
    };

    // 성공/실패 시 토스트 표시
    useEffect(() => {
        if (state.success) {
            toast.success("보고서가 성공적으로 수정되었습니다!");
            setIsEditing(false);
        }
        if (state.error) {
            toast.error(state.error);
        }
    }, [state.success, state.error]);

    if (!isEditing) {
        return (
            <div className="space-y-6 w-full">
                {report.image_urls && report.image_urls.length > 0 && (
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">썸네일</h3>
                        <img
                            src={report.image_urls[0]}
                            alt={`${report.title} 썸네일`}
                            className="h-56 w-full rounded-xl object-cover"
                        />
                    </div>
                )}

                {/* 제목 */}
                <div>
                    <h1 className="text-2xl font-bold mb-4">{report.title}</h1>
                </div>

                {/* 작성일 */}
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <p>작성일: {new Date(report.createdAt).toLocaleDateString("ko-KR")}</p>
                </div>

                {/* 내용 */}
                <div>
                    <RichTextViewer html={report.content} />
                </div>

                {/* 수정 버튼 */}
                <div className="pt-4 border-t border-gray-200">
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                        수정하기
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-6 w-full">
            <input type="hidden" name="reportId" value={reportId} />
            <input type="hidden" name="clubId" value={report.club_id} />
            <input type="hidden" name="existingUrls" value={JSON.stringify(existingUrls)} />
            <input type="hidden" name="removedUrls" value={JSON.stringify(removedUrls)} />
            <input type="hidden" name="originalTitle" value={report.title} />
            <input type="hidden" name="originalContent" value={report.content} />
            <input type="hidden" name="originalImageUrls" value={JSON.stringify(report.image_urls || [])} />

            {/* 제목 */}
            <FormField
                label="보고서 제목"
                type="text"
                name="title"
                placeholder="활동 보고서 제목을 입력하세요"
                required
                error={state.fieldErrors?.title}
                id="title"
                defaultValue={report.title}
            />

            {/* 내용 */}
            <RichTextEditor
                label="활동 내용"
                name="content"
                clubId={String(report.club_id)}
                placeholder="이번 달 동아리 활동 내용을 상세히 작성해주세요."
                required
                error={state.fieldErrors?.content}
                id="content"
                defaultValue={report.content}
            />

            <FileUpload
                label="썸네일"
                name="images"
                maxFiles={1}
                selectionMode="replace"
                presentation="single-thumbnail"
                description="보고서 대표 썸네일 이미지를 업로드하세요"
                defaultValue={existingUrls}
                onUrlRemove={handleUrlRemove}
                onReplaceExistingUrls={handleReplaceExistingUrls}
                error={state.fieldErrors?.images}
                id="images"
            />

            {/* 버튼들 */}
            <div className="flex gap-4">
                <LoadingButton
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 text-lg font-bold"
                    loading={isPending}
                    loadingText="보고서 수정 중...">
                    수정 완료
                </LoadingButton>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    취소
                </Button>
            </div>
        </form>
    );
}
