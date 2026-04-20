import * as Sentry from "@sentry/nextjs";

const sentryDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentryEnvironment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV;
const isLocalRuntime = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn) && !isLocalRuntime,
  sendDefaultPii: true,
  environment: sentryEnvironment,
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: isLocalRuntime ? 0 : 0.1,
});
