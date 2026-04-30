import { BookOpen, Dumbbell, GalleryHorizontal, HandHeart, ListFilter, Mic2, Palette, Search, SlidersHorizontal } from "lucide-react";
import { BannerCarouselMock } from "../_components/banner-carousel-mock";
import { ExampleShell, RecruitingPill } from "../_components/example-shell";
import { categorySummaries, exampleClubs } from "../_components/example-data";

const categoryStyleMap = {
    체육분과: {
        icon: Dumbbell,
        tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
        badge: "bg-emerald-500 text-white",
    },
    음악분과: {
        icon: Mic2,
        tone: "bg-sky-50 text-sky-700 border-sky-100",
        badge: "bg-sky-500 text-white",
    },
    문예분과: {
        icon: Palette,
        tone: "bg-rose-50 text-rose-700 border-rose-100",
        badge: "bg-rose-500 text-white",
    },
    봉사분과: {
        icon: HandHeart,
        tone: "bg-teal-50 text-teal-700 border-teal-100",
        badge: "bg-teal-500 text-white",
    },
    학술분과: {
        icon: BookOpen,
        tone: "bg-amber-50 text-amber-800 border-amber-100",
        badge: "bg-amber-500 text-white",
    },
} as const;

export default function FinderDeckDesignExamplePage() {
    return (
        <ExampleShell
            eyebrow="Concept 06"
            title="Finder Deck"
            description="배너 이후 바로 검색과 추천 덱을 이어 붙여 첫 화면에서 탐색 행동을 완성하는 고밀도 시안입니다.">
            <div className="space-y-8">
                <BannerCarouselMock
                    label="모집 시즌"
                    title="내 관심사에 맞는 동아리만 빠르게"
                    description="배너가 끝나도 검색과 필터가 바로 이어져 사용자가 스크롤 없이 다음 행동을 정할 수 있습니다."
                    icon={GalleryHorizontal}
                    tone="bg-lime-400 text-zinc-950"
                />

                <section className="grid gap-4 md:grid-cols-[280px_1fr]">
                    <aside className="rounded-lg border border-zinc-200 bg-white p-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-zinc-950">
                            <SlidersHorizontal className="size-4" />
                            탐색 조건
                        </div>
                        <div className="mt-5 space-y-5">
                            <div>
                                <p className="mb-2 text-sm font-bold text-zinc-400">모집여부</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {["전체", "모집중"].map((label, index) => (
                                        <span
                                            key={label}
                                            className={
                                                index === 1
                                                    ? "rounded-md bg-zinc-950 px-3 py-2 text-center text-sm font-bold text-white"
                                                    : "rounded-md bg-zinc-100 px-3 py-2 text-center text-sm font-bold text-zinc-500"
                                            }>
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-bold text-zinc-400">분과</p>
                                <div className="flex flex-wrap gap-2">
                                    {categorySummaries.slice(0, 4).map((category) => {
                                        const categoryStyle = categoryStyleMap[category.name as keyof typeof categoryStyleMap];
                                        const CategoryIcon = categoryStyle?.icon;

                                        return (
                                            <span
                                                key={category.name}
                                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold ${categoryStyle?.tone ?? category.tone}`}>
                                                {CategoryIcon ? <CategoryIcon className="size-3.5" /> : null}
                                                {category.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="space-y-4">
                        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:flex-row md:items-center">
                            <div className="flex h-11 flex-1 items-center gap-3 rounded-md bg-zinc-100 px-4">
                                <Search className="size-5 text-zinc-400" />
                                <span className="text-sm font-bold text-zinc-400">활동 키워드 검색</span>
                            </div>
                            <div className="flex h-11 items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-bold text-white">
                                <ListFilter className="size-4" />
                                추천순
                            </div>
                        </div>
                        <div className="grid gap-3">
                            {exampleClubs.slice(0, 5).map((club) => {
                                const Icon = club.icon;
                                const categoryStyle = categoryStyleMap[club.category as keyof typeof categoryStyleMap];
                                const CategoryIcon = categoryStyle?.icon;

                                return (
                                    <article key={club.id} className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
                                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-md ${club.softAccent}`}>
                                            <Icon className="size-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-bold text-zinc-950">{club.name}</h3>
                                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                {CategoryIcon ? (
                                                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${categoryStyle.badge}`}>
                                                        <CategoryIcon className="size-3" />
                                                        {club.category}
                                                    </span>
                                                ) : null}
                                                {club.tags.map((tag) => (
                                                    <span key={`${club.id}-${tag}`} className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <RecruitingPill isRecruiting={club.isRecruiting} />
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                </section>
            </div>
        </ExampleShell>
    );
}
