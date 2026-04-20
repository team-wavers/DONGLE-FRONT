import * as Sentry from "@sentry/nextjs";

const sentryDsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;
const sentryEnvironment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV;
const isLocalBrowser =
  process.env.NODE_ENV === "development" ||
  (typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname));

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn) && !isLocalBrowser,
  sendDefaultPii: true,
  environment: sentryEnvironment,
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: isLocalBrowser ? 0 : 0.1,
  replaysSessionSampleRate: isLocalBrowser ? 0 : 0.1,
  replaysOnErrorSampleRate: isLocalBrowser ? 0 : 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
