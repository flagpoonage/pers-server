import http, { IncomingMessage, ServerResponse } from 'http';
import { getEnvironment } from './environment.js';
import { HttpError } from './http-errors.js';
import { route } from './http-router.js';

async function readBody(request: IncomingMessage): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    let body = Buffer.from('', 'utf-8');

    request
      .on('data', (chunk) => {
        body = Buffer.concat([body, chunk]);
      })
      .on('end', () => {
        if (body.length > 0) {
          resolve(body.toString('utf-8'));
        } else {
          resolve(undefined);
        }
      })
      .on('error', reject);
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  console.log('Incoming', req.url);

  try {
    console.log(req.url);
    const body = await readBody(req);
    const response = await route(req, res, body ? JSON.parse(body) : undefined);

    if (response) {
      res.write(
        JSON.stringify({
          type: 'success',
          data: response,
        })
      );
    }
  } catch (exception) {
    console.error(exception);
    if (exception instanceof HttpError) {
      res.statusCode = exception.status_code;
      res.write(
        JSON.stringify({
          type: exception.error_code,
          data: exception.data,
        })
      );
    } else {
      res.statusCode = 500;
      res.write(
        JSON.stringify({
          type: 'error',
          data: {
            message:
              exception instanceof Error ? exception.message : 'Unknown error',
          },
        })
      );
    }
  } finally {
    res.end();
  }
}

export function startHttpServer() {
  const server = http.createServer(handleRequest);
  server.listen(getEnvironment().internal_http_port);
  return server;
}
