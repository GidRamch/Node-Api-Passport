import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { HTTP_STATUS } from '../enums/HTTP_STATUS';
import { AppError } from '../models/AppError';


/**
 * Middleware to handle input validation for any routes - used after route specific rules are added
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) { return next(); }

  const allErrors: { [x: string]: string[]; }= {};

  errors.array().forEach(err => allErrors[err.param] ? allErrors[err.param].push(err.msg) : allErrors[err.param] = [err.msg]);

  throw new AppError(`Request Body Validation Failed for route: ${req.path}. Errors: ${JSON.stringify(allErrors)}`, allErrors, HTTP_STATUS.BAD_REQUEST.CODE);
};