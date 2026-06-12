"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { LoadingButton } from "@/shared/ui/feedback/button/loading-button/loading-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@dongle/ui/dialog";
import { Button } from "@dongle/ui/button";
import { useRouter } from "next/navigation";
import { deleteReportAction } from "@/feature/report/action/delete-report-form.action";

export default function DeleteReportButton({
  clubId,
  reportId,
  redirectHref,
}: {
  clubId: string;
  reportId: string;
  redirectHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    setOpen(nextOpen);
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteReportAction(Number(clubId), Number(reportId));

        if (result.success) {
          toast.success("활동 보고서가 성공적으로 삭제되었습니다.");
          setOpen(false);
          router.push(redirectHref);
          router.refresh();
        } else {
          toast.error(result.error ?? "보고서 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("보고서 삭제 실패:", error);
        toast.error("삭제 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          삭제하기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            보고서 삭제
          </DialogTitle>
          <DialogDescription className="text-left">
            이 활동보고서를 삭제하시겠습니까?
            <br />
            <span className="font-semibold text-red-600">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            취소
          </Button>
          <LoadingButton
            onClick={handleDelete}
            variant="destructive"
            loading={isPending}
            loadingText="삭제 중..."
            className="bg-red-500 hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제하기
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
