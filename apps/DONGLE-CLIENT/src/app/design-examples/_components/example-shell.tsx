import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ExampleShellProps = {
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
};

export function ExampleShell({ eyebrow, title, description, children }: ExampleShellProps) {
    return (
        <section className="py-10 md:py-14">
            <div className="mb-8 flex flex-col gap-5">
                <Link
                    href="/design-examples"
                    className="inline-flex w-fit items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
                    <ArrowLeft className="size-4" />
                    시안 목록
                </Link>
                <div className="space-y-2">
                    <p className="text-sm font-bold text-zinc-400">{eyebrow}</p>
                    <h1 className="text-3xl font-bold tracking-normal text-zinc-950 md:text-4xl">{title}</h1>
                    <p className="max-w-2xl text-base leading-7 text-zinc-500">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

export function RecruitingPill({ isRecruiting }: { isRecruiting: boolean }) {
    return (
        <span
            className={
                isRecruiting
                    ? "inline-flex h-8 items-center rounded-md bg-emerald-500 px-3 text-sm font-bold text-white"
                    : "inline-flex h-8 items-center rounded-md bg-zinc-100 px-3 text-sm font-bold text-zinc-500"
            }>
            {isRecruiting ? "모집중" : "모집마감"}
        </span>
    );
}
