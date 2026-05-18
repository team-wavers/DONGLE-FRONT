"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@dongle/ui/button";
import { Trash2 } from "lucide-react";
import { deleteClubAction } from "@/feature/club/action/delete-club.action";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@dongle/ui/dialog";

interface ClubDeleteButtonProps {
    clubId: number;
    clubName: string;
}

export default function ClubDeleteButton({ clubId, clubName }: ClubDeleteButtonProps) {
    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const result = await deleteClubAction(clubId);
                if (!result.success) {
                    toast.error(result.error ?? "동아리 삭제에 실패했습니다.");
                    return;
                }

                toast.success("동아리가 성공적으로 삭제되었습니다.");
                setIsDeleteModalOpen(false);
                router.push("/admin/club");
                router.refresh();
            } catch {
                toast.error("동아리 삭제 중 오류가 발생했습니다.");
            }
        });
    };

    return (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <Button type="button" variant="destructive" onClick={() => setIsDeleteModalOpen(true)} disabled={isPending}>
                <Trash2 className="w-4 h-4 mr-2" />
                동아리 삭제
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>동아리 삭제 확인</DialogTitle>
                    <DialogDescription>
                        <strong>{clubName}</strong> 동아리를 정말 삭제하시겠습니까?
                        <br />
                        <span className="text-red-600 text-sm mt-2 block">⚠️ 이 작업은 되돌릴 수 없습니다.</span>
                        <span className="text-sm mt-2 block">
                            회장 정보(사용자 계정)는 함께 삭제되지 않습니다. 사용자 관리에서 별도로 삭제해주세요.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isPending}>
                        취소
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
                        {isPending ? "삭제 중..." : "삭제"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
