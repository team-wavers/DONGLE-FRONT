export interface SuccessResponse<T> {
  isSuccess: true;
  result: T;
  error?: never;
}

export interface ErrorResponse {
  isSuccess: false;
  result?: never;
  error: {
    message: string;
    detail: string;
    status?: number;
  };
}

export type Response<T> = SuccessResponse<T> | ErrorResponse;
