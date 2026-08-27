// feedback.d.ts
export type FeedbackCategory = "bug" | "inconvenience" | "feature" | "other";

export interface CreateFeedbackRequest {
  category: FeedbackCategory;
  content: string;
  pageUrl: string;
}

export interface FeedbackIssueData {
  issueUrl: string;
  issueNumber: number;
}
