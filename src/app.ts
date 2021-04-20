import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import passport from 'passport';
import expressSession from 'express-session';
import redis from 'redis';
import connectRedis from 'connect-redis';

import config from '../config/config';
import { components } from './components/components';
import { handleError } from './services/error-handler';
import { logger } from './services/logger';
import { passportInitialize } from './passport';


/** Create Express App */

const app = express();


/** Use Third Party Middleware */

app.use(helmet());
app.use(express.json());


/** Setup REDIS */

const RedisStore = connectRedis(expressSession);

const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379
});

redisClient.on('error', function (err) {
  logger.info('Could not establish a connection with redis.');
  throw err;
});

redisClient.on('connect', function () {
  logger.info('Connected to redis successfully');
});



/** Set up sessions and passport */

app.use(expressSession({
  store: new RedisStore({client: redisClient}),
  secret: config.secrets.cookie,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: false,
    maxAge: 1000 * 60 * 10,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

passportInitialize();


/** Use App Middleware */

app.use(components);


/** Define error handlers */

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.debug('Error caught in handling middleware!');
  handleError(err, res);
});

process.on('unhandledRejection', (err: Error) => {
  throw err;  // throw err to be caught in uncaught exception handler below.
});

process.on('uncaughtException', (err: Error) => {
  logger.debug('Error caught in uncaughtException middleware!');
  handleError(err);
});


/** Export app to be served */

export default app;