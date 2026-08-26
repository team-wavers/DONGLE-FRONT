"use server";

import { createFeedbackService } from "@dongle/service/feedback/feedback.service";
import type { FeedbackCategory, FeedbackIssueData } from "@dongle/types/feedback/feedback";
import {
    actionFailure,
    actionSuccess,
    getActionErrorMessage,
    getServiceErrorMessage,
    requireServerActionAccessToken,
    type ActionResult,
} from "@/shared/action";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { validateAdminFeedback } from "./admin-feedback-form";

interface SubmitAdminFeedbackInput {
    category: FeedbackCategory | "";
    content: string;
    pageUrl: string;
}

export async function submitAdminFeedbackAction(
    input: SubmitAdminFeedbackInput
): Promise<ActionResult<"category" | "content", FeedbackIssueData>> {
    const errors = validateAdminFeedback(input);

    if (Object.keys(errors).length > 0) {
        return actionFailure({
            fieldErrors: errors,
            formError: "문의 내용을 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const result = await createFeedbackService({
            category: input.category as FeedbackCategory,
            content: input.content,
            pageUrl: input.pageUrl,
        });

        if (!result.isSuccess) {
            if (result.error.status === 401) {
                return actionFailure({
                    formError: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
                    sessionExpired: true,
                });
            }

            return actionFailure({
                formError: getServiceErrorMessage(result.error, "문의 등록에 실패했습니다. 다시 시도해주세요."),
            });
        }

        return actionSuccess({
            data: result.result,
            message: "문의가 이슈로 등록되었습니다.",
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return actionFailure({
                formError: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
                sessionExpired: true,
            });
        }

        captureServerException(error, "관리자 피드백 등록 중 오류", {
            action: "submitAdminFeedbackAction",
        });

        return actionFailure({
            formError: getActionErrorMessage(error, "문의 등록 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}
