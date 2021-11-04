import { getEnvironment } from './environment.js';
import { startSocketServer } from './socket-server.js';
import { startHttpServer } from './http-server.js';
import { createRoute } from './http-router.js';
import { registerHandler } from './handlers/register.http.js';
import { infoHandler } from './handlers/info.http.js';
import { connectMongoClient } from './mongodb.js';

(async () => {
  try {
    getEnvironment();
  } catch (exception) {
    console.error(exception instanceof Error ? exception.message : exception);
    process.exit(1);
  }

  createRoute('GET', '/info', infoHandler);
  createRoute('POST', '/register', registerHandler);

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
