"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { clubRegisterFormAction } from "@/feature/club/action/club-form.action";
import { hasMeaningfulRichText } from "@/feature/club/validation/club-form.validation";

// 폼 스키마 정의
const clubRegisterSchema = z.object({
  clubName: z.string().min(1, "동아리 이름을 입력해주세요"),
  category: z.string().min(1, "분과를 선택해주세요"),
  recruitmentStatus: z.string().min(1, "모집여부를 선택해주세요"),
  location: z.string().min(1, "동아리 방 정보를 입력해주세요"),
  description: z.string().refine(hasMeaningfulRichText, { message: "동아리 설명을 입력해주세요" }),
  main_activities: z.string().refine(hasMeaningfulRichText, { message: "주요 활동을 입력해주세요" }),
  presidentName: z.string().min(1, "회장 이름을 입력해주세요"),
  presidentContact: z
    .string()
    .min(1, "회장 연락처를 입력해주세요")
    .regex(
      /^01[0-9]-?\d{3,4}-?\d{4}$/,
      "올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)"
    ),
  recruitmentStartDate: z.string(),
  recruitmentEndDate: z.string(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  tags: z.string().optional(),
});

export type ClubRegisterFormData = z.infer<typeof clubRegisterSchema>;

export function useClubRegisterForm(registrationKey: string) {
  const router = useRouter();

  const form = useForm<ClubRegisterFormData>({
    resolver: zodResolver(clubRegisterSchema),
    defaultValues: {
      clubName: "",
      category: "",
      recruitmentStatus: "",
      location: "",
      description: "",
      main_activities: "",
      presidentName: "",
      presidentContact: "",
      recruitmentStartDate: "",
      recruitmentEndDate: "",
      instagram: "",
      youtube: "",
      tags: "",
    },
  });

  const onSubmit = async (data: ClubRegisterFormData) => {
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("registrationKey", registrationKey);
      formData.append("clubName", data.clubName);
      formData.append("category", data.category);
      formData.append("recruitmentStatus", data.recruitmentStatus);
      formData.append("location", data.location);
      formData.append("description", data.description);
      formData.append("main_activities", data.main_activities);
      formData.append("presidentName", data.presidentName);
      formData.append("presidentContact", data.presidentContact);

      if (data.recruitmentStartDate) {
        formData.append("recruitmentStartDate", data.recruitmentStartDate);
      }
      if (data.recruitmentEndDate) {
        formData.append("recruitmentEndDate", data.recruitmentEndDate);
      }
      if (data.instagram) {
        formData.append("instagram", data.instagram);
      }
      if (data.youtube) {
        formData.append("youtube", data.youtube);
      }
      if (data.tags) {
        // 쉼표로 구분된 태그 문자열을 배열로 변환
        const tagsArray = data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);

        tagsArray.forEach((tag) => formData.append("tags", tag));
      }

      // Server Action 호출
      const result = await clubRegisterFormAction({}, formData);
      if (result.success && result.tempId && result.tempPassword) {
        // 성공 페이지로 데이터와 함께 이동
        const successData = {
          tempId: result.tempId,
          tempPassword: result.tempPassword,
          clubName: result.clubName,
        };
        const encoded = encodeURIComponent(JSON.stringify(successData));
        router.push(`/club-register/register-success?data=${encoded}`);
      } else if (result.success) {
        toast.success("동아리 등록이 성공적으로 완료되었습니다!");
        router.replace("/club-register/register-success");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch {
      toast.error("동아리 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const onInvalid = () => {
    toast.error("모든 항목을 작성해주세요.");
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit, onInvalid),
    isSubmitting: form.formState.isSubmitting,
  };
}
