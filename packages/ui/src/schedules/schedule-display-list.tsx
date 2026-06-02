import * as React from "react";
import { Clock, ExternalLink, MapPin } from "lucide-react";
import { cn } from "../utils";
import type { ScheduleDisplayItem, ScheduleDisplayMonthGroup, ScheduleDisplayType } from "./schedule-display";

export type { ScheduleDisplayDateBadge, ScheduleDisplayItem, ScheduleDisplayMonthGroup, ScheduleDisplayType } from "./schedule-display";

interface ScheduleDisplayMonthListProps<TPayload = unknown> {
    groups: ScheduleDisplayMonthGroup<TPayload>[];
    showPublicBadge?: boolean;
    showClubMeta?: boolean;
    ariaLabel?: string;
    className?: string;
    renderActions?: (item: ScheduleDisplayItem<TPayload>) => React.ReactNode;
    renderGroupFooter?: (group: ScheduleDisplayMonthGroup<TPayload>) => React.ReactNode;
    onExternalLinkClick?: (item: ScheduleDisplayItem<TPayload>) => void;
}

interface ScheduleDisplaySectionProps<TPayload = unknown> {
    title: string;
    items: ScheduleDisplayItem<TPayload>[];
    showPublicBadge?: boolean;
    showClubMeta?: boolean;
    variant?: "default" | "active";
    className?: string;
    renderActions?: (item: ScheduleDisplayItem<TPayload>) => React.ReactNode;
    onExternalLinkClick?: (item: ScheduleDisplayItem<TPayload>) => void;
}

interface ScheduleDisplayItemContentProps<TPayload = unknown> {
    item: ScheduleDisplayItem<TPayload>;
    showPublicBadge?: boolean;
    showClubMeta?: boolean;
    actions?: React.ReactNode;
    showDateMarker?: boolean;
    onExternalLinkClick?: (item: ScheduleDisplayItem<TPayload>) => void;
}

const scheduleTypeClassNames: Record<ScheduleDisplayType, string> = {
    recruitment: "border-violet-200 bg-violet-50 text-violet-700",
    event: "border-sky-200 bg-sky-50 text-sky-700",
    regular_meeting: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const scheduleAccentClassNames: Record<ScheduleDisplayType, string> = {
    recruitment: "border-l-violet-300",
    event: "border-l-sky-300",
    regular_meeting: "border-l-emerald-300",
};

const scheduleDateMarkerClassNames: Record<ScheduleDisplayType, string> = {
    recruitment: "border-violet-100 bg-violet-50 text-violet-700",
    event: "border-sky-100 bg-sky-50 text-sky-700",
    regular_meeting: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

function ScheduleTypeBadge({ type, label }: { type: ScheduleDisplayType; label: string }) {
    return (
        <span
            className={cn(
                "inline-flex h-5 shrink-0 items-center rounded border px-1.5 text-[11px] font-bold leading-none",
                scheduleTypeClassNames[type]
            )}>
            {label}
        </span>
    );
}

function SchedulePublicBadge({ isPublic }: { isPublic: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex h-5 shrink-0 items-center rounded border px-1.5 text-[11px] font-bold leading-none",
                isPublic ? "border-blue-200 bg-blue-50 text-blue-700" : "border-zinc-200 bg-zinc-100 text-zinc-600"
            )}>
            {isPublic ? "공개" : "비공개"}
        </span>
    );
}

function ScheduleDateMarker({ item }: { item: ScheduleDisplayItem }) {
    return (
        <time
            dateTime={item.dateBadge.dateTime}
            className={cn(
                "flex h-[3.25rem] w-[3.25rem] shrink-0 flex-col items-center justify-center rounded-md border text-center",
                scheduleDateMarkerClassNames[item.type]
            )}>
            <span className="text-[10px] font-extrabold leading-none">{item.dateBadge.month}</span>
            <span className="mt-0.5 text-xl font-black leading-none text-foreground">{item.dateBadge.day}</span>
            {item.dateBadge.weekday ? (
                <span className="mt-0.5 text-[10px] font-bold leading-none text-muted-foreground">
                    {item.dateBadge.weekday}
                </span>
            ) : null}
        </time>
    );
}

export function ScheduleDisplayItemContent<TPayload = unknown>({
    item,
    showPublicBadge = false,
    showClubMeta = false,
    actions,
    showDateMarker = !showClubMeta,
    onExternalLinkClick,
}: ScheduleDisplayItemContentProps<TPayload>) {
    return (
        <article className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
            <div className="flex min-w-0 gap-3">
                {showDateMarker ? <ScheduleDateMarker item={item} /> : null}
                <div className="min-w-0 flex-1">
                    {showClubMeta ? (
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-extrabold text-zinc-950">
                                {item.clubName || "동아리명 없음"}
                            </span>
                            {item.category ? (
                                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-600">
                                    {item.category}
                                </span>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <ScheduleTypeBadge type={item.type} label={item.typeLabel} />
                        {showPublicBadge && typeof item.isPublic === "boolean" ? (
                            <SchedulePublicBadge isPublic={item.isPublic} />
                        ) : null}
                        <span className="inline-flex min-w-0 items-center gap-1 text-sm font-semibold text-zinc-500">
                            <Clock className="size-4 shrink-0" aria-hidden="true" />
                            {item.compactDateTimeLabel ? (
                                <>
                                    <span className="hidden truncate sm:inline">{item.dateTimeLabel}</span>
                                    <span className="truncate sm:hidden">{item.compactDateTimeLabel}</span>
                                </>
                            ) : (
                                <span className="truncate">{item.dateTimeLabel}</span>
                            )}
                        </span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold leading-7 text-zinc-950">{item.title}</h3>

                    {item.locationLabel ? (
                        <p className="mt-1.5 flex min-w-0 items-center gap-1 text-sm font-semibold text-zinc-600">
                            <MapPin className="size-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.locationLabel}</span>
                        </p>
                    ) : null}

                    {item.descriptionLabel ? (
                        <p className="mt-2 line-clamp-1 text-sm leading-6 text-zinc-700">{item.descriptionLabel}</p>
                    ) : null}

                    {item.externalUrl ? (
                        <a
                            href={item.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => onExternalLinkClick?.(item)}
                            className="mt-3 inline-flex h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-50">
                            <ExternalLink className="size-4" aria-hidden="true" />
                            자세히 보기
                        </a>
                    ) : null}
                </div>
            </div>

            {actions ? <div className="flex items-center gap-2 justify-self-start md:justify-self-end">{actions}</div> : null}
        </article>
    );
}

function ScheduleDisplayDateGroupedItems<TPayload = unknown>({
    items,
    showPublicBadge = false,
    showClubMeta = false,
    renderActions,
    onExternalLinkClick,
}: {
    items: ScheduleDisplayItem<TPayload>[];
    showPublicBadge?: boolean;
    showClubMeta?: boolean;
    renderActions?: (item: ScheduleDisplayItem<TPayload>) => React.ReactNode;
    onExternalLinkClick?: (item: ScheduleDisplayItem<TPayload>) => void;
}) {
    return (
        <ol className="divide-y divide-zinc-100">
            {items.map((item) => (
                <li
                    key={item.id}
                    className={cn(
                        "border-l-2 px-4 py-4 transition-colors hover:bg-muted/40",
                        scheduleAccentClassNames[item.type]
                    )}>
                    <ScheduleDisplayItemContent
                        item={item}
                        showPublicBadge={showPublicBadge}
                        showClubMeta={showClubMeta}
                        actions={renderActions?.(item)}
                        onExternalLinkClick={onExternalLinkClick}
                    />
                </li>
            ))}
        </ol>
    );
}

export function ScheduleDisplaySection<TPayload = unknown>({
    title,
    items,
    showPublicBadge = false,
    showClubMeta = false,
    variant = "default",
    className,
    renderActions,
    onExternalLinkClick,
}: ScheduleDisplaySectionProps<TPayload>) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section
            aria-label={title}
            className={cn(
                "overflow-hidden rounded-lg border bg-card text-card-foreground",
                variant === "active" && "border-zinc-200",
                className
            )}>
            <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/60 px-4 py-3">
                <div className="flex min-w-0 items-center">
                    <h2 className="truncate text-sm font-extrabold text-foreground">{title}</h2>
                </div>
                <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-xs font-extrabold text-muted-foreground">
                    {items.length}개
                </span>
            </div>
            <ScheduleDisplayDateGroupedItems
                items={items}
                showPublicBadge={showPublicBadge}
                showClubMeta={showClubMeta}
                renderActions={renderActions}
                onExternalLinkClick={onExternalLinkClick}
            />
        </section>
    );
}

export function ScheduleDisplayMonthList<TPayload = unknown>({
    groups,
    showPublicBadge = false,
    showClubMeta = false,
    ariaLabel = "월별 일정",
    className,
    renderActions,
    renderGroupFooter,
    onExternalLinkClick,
}: ScheduleDisplayMonthListProps<TPayload>) {
    if (groups.length === 0) {
        return null;
    }

    return (
        <div aria-label={ariaLabel} className={cn("overflow-hidden rounded-lg border bg-card text-card-foreground", className)}>
            {groups.map((group) => {
                return (
                    <section key={group.key}>
                        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/60 px-4 py-3">
                            <div className="flex min-w-0 items-center">
                                <h2 className="truncate text-sm font-extrabold text-foreground">{group.label}</h2>
                            </div>
                            <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-xs font-extrabold text-muted-foreground">
                                {group.items.length}개
                            </span>
                        </div>
                        <ScheduleDisplayDateGroupedItems
                            items={group.items}
                            showPublicBadge={showPublicBadge}
                            showClubMeta={showClubMeta}
                            renderActions={renderActions}
                            onExternalLinkClick={onExternalLinkClick}
                        />
                        {renderGroupFooter ? renderGroupFooter(group) : null}
                    </section>
                );
            })}
        </div>
    );
}
