import Joi from 'joi';
import { RequestData, validate } from '../http-common.js';
import { verify as argonVerify } from 'argon2';
import { BadAuthorizationError } from '../http-errors.js';
import {
  createNewSession,
  createSessionDto,
  getSessionsCollection,
  SessionDto,
} from '../domain/session.js';
import { getUsersCollection, UserModel } from '../domain/user.js';

export interface LoginInputDto {
  username: string;
  password: string;
}

export const LoginInputDtoSchema = Joi.object<LoginInputDto>({
  username: Joi.string().required().messages({
    'any.required': 'You must provide a username',
  }),
  password: Joi.string().required().messages({
    'any.required': 'You must provide a password',
  }),
});

export interface LoginOutputDto {
  id: string;
  user_id: string;
  username: string;
}

// This hash is the hashed value of 'password';
const KNOWN_HASH_OF_THE_WORD_PASSWORD =
  '$argon2i$v=19$m=4096,t=3,p=1$XLZf0gz5MyGl6Jy99sBd9Q$xGGQcT0Kn1VPcFztbSCpbDxbogcZSjAQuM6qv126Qes';

async function login({
  body,
}: RequestData<LoginInputDto>): Promise<SessionDto> {
  const { username, password } = body;

  const authdb = getUsersCollection();
  const existing_user = await authdb.findOne<UserModel>({ username });
  const { password: db_password_hash } = existing_user ?? {
    password: KNOWN_HASH_OF_THE_WORD_PASSWORD,
  };

  // Always hash even when we know the user doesnt exist. This should
  // prevent a class of timing attacks where an attacker uses response
  // times to determine whether a user exists or not.
  const is_matching_password = await argonVerify(
    db_password_hash,
    db_password_hash === KNOWN_HASH_OF_THE_WORD_PASSWORD
      ? 'definitely_incorrect'
      : password
  );

  if (!is_matching_password || !existing_user) {
    throw new BadAuthorizationError('Invalid username or password');
  }

  const session_properties = createNewSession(existing_user.user_id);
  const sessions = getSessionsCollection();

  const { insertedId } = await sessions.insertOne(session_properties);

  return createSessionDto({
    id: insertedId,
    ...session_properties,
  });
}

export const loginHandler = validate(LoginInputDtoSchema, login);
