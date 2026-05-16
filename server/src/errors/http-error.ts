export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function unauthorized(message = "Unauthorized") {
  return new HttpError(401, message);
}

export function forbidden(message = "Forbidden") {
  return new HttpError(403, message);
}

export function badRequest(message: string, details?: unknown) {
  return new HttpError(400, message, details);
}

export function notFound(message = "Not Found") {
  return new HttpError(404, message);
}

export function conflict(message = "Conflict") {
  return new HttpError(409, message);
}

export function tooManyRequests(message = "Too Many Requests") {
  return new HttpError(429, message);
}
