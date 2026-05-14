"use client";

import type { SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Users } from "lucide-react";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { FormRoot, RHFTextField } from "@/shared/form";
import type { ClubPresidentFormValues } from "@/feature/club/form/club-president.schema";

interface ClubPresidentEditFormProps {
    form: UseFormReturn<ClubPresidentFormValues>;
    onSubmit: SubmitHandler<ClubPresidentFormValues>;
    onInvalid: SubmitErrorHandler<ClubPresidentFormValues>;
    formError?: string;
    isPending: boolean;
    didRestoreDraft: boolean;
}

export function ClubPresidentEditForm({
    form,
    onSubmit,
    onInvalid,
    formError,
    isPending,
    didRestoreDraft,
}: ClubPresidentEditFormProps) {
    return (
        <FormRoot form={form} onSubmit={onSubmit} onInvalid={onInvalid} formError={formError} className="flex flex-col gap-4">
            {didRestoreDraft ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    임시 저장된 회장 정보를 복구했습니다.
                </div>
            ) : null}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        회장 정보 관리
                    </CardTitle>
                    <CardDescription>동아리 회장의 정보를 관리합니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RHFTextField<ClubPresidentFormValues>
                        id="presidentName"
                        name="presidentName"
                        label="회장 이름"
                        type="text"
                        placeholder="회장님의 이름을 입력하세요"
                        required
                    />
                    <RHFTextField<ClubPresidentFormValues>
                        id="presidentContact"
                        name="presidentContact"
                        label="회장 연락처"
                        type="tel"
                        placeholder="010-0000-0000"
                        required
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4 items-center">
                <LoadingButton type="submit" loading={isPending} loadingText="수정 중..." className="min-w-32">
                    회장 정보 수정
                </LoadingButton>
            </div>
        </FormRoot>
    );
}
