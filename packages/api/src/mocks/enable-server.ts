import { isMswEnabled } from "./is-msw-enabled";

let didStart = false;
let startPromise: Promise<void> | null = null;

export async function enableServerMocking(): Promise<void> {
    if (!isMswEnabled()) {
        return;
    }

    if (didStart) {
        return;
    }

    if (startPromise) {
        return startPromise;
    }

    startPromise = (async () => {
        const { server } = await import("./node");
        server.listen({ onUnhandledRequest: "bypass" });
        didStart = true;
        console.info("[MSW] server listening (NEXT_PUBLIC_USE_MSW=1)");
    })();

    return startPromise;
}
