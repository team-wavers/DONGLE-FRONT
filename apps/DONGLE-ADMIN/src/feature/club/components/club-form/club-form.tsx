"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { Club } from "@dongle/types/club/club.d";
import { Calendar, Mail, Tag } from "lucide-react";
import { RECRUITMENT_STATUS, RECRUITMENT_STATUS_LABEL } from "@/feature/club/constants/club.constants";
import {
    clubEditSchema,
    createClubEditDefaultValues,
    createClubEditDraftValues,
    type ClubEditFormValues,
} from "@/feature/club/form/club-edit.schema";
import {
    clubPresidentSchema,
    createClubPresidentDefaultValues,
    type ClubPresidentFormValues,
} from "@/feature/club/form/club-president.schema";
import { useClubEditSubmit } from "@/feature/club/form/use-club-edit-submit";
import { useClubPresidentSubmit } from "@/feature/club/form/use-club-president-submit";
import ClubDeleteButton from "../club-delete-button";
import { ClubPresidentEditForm } from "./club-president-edit-form";
import { LoadingButton } from "@/shared/components/atoms/button/loading-button/loading-button";
import {
    AdminFormActions,
    AdminFormSection,
    AdminFormShell,
} from "@/shared/components/molecules/layout/admin-form-layout/admin-form-layout";
import { FormRoot } from "@/shared/form/form-root";
import { RHFDatePicker } from "@/shared/form/rhf-date-picker";
import { RHFFileUpload } from "@/shared/form/rhf-file-upload";
import { RHFRichTextEditor } from "@/shared/form/rhf-rich-text-editor";
import { RHFSelectField } from "@/shared/form/rhf-select-field";
import { RHFTextField } from "@/shared/form/rhf-text-field";
import { useSessionStorageDraft } from "@/hooks/use-session-storage-draft";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";

export interface ClubFormProps {
    club: Club;
    clubId: string;
    presidentId: number;
}

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

export default function ClubForm({ club, clubId, presidentId }: ClubFormProps) {
    const pathname = usePathname();
    const initialMainValues = useMemo(() => createClubEditDefaultValues(club), [club]);
    const initialPresidentValues = useMemo(() => createInitialPresidentValues(club), [club]);
    const mainDraftStorageKey = useMemo(() => getMainDraftStorageKey(clubId), [clubId]);
    const presidentDraftStorageKey = useMemo(() => getPresidentDraftStorageKey(clubId), [clubId]);
    const [mainBaseline, setMainBaseline] = useState<ClubEditFormValues>(initialMainValues);
    const [presidentBaseline, setPresidentBaseline] = useState<ClubPresidentFormValues>(initialPresidentValues);
    const [didRestoreMainDraft, setDidRestoreMainDraft] = useState(false);
    const [didRestorePresidentDraft, setDidRestorePresidentDraft] = useState(false);

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
    const isMainDirty = mainForm.formState.isDirty || !areEqual(mainDraft, mainBaseline);
    const isPresidentDirty = !areEqual(presidentDraft, presidentBaseline);

    useEffect(() => {
        setMainBaseline(initialMainValues);
        mainForm.reset(initialMainValues);
    }, [initialMainValues, mainForm]);

    useEffect(() => {
        setPresidentBaseline(initialPresidentValues);
        presidentForm.reset(initialPresidentValues);
    }, [initialPresidentValues, presidentForm]);

    const { saveNow: saveMainDraftNow, clear: clearMainDraft } = useSessionStorageDraft<ClubEditFormValues>({
        key: mainDraftStorageKey,
        currentValue: mainDraft,
        baselineValue: mainBaseline,
        isDirty: isMainDirty,
        success: false,
        shouldRestore: (savedDraft, baseDraft) => !areEqual(savedDraft, baseDraft),
        onRestore: (savedDraft) => {
            const draft = createClubEditDraftValues(savedDraft);
            mainForm.reset(draft);
            setDidRestoreMainDraft(true);
            toast.success("임시 저장된 동아리 정보를 복구했습니다.");
        },
    });

    const { saveNow: savePresidentDraftNow, clear: clearPresidentDraft } = useSessionStorageDraft<ClubPresidentFormValues>({
        key: presidentDraftStorageKey,
        currentValue: presidentDraft,
        baselineValue: presidentBaseline,
        isDirty: isPresidentDirty,
        success: false,
        shouldRestore: (savedDraft, baseDraft) => !areEqual(savedDraft, baseDraft),
        onRestore: (savedDraft) => {
            presidentForm.reset(savedDraft);
            setDidRestorePresidentDraft(true);
            toast.success("임시 저장된 회장 정보를 복구했습니다.");
        },
    });

    const saveDirtyDrafts = useCallback(() => {
        if (isMainDirty) {
            saveMainDraftNow(createClubEditDraftValues(mainForm.getValues()));
        }
        if (isPresidentDirty) {
            savePresidentDraftNow(presidentForm.getValues());
        }
    }, [isMainDirty, isPresidentDirty, mainForm, presidentForm, saveMainDraftNow, savePresidentDraftNow]);

    const {
        formError: mainFormError,
        isSubmitting: isMainPending,
        onSubmit: onMainSubmit,
        onInvalid: onMainInvalid,
        submitSucceeded: didSubmitMain,
    } = useClubEditSubmit({
        clubId,
        form: mainForm,
        returnTo: pathname,
        onSuccess: (values) => {
            const savedValues = createClubEditDraftValues(values);
            setMainBaseline(savedValues);
            mainForm.reset(savedValues);
        },
        onSessionExpired: saveDirtyDrafts,
    });

    const {
        formError: presidentFormError,
        isSubmitting: isPresidentPending,
        onSubmit: onPresidentSubmit,
        onInvalid: onPresidentInvalid,
        submitSucceeded: didSubmitPresident,
    } = useClubPresidentSubmit({
        clubId,
        presidentId,
        form: presidentForm,
        returnTo: pathname,
        onSuccess: (values) => {
            const savedValues = createClubPresidentDefaultValues(values);
            setPresidentBaseline(savedValues);
            presidentForm.reset(savedValues);
        },
        onSessionExpired: saveDirtyDrafts,
    });

    useUnsavedChangesGuard({
        isDirty: isMainDirty || isPresidentDirty,
        message: UNSAVED_CHANGES_MESSAGE,
    });

    useEffect(() => {
        if (didSubmitMain) {
            clearMainDraft();
            setDidRestoreMainDraft(false);
        }
    }, [clearMainDraft, didSubmitMain]);

    useEffect(() => {
        if (didSubmitPresident) {
            clearPresidentDraft();
            setDidRestorePresidentDraft(false);
        }
    }, [clearPresidentDraft, didSubmitPresident]);

    return (
        <AdminFormShell>
            <FormRoot
                form={mainForm}
                onSubmit={onMainSubmit}
                onInvalid={onMainInvalid}
                formError={mainFormError}
                className="flex flex-col gap-4">
                {didRestoreMainDraft ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        임시 저장된 동아리 정보를 복구했습니다. 새로 선택했던 아이콘 파일은 자동 복구되지 않아 다시 선택해야 할 수
                        있습니다.
                    </div>
                ) : null}

                <AdminFormSection
                    title="동아리 정보"
                    description="동아리의 기본 정보를 관리합니다."
                    icon={<Tag className="h-5 w-5 text-primary" />}>
                        {/* 동아리 이름 */}
                        <RHFTextField<ClubEditFormValues>
                            id="clubName"
                            name="clubName"
                            label="동아리 이름"
                            type="text"
                            placeholder="동아리 이름을 입력하세요"
                            required
                        />

                        {/* 모집여부 */}
                        <RHFSelectField<ClubEditFormValues>
                            id="recruitmentStatus"
                            name="recruitmentStatus"
                            label="모집여부"
                            placeholder="모집 상태를 선택하세요"
                            required
                            description={`모집 여부가 ${RECRUITMENT_STATUS_LABEL.RECRUITING}일 때만 모집기간을 설정할 수 있습니다`}
                            options={[
                                { value: RECRUITMENT_STATUS.RECRUITING, label: RECRUITMENT_STATUS_LABEL.RECRUITING },
                                { value: RECRUITMENT_STATUS.CLOSED, label: RECRUITMENT_STATUS_LABEL.CLOSED },
                            ]}
                        />

                        {/* 분과 */}
                        <RHFSelectField<ClubEditFormValues>
                            id="category"
                            name="category"
                            label="분과"
                            placeholder="분과를 선택하세요"
                            required
                            options={[
                                { value: "학술분과", label: "학술분과" },
                                { value: "문예분과", label: "문예분과" },
                                { value: "체육분과", label: "체육분과" },
                                { value: "봉사분과", label: "봉사분과" },
                                { value: "종교분과", label: "종교분과" },
                                { value: "음악분과", label: "음악분과" },
                            ]}
                        />

                        {/* 동아리방 정보 */}
                        <RHFTextField<ClubEditFormValues>
                            id="location"
                            name="location"
                            label="동아리방 정보"
                            type="text"
                            placeholder="예: 학생회관 3층 301호"
                            required
                        />

                        {/* 동아리 아이콘 */}
                        <RHFFileUpload<ClubEditFormValues>
                            id="iconFile"
                            name="iconUrls"
                            fileName="iconFile"
                            label="동아리 아이콘"
                            description="동아리를 대표하는 아이콘 이미지를 업로드하세요"
                            fileType="image"
                            maxSize={5}
                            maxFiles={1}
                            selectionMode="replace"
                            presentation="club-icon"
                        />
                </AdminFormSection>

                <AdminFormSection
                    title="동아리 소개"
                    description="사용자에게 노출되는 소개와 주요 활동을 관리합니다."
                    icon={<Tag className="h-5 w-5 text-primary" />}>
                        {/* 동아리 설명 */}
                        <RHFRichTextEditor<ClubEditFormValues>
                            id="description"
                            name="description"
                            label="동아리 설명"
                            placeholder="동아리에 대한 자세한 설명을 입력해주세요."
                            enableImageUpload={false}
                            description="굵게, 기울임, 제목, 목록, 링크 서식을 사용할 수 있습니다."
                            required
                        />

                        {/* 주요 활동 */}
                        <RHFRichTextEditor<ClubEditFormValues>
                            id="main_activities"
                            name="main_activities"
                            label="주요 활동"
                            placeholder="동아리에서 주로 하는 활동을 소개해주세요."
                            enableImageUpload={false}
                            description="동아리의 핵심 활동을 보기 쉽게 정리해보세요."
                            required
                        />

                        {/* 태그 */}
                        <RHFTextField<ClubEditFormValues>
                            id="tags"
                            name="tags"
                            label="태그"
                            placeholder="태그를 입력하세요 (예: 개발, 디자인)"
                            description="여러 태그는 쉼표(,)로 구분해주세요"
                        />
                </AdminFormSection>

                <AdminFormSection
                    title="활동 정보"
                    description="모집 기간 등 활동 관련 정보를 관리합니다."
                    icon={<Calendar className="h-5 w-5 text-primary" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 모집 시작일 */}
                            <RHFDatePicker<ClubEditFormValues>
                                id="recruitmentStartDate"
                                name="recruitmentStartDate"
                                label="모집 시작일"
                            />

                            {/* 모집 마감일 */}
                            <RHFDatePicker<ClubEditFormValues>
                                id="recruitmentEndDate"
                                name="recruitmentEndDate"
                                label="모집 마감일"
                            />
                        </div>
                </AdminFormSection>

                <AdminFormSection
                    title="연락처 정보"
                    description="동아리 SNS와 연락 채널 정보를 관리합니다."
                    icon={<Mail className="h-5 w-5 text-primary" />}>
                        <div className="space-y-4">
                            <label className="text-base font-medium">SNS</label>
                            <div className="space-y-3">
                                {/* Instagram */}
                                <RHFTextField<ClubEditFormValues>
                                    id="instagram"
                                    name="instagram"
                                    label="Instagram"
                                    type="text"
                                    placeholder="@username 또는 전체 URL"
                                />

                                {/* YouTube */}
                                <RHFTextField<ClubEditFormValues>
                                    id="youtube"
                                    name="youtube"
                                    label="YouTube"
                                    type="text"
                                    placeholder="채널명 또는 전체 URL"
                                />
                            </div>
                        </div>
                </AdminFormSection>

                <AdminFormActions>
                    {club ? <ClubDeleteButton clubId={Number(clubId)} clubName={club.name} /> : null}
                    <LoadingButton type="submit" loading={isMainPending} loadingText="수정 중..." className="min-w-32">
                        동아리 정보 수정
                    </LoadingButton>
                </AdminFormActions>
            </FormRoot>

            <ClubPresidentEditForm
                form={presidentForm}
                onSubmit={onPresidentSubmit}
                onInvalid={onPresidentInvalid}
                formError={presidentFormError}
                isPending={isPresidentPending}
                didRestoreDraft={didRestorePresidentDraft}
            />
        </AdminFormShell>
    );
}
