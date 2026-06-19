"use client";

import type { Club } from "@dongle/types/club/club.d";
import { Calendar, Mail, Tag } from "lucide-react";
import { RECRUITMENT_STATUS, RECRUITMENT_STATUS_LABEL } from "@/feature/club/constants/club.constants";
import type { ClubEditFormValues } from "@/feature/club/form/club-edit.schema";
import { useClubForm } from "@/feature/club/form/use-club-form";
import ClubDeleteButton from "../club-delete-button";
import { ClubPresidentEditForm } from "./club-president-edit-form";
import { LoadingButton } from "@/shared/ui/feedback/button/loading-button/loading-button";
import {
    AdminFormActions,
    AdminFormSection,
    AdminFormShell,
} from "@/shared/layout/form-page/admin-form-layout";
import { FormRoot } from "@/shared/form/form-root";
import { RHFDatePicker } from "@/shared/form/rhf-date-picker";
import { RHFFileUpload } from "@/shared/form/rhf-file-upload";
import { RHFRichTextEditor } from "@/shared/form/rhf-rich-text-editor";
import { RHFSelectField } from "@/shared/form/rhf-select-field";
import { RHFTextField } from "@/shared/form/rhf-text-field";

export interface ClubFormProps {
    club: Club;
    clubId: string;
    presidentId: number;
}

export default function ClubForm({ club, clubId, presidentId }: ClubFormProps) {
    const {
        mainForm,
        presidentForm,
        didRestoreMainDraft,
        didRestorePresidentDraft,
        mainSubmit,
        presidentSubmit,
    } = useClubForm({
        club,
        clubId,
        presidentId,
    });

    return (
        <AdminFormShell className="mx-0 max-w-none">
            <FormRoot
                form={mainForm}
                onSubmit={mainSubmit.onSubmit}
                onInvalid={mainSubmit.onInvalid}
                formError={mainSubmit.formError}
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
                    <LoadingButton
                        type="submit"
                        loading={mainSubmit.isSubmitting}
                        loadingText="수정 중..."
                        className="min-w-32">
                        동아리 정보 수정
                    </LoadingButton>
                </AdminFormActions>
            </FormRoot>

            <ClubPresidentEditForm
                form={presidentForm}
                onSubmit={presidentSubmit.onSubmit}
                onInvalid={presidentSubmit.onInvalid}
                formError={presidentSubmit.formError}
                isPending={presidentSubmit.isSubmitting}
                didRestoreDraft={didRestorePresidentDraft}
            />
        </AdminFormShell>
    );
}
