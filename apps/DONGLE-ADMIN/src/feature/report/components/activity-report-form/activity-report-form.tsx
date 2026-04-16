"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { FileUpload } from "@/components/atoms/form/file-upload/file-upload";
import { RichTextEditor } from "@/components/atoms/form/rich-text-editor/rich-text-editor";
import { activityReportAction, ActivityReportActionState } from "@/feature/report/action/activity-report-form.action";
import { UpdateActivityReportActionState } from "@/feature/report/action/update-activity-report-form.action";
import { useSessionStorageDraft } from "@/hooks/use-session-storage-draft";
import { useSessionExpiredRedirect } from "@/hooks/use-session-expired-redirect";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";

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
    successRedirectHref?: string;
    successMessage?: string;
}

interface ActivityReportDraft {
    title: string;
    content: string;
    existingUrls: string[];
    removedUrls: string[];
}

const UNSAVED_CHANGES_MESSAGE = "작성 중인 내용이 저장되지 않았습니다. 정말 페이지를 떠날까요?";

function areStringArraysEqual(left: string[], right: string[]) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function getDraftStorageKey(clubId: string, reportId?: string) {
    return `activity-report-draft:${clubId}:${reportId ?? "create"}`;
}

export default function ActivityReportForm({
    customAction,
    title,
    content,
    images,
    clubId,
    reportId,
    successRedirectHref,
    successMessage,
}: ActivityReportFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const initialTitle = title ?? "";
    const initialContent = content ?? "";
    const initialImages = useMemo(() => images ?? [], [images]);
    const [titleValue, setTitleValue] = useState(initialTitle);
    const [contentValue, setContentValue] = useState(initialContent);
    const [existingUrls, setExistingUrls] = useState<string[]>(initialImages);
    const [removedUrls, setRemovedUrls] = useState<string[]>([]);
    const [didRestoreDraft, setDidRestoreDraft] = useState(false);
    const [state, formAction, isPending] = useActionState(customAction || activityReportAction, {
        success: false,
        error: undefined,
        sessionExpired: false,
        fieldErrors: undefined,
    } as ActivityReportActionState | UpdateActivityReportActionState);

    const draftStorageKey = useMemo(() => getDraftStorageKey(clubId, reportId), [clubId, reportId]);
    const currentDraft = useMemo<ActivityReportDraft>(
        () => ({
            title: titleValue,
            content: contentValue,
            existingUrls,
            removedUrls,
        }),
        [contentValue, existingUrls, removedUrls, titleValue]
    );
    const baselineDraft = useMemo<ActivityReportDraft>(
        () => ({
            title: initialTitle,
            content: initialContent,
            existingUrls: initialImages,
            removedUrls: [],
        }),
        [initialContent, initialImages, initialTitle]
    );
    const isDirty =
        currentDraft.title !== baselineDraft.title ||
        currentDraft.content !== baselineDraft.content ||
        !areStringArraysEqual(currentDraft.existingUrls, baselineDraft.existingUrls) ||
        currentDraft.removedUrls.length > 0;

    useSessionStorageDraft<ActivityReportDraft>({
        key: draftStorageKey,
        currentValue: currentDraft,
        baselineValue: baselineDraft,
        isDirty,
        success: state.success,
        shouldRestore: (savedDraft, baseDraft) =>
            savedDraft.title !== baseDraft.title ||
            savedDraft.content !== baseDraft.content ||
            !areStringArraysEqual(savedDraft.existingUrls, baseDraft.existingUrls) ||
            savedDraft.removedUrls.length > 0,
        onRestore: (savedDraft) => {
            setTitleValue(savedDraft.title);
            setContentValue(savedDraft.content);
            setExistingUrls(savedDraft.existingUrls);
            setRemovedUrls(savedDraft.removedUrls);
            setDidRestoreDraft(true);
            toast.success("임시 저장된 활동보고서 내용을 복구했습니다.");
        },
    });

    useUnsavedChangesGuard({
        isDirty,
        message: UNSAVED_CHANGES_MESSAGE,
    });

    useSessionExpiredRedirect({
        sessionExpired: state.sessionExpired,
        returnTo: pathname,
        drafts: [
            {
                isDirty,
                save: () => {
                    if (typeof window === "undefined") {
                        return;
                    }
                    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(currentDraft));
                },
            },
        ],
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

    useEffect(() => {
        if (state.success) {
            toast.success(successMessage ?? "활동 보고서가 성공적으로 등록되었습니다!");
            router.push(successRedirectHref ?? `/${clubId}/report`);
        }
        if (state.error && !state.sessionExpired) {
            toast.error(state.error);
        }
    }, [clubId, router, state.error, state.sessionExpired, state.success, successMessage, successRedirectHref]);

    return (
        <form action={formAction} className="space-y-6 w-full">
            <input type="hidden" name="reportId" value={reportId} />
            <input type="hidden" name="clubId" value={clubId} />
            <input type="hidden" name="existingUrls" value={JSON.stringify(existingUrls)} />
            <input type="hidden" name="removedUrls" value={JSON.stringify(removedUrls)} />
            {title && <input type="hidden" name="originalTitle" value={title} />}
            {content && <input type="hidden" name="originalContent" value={content} />}
            {images && <input type="hidden" name="originalImageUrls" value={JSON.stringify(images)} />}

            {didRestoreDraft ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    임시 저장된 내용을 복구했습니다. 새로 선택했던 썸네일 파일은 브라우저 보안 정책상 자동 복구되지 않아 다시 선택해야
                    할 수 있습니다.
                </div>
            ) : null}

            <FormField
                label="보고서 제목"
                type="text"
                name="title"
                placeholder="활동 보고서 제목을 입력하세요"
                required
                error={state.fieldErrors?.title}
                id="title"
                value={titleValue}
                onChange={(event) => setTitleValue(event.target.value)}
            />

            <RichTextEditor
                label="활동 내용"
                name="content"
                clubId={clubId}
                placeholder="이번 달 동아리 활동 내용을 상세히 작성해주세요."
                required
                error={state.fieldErrors?.content}
                id="content"
                value={contentValue}
                onChange={setContentValue}
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
            />

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
