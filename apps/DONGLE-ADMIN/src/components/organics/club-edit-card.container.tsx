"use client";

import { Card, CardHeader, CardTitle } from "@dongle/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@dongle/ui/dialog";
import { Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@dongle/ui/button";
import CategoryBadge from "@/components/atoms/category-badge/category-badge";
import { Club } from "@dongle/types/club/club.d";
import { useClubEdit } from "@/feature/club/hooks/use-club-edit";
import { useRouter } from "next/navigation";

export default function ClubEditCardContainer({ club }: { club: Club }) {
    const router = useRouter();
    const { isDeleteModalOpen, isDeleting, handleShowDeleteConfirm, handleCloseDeleteModal, handleDelete } =
        useClubEdit(club);

    const handleCardClick = () => {
        router.push(`/admin/club/${club.id}`);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/admin/club/${club.id}`);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleShowDeleteConfirm();
    };

    return (
        <>
            <Card
                className="hover:shadow-lg transition-shadow duration-300  w-full cursor-pointer"
                onClick={handleCardClick}>
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 flex flex-col gap-2">
                            <CardTitle className="text-xl font-bold text-zinc-900 truncate">{club.name}</CardTitle>
                            {club.tags.length > 0 && (
                                <p className="text-sm text-zinc-500 truncate">{club.tags.join(", ")}</p>
                            )}
                            <CategoryBadge category={club.category} />
                        </div>
                        <div
                            className="flex flex-wrap items-center gap-2 shrink-0"
                            onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="outline"
                                onClick={handleEditClick}
                                className="flex items-center gap-1 shrink-0">
                                <Edit className="w-4 h-4" />
                                수정
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDeleteClick}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                                disabled={isDeleting}>
                                <Trash2 className="w-4 h-4" />
                                삭제
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* 삭제 확인 모달 */}
            <Dialog open={isDeleteModalOpen} onOpenChange={handleCloseDeleteModal}>
                <DialogContent className="w-full max-w-md">
                    <DialogHeader className="space-y-2">
                        <DialogTitle>동아리 삭제</DialogTitle>
                        <DialogDescription>
                            <span className="font-semibold text-foreground">{club.name}</span> 동아리를
                            삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDeleteModal} disabled={isDeleting}>
                            취소
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    삭제 중...
                                </>
                            ) : (
                                "삭제"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
