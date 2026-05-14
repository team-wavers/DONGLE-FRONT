"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CLUB_REGISTER_DEFAULT_VALUES,
  clubRegisterSchema,
  type ClubRegisterFormValues,
} from "@/feature/club/form/club-register.schema";
import { useClubRegisterSubmit } from "@/feature/club/form/use-club-register-submit";

export type ClubRegisterFormData = ClubRegisterFormValues;

export function useClubRegisterForm(registrationKey: string) {
  const form = useForm<ClubRegisterFormValues>({
    resolver: zodResolver(clubRegisterSchema),
    defaultValues: CLUB_REGISTER_DEFAULT_VALUES,
    mode: "onSubmit",
  });
  const submit = useClubRegisterSubmit(registrationKey, form);

  return {
    form,
    onSubmit: submit.onSubmit,
    onInvalid: submit.onInvalid,
    formError: submit.formError,
    isSubmitting: submit.isSubmitting || form.formState.isSubmitting,
  };
}
