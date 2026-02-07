import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dongle/ui/card";
import { Mail } from "lucide-react";
import { ClubRegisterFormData } from "@/feature/club/hooks/use-club-register-form";

interface ClubContactInfoHookFormProps {
  register: UseFormRegister<ClubRegisterFormData>;
  errors: FieldErrors<ClubRegisterFormData>;
}

export function ClubContactInfoHookForm({
  register,
  errors,
}: ClubContactInfoHookFormProps) {
  return (
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
            <FormField
              id="instagram"
              label="Instagram"
              type="text"
              placeholder="@username 또는 전체 URL"
              error={errors.instagram?.message}
              {...register("instagram")}
            />
            <FormField
              id="youtube"
              label="YouTube"
              type="text"
              placeholder="채널명 또는 전체 URL"
              error={errors.youtube?.message}
              {...register("youtube")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
