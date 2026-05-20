"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import {
    AdminBackAction,
    AdminFormActions,
    AdminFormSection,
    AdminFormShell,
} from "@/components/molecules/layout/admin-form-layout/admin-form-layout";
import { FormRoot } from "@/shared/form/form-root";
import { RHFFileUpload } from "@/shared/form/rhf-file-upload";
import { RHFRichTextEditor } from "@/shared/form/rhf-rich-text-editor";
import { RHFTextField } from "@/shared/form/rhf-text-field";
import { useSessionStorageDraft } from "@/hooks/use-session-storage-draft";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import {
    activityReportSchema,
    createActivityReportDefaultValues,
    createActivityReportDraftValues,
    type ActivityReportFormValues,
} from "@/feature/report/form/activity-report.schema";
import { useActivityReportSubmit } from "@/feature/report/form/use-activity-report-submit";

export interface ActivityReportFormProps {
    title?: string;
    content?: string;
    images?: string[];
    clubId: string;
    reportId?: string;
    successRedirectHref?: string;
    successMessage?: string;
    backHref?: string;
    headingTitle?: string;
    headingDescription?: string;
}

const UNSAVED_CHANGES_MESSAGE = "작성 중인 내용이 저장되지 않았습니다. 정말 페이지를 떠날까요?";

function areEqual<T>(left: T, right: T) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function getDraftStorageKey(clubId: string, reportId?: string) {
    return `activity-report-draft:${clubId}:${reportId ?? "create"}`;
}

export default function ActivityReportForm({
    title,
    content,
    images,
    clubId,
    reportId,
    successRedirectHref,
    successMessage,
    backHref,
    headingTitle,
    headingDescription,
}: ActivityReportFormProps) {
    const pathname = usePathname();
    const initialValues = useMemo(
        () => createActivityReportDefaultValues({ title, content, images }),
        [content, images, title]
    );
    const draftStorageKey = useMemo(() => getDraftStorageKey(clubId, reportId), [clubId, reportId]);
    const [baseline, setBaseline] = useState<ActivityReportFormValues>(initialValues);
    const [didRestoreDraft, setDidRestoreDraft] = useState(false);
    const form = useForm<ActivityReportFormValues>({
        resolver: zodResolver(activityReportSchema),
        defaultValues: initialValues,
        mode: "onSubmit",
    });
    const watchedValues = useWatch({ control: form.control }) as ActivityReportFormValues;
    const currentDraft = createActivityReportDraftValues({
        ...initialValues,
        ...watchedValues,
    });
    const isDirty = form.formState.isDirty || !areEqual(currentDraft, baseline);

    useEffect(() => {
        setBaseline(initialValues);
        form.reset(initialValues);
    }, [form, initialValues]);

    const { saveNow, clear } = useSessionStorageDraft<ActivityReportFormValues>({
        key: draftStorageKey,
        currentValue: currentDraft,
        baselineValue: baseline,
        isDirty,
        success: false,
        shouldRestore: (savedDraft, baseDraft) => !areEqual(savedDraft, baseDraft),
        onRestore: (savedDraft) => {
            const draft = createActivityReportDraftValues(savedDraft);
            form.reset(draft);
            setDidRestoreDraft(true);
            toast.success("임시 저장된 활동보고서 내용을 복구했습니다.");
        },
    });

    const saveDraftNow = useCallback(() => {
        if (isDirty) {
            saveNow(createActivityReportDraftValues(form.getValues()));
        }
    }, [form, isDirty, saveNow]);

    const {
        formError,
        isSubmitting,
        onSubmit,
        onInvalid,
        submitSucceeded,
    } = useActivityReportSubmit({
        form,
        clubId,
        reportId,
        originalReport:
            reportId && title !== undefined && content !== undefined
                ? {
                      title,
                      content,
                      image_urls: images ?? [],
                  }
                : undefined,
        successRedirectHref,
        successMessage,
        returnTo: pathname,
        onSessionExpired: saveDraftNow,
    });

    useUnsavedChangesGuard({
        isDirty,
        message: UNSAVED_CHANGES_MESSAGE,
    });

    useEffect(() => {
        if (submitSucceeded) {
            clear();
            setDidRestoreDraft(false);
        }
    }, [clear, submitSucceeded]);

    return (
        <FormRoot form={form} onSubmit={onSubmit} onInvalid={onInvalid} formError={formError} className="w-full">
            <AdminFormShell>
                {backHref ? <AdminBackAction href={backHref} /> : null}

                {headingTitle ? (
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{headingTitle}</h1>
                        {headingDescription ? <p className="text-sm text-muted-foreground">{headingDescription}</p> : null}
                    </div>
                ) : null}

                {didRestoreDraft ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        임시 저장된 내용을 복구했습니다. 새로 선택했던 썸네일 파일은 브라우저 보안 정책상 자동 복구되지 않아 다시
                        선택해야 할 수 있습니다.
                    </div>
                ) : null}

                <AdminFormSection title="활동보고서 내용" description="사용자에게 노출되는 보고서 제목과 본문을 작성합니다.">
                    <RHFTextField<ActivityReportFormValues>
                        id="title"
                        name="title"
                        label="보고서 제목"
                        type="text"
                        placeholder="활동 보고서 제목을 입력하세요"
                        required
                    />

                    <RHFRichTextEditor<ActivityReportFormValues>
                        id="content"
                        name="content"
                        label="활동 내용"
                        clubId={clubId}
                        placeholder="이번 달 동아리 활동 내용을 상세히 작성해주세요."
                        required
                    />
                </AdminFormSection>

                <AdminFormSection title="대표 이미지" description="보고서 목록과 상세에 노출되는 대표 이미지를 관리합니다.">
                    <RHFFileUpload<ActivityReportFormValues>
                        id="images"
                        name="imageUrls"
                        fileName="imageFile"
                        label="썸네일"
                        maxFiles={1}
                        selectionMode="replace"
                        presentation="single-thumbnail"
                        description="보고서 대표 썸네일 이미지를 업로드하세요"
                    />
                </AdminFormSection>

                <AdminFormActions>
                    <LoadingButton
                        type="submit"
                        className="min-w-32"
                        loading={isSubmitting}
                        loadingText={reportId ? "보고서 수정 중..." : "보고서 등록 중..."}>
                        {reportId ? "수정 완료" : "등록"}
                    </LoadingButton>
                </AdminFormActions>
            </AdminFormShell>
        </FormRoot>
    );
}
