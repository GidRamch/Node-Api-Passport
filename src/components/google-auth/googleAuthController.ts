import express, { NextFunction, Request, Response } from 'express';
import { authenticate } from 'passport';
import { validate } from '../../middleware/validator';
import { logger } from '../../services/logger';

const router = express.Router();

const baseRoute = '/auth/google';


router.get(
  `${baseRoute}/login`,
  authenticate('google', {
    scope: ['profile', 'email'],
  }),
  // async (req: Request, res: Response, next: NextFunction) => {

  //   logger.info(`POST /${baseRoute}/login`);

  //   try {
  //     const EMAIL = req.body.email;
  //     const PASSWORD = req.body.password;



  //   } catch (err) {
  //     next(err);
  //   }
  // }
);


router.get('/auth/google/redirect', authenticate('google'));


export default router;