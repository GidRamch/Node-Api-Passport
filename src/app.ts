import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { components } from './components/components';
import { handleError } from './services/error-handler';
import { logger } from './services/logger';
import { passportInitialize } from './services/passport';


/** Create Express App */

const app = express();    


/** Use Third Party Middleware */

app.use(helmet());
app.use(express.json());

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