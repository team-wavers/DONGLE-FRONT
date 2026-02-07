import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Club } from "@dongle/types/club/club.d";
import { deleteClubAction } from "@/feature/club/action/club-form.action";

export function useClubEdit(club: Club) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleShowDeleteConfirm = () => setIsDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteClubAction(club.id);

        if (result.success) {
          toast.success("동아리가 성공적으로 삭제되었습니다.");
          setIsDeleteModalOpen(false);
          router.refresh();
        } else {
          toast.error(result.error ?? "동아리 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("동아리 삭제 중 오류:", error);
        toast.error("동아리 삭제 중 오류가 발생했습니다.");
      }
    });
  };

  return {
    isDeleteModalOpen,
    isDeleting: isPending,
    handleShowDeleteConfirm,
    handleCloseDeleteModal,
    handleDelete,
  };
}
