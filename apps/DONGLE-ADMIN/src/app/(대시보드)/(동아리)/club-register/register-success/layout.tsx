import { Suspense } from "react";
import { Skeleton } from "@dongle/ui/skeleton";

export default function RegisterSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col justify-between items-center min-h-screen">
      <Suspense
        fallback={
          <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-12 w-32 mx-auto" />
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
