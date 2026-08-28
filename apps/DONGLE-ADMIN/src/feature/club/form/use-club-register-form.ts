"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useActionFormSubmit } from "@/shared/form/use-action-form-submit";
import { submitClubRegisterAction } from "./club-register.action";
import {
  CLUB_REGISTER_DEFAULT_VALUES,
  clubRegisterSchema,
  type ClubRegisterFormValues,
} from "@/feature/club/form/club-register.schema";

export type ClubRegisterFormData = ClubRegisterFormValues;

export function useClubRegisterForm(registrationKey: string) {
  const router = useRouter();
  const form = useForm<ClubRegisterFormValues>({
    resolver: zodResolver(clubRegisterSchema),
    defaultValues: CLUB_REGISTER_DEFAULT_VALUES,
    mode: "onSubmit",
  });
  const submit = useActionFormSubmit({
    form,
    invalidMessage: "모든 항목을 작성해주세요.",
    action: (values) => submitClubRegisterAction(registrationKey, values),
    onSuccess: ({ result }) => {
      toast.success(result.message ?? "동아리 등록이 성공적으로 완료되었습니다!");
      router.replace(result.redirectTo ?? "/club-register/register-success");
    },
  });

  return {
    form,
    onSubmit: submit.onSubmit,
    onInvalid: submit.onInvalid,
    isSubmitting: submit.isSubmitting || form.formState.isSubmitting,
  };
}
