"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useSessionStorageDraft } from "@/hooks/use-session-storage-draft";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useActionFormSubmit } from "@/shared/form/use-action-form-submit";
import { submitActivityReportCreateAction, submitActivityReportUpdateAction } from "./activity-report.action";
import {
    activityReportSchema,
    createActivityReportDefaultValues,
    createActivityReportDraftValues,
    type ActivityReportFormValues,
} from "./activity-report.schema";

const UNSAVED_CHANGES_MESSAGE = "작성 중인 내용이 저장되지 않았습니다. 정말 페이지를 떠날까요?";

function areEqual<T>(left: T, right: T) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function getDraftStorageKey(clubId: string, reportId?: string) {
    return `activity-report-draft:${clubId}:${reportId ?? "create"}`;
}

export function useActivityReportForm({
    title,
    content,
    images,
    clubId,
    reportId,
    successRedirectHref,
    successMessage,
}: {
    title?: string;
    content?: string;
    images?: string[];
    clubId: string;
    reportId?: string;
    successRedirectHref?: string;
    successMessage?: string;
}) {
    const pathname = usePathname();
    const router = useRouter();
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
    const originalReport =
        reportId && title !== undefined && content !== undefined
            ? {
                  title,
                  content,
                  image_urls: images ?? [],
              }
            : undefined;

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

    const submit = useActionFormSubmit({
        form,
        invalidMessage: "활동보고서 내용을 다시 확인해주세요.",
        action: (values) =>
            reportId && originalReport
                ? submitActivityReportUpdateAction({ clubId, reportId, values, originalReport })
                : submitActivityReportCreateAction({ clubId, values }),
        onSessionExpired: () => {
            saveDraftNow();
            router.replace(`/login?expired=true&returnTo=${encodeURIComponent(pathname)}`);
        },
        onSuccess: ({ result }) => {
            toast.success(result.message ?? successMessage ?? "활동 보고서가 저장되었습니다.");
            router.push(successRedirectHref ?? `/${clubId}/report`);
        },
    });

    useUnsavedChangesGuard({
        isDirty,
        message: UNSAVED_CHANGES_MESSAGE,
    });

    useEffect(() => {
        if (submit.submitSucceeded) {
            clear();
            setDidRestoreDraft(false);
        }
    }, [clear, submit.submitSucceeded]);

    return {
        form,
        didRestoreDraft,
        ...submit,
    };
}
