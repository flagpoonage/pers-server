import { Db, MongoClient } from 'mongodb';
import { getEnvironment } from './environment.js';

const environment = getEnvironment();

// TODO: No connection loss or error handling
const client = new MongoClient(
  `mongodb://${environment.mongo_username}:${environment.mongo_password}@${environment.mongo_host}:${environment.mongo_port}`
);

export async function connectMongoClient(): Promise<MongoClient> {
  // Connect the client to the server
  await client.connect();
  // Establish and verify connection
  await client.db('pers').command({ ping: 1 });

  client.on('close', () => {
    // Reconnect, this is not very good at all
    client.connect();
  });

  return client;
}

export function getMongoClient(): MongoClient {
  return client;
}

export function getDatabase(): Db {
  return getMongoClient().db(environment.mongo_db_name);
}
