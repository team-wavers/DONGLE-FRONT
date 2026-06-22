"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@dongle/ui/button";
import type { ClubReport } from "@dongle/types/club/club.report.d";
import SearchInput from "@/shared/ui/navigation/search-input/search-input";
import ReportCard from "@/feature/report/components/report-card/report-card";

interface FilterableReportListProps {
    reports: ClubReport[];
    clubId: string;
    loadFailed?: boolean;
}

export function normalizeReportKeyword(value: string) {
    return value.trim().toLowerCase();
}

export function matchesReport(report: ClubReport, keyword: string) {
    if (!keyword) {
        return true;
    }

    const searchableText = [report.title, report.content].filter(Boolean).join(" ").toLowerCase();

    return searchableText.includes(keyword);
}

export function filterReportsByKeyword(reports: ClubReport[], keyword: string) {
    return reports.filter((report) => matchesReport(report, keyword));
}

export default function FilterableReportList({ reports, clubId, loadFailed = false }: FilterableReportListProps) {
    const [inputValue, setInputValue] = useState("");

    const deferredKeyword = useDeferredValue(normalizeReportKeyword(inputValue));
    const filteredReports = useMemo(() => filterReportsByKeyword(reports, deferredKeyword), [reports, deferredKeyword]);

    if (loadFailed) {
        return (
            <div className="flex min-h-40 items-center justify-center rounded-lg border bg-white py-16">
                <div className="text-red-500">활동보고서를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                    총 <span className="font-semibold text-blue-600">{reports.length}</span>
                    개의 활동보고서
                </div>
                <Button asChild className="font-semibold">
                    <Link href="./create">
                        <Pencil className="h-4 w-4" />
                        작성하기
                    </Link>
                </Button>
            </div>

            {reports.length > 0 ? <SearchInput value={inputValue} onChange={setInputValue} placeholder="제목, 내용 검색" /> : null}

            {reports.length === 0 ? (
                <div className="flex min-h-40 items-center justify-center rounded-lg border bg-white py-16">
                    <div className="text-gray-500">활동보고서가 없습니다.</div>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">검색 결과가 없습니다.</div>
            ) : (
                <div className="overflow-hidden rounded-lg border bg-white">
                    {filteredReports.map((report) => (
                        <ReportCard
                            key={report.id}
                            title={report.title}
                            createdDate={report.createdAt}
                            content={report.content}
                            href={`/${clubId}/report/${report.id}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
