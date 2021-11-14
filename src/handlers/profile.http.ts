import { createUserDto, UserDto } from '../domain/user.js';
import { authorized, RequestData } from '../http-common.js';
import { IncomingMessageAuthorized } from '../http-router.js';

export interface InfoOutputDto {
  socket_host: string;
  api_host: string;
}

async function profile(
  _: RequestData<unknown>,
  req: IncomingMessageAuthorized
  // res: ServerResponse
): Promise<UserDto> {
  return createUserDto(req.authorization.user);
}

export const profileHandler = authorized(profile);
