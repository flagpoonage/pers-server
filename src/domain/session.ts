import { ObjectId } from 'bson';
import { Collection } from 'mongodb';
import { uuid } from '../http-common.js';
import { getDatabase } from '../mongodb.js';

export interface SessionProperties {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry: Date;
}

export interface SessionEntity extends SessionProperties {
  _id: ObjectId;
}

export interface SessionModel extends SessionProperties {
  id: ObjectId;
}

export interface SessionDto {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry: number;
  created_at: number;
}

export function createSessionModel(session: SessionEntity): SessionModel {
  return {
    ...session,
    id: session._id,
  };
}

export function createSessionDto(session: SessionModel): SessionDto {
  return {
    id: session.id.toJSON(),
    user_id: session.user_id,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expiry: session.expiry.getTime(),
    created_at: session.id.getTimestamp().getTime(),
  };
}

export function createNewSession(user_id: string): SessionProperties {
  return {
    user_id,
    access_token: uuid(),
    refresh_token: uuid(),
    expiry: createExpiryUsingHoursFromNow(24),
  };
}

export function createExpiryUsingHoursFromNow(hours: number): Date {
  return new Date(new Date().getTime() + 1000 * 60 * 60 * hours);
}

export function getSessionsCollection(): Collection<SessionEntity> {
  return getDatabase().collection('sessions');
}
