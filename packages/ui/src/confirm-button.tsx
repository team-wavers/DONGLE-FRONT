"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog";

interface ConfirmButtonProps {
    triggerText: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    confirmText?: React.ReactNode;
    cancelText?: React.ReactNode;
    loadingText?: React.ReactNode;
    onConfirm: () => Promise<void> | void;
    triggerVariant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
    confirmVariant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
    triggerClassName?: string;
    disabled?: boolean;
}

export function ConfirmButton({
    triggerText,
    title,
    description,
    confirmText = "확인",
    cancelText = "취소",
    loadingText = "처리 중...",
    onConfirm,
    triggerVariant = "outline",
    confirmVariant = "destructive",
    triggerClassName,
    disabled = false,
}: ConfirmButtonProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleConfirm = () => {
        startTransition(async () => {
            await onConfirm();
            setOpen(false);
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={triggerVariant} className={triggerClassName} disabled={disabled}>
                    {triggerText}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>
                <DialogFooter>
                    <Button size="lg" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        {cancelText}
                    </Button>
                    <Button size="lg" variant={confirmVariant} onClick={handleConfirm} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {loadingText}
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
