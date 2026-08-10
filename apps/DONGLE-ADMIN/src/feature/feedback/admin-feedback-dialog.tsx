"use client";

import { useState } from "react";
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
import { Copy, MessageCircleQuestion } from "lucide-react";
import { toast } from "sonner";
import { FormSelect } from "@/shared/ui/form/form-select/form-select";
import { FormTextarea } from "@/shared/ui/form/form-textarea/form-textarea";
import {
    ADMIN_FEEDBACK_CATEGORIES,
    ADMIN_FEEDBACK_RECIPIENT,
    buildAdminFeedbackMailto,
    validateAdminFeedback,
    type AdminFeedbackCategory,
    type AdminFeedbackRole,
} from "./admin-feedback-mail";

interface AdminFeedbackDialogProps {
    role: AdminFeedbackRole;
    clubId?: string;
}

export default function AdminFeedbackDialog({ role, clubId }: AdminFeedbackDialogProps) {
    const [category, setCategory] = useState<AdminFeedbackCategory | "">("");
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState<{ category?: string; content?: string }>({});

    const handleOpenMail = () => {
        const nextErrors = validateAdminFeedback({ category, content });
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0 || !category) return;

        window.location.href = buildAdminFeedbackMailto({
            category,
            content,
            pageUrl: window.location.href,
            role,
            clubId,
        });
    };

    const handleCopyEmail = () => {
        void navigator.clipboard.writeText(ADMIN_FEEDBACK_RECIPIENT).then(
            () => toast.success("문의 이메일 주소를 복사했습니다."),
            () => toast.error("이메일 주소를 복사하지 못했습니다.")
        );
    };

    return (
        <Dialog>
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
                        동글 어드민에서 발생한 오류나 불편한 점, 필요한 기능을 알려주세요.
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
                            setCategory(value as AdminFeedbackCategory);
                            setErrors((current) => ({ ...current, category: undefined }));
                        }}
                        error={errors.category}
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
                    />
                    <div className="rounded-md bg-zinc-50 p-3 text-xs leading-5 text-muted-foreground">
                        <p>현재 화면과 사용자 유형이 메일 본문에 자동으로 포함됩니다.</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                            <span>메일 앱이 열리지 않으면 {ADMIN_FEEDBACK_RECIPIENT}으로 보내주세요.</span>
                            <button
                                type="button"
                                onClick={handleCopyEmail}
                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                            >
                                <Copy className="size-3" /> 주소 복사
                            </button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" onClick={handleOpenMail}>
                        메일로 문의하기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
