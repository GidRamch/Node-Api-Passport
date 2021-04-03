import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../models/AppError';


export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) { return next(); }

  const allErrors: { [x: string]: string[]; }= {};

  errors.array().forEach(err => allErrors[err.param] ? allErrors[err.param].push(err.msg) : allErrors[err.param] = [err.msg]);

  throw new AppError('Request Body Validation Failed', allErrors, 400);
};