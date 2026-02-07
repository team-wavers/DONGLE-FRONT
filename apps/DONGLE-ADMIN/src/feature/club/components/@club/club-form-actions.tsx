"use client";

import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";

export interface ClubFormActionsProps {
  isPending?: boolean;
  buttonText?: string;
  loadingText?: string;
}

export function ClubFormActions({
  isPending = false,
  buttonText = "제출",
  loadingText = "처리 중...",
}: ClubFormActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <LoadingButton
        type="submit"
        loading={isPending}
        loadingText={loadingText}
        className="min-w-32"
      >
        {buttonText}
      </LoadingButton>
    </div>
  );
}
