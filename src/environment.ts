import { config } from 'dotenv';
import { string } from 'joi';

config();

const environment: Environment = {
  external_socket_host: '',
  external_api_host: '',
  internal_socket_port: 0,
  internal_http_port: 0,
  mongo_host: '',
  mongo_port: 0,
  mongo_db_name: '',
  mongo_username: '',
  mongo_password: '',
};
const environment_loaded = { value: false };

export interface Environment {
  external_api_host: string;
  external_socket_host: string;
  internal_socket_port: number;
  internal_http_port: number;
  mongo_host: string;
  mongo_port: number;
  mongo_db_name: string;
  mongo_username: string;
  mongo_password: string;
}

export interface VariableError {
  name: string;
  error: 'missing' | 'invalid';
  type: string;
  value: unknown;
}

export function formatError(v: VariableError) {
  if (v.error === 'missing') {
    return `Environment variable [${v.name}] of type [${v.type}] is missing`;
  } else if (v.error === 'invalid') {
    return `Environment variable [${v.name}] is invalid, expected [${v.type}] but received [${v.value}]`;
  }
}

export function getStringError(key: string): VariableError | undefined {
  if (process.env[key] === undefined) {
    return {
      name: key,
      error: 'missing',
      type: 'string',
      value: process.env[key],
    };
  }
}

export function getNumberError(key: string): VariableError | undefined {
  if (process.env[key] === undefined) {
    return {
      name: key,
      error: 'missing',
      type: 'string',
      value: process.env[key],
    };
  } else if (isNaN(Number(process.env[key]))) {
    return {
      name: key,
      error: 'invalid',
      type: 'number',
      value: process.env[key],
    };
  }
}

export function getEnvironment() {
  if (environment_loaded.value) {
    return environment;
  }

  environment.external_api_host = process.env.EXTERNAL_API_HOST ?? '';
  environment.external_socket_host = process.env.EXTERNAL_SOCKET_HOST ?? '';
  environment.mongo_host = process.env.MONGO_HOST ?? '';
  environment.mongo_port = Number(process.env.MONGO_PORT) ?? 0;
  environment.internal_socket_port =
    Number(process.env.INTERNAL_SOCKET_PORT) ?? 0;
  environment.internal_http_port = Number(process.env.INTERNAL_HTTP_PORT) ?? 0;
  environment.mongo_db_name = process.env.MONGO_DB_NAME ?? '';
  environment.mongo_username = process.env.MONGO_USERNAME ?? '';
  environment.mongo_password = process.env.MONGO_PASSWORD ?? '';

  const errors = [
    getStringError('EXTERNAL_API_HOST'),
    getStringError('EXTERNAL_SOCKET_HOST'),
    getStringError('MONGO_HOST'),
    getNumberError('MONGO_PORT'),
    getNumberError('INTERNAL_SOCKET_PORT'),
    getNumberError('INTERNAL_HTTP_PORT'),
    getStringError('MONGO_DB_NAME'),
    getStringError('MONGO_USERNAME'),
    getStringError('MONGO_PASSWORD'),
  ].filter((a): a is VariableError => !!a);

  if (errors.length > 0) {
    throw new Error(
      `Environment is not configured correctly\n\n${errors
        .map((a) => `- ${formatError(a)}`)
        .join('\n')}`
    );
  }

  environment_loaded.value = true;

  return environment;
}
