import Link from "next/link";
import { ArrowRight, GalleryHorizontal, Grid2X2, Layers3, LayoutDashboard, Moon, Newspaper, Sparkles } from "lucide-react";

const examples = [
    {
        href: "/design-examples/magazine",
        title: "Magazine Discovery",
        description: "탐색형 메인과 히어로 상세를 결합한 가장 추천하는 방향",
        icon: Newspaper,
        tone: "bg-emerald-50 text-emerald-700",
    },
    {
        href: "/design-examples/app-store",
        title: "App Store Cards",
        description: "아이콘 중심 카드로 빠르게 비교하고 선택하는 방향",
        icon: Grid2X2,
        tone: "bg-sky-50 text-sky-700",
    },
    {
        href: "/design-examples/campus-board",
        title: "Campus Board",
        description: "분과별 탐색과 모집 현황을 더 강하게 보여주는 방향",
        icon: LayoutDashboard,
        tone: "bg-rose-50 text-rose-700",
    },
    {
        href: "/design-examples/carousel-bento",
        title: "Carousel Bento",
        description: "상단 배너 캐러셀 아래에 bento 탐색 블록을 배치하는 방향",
        icon: GalleryHorizontal,
        tone: "bg-teal-50 text-teal-700",
    },
    {
        href: "/design-examples/curated-stories",
        title: "Curated Stories",
        description: "배너를 에디토리얼 큐레이션처럼 쓰고 활동 스토리를 강조하는 방향",
        icon: Sparkles,
        tone: "bg-amber-50 text-amber-800",
    },
    {
        href: "/design-examples/finder-deck",
        title: "Finder Deck",
        description: "배너 이후 검색, 필터, 추천 덱을 한 화면에 압축하는 방향",
        icon: Layers3,
        tone: "bg-lime-50 text-lime-800",
    },
    {
        href: "/design-examples/night-spotlight",
        title: "Night Spotlight",
        description: "어두운 배너 영역과 밝은 콘텐츠 영역을 대비시키는 프리미엄 방향",
        icon: Moon,
        tone: "bg-zinc-100 text-zinc-800",
    },
];

export default function DesignExamplesPage() {
    return (
        <section className="py-12 md:py-16">
            <div className="mb-8 space-y-3">
                <p className="text-sm font-bold text-zinc-400">DONGLE redesign routes</p>
                <h1 className="text-3xl font-bold text-zinc-950 md:text-4xl">동아리 목록/상세 디자인 시안</h1>
                <p className="max-w-2xl text-base leading-7 text-zinc-500">
                    실제 사용자 라우트와 분리해서 볼 수 있는 정적 예제 페이지입니다. 각 시안은 목록과 상세의
                    방향성을 한 화면 안에서 비교할 수 있게 구성했습니다.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {examples.map((example) => {
                    const Icon = example.icon;

                    return (
                        <Link
                            key={example.href}
                            href={example.href}
                            className="group rounded-lg border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md">
                            <div className={`mb-5 flex size-11 items-center justify-center rounded-md ${example.tone}`}>
                                <Icon className="size-5" />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-950">{example.title}</h2>
                            <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-500">{example.description}</p>
                            <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-900">
                                보기
                                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
