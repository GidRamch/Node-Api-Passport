import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { components } from './components/components';
import { handleError } from './services/error-handler';
import { logger } from './services/logger';


const app = express();    // Create express app


/** Use Third Party Middleware */

app.use(helmet());
app.use(express.json());


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


export default app;   // export app to be served