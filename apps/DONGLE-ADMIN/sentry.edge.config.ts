import * as Sentry from "@sentry/nextjs";
import { isSentryDisabledByEnv } from "./sentry.shared";

const sentryDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentryEnvironment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV;
const isSentryDisabled = isSentryDisabledByEnv();

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn) && !isSentryDisabled,
  sendDefaultPii: true,
  environment: sentryEnvironment,
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: isSentryDisabled ? 0 : 0.1,
});
