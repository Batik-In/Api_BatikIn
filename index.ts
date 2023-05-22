import express from 'express';
import path from 'path';
import cors from 'cors';
import http from 'http';
import * as dotenv from 'dotenv';
//import router from './routes';


dotenv.config();
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;
const app = express();

let server = http.createServer(app);

//app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../public')));
//app.use(router);

const onListening = () => {
  console.log(`[STARTING] ${env} application on port ${port}`)
};

const onError = (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  /* handle specific listen errors with friendly messages */
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
};

server.listen(port, () => {
    console.log(`SUCCESS init server ..`);
});
server.on('error', onError);
server.on('listening', onListening);

export default app;

