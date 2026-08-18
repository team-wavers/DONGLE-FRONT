import FetchInstance from "@dongle/api/instance";
import type { CreateFeedbackRequest } from "@dongle/types/feedback/feedback";
import type { CreateFeedbackResponse } from "@dongle/types/feedback/feedback.response";

const instance = FetchInstance.getInstance();

const FEEDBACK_PATH = "/feedback";

export async function createFeedbackService(payload: CreateFeedbackRequest): Promise<CreateFeedbackResponse> {
    return instance.post<CreateFeedbackResponse>(FEEDBACK_PATH, payload);
}
