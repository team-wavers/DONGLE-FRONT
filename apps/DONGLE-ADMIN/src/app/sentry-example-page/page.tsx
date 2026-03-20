import { notFound } from "next/navigation";
import SentryExamplePageClient from "./SentryExamplePageClient";

export default function SentryExamplePage() {
    if (process.env.SENTRY_ENVIRONMENT === "production") {
        notFound();
    }

    return <SentryExamplePageClient />;
}
