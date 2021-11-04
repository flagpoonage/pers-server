import Joi from 'joi';
import { RequestData, uuid, validate } from '../http-common.js';
import { getUsersCollection } from '../mongodb.js';
import { verify as argonVerify } from 'argon2';
import { BadAuthorizationError } from '../http-errors.js';

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
const KNOWN_HASH =
  '$argon2i$v=19$m=4096,t=3,p=1$XLZf0gz5MyGl6Jy99sBd9Q$xGGQcT0Kn1VPcFztbSCpbDxbogcZSjAQuM6qv126Qes';

async function login({
  body,
}: RequestData<LoginInputDto>): Promise<LoginOutputDto> {
  const { username, password } = body.data.login.user;

  const authdb = getUsersCollection();
  const existing_user = await authdb.findOne({ username });
  const { password: db_password_hash } = existing_user ?? {
    password: KNOWN_HASH,
  };
  // Why bother hashing at all when you know the user doesnt exist?
  // By always attempting to hash verify a password, you make sure that attackers cannot
  // ascertain existing users by returning an error early for a missing DB user.
  const isMatchingPassword = await argonVerify(
    db_password_hash,
    db_password_hash === KNOWN_HASH ? 'definitely_incorrect' : password
  );
  if (!isMatchingPassword || !existing_user) {
    throw new BadAuthorizationError('Invalid username or password');
  }
  const session = {
    access_token: uuid(),
    refresh_token: uuid(),
  };
  const session_entity = new SessionEntity(session);
  const sessions = getRepository(SessionEntity);
  session_entity.user = existing_user;
  sessions.save(session_entity);
  return {
    message: 'Logged in successfully',
    username,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expiry: parseISO(session.created_at).getTime() + session.valid_for,
  };
}

export const registerHandler = validate(LoginInputDtoSchema, register);
