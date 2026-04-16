import { FormField } from "@/components/atoms/form/form-field/form-field";
import { FileUpload } from "@/components/atoms/form/file-upload/file-upload";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dongle/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Tag } from "lucide-react";
import { Club } from "@dongle/types/club/club.d";
import { RECRUITMENT_STATUS, RECRUITMENT_STATUS_LABEL } from "@/feature/club/constants/club.constants";

interface ClubBasicInfoProps {
    club?: Club;
    values?: {
        clubName: string;
        recruitmentStatus: string;
        category: string;
        location: string;
        iconUrls: string[];
    };
    onClubNameChange?: (value: string) => void;
    onRecruitmentStatusChange?: (value: string) => void;
    onCategoryChange?: (value: string) => void;
    onLocationChange?: (value: string) => void;
    onIconUrlRemove?: (url: string) => void;
    onReplaceExistingIconUrls?: () => void;
    fieldErrors?: {
        clubName?: string;
        recruitmentStatus?: string;
        category?: string;
        location?: string;
        icon?: string;
    };
}

export function ClubBasicInfo({
    club,
    values,
    onClubNameChange,
    onRecruitmentStatusChange,
    onCategoryChange,
    onLocationChange,
    onIconUrlRemove,
    onReplaceExistingIconUrls,
    fieldErrors,
}: ClubBasicInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="w-5 h-5 text-primary" />
                    동아리 정보
                </CardTitle>
                <CardDescription>동아리의 기본적인 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    id="clubName"
                    label="동아리 이름"
                    type="text"
                    name="clubName"
                    placeholder="동아리 이름을 입력하세요"
                    required
                    error={fieldErrors?.clubName}
                    defaultValue={values ? undefined : club?.name}
                    value={values?.clubName}
                    onChange={(event) => onClubNameChange?.(event.target.value)}
                />

                {/* 모집여부 */}
                <div className="space-y-2">
                    <label className="text-base font-bold">
                        모집여부 <span className="text-red-500">*</span>
                    </label>
                    <Select
                        defaultValue={
                            values ? undefined : club?.is_recruiting ? RECRUITMENT_STATUS.RECRUITING : RECRUITMENT_STATUS.CLOSED
                        }
                        value={values?.recruitmentStatus}
                        onValueChange={onRecruitmentStatusChange}
                        name="recruitmentStatus">
                        <SelectTrigger>
                            <SelectValue placeholder="모집 상태를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={RECRUITMENT_STATUS.RECRUITING}>
                                {RECRUITMENT_STATUS_LABEL.RECRUITING}
                            </SelectItem>
                            <SelectItem value={RECRUITMENT_STATUS.CLOSED}>{RECRUITMENT_STATUS_LABEL.CLOSED}</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        모집 여부가 {RECRUITMENT_STATUS_LABEL.RECRUITING}일 때만 모집기간을 설정할 수 있습니다
                    </p>
                    {fieldErrors?.recruitmentStatus && (
                        <p className="text-base text-red-500">{fieldErrors.recruitmentStatus}</p>
                    )}
                </div>

                {/* 분과 */}
                <div className="space-y-2">
                    <label className="text-base font-bold">
                        분과 <span className="text-red-500">*</span>
                    </label>
                    <Select
                        name="category"
                        defaultValue={values ? undefined : club?.category}
                        value={values?.category}
                        onValueChange={onCategoryChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="분과를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="학술분과">학술분과</SelectItem>
                            <SelectItem value="문예분과">문예분과</SelectItem>
                            <SelectItem value="체육분과">체육분과</SelectItem>
                            <SelectItem value="봉사분과">봉사분과</SelectItem>
                            <SelectItem value="종교분과">종교분과</SelectItem>
                            <SelectItem value="음악분과">음악분과</SelectItem>
                        </SelectContent>
                    </Select>
                    {fieldErrors?.category && <p className="text-xs text-red-500">{fieldErrors.category}</p>}
                </div>

                {/* 동아리방 정보 */}
                <FormField
                    id="location"
                    label="동아리방 정보"
                    type="text"
                    name="location"
                    placeholder="예: 학생회관 3층 301호"
                    required
                    defaultValue={values ? undefined : club?.location}
                    value={values?.location}
                    onChange={(event) => onLocationChange?.(event.target.value)}
                    error={fieldErrors?.location}
                />

                {/* 동아리 아이콘 업로드 */}
                <FileUpload
                    name="icon"
                    label="동아리 아이콘"
                    description="동아리를 대표하는 아이콘 이미지를 업로드하세요"
                    defaultValue={values?.iconUrls ?? (club?.icon_url ? [club.icon_url] : [])}
                    fileType="image"
                    maxSize={5}
                    maxFiles={1}
                    selectionMode="replace"
                    error={fieldErrors?.icon}
                    onUrlRemove={onIconUrlRemove}
                    onReplaceExistingUrls={onReplaceExistingIconUrls}
                />
            </CardContent>
        </Card>
    );
}
