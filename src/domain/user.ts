import { ObjectId } from 'bson';
import { Collection } from 'mongodb';
import { getDatabase } from '../mongodb.js';

export interface UserFriend {
  user_id: string;
  username: string;
}

export interface UserProperties {
  user_id: string;
  username: string;
  password: string;
  friends: UserFriend[];
}

export interface UserEntity extends UserProperties {
  _id: ObjectId;
}

export interface UserModel extends UserProperties {
  id: ObjectId;
}

export interface UserDto {
  id: string;
  user_id: string;
  username: string;
  friends: UserFriend[];
  created_at: number;
}

export function createUserDto(user: UserModel): UserDto {
  return {
    id: user.id.toJSON(),
    username: user.username,
    user_id: user.user_id,
    friends: user.friends,
    created_at: user.id.getTimestamp().getTime(),
  };
}

export function createUserModel(entity: UserEntity): UserModel {
  return {
    id: entity._id,
    ...entity,
  };
}

export function getUsersCollection(): Collection<UserEntity> {
  return getDatabase().collection('users');
}
