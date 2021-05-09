import { Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '../enums/HTTP_STATUS';
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
      res.status(BAD_REQUEST.CODE).json({ message: (error as any).message });
    }

    logger.warn(error);

    return;
  }


  if (res && !res.headersSent) {
    res
      .status(INTERNAL_SERVER_ERROR.CODE)
      .send(INTERNAL_SERVER_ERROR.MESSAGE);
  }


  /** Wait 1 second before exiting to ensure logs flush to files */
  logger.on('finish', () => setTimeout(() => process.exit(1), 1000));

  logger.info('Exiting Server...');
  logger.error(error);
  logger.end();
};