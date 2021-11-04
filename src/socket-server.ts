import { WebSocketServer } from 'ws';
import { getEnvironment } from './environment.js';

// const store = {
//   data: new Map<string, WebSocket[]>(),
// };

export function startSocketServer() {
  const server = new WebSocketServer({
    port: getEnvironment().internal_socket_port,
  });

  server.on('connection', (socket_connection, http_request) => {
    if (!http_request.url) {
      console.log('NO URL');
      socket_connection.send('no_url', (err) => {
        if (err) {
          console.log(err);
        }
        socket_connection.close(1008, 'No valid URL could be parsed');
      });
      return;
    }

    const token = http_request.url.slice(1);

    if (!token) {
      console.log('NO TOKEN');
      socket_connection.send('no_token', (err) => {
        if (err) {
          console.log(err);
        }
        socket_connection.close(1008, 'No token was provided in the request');
      });
      return;
    }
  });

  return server;
}
