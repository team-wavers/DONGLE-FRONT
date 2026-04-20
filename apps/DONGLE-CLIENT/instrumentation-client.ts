import * as Sentry from "@sentry/nextjs";
import { isLocalBrowserRuntime, isSentryDisabledByEnv } from "./sentry.shared";

const sentryDsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;
const sentryEnvironment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV;
const isSentryDisabled = isSentryDisabledByEnv() || isLocalBrowserRuntime();

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn) && !isSentryDisabled,
  sendDefaultPii: true,
  environment: sentryEnvironment,
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: isSentryDisabled ? 0 : 0.1,
  replaysSessionSampleRate: isSentryDisabled ? 0 : 0.1,
  replaysOnErrorSampleRate: isSentryDisabled ? 0 : 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
