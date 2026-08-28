import { notFound } from "next/navigation";
import SentryExamplePageClient from "./SentryExamplePageClient";

export default function SentryExamplePage() {
    // NODE_ENV는 next build가 항상 설정하므로, 운영 배포 시 SENTRY_ENVIRONMENT 누락과 무관하게 막힌다.
    if (process.env.NODE_ENV === "production" || process.env.SENTRY_ENVIRONMENT === "production") {
        notFound();
    }

    return <SentryExamplePageClient />;
}
