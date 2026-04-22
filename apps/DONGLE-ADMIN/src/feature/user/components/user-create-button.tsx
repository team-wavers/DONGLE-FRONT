"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@dongle/ui/button";
import { UserPlus } from "lucide-react";
import UserCreateForm from "@/feature/user/components/user-create-form";

export default function UserCreateButton() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleSuccess = useCallback(() => {
        router.refresh();
    }, [router]);

    return (
        <>
            <Button type="button" onClick={() => setIsOpen(true)} className="font-semibold flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                관리자 생성
            </Button>
            {isOpen && (
                <UserCreateForm
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}
