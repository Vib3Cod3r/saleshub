export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly validationErrors?: string[];

  constructor(
    message: string,
    field?: string,
    validationErrors?: string[]
  ) {
    super(message, 422, true, 'VALIDATION_ERROR');
    this.field = field;
    this.validationErrors = validationErrors;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, true, 'BAD_REQUEST');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, true, 'DATABASE_ERROR');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable') {
    super(message, 503, true, 'SERVICE_UNAVAILABLE');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT');
  }
}

// Error factory for creating typed errors
export class ErrorFactory {
  static validation(message: string, field?: string, errors?: string[]): ValidationError {
    return new ValidationError(message, field, errors);
  }

  static notFound(resource: string): NotFoundError {
    return new NotFoundError(resource);
  }

  static unauthorized(message?: string): UnauthorizedError {
    return new UnauthorizedError(message);
  }

  static forbidden(message?: string): ForbiddenError {
    return new ForbiddenError(message);
  }

  static conflict(message: string): ConflictError {
    return new ConflictError(message);
  }

  static badRequest(message: string): BadRequestError {
    return new BadRequestError(message);
  }

  static database(message?: string): DatabaseError {
    return new DatabaseError(message);
  }

  static serviceUnavailable(message?: string): ServiceUnavailableError {
    return new ServiceUnavailableError(message);
  }

  static rateLimit(message?: string): RateLimitError {
    return new RateLimitError(message);
  }
}
