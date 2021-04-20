import { NextFunction, Request, Response } from 'express';
import { AppError } from '../models/AppError';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    next();
  } else {
    throw new AppError('Unauthenticated user tried to reach auth protected route.', 'Unauthorized!', 401);
  }
};
