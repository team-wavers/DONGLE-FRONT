"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@dongle/ui/card";
import CategoryBadge from "@/components/atoms/category-badge/category-badge";
import { Club } from "@dongle/types/club/club.d";

export default function ReportCardContainer({ club }: { club: Club }) {
  return (
    <Link href={`/admin/report/${club.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-300 min-w-sm w-full flex flex-row gap-2 justify-between cursor-pointer">
        <CardHeader className="flex-1 flex flex-col gap-3">
          <CardTitle className="text-xl font-bold text-zinc-900">
            {club.name}
          </CardTitle>
          {club.tags.length > 0 && (
            <span className="text-sm text-zinc-500">
              {" "}
              {club.tags.join(", ")}{" "}
            </span>
          )}
          <CategoryBadge category={club.category} />
        </CardHeader>
      </Card>
    </Link>
  );
}
