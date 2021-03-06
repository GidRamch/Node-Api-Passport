import { NextFunction, Request, Response } from 'express';
import { UNAUTHORIZED } from '../enums/HTTP_STATUS';
import { AppError } from '../models/AppError';


export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) { return next(); }
  throw new AppError(
    `Unauthenticated user tried to reach auth protected route. ${req.path}`,
    UNAUTHORIZED.MESSAGE,
    UNAUTHORIZED.CODE,
  );
};
