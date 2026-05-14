type ZodIssueLike = {
    path: PropertyKey[];
    message: string;
};

type ZodErrorLike = {
    issues?: ZodIssueLike[];
};

export function getZodFieldErrors<TField extends string>(
    error: ZodErrorLike | null | undefined
): Partial<Record<TField, string>> {
    const fieldErrors: Partial<Record<TField, string>> = {};

    error?.issues?.forEach((issue) => {
        const fieldName = issue.path[0];

        if (typeof fieldName === "string" && !(fieldName in fieldErrors)) {
            fieldErrors[fieldName as TField] = issue.message;
        }
    });

    return fieldErrors;
}
