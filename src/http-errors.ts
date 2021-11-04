interface HttpErrorData extends Record<string, unknown> {
  message: string;
}
export abstract class HttpError extends Error {
  abstract status_code: number;
  abstract error_code: string;
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

  constructor(message: string, errorCode?: string) {
    super(message);

    this.error_code = errorCode || this.error_code;
  }

  get data(): HttpErrorData {
    return {
      message: this.message,
    };
  }
}

export class InternalServerError extends HttpError {
  status_code = 500;
  error_code = 'server';

  constructor(message: string, errorCode?: string) {
    super(message);

    this.error_code = errorCode || this.error_code;
  }

  get data(): HttpErrorData {
    return {
      message: this.message,
    };
  }
}
