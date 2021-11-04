import { getEnvironment } from '../environment.js';

export interface InfoOutputDto {
  socket_host: string;
  api_host: string;
}

async function info(): Promise<InfoOutputDto> {
  return {
    socket_host: getEnvironment().external_socket_host,
    api_host: getEnvironment().external_api_host,
  };
}

export const infoHandler = info;
