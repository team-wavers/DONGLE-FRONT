import posthog from "posthog-js";
import { getPostHogInitOptions } from "@/lib/analytics";

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

if (posthogToken) {
    posthog.init(posthogToken, getPostHogInitOptions());
}
