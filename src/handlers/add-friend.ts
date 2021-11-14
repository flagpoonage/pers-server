import Joi from 'joi';
import { authorized, RequestData, validate } from '../http-common.js';
import { BadRequestError } from '../http-errors.js';
import { getUsersCollection, UserFriend, UserModel } from '../domain/user.js';
import { IncomingMessageAuthorized } from '../http-router.js';

export interface AddFriendInputDto {
  username: string;
}

export const AddFriendInputDtoSchema = Joi.object<AddFriendInputDto>({
  username: Joi.string().required().messages({
    'any.required': 'You must provide a username',
  }),
});

export interface AddFriendOutputDto {
  friend_data: UserFriend;
  is_reciprocal: boolean;
}

async function addFriend(
  { body }: RequestData<AddFriendInputDto>,
  req: IncomingMessageAuthorized
): Promise<AddFriendOutputDto> {
  const { username } = body;
  const { user: self } = req.authorization;

  const usersdb = getUsersCollection();
  const friend_user = await usersdb.findOne<UserModel>({ username });

  if (!friend_user) {
    throw new BadRequestError('The user could not be found on the server', [
      `Missing user with username: ${body.username}`,
    ]);
  }

  const friend_data = {
    user_id: friend_user.user_id,
    username,
  };

  const is_reciprocal = friend_user.friends?.some(
    (a) => a.user_id === self.user_id
  );

  const friends = self.friends.filter((a) => a.user_id !== friend_user.user_id);

  friends.push(friend_data);

  await usersdb.updateOne({ _id: self.id }, { $set: { friends } });

  return {
    friend_data,
    is_reciprocal,
  };
}

export const addFriendHandler = authorized(
  validate(AddFriendInputDtoSchema, addFriend)
);
