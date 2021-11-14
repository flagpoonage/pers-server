interface HttpErrorData extends Record<string, unknown> {
  message: string;
  details: string[];
}
export abstract class HttpError extends Error {
  abstract status_code: number;
  abstract error_code: string;
  abstract details: string[];
  abstract get data(): HttpErrorData;
}

export class BadRequestError extends HttpError {
  status_code = 400;
  error_code = 'bad_request';
  details: string[];

  constructor(message: string, details: string[], errorCode?: string) {
    super(message);

    this.error_code = errorCode || this.error_code;
    this.details = details;
  }

  get data(): HttpErrorData {
    return {
      message: this.message,
      details: this.details,
    };
  }
}

export class BadAuthorizationError extends HttpError {
  status_code = 401;
  error_code = 'bad_authorization';
  details = [];

  constructor(message: string, errorCode?: string) {
    super(message);

    this.error_code = errorCode || this.error_code;
  }

  get data(): HttpErrorData {
    return {
      message: this.message,
      details: this.details,
    };
  }
}

export class InternalServerError extends HttpError {
  status_code = 500;
  error_code = 'server';
  details: string[];

  constructor(message: string, details?: string[], errorCode?: string) {
    super(message);

    this.error_code = errorCode || this.error_code;
    this.details = details ?? ([] as string[]);
  }

  get data(): HttpErrorData {
    return {
      message: this.message,
      details: this.details,
    };
  }
}
