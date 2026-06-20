"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { Club } from "@dongle/types/club/club.d";
import { useSessionStorageDraft } from "@/hooks/use-session-storage-draft";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useActionFormSubmit } from "@/shared/form/use-action-form-submit";
import { submitClubEditAction } from "./club-edit.action";
import {
    clubEditSchema,
    createClubEditDefaultValues,
    createClubEditDraftValues,
    createClubEditSavedValues,
    type ClubEditFormValues,
} from "./club-edit.schema";
import { submitClubPresidentAction } from "./club-president.action";
import {
    clubPresidentSchema,
    createClubPresidentDefaultValues,
    type ClubPresidentFormValues,
} from "./club-president.schema";

const UNSAVED_CHANGES_MESSAGE = "작성 중인 동아리 정보가 저장되지 않았습니다. 정말 페이지를 떠날까요?";

function getMainDraftStorageKey(clubId: string) {
    return `club-edit-draft:${clubId}:main`;
}

function getPresidentDraftStorageKey(clubId: string) {
    return `club-edit-draft:${clubId}:president`;
}

function areEqual<T>(left: T, right: T) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function createInitialPresidentValues(club: Club): ClubPresidentFormValues {
    return createClubPresidentDefaultValues({
        presidentName: club.president?.name ?? "",
        presidentContact: club.president?.phone ?? "",
    });
}

function useDraftBackedForm<TValues>({
    initialValues,
    storageKey,
    currentDraft,
    isFormDirty = false,
    formReset,
    getValues,
    normalizeDraft,
    restoreMessage,
}: {
    initialValues: TValues;
    storageKey: string;
    currentDraft: TValues;
    isFormDirty?: boolean;
    formReset: (values: TValues) => void;
    getValues: () => TValues;
    normalizeDraft: (values: TValues) => TValues;
    restoreMessage: string;
}) {
    const [baseline, setBaseline] = useState<TValues>(initialValues);
    const [didRestoreDraft, setDidRestoreDraft] = useState(false);
    const isDirty = isFormDirty || !areEqual(currentDraft, baseline);

    useEffect(() => {
        setBaseline(initialValues);
        formReset(initialValues);
    }, [formReset, initialValues]);

    const { saveNow, clear } = useSessionStorageDraft<TValues>({
        key: storageKey,
        currentValue: currentDraft,
        baselineValue: baseline,
        isDirty,
        success: false,
        shouldRestore: (savedDraft, baseDraft) => !areEqual(savedDraft, baseDraft),
        onRestore: (savedDraft) => {
            const draft = normalizeDraft(savedDraft);
            formReset(draft);
            toast.success(restoreMessage);
        },
        onRestoreStateChange: setDidRestoreDraft,
        onClear: () => setDidRestoreDraft(false),
    });

    const saveIfDirty = useCallback(() => {
        if (isDirty) {
            saveNow(normalizeDraft(getValues()));
        }
    }, [getValues, isDirty, normalizeDraft, saveNow]);

    const acceptSavedValues = useCallback(
        (values: TValues) => {
            const draft = normalizeDraft(values);
            setBaseline(draft);
            formReset(draft);
        },
        [formReset, normalizeDraft]
    );

    return {
        isDirty,
        didRestoreDraft,
        clear,
        saveIfDirty,
        acceptSavedValues,
    };
}

export function useClubForm({ club, clubId, presidentId }: { club: Club; clubId: string; presidentId: number }) {
    const pathname = usePathname();
    const router = useRouter();
    const initialMainValues = useMemo(() => createClubEditDefaultValues(club), [club]);
    const initialPresidentValues = useMemo(() => createInitialPresidentValues(club), [club]);
    const mainDraftStorageKey = useMemo(() => getMainDraftStorageKey(clubId), [clubId]);
    const presidentDraftStorageKey = useMemo(() => getPresidentDraftStorageKey(clubId), [clubId]);

    const mainForm = useForm<ClubEditFormValues>({
        resolver: zodResolver(clubEditSchema),
        defaultValues: initialMainValues,
        mode: "onSubmit",
    });
    const presidentForm = useForm<ClubPresidentFormValues>({
        resolver: zodResolver(clubPresidentSchema),
        defaultValues: initialPresidentValues,
        mode: "onSubmit",
    });

    const watchedMainValues = useWatch({
        control: mainForm.control,
    }) as ClubEditFormValues;
    const watchedPresidentName = useWatch({
        control: presidentForm.control,
        name: "presidentName",
    });
    const watchedPresidentContact = useWatch({
        control: presidentForm.control,
        name: "presidentContact",
    });

    const mainDraft = createClubEditDraftValues({
        ...initialMainValues,
        ...watchedMainValues,
    });
    const presidentDraft = createClubPresidentDefaultValues({
        presidentName: watchedPresidentName ?? "",
        presidentContact: watchedPresidentContact ?? "",
    });
    const mainDraftForm = useDraftBackedForm({
        initialValues: initialMainValues,
        storageKey: mainDraftStorageKey,
        currentDraft: mainDraft,
        isFormDirty: mainForm.formState.isDirty,
        formReset: mainForm.reset,
        getValues: mainForm.getValues,
        normalizeDraft: createClubEditDraftValues,
        restoreMessage: "임시 저장된 동아리 정보를 복구했습니다.",
    });

    const presidentDraftForm = useDraftBackedForm({
        initialValues: initialPresidentValues,
        storageKey: presidentDraftStorageKey,
        currentDraft: presidentDraft,
        formReset: presidentForm.reset,
        getValues: presidentForm.getValues,
        normalizeDraft: createClubPresidentDefaultValues,
        restoreMessage: "임시 저장된 회장 정보를 복구했습니다.",
    });

    const saveDirtyDrafts = useCallback(() => {
        mainDraftForm.saveIfDirty();
        presidentDraftForm.saveIfDirty();
    }, [mainDraftForm, presidentDraftForm]);

    const handleSessionExpired = useCallback(() => {
        saveDirtyDrafts();
        router.replace(`/login?expired=true&returnTo=${encodeURIComponent(pathname)}`);
    }, [pathname, router, saveDirtyDrafts]);

    const mainSubmit = useActionFormSubmit({
        form: mainForm,
        invalidMessage: "동아리 정보를 다시 확인해주세요.",
        action: (values) => submitClubEditAction({ clubId, values }),
        onSessionExpired: handleSessionExpired,
        onSuccess: ({ values, result }) => {
            const savedValues = createClubEditSavedValues(values, {
                iconUrl: result.data?.iconUrl,
            });

            mainDraftForm.acceptSavedValues(savedValues);
            toast.success(result.message ?? "동아리 정보가 성공적으로 수정되었습니다!");
        },
    });

    const presidentSubmit = useActionFormSubmit({
        form: presidentForm,
        invalidMessage: "회장 정보를 다시 확인해주세요.",
        action: (values) =>
            submitClubPresidentAction({
                clubId,
                presidentId,
                values,
            }),
        onSessionExpired: handleSessionExpired,
        onSuccess: ({ values, result }) => {
            presidentDraftForm.acceptSavedValues(values);
            toast.success(result.message ?? "회장 정보가 성공적으로 수정되었습니다!");
        },
    });

    useUnsavedChangesGuard({
        isDirty: mainDraftForm.isDirty || presidentDraftForm.isDirty,
        message: UNSAVED_CHANGES_MESSAGE,
    });

    useEffect(() => {
        if (mainSubmit.submitSucceeded) {
            mainDraftForm.clear();
        }
    }, [mainDraftForm, mainSubmit.submitSucceeded]);

    useEffect(() => {
        if (presidentSubmit.submitSucceeded) {
            presidentDraftForm.clear();
        }
    }, [presidentDraftForm, presidentSubmit.submitSucceeded]);

    return {
        mainForm,
        presidentForm,
        didRestoreMainDraft: mainDraftForm.didRestoreDraft,
        didRestorePresidentDraft: presidentDraftForm.didRestoreDraft,
        mainSubmit,
        presidentSubmit,
    };
}
