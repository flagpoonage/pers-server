import { ParsedQs } from 'qs';
import { v4 as uuid } from 'uuid';
import { RequestHandler } from './http-router.js';
import { BadRequestError } from './http-errors.js';
import Joi from 'joi';

export { uuid };

export interface AnySuccessData extends Record<string, unknown> {
  message: string;
}
export interface SuccessMessage<T = AnySuccessData> {
  type: 'success';
  data: T;
}

export interface RequestData<Body = unknown> {
  querystring: ParsedQs;
  parameters: Record<string, string>;
  body: Body;
}

export function validate<BODY = unknown, RESPONSE = unknown>(
  schema: Joi.Schema,
  handler: RequestHandler<BODY, RESPONSE>
): RequestHandler<BODY, RESPONSE> {
  return (data, req, res) => {
    const valid = schema.validate(data.body, { abortEarly: false });

    if (valid.error) {
      throw new BadRequestError(
        'Unable to register your account',
        valid.error.details.map((a) => a.message)
      );
    }

    return handler(data, req, res);
  };
}
