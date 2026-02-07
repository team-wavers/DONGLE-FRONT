import { UseFormRegister, Control, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { FormDatePicker } from "@/components/atoms/form/form-datepicker/form-datepicker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Calendar } from "lucide-react";
import { ClubRegisterFormData } from "@/feature/club/hooks/use-club-register-form";

interface ClubActivityInfoHookFormProps {
    register: UseFormRegister<ClubRegisterFormData>;
    control: Control<ClubRegisterFormData>;
    setValue: UseFormSetValue<ClubRegisterFormData>;
    watch: UseFormWatch<ClubRegisterFormData>;
    errors: FieldErrors<ClubRegisterFormData>;
}

export function ClubActivityInfoHookForm({ setValue, watch, errors }: ClubActivityInfoHookFormProps) {
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
                        error={errors.recruitmentStartDate?.message}
                        value={watch("recruitmentStartDate") ? new Date(watch("recruitmentStartDate")!) : undefined}
                        onSelect={(date) => {
                            if (date) {
                                setValue("recruitmentStartDate", date.toISOString().split("T")[0]);
                            } else {
                                setValue("recruitmentStartDate", "");
                            }
                        }}
                    />
                    <FormDatePicker
                        id="recruitmentEndDate"
                        label="모집 마감일"
                        error={errors.recruitmentEndDate?.message}
                        value={watch("recruitmentEndDate") ? new Date(watch("recruitmentEndDate")!) : undefined}
                        onSelect={(date) => {
                            if (date) {
                                setValue("recruitmentEndDate", date.toISOString().split("T")[0]);
                            } else {
                                setValue("recruitmentEndDate", "");
                            }
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
