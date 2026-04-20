import { FormField } from "@/components/atoms/form/form-field/form-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { Users } from "lucide-react";
import { Club } from "@dongle/types/club/club.d";

interface ClubMemberManagementProps {
    club?: Club;
    values?: {
        presidentName: string;
        presidentContact: string;
    };
    onPresidentNameChange?: (value: string) => void;
    onPresidentContactChange?: (value: string) => void;
    fieldErrors?: {
        presidentName?: string;
        presidentContact?: string;
    };
    isRequired?: boolean;
}

export function ClubMemberManagement({
    club,
    values,
    onPresidentNameChange,
    onPresidentContactChange,
    fieldErrors,
    isRequired = true,
}: ClubMemberManagementProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    회장 정보 관리
                </CardTitle>
                <CardDescription>동아리 회장의 정보를 관리합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 회장 이름 */}
                <FormField
                    id="presidentName"
                    label="회장 이름"
                    type="text"
                    name="presidentName"
                    placeholder="회장님의 이름을 입력하세요"
                    required={isRequired}
                    error={fieldErrors?.presidentName}
                    defaultValue={values ? undefined : club?.president?.name}
                    value={values?.presidentName}
                    onChange={(event) => onPresidentNameChange?.(event.target.value)}
                />

                {/* 회장 연락처 */}
                <FormField
                    id="presidentContact"
                    label="회장 연락처"
                    type="tel"
                    name="presidentContact"
                    placeholder="010-0000-0000"
                    required={isRequired}
                    error={fieldErrors?.presidentContact}
                    defaultValue={values ? undefined : club?.president?.phone}
                    value={values?.presidentContact}
                    onChange={(event) => onPresidentContactChange?.(event.target.value)}
                />
            </CardContent>
        </Card>
    );
}
