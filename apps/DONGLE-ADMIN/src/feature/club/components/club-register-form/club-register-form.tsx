"use client";

import { useClubRegisterForm } from "@/feature/club/form/use-club-register-form";
import { RECRUITMENT_STATUS, RECRUITMENT_STATUS_LABEL } from "@/feature/club/constants/club.constants";
import type { ClubRegisterFormValues } from "@/feature/club/form/club-register.schema";
import { LoadingButton } from "@/shared/ui/feedback/button/loading-button/loading-button";
import { FormRoot } from "@/shared/form/form-root";
import { RHFDatePicker } from "@/shared/form/rhf-date-picker";
import { RHFFileUpload } from "@/shared/form/rhf-file-upload";
import { RHFRichTextEditor } from "@/shared/form/rhf-rich-text-editor";
import { RHFSelectField } from "@/shared/form/rhf-select-field";
import { RHFTextField } from "@/shared/form/rhf-text-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Calendar, Mail, Tag, Users } from "lucide-react";

export interface ClubRegisterFormProps {
    registrationKey: string;
}

export default function ClubRegisterForm({ registrationKey }: ClubRegisterFormProps) {
    const { form, onSubmit, onInvalid, formError, isSubmitting } = useClubRegisterForm(registrationKey);

    return (
        <FormRoot
            form={form}
            onSubmit={onSubmit}
            onInvalid={onInvalid}
            formError={formError}
            className="flex max-w-3xl flex-col gap-4 min-w-2xs w-full">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Tag className="w-5 h-5 text-primary" />
                        동아리 정보
                    </CardTitle>
                    <CardDescription>동아리의 기본적인 정보를 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 동아리 이름 */}
                    <RHFTextField<ClubRegisterFormValues>
                        id="clubName"
                        name="clubName"
                        label="동아리 이름"
                        type="text"
                        placeholder="동아리 이름을 입력하세요"
                        required
                    />

                    {/* 모집여부 */}
                    <RHFSelectField<ClubRegisterFormValues>
                        id="recruitmentStatus"
                        name="recruitmentStatus"
                        label="모집여부"
                        placeholder="모집 상태를 선택하세요"
                        required
                        options={[
                            { value: RECRUITMENT_STATUS.RECRUITING, label: RECRUITMENT_STATUS_LABEL.RECRUITING },
                            { value: RECRUITMENT_STATUS.CLOSED, label: RECRUITMENT_STATUS_LABEL.CLOSED },
                        ]}
                    />

                    {/* 분과 */}
                    <RHFSelectField<ClubRegisterFormValues>
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
                    <RHFTextField<ClubRegisterFormValues>
                        id="location"
                        name="location"
                        label="동아리방 정보"
                        type="text"
                        placeholder="예: 학생회관 3층 301호"
                        required
                    />

                    {/* 동아리 아이콘 */}
                    <RHFFileUpload<ClubRegisterFormValues>
                        id="iconFile"
                        name="iconUrls"
                        fileName="iconFile"
                        label="동아리 아이콘"
                        description="동아리 대표 아이콘 이미지를 업로드해주세요"
                        fileType="image"
                        maxSize={5}
                        maxFiles={1}
                        presentation="club-icon"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Tag className="w-5 h-5 text-primary" />
                        동아리 소개
                    </CardTitle>
                    <CardDescription>동아리에 대한 자세한 설명을 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 동아리 설명 */}
                    <RHFRichTextEditor<ClubRegisterFormValues>
                        name="description"
                        label="동아리 설명"
                        id="description"
                        placeholder="동아리에 대한 자세한 설명을 입력해주세요."
                        enableImageUpload={false}
                        description="굵게, 기울임, 제목, 목록, 링크 서식을 사용할 수 있습니다."
                        required
                    />

                    {/* 주요 활동 */}
                    <RHFRichTextEditor<ClubRegisterFormValues>
                        name="main_activities"
                        label="주요 활동"
                        id="main_activities"
                        placeholder="동아리에서 주로 하는 활동을 소개해주세요."
                        enableImageUpload={false}
                        description="동아리의 핵심 활동을 보기 쉽게 정리해보세요."
                        required
                    />

                    {/* 태그 */}
                    <RHFTextField<ClubRegisterFormValues>
                        id="tags"
                        name="tags"
                        label="태그"
                        placeholder="태그를 입력하세요 (예: 개발, 디자인)"
                        description="여러 태그는 쉼표(,)로 구분해주세요"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        회원 관리
                    </CardTitle>
                    <CardDescription>동아리 회원과 관련된 설정을 관리합니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 회장 이름 */}
                    <RHFTextField<ClubRegisterFormValues>
                        id="presidentName"
                        name="presidentName"
                        label="회장 이름"
                        type="text"
                        placeholder="회장님의 이름을 입력하세요"
                        required
                    />

                    {/* 회장 연락처 */}
                    <RHFTextField<ClubRegisterFormValues>
                        id="presidentContact"
                        name="presidentContact"
                        label="회장 연락처"
                        type="tel"
                        placeholder="010-0000-0000"
                        required
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        활동 정보
                    </CardTitle>
                    <CardDescription>동아리 활동 관련 정보입니다</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 모집 시작일 */}
                        <RHFDatePicker<ClubRegisterFormValues>
                            id="recruitmentStartDate"
                            name="recruitmentStartDate"
                            label="모집 시작일"
                        />

                        {/* 모집 마감일 */}
                        <RHFDatePicker<ClubRegisterFormValues>
                            id="recruitmentEndDate"
                            name="recruitmentEndDate"
                            label="모집 마감일"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        연락처 정보
                    </CardTitle>
                    <CardDescription>동아리 연락처 정보를 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <label className="text-base font-medium">SNS</label>
                        <div className="space-y-3">
                            {/* Instagram */}
                            <RHFTextField<ClubRegisterFormValues>
                                id="instagram"
                                name="instagram"
                                label="Instagram"
                                type="text"
                                placeholder="@username 또는 전체 URL"
                            />

                            {/* YouTube */}
                            <RHFTextField<ClubRegisterFormValues>
                                id="youtube"
                                name="youtube"
                                label="YouTube"
                                type="text"
                                placeholder="채널명 또는 전체 URL"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-6">
                <LoadingButton
                    type="submit"
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white"
                    loading={isSubmitting}
                    loadingText="등록 중...">
                    동아리 등록
                </LoadingButton>
            </div>
        </FormRoot>
    );
}
