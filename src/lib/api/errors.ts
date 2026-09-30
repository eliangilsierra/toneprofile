import type { ErrorCode, Problem } from "./types";

/** Error codes the client can show: backend codes plus client-side transport failures. */
export type ClientErrorCode = ErrorCode | "network" | "unknown";

export class ApiError extends Error {
  readonly code: ClientErrorCode;
  readonly status: number;
  readonly retryable: boolean;
  readonly hint?: string;
  readonly problem?: Problem;

  constructor(init: {
    code: ClientErrorCode;
    status: number;
    retryable: boolean;
    hint?: string;
    problem?: Problem;
    message?: string;
  }) {
    super(init.message ?? init.code);
    this.name = "ApiError";
    this.code = init.code;
    this.status = init.status;
    this.retryable = init.retryable;
    this.hint = init.hint;
    this.problem = init.problem;
  }

  static fromProblem(problem: Problem): ApiError {
    return new ApiError({
      code: problem.code,
      status: problem.status,
      retryable: problem.retryable,
      hint: problem.hint,
      problem,
      message: problem.detail ?? problem.title,
    });
  }
}

export function isProblem(value: unknown): value is Problem {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "status" in value &&
    typeof (value as { code: unknown }).code === "string"
  );
}

/** Normalises anything thrown by fetch/openapi-fetch into an ApiError. */
export function toApiError(error: unknown, status = 0): ApiError {
  if (error instanceof ApiError) return error;
  if (isProblem(error)) return ApiError.fromProblem(error);
  if (error instanceof TypeError) {
    // fetch() rejects with TypeError on network failure.
    return new ApiError({ code: "network", status: 0, retryable: true });
  }
  return new ApiError({ code: "unknown", status, retryable: status >= 500 || status === 0 });
}
