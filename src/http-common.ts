import { ParsedQs } from 'qs';
import { v4 as uuid } from 'uuid';
import {
  AuthorizedRequestHandler,
  IncomingMessageAuthorized,
  RequestHandler,
} from './http-router.js';
import {
  BadAuthorizationError,
  BadRequestError,
  HttpError,
  InternalServerError,
} from './http-errors.js';
import Joi from 'joi';
import { createSessionModel, getSessionsCollection } from './domain/session.js';
import { IncomingMessage, ServerResponse } from 'http';
import { createUserModel, getUsersCollection } from './domain/user.js';

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

type AnyRequestHandler<B = unknown, R = unknown> =
  | RequestHandler<B, R>
  | AuthorizedRequestHandler<B, R>;

export function validate<BODY = unknown, RESPONSE = unknown>(
  schema: Joi.Schema,
  handler: AnyRequestHandler<BODY, RESPONSE>
): AnyRequestHandler<BODY, RESPONSE> {
  return (
    data: RequestData<BODY>,
    req: IncomingMessage | IncomingMessageAuthorized,
    res: ServerResponse
  ) => {
    const valid = schema.validate(data.body, { abortEarly: false });

    if (valid.error) {
      throw new BadRequestError(
        'Unable to register your account',
        valid.error.details.map((a) => a.message)
      );
    }

    if ('authorization' in req) {
      return (handler as AuthorizedRequestHandler<BODY, RESPONSE>)(
        data,
        req,
        res
      );
    } else {
      return (handler as RequestHandler<BODY, RESPONSE>)(data, req, res);
    }
  };
}

export function authorized<BODY = unknown, RESPONSE = unknown>(
  handler: AuthorizedRequestHandler<BODY, RESPONSE>
): RequestHandler<BODY, RESPONSE> {
  return async (data, req, res) => {
    const authorization = req.headers['authorization'];
    const [_, access_token] = (authorization ?? '').split('Bearer ');

    const authError = () =>
      new BadAuthorizationError(
        'You are not authorized to perform this request'
      );

    if (!access_token) {
      throw authError();
    }

    const rq = req as IncomingMessageAuthorized;

    try {
      const session = await getSessionsCollection().findOne({
        access_token,
      });

      if (!session) {
        throw authError();
      }

      const user = await getUsersCollection().findOne({
        user_id: session.user_id,
      });

      if (!user) {
        throw new InternalServerError('Your user account was not found', [
          `Missing user account for ${session.user_id}`,
        ]);
      }

      rq.authorization = {
        user: createUserModel(user),
        session: createSessionModel(session),
      };
    } catch (exception) {
      if (exception instanceof HttpError) {
        throw exception;
      }

      console.log('Error authorizing request sessions', exception);
      throw authError();
    }

    return handler(data, rq, res);
  };
}
