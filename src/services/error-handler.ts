import { Response } from 'express';
import { AppError } from '../models/AppError';
import { logger } from './logger';


/**
 * Handles all caught errors
 * @param error Error to be handled - may be an instance of AppError - for which handling is different
 * @param res 
 */
export const handleError = (error: Error, res?: Response): void => {

  if ((error instanceof AppError) && error.isTrusted) {
    logger.warn(error);

    if (res && !res.headersSent) {
      res.status(error.httpStatusCode).json(error.httpData);
    }

    return;
  }


  if ((error instanceof SyntaxError && (error as any).status === 400 && 'body' in error)) {

    if (res && !res.headersSent) {
      console.log((error as any).message);
      res.status(400).json({ message: (error as any).message });
    }

    logger.warn(error);

    return;
  }


  if (res && !res.headersSent) {
    res.status(500).send('There was an internal server error');
  }


  /** Wait 1 second before exiting to ensure logs flush to files */
  logger.on('finish', () => setTimeout(() => process.exit(1), 1000));

  logger.info('Exiting Server...');
  logger.error(error);
  logger.end();
};