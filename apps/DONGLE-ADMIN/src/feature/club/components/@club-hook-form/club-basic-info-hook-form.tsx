import {
  UseFormRegister,
  Control,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
import { FormField } from "@/components/atoms/form/form-field/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@dongle/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dongle/ui/card";
import { Tag } from "lucide-react";
import { ClubRegisterFormData } from "@/feature/club/hooks/use-club-register-form";

interface ClubBasicInfoHookFormProps {
  register: UseFormRegister<ClubRegisterFormData>;
  control: Control<ClubRegisterFormData>;
  setValue: UseFormSetValue<ClubRegisterFormData>;
  watch: UseFormWatch<ClubRegisterFormData>;
  errors: FieldErrors<ClubRegisterFormData>;
}

export function ClubBasicInfoHookForm({
  register,
  setValue,
  watch,
  errors,
}: ClubBasicInfoHookFormProps) {
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
          placeholder="동아리 이름을 입력하세요"
          required
          error={errors.clubName?.message}
          {...register("clubName")}
        />

        {/* 모집여부 */}
        <div className="space-y-2">
          <label className="text-base font-bold">
            모집여부 <span className="text-red-500">*</span>
          </label>
          <Select
            value={watch("recruitmentStatus")}
            onValueChange={(value) => setValue("recruitmentStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="모집 상태를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="모집중">모집중</SelectItem>
              <SelectItem value="모집마감">모집마감</SelectItem>
            </SelectContent>
          </Select>
          {errors.recruitmentStatus && (
            <p className="text-red-500 text-xs  ">
              {errors.recruitmentStatus.message}
            </p>
          )}
        </div>

        {/* 분과 */}
        <div className="space-y-2">
          <label className="text-base font-bold">
            분과 <span className="text-red-500">*</span>
          </label>
          <Select
            value={watch("category")}
            onValueChange={(value) => setValue("category", value)}
          >
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
          {errors.category && (
            <p className="text-xs text-red-500">{errors.category.message}</p>
          )}
        </div>

        {/* 동아리방 정보 */}
        <FormField
          id="location"
          label="동아리방 정보"
          type="text"
          placeholder="예: 학생회관 3층 301호"
          required
          error={errors.location?.message}
          {...register("location")}
        />
      </CardContent>
    </Card>
  );
}
