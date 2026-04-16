import { FormDatePicker } from "@/components/atoms/form/form-datepicker/form-datepicker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Calendar } from "lucide-react";
import { Club } from "@dongle/types/club/club.d";
import dayjs from "dayjs";

interface ClubActivityInfoProps {
    club?: Club;
    values?: {
        recruitmentStartDate?: Date;
        recruitmentEndDate?: Date;
    };
    onRecruitmentStartDateChange?: (date: Date | undefined) => void;
    onRecruitmentEndDateChange?: (date: Date | undefined) => void;
    fieldErrors?: {
        recruitmentStartDate?: string;
        recruitmentEndDate?: string;
    };
}

export function ClubActivityInfo({
    club,
    values,
    onRecruitmentStartDateChange,
    onRecruitmentEndDateChange,
    fieldErrors,
}: ClubActivityInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    활동 정보
                </CardTitle>
                <CardDescription>동아리 활동 관련 정보입니다</CardDescription>
            </CardHeader>
            <CardContent>
                {/* 모집 기간 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormDatePicker
                        id="recruitmentStartDate"
                        label="모집 시작일"
                        error={fieldErrors?.recruitmentStartDate}
                        defaultValue={values ? undefined : club?.recruit_start ? dayjs(club.recruit_start).toDate() : undefined}
                        value={values?.recruitmentStartDate}
                        onSelect={onRecruitmentStartDateChange}
                    />
                    <FormDatePicker
                        id="recruitmentEndDate"
                        label="모집 마감일"
                        error={fieldErrors?.recruitmentEndDate}
                        defaultValue={values ? undefined : club?.recruit_end ? dayjs(club.recruit_end).toDate() : undefined}
                        value={values?.recruitmentEndDate}
                        onSelect={onRecruitmentEndDateChange}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
