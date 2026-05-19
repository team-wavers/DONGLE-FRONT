"use client";

import { useMemo, useState } from "react";
import { Button } from "@dongle/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@dongle/ui/card";
import { Input } from "@dongle/ui/input";
import { Label } from "@dongle/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@dongle/ui/select";
import { FormTextarea } from "@/components/atoms/form/form-textarea/form-textarea";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import type { UpdateClubScheduleRequest } from "@dongle/types/club/club.schedule";
import { formatDateTimeForInput } from "@dongle/utils";
import {
    createClubScheduleAction,
    deleteClubScheduleAction,
    updateClubScheduleAction,
} from "../action/schedule.action";
import type { ClubSchedule, ScheduleType } from "../schedule.types";
import { SCHEDULE_TYPE_LABELS } from "../schedule.types";
import {
    buildClubSchedulePayload,
    formatScheduleDateTime,
    mapClubScheduleToClubSchedule,
    sortSchedulesByStartAt,
} from "../schedule.utils";
import { ScheduleIsPublicBadge, ScheduleTypeBadge } from "./schedule-badges";

interface ClubScheduleManagerProps {
    clubId: string;
    initialSchedules: ClubSchedule[];
}

type StatusFilter = "all" | "public" | "private" | "upcoming" | "past";

type ScheduleFormState = Pick<
    ClubSchedule,
    "title" | "type" | "startsAt" | "endsAt" | "location" | "description" | "isPublic" | "externalUrl"
>;

const emptyForm: ScheduleFormState = {
    title: "",
    type: "event",
    startsAt: "",
    endsAt: "",
    location: "",
    description: "",
    isPublic: true,
    externalUrl: "",
};

export default function ClubScheduleManager({ clubId, initialSchedules }: ClubScheduleManagerProps) {
    const [schedules, setSchedules] = useState(initialSchedules);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ScheduleFormState>(emptyForm);
    const [pendingAction, setPendingAction] = useState<"save" | "delete" | null>(null);

    const now = useMemo(() => new Date(), []);
    const clubIdNumber = Number(clubId);
    const filteredSchedules = useMemo(() => {
        const filtered = schedules.filter((schedule) => {
            if (statusFilter === "upcoming") {
                return new Date(schedule.startsAt) >= now;
            }
            if (statusFilter === "past") {
                return new Date(schedule.startsAt) < now;
            }
            if (statusFilter === "public") return schedule.isPublic;
            if (statusFilter === "private") return !schedule.isPublic;
            return true;
        });

        return sortSchedulesByStartAt(filtered);
    }, [now, schedules, statusFilter]);

    const updateForm = <K extends keyof ScheduleFormState>(key: K, value: ScheduleFormState[K]) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const startCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    const startEdit = (schedule: ClubSchedule) => {
        setEditingId(schedule.id);
        setForm({
            title: schedule.title,
            type: schedule.type,
            startsAt: formatDateTimeForInput(schedule.startsAt),
            endsAt: formatDateTimeForInput(schedule.endsAt),
            location: schedule.location,
            description: schedule.description,
            isPublic: schedule.isPublic,
            externalUrl: schedule.externalUrl ?? "",
        });
    };

    const saveSchedule = async () => {
        if (!form.title?.trim() || !form.startsAt || !form.endsAt) {
            return;
        }

        const payload = buildClubSchedulePayload(form);

        setPendingAction("save");

        if (editingId) {
            const result = await updateClubScheduleAction(clubIdNumber, editingId, payload as UpdateClubScheduleRequest);
            setPendingAction(null);

            if (!result.success || !result.result) {
                window.alert(result.error ?? "일정 수정 중 오류가 발생했습니다. 다시 시도해주세요.");
                return;
            }

            const updatedSchedule = mapClubScheduleToClubSchedule(result.result);
            setSchedules((current) =>
                current.map((schedule) => (schedule.id === updatedSchedule.id ? updatedSchedule : schedule))
            );
        } else {
            const result = await createClubScheduleAction(clubIdNumber, payload);
            setPendingAction(null);

            if (!result.success || !result.result) {
                window.alert(result.error ?? "일정 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
                return;
            }

            const createdSchedule = mapClubScheduleToClubSchedule(result.result);
            setSchedules((current) => [...current, createdSchedule]);
        }

        setEditingId(null);
        setForm(emptyForm);
    };

    const deleteSchedule = async (id: number) => {
        setPendingAction("delete");
        const result = await deleteClubScheduleAction(clubIdNumber, id);
        setPendingAction(null);

        if (!result.success) {
            window.alert(result.error ?? "일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        setSchedules((current) => current.filter((schedule) => schedule.id !== id));
        if (editingId === id) {
            startCreate();
        }
    };

    return (
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">일정 관리</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            공개 일정은 사용자 동아리 상세에 노출됩니다.
                        </p>
                    </div>
                    <Button onClick={startCreate} className="h-11 font-semibold">
                        <CalendarPlus className="h-4 w-4" />
                        일정 등록
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {(
                        [
                            ["all", "전체"],
                            ["public", "공개"],
                            ["private", "비공개"],
                            ["upcoming", "다가오는 일정"],
                            ["past", "지난 일정"],
                        ] as [StatusFilter, string][]
                    ).map(([value, label]) => (
                        <Button
                            key={value}
                            type="button"
                            variant={statusFilter === value ? "default" : "outline"}
                            onClick={() => setStatusFilter(value)}
                            className="h-9 rounded-full">
                            {label}
                        </Button>
                    ))}
                </div>

                <div className="grid gap-3">
                    {filteredSchedules.length === 0 ? (
                        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                            조건에 맞는 일정이 없습니다.
                        </div>
                    ) : (
                        filteredSchedules.map((schedule) => (
                            <Card key={schedule.id} className="rounded-lg">
                                <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <ScheduleTypeBadge type={schedule.type} />
                                            <ScheduleIsPublicBadge isPublic={schedule.isPublic} />
                                        </div>
                                        <h2 className="mt-3 truncate text-lg font-bold">{schedule.title}</h2>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {formatScheduleDateTime(schedule.startsAt)} -{" "}
                                            {formatScheduleDateTime(schedule.endsAt)}
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-600">{schedule.location || "장소 미정"}</p>
                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600">
                                            {schedule.description || "설명이 없습니다."}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 md:flex-col">
                                        <Button variant="outline" size="sm" onClick={() => startEdit(schedule)}>
                                            <Pencil className="h-4 w-4" />
                                            수정
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pendingAction === "delete"}
                                            onClick={() => deleteSchedule(schedule.id)}>
                                            <Trash2 className="h-4 w-4" />
                                            삭제
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <Card className="rounded-lg">
                <CardHeader>
                    <CardTitle className="text-lg">{editingId ? "일정 수정" : "일정 등록"}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="schedule-title">일정 제목 *</Label>
                        <Input
                            id="schedule-title"
                            value={form.title}
                            onChange={(event) => updateForm("title", event.target.value)}
                            placeholder="신입 부원 오리엔테이션"
                            className="h-11 rounded-xl"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                        <div className="flex flex-col gap-2">
                            <Label>일정 유형 *</Label>
                            <Select value={form.type} onValueChange={(value) => updateForm("type", value as ScheduleType)}>
                                <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                                    <SelectValue placeholder="유형 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(SCHEDULE_TYPE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>공개 여부 *</Label>
                            <Select
                                value={form.isPublic ? "true" : "false"}
                                onValueChange={(value) => updateForm("isPublic", value === "true")}>
                                <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                                    <SelectValue placeholder="공개 여부" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">공개</SelectItem>
                                    <SelectItem value="false">비공개</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="schedule-starts-at">시작일시 *</Label>
                            <Input
                                id="schedule-starts-at"
                                type="datetime-local"
                                value={form.startsAt}
                                onChange={(event) => updateForm("startsAt", event.target.value)}
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="schedule-ends-at">종료일시 *</Label>
                            <Input
                                id="schedule-ends-at"
                                type="datetime-local"
                                value={form.endsAt}
                                onChange={(event) => updateForm("endsAt", event.target.value)}
                                className="h-11 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="schedule-location">장소</Label>
                        <Input
                            id="schedule-location"
                            value={form.location}
                            onChange={(event) => updateForm("location", event.target.value)}
                            placeholder="학생회관 302호"
                            className="h-11 rounded-xl"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="schedule-description">설명</Label>
                        <FormTextarea
                            id="schedule-description"
                            value={form.description}
                            onChange={(event) => updateForm("description", event.target.value)}
                            placeholder="사용자에게 보여줄 일정 설명을 입력하세요."
                            className="min-h-28 rounded-xl"
                            rows={4}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="schedule-external-url">외부 링크</Label>
                        <Input
                            id="schedule-external-url"
                            value={form.externalUrl}
                            onChange={(event) => updateForm("externalUrl", event.target.value)}
                            placeholder="https://example.com"
                            className="h-11 rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" onClick={startCreate}>
                            취소
                        </Button>
                        <Button
                            type="button"
                            onClick={saveSchedule}
                            disabled={!form.title.trim() || !form.startsAt || !form.endsAt || pendingAction === "save"}>
                            {pendingAction === "save" ? "저장 중" : editingId ? "수정" : "등록"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
