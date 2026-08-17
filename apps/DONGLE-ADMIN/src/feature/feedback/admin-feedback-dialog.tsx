"use client";

import { useState, useTransition } from "react";
import { Button } from "@dongle/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@dongle/ui/dialog";
import { MessageCircleQuestion } from "lucide-react";
import { toast } from "sonner";
import type { FeedbackCategory } from "@dongle/types/feedback/feedback";
import { FormSelect } from "@/shared/ui/form/form-select/form-select";
import { FormTextarea } from "@/shared/ui/form/form-textarea/form-textarea";
import { submitAdminFeedbackAction } from "./admin-feedback.action";
import { ADMIN_FEEDBACK_CATEGORIES, validateAdminFeedback } from "./admin-feedback-form";

interface AdminFeedbackDialogProps {
    role: "admin" | "president";
    clubId?: string;
}

export default function AdminFeedbackDialog({ role }: AdminFeedbackDialogProps) {
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState<FeedbackCategory | "">("");
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState<{ category?: string; content?: string }>({});
    const [isPending, startTransition] = useTransition();

    const roleLabel = role === "admin" ? "관리자" : "동아리 회장";

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isPending) return;
        setOpen(nextOpen);
        if (!nextOpen) {
            setCategory("");
            setContent("");
            setErrors({});
        }
    };

    const handleSubmit = () => {
        const nextErrors = validateAdminFeedback({ category, content });
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        startTransition(async () => {
            try {
                const result = await submitAdminFeedbackAction({
                    category,
                    content,
                    pageUrl: window.location.href,
                });

                if (!result.ok) {
                    if (result.fieldErrors) setErrors(result.fieldErrors);
                    toast.error(result.formError ?? "문의 등록에 실패했습니다.");
                    return;
                }

                toast.success(result.message ?? "문의가 등록되었습니다.");
                handleOpenChange(false);
            } catch {
                toast.error("문의 등록 중 오류가 발생했습니다.");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-auto w-full justify-start px-3 py-2.5 text-left">
                    <MessageCircleQuestion className="size-4 shrink-0 text-primary" />
                    <span className="flex flex-col items-start">
                        <span className="font-semibold">버그·개선 제안</span>
                        <span className="text-xs font-normal text-muted-foreground">불편한 점을 알려주세요</span>
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>버그 및 개선사항 제안</DialogTitle>
                    <DialogDescription>
                        동글 어드민에서 발생한 오류나 불편한 점, 필요한 기능을 알려주세요. {roleLabel} 계정과 현재 화면
                        정보가 자동으로 포함됩니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <FormSelect
                        id="admin-feedback-category"
                        label="문의 유형"
                        required
                        placeholder="문의 유형을 선택해주세요"
                        options={ADMIN_FEEDBACK_CATEGORIES.map(({ value, label }) => ({ value, label }))}
                        value={category}
                        onValueChange={(value) => {
                            setCategory(value as FeedbackCategory);
                            setErrors((current) => ({ ...current, category: undefined }));
                        }}
                        error={errors.category}
                        disabled={isPending}
                    />
                    <FormTextarea
                        id="admin-feedback-content"
                        label="문의 내용"
                        required
                        rows={6}
                        placeholder="어떤 작업을 하던 중이었는지와 발생한 문제를 적어주세요."
                        value={content}
                        onChange={(event) => {
                            setContent(event.target.value);
                            setErrors((current) => ({ ...current, content: undefined }));
                        }}
                        error={errors.content}
                        disabled={isPending}
                    />
                </div>

                <DialogFooter>
                    <Button type="button" onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "등록 중..." : "이슈로 등록하기"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
