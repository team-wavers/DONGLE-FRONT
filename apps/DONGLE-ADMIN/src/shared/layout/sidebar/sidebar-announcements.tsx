import { Sparkles } from "lucide-react";
import { SIDEBAR_ANNOUNCEMENTS } from "./sidebar-announcements.data";

export default function SidebarAnnouncements() {
    if (SIDEBAR_ANNOUNCEMENTS.length === 0) return null;

    return (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                새 소식
            </div>
            <ul className="mt-2 space-y-1.5">
                {SIDEBAR_ANNOUNCEMENTS.slice(0, 3).map((item) => (
                    <li key={item.id} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                        <span className="min-w-0 flex-1 text-xs leading-snug text-zinc-700">{item.title}</span>
                        <span className="shrink-0 text-[10px] text-zinc-400">{item.date}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
