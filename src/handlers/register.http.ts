import Joi from 'joi';
import { RequestData, uuid, validate } from '../http-common.js';
import { BadRequestError } from '../http-errors.js';
import { hash as argonHash } from 'argon2';
import { createUserDto, getUsersCollection, UserDto } from '../domain/user.js';

export interface RegisterInputDto {
  username: string;
  password: string;
}

export const RegisterInputDtoSchema = Joi.object<RegisterInputDto>({
  username: Joi.string()
    .required()
    .min(2)
    .max(20)
    .pattern(/^[a-zA-Z0-9\-_]+$/)
    .messages({
      'string.max': 'Your username must be between 2 and 20 characters long',
      'string.min': 'Your username must be between 2 and 20 characters long',
      'string.pattern.base':
        'Your username must consist only of alphanumeric, _ or - characters',
    }),
  password: Joi.string().required().min(8).messages({
    'string.min': 'Your password must be at least 8 characters long',
  }),
});

async function register({
  body,
}: RequestData<RegisterInputDto>): Promise<UserDto> {
  const { username, password } = body;

  const authdb = getUsersCollection();
  const existing_user = await authdb.findOne({ username });

  if (existing_user) {
    throw new BadRequestError(
      'The username you have selected is unavailable',
      []
    );
  }

  const encrypted_password = await argonHash(password);

  const user_properties = {
    user_id: uuid(),
    username,
    password: encrypted_password,
    friends: [],
  };

  const result = await authdb.insertOne(user_properties);

  return createUserDto({
    id: result.insertedId,
    ...user_properties,
  });
}

export const registerHandler = validate(RegisterInputDtoSchema, register);
