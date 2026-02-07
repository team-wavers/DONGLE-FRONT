import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormTextarea } from "@/components/atoms/form/form-textarea/form-textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Tag } from "lucide-react";
import { ClubRegisterFormData } from "@/feature/club/hooks/use-club-register-form";

interface ClubIntroductionHookFormProps {
    register: UseFormRegister<ClubRegisterFormData>;
    errors: FieldErrors<ClubRegisterFormData>;
}

export function ClubIntroductionHookForm({ register, errors }: ClubIntroductionHookFormProps) {
    return (
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
                <FormTextarea
                    label="동아리 설명"
                    id="description"
                    rows={8}
                    placeholder="동아리에 대한 자세한 설명을 입력해주세요."
                    required
                    error={errors.description?.message}
                    {...register("description")}
                />

                {/* 주요 활동 */}
                <FormTextarea
                    label="주요 활동"
                    id="main_activities"
                    rows={8}
                    placeholder="동아리에서 주로 하는 활동을 소개해주세요."
                    required
                    error={errors.main_activities?.message}
                    {...register("main_activities")}
                />

                {/* 태그 */}
                <div className="flex flex-col gap-2">
                    <label className="text-base font-semibold">태그</label>
                    <div className="space-y-2">
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="태그를 입력하세요 (예: 개발, 디자인)"
                            {...register("tags")}
                        />
                        <p className="text-sm text-gray-500">여러 태그는 쉼표(,)로 구분해주세요</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
