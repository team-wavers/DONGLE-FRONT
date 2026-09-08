import * as Sentry from "@sentry/nextjs";
import { getPostHogInitOptions } from "@/lib/analytics";
import { isLocalBrowserRuntime, isSentryDisabledByEnv } from "./sentry.shared";

const sentryDsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;
const sentryEnvironment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV;
const isSentryDisabled = isSentryDisabledByEnv() || isLocalBrowserRuntime();
const isSentryEnabled = Boolean(sentryDsn) && !isSentryDisabled;

Sentry.init({
  dsn: sentryDsn,
  enabled: isSentryEnabled,
  sendDefaultPii: false,
  environment: sentryEnvironment,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  tracesSampleRate: isSentryDisabled ? 0 : 0.1,
  replaysSessionSampleRate: isSentryDisabled ? 0 : 0.1,
  replaysOnErrorSampleRate: isSentryDisabled ? 0 : 1.0,
});

function runOnIdle(callback: () => void) {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(callback);
    return;
  }

  setTimeout(callback, 1000);
}

// Replay는 첫 상호작용을 막지 않도록, 초기 Sentry.init 이후 idle 시점에 지연 등록한다.
if (isSentryEnabled) {
  runOnIdle(() => {
    import("@sentry/nextjs")
      .then(({ replayIntegration }) => {
        Sentry.addIntegration(
          replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          })
        );
      })
      .catch((error) => {
        console.error("Sentry Replay 초기화 실패", error);
      });
  });
}

runOnIdle(() => {
  try {
    const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

    if (!posthogToken) {
      return;
    }

    import("posthog-js")
      .then(({ default: posthog }) => {
        posthog.init(posthogToken, getPostHogInitOptions());
      })
      .catch((error) => {
        console.error("PostHog 초기화 실패", error);
      });
  } catch (error) {
    console.error("PostHog 초기화 실패", error);
  }
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
