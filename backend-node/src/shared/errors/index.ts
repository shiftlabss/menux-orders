export class AppError extends Error {
  public readonly code: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    Error.captureStackTrace(this);
  }
}

export class DomainError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  public readonly details?: any;

  constructor(message: string, details?: any) {
    super(message, 400);
    this.details = details;
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500, false);
  }
}
