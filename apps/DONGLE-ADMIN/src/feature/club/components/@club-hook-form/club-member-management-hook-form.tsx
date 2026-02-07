import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dongle/ui/card";
import { Users } from "lucide-react";
import { ClubRegisterFormData } from "@/feature/club/hooks/use-club-register-form";

interface ClubMemberManagementHookFormProps {
  register: UseFormRegister<ClubRegisterFormData>;
  errors: FieldErrors<ClubRegisterFormData>;
}

export function ClubMemberManagementHookForm({
  register,
  errors,
}: ClubMemberManagementHookFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          회원 관리
        </CardTitle>
        <CardDescription>
          동아리 회원과 관련된 설정을 관리합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 회장 이름 */}
        <FormField
          id="presidentName"
          label="회장 이름"
          type="text"
          placeholder="회장님의 이름을 입력하세요"
          required
          error={errors.presidentName?.message}
          {...register("presidentName")}
        />

        {/* 회장 연락처 */}
        <FormField
          id="presidentContact"
          label="회장 연락처"
          type="tel"
          placeholder="010-0000-0000"
          required
          error={errors.presidentContact?.message}
          {...register("presidentContact")}
        />
      </CardContent>
    </Card>
  );
}
