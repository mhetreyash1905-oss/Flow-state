export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  public errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 422);
    this.errors = errors;
  }
}

export function handleError(error: unknown): { message: string; statusCode: number; errors?: Record<string, string[]> } {
  if (error instanceof ValidationError) {
    return { message: error.message, statusCode: error.statusCode, errors: error.errors };
  }
  if (error instanceof AppError) {
    return { message: error.message, statusCode: error.statusCode };
  }
  console.error('Unexpected error:', error);
  return { message: 'Internal server error', statusCode: 500 };
}
