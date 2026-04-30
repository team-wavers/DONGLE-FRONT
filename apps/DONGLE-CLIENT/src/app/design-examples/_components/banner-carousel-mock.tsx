import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type BannerCarouselMockProps = {
    label: string;
    title: string;
    description: string;
    icon: LucideIcon;
    tone: string;
    dark?: boolean;
};

export function BannerCarouselMock({ label, title, description, icon: Icon, tone, dark = false }: BannerCarouselMockProps) {
    return (
        <section
            className={
                dark
                    ? "relative overflow-hidden rounded-lg bg-zinc-950 p-5 text-white md:p-7"
                    : "relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-5 md:p-7"
            }
            aria-label="상단 배너 캐러셀 시안">
            <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-center">
                <div className="relative z-10">
                    <p className={dark ? "text-sm font-bold text-emerald-300" : "text-sm font-bold text-emerald-600"}>{label}</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-normal md:text-5xl">{title}</h2>
                    <p className={dark ? "mt-4 max-w-xl text-base leading-7 text-zinc-300" : "mt-4 max-w-xl text-base leading-7 text-zinc-600"}>
                        {description}
                    </p>
                    <div className="mt-6 flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="이전 배너"
                            className={
                                dark
                                    ? "flex size-9 items-center justify-center rounded-md border border-white/15 bg-white/10"
                                    : "flex size-9 items-center justify-center rounded-md border border-zinc-200 bg-white"
                            }>
                            <ChevronLeft className="size-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="다음 배너"
                            className={
                                dark
                                    ? "flex size-9 items-center justify-center rounded-md border border-white/15 bg-white/10"
                                    : "flex size-9 items-center justify-center rounded-md border border-zinc-200 bg-white"
                            }>
                            <ChevronRight className="size-4" />
                        </button>
                        <div className="ml-2 flex items-center gap-1.5">
                            <span className={dark ? "h-2 w-6 rounded-full bg-white" : "h-2 w-6 rounded-full bg-zinc-950"} />
                            <span className={dark ? "size-2 rounded-full bg-white/35" : "size-2 rounded-full bg-zinc-300"} />
                            <span className={dark ? "size-2 rounded-full bg-white/35" : "size-2 rounded-full bg-zinc-300"} />
                        </div>
                    </div>
                </div>
                <div
                    className={
                        dark
                            ? "relative z-10 min-h-56 rounded-lg border border-white/10 bg-white/10 p-5"
                            : "relative z-10 min-h-56 rounded-lg border border-white bg-white p-5 shadow-sm"
                    }>
                    <div className={`flex size-14 items-center justify-center rounded-lg ${tone}`}>
                        <Icon className="size-7" />
                    </div>
                    <div className={dark ? "mt-8 h-3 w-36 rounded-full bg-white/70" : "mt-8 h-3 w-36 rounded-full bg-zinc-900"} />
                    <div className={dark ? "mt-3 h-3 w-56 rounded-full bg-white/25" : "mt-3 h-3 w-56 rounded-full bg-zinc-200"} />
                    <div className={dark ? "mt-2 h-3 w-44 rounded-full bg-white/25" : "mt-2 h-3 w-44 rounded-full bg-zinc-200"} />
                    <div className="mt-8 grid grid-cols-3 gap-2">
                        <div className={dark ? "h-16 rounded-md bg-white/10" : "h-16 rounded-md bg-zinc-100"} />
                        <div className={dark ? "h-16 rounded-md bg-white/10" : "h-16 rounded-md bg-zinc-100"} />
                        <div className={dark ? "h-16 rounded-md bg-white/10" : "h-16 rounded-md bg-zinc-100"} />
                    </div>
                </div>
            </div>
        </section>
    );
}
