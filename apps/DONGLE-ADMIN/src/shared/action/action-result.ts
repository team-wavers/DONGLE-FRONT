export type ActionResult<TField extends string = string, TData = unknown> =
    | {
          ok: true;
          data?: TData;
          redirectTo?: string;
          message?: string;
      }
      | {
          ok: false;
          fieldErrors?: Partial<Record<TField, string>>;
          formError?: string;
          sessionExpired?: boolean;
          errorType?: string;
          retryable?: boolean;
          retryHint?: string;
      };

export function actionSuccess<TData>(options: {
    data?: TData;
    redirectTo?: string;
    message?: string;
} = {}): ActionResult<string, TData> {
    return {
        ok: true,
        ...options,
    };
}

export function actionFailure<TField extends string>(options: {
    fieldErrors?: Partial<Record<TField, string>>;
    formError?: string;
    sessionExpired?: boolean;
    errorType?: string;
    retryable?: boolean;
    retryHint?: string;
}): Extract<ActionResult<TField>, { ok: false }> {
    return {
        ok: false,
        ...options,
    };
}
