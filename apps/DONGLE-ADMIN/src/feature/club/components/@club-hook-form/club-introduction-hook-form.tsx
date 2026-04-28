import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { RichTextEditor } from "@/components/atoms/form/rich-text-editor/rich-text-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Tag } from "lucide-react";
import { ClubRegisterFormData } from "@/feature/club/hooks/use-club-register-form";

interface ClubIntroductionHookFormProps {
    register: UseFormRegister<ClubRegisterFormData>;
    setValue: UseFormSetValue<ClubRegisterFormData>;
    watch: UseFormWatch<ClubRegisterFormData>;
    errors: FieldErrors<ClubRegisterFormData>;
}

export function ClubIntroductionHookForm({ register, setValue, watch, errors }: ClubIntroductionHookFormProps) {
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
                <input type="hidden" {...register("description")} />
                <RichTextEditor
                    label="동아리 설명"
                    id="description"
                    name="description"
                    placeholder="동아리에 대한 자세한 설명을 입력해주세요."
                    value={watch("description")}
                    onChange={(value) => setValue("description", value, { shouldDirty: true, shouldValidate: true })}
                    enableImageUpload={false}
                    description="굵게, 기울임, 제목, 목록, 링크 서식을 사용할 수 있습니다."
                    required
                    error={errors.description?.message}
                />

                {/* 주요 활동 */}
                <input type="hidden" {...register("main_activities")} />
                <RichTextEditor
                    label="주요 활동"
                    id="main_activities"
                    name="main_activities"
                    placeholder="동아리에서 주로 하는 활동을 소개해주세요."
                    value={watch("main_activities")}
                    onChange={(value) =>
                        setValue("main_activities", value, { shouldDirty: true, shouldValidate: true })
                    }
                    enableImageUpload={false}
                    description="동아리의 핵심 활동을 보기 쉽게 정리해보세요."
                    required
                    error={errors.main_activities?.message}
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
