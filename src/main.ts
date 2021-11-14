import { getEnvironment } from './environment.js';
import { startSocketServer } from './socket-server.js';
import { startHttpServer } from './http-server.js';
import { createRoute } from './http-router.js';
import { registerHandler } from './handlers/register.http.js';
import { infoHandler } from './handlers/info.http.js';
import { connectMongoClient } from './mongodb.js';
import { loginHandler } from './handlers/login.http.js';
import { profileHandler } from './handlers/profile.http.js';
import { addFriendHandler } from './handlers/add-friend.js';

(async () => {
  try {
    getEnvironment();
  } catch (exception) {
    console.error(exception instanceof Error ? exception.message : exception);
    process.exit(1);
  }

  createRoute('GET', '/info', infoHandler);
  createRoute('POST', '/register', registerHandler);
  createRoute('POST', '/login', loginHandler);
  createRoute('POST', '/add-friend', addFriendHandler);
  createRoute('GET', '/profile', profileHandler);

  try {
    await connectMongoClient();
  } catch (exception) {
    console.error(
      `Unable to connect to Mongo:\n\n${
        exception instanceof Error ? exception.message : exception
      }`
    );
    process.exit();
  }

  startSocketServer();
  startHttpServer();
})();
