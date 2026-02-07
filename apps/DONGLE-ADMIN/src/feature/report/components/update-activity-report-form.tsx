"use client";

import { useActionState, useEffect, useState } from "react";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import { FormTextarea } from "@/components/atoms/form/form-textarea/form-textarea";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { toast } from "sonner";
import { updateActivityReportAction } from "@/feature/report/action/update-activity-report-form.action";
import { ClubReport } from "@dongle/types/club/club.report.d";
import Image from "next/image";
import { Button } from "@dongle/ui/button";

export interface UpdateActivityReportFormProps {
    report: ClubReport;
    reportId: string;
}

export default function UpdateActivityReportForm({ report, reportId }: UpdateActivityReportFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [state, formAction, isPending] = useActionState(updateActivityReportAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
    });

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
                {/* 이미지들 */}
                {report.image_urls && report.image_urls.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">활동 사진</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {report.image_urls.length > 0 &&
                                report.image_urls.map((url: string, index: number) => (
                                    <Image
                                        key={index}
                                        src={url}
                                        alt={`보고서 이미지 ${index + 1}`}
                                        width={500}
                                        height={300}
                                        className="w-full h-auto rounded-lg shadow-sm border"
                                    />
                                ))}
                        </div>
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
                <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{report.content}</p>
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

            {/* 이미지들 */}
            {report.image_urls && report.image_urls.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">기존 이미지</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.image_urls.length > 0 &&
                            report.image_urls.map((url: string, index: number) => (
                                <Image
                                    key={index}
                                    src={url}
                                    alt={`보고서 이미지 ${index + 1}`}
                                    width={500}
                                    height={300}
                                    className="w-full h-auto rounded-lg shadow-sm border"
                                />
                            ))}
                    </div>
                </div>
            )}

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
            <FormTextarea
                label="활동 내용"
                name="content"
                rows={8}
                placeholder="이번 달 동아리 활동 내용을 상세히 작성해주세요."
                required
                error={state.fieldErrors?.content}
                id="content"
                defaultValue={report.content}
            />

            {/* 이미지 업로드 */}
            <FormField
                label="새로운 이미지 추가 (기존 이미지와 함께 표시됩니다)"
                type="file"
                name="images"
                accept="image/*"
                multiple
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
