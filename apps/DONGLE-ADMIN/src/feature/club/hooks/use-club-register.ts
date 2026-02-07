"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { clubRegisterFormAction } from "@/feature/club/action/club-form.action";

interface ClubRegisterState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    clubName?: string;
    recruitmentStatus?: string;
    department?: string;
    description?: string;
    main_activities?: string;
    recruitmentStartDate?: string;
    recruitmentEndDate?: string;
  };
}

export function useClubRegister() {
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: ClubRegisterState,
      formData: FormData
    ): Promise<ClubRegisterState> => {
      const result = await clubRegisterFormAction(prevState, formData);

      if (result.success) {
        toast.success("동아리가 성공적으로 등록되었습니다!");
      } else if (result.error) {
        toast.error(result.error);
      }

      return result;
    },
    {
      success: false,
      error: undefined,
      fieldErrors: undefined,
    }
  );

  return {
    submitForm: formAction,
    isPending,
    state,
  };
}
